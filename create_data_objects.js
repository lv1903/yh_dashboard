var fs = require('fs');

var cradle = require("cradle");
var connection = new(cradle.Connection)('http://dev1.ubiapps.com', 5984, {
    auth: { username: 'admin', password: 'Monkey15' }
});


//dbName, name, aPathCount, aPathPercent
var aRisk = [
    ["yh_education", "education_level3", [],["value", "data", "annual", "2014","val_percent"]],
    ["yh_education", "education_attainment_gap", [],["value", "data", "annual", "2014","val_attainment_gap"]],
    ["yh_apprenticeship", "apprenticeship", ["value", "data", "annual", "2014","val_count"],
        ["value", "data", "annual", "2014","val_percent"]],
    ["yh_truancy", "truancy", [],["value", "data", "value"]],
    ["yh_mentalhealth", "mentalhealth", [], ["value", "data", "Value"]],
    ["yh_drugs", "drugs", [], ["value", "data", "rate"]],
    ["yh_alcohol", "alcohol", [], ["value", "data", "Value"]],
    ["yh_hospital", "hospital", [], ["value", "data", "Value"]],
    ["yh_unemployment", "unemployment_total", [], ["value", "data", "quarterly_data", "2014Q4", "val_total"]],
    ["yh_care", "care", [],["value", "data", "value"]],
    ["yh_deprivation", "deprivation", [],["value", "data", "Rank_of_Local_Concentration"]]

]


function sortNumber(a,b) {
    return a - b;
}

function getMedian(aX){
    return aX[Math.round(aX.length /100 * 50)]
}

function getQuintiles(aX){
    aBuckets = [20, 40, 60, 80];
    aRes = [];
    for(var index in aBuckets){
        aRes.push(aX[Math.round(aX.length / 100 * aBuckets[index])])
    }
    return aRes
}

function countMissing(index, aVals){
    if(index < aVals.length){
        if(isNaN(aVals[index].split("|")[1]) && aVals[index].split("|")[1] != "-"){
            index = countMissing(index + 1, aVals)
        }
    }
    return index
}

function getAllDocs(db, callback){
    db.view('all_docs/all_docs', function (err, docs) {
        if (err) {
            //console.log(err.message);
            callback(err)
        } else {
            callback(err, docs)
        }
    })
}



//add population---------------------------
function getPopulationData(oEntities, oNational, callback){
    console.log("getting population data");
    getAllDocs(connection.database("yh_population"), function(err, docs){
        if(err){
            console.log(err.message)
        } else {
            for(var index in docs){
                if(oEntities.hasOwnProperty(docs[index].id)){
                    oEntities[docs[index].id].population_16to24 = docs[index].value.data["16-24"];
                    oEntities[docs[index].id].population_under16 = docs[index].value.data["under16"];
                    oEntities[docs[index].id].population_over24 = docs[index].value.data["over24"];
                }
            }
        }
        getP1EData(oEntities, oNational, callback)
        //callback(oEntities, oNational)
    })
}

//---homelessness data-----------------------
function getP1EData(oEntities, oNational, callback){
    console.log("getting p1e data");
    getAllDocs(connection.database("yh_p1e"), function(err, docs){
        if(err){
            console.log(err.message)
        } else {
            var aQ = []
            for(var index in docs){

                var doc = docs[index];
                var id = doc.id;

                if(oEntities.hasOwnProperty(doc.id)){

                    for(Q in doc.value.data.quarterly_data){

                        //add quarter for id
                        if(!(oEntities[id].homeless_data.hasOwnProperty(Q))){
                            oEntities[id].homeless_data[Q] = {}
                        }

                        //record Q for calculating national average
                        if(aQ.indexOf(Q) < 0){
                            aQ.push(Q)
                        }

                        oEntities[id].homeless_data[Q].p1e = {};
                        oEntities[id].homeless_data[Q].p1e.count = doc.value.data.quarterly_data[Q].val_count;
                        oEntities[id].homeless_data[Q].p1e.percent = doc.value.data.quarterly_data[Q].val_percent;
                    }
                }
            }
        }

        //calc National data
        for(var indexQ in aQ){
            aX = [];
            var Q = aQ[indexQ];
            for(id in oEntities ){
                var val = oEntities[id].homeless_data[Q].p1e.percent;
                var x = Number(val);
                if(isNaN(x) == false){
                    aX.push(x);
                }
            }
            if(!(oNational.homeless_data.hasOwnProperty(Q))) {
                oNational.homeless_data[Q] = {};
            }
            oNational.homeless_data[Q].p1e = {};

            aX.sort(sortNumber);
            oNational.homeless_data[Q].p1e.median = getMedian(aX);
            oNational.homeless_data[Q].p1e.quintiles = getQuintiles(aX);
            //console.log(oNational.homeless_data[Q].p1e)
        }

        //calc unreported data

        for(id in oEntities){
            var aVals = []
            for(Q in oEntities[id].homeless_data){
                aVals.push(Q + "|" + oEntities[id].homeless_data[Q].p1e.count)
            }
            aVals.sort().reverse();
            //console.log(aVals)
            var missing_count = countMissing(0, aVals);
            if(missing_count == 0){missing_count = "up to date"}
            oEntities[id].homeless_data.p1e_missing_count = missing_count;
        }

        //save missing buckets
        oNational.homeless_data.p1e_missing_count = {};
        oNational.homeless_data.p1e_missing_count.quintiles = [.9, 1.9, 2.9, 3.9];

        getCoreData(oEntities, oNational, callback)

    })


}

