var ZoneMarker = require('./zonemarker')
var Zone = require('./zone')

var renderHourMarks = function(paper){ 
  var sixam = paper.path("M270,60L270,100");
  var sixam_label = paper.text(270,50,"6am").attr({font: "12px Arial"});
  var noon = paper.path("M450,60,L450,100");
  var non_label = paper.text(450,50, "12pm").attr({font: "12px Arial"});
  var sixpm = paper.path("M630,60,L630,100");
  var sixpm_label = paper.text(630,50, "6pm").attr({font: "12px Arial"});
}

var shadeNight = function(paper) {
  //TODO Make this dynamic
  paper.rect(90,40,200,60).attr({stroke:"#888", fill: "#888", opacity: "0.5"});
  paper.rect(610,40,200,60).attr({stroke:"#888", fill: "#888", opacity: "0.5"});
}


paper = Raphael("zoneslider",900,200);
timeline = paper.rect(90,40,720,60);
timeline.attr("stroke", "#ccc");

renderHourMarks(paper);
shadeNight(paper);

var nyc = new Zone("NYC", -5);
var nycMarker = new ZoneMarker(timeline, nyc);
var london = new Zone("London", 0);
var londonMarker = new ZoneMarker(timeline, london);
var taipei = new Zone("Taipei", 8);
var taipeiMarker = new ZoneMarker(timeline, taipei);
//var berlin = new Zone("Berlin", 1);
//var berlinMarker = new ZoneMarker(timeline, berlin);


var allMarkers = [];
allMarkers.push(nycMarker);
allMarkers.push(londonMarker);
allMarkers.push(taipeiMarker);
//allMarkers.push(berlinMarker);
//
$("#reset").click(function() { 
  publish("reset");
});

$("#am-pm-format").click(function() {
  publish("timeformat.ampm");
});

$("#mil-format").click(function() {
  publish("timeformat.mil");
});

//function tick() {
//  publish("tick");
//}

//window.setInterval(tick, 1000);


