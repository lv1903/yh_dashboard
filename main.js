"use strict";
var express = require("express");
var jade = require("jade");
var bodyParser = require("body-parser");
var app = express();

app.set("views", __dirname + "/views");
app.set("view engine","jade");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({limit: (5*1024*1000) }));

var mapStyle = require("./data/styledmap.json");
var oLaTopo = require("./data/yhLaTopo.json");
var sQuarter = "2014Q4";

var cdo = require("./create_data_objects.js");

cdo.getDataObjects(function(oEntities, oNational) {
  console.log("got data objects");

  app.get("/", function(req,res) {
    res.render("webix", {
      quarter: sQuarter,
      mapStyle: mapStyle,
      topoLa: oLaTopo,
      entities: oEntities,
      national: oNational
    });
  });

  app.get('/feature/:id', function(req, res) {
    var id = req.params["id"];
    var oData = oEntities[id];

    var yhCount = oData.homeless_data["2014Q4"].p1e.count;
    res.render('feature', {
      oData: oData,
      oNational: oNational
    })
  });

  app.get('/local/:id', function(req, res){
    var id = req.params["id"];
    var oData = oEntities[id];

    var yhCount = oData.homeless_data["2014Q4"].p1e.count;
    console.log(yhCount);
    console.log("local");

    res.render('localHead', {
      oData: oData,
      oNational: oNational
    })
  });
});

app.listen(3004);
