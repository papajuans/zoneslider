var DayBox = require('./daybox');
var TimeUtil = require('./time-util');
var TimelinePoint = require('./timelinepoint');

var Timeline = function(paper, initialDate){
  this.paper = paper;
  this.renderedDays = [];
  this.dayWidthInPixels = 300;
  this.secondsInAPixel = 1440 * 60 / this.dayWidthInPixels;
  this._init(initialDate);

  var self = this;
  subscribe("drag", function(dx,dy) {
    self.moveViewport(dx,dy);
  });
  subscribe("drag.end", function() {
    self.referencePoint.x = self.referencePoint.x + self.dx;
  });
  subscribe("drag.start", function() {
  });
  subscribe("debug", function() {
    console.log("renderedDays: " + self.renderedDays);
    console.log("referecePoint: " + self.referencePoint);
    console.log("viewPoint: " + self.viewPoint);
  });
  subscribe("reset", function() {
    console.log("Resetting to current time.");
//    var yesterday = TimeUtil.yesterday();
//   self.viewPoint.dateTime = yesterday;
//    var delta = self.viewPoint.dateTime.getTime() - self.referencePoint.dateTime.getTime();
//    var deltaPixels = self.secondsToPixels(delta);
    var deltaPixels = self.referencePoint.x;
    self.moveViewport(deltaPixels);
  });
  subscribe("viewport.move", function(dPixels) {
    console.log("Moving viewport by " + dPixels);
    self.moveViewport(dPixels);
  });

}

// Render days starting from initialDate
// Keep rendering until we're off screen
Timeline.prototype._init = function(initialDate){
  //This is the anchor; all subsequent calculations is based
  //off this single reference point
  //
  //This says that at x=100 it represents the initialDate
  var referencePoint = new TimelinePoint(0, initialDate);
  var viewPoint = new TimelinePoint(0, initialDate);
  this.viewPoint = viewPoint;
  this.referencePoint = referencePoint;
  var nextDate = referencePoint.dateTime;
  var maxDaysToRender = this.paper.width / this.dayWidthInPixels;
  for(var i = 0; i < maxDaysToRender; i++) {
    console.log("Drawing daybox at " + referencePoint.x);
    this.drawDayBox(nextDate,referencePoint,this.dayWidthInPixels);
    nextDate = TimeUtil.addSeconds(nextDate, 86400);
  }

};

Timeline.prototype.drawDayBox = function(someDate, referencePoint, dayInPixelsScale) {
  console.log("Drawing " + someDate);
  var dayBox = new DayBox(someDate,referencePoint,dayInPixelsScale);
  this.renderedDays.push(dayBox);
  this.renderedDays.sort(function(a,b) {
    if(a.time.getTime() < b.time.getTime()) {
      return -1;
    } else {
      return 1;
    }
  });
};

//Draw one more day after
Timeline.prototype.addDay = function() {
  var lastDay = this.renderedDays[this.renderedDays.length - 1];
  var dayAfterDate = TimeUtil.addSeconds(lastDay.time, 86400);
  this.drawDayBox(dayAfterDate, this.referencePoint, this.dayWidthInPixels); 
};

//The the viewport is moving, so reposition the timeline
//
// 1. Calculate what the new time is.
// 2. Calculate what the what the new referencePoint X is.
// 3. Publish new referencePoint X.
Timeline.prototype.moveViewport = function(dPixels) {
  var dSeconds = this.pixelsToSeconds(dPixels);
  this.viewPoint.dateTime = TimeUtil.addSeconds(this.viewPoint.dateTime, dSeconds);
  this.viewPoint.x = 0;

  this.dx = (-1*dPixels);
  this.referencePoint.x = this.referencePoint.x + this.dx;
  publish("timeline.move",[this.dx]);
  this._drawMoreDays();
};

Timeline.prototype._drawMoreDays = function() {
  var lastDay = this.renderedDays[this.renderedDays.length - 1];
  var lastDayEdge = lastDay.dayOutline.attr("x") + this.dayWidthInPixels;
  if(this.paper.width > lastDayEdge) {
    this.addDay(86400);
  }

  var firstDay = this.renderedDays[0];
  var firstDayEdge = firstDay.dayOutline.attr("x");
  if(firstDayEdge > 0) {
    var previousDayDate = TimeUtil.addSeconds(firstDay.time, -86400);
    this.drawDayBox(previousDayDate, this.referencePoint, this.dayWidthInPixels);
  }
};

Timeline.prototype.pixelsToSeconds = function(pixels) {
  return pixels * this.secondsInAPixel;
};

Timeline.prototype.secondsToPixels = function(seconds) {
  return seconds / this.secondsInAPixel;
};


module.exports = Timeline
