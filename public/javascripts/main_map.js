

var map;
var oGeoLa = topojson.feature(oLaTopo, oLaTopo.objects.collection);

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

  map.setOptions({
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