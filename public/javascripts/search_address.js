
$(function() { //search address
    $("#seachIcon").click(function(){
        findAddress();
    })
})

$(function() { //search address
    $("#searchText").keydown(function () {
        if (event.keyCode == 13) {
            findAddress();
        }
    });
})

function findAddress() {
    var geocoder = new google.maps.Geocoder();
    var address = $('#searchText').val();
    console.log(address)
    geocoder.geocode( {'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var loc_Center = results[0].geometry.location;

            map.setCenter(loc_Center);
            map.setZoom(8);

        } else {
            alert('We could not find your address for the following reason: ' + status);
        }
    });
}
