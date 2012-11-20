var TimeUtil = require('./time-util');

var Zone = function(name, offset) {
  this.name = name;
  this.offset = offset;
}

Zone.prototype.now = function() {
  return TimeUtil.getNowLocalTime(this.offset);
}

Zone.prototype.nowString = function() {
  return this.name + "\n" + TimeUtil.formatTime(this.now()) + "\n" + TimeUtil.formatDate(this.now());
}

module.exports = Zone;
