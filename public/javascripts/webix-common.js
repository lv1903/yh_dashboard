/**
 * Created by toby on 13/05/15.
 *
 * UI components common to all layout scenarios.
 */

var uiSearchForm = {
  rows: [
    {},
    { view: "search", placeholder: "search", on: { onChange: findAddress } },
    {}
  ]
};

// Header used in non-touch scenarios.
var uiHeader = {
  height: 80,
  css: "cp_header",
  cols: [
    { view: "label", css: "cp_logo", width: 170, template: "<a href=\"/\"><img src=\"/images/logo.png\" alt=\"centre point logo\" /></a>"},
    {},
    uiSearchForm
  ]
};

// Header used on touch-enabled devices.
var uiTouchHeader = {
  height: 60,
  css: "cp_header",
  cols: [
    { view: "label", css: "cp_small_logo", width: 120, template: "<a href=\"/\"><img src=\"/images/logo.png\" alt=\"centre point logo\" /></a>"},
    {},
    uiSearchForm
  ]
};

//************************************************************************
// Youth homelessness UI
//************************************************************************

// Dynamically creates the label text for the date slider
function homelessnessDateTitle(slider) {
  var lookup = aDates[slider.value];
  return lookup[0] + " " + lookup[1];
}

// Re-loads the data based on the date slider value.
function homelessnessDateChange(index) {
  if ($$("homelessnessFeatureView").config.collapsed) {
    getData("P1E",index);
  } else {
    $$("homelessnessFeatures").refresh();
  }
}

// Handler to update the map while the slider is being dragged.
function homelessnessDateDrag() {
  var index = this.getValue();
  homelessnessDateChange(index);
}

// This is the side-bar ui for youth homelessness.
var uiHomelessnessFilterForm = {
  rows: [
    {
      cols: [
        {},
        { view: "slider", width: 275, step: 1, min: 0, max: 10, value: 0, title: homelessnessDateTitle, on: { onChange: homelessnessDateChange, onSliderDrag: homelessnessDateDrag } },
        {}
      ]
    },
    {
      cols: [
        { view: "label", label: "2012"},
        { width: 200 },
        { view: "label", label: "2014"}
      ]
    },
    {
      autoheight: true,
      borderless: true,
      template: "html->homelessnessInfoText"
    },
    {}
  ]
};

// This is the visualisation ui for youth homelessness.
// It consists of a map view and the infographic view, only one of
// which is visible at any time.
var uiHomelessnessVisualisation = {
  view: "accordion",
  multi: false,
  type: "clean",
  cols: [
    {
      header: "youth homelessness map",
      id: "homelessnessMapView",
      body: {
        id: "homelessnessMap",
        view: "google-map",
        zoom: 6,
        center: [53,-2.5]
      }
    },
    {
      id: "homelessnessFeatureView",
      collapsed: true,
      header: "youth homelessness details",
      body: {
        view: "scrollview",
        scroll: "y",
        body: {
          id: "homelessnessFeatures",
          view: "template",
          autoheight: true,
          template: getHomelessnessFeature
        }
      }
    }
  ]
};

// This is the main homelessness panel, combining the side-bar and the visualisation.
var uiHomelessnessPanel = {
  id: "homelessnessPanel",
  rows: [
    {
      responsive: "homelessnessPanel",
      cols: [
        {
          view: "accordion",
          type: "line",
          multi: false,
          cols: [
            {
              header: "select date",
              width: 294,
              body: uiHomelessnessFilterForm,
              collapsed: webix.env.touch
            },
            {
              header: false,
              body: uiHomelessnessVisualisation
            }
          ]
        }
      ]
    }
  ]
};


//************************************************************************
// Missing data UI
//************************************************************************

// Missing data side-bar.
var uiMissingFilterForm = {
  borderless: true,
  template: "html->missingDataInfoText"
};

// Missing data visualisation.
var uiMissingMap = {
  id: "missingMapView", view: "google-map", batch: "map", center: [54.300499, -2.109375]
};

// Main missing data panel - combines side-bar and visualisation.
var uiMissingPanel = {
  id: "missingPanel",
  rows: [
    {
      responsive: "missingPanel",
      cols: [
        {
          view: "accordion",
          id: "missingAccordion",
          type: "clean",
          multi: false,
          cols: [
            {
              header: "missing data",
              width: 294,
              body: uiMissingFilterForm,
              collapsed: webix.env.touch
            },
            {
              header: false,
              body: uiMissingMap
            }
          ]
        }
      ]
    }
  ]
};

//************************************************************************
// Risk factor UI
//************************************************************************
var uiRiskFactorLabelWidth = 230;

// Risk factor selection form, shown in the left-hand side-bar.
var uiRiskFactorFilterForm = {
  view: "scrollview",
  id: "riskFactorForm",
  css: "cp_riskFactorForm",
  scroll: "y",
  body: {
    rows: [
      { view: "checkbox", label: "Select all", labelWidth: uiRiskFactorLabelWidth},
      { template: "Social care", type: "section" },
      { view: "checkbox", label: "Children in care", labelWidth: uiRiskFactorLabelWidth },
      { template: "Environment", type: "section" },
      { view: "checkbox", label: "Index of deprivation", labelWidth: uiRiskFactorLabelWidth },
      { template: "Education", type: "section" },
      { view: "checkbox", label: "2 or more A levels or equivalent", labelWidth: uiRiskFactorLabelWidth },
      { view: "checkbox", label: "Achievement gap", labelWidth: uiRiskFactorLabelWidth },
      { view: "checkbox", label: "Apprenticeship starts", labelWidth: uiRiskFactorLabelWidth },
      { view: "checkbox", label: "Persistent truancy", labelWidth: uiRiskFactorLabelWidth },
      { template: "Health", type: "section" },
      { view: "checkbox", label: "Hospital admissions (under 24s)", labelWidth: uiRiskFactorLabelWidth },
      { view: "checkbox", label: "Mental health problems (all ages)", labelWidth: uiRiskFactorLabelWidth },
      { template: "Economy", type: "section" },
      { view: "checkbox", label: "Youth unemployment", labelWidth: uiRiskFactorLabelWidth },
      {}
    ]
  }
};

// Risk factor map.
var uiRiskFactorMap = {
  id: "riskFactorMapView", view: "google-map", batch: "map", center: [54.300499, -2.109375]
};

// Main risk factor panel - combines side-bar and visualisation.
var uiRiskFactorsPanel = {
  id: "riskFactorsPanel",
  rows: [
    {
      responsive: "riskFactorsPanel",
      cols: [
        {
          id: "riskFormAccordion",
          view: "accordion",
          type: "line",
          multi: false,
          cols: [
            {
              header: "build an index of risk factors",
              width: 285,
              body: uiRiskFactorFilterForm,
              collapsed: webix.env.touch
            },
            {
              header: false,
              body: uiRiskFactorMap
            }
          ]
        }
      ]
    }
  ]
};

