var ZoneMarker = require('./zonemarker');
var Zone = require('./zone');
var TimeUtil = require('./time-util');
var DayBox = require('./daybox');

paper = Raphael("zoneslider",900,600);

var now = new Date();
var todayDate = new Date(now.getUTCFullYear(), 
                                now.getUTCMonth(), 
                                now.getUTCDate(),0,0,0);

var todayMarker = new DayBox(300,todayDate);
var yesterdayMarker = new DayBox(0, TimeUtil.addSeconds(todayDate, -86400));
var tomorrowMarker = new DayBox(600, TimeUtil.addSeconds(todayDate, 86400));

function timelineDrag_start() {
  console.log("timeline drag start");
  publish("drag.start");
}

function timelineDrag_end() {
  console.log("timeline drag end");
  publish("drag.end");
}

function timelineDragging(dx,dy) {
  // Invert dx before we publish so that the movement is more natural:
  // if I drag right (positive dx), I should be going back in time.
  publish("drag", [dx,dy]);
};

timelineDragger = paper.rect(0,40, 900, 60);
timelineDragger.attr({"fill": "#fff", "opacity":0});
timelineDragger.drag(timelineDragging, timelineDrag_start, timelineDrag_end);

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
  var marker = new ZoneMarker(todayMarker.timeline, zone, baseTime, timeformat);
  var isColliding = true;
  var step = 60;
  // Dumb overlap resolution: keep moving the marker down until you don't hit shit
  while(isColliding) {
    var newMarkerBBox = marker.labelBox.getBBox();

    if(allMarkers.length == 0) {
      break;
    }

    $.each(allMarkers, function(index, existingMarker) {
      var existingBBox = existingMarker.labelBox.getBBox();
      if(Raphael.isBBoxIntersect(newMarkerBBox, existingBBox)){
        isColliding = true;
        marker.moveDown(step);
        // collision, break out of $.each and move down 
        return false;
      } else {
        isColliding = false;
      }
    });

  }

  console.log(marker.zone.name + " y is " + marker.labelBox.attr("y"));

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

