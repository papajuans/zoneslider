var TimeUtil = require('./time-util');

var TimelineMarker = function(timeline, utc_time) {
  var self = this;
  this.time = utc_time;
  this.timeline_startx = timeline.attr("x");
  this.timeline_width = timeline.attr("width");
  this.timeline_height = timeline.attr("height");
  this.timeline_y = timeline.attr("y");
  this.secondsInAPixel = 1440 * 60 / this.timeline_width;
  this._init();
  subscribe("drag", function(dx,dy){
    self.move(dx,dy);
  });
  subscribe("drag.end", function(){
    self.endDrag();
  });
  subscribe("drag.start", function(){
    self.startDrag();
  });

}

TimelineMarker.prototype._init = function() {
  var x = this.timeline_startx + this.timeline_width/2;
  this.label = paper.text(x, 30, TimeUtil.formatDate(this.time)).attr({font: "18px serif",fill:"#222"});
}

TimelineMarker.prototype.pixelsToSeconds = function(pixels) {
  return pixels * this.secondsInAPixel;
};

TimelineMarker.prototype.secondsToPixels = function(seconds) {
  return seconds / this.secondsInAPixel;
};

TimelineMarker.prototype.startDrag = function() {
  this.isDragging = true;
  this.storePosition();
};

TimelineMarker.prototype.endDrag = function() { };

TimelineMarker.prototype.move = function(dx,dy) {
  dx = -1 * dx;
  this.label.attr({x: this.label_ox + dx});
};

TimelineMarker.prototype.storePosition = function() {
  this.label_ox = this.label.attr("x");
};


module.exports = TimelineMarker;
