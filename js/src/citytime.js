var TimeUtil = require('./time-util');

var CityTime = function(name, utcOffset, dstOffset, nextTransition, initialDst, utcTime) {
  this.name = name;
  this.offset = utcOffset;
  this.dstOffset = dstOffset;
  this.nextTransition = nextTransition;
  // Store whether or not we *started* in DST
  // When the city moves past the transition time, we know 
  // to flip to the other offset.
  this._initialDst = initialDst;
  if(utcTime) { this.utcTime = utcTime; }
};

CityTime.prototype.addSeconds = function(seconds) {
  this.utcTime = TimeUtil.addSeconds(this.utcTime,seconds);
};

CityTime.prototype.setTime = function(timeInUtc) {
  this.utcTime = timeInUtc;
};

CityTime.prototype.localTime = function() {
  var offset = this._determineOffset();
  return TimeUtil.addSeconds(this.utcTime,offset);
};

CityTime.prototype._determineOffset = function() {
  if(this.isDst()) {
    return this.dstOffset;
  } else {
    return this.offset;
  }
};

CityTime.prototype.isDst = function() {
  var initialDst = this._initialDst;
  if(this._isAfterTransitionDate()) { 
    return !initialDst;
  }
  return initialDst;
};

CityTime.prototype._isAfterTransitionDate = function() {
  return this.utcTime.getTime() > this.nextTransition.getTime();
};

CityTime.prototype.now = function() {
  return TimeUtil.getNowLocalTime(this.offset);
};

CityTime.prototype.nowString = function() {
  return this.name + "\n" + TimeUtil.formatTime(this.now()) + "\n" + TimeUtil.formatDate(this.now());
};

module.exports = CityTime;
