var TimeUtil = require('./time-util');

var DayBox = function(utc_time, referencePoint, daysToPixelScale,paper) {
  var self = this;
  this.paper = paper;
  this.elements = [];
  this.elements_ox = [];

  this.time = utc_time;
  this.referencePoint = referencePoint;
  this.secondsInAPixel = 1440 * 60 / daysToPixelScale;

  this._init();
  this.toBack();
  this.storePosition();
  subscribe("drag.end", function(){
    self.isDragging = false;
    self.storePosition();
  });
  subscribe("drag.start", function(){
    self.isDragging = true;
    self.storePosition();
  });
  subscribe("timeline.move", function(dx) {
    self.move(dx);
  })

};

DayBox.prototype._init = function() {
  //Determine intial positioning of this box
  var timeDifference = this.time.getTime() - this.referencePoint.dateTime.getTime();
  var pixelDifference = this.secondsToPixels(timeDifference / 1000);
  //this.x represents the edge of the dayOutline
  this.timelineX = pixelDifference;
  this.x = this.referencePoint.x + pixelDifference;
  //console.log("DayBox._init: time: " + this.time +  ", ∆time: " + timeDifference + ",∆pixels: " + pixelDifference);

  var oneDayInPixels = this.secondsToPixels(24 * 60 * 60);

  //Render 1 day
  var dayOutline = this.paper.rect(this.x,40,oneDayInPixels,60).attr({"stroke": "#aaa", "fill": "#fff"});
  this._rememberElement(dayOutline);
  this.dayOutlineWidth = dayOutline.attr("width");
  this.dayOutlineHeight = dayOutline.attr("height");
  this.y = 40;
  this.dayOutline = dayOutline;

  var x = this.x + this.dayOutlineWidth/2;
  var label = this.paper.text(x, 55, TimeUtil.formatDate(this.time)).attr({font: "18px Georgia,serif",fill:"#222"});
  this._rememberElement(label);

  //Draw hour ticks
  var sixHoursInPixels = this.secondsToPixels(6 * 60 * 60);
  this._drawTickMark(sixHoursInPixels, "6am");
  this._drawTickMark(sixHoursInPixels*2, "noon");
  this._drawTickMark(sixHoursInPixels*3, "6pm");
};

DayBox.prototype._drawTickMark = function(x_offset, label) {
  var y = this.y + 35;
  var drawHeight = this.dayOutlineHeight - 45;
  var line = this.paper.rect(this.x + x_offset,y+10,1,drawHeight).attr({stroke:"#888"});
  var label = this.paper.text(this.x + x_offset,y,label).attr({font: "12px Georgia,serif"});
  this._rememberElement(line);
  this._rememberElement(label);
};

DayBox.prototype._rememberElement = function(raphaelElement) {
  this.elements.push(raphaelElement);
};

DayBox.prototype.pixelsToSeconds = function(pixels) {
  return pixels * this.secondsInAPixel;
};

DayBox.prototype.secondsToPixels = function(seconds) {
  return seconds / this.secondsInAPixel;
};

DayBox.prototype.move = function(dx) {
  this.storePosition();
  var that = this;
  $.each(this.elements, function(index,element) {
    var ox = that.elements_ox[index];
    element.attr({x: ox + dx});//,100,"easeInOut");
  });
};

DayBox.prototype.storePosition = function() {
  this.elements_ox = [];
  var that = this;
  $.each(this.elements, function(index, element) {
    that.elements_ox.push(element.attr("x"));
  });
};

DayBox.prototype.toBack = function() {
  var that = this;
  //Iterate backwards since we want the timeline to be farthest back
  for(var i = this.elements.length - 1; i > -1; i--) {
    this.elements[i].toBack();
  }
};

DayBox.prototype.toString = function() {
  return "[DayBox: " + TimeUtil.formatDateShort(this.time) + ", timeline_pos: " + this.x + ", ref: " + this.referencePoint.x + "]";
};

module.exports = DayBox;
