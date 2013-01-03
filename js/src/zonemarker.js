var TimeUtil = require('./time-util');

var ZoneMarker = function(daybox, city, timeformat, paper) {
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
  this.city = city;
  this.time = this.city.localTime();
  this.timeformat = timeformat;

  this.elements = [];

  this._init();

  this.inDst = this.city.isDst();

  subscribe("timeformat.ampm", function(){ 
    self.timeformat = "ampm";
    self.rerender();
  });
  subscribe("timeformat.mil", function(){ 
    self.timeformat = "mil";
    self.rerender();
  });
  subscribe("hover.in", function(fromOffset) {
    self.hovering = true;
    self.calcRelative(fromOffset);
  });
  subscribe("hover.out", function() {
    self.rerender();
    self.hovering = false;
  });
  subscribe(this.city.name+".daylight-savings", function() {
    if(!self.inDst) {
      var seconds = self.city.dstOffset - self.city.offset;
      var pixelsToMove = self.secondsToPixels(seconds);
      console.log(self.city.name + " entering DST, shifting " + seconds + " secs (" + pixelsToMove + "px)");
      self.nudge(pixelsToMove);
    }
    self.inDst = true;
  });
  subscribe(this.city.name+".standard", function() {
    if(self.inDst) {
      var seconds = self.city.offset - self.city.dstOffset;
      var pixelsToMove = self.secondsToPixels(seconds);
      console.log(self.city.name + " entering DST, shifting " + seconds + " secs (" + pixelsToMove + "px)");
      self.nudge(pixelsToMove);
    }
    self.inDst = false;
  });
  subscribe("tick", function() {
    self.addSeconds(1);
    if(!self.hovering) self.rerender();
  });
  subscribe(self.city.name+".dstSwitch", function() {
    
  });
  subscribe("timeline.move", function(dx){ 
    // Why the hell am I inverting this everywhere?
    //console.log(self + ": daybox moved by " + dx);
    var seconds = self.pixelsToSeconds(-1 * dx);
    self.city.addSeconds(seconds);
    self.rerender();
  });
  subscribe("marker-debug", function() {
    console.log(self.zone.name + " is at " + self.time);
  });
};

ZoneMarker.prototype._init= function() {
  // Determine x offset based on currentTime
  var secondsFromRef = (this.city.localTime().getTime() - this.daybox.referencePoint.dateTime.getTime()) / 1000;
  var x = this.daybox.referencePoint.x + this.secondsToPixels(secondsFromRef);
  console.log(this.city.name + " is at x: " + x);
  this.marker = this.paper.rect(x, this.daybox_y, 1, this.daybox_height+16).attr({stroke:"#FF0000", fill: "#FF0000",opacity:0.22});
  this.label = this.paper.text(x, 140, this.getLabelText()).attr({font: "16px sans-serif",fill:"#222"});
  var labelBox =  this.label.getBBox();
  this.labelBox = this.paper.rect(labelBox.x-8, labelBox.y-5, labelBox.width+16, labelBox.height+10).attr({stroke:"#222", fill:"#fff", opacity:"0.2"});
  var bottomLeftX = this.labelBox.attr("x");
  var bottomLeftY = this.labelBox.attr("y") + this.labelBox.attr("height");
  var width = this.labelBox.attr("width");

  this.removeBoxLabel = this.paper.text(x, bottomLeftY + 8, "(remove)").attr({font:"12px sans-serif", fill:"#aaa"});
  this.removeBoxLabel.click(this.remove,this);
  var removeBoxLabel = this.removeBoxLabel;
  this.removeBoxLabel.hover(function() {
                              removeBoxLabel.attr({cursor:"pointer",fill:"#222"});
                            }, function() {
                              removeBoxLabel.attr({cursor:"default",fill:"#aaa"});
                            });

  this._rememberElement(this.marker);
  this._rememberElement(this.label);
  this._rememberElement(this.labelBox);
  this._rememberElement(this.removeBoxLabel);

  this.labelBox.hover(this.hoverIn, this.hoverOut, this);
};

ZoneMarker.prototype.rerender = function() {
  this.label.attr("text", this.getLabelText());
};

ZoneMarker.prototype.getXOffset = function() {
  return "X: " + this.marker.attr("x");
};

ZoneMarker.prototype.getLabelText = function() {
  var hours = this.city.localTime().getHours();
  var dayNightIndicator = (hours > 6 && hours < 18) ? " ☼" : " ☾";
  return this.city.name + dayNightIndicator + "\n" + TimeUtil.formatTime(this.city.localTime(),this.timeformat);
};

ZoneMarker.prototype.storePosition = function() {
  this.marker_ox = this.marker.attr("x");
  this.label_ox = this.label.attr("x");
};

ZoneMarker.prototype.hoverIn = function() {
  publish("hover.in",[this.city.currentOffset()]);
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
  this.addSeconds(this.deltaSeconds);
  this.label.attr({text: this.getLabelText()});
};

ZoneMarker.prototype.addSeconds = function(seconds) {
  this.city.addSeconds(seconds);
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
  this.deltaSeconds = 0;
  this.storePosition();
  this.isDragging = false;
};

ZoneMarker.prototype.remove = function() {
  $.each(this.elements, function(index,element) {
    element.remove();
  });
  publish("remove-city",[this.city.name]);
};

ZoneMarker.prototype.calcRelative = function(fromOffset) {
  var currentOffset = this.city.currentOffset();
  if(fromOffset != currentOffset) {
    var relative = Math.abs(fromOffset - currentOffset) / 3600;
    relative = this.city.offset < fromOffset ? "-" + relative : "+" + relative;
    this.label.attr({text: this.city.name + "\n" + relative + " hours"});
  }
};

ZoneMarker.prototype.moveDown = function(pixels) {
  this.removeBoxLabel.attr({y: this.removeBoxLabel.attr('y') + pixels});
  this.marker.attr({height: this.marker.attr('height') + pixels});//, 500, "backOut");
  this.label.attr({y: this.label.attr('y') + pixels});//, 500, "backOut");
  this.labelBox.attr({y: this.labelBox.attr('y') + pixels});//, 500,"backOut");
};

// Nudge the marker left or right by some pixels
ZoneMarker.prototype.nudge = function(pixels) {
  var that = this;
  $.each(this.elements, function(index,element) {
    var ox = element.attr("x");
    element.attr({x: ox + pixels});
  });
};

ZoneMarker.prototype._rememberElement = function(element) {
  this.elements.push(element);
};

module.exports = ZoneMarker;
