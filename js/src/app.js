var TimeUtil = require('./time-util');
var CookieUtil = require('./cookie-util');
var ZoneSlider = require('./zoneslider');
var CityTime = require('./citytime');

var searchResults = [];
var paper = null;
var zoneslider = null;

function drawZoneslider() {
  var width = window.innerWidth;
  var height = window.innerHeight;
  paper = Raphael("zoneslider",width-10,400);
  console.log("Drawing zoneslider");
  zoneslider = new ZoneSlider(paper);
};

function loadFromCookie() {
  var citiesFromCookies = CookieUtil.readCookie("cities");
  if(citiesFromCookies != "") {
    var cities = citiesFromCookies.split(",");
    for(var i = 0; i < cities.length; i++) {
      var cityAndOffset = cities[i].split(":");
      zoneslider.plotCity(cityAndOffset[0], parseInt(cityAndOffset[1]));
    }
  } else {
    // for testing
    var springForward = new Date(1356004800000);
    var springForwardLondon = new Date(Date.parse("Thu, 20 Dec 2012 02:00:00 +0000"));
    var nyc = new CityTime("New York City", -18000, -14400, springForward, false);

    zoneslider.plotCity(nyc);
//    zoneslider.plotCity(london);
  }
};

function rememberCity(cityName, offset) {
  //TODO prevent duplicates?
  var cookieValue = cityName + ":" + offset;
  CookieUtil.appendToCookie("cities",cookieValue);
};

function setupTools() {
  $("#reset").click(function() { 
    publish("reset");
  });

  $("#am-pm-format").click(function() {
    publish("timeformat.ampm");
  });

  $("#mil-format").click(function() {
    publish("timeformat.mil");
  });

  $("#moveahead").click(function() { publish("viewport.move", [300]);});
  $("#moveback").click(function() { publish("viewport.move", [-300]);});
  $("#add12hours").click(function() { publish("viewport.move", [150]);});
  $("#subtract12hours").click(function() { publish("viewport.move", [-150]);});
  $("#add8hours").click(function() { publish("viewport.move", [100]);});
  $("#subtract8hours").click(function() { publish("viewport.move", [-100]);});

  $("#add1hours").click(function() { publish("viewport.move", [12.5]);});
  $("#subtract1hours").click(function() { publish("viewport.move", [-12.5]);});

  $("#city-search").typeahead({
    source: function(query, process) {
      return $.get('search', {q: query}, function(data) {
        searchResults = data.results;
        var names = [];
        for(var i = 0; i < data.results.length; i++) {
          names.push(data.results[i].city + ", " + data.results[i].country);
        }
        return process(names);
      });
    },
    minLength: 3,
    updater: function(item) {
      var splitAt = item.indexOf(",");
      var name = item.substring(0, splitAt);
      var country = item.substring(splitAt+2);
      for(var i = 0; i < searchResults.length; i++) {
        var candidate = searchResults[i];
        if(name == candidate.city && country == candidate.country) {
          console.log("plotting " + candidate.city);
          var nextTransitionDate = new Date(candidate.nextTimeChange);
          var newCity = new CityTime(candidate.city, candidate.offset, candidate.dstOffset, nextTransitionDate, candidate.inDst);
          zoneslider.plotCity(newCity);
          rememberCity(newCity.name, newCity.offset);
          break;
        }
      }
    }
  });
};

function startTick() {
  setInterval(function() { publish('tick'); }, 1000);
};


$(function() {
  setupTools();
  drawZoneslider();
  loadFromCookie();
  //startTick();
});
