var TimeUtil = require('./time-util');

var ZoneMarker = function(daybox, zone, utc_time, timeformat, paper) {
  var self = this;
  this.paper = paper;
  this.daybox = daybox;
  var dayOutline = daybox.dayOutline;
  this.daybox_y = dayOutline.attr("y");
  this.daybox_startx = dayOutline.attr("x");
  this.daybox_width = dayOutline.attr("width");
  this.daybox_height = dayOutline.attr("height");
  this.daybox_endx = this.daybox_startx + this.daybox_width;
  this.secondsInAPixel = 1440 * 60 / this.daybox_width;
  this.zone = zone;
  this.time = TimeUtil.addSeconds(utc_time, this.zone.offset);
  this.timeformat = timeformat;
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
  subscribe("hover.in", function(fromOffset) {
    if(!self.isDragging) {
      self.calcRelative(fromOffset);
    }
  });
  subscribe("hover.out", function() {
    if(!self.isDragging) {
      self.rerender();
    }
  });
  subscribe("timeline.move", function(dx){ 
    // Why the hell am I inverting this everywhere?
    //console.log(self + ": daybox moved by " + dx);
    var seconds = self.pixelsToSeconds(-1 * dx);
    self.time = TimeUtil.addSeconds(self.time, seconds);
    self.rerender();
  });
  this._init();
};

ZoneMarker.prototype._init= function() {
  // Determine x offset based on currentTime
  var secondsFromRef = (this.time.getTime() - this.daybox.referencePoint.dateTime.getTime()) / 1000;
  //var secondsPassedToday = this.time.getHours() * 3600 + this.time.getMinutes() * 60 + this.time.getSeconds();
  var x = this.daybox.referencePoint.x + this.secondsToPixels(secondsFromRef);
  console.log(this.zone.name + " is at x: " + x);
  this.marker = this.paper.rect(x, this.daybox_y, 1, this.daybox_height+16).attr({stroke:"#FF0000", fill: "#FF0000",opacity:0.22});
  this.label = this.paper.text(x, 140, this.getLabelText(this.time) ).attr({font: "16px sans-serif",fill:"#222"});
  var labelBox =  this.label.getBBox();
  this.labelBox = this.paper.rect(labelBox.x-5, labelBox.y-5, labelBox.width+10, labelBox.height+10).attr({stroke:"#222", fill:"#fff", opacity:"0.2"});
  this.wireDragging();
};

ZoneMarker.prototype.rerender = function() {
  this.label.attr("text", this.getLabelText(this.time));
};

ZoneMarker.prototype.showNow = function() {
  this.time = TimeUtil.getNowLocalTime(this.zone.offset);
  this.label.attr("text", this.getLabelText(this.time));
}

//Express the time this marker represents in UTC
ZoneMarker.prototype.utcTime = function() {
  return TimeUtil.addSeconds(this.time, -1 * this.zone.offset);
};

ZoneMarker.prototype.getXOffset = function() {
  return "X: " + this.marker.attr("x");
};

ZoneMarker.prototype.getLabelText = function(time) {
  return this.zone.name + "\n" + TimeUtil.formatTime(time,this.timeformat);
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
  // Invert dx; if we drag to the left(negative dx), time goes up and vice versa
  var dx = -1 * dx;
  this.deltaSeconds = this.pixelsToSeconds(dx);
  var someTime = new Date(this.time.getTime() + this.deltaSeconds * 1000);
  this.label.attr({text: this.getLabelText(someTime)});
};

ZoneMarker.prototype.addSeconds = function(seconds) {
  this.time = new Date(this.time.getTime() + seconds * 1000);
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
