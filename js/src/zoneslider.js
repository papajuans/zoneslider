var ZoneMarker = require('./zonemarker')
var Zone = require('./zone')

var renderHourMarks = function(paper){ 
  var sixam = paper.path("M270,60L270,100");
  var sixam_label = paper.text(270,50,"6am").attr({font: "12px Arial"});
  var noon = paper.path("M450,60,L450,100");
  var non_label = paper.text(450,50, "noon").attr({font: "12px Arial"});
  var sixpm = paper.path("M630,60,L630,100");
  var sixpm_label = paper.text(630,50, "6pm").attr({font: "12px Arial"});
}

var shadeNight = function(paper) {
  //TODO Make this dynamic?
  paper.rect(90,40,200,60).attr({stroke:"#888", fill: "#888", opacity: "0.5"});
  paper.rect(610,40,200,60).attr({stroke:"#888", fill: "#888", opacity: "0.5"});
}


paper = Raphael("zoneslider",900,200);
timeline = paper.rect(90,40,720,60);
timeline.attr("stroke", "#ccc");

renderHourMarks(paper);
shadeNight(paper);

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
  var marker = new ZoneMarker(timeline, zone);
  allMarkers.push(marker);
}

$("#city-search").typeahead({
  source: function(query, process) {
    return $.get('/search', {q: query}, function(data) {
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

//function tick() {
//  publish("tick");
//}

//window.setInterval(tick, 1000);


