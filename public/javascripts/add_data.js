
function HSLAer(n, aBuckets, up){
    // centerpoint orange hsla(15, 83%, 49%, 1
    //bad = orange = hsla(36, 100%, 50%, 1)
    //good = white = hsla(36, 100%, 100%, 1)

    //var lightness_max = 100;
    //var lightness_min = 50;
    if(up == true){
        if(n <= aBuckets[0]){lightness = 100}
        else if(n > aBuckets[0] && n <= aBuckets[1]){lightness = 83}
        else if(n > aBuckets[1] && n <= aBuckets[2]){lightness = 67}
        else if(n > aBuckets[2]){lightness = 50}
        else { console.log("error n = " + n)}
    } else {
        if(n >= aBuckets[2]){lightness = 100}
        else if(n < aBuckets[2] && n >= aBuckets[1]){lightness = 83}
        else if(n < aBuckets[1] && n >= aBuckets[0]){lightness = 67}
        else if(n < aBuckets[0]){lightness = 50}
        else { console.log("error n = " + n)}
    }



    //console.log(n + " : " + lightness)

    //var lightness = ((n - goodbad[0])/(goodbad[1] - goodbad[0])) * (100 - 50) + 50
    return "hsla(15, 83%, "+ lightness +"%, 1)"
}

function selectcolor(n, aBuckets, up, dict){
    if(isNaN(n)){
        if(dict.hasOwnProperty(n)){
            if(isNaN(dict[n])){
                return "grey"; //"hsla(0, 0%, 0%, 1)"
            } else {
                return HSLAer(dict[n], aBuckets, up);
            }
        }
        return "grey"; //"hsla(0, 0%, 0%, 1)";
    }else{
        return HSLAer(n, aBuckets, up);
    }
}


function addcolors(data, up, onoffList, dict){
    var aBuckets = data[1];
    aOn = onoffList[0];

    map.data.setStyle(function(feature) {
        var id = feature.getProperty('geo_code');
        if(aOn.indexOf(id) > -1) {
            var n = data[0][id];
            var color = selectcolor(n, aBuckets, up, dict);
            return {
                fillColor: color,
                fillOpacity: 1,
                strokeWeight: 0.5,
                strokeOpacity: 1,
                strokeColor: "black"
            }
        } else {
            return {
                fillOpacity: 0,
                strokeOpacity: 0
            }
        }
    })
}

function getData(){

    var sActive = $("#activeData").html();
    var year = $("#yearSelect").val();
    var quarter = $("#quarterSelect").val();
    var type = $("#percentcountSelect").val();
    var duration = $("#unemploymentDurationSelect").val();
    var classification = $("#coreSelect").val();
    if(classification == "statutory homeless and owed a duty"){classification = "stat_owed"}
    if(classification == "statutory homeless and not owed a duty"){classification = "stat_not_owed"}
    if(classification == "not statutory homeless but considered homeless"){classification = "non_stat"}
    console.log(classification)

    if(sActive == $("#btn_P1E").html()){
        $.ajax("/P1E/" + year + quarter + "/" + type).done(function (data) {
            dict = {"..": "NA", ".": "NA", "-": "2.5"};
            var up = true //good is low, bad is high
            var onoffList = [aLaList, aRegionList];
            addcolors(data, up, onoffList, dict);
        })
    }

    if(sActive == $("#btn_P1E_reporting").html()){
        $.ajax("/P1E_Reporting").done(function (data) {
            dict = {"..": "NA", ".": "NA", "-": "2.5"}
            var up = true; //good is low
            var onoffList = [aLaList, aRegionList];
            addcolors(data, up, onoffList, dict);
        })
    }

    if(sActive == $("#btn_Unemployment").html()){
        $.ajax("/Unemployment/" + year + quarter + "/" + duration).done(function (data) {
            dict = {}
            var up = true; //good is low
            var onoffList = [aLaList, aRegionList];
            addcolors(data, up, onoffList, dict);
        })
    }

    if(sActive == $("#btn_Education_lv3").html()){
        $.ajax("/Education_lv3/" + year + "/percent").done(function (data) {
            dict = {};
            var up = false; //good is high
            var onoffList = [aLaList, aRegionList];
            addcolors(data, up, onoffList, dict);
        })
    }

    if(sActive == $("#btn_Education_AG").html()){
        $.ajax("/Education_lv3/" + year + "/attainment_gap").done(function (data) {
            dict = {};
            var up = true; //good is low
            var onoffList = [aLaList, aRegionList];
            addcolors(data, up, onoffList, dict);
        })
    }

    if(sActive == $("#btn_Apprenticeship").html()){
        $.ajax("/Apprenticeship/" + year + "/" + type).done(function (data) {
            console.log(data)
            dict = {};
            var up = false; //good is high
            var onoffList = [aLaList, aRegionList];
            addcolors(data, up, onoffList, dict);
        })
    }

    if(sActive == $("#btn_Deprivation").html()){
        $.ajax("/Deprivation/Rank_of_Local_Concentration").done(function (data) {
            dict = {};
            var up = false; //good is high
            var onoffList = [aLaList, aRegionList];
            addcolors(data, up, onoffList, dict);
        })
    }

    if(sActive == $("#btn_Prevention").html()){
        $.ajax("/Prevention/" + year ).done(function (data) {
            dict = {};
            var up = true; //good is high ??
            var onoffList = [aLaList, aRegionList];
            addcolors(data, up, onoffList, dict);
        })
    }

    if(sActive == $("#btn_Core").html()){
        $.ajax("/Core/"  + year + quarter +  "/" + classification + "/" + type ).done(function(data){
            console.log(data)
            dict = {};
            var up = true; //good is low
            var onoffList = [aRegionList, aLaList];
            addcolors(data, up, onoffList, dict);
        })
    }

}


$(function () { //change data list

    $(".datatype").click(function(event){
        var sActive = ($(this).html())
        $("#activeData").html(sActive)
        getData()
    })

    //$("#p1eSelect").change(function(){
    //    var sActive = $("#btn_P1E").html()
    //    $("#activeData").html(sActive)
    //    getData()
    //});

    $("#unemploymentDurationSelect").change(function(){
        var sActive = $("#btn_Unemployment").html()
        $("#activeData").html(sActive)
        getData()
    });

    $("#coreSelect").change(function(){
        var sActive = $("#btn_Core").html()
        $("#activeData").html(sActive)
        getData()
    });

    //$("#apprenticeshipSelect").change(function(){
    //    var sActive = $("#btn_Apprenticeship").html()
    //    $("#activeData").html(sActive)
    //    getData()
    //});

    $("#yearSelect").change(function(){
        getData()
    });

    $("#quarterSelect").change(function(){
        getData()
    });

    $("#percentcountSelect").change(function(){
        getData()
    })

});



