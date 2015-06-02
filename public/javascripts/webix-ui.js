/**
 * Created by toby on 13/05/15.
 *
 * UI components.
 */

if (typeof window.centrePoint === "undefined") {
  centrePoint = {};
}
centrePoint.barHeight = 35;

// Search form used in non-touch scenarios.
centrePoint.uiSearchForm = {
  rows: [
    {},
    { view: "search", placeholder: "search", on: { onChange: findAddress } },
    {}
  ]
};

centrePoint.uiFloatingSearch = {
  view: "search",
    container: "searchBox",
  placeholder: "search",
  on: { onChange: findAddress }
};

// Header used in non-touch scenarios.
centrePoint.uiHeader = {
  height: 80,
  css: "cp_header",
  cols: [
    { view: "label", css: "cp_logo", width: 170, template: "<a target='_blank', href='http://centrepoint.org.uk/'><img src=\"/images/logo.png\" alt=\"centre point logo\" /></a>"},
    {},
    centrePoint.uiSearchForm
  ]
};

centrePoint.uiLegendButton = {
  view: "button",
  type: "iconButton",
  icon: "key",
  label: "key",
  width: 70,
  container: "keyBox",
  on: { onItemClick: centrePoint.onLegendClick }
};

//************************************************************************
// Youth homelessness UI
//************************************************************************

// Side-bar ui for youth homelessness.
centrePoint.uiHomelessnessSideBar = {
  id: "homelessness",
  view: "scrollview",
  scroll: "y", //webix.env.touch ? "y" : false,
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
            value: aDates.length - 1,
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
      },
      {}
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
    autoheight: true,
    template: centrePoint.renderFeatureInfo
  }
};

// Main map view.
centrePoint.uiHomelessnessMap = {
  id: "homelessnessMap",
  view: "google-map"
};

centrePoint.uiSourceView = {
  id: "sourceView",
  view: "scrollview",
  scroll: "y",
  body: {
    autoheight: true,
    template: "html->sourceView"
  }
};

centrePoint.uiWelcomeView = {
  id: "welcomeView",
  type: "clean",
  rows: [
    {
      template: "html->welcomeInfo"
    },
    {
      view: "button",
      label: "got it!",
      width: 200,
      align: "center",
      on: { onItemClick: centrePoint.accordionViewChanged }
    },
    {
      gravity: 0.01
    }
  ]

};

centrePoint.uiHomelessnessKeyView = {
  id: "homelessnessKeyView",
  template: "html->homelessnessKeyText"
};

centrePoint.uiMissingKeyView = {
  id: "missingKeyView",
  template: "html->missingKeyText"
};

centrePoint.uiUnemploymentKeyView = {
  id: "unemploymentKeyView",
  template: "html->unemploymentKeyText"
};

centrePoint.uiRiskFactorsKeyView = {
  id: "riskFactorsKeyView",
  template: "html->riskFactorsKeyText"
};

//************************************************************************
// Missing data UI
//************************************************************************

// Missing data side-bar.
centrePoint.uiMissingSideBar = {
  id: "missing",
  template: "html->missingDataInfoText"
};

//************************************************************************
// Unemployment UI
//************************************************************************

// UNemployment selection form, shown in the left-hand side-bar.
centrePoint.uiUnemploymentSideBar = {
    view: "form",
    id: "unemploymentForm",
    css: "cp_unemploymentForm",
    type: "clean",
    padding: 4,
    scroll: "y",
    elementsConfig: {
        gravity: 5,
        on: {onItemClick: centrePoint.unemploymentSelection},
        labelWidth: 225
    },
    elements: [
        {template: "html->unemploymentInfoText", height: 100, css: "cp_unemploymentIntro" },
        {view: "checkbox", label: "Total youth unemployment", on: {onItemClick: centrePoint.unemploymentSelectAll}},
        {
            view: "checkbox",
            id: "un_unemployment_over12m",
            name: "unemployment_over12m",
            label: "Over 12 months",
            value: 1
        },
        {
            view: "checkbox",
            id: "un_unemployment_6-12m",
            name: "unemployment_6-12m",
            label: "6 to 12 months"
        },
        {
            view: "checkbox",
            id: "un_unemployment_0-6m",
            name: "unemployment_0-6m",
            label: "Under 6 months"
        }


    ]
};

