/**
 * Created by toby on 13/05/15.
 */

// Visualisation layout for the segmented-button approach.
var uiVisualisation = {
  type: "clean",
  rows: [
    {
      view: "toolbar",
      css: "cp_mainTabs",
      elements: [
        {
          view: "segmented",
          multiview: true,
          align: "center",
          options: [
            { id: "homelessnessPanel", value: "Youth homelessness", width: 150 },
            { id: "missingPanel", value: "Missing data", width: 95 },
            { id: "riskFactorsPanel", value: "Risk factors", width: 95 }
          ]
        }
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
};