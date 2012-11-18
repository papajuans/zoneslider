var ZoneMarker = require('./zonemarker')
var Zone = require('./zone')

window.paper = Raphael("zoneslider",900,200);
window.timebox = paper.rect(20,20,860,60);
timebox.attr("stroke", "#ccc");

var renderHourMarks = function(paper){ 
  var sixam = paper.path("M235,40L235,80");
  var sixam_label = paper.text(235,30, "6am").attr({font: "12px Arial"});
  var noon = paper.path("M445,40,L445,80");
  var non_label = paper.text(445,30, "12pm").attr({font: "12px Arial"});
  var sixpm = paper.path("M655,40,L655,80");
  var sixpm_label = paper.text(655,30, "6pm").attr({font: "12px Arial"});
}

renderHourMarks(paper);

var nyc = new Zone("NYC", -5);
var nycMarker = new ZoneMarker(paper, nyc);
nycMarker.draw();
nycMarker.wireDragging();

var london = new Zone("London", 0);
var londonMarker = new ZoneMarker(paper, london);
londonMarker.draw();
londonMarker.wireDragging();

var taipei = new Zone("Taipei", 8);
var taipeiMarker = new ZoneMarker(paper, taipei);
taipeiMarker.draw();
taipeiMarker.wireDragging();

