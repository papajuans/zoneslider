var TimeUtil = {
  ONE_HOUR: 3600000,
  ONE_MINUTE: 1000,

  MONTHS_SHORT:   ["Jan","Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
  MONTHS: ['January','February','March','April','May','June', 'July','August','September','October','November','December'],
  DAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  formatDate : function(date) {
                  var formatted = this.DAYS[date.getDay()] + ", " + this.MONTHS[date.getMonth()] + " " + date.getDate();
                  return formatted;
  },

  formatDateShort: function(date) {
    var month = date.getMonth() + 1;
    return month + "/" + date.getDate() + "/" + date.getFullYear();
  },

  formatTime: function(date,format) {
                var minutes = date.getMinutes();
                var seconds = date.getSeconds();
                if (minutes < 10) { minutes = "0" + minutes; }
                if (seconds < 10) { seconds = "0" + seconds; }
                var hours = date.getHours();
                var formatted = hours + ":" + minutes + ":" + seconds;
                if(format == "ampm") {
                  if(hours == 0) { 
                    formatted = "12:" + minutes +":" + seconds + " AM";
                  } else if (hours == 12) {
                    formatted = hours + ":" + minutes + ":" + seconds + " PM";
                  } else if (hours > 12) {
                    hours -= 12;
                    formatted = hours + ":" + minutes + ":" + seconds + " PM";
                  } else {
                    formatted = hours + ":" + minutes + ":" + seconds + " AM";
                  }
                }
                return formatted;
  },

  addSeconds: function(date,seconds) {
               return new Date(date.getTime() + seconds * 1000);
  },
  
  nowInUtc: function() {
                var now = new Date();
                return new Date(now.getUTCFullYear(), 
                                now.getUTCMonth(), 
                                now.getUTCDate(),  
                                now.getUTCHours(), 
                                now.getUTCMinutes(), 
                                now.getUTCSeconds());
  },

  todayNoonInUtc: function() {
                    var now = new Date();
                    var noonInUtc = new Date(now.getUTCFullYear(),
                                            now.getUTCMonth(),
                                            now.getUTCDate(),
                                            12,0,0);
                    return noonInUtc;
  },

  getNowLocalTime: function(offsetInSeconds) {
                    var utc = this.nowInUtc();
                    var offsetInMillis = offsetInSeconds * 1000;
                    var localTime = new Date(utc.getTime() + offsetInMillis);
                    return localTime;
  }
}

module.exports = TimeUtil;
