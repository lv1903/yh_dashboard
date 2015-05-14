/**
 * Created by toby on 13/05/15.
 */

// Enable webix debugging.
//webix.debug = true;

// Include ui elements common to all layout alternatives.
webix.require("../javascripts/webix-common.js");

// Uncomment this line to use traditional tabs to switch views.
//webix.require("../javascripts/webix-tabbar-view.js");

// Uncomment this line to use 'segmented' buttons to switch views.
webix.require("../javascripts/webix-segmented-view.js");

webix.ready(function() {
  var mainLayout;

  // Choose the main layout configuration based on whether or not we're running on a touch-enabled device.
  // REVIEW: It's probably preferable to choose based on screen width, as many PCs are now touch-enabled.
  if (webix.env.touch) {
    // This is the layout for touch-enabled devices.
    // There is no width restriction and it uses a slightly smaller header.
    mainLayout = {
      view: "layout",
      type: "clean",
      rows: [
        uiTouchHeader,
        uiVisualisation
      ]
    };
    webix.ui.fullScreen();
  } else {
    // This the layout used for non-touch devices (i.e. PCs)
    // The width is restricted to standard 976px - seems to suit the shape of the UK.
    mainLayout = {
      view: "layout",
      type: "space",
      cols: [
        {},
        {
          width: 976,
          rows: [
            uiHeader,
            uiVisualisation
          ]
        },
        {}
      ]
    };
  }

  // Create the webix ui.
  webix.ui(mainLayout);

  // Initialise the options on the google map.
  $$("homelessnessMap").map.setOptions({
    styles: mapStyle,
    disableDefaultUI: true,
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL,
      position: google.maps.ControlPosition.TOP_RIGHT
    }
  });

  // Initialise the map data.
  initialiseMap();

  // Force initial date selection.
  homelessnessDateChange(0);
});

