

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



function initialiseMap() {

    var latlng = new google.maps.LatLng(53,-2.5);
    var mapOptions = {
        zoom: 6,
        center: latlng,
        styles: mapStyle,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.TOP_RIGHT
        }
    };
//    map = new google.maps.Map($(".mapCanvas")[0], mapOptions);
    map = $$("homelessnessMap").map;


    map.data.addGeoJson(oGeoLa);

    //var infowindow = new google.maps.InfoWindow();
    //
    //map.data.addListener('mouseover', function(event) {
    //    infowindow.close()
    //    contentString = event.feature.getProperty('geo_label');// + " : " + event.feature.getProperty('geo_code')
    //    infowindow.setContent(contentString)
    //
    //    var bounds = new google.maps.LatLngBounds();
    //
    //    if(event.feature.getGeometry().getType()==='MultiPolygon'){
    //        for(i in event.feature.getGeometry().getArray()){
    //            bounds = extend_bounds(bounds, event.feature.getGeometry().getArray()[i].getArray())
    //        }
    //    }
    //
    //    if(event.feature.getGeometry().getType()==='Polygon'){
    //        bounds = extend_bounds(bounds, event.feature.getGeometry().getArray())
    //    }
    //
    //    var latlng = new google.maps.LatLng(bounds.getCenter().lat() + 1000, bounds.getCenter().lng());
    //
    //    infowindow.setPosition(bounds.getCenter())
    //    infowindow.open(map)
    //    setTimeout(function () { infowindow.close(); }, 3000);
    //});

    map.data.addListener('click', function(event) {
        featureClick(event)
    });
}


//google.maps.event.addDomListener(window, 'load', initialize);

//var marker = new google.maps.Marker({map: map});