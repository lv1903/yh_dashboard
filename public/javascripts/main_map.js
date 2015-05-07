

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

//console.log(aLaList)



function initialize() {

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
    map = new google.maps.Map($(".mapCanvas")[0], mapOptions);


    map.data.addGeoJson(oGeoLa);

    var infowindow = new google.maps.InfoWindow();

    //map.data.addListener('mouseover', function(event) {
    //    infowindow.close
    //    contentString = event.feature.getProperty('geo_label') + " : " + event.feature.getProperty('geo_code')
    //    infowindow.setContent(contentString)
    //    var latlng = new google.maps.LatLng(event.latLng.k, event.latLng.D)
    //    infowindow.setPosition(latlng)
    //    infowindow.open(map)
    //});
    //
    //
    //map.data.addListener('mouseout', function(event) {
    //    infowindow.close()
    //});

    map.data.addListener('click', function(event) {
        featureClick(event)
    });

    getData()



}


google.maps.event.addDomListener(window, 'load', initialize);