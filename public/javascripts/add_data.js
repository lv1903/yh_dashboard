
function HSLAer(n, aBuckets){
    // centerpoint orange hsla(15, 83%, 49%, 1
    //bad = orange = hsla(36, 100%, 50%, 1)
    //good = white = hsla(36, 100%, 100%, 1)

    //var lightness_max = 100;
    //var lightness_min = 50;

    if(n <= aBuckets[0]){lightness = 100}
    else if(n > aBuckets[0] && n <= aBuckets[1]){lightness = 83}
    else if(n > aBuckets[1] && n <= aBuckets[2]){lightness = 67}
    else if(n > aBuckets[2]){lightness = 50}
    else { console.log("error n = " + n)}

    //console.log(n + " : " + lightness)

    //var lightness = ((n - goodbad[0])/(goodbad[1] - goodbad[0])) * (100 - 50) + 50
    return "hsla(15, 83%, "+ lightness +"%, 1)"
}

function selectcolor(n, aBuckets, dict){
    if(isNaN(n)){
        if(dict.hasOwnProperty(n)){
            if(isNaN(dict[n])){
                return "grey"; //"hsla(0, 0%, 0%, 1)"
            } else {
                return HSLAer(dict[n], aBuckets);
            }
        }
        return "grey"; //"hsla(0, 0%, 0%, 1)";
    }else{
        return HSLAer(n, aBuckets);
    }
}


function addcolors(data, dict){
    //console.log(data)
    var aBuckets = data[1]
    //console.log(aBuckets)
    map.data.setStyle(function(feature) {
        var id = feature.getProperty('geo_code');
        var n = data[0][id];
        //if(id == "E07000168"){console.log(n)}
        //console.log(id)
        var color = selectcolor(n, aBuckets, dict);
        if(id == "E07000168"){console.log(color)}
        return {
            fillColor: color,
            fillOpacity: 1,
            strokeWeight: 0.5,
            strokeOpacity: 1,
            strokeColor: "black"        }
    })
}

function getData(){

    var sActive = $("#activeData").html();
    var year = $("#yearSelect").val();
    var quarter = $("#quarterSelect").val();
    var p1e_type = $("#p1eSelect").val();
    var apprenticeship_type = $("#apprenticeshipSelect").val();
    var duration = $("#unemploymentDurationSelect").val();

    if(sActive == $("#btn_P1E").html()){
        if(p1e_type == "percent" || p1e_type == "count") {
            $.ajax("/P1E/" + year + quarter + "/" + p1e_type).done(function (data) {
                dict = {"..": "NA", ".": "NA", "-": "2.5"}
                addcolors(data, dict)
            })
        } else {
            $.ajax("/P1E_Reporting").done(function (data) {
                dict = {"..": "NA", ".": "NA", "-": "2.5"}
                addcolors(data, dict)
            })

        }
    }

    if(sActive == $("#btn_Unemployment").html()){
        $.ajax("/Unemployment/" + year + quarter + "/" + duration).done(function (data) {
            dict = {}
            addcolors(data, dict)
        })
    }

    if(sActive == $("#btn_Education_lv3").html()){
        $.ajax("/Education_lv3/" + year + "/percent").done(function (data) {
            dict = {}
            addcolors(data, dict)
        })
    }

    if(sActive == $("#btn_Education_AG").html()){
        $.ajax("/Education_lv3/" + year + "/attainment_gap").done(function (data) {
            dict = {}
            addcolors(data, dict)
        })
    }

    if(sActive == $("#btn_Apprenticeship").html()){
        $.ajax("/Apprenticeship/" + year + "/" + apprenticeship_type).done(function (data) {
            console.log(data)
            dict = {}
            addcolors(data, dict)
        })
    }

    if(sActive == $("#btn_Deprivation").html()){
        $.ajax("/Deprivation/Rank_of_Local_Concentration").done(function (data) {
            dict = {}
            addcolors(data, dict)
        })
    }

    if(sActive == $("#btn_Prevention").html()){
        $.ajax("/Prevention/" + year ).done(function (data) {
            dict = {}
            addcolors(data, dict)
        })
    }

}



