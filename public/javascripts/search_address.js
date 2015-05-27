function findAddress(address) {
    var geocoder = new google.maps.Geocoder();
    console.log(address)
    geocoder.geocode( {'address': address}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
            var loc_Center = results[0].geometry.location;
            map.setCenter(loc_Center);
            map.setZoom(9);
            //var gmap = $$("homelessnessMap").map;
            ////console.log(gmap.event)
            ////gmap.event.trigger(feature, 'click', {});
            //console.log("-------------------------------------------------")
            //google.maps.event.trigger(map.data, 'mouseover', {
            //    stop: null,
            //    latLng: new google.maps.LatLng(53,-2.5)
            //});

        } else {
            webix.message('We could not find your address for the following reason: ' + status);
        }
        // Clear focus from search input.
        document.activeElement.value = "";
        document.activeElement.blur();
    });
}
