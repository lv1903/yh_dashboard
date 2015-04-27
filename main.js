var express = require("express");
var jade = require("jade");
var bodyParser = require("body-parser");
var app = express();

app.set("views", __dirname + "/views");
app.set("view engine","jade");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({limit: (5*1024*1000) }));

var cradle = require("cradle");
var connection = new(cradle.Connection)('http://dev1.ubiapps.com', 5984, {
    auth: { username: 'admin', password: 'Monkey15' }
});

var dbP1E = connection.database("yh_p1e");
var dbUnemp = connection.database("yh_unemployment");
var dbEd = connection.database("yh_education");
var dbApr = connection.database("yh_apprenticeship");
var dbDep = connection.database("yh_deprivation");
var dbPre = connection.database("yh_prevention");

var mapStyle = require("./data/styledmap.json");
var oTopo = require("./data/yhTopo.json");
var sQuarter = "2014Q4";
var sType = "percent"

function sortNumber(a,b) {
    return a - b;
}

function getValues(docs){

    var bucket0 = 10; // percentiles
    var bucket1 = 50;
    var bucket2 = 90;

    var obj = {};
    var aX = []
    for (var index = 0; index < docs.length; index++) {
        var val = docs[index]["value"];
        var x = Number(val);
        if(isNaN(x) == false){
            aX.push(x)
        }
        obj[docs[index]["id"]] = val;
    }
    aX.sort(sortNumber)
    var aBucket = []
    aBucket[0] = aX[Math.round(aX.length/100*bucket0)]
    aBucket[1] = aX[Math.round(aX.length/100*bucket1)]
    aBucket[2] = aX[Math.round(aX.length/100*bucket2)]
    obj["buckets"] = aBucket
    return [obj, aBucket]
}


function getP1E_quarter_type(Q, T, callback){
    var valT = "val_" + T
    var opts = {
        startkey: [valT, Q],
        endkey: [valT, Q + ",{}"]
    }

    dbP1E.view('p1e_quarter/p1e_quarter', opts, function (err, docs) {
        if (err) {console.log(err.message)}
        callback(getValues(docs))
    });
}

function countMissing(index, aVals){
    if(index < aVals.length){
        if(isNaN(aVals[index].split("|")[1]) && aVals[index].split("|")[1] != "-"){
            index = countMissing(index + 1, aVals)
        }
    }
    return index
}

function getP1E_reporting(callback){
    dbP1E.view('all_docs/all_docs', function(err, docs){
        var oMissing = {}
        for(var doc_index = 0; doc_index < docs.length; doc_index++){
            var aVals = [];
            for(quarter in docs[doc_index].value.data.quarterly_data){
                aVals.push(quarter + "|" + docs[doc_index].value.data.quarterly_data[quarter].val_count)
            }
            aVals.sort().reverse();
            var missing_count = countMissing(0, aVals);
            oMissing[docs[doc_index].id] = missing_count;
        }
        var aBuckets = [.9, 1.9, 2.9]
        callback([oMissing, aBuckets]);
    })
}


function getUnemployment_quarter_duration(Q, D, callback){

    var valD = "val_" + D
    var opts = {
        startkey:[valD , Q],
        endkey:  [valD, Q + ",{}'"]
    }

    dbUnemp.view('unemployment_quarter/unemployment_quarter', opts, function (err, docs) {
        if (err) {console.log(err.message)};
        callback(getValues(docs))
    });
}

function getEducation_lv3_annual_type(Y, T, callback){
    var valT = "val_" + T
    var opts = {
        startkey:[valT , Y],
        endkey:  [valT, Y + ",{}'"]
    }
    dbEd.view('education_annual/education_annual', opts, function (err, docs) {
        if (err) {console.log(err.message)};
        callback(getValues(docs))
    });
}

function getEducation_AG_annual_type(Y, T, callback){
    var valT = "val_" + T
    var opts = {
        startkey:[valT , Y],
        endkey:  [valT, Y + ",{}'"]
    }
    dbEd.view('education_annual/education_annual', opts, function (err, docs) {
        if (err) {console.log(err.message)};
        callback(getValues(docs))
    });
}

function getApprenticeship_annual_type(Y, T, callback){
    var valT = "val_" + T
    var opts = {
        startkey: [valT, Y],
        endkey: [valT, Y + ",{}"]
    };

    dbApr.view('apprenticeship_annual/apprenticeship_annual', opts, function (err, docs) {
        if (err) {console.log(err.message)}
        //console.log(docs)
        callback(getValues(docs))
    });
}

//getApprenticeship_annual_type("2014", "count", function(data){console.log(data)})


function getDeprivation_type(T, callback){
    var opts = {
        startkey:[T],
        endkey:  [T + ",{}'"]
    };
    dbDep.view('deprivation/deprivation', opts, function (err, docs) {
        if (err) {console.log(err.message)};
        callback(getValues(docs))
    });
}

function getPrevention_annual(Y, callback){

    var opts = {
        startkey: [Y],
        endkey: [Y + ",{}"]
    };

    dbPre.view('prevention_annual/prevention_annual', opts, function (err, docs) {
        if (err) {console.log(err.message)}
        callback(getValues(docs))
    });
}




app.get('/', function(req, res){
    getP1E_quarter_type(sQuarter, sType, function(data){
        res.render('index', {
                            quarter: sQuarter,
                            type: sType,
                            mapStyle: mapStyle,
                            topo: oTopo,
                            p1eData: data
                            }
        );
    })
});

app.get('/P1E/:YYYYQX/:Type', function(req, res){
    var sQuarter = req.params["YYYYQX"];
    var sType = req.params["Type"]
    getP1E_quarter_type(sQuarter, sType, function(data){
      res.json(data);
    })
});

app.get('/P1E_Reporting', function(req, res){
    getP1E_reporting(function(data){
        res.json(data);
    })
});

app.get('/Unemployment/:YYYYQX/:Duration', function(req, res){
    //console.log(req.params);
    var sQuarter = req.params["YYYYQX"];
    var sDuration = req.params["Duration"];
    getUnemployment_quarter_duration(sQuarter, sDuration, function(data){
        res.json(data);
    })
});

app.get('/Education_lv3/:YYYY/:Type', function(req, res){
    //console.log(req.params);
    var sYear = req.params["YYYY"];
    var sType = req.params["Type"];
    getEducation_lv3_annual_type(sYear, sType, function (data) {
        res.json(data);
    })
});

app.get('/Education_AG/:YYYY/:Type', function(req, res){
    //console.log(req.params);
    var sYear = req.params["YYYY"];
    var sType = req.params["Type"];
    getEducation_AG_annual_type(sYear, sType, function (data) {
        res.json(data);
    })
});

app.get('/Apprenticeship/:YYYY/:Type', function(req, res){
    //console.log(req.params);
    var sYear = req.params["YYYY"];
    var sType = req.params["Type"];
    getApprenticeship_annual_type(sYear, sType, function (data) {
        res.json(data);
    })
});

app.get('/Deprivation/:Type', function(req, res){
    var sType = req.params["Type"];
    getDeprivation_type(sType, function (data) {
        res.json(data);
    })
});


app.get('/Prevention/:YYYY', function(req, res){
    //console.log(req.params);
    var sYear = req.params["YYYY"];
    getPrevention_annual(sYear, function (data) {
        res.json(data);
    })
});


app.listen(3003);