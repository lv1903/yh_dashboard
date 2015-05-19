/**
 * Created by toby on 13/05/15.
 *
 * UI components.
 */

if (typeof window.centrePoint === "undefined") {
  centrePoint = {};
}

// Search form used in non-touch scenarios.
centrePoint.uiSearchForm = {
  rows: [
    {},
    { view: "search", placeholder: "search", on: { onChange: findAddress } },
    {}
  ]
};

// Header used in non-touch scenarios.
centrePoint.uiHeader = {
  height: 80,
  css: "cp_header",
  cols: [
    { view: "label", css: "cp_logo", width: 170, template: "<a href=\"/\"><img src=\"/images/logo.png\" alt=\"centre point logo\" /></a>"},
    {},
    centrePoint.uiSearchForm
  ]
};

//************************************************************************
// Youth homelessness UI
//************************************************************************

// Side-bar ui for youth homelessness.
centrePoint.uiHomelessnessSideBar = {
  id: "homelessness",
  view: "scrollview",
  scroll: webix.env.touch ? "y" : false,
  body: {
    rows: [
      {
        cols: [
          {view: "label", label: "2012", width: 40, align: "right" },
          {
            view: "slider",
            id: "homelessnessDateSlider",
            step: 1,
            min: 0,
            max: aDates.length - 1,
            value: 0,
            title: centrePoint.getDataDateTitle,
            on: { onChange: centrePoint.onDataDateChange }
          },
          {view: "label", label: "2014", width: 40, align: "left" }
        ]
      },
      {
        borderless: true,
        autoheight: true,
        template: "html->homelessnessInfoText"
      }
    ]
  }
};

// Contains the info-graphic when a feature is clicked.
centrePoint.uiHomelessnessFeatureView = {
  id: "homelessnessFeatureView",
  view: "scrollview",
  scroll: "y",
  body: {
        id: "homelessnessFeatures",
        view: "template",
        minWidth: 200,
        maxWidth: 800,
        autoheight: true,
        template: centrePoint.renderFeatureInfo
  }
};

// Main map view.
centrePoint.uiHomelessnessMap = {
  id: "homelessnessMap",
  view: "google-map",
  minWidth: 300
};

//************************************************************************
// Missing data UI
//************************************************************************

// Missing data side-bar.
centrePoint.uiMissingSideBar = {
  id: "missing",
  borderless: true,
  template: "html->missingDataInfoText"
};

//************************************************************************
// Risk factor UI
//************************************************************************

// Risk factor selection form, shown in the left-hand side-bar.
centrePoint.uiRiskFactorsSideBar = {
  view: "form",
  id: "riskFactors",
  css: "cp_riskFactorForm",
  type: "clean",
  padding: 4,
  scroll: "y",
  elementsConfig: {
    gravity: 5,
    on: {onItemClick: centrePoint.riskFactorSelection},
    labelWidth: 225
  },
  elements: [
      { view: "checkbox", label: "Select all", on: { onItemClick: centrePoint.riskFactorSelectAll } },
      { template: "Social care", type: "section" },
      { view: "checkbox", id:"rf_care", name:"care", label: "Children in care" },
      { template: "Environment", type: "section" },
      { view: "checkbox", id:"rf_deprivation", name: "deprivation", label: "Index of deprivation" },
      { template: "Education", type: "section" },
      { view: "checkbox", id: "rf_education_level3", name: "education_level3", label: "2 or more A levels or equivalent" },
      { view: "checkbox", id: "rf_education_attainment_gap", name: "education_attainment_gap", label: "Achievement gap" },
      { view: "checkbox", id: "rf_apprenticeship", name: "apprenticeship", label: "Apprenticeship starts" },
      { view: "checkbox", id: "rf_truancy", name: "truancy", label: "Persistent truancy" },
      { template: "Health", type: "section" },
      { view: "checkbox", id: "rf_hospital", name: "hospital", label: "Hospital admissions (under 24s)" },
      { view: "checkbox", id: "rf_mentalhealth", name: "mentalhealth", label: "Mental health problems (all ages)" },
      { template: "Economy", type: "section" },
      { view: "checkbox", id: "rf_unemployment_total", name: "unemployment_total", label: "Youth unemployment" },
      {}
    ]
};

//************************************************************************
// Main UI
//************************************************************************

centrePoint.uiMainLayout = {
  id: "rootLayout",
  rows: [
    {
      type: "space",
      cols: [
        {
          minWidth: 300,
          rows: [
            {
              id: "mainHeader",
              view: "toolbar",
              elements: [
                { view: "button", id: "mapButton", type: "iconButton", icon: "chevron-left", label: "map", width: 70, on: { onItemClick: centrePoint.viewChanged } },
                { view: "label", id: "featureLabel", label: "youth homelessness"},
                { view: "button", id: "resetButton", type: "iconButton", icon: "reset", label: "reset", width: 100, on: { onItemClick: resetMap } }
              ]

            },
            {
              id: "mainPanelView",
              view: "multiview",
              cells: [
                centrePoint.uiHomelessnessMap,
                centrePoint.uiHomelessnessFeatureView
              ]
            }
          ]
        },
        {
          view: "accordion",
          id: "viewAccordion",
          width: 270,
          type: "line",
          multi: false,
          responsive: "rootLayout",
          rows: [
            {
              header: "Youth homelessness",
              id: "homelessnessView",
              body: centrePoint.uiHomelessnessSideBar
            },
            {
              header: "Missing data",
              id: "missingView",
              collapsed: true,
              body: centrePoint.uiMissingSideBar
            },
            {
              header: "Risk factors",
              id: "riskFactorsView",
              collapsed: true,
              body: centrePoint.uiRiskFactorsSideBar
            }
          ]
        }
      ]
    }
  ]
};

//************************************************************************
// Page layout for non-touch screen devices.
//************************************************************************
centrePoint.uiPageLayout = {
  rows: [
    {
      cols: [
        {},
        {
          gravity: 4,
          rows: [
            centrePoint.uiHeader,
            centrePoint.uiMainLayout
          ]
        },
        {}
      ]
    },
    {
      height: 20
    }
  ]
};
