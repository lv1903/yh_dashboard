

var map;
var oGeoLa = topojson.feature(oLaTopo, oLaTopo.objects.collection);
var initialCenter = new google.maps.LatLng(53,-2);
var initialZoom;

var marker = "no marker";

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

function initialiseMap(gmap) {
  map = gmap;

  if($$("homelessnessMap").$height < 330){
    console.log($$("homelessnessMap").$height + "<")
    initialZoom = 5;
  } else {
      console.log($$("homelessnessMap").$height + ">")
    initialZoom = 6;
  }

  map.setOptions({
    center: initialCenter,
    zoom: initialZoom,
    styles: mapStyle,
    disableDefaultUI: true,
    disableDoubleClickZoom: true,
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL,
      position: webix.env.touch ? google.maps.ControlPosition.RIGHT_CENTER : google.maps.ControlPosition.TOP_RIGHT
    }
  });

  map.data.addGeoJson(oGeoLa);

  var infobox =  new InfoBox();
  var pendingTimeout = 0;

  map.data.addListener('mouseout', function() {
    infobox.close();
  });

  map.data.addListener('mouseover', function(event) {
    if (pendingTimeout !== 0) {
      clearTimeout(pendingTimeout);
    }

    pendingTimeout = setTimeout(function() {
        infobox.close();
        var contentString = event.feature.getProperty('geo_label');
        infobox.setContent(contentString);
        var w = contentString.length * 10 + "px";
        var myOptions = {
            disableAutoPan: true,
            pixelOffset: new google.maps.Size(-50, -50),
            zIndex: null,
            boxStyle: {
                border: "1px solid grey",
                boxShadow: '0 5px 5px rgba(0,0,0,.3)',
                textAlign: "center",
                fontSize: "12pt",
                color: "black",
                font: "Arial",
                background: "white",
                opacity: 0.80,
                width: w
            },
            closeBoxURL: ""
        };

        var bounds = new google.maps.LatLngBounds();

        if (event.feature.getGeometry().getType() === 'MultiPolygon') {
            for (var i in event.feature.getGeometry().getArray()) {
                bounds = extend_bounds(bounds, event.feature.getGeometry().getArray()[i].getArray())
            }
        }
        if (event.feature.getGeometry().getType() === 'Polygon') {
            bounds = extend_bounds(bounds, event.feature.getGeometry().getArray())
        }

        infobox.setPosition(bounds.getCenter());
        infobox.setOptions(myOptions);
        infobox.open(map);
        setTimeout(function () {
            infobox.close();
        }, 10000);

    }, 250);
  });
}

function resetMap() {

    if(marker != "no marker"){
        marker.setMap(null);
        marker = "no marker";
    }

    map.setCenter(initialCenter);
    var zoom;
    if($$("homelessnessMap").$height < 330){
        zoom = 5;
    } else if($$("homelessnessMap").$height < 790){
        zoom = 6;
    } else {
        zoom = 7;
    }
    console.log("homelessmap height: " + $$("homelessnessMap").$height);
    map.setZoom(zoom);
}