//************************************************************************
// Risk factor UI
//************************************************************************

// Risk factor selection form, shown in the left-hand side-bar.
centrePoint.uiRiskFactorsSideBar = {
  view: "form",
  id: "riskFactorsForm",
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
      //{view: "checkbox", label: "Select all", on: {onItemClick: centrePoint.riskFactorSelectAll}},
      {template: "html->riskFactorInfoText", height: 60, css: "cp_riskFactorIntro" },
      {view: "button", value: "more details...", on: { onItemClick: centrePoint.onSourceClick }},
      {template: "Economy", type: "section"},
      {
          view: "checkbox",
          id: "rf_unemployment_total",
          name: "unemployment_total",
          label: "Youth unemployment"
      },
      {template: "Social care", type: "section"},
      {view: "checkbox", id: "rf_care", name: "care", label: "Children in care"},
      {template: "Environment", type: "section"},
      {view: "checkbox", id: "rf_deprivation", name: "deprivation", label: "Index of deprivation"},
      {template: "Education", type: "section"},
      {
          view: "checkbox",
          id: "rf_education_level3",
          name: "education_level3",
          label: "2 or more A levels or equivalent"
      },
      {
          view: "checkbox",
          id: "rf_education_attainment_gap",
          name: "education_attainment_gap",
          label: "Achievement gap"
      },
      {view: "checkbox", id: "rf_apprenticeship", name: "apprenticeship", label: "Apprenticeship starts"},
      {view: "checkbox", id: "rf_truancy", name: "truancy", label: "Persistent truancy"},
      {template: "Health", type: "section"},
      {view: "checkbox", id: "rf_hospital", name: "hospital", label: "Hospital admissions (under 24s)"},
      {
          view: "checkbox",
          id: "rf_mentalhealth",
          name: "mentalhealth",
          label: "Mental health problems (all ages)"
      },
      {}
  ]
};

//************************************************************************
// Main UI
//************************************************************************

centrePoint.uiMainLayout = {
  id: "rootLayout",
  type: "line",
  rows: [
    {
      responsive: "rootLayout",
      type: "line",
      cols: [
        {
          rows: [
            {
              id: "mainHeader",
              view: "toolbar",
              height: centrePoint.barHeight,
              elements: [
                { view: "button", id: "mapButton", type: "iconButton", icon: "chevron-left", label: "map", width: 80, on: { onItemClick: centrePoint.accordionViewChanged } },
                { view: "label", id: "featureLabel", label: "Official youth homelessness"},
                { view: "button", id: "resetButton", type: "iconButton", icon: "refresh", label: "reset map", width: 110, on: { onItemClick: resetMap } }
              ]

            },
            {
              id: "mainPanelView",
              view: "multiview",
              fitBiggest: true,
              cells: [
                centrePoint.uiHomelessnessMap,
                centrePoint.uiHomelessnessFeatureView,
                centrePoint.uiSourceView,
                centrePoint.uiHomelessnessKeyView,
                centrePoint.uiMissingKeyView,
                centrePoint.uiUnemploymentKeyView,
                centrePoint.uiRiskFactorsKeyView,
                centrePoint.uiWelcomeView
              ]
            }
          ]
        },
        {
          view: "accordion",
          id: "viewAccordion",
          minWidth: 310,
          gravity: 0.01,
          type: "line",
          multi: false,
          rows: [
            {
              header: "Official youth homelessness",
              id: "homelessnessView",
              headerAltHeight: centrePoint.barHeight,
              headerHeight: centrePoint.barHeight,
              body: centrePoint.uiHomelessnessSideBar
            },
            {
              header: "How much data is missing",
              id: "missingView",
              headerAltHeight: centrePoint.barHeight,
              headerHeight: centrePoint.barHeight,
              collapsed: true,
              body: centrePoint.uiMissingSideBar
            },
            {
              header: "Youth unemployment",
              id: "unemploymentView",
              headerAltHeight: centrePoint.barHeight,
              headerHeight: centrePoint.barHeight,
              collapsed: true,
              body: centrePoint.uiUnemploymentSideBar
            },
            {
              header: "Related factors",
              id: "riskFactorsView",
              headerAltHeight: centrePoint.barHeight,
              headerHeight: centrePoint.barHeight,
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
