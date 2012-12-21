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

// Convert everything to actual Date objects
// This is needed since JSON.parse doesn't convert
// strings to Dates.
//
// This needs to be after a parse
CityTime.prototype.rectifyDates = function() {
  if(typeof this.nextTransition == "string")
    this.nextTransition = new Date(this.nextTransition);
};

CityTime.prototype.addSeconds = function(seconds) {
  this.utcTime = TimeUtil.addSeconds(this.utcTime,seconds);
};

CityTime.prototype.setTime = function(timeInUtc) {
  this.utcTime = timeInUtc;
};

CityTime.prototype.localTime = function() {
  var offset = this.currentOffset();
  return TimeUtil.addSeconds(this.utcTime,offset);
};

CityTime.prototype.currentOffset = function() {
  if(this.isDst()) {
    publish(this.name+".daylight-savings");
    return this.dstOffset;
  } else {
    publish(this.name+".standard");
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

  if(this.nextTransition == null) {
    return false;
  }

  return this.utcTime.getTime() > this.nextTransition.getTime();
};

CityTime.prototype.now = function() {
  return TimeUtil.getNowLocalTime(this.offset);
};

CityTime.prototype.nowString = function() {
  return this.name + "\n" + TimeUtil.formatTime(this.now()) + "\n" + TimeUtil.formatDate(this.now());
};

module.exports = CityTime;
