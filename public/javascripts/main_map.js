

var map;
var oGeoLa = topojson.feature(oLaTopo, oLaTopo.objects.collection);
var initialCenter = new google.maps.LatLng(53,-2.5);
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

function initialiseMap(gmap) {
  map = gmap;

  if ($$("homelessnessMap").$height < 330) {
    initialZoom = 5;
  } else {
    initialZoom = 6;
  }

  map.setOptions({
    center: initialCenter,
    zoom: initialZoom,
    styles: mapStyle,
    disableDefaultUI: true,
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL,
      position: webix.env.touch ? google.maps.ControlPosition.RIGHT_CENTER : google.maps.ControlPosition.TOP_RIGHT
    }
  });

  map.data.addGeoJson(oGeoLa);

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
    } else {
        zoom = 6;
    }
    map.setZoom(zoom);
}