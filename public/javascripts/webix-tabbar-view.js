/**
 * Created by toby on 13/05/15.
 */

// Visualisation layout for the tab-bar approach.
var uiVisualisation = {
  rows: [
    {
      view: "tabbar",
      css: "cp_mainTabs",
      multiview: true,
      fitBiggest: true,
      optionWidth: 100,
      type:" bottom",
      options: [
        { id: "homelessnessPanel", width: 120, value: "Youth homelessness" },
        { id: "missingPanel", width: 160, value: "Missing data"},
        { id: "riskFactorsPanel", value: "Risk factors" }
      ]
    },
    {
      view: "multiview",
      cells: [
        uiHomelessnessPanel,
        uiMissingPanel,
        uiRiskFactorsPanel
      ]
    }
  ]
}