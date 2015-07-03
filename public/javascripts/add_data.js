
var aDates = [
    /*["2012", "Q1"],*/ ["2012", "Q2"], ["2012", "Q3"], ["2012", "Q4"],
    ["2013", "Q1"], ["2013", "Q2"], ["2013", "Q3"], ["2013", "Q4"],
    ["2014", "Q1"], ["2014", "Q2"], ["2014", "Q3"], ["2014", "Q4"],
    ["2015", "Q1"]
]


function addKey(aKeyValues, aLightnessValues){

    console.log("here")

    var ele = document.getElementById("keyContainer")
    if(ele != null) {
        ele.parentNode.removeChild(ele);
    }

    var r = 10;
    var padding = 2;
    var heightpadding = 3;
    var fontsize = 18;

    var w =  (r * 2 + 2 * padding) + (aKeyValues.length * r);
    var h = 24;

    var ele = document.createElement("div");


    var svg = d3.select(ele)//(".mapCanvas")
        .append("div")
        .classed("svg-container", true)
        .attr("id", "keyContainer")
        .on("click", function(){
            centrePoint.onLegendClick()
        })
        .append("svg")
        .attr("id", "keyCanvas")
        .attr("width", w)
        .attr("height", h)


    svg.append("circle")
        .attr("id", "keyQuestionMark")
        .attr("cx", (aKeyValues.length * r) + r + padding )
        .attr("cy",  r + heightpadding)
        .attr("r", r)
        .attr("fill", "black")


    svg.append("text")
        .text("?")
        .attr("x", (aKeyValues.length * r) + r + padding)
        .attr("y", r + 9)
        .attr("font-size", fontsize + "px")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .attr("fill", "white")


    svg.selectAll("rect")
        .data(aKeyValues)
        .enter()
        .append("rect")
        .attr("y", heightpadding)
        .attr("x", function(d, i){
            return (padding) + (i * r);
        })
        .attr("width", r  - padding)
        .attr("height", h - heightpadding)
        .attr("fill", function(d, i){
            if(aKeyValues[i] == "p1eLessThan5"){
                return "#dcd6da"
            } else {
                return "hsla(10, 90%, " + aLightnessValues[i] + "%, 1)"
            }
        })
        .attr("stroke", "black")

    $$("homelessnessMap")._contentobj.appendChild(ele.firstChild);
}

function addLegendKey(aKeyValues, aLightnessValues, parentNode){

    console.log("here")

    var ele = document.getElementById("legendKeyContainer")
    if(ele != null) {
        ele.parentNode.removeChild(ele);
    }

    var r = 30;
    var padding = 2;
    var heightpadding = 3;
    //var fontsize = 18;

    var w =  (r * 2 + 2 * padding) + (aKeyValues.length * r);
    var h = 48;

    var ele = document.createElement("div");


    var svg = d3.select(ele)//(".mapCanvas")
        .append("div")
        .classed("svg-container", true)
        .attr("id", "legendKeyContainer")
        .append("svg")
        .attr("id", "legendKeyCanvas")
        .attr("width", w)
        .attr("height", h + 5)

    svg.selectAll("rect")
        .data(aKeyValues)
        .enter()
        .append("rect")
        .attr("y", heightpadding)
        .attr("x", function(d, i){
            return (padding) + (i * r);
        })
        .attr("width", r  - padding)
        .attr("height", h - heightpadding)
        .attr("fill", function(d, i){
            if(aKeyValues[i] == "p1eLessThan5"){
                return "#dcd6da"
            } else {
                return "hsla(10, 90%, " + aLightnessValues[i] + "%, 1)"
            }
        })
        .attr("stroke", "black");

    parentNode.$view.appendChild(ele.firstChild);
}


function jsonPath(index, aPath, parent_obj){
    if(index < aPath.length - 1){
        var obj = parent_obj[aPath[index]];
        var value = jsonPath(index + 1, aPath, obj)
    } else {
        var value = parent_obj[aPath[index]];
    }
    return value;
}

