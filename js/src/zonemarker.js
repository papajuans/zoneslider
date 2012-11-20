var TimeUtil = require('./time-util')

var ZoneMarker = function(timeline, zone) {
  var self = this;
  this.timeline_y = timeline.attr("y");
  this.timeline_startx = timeline.attr("x");
  this.timeline_width = timeline.attr("width");
  this.timeline_height = timeline.attr("height");
  this.timeline_endx = this.timeline_startx + this.timeline_width;
  this.secondsInAPixel = 1440 * 60 / this.timeline_width;
  this.zone = zone;
  this.time = this.zone.now();
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
}

ZoneMarker.prototype.render = function() {
  // Determine x offset based on currentTime
  var secondsPassed = (this.time.getHours() * 60 + this.time.getMinutes()) * 60;
  var x = this.secondsToPixels(secondsPassed) + this.timeline_startx;
  this.marker = paper.rect(x, this.timeline_y, 5, this.timeline_height+10).attr({stroke:"#2BBA40", fill: "#2BBA40", opacity: "0.5"});
  this.label = paper.text(x, 140, this.getLabelText(this.time) ).attr({font: "16px Arial"});
  this.debug = paper.text(x, 180, this.getXOffset() ).attr({font: "10px Arial"});
  this.wireDragging();
}

ZoneMarker.prototype.rerender = function() {
  // Determine x offset based on currentTime
  var secondsPassed = (this.zone.now().getHours() * 60 + this.zone.now().getMinutes()) * 60;
  var newX = this.secondsToPixels(secondsPassed) + this.timeline_startx;
  this.marker.animate({x: newX}, 1000, "bounce");
  this.label.animate({x: newX, text: this.getLabelText(this.zone.now())},1000, "bounce");
  this.debug.animate({x: newX},1000, "bounce");
}

ZoneMarker.prototype.getXOffset = function() {
  return "X: " + this.marker.attr("x");
}

ZoneMarker.prototype.getLabelText = function(time) {
  return this.zone.name + "\n" + TimeUtil.formatTime(time) + "\n" + TimeUtil.formatDate(time);
}

ZoneMarker.prototype.storePosition = function() {
  this.marker_ox = this.marker.attr("x");
  this.label_ox = this.label.attr("x");
  this.debug_ox = this.debug.attr("x");
}

ZoneMarker.prototype.wireDragging = function() {
  this.marker.drag(this.dragging, this.starting, this.ending, this);
  this.label.drag(this.dragging, this.starting, this.ending, this);
}

ZoneMarker.prototype.starting = function() {
  publish("drag.start");
}

ZoneMarker.prototype.startDrag = function() {
  this.label.attr({opacity: 0.5});
  this.storePosition();
}

ZoneMarker.prototype.dragging = function(dx,dy) {
  publish("drag", [dx,dy]);
}

ZoneMarker.prototype.move = function(dx,dy) {
  var newXPosition = this.marker_ox + dx;

  // Handle wrapping
  if(newXPosition > this.timeline_endx) {
    newXPosition = newXPosition - this.timeline_width;
  } else if(newXPosition < this.timeline_startx) {
    var distanceFromTimeline = this.timeline_startx - newXPosition;
    newXPosition = this.timeline_endx - distanceFromTimeline;
  } 
  this.marker.attr({x: newXPosition});
  this.label.attr({x: newXPosition});
  this.debug.attr({x: newXPosition});

  this.deltaSeconds = this.pixelsToSeconds(dx);
  var someTime = new Date(this.time.getTime() + this.deltaSeconds * 1000);
  this.label.attr({text: this.getLabelText(someTime)});
  this.debug.attr({text: "X: " + newXPosition + ", ∆x: " + dx});
}

ZoneMarker.prototype.addSeconds = function(seconds) {
  this.time = new Date(this.time.getTime() + seconds * 1000);
  this.rerender();
}

ZoneMarker.prototype.reset = function() {
  this.time = this.zone.now();
  this.rerender();
}


ZoneMarker.prototype.pixelsToSeconds = function(pixels) {
  return pixels * this.secondsInAPixel;
}

ZoneMarker.prototype.secondsToPixels = function(seconds) {
  return seconds / this.secondsInAPixel;
}

ZoneMarker.prototype.ending = function() {
  publish("drag.end");
}

ZoneMarker.prototype.endDrag = function() {
  this.label.attr({opacity: 1});
  this.time = new Date(this.time.getTime() + this.deltaSeconds*1000);
  this.deltaSeconds = 0;
  this.debug.attr({text: "X: " + this.debug.attr("x")});
  this.storePosition();
}

module.exports = ZoneMarker;
