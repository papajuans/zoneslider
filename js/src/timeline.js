var DayBox = require('./daybox');
var TimeUtil = require('./time-util');
var TimelinePoint = require('./timelinepoint');

var Timeline = function(paper, initialDate){
  this.paper = paper;
  this.renderedDays = [];
  this.dayWidthInPixels = 300;
  this._init(initialDate);

  var self = this;
  subscribe("drag", function(dx,dy) {
    self.dragging(dx,dy);
  });
  subscribe("drag.end", function() {
    self.referencePoint.x = self.newTimelineReferenceX;
  });
  subscribe("drag.start", function() {
    self.storePosition();
  });
  subscribe("debug", function() {
    console.log("renderedDays: " + self.renderedDays);
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
  this.referencePoint = referencePoint;
  var nextDate = referencePoint.dateTime;
  var maxDaysToRender = this.paper.width / this.dayWidthInPixels;
  for(var i = 0; i < maxDaysToRender; i++) {
    console.log("Drawing daybox at " + referencePoint.x);
    this.drawDayBox(nextDate,referencePoint,this.dayWidthInPixels);
    nextDate = TimeUtil.addSeconds(nextDate, 86400);
  }

  this.storePosition();
};

Timeline.prototype.storePosition = function() {
  this.ox = this.referencePoint.x
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

Timeline.prototype.dragging = function(dx,dy) {
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

  this.newTimelineReferenceX = this.ox + dx;
  publish("timeline.move",[this.newTimelineReferenceX]);
};

module.exports = Timeline
