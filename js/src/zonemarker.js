var TimeUtil = require('./time-util');

var ZoneMarker = function(timeline, zone, utc_time, timeformat) {
  var self = this;
  this.timeline_y = timeline.attr("y");
  this.timeline_startx = timeline.attr("x");
  this.timeline_width = timeline.attr("width");
  this.timeline_height = timeline.attr("height");
  this.timeline_endx = this.timeline_startx + this.timeline_width;
  this.secondsInAPixel = 1440 * 60 / this.timeline_width;
  this.zone = zone;
  this.time = TimeUtil.addSeconds(utc_time, this.zone.offset);
  this.timeformat = timeformat;
  subscribe("drag", function(dx,dy){
    self.move(dx,dy);
  });
  subscribe("drag.end", function(){
    self.endDrag();
  });
  subscribe("drag.start", function(){
    self.startDrag();
  });
  subscribe("reset", function(){
    self.reset();
  });
  subscribe("redraw", function(){
    self.rerender();
  });
  subscribe("timeformat.ampm", function(){ 
    self.timeformat = "ampm";
    self.rerender();
  });
  subscribe("timeformat.mil", function(){ 
    self.timeformat = "mil";
    self.rerender();
  });
  subscribe("tick", function() {
    self.addSeconds(1);
    self.rerender();
  });
  subscribe("dump", function() {
    console.log(self.label.getBBox());
    console.log(self.marker.getBBox());
  });
  /*subscribe("hover.in", function(fromOffset) {
    if(!self.isDragging) {
      self.calcRelative(fromOffset);
    }
  });
  subscribe("hover.out", function() {
    if(!self.isDragging) {
      self.rerender();
    }
  });*/
  this._init();
};

ZoneMarker.prototype._init= function() {
  // Determine x offset based on currentTime
  var secondsFromNoonUtc = (this.time.getTime() - TimeUtil.todayNoonInUtc().getTime()) / 1000;
  //var secondsPassedToday = this.time.getHours() * 3600 + this.time.getMinutes() * 60 + this.time.getSeconds();
  var centerPoint = this.timeline_startx + this.timeline_width / 2;
  var x = centerPoint + this.secondsToPixels(secondsFromNoonUtc);
  this.marker = paper.rect(x, this.timeline_y, 1, this.timeline_height+6).attr({stroke:"#A1EB9B", fill: "#A1EB9B"});
  this.label = paper.text(x, 140, this.getLabelText(this.time) ).attr({font: "16px sans-serif",fill:"#222"});
  var labelBox =  this.label.getBBox();
  this.labelBox = paper.rect(labelBox.x-5, labelBox.y-5, labelBox.width+10, labelBox.height+10).attr({stroke:"#222", fill:"#fff", opacity:"0.2"});
  this.wireDragging();
};

ZoneMarker.prototype.rerender = function() {
  // Determine x offset based on currentTime
  var secondsPassed = (this.time.getHours() * 60 + this.time.getMinutes()) * 60;
  var newX = this.secondsToPixels(secondsPassed) + this.timeline_startx;
  this.marker.animate({x: newX }, 800, "bounce");
  this.label.animate({x: newX },800, "bounce");
  this.label.attr("text", this.getLabelText(this.time));
  this.labelBox.animate({x: newX - this.labelBox.attr('width')/2},800,"bounce");
};

//Express the time this marker represents in UTC
ZoneMarker.prototype.utcTime = function() {
  console.log(this.zone.name + " time is " + this.time);
  return TimeUtil.addSeconds(this.time, -1 * this.zone.offset);
};

ZoneMarker.prototype.getXOffset = function() {
  return "X: " + this.marker.attr("x");
};

ZoneMarker.prototype.getLabelText = function(time) {
  return this.zone.name + "\n" + TimeUtil.formatTime(time,this.timeformat) + "\n" + TimeUtil.formatDate(time);
};

ZoneMarker.prototype.storePosition = function() {
  this.marker_ox = this.marker.attr("x");
  this.label_ox = this.label.attr("x");
};

ZoneMarker.prototype.wireDragging = function() {
  this.labelBox.hover(this.hoverIn, this.hoverOut, this);
};

ZoneMarker.prototype.hoverIn = function() {
  publish("hover.in",[this.zone.offset]);
};

ZoneMarker.prototype.hoverOut = function() {
  publish("hover.out");
};

ZoneMarker.prototype.starting = function() {
  publish("drag.start");
};

ZoneMarker.prototype.startDrag = function() {
  this.label.attr({opacity: 0.5});
  this.storePosition();
  this.isDragging = true;
};

ZoneMarker.prototype.dragging = function(dx,dy) {
  publish("drag", [dx,dy]);
};

ZoneMarker.prototype.move = function(dx,dy) {
  this.deltaSeconds = this.pixelsToSeconds(dx);
  var someTime = new Date(this.time.getTime() + this.deltaSeconds * 1000);
  this.label.attr({text: this.getLabelText(someTime)});
};

ZoneMarker.prototype.addSeconds = function(seconds) {
  this.time = new Date(this.time.getTime() + seconds * 1000);
};

ZoneMarker.prototype.reset = function() {
  this.time = this.zone.now();
  this.rerender();
};

ZoneMarker.prototype.pixelsToSeconds = function(pixels) {
  return pixels * this.secondsInAPixel;
};

ZoneMarker.prototype.secondsToPixels = function(seconds) {
  return seconds / this.secondsInAPixel;
};

ZoneMarker.prototype.ending = function() {
  publish("drag.end");
};

ZoneMarker.prototype.endDrag = function() {
  this.label.attr({opacity: 1});
  this.time = new Date(this.time.getTime() + this.deltaSeconds*1000);
  this.deltaSeconds = 0;
  this.storePosition();
  this.isDragging = false;
};

ZoneMarker.prototype.calcRelative = function(fromOffset) {
  if(fromOffset != this.zone.offset) {
    var relative = Math.abs(fromOffset - this.zone.offset) / 3600;
    relative = this.zone.offset < fromOffset ? "-" + relative : "+" + relative;
    this.label.attr({text: this.zone.name + "\n" + relative + " hours"});
  }
};

ZoneMarker.prototype.moveDown = function(pixels) {
  this.marker.attr({height: this.marker.attr('height') + pixels});//, 500, "backOut");
  this.label.attr({y: this.label.attr('y') + pixels});//, 500, "backOut");
  this.labelBox.attr({y: this.labelBox.attr('y') + pixels});//, 500,"backOut");
};

module.exports = ZoneMarker;
