

var map;
var oGeoLa = topojson.feature(oLaTopo, oLaTopo.objects.collection);
var oGeoRegion = topojson.feature(oRegionTopo, oRegionTopo.objects.collection);

function getIdList(oGeo){
    var aList = [];
    for(var index = 0; index < oGeo.features.length; index++){
        aList.push(oGeo.features[index].properties.geo_code)
    }
    return aList
}

var aLaList = getIdList(oGeoLa);
var aRegionList = getIdList(oGeoRegion);
//console.log(aLaList)

function initialize() {

    var latlng = new google.maps.LatLng(53.5,-3.5);
    var mapOptions = {
        zoom: 6,
        center: latlng,
        styles: mapStyle,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.TOP_RIGHT
        }
    };
    map = new google.maps.Map($(".mapCanvas")[0], mapOptions);

    map.data.addGeoJson(oGeoLa);
    map.data.addGeoJson(oGeoRegion);

    var infowindow = new google.maps.InfoWindow();

    map.data.addListener('mouseover', function(event) {
        infowindow.close
        contentString = event.feature.getProperty('geo_label') + " : " + event.feature.getProperty('geo_code')
        infowindow.setContent(contentString)
        var latlng = new google.maps.LatLng(event.latLng.k, event.latLng.D)
        infowindow.setPosition(latlng)
        infowindow.open(map)
    });
    map.data.addListener('mouseout', function(event) {
        infowindow.close()
    });

    getData()



}


google.maps.event.addDomListener(window, 'load', initialize);