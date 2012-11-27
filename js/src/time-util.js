var TimeUtil = {
  ONE_HOUR: 3600000,
  ONE_MINUTE: 1000,

  MONTHS:   ["Jan","Feb", "Mar", "Apr", 
            "May", "Jun", "Jul", "Aug", 
            "Sept", "Oct", "Nov", "Dec"],

  formatDate : function(date) {
                  var formatted = this.MONTHS[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
                  return formatted;
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
                  } else if (hours > 12) {
                    hours -= 12;
                    formatted = hours + ":" + minutes + ":" + seconds + " PM";
                  } else {
                    formatted = hours + ":" + minutes + ":" + seconds + " AM";
                  }
                }
                return formatted;
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

  getNowLocalTime: function(offsetInSeconds) {
                    var utc = this.nowInUtc();
                    var offsetInMillis = offsetInSeconds * 1000;
                    var localTime = new Date(utc.getTime() + offsetInMillis);
                    return localTime;
  }
}

module.exports = TimeUtil;
