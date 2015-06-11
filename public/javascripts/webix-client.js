/**
 * Created by toby on 13/05/15.
 */
if (typeof window.centrePoint === "undefined") {
  centrePoint = {};
}

// flag for returning to map view
var lastActiveView; //= $$("homelessnessView");

(function() {
  var activeMap = "";
  var activeFeatureId = "";
  var activeFeatureName = "";
  centrePoint.mapInitialised = false;
  centrePoint.useTouch = webix.env.touch;

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
    showView("map");
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

    showView("map");
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
    showView("map");
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
    showView("map");
    setMapBusy();
    getUnemploymentData(selected);
  };

  centrePoint.backToMap = function(){
    console.log(lastActiveView)
    if(typeof lastActiveView != "undefined") {
        lastActiveView.expand()
        $$("blankView").collapse()
    }
    centrePoint.accordionViewChanged()
  }



  centrePoint.accordionViewChanged = function() {

    $$("sourceDetailsButton").show()

    var newMapView;
    if (false === $$("homelessnessView").config.collapsed) {
      newMapView = "homelessness";
    } else if (false === $$("missingView").config.collapsed) {
      newMapView = "missing";
    } else if (false === $$("unemploymentView").config.collapsed) {
      newMapView = "unemployment";
    } else {
      newMapView = "riskFactors";
    }

    activeMap = newMapView;
    activeFeatureId = activeFeatureName = "";

    showView("map");

    if (centrePoint.mapInitialised) {
      if ($$("homelessnessMap").map) {
        switch (activeMap) {
          case "homelessness":
            centrePoint.onDataDateChange($$("homelessnessDateSlider").getValue());
            break;
          case "missing":
            getHomelessnessData("P1E_Missing", 0);
            break;
          case "unemployment":
            centrePoint.unemploymentSelection()
            break
          case "riskFactors":
            centrePoint.riskFactorSelection();
            break;
          default:
            break;
        }
      }

      setHeaderTitle();
    }
  };

  centrePoint.createPdf = function(){
      //alert(activeFeatureId)
      //webix.ajax().get("/featurePdf/" + activeFeatureId)
      window.location.href = "/featurePdf/" + activeFeatureId

  }

  centrePoint.createMail = function(){

      var pdfUrl = document.location.origin + "/featurePdf/" + activeFeatureId;
      var appUrl = document.location.origin

      //var bodyText = Please have a look at Centerpoint's <a href=" + pdfUrl + ">fact sheet</a> about youth homelessness in your area.</p>" +
      //    "<p>And visit the <a href=" + appUrl + ">full app</a>.</p>"
      //    "<div>"

      window.location = "mailto: ?subject=Youth homelessness in your area &body=" + "bodyText"
  }

  centrePoint.buildShareLinks = function () {

      var stArr = [
          'st_twitter_large',
          'st_email_large',
          'st_linkedin_large',
          'st_facebook_large',
          'st_googleplus_large',
          'st_sharethis_large'
      ]

      var st_title = 'Centrepoint youth homelessness in numbers'
      var st_summary = 'Investigate your local area with Centrepoint`s new youthhomelessness app.'
      console.log(st_title)

      for(var index in stArr){
          var ele = document.createElement("div");
          ele.innerHTML = "<span class=" + stArr[index] + " st_title='" + st_title + "' st_summary='" + st_summary + "'></span>"
          $$("shareContainer")._contentobj.appendChild(ele.firstChild);
      }

      stButtons.locateElements();
  }

  centrePoint.onSourceClick = function() {
    $$("sourceDetailsButton").hide()
    showView("source");
  };

  centrePoint.onLegendClick = function() {
    showView("legend");
  };

  // Enable webix debugging.
  webix.debug = true;

  // Include ui elements.
//  webix.require("../javascripts/webix-ui.js");

  webix.ready(function() {
    if (centrePoint.useTouch) {
      // On a touch-screen device.
      webix.Touch.limit();
      webix.ui.fullScreen();

      // Create the webix ui.
      webix.ui(centrePoint.uiMainLayout);
    } else {
      // On an non-touch screen device.
      webix.ui(centrePoint.uiPageLayout);
      //var shareEle = document.getElementById("shareText");
      //shareEle.style.display = "inline";
      //shareEle.style.marginLeft = $$("$spacer1").$width + $$("$layout3").$width - 135 + "px";
      //shareEle.style.top = "10px";

    }

    webix.ui(centrePoint.uiSharePopup)

    // Add an overlay for the 'loading' icon.
    webix.extend($$("homelessnessMap"), webix.ProgressBar);

    $$("viewAccordion").attachEvent("onAfterExpand",  centrePoint.accordionViewChanged);

    activeFeatureId = preLoadFeature;



    showView(preLoadView);
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

    //alert("here")
    var title = "";
    switch (activeMap) {
      case "homelessness":
        var index = $$("homelessnessDateSlider").getValue();
        title = "Official youth homelessness"; // + aDates[index][0] + "/" + aDates[index][1];
        break;
      case "missing":
        title = "How much data is missing";
        break;
      case "unemployment":
        title = "Youth unemployment";
        break;
      case "riskFactors":
        title = "Related factors";
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

  function loadMap() {
    if (!centrePoint.mapInitialised) {
      if(centrePoint.useTouch) {
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
        webix.ui(centrePoint.uiFloatingSearch);
      }

      //add ocdp logo
      var ele = document.createElement("div");
      ele.innerHTML = "<div class='ocdp_floating_logo'><a target='_blank', href='http://nquiringminds.com/'><img src='/images/ocdp.png' /></div>";
      $$("homelessnessMap")._contentobj.appendChild(ele.firstChild);


      //ele = document.createElement("div");
      //ele.innerHTML = "<div class='cp_floating_key' id='keyBox' />";
      //$$("homelessnessMap")._contentobj.appendChild(ele.firstChild);

      // Create the legend ui
      //webix.ui(centrePoint.uiLegendButton);

      // Add listeners for click, hover and idle events.
      var gmap = $$("homelessnessMap").map;
      gmap.data.addListener('mouseover', onMouseOverMap);
      gmap.data.addListener('mouseout', onMouseOffMap);
      gmap.data.addListener('click', onFeatureClick);
      gmap.addListener('idle', clearMapBusy);

      // Initialise the map data.
      initialiseMap(gmap);
      centrePoint.mapInitialised = true;


      //set zoom
      //gmap.setOptions({zoom: mapZoom()});

      centrePoint.accordionViewChanged();
    }
  }

  function onMouseOverMap(event) {
    if (!webix.env.touch) {
      activeFeatureId = event.feature.getProperty('geo_code');
      activeFeatureName = event.feature.getProperty('geo_label');
      console.log(activeFeatureName)
      setHeaderTitle();
    }
  }

  function onMouseOffMap(event) {
    if (!webix.env.touch) {
        activeFeatureId = "";
        activeFeatureName = "";
        setHeaderTitle();
    }
  }

  function onFeatureClick(event){
    //save active view name
    if (false === $$("homelessnessView").config.collapsed) {
      lastActiveView =  $$("homelessnessView");
    } else if (false === $$("missingView").config.collapsed) {
      lastActiveView = $$("missingView");
    } else if (false === $$("unemploymentView").config.collapsed) {
      lastActiveView = $$("unemploymentView");
    } else {
        lastActiveView = $$("riskFactorsView");
    }

    $$("homelessnessView").collapse();
    $$("missingView").collapse();
    $$("unemploymentView").collapse();
    $$("riskFactorsView").collapse();
    $$("blankView").expand();


    // Get feature details.
    activeFeatureId = event.feature.getProperty('geo_code');
    activeFeatureName = event.feature.getProperty('geo_label');

    window.history.pushState(null,null,"/feature/" + activeFeatureId);

    showView("feature");
  }

  function showView(view) {
    $$("mapButton").show();
    $$("mapButtonRight").show();
    $$("shareButton").show()
    $$("shareButtonRight").show()
    //$$("mailButton").show();
    //$$("mailButtonRight").show();
    $$("pdfButton").show();
    $$("resetButton").hide();
    $$("viewAccordion").show();



    switch(view) {
      case "map":
        $$("mapButton").hide();
        $$("mapButtonRight").hide();
        $$("shareButtonRight").hide()
        //$$("mailButton").hide();
        //$$("mailButtonRight").hide();
        $$("pdfButton").hide();
        $$("resetButton").show();
        $$("mainPanelView").setValue("homelessnessMap");
        loadMap();
        window.history.pushState(null, null, "/");
        break;
      case "feature":
        // Get feature view to render with new selection.
        //$$("mailButton").show();
        $$("homelessnessFeatures").refresh();
        // Make sure feature view is visible.
        $$("homelessnessFeatureView").scrollTo(0,0);
        $$("mainPanelView").setValue("homelessnessFeatureView");
        break;
      case "source":
        $$("mapButtonRight").hide();
        $$("pdfButton").hide();
        $$("mainPanelView").setValue("sourceView");
        break;
      case "welcome":
        $$("mapButtonRight").hide();
        $$("pdfButton").hide();
        $$("viewAccordion").hide();
        $$("mainPanelView").setValue("welcomeView");
        window.history.pushState(null,null,"/welcome");
        break;
      case "legend":
        $$("mapButtonRight").hide();
        $$("pdfButton").hide();
        $$("mainPanelView").setValue(activeMap + "KeyView");
        break;
    }

    //--Hack to over ride webix javascript coding of margin and height
    //var aBtns = [$$("mapButton"), $$("resetButton"), $$("mailButton"), $$("pdfButton")];
    var aBtns = [$$("mapButton"), $$("resetButton"), $$("pdfButton"), $$("shareButton")];
    //var aBtns = [$$("mapButton"), $$("resetButton"), $$("pdfButton")];
    for(var index in aBtns){
        var ele = aBtns[index];
        ele._contentobj.style["margin-top"] = "0px";
        ele._contentobj.style["height"] = "30px";
        ele._contentobj.childNodes[0].style["height"] = "30px";

    }



    //
    //$$("resetButton")._contentobj.style["margin-top"] = "0px";
    //$$("resetButton")._contentobj.style["height"] = "30px";
    //$$("resetButton")._contentobj.childNodes[0].style["height"] = "30px";

    setHeaderTitle();
  }
}());

