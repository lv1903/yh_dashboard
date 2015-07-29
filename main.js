"use strict";

var express = require("express");
var jade = require("jade");
var bodyParser = require("body-parser");
var app = express();

var phantom = require('phantom');
var fs = require('fs');
var path = require('path');

app.set("views", __dirname + "/views");
app.set("view engine","jade");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({limit: (5*1024*1000) }));

var mapStyle = require("./data/styledmap.json");
var oLaTopo = require("./data/yhLaTopo.json");
var sQuarter = "2015Q1";

var cdo = require("./create_data_objects.js");

cdo.getDataObjects(function(oEntities, oNational) {
  console.log("got data objects");

  var dProblemBoundaries = {
      "E07000242": "pb",
      "E06000057": "pb",
      "E07000240": "pb",
      "E07000241": "pb",
      "E07000243": "pb"
  };

  app.get("/", function(req,res) {
    res.render("welcome");
  });

  app.get('/feature/:id', function(req, res) {
    var featureId = req.params["id"];

    res.render("webix", {
      activeView: "feature",
      quarter: sQuarter,
      mapStyle: mapStyle,
      topoLa: oLaTopo,
      entities: oEntities,
      national: oNational,
      activeFeature: featureId
    });
  });

  app.get('/ajaxFeature/:id', function(req, res) {

      var id = req.params["id"];

      // if(dProblemBoundaries.hasOwnProperty(id)) {
          // res.render('feature_error')

      // } else {

          var oData = oEntities[id];
          res.render('feature', {
              oData: oData,
              oNational: oNational
          })
      // }
  });

  app.get('/local/:id', function(req, res){
    var id = req.params["id"];
    var oData = oEntities[id];

    var yhCount = oData.homeless_data["2015Q1"].p1e.count;
    console.log(yhCount);
    console.log("local");

    res.render('localHead', {
      activeView: "feature",
      oData: oData,
      oNational: oNational
    })
  });

  app.get("/explore", function(req, res, next) {
    res.render('webix', {
      activeView: "map",
      quarter: sQuarter,
      mapStyle: mapStyle,
      topoLa: oLaTopo,
      entities: oEntities,
      national: oNational
    });
  });

  app.get("/featurePdf/:id", function(req, res) {
    var viewportSize = { width: 600, height: 600 };
    var paperSize = { format: "A4",
      orientation: 'portrait',
      margin: '1cm'
    };

    var zoomFactor = 1;

    var arrSet = [
      ['paperSize', paperSize],
      ['viewportSize', viewportSize],
      ['zoomFactor', zoomFactor]
    ];

    var nextSet = function(page, index, arrSet, callback){
      if(index < arrSet.length){
        page.set(arrSet[index][0], arrSet[index][1], function(res){
          nextSet(page, index+1, arrSet, callback)
        })
      } else {
        callback(page)
      }
    };

    var id = req.params["id"];

    var address = req.protocol + '://' + req.get('host') + '/local/' + id;
    console.log(address);

    var output = 'centrePoint_' + id + '_' + Date.now() + '.pdf';
    var download_output = 'centrePoint_' + id  + '.pdf'

    var file = path.join(__dirname, "tmp/" + output);

    phantom.create(function (ph) {
        console.log("creating page")
        ph.createPage(function (page) {
            page.open(address, function (status) {
                nextSet(page, 0, arrSet, function(page){
                    console.log("rendering page")
                    page.render("tmp/" + output, function(result){
                        console.log("pdf: " + file)
                        res.download(file, download_output, function(err){
                          if(err){console.log(err.message)}
                          fs.unlink(file)
                        })
                    })
                });
            });
        })
    }, {
        dnodeOpts: { //only for MS
            weak: false
        }
    });
  })
});

app.listen(3004);