//--------------------------------------

function getCoreData(oEntities, oNational, callback){
    console.log("getting core data");
    getAllDocs(connection.database("yh_core"), function(err, docs){
        if(err){
            console.log(err.message)
        } else {
            var aQ = []
            for(var index in docs){

                var doc = docs[index];
                var id = doc.id;

                if(oEntities.hasOwnProperty(doc.id)){

                    for(Q in doc.value.data.quarterly_data){

                        //add quarter for id
                        if(!(oEntities[id].homeless_data.hasOwnProperty(Q))){
                            oEntities[id].homeless_data[Q] = {}
                        }

                        //record Q for calculating national average
                        if(aQ.indexOf(Q) < 0){
                            aQ.push(Q)
                        }


                        oEntities[id].homeless_data[Q].core_priority = {};
                        oEntities[id].homeless_data[Q].core_priority.count = doc.value.data.quarterly_data[Q].stat_owed.count;
                        //core data in couch is count / population count
                        oEntities[id].homeless_data[Q].core_priority.percent = doc.value.data.quarterly_data[Q].stat_owed.percent * 100;

                        oEntities[id].homeless_data[Q].core_non_priority = {};
                        oEntities[id].homeless_data[Q].core_non_priority.count =
                            doc.value.data.quarterly_data[Q].stat_not_owed.count +
                            doc.value.data.quarterly_data[Q].non_stat.count;

                        oEntities[id].homeless_data[Q].core_non_priority.percent =
                            doc.value.data.quarterly_data[Q].stat_not_owed.percent * 100 +
                            doc.value.data.quarterly_data[Q].non_stat.percent * 100;
                    }
                }
            }
        }


        //calc National data for core priority
        for(var indexQ in aQ){
            aX = [];
            var Q = aQ[indexQ];

            for(id in oEntities ){
                if(oEntities[id].homeless_data.hasOwnProperty(Q)) {
                    if(oEntities[id].homeless_data[Q].hasOwnProperty("core_priority")) {
                        var val = oEntities[id].homeless_data[Q].core_priority.percent;
                        var x = Number(val);
                        if (isNaN(x) == false) {
                            aX.push(x);
                        }
                    }
                }
            }

            if(!(oNational.homeless_data.hasOwnProperty(Q))) {
                oNational.homeless_data[Q] = {};
            }
            oNational.homeless_data[Q].core_priority = {};

            aX.sort(sortNumber);
            oNational.homeless_data[Q].core_priority.median = getMedian(aX);
            oNational.homeless_data[Q].core_priority.quintiles = getQuintiles(aX);
        }

        //calc National data for core non priority
        for(var indexQ in aQ){
            aX = [];
            var Q = aQ[indexQ];
            for(id in oEntities ){
                if(oEntities[id].homeless_data.hasOwnProperty(Q)) {
                    if(oEntities[id].homeless_data[Q].hasOwnProperty("core_non_priority")) {
                        var val = oEntities[id].homeless_data[Q].core_non_priority.percent;
                        var x = Number(val);
                        if (isNaN(x) == false) {
                            aX.push(x);
                        }
                    }
                }
            }

            if(!(oNational.homeless_data.hasOwnProperty(Q))) {
                oNational.homeless_data[Q] = {};
            }
            oNational.homeless_data[Q].core_non_priority = {};

            aX.sort(sortNumber);
            oNational.homeless_data[Q].core_non_priority.median = getMedian(aX);
            oNational.homeless_data[Q].core_non_priority.quintiles = getQuintiles(aX);
        }


        //console.log(aRisk)
        getPreventionData(oEntities, oNational, callback)
    })


}

