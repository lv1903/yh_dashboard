/**
 * Created by toby on 13/05/15.
 */
if (typeof window.centrePoint === "undefined") {
  centrePoint = {};
}

var infobox = new InfoBox();

(function() {
  var activeView = "";
  var activeFeatureId = "";
  var activeFeatureName = "";

  // Renders the information for the currently active feature.
  centrePoint.renderFeatureInfo = function() {
    var template;

    if (activeFeatureId.length === 0) {
      // There is no active feature.
      template = document.getElementById("noFeatureData").innerHTML;
    } else if (activeFeatureId === "sources") {
      template  = webix.ajax().sync().get("/related_factors").responseText;
    } else {
      template = webix.ajax().sync().get("/ajaxFeature/" + activeFeatureId).responseText;
    }
    return template;
  };

  // Dynamically creates the label text for the date slider
  centrePoint.getDataDateTitle = function(slider) {
    var lookup = aDates[slider.value];
    return lookup[0] + " " + lookup[1];
  };

  // Re-loads the data based on the date slider value.
  centrePoint.onDataDateChange = function(index) {
    showMap(true);
    setHeaderTitle();

    if (false === $$("homelessnessView").config.collapsed) {
      getHomelessnessData("P1E",index);
    }

    if (false === $$("missingView").config.collapsed) {
      $$("homelessnessFeatures").refresh();
    }
  };

  // Toggle the risk factor checkboxes and re-load data.
  centrePoint.riskFactorSelectAll = function() {
    var formData = $$("riskFactorsForm").getValues();
    for (var name in formData) {
      if (formData.hasOwnProperty(name)) {
        $$("rf_" + name).setValue(this.getValue());
      }
    }
    centrePoint.riskFactorSelection();
  };

  // Re-loads the risk factor data based on the checkbox values.
  centrePoint.riskFactorSelection = function() {
    console.log($$("riskFactorsForm"))
    var formData = $$("riskFactorsForm").getValues();
    var selected = [];
    for (var name in formData) {

      if (formData.hasOwnProperty(name) && formData[name] !== 0) {
        selected.push(name);
      }
    }

    showMap(true);
    setMapBusy();
    getRiskFactorData(selected);
  };

    // Toggle the unemployment checkboxes and re-load data.
    centrePoint.unemploymentSelectAll = function() {
        var formData = $$("unemploymentForm").getValues();
        for (var name in formData) {
            if (formData.hasOwnProperty(name)) {
                $$("un_" + name).setValue(this.getValue());
            }
        }
        centrePoint.unemploymentSelection();
    };

   // Re-loads the risk factor data based on the checkbox values.
    centrePoint.unemploymentSelection = function() {
        console.log($$("unemploymentForm"))
        var formData = $$("unemploymentForm").getValues();
        var selected = [];
        for (var name in formData) {
            if (formData.hasOwnProperty(name) && formData[name] !== 0) {
                selected.push(name);
            }
        }
        showMap(true);
        setMapBusy();
        getUnemploymentData(selected);
    };


  centrePoint.viewChanged = function() {
    var newView;
    if (false === $$("homelessnessView").config.collapsed) {
      newView = "homelessness";
    } else if (false === $$("missingView").config.collapsed) {
      newView = "missing";
    } else if (false === $$("unemploymentView").config.collapsed){
      newView = "unemployment";
    } else {
      newView = "riskFactors";
  }

    activeView = newView;
    activeFeatureId = activeFeatureName = "";

    showMap(true);

    if ($$("homelessnessMap").map) {
      switch (newView) {
        case "homelessness":
          centrePoint.onDataDateChange($$("homelessnessDateSlider").getValue());
          break;
        case "missing":
          getHomelessnessData("P1E_Missing" ,0);
          break;
        case "unemployment":
          centrePoint.unemploymentSelection();
          break;
        case "riskFactors":
          centrePoint.riskFactorSelection();
          break;
      }
    }

    setHeaderTitle();
  };

  centrePoint.onSourceClick = function() {
    activeFeatureId = "sources"
    showFeature();
  };



  centrePoint.showKeyInfo = function() {
      var template
      if (false === $$("homelessnessView").config.collapsed) {
          template = "html->homelessKeyText"
      } else if (false === $$("missingView").config.collapsed) {
          template = "html->missingKeyText"
      } else if (false === $$("unemploymentView").config.collapsed) {
          template = "html->unemploymentKeyText"
      } else {
          template = "html->riskFactorKeyText"
      }

      var popupWidth =   $$("homelessnessMap").$width * .8;
      var popupHeight = $$("homelessnessMap").$width * .8;
      webix.ui({
          view:"popup",
          id:"keyPopup",
          //scroll: "y",
          //width: popupWidth,
          //height: popupHeight,
          modal: true,
          css: "popup_box",
          body: {
              view: "layout",
              rows:[
                  {
                      view: "button",
                      width: 30,
                      height: 30,
                      align: 'right',
                      label: "X",
                      click: "$$('keyPopup').close();"
                  },
                  {
                      width: popupWidth,
                      //height: popupHeight,
                      template: template}
              ]
          }
      }).show($$("homelessnessMap")._contentobj, {pos: "left",
          x:  $$("homelessnessMap").$width / 2 + $$("keyPopup").$width / 2,
          y: $$("homelessnessMap").$height / 3 -  $$("keyPopup").$height / 2
      })



  }

  // Enable webix debugging.
  webix.debug = true;

  // Include ui elements.
  webix.require("../javascripts/webix-ui.js");

  webix.ready(function() {
    if (webix.env.touch) {
      // On a touch-screen device.
      webix.ui.fullScreen();

      // Create the webix ui.
      webix.ui(centrePoint.uiMainLayout);

      // In touch mode, add the logo and search box as overlays on the map view
      // to optimise space.
      var ele = document.createElement("div");
      ele.innerHTML = "<div class='cp_floating_logo'><a target='_blank', href='http://centrepoint.org.uk/'><img src='/images/logo.png' /></div>";
      $$("homelessnessMap")._contentobj.appendChild(ele.firstChild);

      // Create a container for the search ui.
      ele = document.createElement("div");
      ele.innerHTML = "<div class='cp_floating_search' id='searchBox' />";
      $$("homelessnessMap")._contentobj.appendChild(ele.firstChild);

      // Create the search ui.
      webix.ui({
        view: "search",
        container: "searchBox",
        placeholder: "search",
        on: { onChange: findAddress }
      });
    } else {
      // On an non-touch screen device.
      webix.ui(centrePoint.uiPageLayout);
    }

    //add ocdp logo
    var ele = document.createElement("div");
    ele.innerHTML = "<div class='ocdp_floating_logo'><a target='_blank', href='http://nquiringminds.com/'><img src='/images/ocdp.png' /></div>";
    $$("homelessnessMap")._contentobj.appendChild(ele.firstChild);



    //add initial popup telling users what to do
    var popupWidth = 250;
    var popupHeight = 175;
    webix.ui({
        view:"popup",
        id:"initialPopup",
        width: popupWidth,
        height: popupHeight,
        modal: true,
        css: "popup_box",
        body: {
            view: "layout",
            rows:[
                {
                    view: "button",
                    //css: "popup_close_btn",
                    width: 30,
                    height: 30,
                    align: 'right',
                    label: "X",
                    click: "$$('initialPopup').close();"
                },
                {
                    width: 250,
                    template: "html->initialPopupText"}
            ]
        }
    }).show($$("homelessnessMap")._contentobj, {pos: "left",
                                                x:  $$("homelessnessMap").$width / 2 + popupWidth / 2,
                                                y: $$("homelessnessMap").$height / 3 -  $$("initialPopup").$height / 2
    })



    // Add listeners for click, hover and idle events.
    var gmap = $$("homelessnessMap").map;
    gmap.data.addListener('mouseover', onMouseOverMap);
    gmap.data.addListener('mouseout', onMouseOffMap);
    gmap.data.addListener('click', onFeatureClick);
    //gmap.data.addListener('click', function(){infobox.close()});
    gmap.addListener('idle', clearMapBusy);




    // Add an overlay for the 'loading' icon.
    webix.extend($$("homelessnessMap"), webix.ProgressBar);

    // Initialise the map data.
    initialiseMap(gmap);

    $$("viewAccordion").attachEvent("onAfterExpand",  centrePoint.viewChanged);

    // Force initial data load.
    centrePoint.viewChanged();

    if (preLoadFeature && preLoadFeature.length > 0) {
      activeFeatureId = preLoadFeature;
      showFeature();
    }

    // add start up info box
    //centrePoint.showInfoBox()

  });

  function getHomelessnessData(type, index) {
    setMapBusy();
    getData(type, index);
  }

  function setMapBusy() {
    $$("homelessnessMap").showProgress({ type: "icon"});

    // Make an imperceptible change to the map position. Since this is queued after the data load
    // we can use it to determine when the data has finished loading via the idle event.
    // (see http://stackoverflow.com/a/9874889)
    var m = $$("homelessnessMap").map;
    m.setCenter(new google.maps.LatLng(m.getCenter().lat(), m.getCenter().lng() + .000000001));
  }

  function clearMapBusy() {
    $$("homelessnessMap").hideProgress();
  }

  function setHeaderTitle() {
    var title = "";
    switch (activeView) {
      case "homelessness":
        var index = $$("homelessnessDateSlider").getValue();
        title = "Official youth homelessness"; // + aDates[index][0] + "/" + aDates[index][1];
        break;
      case "missing":
        title = "Missing data";
        break;
      case "riskFactors":
        title = "Index of related factors";
        break;
    }
    if($$("mapButton")._settings.hidden == true) {
        title = "<span style='float:right;font-size: 1em;margin-right:20px'>" + title + "</span>";
    } else {
        title = "";
    }
    if (activeFeatureName.length > 0) {
      title = title + "<span style='font-size:1em;'>" + activeFeatureName + "</span>";
    }
    $$("featureLabel").define("label", title);
    $$("featureLabel").refresh();
  }

  function mapZoom(){
      var zoom;
      if($$("homelessnessMap").$height < 330){
          zoom = 5;
      } else {
          zoom = 6;
      }
      //alert($$("homelessnessMap").$height + " --> " + zoom)
      return zoom
  }


  function showMap(show) {
    if (show) {
      $$("mapButton").hide();
      //$$("featureLabel").show();
      $$("resetButton").show();
      var zoom = mapZoom();
      $$('homelessnessMap').map.setOptions({zoom: zoom});
      $$("mainPanelView").setValue("homelessnessMap");
    } else {
      $$("mapButton").show();
      //$$("featureLabel").hide();
      $$("resetButton").hide();
      $$("mainPanelView").setValue("homelessnessFeatureView");
    }
  }

  function test(){
      alert("here")
  }

  function onMouseOverMap(event) {
    if (!webix.env.touch) {
      //var gmap = $$("homelessnessMap").map;
      //gmap.data.revertStyle()
      //gmap.data.overrideStyle(event.feature, {strokeColor: 'yellow', strokeWeight: '2', zIndex: '1001', strokeOpacity: '1'});
      activeFeatureId = event.feature.getProperty('geo_code');
      activeFeatureName = event.feature.getProperty('geo_label');
      setHeaderTitle();
    }
  }

  function onMouseOffMap(event) {
    if (!webix.env.touch) {
        var gmap = $$("homelessnessMap").map;
        gmap.data.revertStyle();
        activeFeatureId = "";
        activeFeatureName = "";
        setHeaderTitle();
    }
  }

  function showFeature() {
    showMap(false);

    setHeaderTitle();

    // Get feature view to render with new selection.
    $$("homelessnessFeatures").refresh();

    // Make sure feature view is visle.
    $$("homelessnessFeatureView").scrollTo(0,0);
  }

  function onFeatureClick(event){
    // Get feature details.
    activeFeatureId = event.feature.getProperty('geo_code');
    activeFeatureName = event.feature.getProperty('geo_label');

    window.history.pushState(null,null,"/feature/" + activeFeatureId);

    showFeature();
  }
}());

