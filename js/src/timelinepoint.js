var TimeUtil = require('./time-util');

var TimelinePoint = function(x, dateTime) {
  this.x = x;
  this.dateTime = dateTime;
}

TimelinePoint.prototype.toString = function() {
  return "[TimelinePoint: x:" + this.x + ", " + 
    TimeUtil.formatDateShort(this.dateTime) + " " + TimeUtil.formatTime(this.dateTime,"mil");
}

module.exports = TimelinePoint;