$(function () { //change data list

    $(".datatype").click(function(event){
        var sActive = ($(this).html())
        $("#activeData").html(sActive)
        getData()
    })

    $("#p1eSelect").change(function(){
        var sActive = $("#btn_P1E").html()
        $("#activeData").html(sActive)
        getData()
    });

    $("#unemploymentDurationSelect").change(function(){
        var sActive = $("#btn_Unemployment").html()
        $("#activeData").html(sActive)
        getData()
    });

    $("#apprenticeshipSelect").change(function(){
        var sActive = $("#btn_Apprenticeship").html()
        $("#activeData").html(sActive)
        getData()
    });

    $("#yearSelect").change(function(){
        getData()
    });

    $("#quarterSelect").change(function(){
        getData()
    });

});






/*
var oBucket = {}
oBucket["total"] = [3, 5];
oBucket["0-6m"] =[1, 2];
oBucket["6-12m"] = [.5,1];
oBucket["over12m"] = [.5, 1];
oBucket["percent"] = [55, 40]
oBucket["attainment_gap"] = [20, 35]

function getData(){

    console.log("get data called")
    var datatype = $("#dataTypeSelect").val();
    var Y = $("#yearSelect").val();
    var Q = $("#quarterSelect").val();
    var D = $("#unemploymentDurationSelect").val();
    var E = $("#educationTypeSelect").val();

    if(datatype == "P1E"){
        $.ajax("/P1E/" + Y + Q).done(function (data) {
            addP1Ecolors((data))
        })
    }

    if(datatype == "Unemployment"){
        $.ajax("/Unemployment/" + Y + Q + "/" + D).done(function (data) {
            //console.log(data)
            add3colors(data, oBucket[D])
        })
    }

    if(datatype == "Education"){
        $.ajax("/Education/" + Y + "/" + E).done(function (data) {
            console.log(oBucket)
            console.log(oBucket[E])
            console.log(E)
            add3colors(data, oBucket[E])
        })
    }


}

$(function () { //change data list
    $("#dataTypeSelect").change(function(){
        getData()
    });
});

$(function () { //change data list
    $("#yearSelect").change(function(){
        getData()
    });
});

$(function () { //change data list
    $("#quarterSelect").change(function(){
        getData()
    });
});


$(function () { //change data list
    $("#unemploymentDurationSelect").change(function(){
        getData()
    });
});

$(function () { //change data list
    $("#educationTypeSelect").change(function(){
        getData()
    });
});

//------------------
function selectP1EKeyColor(n){
    if(n == ".."){return "grey"}
    if(n == "."){return "grey"}
    if(n == "-"){return "green"}
    if(n <= 10){return "green"}
    if(n > 10 && n <=50){return "orange"}
    if(n > 50){return "red"}
}

function addP1Ecolors(data){
    map.data.setStyle(function(feature) {

        var id = feature.getProperty('geo_code');
        var n = data[id];
        var color = selectP1EKeyColor(n);
        return {
            fillColor: color,
            fillOpacity: 0.7,
            strokeWeight: 0.5,
            strokeOpacity: 0.7,
            strokeColor: "black"
        }
    })
}
//------------------------
function select3KeyColor(n, aBucket){

    if(aBucket[0] < aBucket[1]) {
        //console.log(aBucket)
        if (n <= aBucket[0]) {
            return "green"
        }
        if (n > aBucket[0] && n <= aBucket[1]) {
            return "orange"
        }
        if (n > aBucket[1]) {
            return "red"
        }
    } else {
        //console.log(aBucket)
        if (n >= aBucket[0]) {
            return "green"
        }
        if (n < aBucket[0] && n >= aBucket[1]) {
            return "orange"
        }
        if (n < aBucket[1]) {
            return "red"
        }
    }
}

function add3colors(data, aBucket){
    map.data.setStyle(function(feature) {

        var id = feature.getProperty('geo_code');
        var n = data[id];
        var color = select3KeyColor(n, aBucket);
        return {
            fillColor: color,
            fillOpacity: 0.7,
            strokeWeight: 0.5,
            strokeOpacity: 0.7,
            strokeColor: "black"
        }
    })
}
//---------------------------
*/