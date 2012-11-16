var paper = Raphael("zoneslider",900,200);
var timebox = paper.rect(20,20,860,60);
timebox.attr("stroke", "#ccc");

var renderHourMarks = function(paper){ 
  var sixam = paper.path("M235,40L235,80");
  var sixam_label = paper.text(235,30, "6am").attr({font: "12px Arial"});
  var noon = paper.path("M445,40,L445,80");
  var non_label = paper.text(445,30, "12pm").attr({font: "12px Arial"});
  var sixpm = paper.path("M655,40,L655,80");
  var sixpm_label = paper.text(655,30, "6pm").attr({font: "12px Arial"});
}

var zone1_x = 100;
var zone1 = paper.rect(zone1_x, 20, 1, 60).attr("stroke","#798BAB");
var zone1_label = paper.text(zone1_x, 100, "NYC").attr({font: "16px Arial"});

var zone2_delta = 144 //hardcoded nonsense
var zone2 = paper.rect(zone1_x + zone2_delta, 20, 1, 60).attr("stroke","#798BAB");
var zone2_label = paper.text(zone1_x + zone2_delta, 100, "LON").attr({font: "16px Arial"});

var originalPoints = []

var start = function () {
  originalPoints[0] = zone1_label.attr("x");
  originalPoints[1] = zone1.attr("x");
  originalPoints[2] = zone2_label.attr("x");
  originalPoints[3] = zone2.attr("x");
}
var move = function (dx, dy) {
  zone1_label.attr({x: originalPoints[0] + dx});
  zone1.attr({x: originalPoints[1] + dx});
  zone2_label.attr({x: originalPoints[2] + dx});
  zone2.attr({x: originalPoints[3] + dx});
}
var up = function () {}

renderHourMarks(paper);
paper.set(zone1_label,zone2_label).drag(move,start,up);

