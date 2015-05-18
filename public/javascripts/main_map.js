

var map;
var oGeoLa = topojson.feature(oLaTopo, oLaTopo.objects.collection);

var initialCenter = new google.maps.LatLng(53,-2.5);
var initialZoom = 6;

function getIdList(oGeo){
    var aList = [];
    for(var index = 0; index < oGeo.features.length; index++){
        aList.push(oGeo.features[index].properties.geo_code)
    }
    return aList
}
var aLaList = getIdList(oGeoLa);

function extend_bounds(bounds, arr){
    arr.forEach(function(path){
        path.getArray().forEach(function(latLng){
            bounds.extend(latLng);
        });
    });
    return bounds
}

function CenterControl(controlDiv, map, center) {

    // Set CSS for the control border
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '1px solid lightgrey';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 1px 1px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginTop = '6px';
    controlUI.style.marginLeft = '6px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to recenter the map';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '12px';
    controlText.style.lineHeight = '20px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'reset map';
    controlUI.appendChild(controlText);

    // Setup the click event listeners: simply set the map to
    // Chicago
    google.maps.event.addDomListener(controlUI, 'click', function() {
        console.log("here")
        map.setCenter(initialCenter)
        map.setZoom(initialZoom)
    });

}



function initialize() {

    var mapOptions = {
        zoom: initialZoom,
        center: initialCenter,
        styles: mapStyle,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.TOP_RIGHT
        }
    };
    map = new google.maps.Map($(".mapCanvas")[0], mapOptions);


    map.data.addGeoJson(oGeoLa);

    var infobox =  new InfoBox();


    map.data.addListener('mouseover', function(event) {
        infobox.close()
        contentString = event.feature.getProperty('geo_label');// + " : " + event.feature.getProperty('geo_code')
        infobox.setContent(contentString)
        var w = contentString.length * 10 + "px"
        myOptions = {
            disableAutoPan: true,
            //maxWidth: 0,
            pixelOffset: new google.maps.Size(-50, -50),
            zIndex: null,

            boxStyle: {
                border: "1px solid grey",
                boxShadow:  '0 5px 5px rgba(0,0,0,.3)',
                textAlign: "center",
                fontSize: "12pt",
                color: "black",
                font: "Arial",
                background: "white",
                opacity: 0.80,
                width: w
            },
            closeBoxURL: ""
        }

        var bounds = new google.maps.LatLngBounds();

        if(event.feature.getGeometry().getType()==='MultiPolygon'){
            for(i in event.feature.getGeometry().getArray()){
                bounds = extend_bounds(bounds, event.feature.getGeometry().getArray()[i].getArray())
            }
        }
        if(event.feature.getGeometry().getType()==='Polygon'){
            bounds = extend_bounds(bounds, event.feature.getGeometry().getArray())
        }

        var latlng = new google.maps.LatLng(bounds.getCenter().lat() , bounds.getCenter().lng());

        infobox.setPosition(bounds.getCenter())
        infobox.setOptions(myOptions)
        infobox.open(map)
        setTimeout(function () { infobox.close(); }, 8000);
    });


    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, map);
    centerControlDiv.index = 100;
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(centerControlDiv);


    map.data.addListener('click', function(event) {
        featureClick2(event)
    });

    getData()
}



google.maps.event.addDomListener(window, 'load', initialize);

//var marker = new google.maps.Marker({map: map});