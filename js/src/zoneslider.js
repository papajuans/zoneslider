var ZoneMarker = require('./zonemarker');
var Zone = require('./zone');
var TimeUtil = require('./time-util');
var Timeline = require('./timeline');

var ZoneSlider = function(paper) {
  this.paper = paper;
  this.timeline = new Timeline(paper, TimeUtil.yesterday());
  this.allMarkers = [];

  // Initialize the invisible dragger
  this.timelineDragger = paper.rect(0,40, 900, 60);
  this.timelineDragger.attr({"fill": "#fff", "opacity":0});
  this.timelineDragger.drag(this.timelineDragging, this.timelineDrag_start, this.timelineDrag_end,this);
  this.timelineDragger.hover(this.timelineDrag_hover_start, this.timelineDrag_hover_end,this);
};

ZoneSlider.prototype.plotCity = function(name, offset) {
  console.log("Plotting " + name + " at " + offset);
  var zone = new Zone(name, offset);
  var baseTime = this.allMarkers.length > 0 ? this.allMarkers[0].utcTime() : TimeUtil.nowInUtc();
  var timeformat = this.allMarkers.length > 0 ? this.allMarkers[0].timeformat  : "ampm";
  // TODO super shitty
  var marker = new ZoneMarker(this.timeline.renderedDays[0], zone, baseTime, timeformat,this.paper);
  var isColliding = true;
  var step = 60;
  // Dumb overlap resolution: keep moving the marker down until you don't hit shit
  while(isColliding) {
    var newMarkerBBox = marker.labelBox.getBBox();

    if(this.allMarkers.length == 0) {
      break;
    }

    $.each(this.allMarkers, function(index, existingMarker) {
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

  this.allMarkers.push(marker);
};


ZoneSlider.prototype.timelineDrag_start = function() {
  publish("drag.start");
};

ZoneSlider.prototype.timelineDrag_end = function() {
  console.log("timeline drag end");
  this.timelineDragger.attr({"cursor":"default"});
  publish("drag.end");
};

ZoneSlider.prototype.timelineDrag_hover_start = function(){ 
  this.timelineDragger.attr({"cursor":"pointer"});
};

ZoneSlider.prototype.timelineDrag_hover_end= function(){ 
  this.timelineDragger.attr({"cursor":"default"});
};


ZoneSlider.prototype.timelineDragging = function(dx,dy) {
  publish("drag", [dx,dy]);
};

module.exports = ZoneSlider;