function getPreventionData(oEntities, oNational, callback) {
    console.log("getting prevention data")
    getAllDocs(connection.database("yh_prevention"), function (err, docs) {
        if (err) {
            console.log(err.message)
        } else {
            var aY = []
            for (var index in docs) {

                var doc = docs[index];
                var id = doc.id;

                if (oEntities.hasOwnProperty(doc.id)) {

                    for (Y in doc.value.data.annual) {

                        //add quarter for id
                        if (!(oEntities[id].homeless_data.hasOwnProperty(Y))) {
                            oEntities[id].homeless_data[Y] = {}
                        }

                        //record Q for calculating national average
                        if (aY.indexOf(Y) < 0) {
                            aY.push(Y)
                        }

                        oEntities[id].homeless_data[Y].prevention = {};
                       // in rate per 1000
                        oEntities[id].homeless_data[Y].prevention.percent = doc.value.data.annual[Y] / 10
                    }
                }
            }
        }


        //calc National data for core priority
        for (var indexY in aY) {
            aX = [];
            var Y = aY[indexY];

            for (id in oEntities) {
                if (oEntities[id].homeless_data.hasOwnProperty(Y)) {
                    if (oEntities[id].homeless_data[Y].hasOwnProperty("prevention")) {
                        var val = oEntities[id].homeless_data[Y].prevention.percent;
                        var x = Number(val);
                        if (isNaN(x) == false) {
                            aX.push(x);
                        }
                    }
                }
            }

            if (!(oNational.homeless_data.hasOwnProperty(Y))) {
                oNational.homeless_data[Y] = {};
            }
            oNational.homeless_data[Y].prevention = {};

            aX.sort(sortNumber);
            oNational.homeless_data[Y].prevention.median = getMedian(aX);
            oNational.homeless_data[Y].prevention.quintiles = getQuintiles(aX);
        }

        //callback(oEntities, oNational)
        getRiskData(0, aRisk, oEntities, oNational, callback)
    })

}

//----Risk factor data----------------------------------

function jsonPath(index, aPath, parent_obj){
    if(index < aPath.length - 1){
        var obj = parent_obj[aPath[index]];
        var value = jsonPath(index + 1, aPath, obj)
    } else {
        var value = parent_obj[aPath[index]];
    }
    //console.log(value)
    return value;
}

function getRiskData(riskIndex, aRisk, oEntities, oNational, callback){

    var dbName = aRisk[riskIndex][0];
    var name = aRisk[riskIndex][1]
    var aPathCount = aRisk[riskIndex][2];
    var aPathPercent =  aRisk[riskIndex][3];

    console.log("getting risk data: " + name)

    //console.log(aRisk[riskIndex])

    getAllDocs(connection.database(dbName), function(err, docs){
        if(err){
            console.log(err.message)
        } else {
            //get entity data
            for (var index in docs) {
                var doc = docs[index];
                var id = doc.id;
                if (oEntities.hasOwnProperty(doc.id)) {

                    //??? Not dynamic choice of last quarter
                    oEntities[id].risks_data[name] = {};

                    if(aPathCount.length > 0){
                        oEntities[id].risks_data[name].count =  jsonPath(0, aPathCount, doc)
                    }

                    if(aPathPercent.length > 0){
                        oEntities[id].risks_data[name].percent =  jsonPath(0, aPathPercent, doc)
                    }

                }
            }
        }

        //get national data
        aX = [];

        for(id in oEntities ){
            if(oEntities[id].risks_data.hasOwnProperty(name)) {
                var val = oEntities[id].risks_data[name].percent;
                var x = Number(val);
                if (isNaN(x) == false) {
                    aX.push(x);
                }
            }
        }
        oNational.risks_data[name] = {};
        aX.sort(sortNumber);
        oNational.risks_data[name].median = getMedian(aX);
        oNational.risks_data[name].quintiles = getQuintiles(aX);


        //get risk rank data
        for(id in oEntities){
            if(oEntities[id].risks_data.hasOwnProperty(name)) {
                var val = Number(oEntities[id].risks_data[name].percent);
                var index = aX.indexOf(val);
                if(index > -1){
                    index = index / aX.length;
                }
                oEntities[id].risks_data[name].rank = index;
            }
        }

        if(riskIndex < aRisk.length - 1){
            getRiskData(riskIndex + 1, aRisk, oEntities, oNational, callback)
        } else {
            callback(oEntities, oNational)
        }

    })
}


//---------------------------

module.exports = {

     getDataObjects: function(callback) {

         var oEntities = {};
         var oNational = {};
         //var oRiskRanks = {};

         oNational.homeless_data = {};
         oNational.risks_data = {};

         //get list of LA and create entity object
         var LaListPath = ("./data/LA_list.csv");
         var lines = fs.readFileSync(LaListPath, 'utf8').split('\n');
         var lineCount = lines.length;
         for (index = 0; index < lineCount; index++) {
             if (lines[index].length > 1) {
                 var line = lines[index].split(",");
                 var id = line[0].trim();
                 var name = line[1].trim();
                 //aList.push(.trim())
                 oEntities[id] = {};
                 oEntities[id].id = id;
                 oEntities[id].name = name;

                 oEntities[id].homeless_data = {};
                 oEntities[id].risks_data = {};
             }
         }

         //callback(oEntities, oNational)

         //start chain of data extraction
         getPopulationData(oEntities, oNational, function(oEntities, oNational){
             callback(oEntities, oNational)
         });
     }
}