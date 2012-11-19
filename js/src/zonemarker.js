var TimeUtil = require('./time-util')
var ZoneMarker = function(timebox, zone) {
  var self = this;
  this.timebox = timebox;
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
}

ZoneMarker.prototype.draw = function() {
  // Determine x offset based on currentTime
  var minutesPassedInDay = this.zone.now().getHours() * 60 + this.zone.now().getMinutes();
  console.log("minutes passed so far: " + this.zone.name + " " + minutesPassedInDay);
  var x = minutesPassedInDay * 60 / 120 + 20;
  console.log("calculated offset: " + x);
  this.timeline = paper.rect(x, 20, 1, 60).attr("stroke","#798BAB");
  this.label = paper.text(x, 120, this.getLabelText() ).attr({font: "16px Arial"});
  this.debug = paper.text(x, 160, this.getXOffset() ).attr({font: "10px Arial"});
}

ZoneMarker.prototype.getXOffset = function() {
  return "X: " + this.timeline.attr("x");
}

ZoneMarker.prototype.getLabelText = function() {
  return this.zone.name + "\n" + TimeUtil.formatTime(this.time) + "\n" + TimeUtil.formatDate(this.time);
}

ZoneMarker.prototype.storePosition = function() {
  this.timeline_ox = this.timeline.attr("x");
  this.label_ox = this.label.attr("x");
  this.debug_ox = this.debug.attr("x");
}

ZoneMarker.prototype.wireDragging = function() {
  this.timeline.drag(this.dragging, this.starting, this.ending, this);
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
  var newXPosition = this.timeline_ox + dx;
  console.log(this.zone.name + "∆x: " + dx + ", newXPosition: " + newXPosition);

  // Handle wrapping
  if(newXPosition > 740) {
    newXPosition = newXPosition - 720;
  } else if(newXPosition < 20) {
    var distanceFrom20 = 20 - newXPosition;
    console.log("Distance from 20: " + distanceFrom20);
    newXPosition = 740 - distanceFrom20;
  } 
  this.timeline.attr({x: newXPosition});
  this.label.attr({x: newXPosition});
  this.debug.attr({x: newXPosition});

  this.deltaSeconds = this.toSeconds(dx);
  var someTime = new Date(this.time.getTime() + this.deltaSeconds * 1000);
  this.label.attr({text: this.zone.name + "\n" + TimeUtil.formatTime(someTime) + "\n" + TimeUtil.formatDate(someTime)});
  this.debug.attr({text: "X: " + newXPosition + ", ∆x: " + dx});
}

ZoneMarker.prototype.toSeconds = function(pixels) {
  var secondsInAPixel = 120; //Calculate this
  return pixels * secondsInAPixel;
}

ZoneMarker.prototype.ending = function() {
  publish("drag.end");
}

ZoneMarker.prototype.endDrag = function() {
  this.label.attr({opacity: 1});
  this.time = new Date(this.time.getTime() + this.deltaSeconds*1000);
  this.debug.attr({text: "X: " + this.debug.attr("x")});
  this.storePosition();
}

module.exports = ZoneMarker;