var aP1eKey = ["worst 20%", "", "", "", "best 20%", "p1eLessThan5", "no data"]
var aP1eKeyLightness = [30, 40, 50, 60, 90, "p1eLessThan5", 100];

var aStandardKey = ["worst 20%", "", "", "", "best 20%", "no data"]
var aKeyLightness = [30, 40, 50, 60, 90, 100];

var aMissingDataKey = ["12m", " 9m", "6m", "3m", "0m"]
var aMissingLightness = [30, 40, 50, 60, 100]


function selectcolor(n, aBuckets, up){

    if(n == "p1eLessThan5"){
        return "#dcd6da";
    }else if(isNaN(n)){
        return "white";
    }else{
        if(up == true){
            if(n <= aBuckets[0]){lightness = aKeyLightness[4]}
            else if(n > aBuckets[0] && n <= aBuckets[1]){lightness = aKeyLightness[3]}
            else if(n > aBuckets[1] && n <= aBuckets[2]){lightness = aKeyLightness[2]}
            else if(n > aBuckets[2] && n <= aBuckets[3]){lightness = aKeyLightness[1]}
            else if(n > aBuckets[3]){lightness = aKeyLightness[0]}
            else { console.log("error n = " + n)}
        } else {
            if(n >= aBuckets[3]){lightness = aKeyLightness[4]}
            else if(n < aBuckets[3] && n >= aBuckets[2]){lightness = aKeyLightness[3]}
            else if(n < aBuckets[2] && n >= aBuckets[1]){lightness = aKeyLightness[2]}
            else if(n < aBuckets[1] && n >= aBuckets[0]){lightness = aKeyLightness[1]}
            else if(n < aBuckets[0]){lightness = aKeyLightness[0]}
            else { console.log("error n = " + n)}
        }

        return "hsla(10, 90%, "+ lightness +"%, 1)"
    }
}


function addColors(aBuckets, up, aPath, obj){

    map.data.setStyle(function(feature) {
        var id = feature.getProperty('geo_code');
        var n = jsonPath(0, aPath, obj[id]);
        var color = selectcolor(n, aBuckets, up);

        if(id == "E07000167"){
            console.log(aBuckets)
            console.log(id + " n:");console.log(obj[id]); console.log(n); console.log(aPath); console.log(color)
        }
        return {
            fillColor: color,
            fillOpacity: 1,
            strokeWeight: 0.5,
            strokeOpacity: 1,
            strokeColor: "black"
        }
    })
}


function getData(sActive, dateIndex){

  var year = aDates[dateIndex][0];
  var quarter = aDates[dateIndex][1];

  if(sActive === "P1E") {
      aBuckets = oNational.homeless_data[year + quarter].p1e.quintiles;
      var up = true;
      var aPath = ["homeless_data", year + quarter, "p1e", "percent"];
      addColors(aBuckets, up, aPath, oEntities );
      addKey(aP1eKey, aP1eKeyLightness);
      addLegendKey(aP1eKey, aP1eKeyLightness, $$("homelessnessKeyContainer"));
  }

  if (sActive === "P1E_Missing"){
      aBuckets = oNational.homeless_data.p1e_missing_count.quintiles;
      var up = true; //good is low
      var aPath = ["homeless_data", "p1e_missing_count"];
      addColors(aBuckets, up, aPath, oEntities );
      addKey(aMissingDataKey, aMissingLightness);
      addLegendKey(aMissingDataKey, aMissingLightness, $$("missingKeyContainer"));
  }
}

