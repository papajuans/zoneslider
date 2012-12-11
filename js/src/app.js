var TimeUtil = require('./time-util');
var CookieUtil = require('./cookie-util');
var ZoneSlider = require('./zoneslider');

var searchResults = [];
var paper = null;
var zoneslider = null;

function drawZoneslider() {
  paper = Raphael("zoneslider",900,350);
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
    //Default
    zoneslider.plotCity("New York City", -18000);
    zoneslider.plotCity("London", 0);
    zoneslider.plotCity("Taipei", 28800);
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

  $("#city-search").typeahead({
    source: function(query, process) {
      return $.get('search', {q: query}, function(data) {
        searchResults = data.results;
        var names = [];
        for(var i = 0; i < data.results.length; i++) {
          names.push(data.results[i].name + ", " + data.results[i].country);
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
        if(name == candidate.name && country == candidate.country) {
          console.log("plotting " + candidate.name);
          zoneslider.plotCity(candidate.name, candidate.offset);
          rememberCity(candidate.name, candidate.offset);
          break;
        }
      }
    }
  });
};


$(function() {
  setupTools();
  drawZoneslider();
  loadFromCookie();
});
