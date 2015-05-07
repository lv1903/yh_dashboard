function featureClick(event){

    var id = event.feature.getProperty('geo_code');
    var name = event.feature.getProperty('geo_label');


    $("#featureTitle").html(name)
    //$(".modal-header").attr("id", id)
    $("#featureIdTitle").html("ONS Entity Id: " + id);
    //
    //if (oPopData.hasOwnProperty(id)){
            loadFeatureInfoBox()//oPopData[id]);
    //} else {
    //    $.ajax("/pop_data/" + id ).done(function (oPopDataId) {
    //        oPopData[id] = oPopDataId;
    //        loadFeatureInfoBox(oPopDataId);
    //    });
    //};
}



function loadFeatureInfoBox(){//oPopDataId) {
    //var year = $("#yearList").val();
    //var maxValue = getPopMaxValue(oPopDataId);
    //popPyramid(oPopDataId[year], maxValue)

    $(".featureInfoModal").modal("show");
}



//-------------------------------------------------------

function riskFactorClick(event){
    $(".riskFactorsModal").modal("show");
}

