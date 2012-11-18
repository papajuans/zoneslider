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
  var hourWidth = this.timebox.width / 24;
  var x = this.zone.now().getHours() * hourWidth + timebox.attr("x");
  console.log("calculated offset: " + x);
  this.timeline = paper.rect(x, 20, 1, 60).attr("stroke","#798BAB");
  this.label = paper.text(x, 120, this.getLabelText() ).attr({font: "16px Arial"});
}

ZoneMarker.prototype.getLabelText = function() {
  return this.zone.name + "\n" + TimeUtil.formatTime(this.time) + "\n" + TimeUtil.formatDate(this.time);
}

ZoneMarker.prototype.storePosition = function() {
  this.timeline_ox = this.timeline.attr("x");
  this.label_ox = this.label.attr("x");
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
  this.timeline.attr({x: this.timeline_ox + dx});
  this.label.attr({x: this.label_ox+ dx});
  
  /*
  if(this.timeline_ox + dx > timeboxLastLine) {
    this.timeline.attr({x: timeboxFirstLine + dx - timeboxLastLine});
  }*/

  this.deltaSeconds = this.toSeconds(dx);
  var someTime = new Date(this.time.getTime() + this.deltaSeconds * 1000);
  this.label.attr({text: this.zone.name + "\n" + TimeUtil.formatTime(someTime) + "\n" + TimeUtil.formatDate(someTime)});
}

ZoneMarker.prototype.toSeconds = function(pixels) {
  var secondsInAPixel = (24 * 3600) / this.timebox.width;
  return pixels * secondsInAPixel;
}

ZoneMarker.prototype.ending = function() {
  publish("drag.end");
}

ZoneMarker.prototype.endDrag = function() {
  this.label.attr({opacity: 1});
  this.storePosition();
  this.time = new Date(this.time.getTime() + this.deltaSeconds*1000);
}

module.exports = ZoneMarker;
