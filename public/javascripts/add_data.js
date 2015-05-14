
var aDates = [
    ["2012", "Q1"], ["2012", "Q2"], ["2012", "Q3"], ["2012", "Q4"],
    ["2013", "Q1"], ["2013", "Q2"], ["2013", "Q3"], ["2013", "Q4"],
    ["2014", "Q1"], ["2014", "Q2"], ["2014", "Q3"], ["2014", "Q4"]
]


function addKey(aKeyValues, aLightnessValues){

    if($("#keyContainer") != null) {
        $("#keyContainer").remove();
    }

    var h = 450;
    var w = 200;

    var svg = d3.select("#mapSide")//(".mapCanvas")
        .append("div")
        .classed("svg-container", true)
        .attr("id", "keyContainer")
        .append("svg")
        .attr("id", "keyCanvas")
        .attr("height", h)
        .attr("width", w)



    var ystart = 20;
    var r = 20;
    var circlepadding = 5;

    //svg.selectAll("rect")
    //    .data(aKeyValues)
    //    .enter()
    //    .append("rect")
    //    .attr("x", 0)
    //    .attr("y", function(d, i){
    //        return ystart + 10 + i * (2 * (r + circlepadding));
    //    })
    //    .attr("height", r )
    //    .attr("width", 150 - r)
    //    .attr("fill", "white")
    ////.attr("rx", r)
    ////.attr("ry", r)

    svg.selectAll("circle")
        .data(aKeyValues)
        .enter()
        .append("circle")
        .attr("cx", 100)
        .attr("cy", function(d, i) {
            return ystart + i * (2 * (r + circlepadding)) + r;
        })
        .attr("r", r)
        //.attr("fill", "white")
        .attr("fill", function(d, i){
            var lightness = aLightnessValues[i]
            return "hsla(10, 90%, "+ lightness +"%, 1)"
        })
        //.attr("border", 1)
        .attr("stroke-width", 2)
        .attr("stroke", "hsla(10, 90%, "+ aLightnessValues[0] +"%, 1)")

/*    var fontsize = 15
    svg.selectAll("text")
        .data(aKeyValues)
        .enter()
        .append("text")
        .text(function(d) {
            return d;
        })
        //.attr("text-anchor", "middle")
        .attr("x", 0)
        .attr("y", function(d, i) {
            return ystart + 5 + i * (2 * (r + circlepadding)) + r;
            //return i * (h / aKeyValues.length) + boxh / 2 + fontSize / 3;
        })
        .attr("font-size", fontsize + "px")*/


    var fontsizeNumber = 30;
    var fontsizeText = 18;
    svg.selectAll("text")
        .data(aKeyValues)
        .enter()
        .append("text")
        .text(function(d) {
            return d;
        })
        .attr("text-anchor", "middle")
        .attr("x", 100)
        .attr("y", function(d, i) {
            if(isNaN(Number(aKeyValues[i]))){
                return ystart + (fontsizeText/2 - 2) + i * (2 * (r + circlepadding)) + r;
            } else {
                return ystart + (fontsizeNumber/2 - 4)+ i * (2 * (r + circlepadding)) + r;
            }


        })
        .attr("font-size", function(d, i){
            if(isNaN(Number(aKeyValues[i]))){
                return fontsizeText + "px"
            } else {
                return fontsizeNumber + "px"
            }
        })
        .attr("font-weight", "bold")
        //.attr("color", "white")


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

var aStandardKey = ["5", "4", "3", "2", "1", "na"]
//var aStandardKey = [ "worst", "", "", "", "best", "no data" ];
var aKeyLightness = [30, 40, 50, 60, 90, 100];

var aMissingDataKey = ["12m", " 9m", "6m", "3m", "0m"]
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

    dateIndex = dateIndex || 10;

    //var sActive = $("#activeData").html();
    //var dateIndex = $("#slider").slider("value");
    var year = aDates[dateIndex][0];
    var quarter = aDates[dateIndex][1];

    //var year = $("#yearSelect").val();
    //var quarter = $("#quarterSelect").val();

    //console.log("entities")
    //console.log(oEntities)
    //console.log("national")
    //console.log(oNational)

    //if(sActive == $("#btn_P1E").html()){
    //    $( "#slider" ).slider( "option", "disabled", false );
    //} else {
    //    $( "#slider" ).slider( "option", "disabled", true );
    //}

    if(sActive === "P1E") {
        aBuckets = oNational.homeless_data[year + quarter].p1e.quintiles;
        var up = true;
        var aPath = ["homeless_data", year + quarter, "p1e", "percent"];
        addColors(aBuckets, up, aPath, oEntities );
        //addKey(aStandardKey, aKeyLightness);
    }

    //if(sActive == $("#btn_P1E_reporting").html()){
    //    console.log(oNational.homeless_data.p1e_missing_count.quintiles)
    //    aBuckets = oNational.homeless_data.p1e_missing_count.quintiles;
    //    var up = true; //good is low
    //    var aPath = ["homeless_data", "p1e_missing_count"];
    //    addColors(aBuckets, up, aPath, oEntities );
    //    //addKey(aMissingDataKey, [30, 40, 50, 60, 100]);
    //}
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





function getRiskFactorData(){

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



    var aSelected = [];
    $('.chkrisk').each(function() {
        //console.log($(this).attr('name'))
        if($(this).is(":checked")) {
            aSelected.push($(this).attr('name'));
        }
    });

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

    //$(".riskFactorsModal").modal("hide");

}

/*
    This needs porting to webix

$(function () { //change data list

    $(".datatype").click(function (event) {
        if ($(this).is(":button")) {
            var sActive = ($(this).html());
            $("#activeData").html(sActive);
            getData()
        }
    })

    $(".riskfactortype").click(function (event) { // add modal
        riskFactorClick(event)
    })

    $(".button_add_risk_factors").click(function(event){ // map data
        getRiskFactorData()
        $("#activeData").html("index of risk factors")
    })

    $("#chk_Select_All").change(function(){ //select/deselect all
        if($(this).is(":checked")) {
            $('.chkrisk').each(function() {
                this.checked = true;
            });

        } else {
            $('.chkrisk').each(function() {
                this.checked = false;
            });
        }
    })

    $(".chkParent").change(function(){ //select/deselect all
        var pname = $(this).attr('pname');
        console.log(pname)
        if($(this).is(":checked")) {
            $('.chkrisk').each(function() {
                if($(this).attr('pname') == pname) {
                    this.checked = true;
                }
            });
        } else {
            $('.chkrisk').each(function() {
                if($(this).attr('pname') == pname) {
                    this.checked = false;
                }
            });
        }
    })

    $(function () {
        $('[data-toggle="popover"]').popover()
    })

    $(".infotype").each(function(){
        var name = $(this).attr('name')
        if(oText.hasOwnProperty(name)) {
            $(this).popover({
                html: true,
                container: 'body',
                title: oText[name].title,
                content: oText[name].content
            })
        }
    })

    $(".infoChktype").each(function(){
        var name = $(this).attr('name')
        if(oText.hasOwnProperty(name)) {
            $(this).popover({
                html: true,
                container: 'body',
                title: oText[name].title,
                content: oText[name].content
            })
        }
    })



})



//--slider----


$(function() {

    var aDateRange= ["Q2 2012", "Q3", "Q4", "Q1 2013", "Q2", "Q3", "Q4", "Q1 2014", "Q2", "Q3", "Q4 2014"]

    $( "#slider" ).slider({

        value: aDateRange.length,
        min: 1,
        max: aDateRange.length,
        step: 1,
        slide: function( event, ui ) {
            //console.log(aDateRange[ui])
            console.log( aDateRange[ui.value - 1]);
            getData()
        }
    }).each(function() {
        var opt = $(this).data().uiSlider.options;

        // Space out values
        for (var i = 0; i < aDateRange.length; i++) {

            var el = $('<label>' + aDateRange[i] + '</label>').css('left', (i / (aDateRange.length - 1) * 100) + '%');

            $("#slider").append(el);
        }
    })

});

  */