function getRiskFactorData(aSelected){

    var riskOrder = {} // true means low is good high is bad
    riskOrder.alcohol = true;
    riskOrder.apprenticeship = false;
    riskOrder.care = true;
    riskOrder.deprivation = false;
    riskOrder.drugs = true;
    riskOrder.education_attainment_gap = true;
    riskOrder.education_level3 = false;
    riskOrder.hospital = true;
    riskOrder.mentalhealth = true;
    riskOrder.truancy = true;
    riskOrder.unemployment_total = true;
    riskOrder["unemployment_0-6m"] = true;
    riskOrder["unemployment_6-12m"] = true;
    riskOrder.unemployment_over12m = true;

    var oRiskIndex = {};
    for(id in oEntities) {
        oRiskIndex[id] = {};
        oRiskIndex[id].ranks = {};

        var count = 0;
        var sum = 0;
        for (var riskIndex in aSelected) {
            var risk = aSelected[riskIndex];
                if(oEntities[id].risks_data.hasOwnProperty(risk)) {
                    var rank = oEntities[id].risks_data[risk].rank;
                    if (rank > -1) {
                        if (riskOrder[risk] == false) {
                            rank = 1 - rank; //reverse rank
                        }
                        sum += rank;
                        count += 1;
                    }
                    oRiskIndex[id].ranks[risk] = rank;
                }
        }

        if (count > 0) {
            oRiskIndex[id].average = sum / count;
        } else {
            oRiskIndex[id].average = "NA"
        }
    }

    var min = 1;
    var max = 0;

    for(id in oRiskIndex){
        var average = oRiskIndex[id].average;
        if(average != "NA"){
            if(average < min){min = average}
            if(average > max){max = average}
        }
    }
    var aBuckets = [];
    var aN = [0.2, 0.4, 0.6, 0.8];
    for(var i in aN){
        var n = aN[i]
        aBuckets[i] = (((n - 0) * (max - min)) / (1 - 0)) + min
    }


    var up = true;
    aPath = ["average"];
    console.log("risk factors calls add colors")
    addColors(aBuckets, up, aPath, oRiskIndex)
    addKey(aStandardKey, aKeyLightness);
    addLegendKey(aStandardKey, aKeyLightness, $$("riskFactorsKeyContainer"));
}

//---unemployment data

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

function getRankBuckets(aObj){
    aBuckets = [20, 40, 60, 80];
    aRes = [];
    for(var index in aBuckets){
        aRes.push(aObj[Math.round(aObj.length / 100 * aBuckets[index])].rank);
    }
    return aRes
}

function getUnemploymentData(aSelected){

    //create array of obj with id[percent] = sum of percent value  also array of
    var oUnemployment = {};
    var aObj = [];

    for(var id in oEntities) {

        oUnemployment[id] = {};
        oUnemployment[id].rank = "NA"; //default to NA
        var sumPercent = "NA"; //default to NA
        for (var index in aSelected) {
            if(oEntities[id].risks_data.hasOwnProperty(aSelected[index])) {
                var val = oEntities[id].risks_data[aSelected[index]].percent;
                var x = Number(val)
                if (isNaN(x) == false) {
                    if(sumPercent == "NA"){sumPercent = 0} //if there is data start at 0
                    sumPercent += x;
                }
            }
        }

        oUnemployment.percent = sumPercent;
        if(sumPercent != "NA"){
            var obj = {};
            obj.id = id;
            obj.percent = sumPercent;
            aObj.push(obj);
        }
    }

    //rank data
    aObj.sort(sortPercent);  //sort array of entity objects
    aObj = rankPercent(aObj);  //rank data (where there are ties take the average

    //add ranks to object
    for(var index in aObj){
        var id = aObj[index].id
        var rank = aObj[index].rank
        oUnemployment[id].rank = rank
    }


    //get buckets
    if(aSelected.length > 0) {
        var aBuckets = getRankBuckets(aObj);
    } else {
        var aBuckets = []
    }


    var aPath = ["rank"];
    var up = true;
    console.log("oUnemployment:")
    console.log(oUnemployment)
    console.log("unemployment calls add colors")
    addColors(aBuckets, up, aPath, oUnemployment);
    addKey(aStandardKey, aKeyLightness);
    addLegendKey(aStandardKey, aKeyLightness, $$("unemploymentKeyContainer"));

}





