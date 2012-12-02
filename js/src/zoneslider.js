var ZoneMarker = require('./zonemarker');
var Zone = require('./zone');
var TimeUtil = require('./time-util');
var TimelineMarker = require('./TimelineMarker');

var dayMarks = function(paper){ 
  var sixam = paper.path("M270,60L270,100");
  var sixam_label = paper.text(270,50,"6am").attr({font: "12px Arial"});
  var noon = paper.path("M450,60,L450,100");
  var non_label = paper.text(450,50, "noon").attr({font: "12px Arial"});
  var sixpm = paper.path("M630,60,L630,100");
  var sixpm_label = paper.text(630,50, "6pm").attr({font: "12px Arial"});
}

paper = Raphael("zoneslider",900,600);
today = paper.rect(300,40,300,60);
today.attr({"stroke": "#aaa", "fill": "#fff"});
yesterday = paper.rect(000,40,300,60);
yesterday.attr({"stroke": "#aaa", "fill": "#fff"});
tomorrow= paper.rect(600,40,300,60);
tomorrow.attr({"stroke": "#aaa", "fill": "#fff"});

timeline_dragger = paper.rect(0,40, 900, 60);
timeline_dragger.attr({"fill": "#00ff00", "opacity":0.1});

var now = new Date();
var todayDate = new Date(now.getUTCFullYear(), 
                                now.getUTCMonth(), 
                                now.getUTCDate(),0,0,0);

var today_marker = new TimelineMarker(today,todayDate);
var yesterday_marker = new TimelineMarker(yesterday, TimeUtil.addSeconds(todayDate, -86400));
var tomorrow_marker = new TimelineMarker(tomorrow, TimeUtil.addSeconds(todayDate, 86400));

//renderHourMarks(paper);
//shadeNight(paper);

function timeline_drag_start() {
  console.log("timeline drag start");
  publish("drag.start");
}

function timeline_drag_end() {
  //Reset the invisible drag box
  //timeline.attr({x:0});
  console.log("timeline drag end");
  publish("drag.end");
}

function timeline_dragging(dx,dy) {
  moveDayMarkers(dx);
  // Invert dx before we publish so that the movement is more natural:
  // if I drag right (positive dx), I should be going back in time.
  publish("drag", [-1*dx,dy]);
};

function moveDayMarkers(dx) {
}

timeline_dragger.drag(timeline_dragging, timeline_drag_start, timeline_drag_end);

var allMarkers = [];

plotCity("NYC", -18000);
plotCity("London", 0);
plotCity("Taipei", 28800);

$("#reset").click(function() { 
  publish("reset");
});

$("#am-pm-format").click(function() {
  publish("timeformat.ampm");
});

$("#mil-format").click(function() {
  publish("timeformat.mil");
});

var searchResults = [];

function plotCity(name, offset) {
  var zone = new Zone(name, offset);
  var baseTime = allMarkers.length > 0 ? allMarkers[0].utcTime() : TimeUtil.nowInUtc();
  var timeformat = allMarkers.length > 0 ? allMarkers[0].timeformat  : "ampm";
  var marker = new ZoneMarker(today, zone, baseTime,timeformat);
  var markerAbove = null;
  for(var i = 0; i < allMarkers.length; i++) {
    var existingMarker = allMarkers[i];
    var existingBBox = existingMarker.labelBox.getBBox();
    var newMarkerBBox = marker.labelBox.getBBox();
    console.log("Comparing " + existingMarker.zone.name + " with " + marker.zone.name);
    if(Raphael.isBBoxIntersect(newMarkerBBox, existingBBox)){
      console.log("Intersection");
      markerAbove = existingBBox;
      var pixelsToMoveDown = markerAbove['height'] + 10;
      marker.moveDown(80);
    }
  }

  allMarkers.push(marker);

  //TODO handle when cities are in the same zone
}

$("#city-search").typeahead({
  source: function(query, process) {
    return $.get('search', {q: query}, function(data) {
      searchResults = data.results;
      var names = [];
      for(var i = 0; i < data.results.length; i++) {
        names.push(data.results[i].name + ", " + data.results[i].country);
      }
      return process(names);
    });
  },
  minLength: 3,
  updater: function(item) {
    var splitAt = item.indexOf(",");
    var name = item.substring(0, splitAt);
    var country = item.substring(splitAt+2);
    for(var i = 0; i < searchResults.length; i++) {
      var candidate = searchResults[i];
      if(name == candidate.name && country == candidate.country) {
        console.log("plotting " + candidate.name);
        plotCity(candidate.name, candidate.offset);
      }
    }
  }
});

