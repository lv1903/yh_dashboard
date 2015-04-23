

var map;

function initialize() {

    var latlng = new google.maps.LatLng(53.5,.5);
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

    oGeo = topojson.feature(oTopo, oTopo.objects.collection)
    map.data.addGeoJson(oGeo);

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