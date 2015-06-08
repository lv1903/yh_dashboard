"use strict";
var express = require("express");
var jade = require("jade");
var bodyParser = require("body-parser");
var app = express();



var phantom = require('phantom');
//var phantom = require('phantom-render-stream');
var fs = require('fs');
var path = require('path');
//var mime = require('mime');



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

var dProblemBoundaries = {
    "E07000242": "pb",
    "E06000057": "pb",
    "E07000240": "pb",
    "E07000241": "pb",
    "E07000243": "pb"
}

//--------pdf---------------
var viewportSize = { width: 600, height: 600 };
var paperSize = { format: "A4",
    orientation: 'portrait',
    margin: '1cm'
}
var zoomFactor = 1;

var arrSet = [
    ['paperSize', paperSize],
    ['viewportSize', viewportSize],
    ['zoomFactor', zoomFactor]
]

function nextSet(page, index, arrSet, callback){
    if(index < arrSet.length){
        page.set(arrSet[index][0], arrSet[index][1], function(res){
            nextSet(page, index+1, arrSet, callback)
        })
    } else {
        callback(page)
    }
}
//----------------------------



  app.get("/", function(req,res) {
    res.render("webix", {
      quarter: sQuarter,
      mapStyle: mapStyle,
      topoLa: oLaTopo,
      entities: oEntities,
      national: oNational
    });
  });

  app.use('/pdf', express.static(__dirname + '/localAreaPdf'));

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

      if(dProblemBoundaries.hasOwnProperty(id)) {
          res.render('feature_error')

      } else {

          var oData = oEntities[id];
          var yhCount = oData.homeless_data["2014Q4"].p1e.count;
          res.render('feature', {
              oData: oData,
              oNational: oNational
          })
      }
  });

  app.get('/local/:id', function(req, res){
    var id = req.params["id"];
    var oData = oEntities[id];

    var yhCount = oData.homeless_data["2014Q4"].p1e.count;
    console.log(yhCount);
    console.log("local");

    res.render('localHead', {
      activeView: "feature",
      oData: oData,
      oNational: oNational
    })
  });

  app.get('/related_factors', function(req, res){
      res.render('source', {
          activeFeature: "sources"
      })
  });

  app.get("/welcome", function(req, res, next) {
    res.render('webix', {
      activeView: "welcome",
      quarter: sQuarter,
      mapStyle: mapStyle,
      topoLa: oLaTopo,
      entities: oEntities,
      national: oNational
    });
  });

  app.get("/featurePdf/:id", function(req, res) {

      var id = req.params["id"];
      var address = 'http://dev1.ubiapps.com:3004/local/' + id;
      var output = 'centrePoint_' + id + '.pdf';


      phantom.create(function (ph) {
          ph.createPage(function (page) {
              page.open(address, function (status) {
                  nextSet(page, 0, arrSet, function(page){
                      page.render(output, function(result){

                          console.log('pdf ' + id)

                          var filename = output;
                          var filePath = "C:/dev/yh_dashboard/" + filename

                          console.log(filePath)

                          res.download(filePath)

                          //res.setHeader('Content-type', "application/pdf");
                          //fs.readFile(filePath, function (err, data) {
                          //    // if the file was readed to buffer without errors you can delete it to save space
                          //    if (err) throw err;
                          //    fs.unlink(filePath);
                          //    // send the file contents
                          //    res.send(data);
                          //    ph.exit();
                          //});


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
