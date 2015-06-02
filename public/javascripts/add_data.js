
var aDates = [
    /*["2012", "Q1"],*/ ["2012", "Q2"], ["2012", "Q3"], ["2012", "Q4"],
    ["2013", "Q1"], ["2013", "Q2"], ["2013", "Q3"], ["2013", "Q4"],
    ["2014", "Q1"], ["2014", "Q2"], ["2014", "Q3"], ["2014", "Q4"]
]


function addKey(aKeyValues, aLightnessValues){

    //close the info box if there is one
    //infobox.close();

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
            centrePoint.showKeyInfo()
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
            return "hsla(10, 90%, "+ aLightnessValues[i] +"%, 1)"
        })
        .attr("stroke", "black")

    //svg.selectAll("text.labels")
    //    .data(aKeyValues)
    //    .enter()
    //    .append("text")
    //    .text(function(d) {
    //        console.log(d)
    //        return d;
    //    })
    //    .attr("text-anchor", "middle")
    //    .attr("x", w/2)
    //    .attr("y", function(d, i) {
    //        return (r * 2 + fontsize) + (i * 2 * r) - 2;
    //    })
    //    .attr("font-family", "Arial")
    //    .attr("font-size", fontsize - 4 + "px")
    //    .attr("fill", "black");
    //
    $$("homelessnessMap")._contentobj.appendChild(ele.firstChild);
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

var aStandardKey = ["worst 20%", "", "", "", "best 20%", "no data"]
//var aStandardKey = [ "worst", "", "", "", "best", "no data" ];
var aKeyLightness = [30, 40, 50, 60, 90, 100];

var aMissingDataKey = ["12m", " 9m", "6m", "3m", "0m"]
var aMissingLightness = [30, 40, 50, 60, 100]
//var aCoreKey = ["highest rate", "below average", "above average", "lowest rate", "no data"]



function selectcolor(n, aBuckets, up){

    //console.log(n)
    //console.log(aBuckets)

    if(isNaN(n)){
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

        //console.log("n: " + n)
        //console.log(aBuckets)
        //console.log("lightness: " + lightness)
        //console.log("---------")

        return "hsla(10, 90%, "+ lightness +"%, 1)"
    }
}


function addColors(aBuckets, up, aPath, obj){
    map.data.setStyle(function(feature) {
        var id = feature.getProperty('geo_code');
        //console.log(aPath[1])
        //console.log(oEntities[id][aPath[0]])
        var n = jsonPath(0, aPath, obj[id]);
        if(n == 0){n = "zero"} //to give white color
        var color = selectcolor(n, aBuckets, up);
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
      addKey(aStandardKey, aKeyLightness);
  }

  if (sActive === "P1E_Missing"){
      //console.log(oNational.homeless_data.p1e_missing_count.quintiles)
      aBuckets = oNational.homeless_data.p1e_missing_count.quintiles;
      var up = true; //good is low
      var aPath = ["homeless_data", "p1e_missing_count"];
      addColors(aBuckets, up, aPath, oEntities );
      addKey(aMissingDataKey, aMissingLightness);
  }
  //
  //if(sActive == $("#btn_Prevention").html()){
  //    aBuckets = oNational.homeless_data[year].prevention.quintiles;
  //    var up = false;
  //    var aPath = ["homeless_data", year, "prevention", "percent"];
  //    addColors(aBuckets, up, aPath, oEntities );
  //    //addKey(aStandardKey, aKeyLightness);
  //}
  //
  //if(sActive == $("#btn_Core_Priority").html()){
  //    aBuckets = oNational.homeless_data[year + quarter].core_priority.quintiles;
  //    var up = true;
  //    var aPath = ["homeless_data", year + quarter, "core_priority", "percent"];
  //    addColors(aBuckets, up, aPath, oEntities );
  //    //addKey(aStandardKey, aKeyLightness);
  //}
  //
  //if(sActive == $("#btn_Core_Non_Priority").html()){
  //    aBuckets = oNational.homeless_data[year + quarter].core_non_priority.quintiles;
  //    var up = true;
  //    var aPath = ["homeless_data", year + quarter, "core_non_priority", "percent"];
  //    addColors(aBuckets, up, aPath, oEntities );
  //    //addKey(aStandardKey, aKeyLightness);
  //}
  //

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

    //console.log(oRiskIndex)
    //console.log(min + " : " + max + " : " + aBuckets)

    var up = true;
    aPath = ["average"];
    addColors(aBuckets, up, aPath, oRiskIndex)
    addKey(aStandardKey, aKeyLightness);
    //$(".riskFactorsModal").modal("hide");

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
                    //console.log(aSelected[index] + "-->" + x)
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

    //console.log("oUnemployment*****************")
    //console.log(oUnemployment)
    //
    //console.log("aObj***********")
    //console.log(aObj)

    //get buckets
    if(aSelected.length > 0) {
        var aBuckets = getRankBuckets(aObj);
    } else {
        var aBuckets = []
    }
    //console.log("buckets*************")
    //console.log(aBuckets)

    var aPath = ["rank"];
    var up = true;
    addColors(aBuckets, up, aPath, oUnemployment);
    addKey(aStandardKey, aKeyLightness);

}





