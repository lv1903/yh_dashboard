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
    ["yh_unemployment", "unemployment_0-6m", [], ["value", "data", "quarterly_data", "2014Q4", "val_0-6m"]],
    ["yh_unemployment", "unemployment_6-12m", [], ["value", "data", "quarterly_data", "2014Q4", "val_6-12m"]],
    ["yh_unemployment", "unemployment_over12m", [], ["value", "data", "quarterly_data", "2014Q4", "val_over12m"]],
    ["yh_care", "care", [],["value", "data", "value"]],
    ["yh_deprivation", "deprivation", [],["value", "data", "Rank_of_Local_Concentration"]]

]


function sortNumber(a,b) {
    return a - b;
}

function sortPercent(a, b) {
    return a.percent - b.percent
}

function rankPercent(aObj) {
    //rank the percent values - where there is a tie take the average
    var index = 0;
    while (index < aObj.length) {

        var same = 1
        while (index + same < aObj.length) {
            if (aObj[index].percent == aObj[index + same].percent) {
                same++;
            } else {
                break
            }
        }

        var avgRank = ((index + 1) + (index + same)) / 2;
        for (var jndex = index; jndex < (index + same); jndex++) {
            aObj[jndex].rank = avgRank;
        }
        index += same;
    }
    return aObj
}

function medianPercent(aObj){
    return aObj[Math.round(aObj.length/100 * 50)].percent
}

function quintilePercent(aObj){
    aBuckets = [20, 40, 60, 80];
    aRes = [];
    for(var index in aBuckets){
        aRes.push(aObj[Math.round(aObj.length / 100 * aBuckets[index])].percent);
    }
    return aRes
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
                        var p1eCount = doc.value.data.quarterly_data[Q].val_count
                        oEntities[id].homeless_data[Q].p1e.count = p1eCount;

                        var p1ePercent;

                        if(p1eCount == 0){
                            p1ePercent = 0;
                        } else if(isNaN(p1eCount) == false){
                            p1ePercent = oEntities[id].homeless_data[Q].p1e.count / oEntities[id].population_16to24;
                        } else if(p1eCount == "-") {
                            p1ePercent = "p1eLessThan5";
                        } else {
                            p1ePercent = "NA"
                        }

                        oEntities[id].homeless_data[Q].p1e.percent = p1ePercent;

                    }
                }
            }
        }

        var count = 0
        var count0 = 0
        var countLess = 0
        for(id in oEntities){
            count += 1
            //Change last date here - to do add dynamic calc for most recent quarter
            if (oEntities[id].homeless_data["2015Q1"].p1e.percent == 0){count0 += 1}
            if (oEntities[id].homeless_data["2015Q1"].p1e.percent == "p1eLessThan5"){countLess += 1}

        }

        //calc National data
        for(var indexQ in aQ){
            aX = [];
            var Q = aQ[indexQ];
            var count = 0;
            for(id in oEntities ){
                count += 1;
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
            oNational.homeless_data[Q].p1e.reported_percent = aX.length / count;
        }

        //calc unreported data

        for(id in oEntities){
            var aVals = []
            for(Q in oEntities[id].homeless_data){
                aVals.push(Q + "|" + oEntities[id].homeless_data[Q].p1e.count)
            }
            aVals.sort().reverse();

            var index = countMissing(0, aVals);
            if(index == 0){
                oEntities[id].homeless_data.p1e_missing_count = "up to date"
            } else {
                oEntities[id].homeless_data.p1e_missing_count = index * 3;
            }
            oEntities[id].homeless_data.p1e_last_count = aVals[index].split("|")[1]
        }

        //save missing buckets
        oNational.homeless_data.p1e_missing_count = {};
        oNational.homeless_data.p1e_missing_count.quintiles = [2.9, 5.9, 8.9, 11.9];

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

                    oEntities[id].region = doc.value.region;

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

                    //add default rank
                    oEntities[id].risks_data[name].rank = -1;

                }
            }
        }

        //get array of entity objects with numeric values
        var aObj = []
        for(id in oEntities ){
            if(oEntities[id].risks_data.hasOwnProperty(name)) {
                var val = oEntities[id].risks_data[name].percent;
                var x = Number(val);
                if (isNaN(x) == false) {
                    var obj = {};
                    obj.id = id;
                    obj.percent = x;
                    aObj.push(obj)
                }
            }
        }

        aObj.sort(sortPercent);  //sort array of entity objects
        aObj = rankPercent(aObj);  //rank data (where there are ties take the average

        for(var index in aObj){ //record rank in oEntities
            var id = aObj[index].id;
            oEntities[id].risks_data[name].rank = aObj[index].rank;
        }

        //add National data
        oNational.risks_data[name] = {};
        oNational.risks_data[name].median = medianPercent(aObj);
        oNational.risks_data[name].quintiles = quintilePercent(aObj);


        // move to next risk

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