function featureClick2(event){

    var id = event.feature.getProperty('geo_code');
    var name = event.feature.getProperty('geo_label');

    console.log("fc2")

    url = "/local/" + id + "/" + name + "/";
    $.ajax({
        type: 'get',
        url: url,
        success: function() {
            console.log('success');
            window.location.href = url
        }
    });
}
