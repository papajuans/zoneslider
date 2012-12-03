var TimeUtil = require('./time-util');

var TimelineMarker = function(timeline, utc_time) {
  var self = this;
  this.elements = [];
  this.elements_ox = [];
  this.time = utc_time;
  this._rememberElement(timeline);
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

};

TimelineMarker.prototype._init = function() {
  var x = this.timeline_startx + this.timeline_width/2;
  var label = paper.text(x, 60, TimeUtil.formatDate(this.time)).attr({font: "18px Georgia,serif",fill:"#222"});
  this._rememberElement(label);

  //Draw hour ticks
  var sixHoursInPixels = this.secondsToPixels(6 * 60 * 60);

  this._drawTickMark(sixHoursInPixels, "6am");
  this._drawTickMark(sixHoursInPixels*2, "noon");
  this._drawTickMark(sixHoursInPixels*3, "6pm");
};

TimelineMarker.prototype._drawTickMark = function(x_offset, label) {
  var y = this.timeline_y + 35;
  var drawHeight = this.timeline_height - 45;
  var line = paper.rect(this.timeline_startx + x_offset,y+10,1,drawHeight).attr({stroke:"#888"});
  var label = paper.text(this.timeline_startx + x_offset,y,label).attr({font: "12px Georgia,serif"});
  this._rememberElement(line);
  this._rememberElement(label);
};

TimelineMarker.prototype._rememberElement = function(raphaelElement) {
  this.elements.push(raphaelElement);
};

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

TimelineMarker.prototype.endDrag = function() { 
  this.isDragging = false;
  this.storePosition();
};

TimelineMarker.prototype.move = function(dx,dy) {
  var that = this;
  $.each(this.elements, function(index,element) {
    var ox = that.elements_ox[index];
    element.attr({x: ox + dx});
  });
};

TimelineMarker.prototype.storePosition = function() {
  this.elements_ox = [];
  var that = this;
  $.each(this.elements, function(index, element) {
    that.elements_ox.push(element.attr("x"));
  });
};

module.exports = TimelineMarker;
