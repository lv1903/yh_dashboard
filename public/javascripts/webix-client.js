/**
 * Created by toby on 13/05/15.
 */
if (typeof window.centrePoint === "undefined") {
  centrePoint = {};
}

(function() {
  var activeView = "";
  var activeFeatureId = "";
  var activeFeatureName = "";

  // Renders the information for the currently active feature.
  // ToDo - replace with ajax call to server?
  centrePoint.renderFeatureInfo = function() {
    var template;

    if (activeFeatureId.length === 0 || activeFeatureName.length === 0) {
      // There is no active feature.
      template = document.getElementById("noFeatureData").innerHTML;
    } else {
      var dataDiv = loadFeatureInfoBox(activeFeatureId, activeFeatureName);
      template = dataDiv.innerHTML;
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
    setSideBarTitle();

    if (!$$("homelessnessSideBarView").config.collapsed) {
      getHomelessnessData("P1E",index);
    }

    if (!$$("homelessnessFeatureView").config.collapsed) {
      $$("homelessnessFeatures").refresh();
    }
  };

  // Toggle the risk factor checkboxes and re-load data.
  centrePoint.riskFactorSelectAll = function() {
    var formData = $$("riskFactors").getValues();
    for (var name in formData) {
      if (formData.hasOwnProperty(name)) {
        $$("rf_" + name).setValue(this.getValue());
      }
    }
    centrePoint.riskFactorSelection();
  };

  // Re-loads the risk factor data based on the checkbox values.
  centrePoint.riskFactorSelection = function() {
    var formData = $$("riskFactors").getValues();
    var selected = [];
    for (var name in formData) {
      if (formData.hasOwnProperty(name) && formData[name] !== 0) {
        selected.push(name);
      }
    }

    setMapBusy();
    getRiskFactorData(selected);
  };

  centrePoint.refreshFeatureInfo = function() {
    if ($$("homelessnessFeatureView") && $$("homelessnessSideBarView").config.collapsed) {
      $$("homelessnessFeatures").render();
    }
  };

  centrePoint.viewChanged = function() {
    var newView = $$("sideBarMultiView").getActiveId();

    if (true) {
      switch (newView) {
        case "homelessness":
          centrePoint.onDataDateChange($$("homelessnessDateSlider").getValue());
          break;
        case "missing":
          getHomelessnessData("P1E_Missing" ,0);
          break;
        case "riskFactors":
          centrePoint.riskFactorSelection();
          break;
      }
    }

    activeView = newView;
    activeFeatureId = activeFeatureName = "";
    setSideBarTitle();
  };

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
      ele.innerHTML = "<div class='cp_floating_logo'><img src='/images/logo.png' /></div>";
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

    // Add listeners for click, hover and idle events.
    var gmap = $$("homelessnessMap").map;
    gmap.data.addListener('mouseover', onMouseOverMap);
    gmap.data.addListener('click', onFeatureClick);
    gmap.addListener('idle', clearMapBusy);

    // Initialise the map data.
    initialiseMap(gmap);

    // Add an overlay for the 'loading' icon.
    webix.extend($$("homelessnessMap"), webix.ProgressBar);

    // Force initial data load.
    centrePoint.viewChanged();

    webix.history.track("mainToolbar");
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

  function setSideBarTitle() {
    var title = "";
    switch (activeView) {
      case "homelessness":
        var index = $$("homelessnessDateSlider").getValue();
        title = "Youth homelessness"; // + aDates[index][0] + "/" + aDates[index][1];
        break;
      case "missing":
        title = "Missing data";
        break;
      case "riskFactors":
        title = "Index of risk factors"
        break;
    }
    title = "<span style='float:right;font-size: .8em;'>" + title + "</span>";
    if (activeFeatureName.length > 0) {
      title = title + "<span style='font-size:.8em;'>" + activeFeatureName + "</span>";
    }
    $$("homelessnessSideBarView").define("header", title);
    $$("homelessnessSideBarView").refresh();
  }

  function onMouseOverMap(event) {
    if (!webix.env.touch && $$("homelessnessFeatureView").config.collapsed) {
      activeFeatureId = event.feature.getProperty('geo_code');
      activeFeatureName = event.feature.getProperty('geo_label');
      setSideBarTitle();
    }
  }

  function onFeatureClick(event){
    // Get feature details.
    activeFeatureId = event.feature.getProperty('geo_code');
    activeFeatureName = event.feature.getProperty('geo_label');

    setSideBarTitle();

    // Get feature view to render with new selection.
    $$("homelessnessFeatures").refresh();

    // Make sure feature view is visible.
    $$("homelessnessFeatureScrollView").scrollTo(0,0);
    $$("homelessnessFeatureView").expand();
  }
}());