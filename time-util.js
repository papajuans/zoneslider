var TimeUtil = {
  ONE_HOUR: 3600000,

  MONTHS:   ["Jan","Feb", "Mar", "Apr", 
            "May", "Jun", "Jul", "Aug", 
            "Sept", "Oct", "Nov", "Dec"],

  formatDate : function(date) {
                  var formatted = this.MONTHS[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
                  return formatted;
  },

  formatTime: function(date) {
                var minutes = date.getMinutes();
                if (minutes < 10) { minutes = "0" + minutes; }
                var formatted = date.getHours() + ":" + minutes;
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

  getNowLocalTime: function(offsetInHours) {
                    var utc = this.nowInUtc();
                    var offsetInMillis = offsetInHours * this.ONE_HOUR;
                    var localTime = new Date(utc.getTime() + offsetInMillis);
                    return localTime;
  }
}
