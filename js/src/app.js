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
  paper = Raphael("zoneslider", width - 10, 500);
  console.log("Drawing zoneslider");
  zoneslider = new ZoneSlider(paper);
  return zoneslider;
};

function loadFromCookie() {
  var citiesFromCookie = CookieUtil.readCookie("cities");
  if (citiesFromCookie) {
    var parsed = JSON.parse(citiesFromCookie);
    $.each(parsed, function (index, city) {
      city.__proto__ = new CityTime();
      city.rectifyDates();
      zoneslider.plotCity(city);
    });
  } else {
    var springForward = new Date(1362898800000);
    var springForwardLondon = new Date(1364691600000);
    var nyc = new CityTime("New York City", -18000, -14400, springForward, false);
    var london = new CityTime("London", 0, 3600, springForwardLondon, false);

    zoneslider.plotCity(nyc);
  }
};

function rememberCities() {
  CookieUtil.eraseCookie("cities");
  var value = JSON.stringify(zoneslider.allCities);
  CookieUtil.createCookie("cities", value);
};

function setupTools() {
  $("#reset").click(function () {
    publish("reset");
  });

  $("#am-pm-format").click(function () {
    publish("timeformat.ampm");
  });

  $("#mil-format").click(function () {
    publish("timeformat.mil");
  });

  $("#moveahead").click(function () { publish("viewport.move", [300]); });
  $("#moveback").click(function () { publish("viewport.move", [-300]); });
  $("#add12hours").click(function () { publish("viewport.move", [150]); });
  $("#subtract12hours").click(function () { publish("viewport.move", [-150]); });
  $("#add8hours").click(function () { publish("viewport.move", [100]); });
  $("#subtract8hours").click(function () { publish("viewport.move", [-100]); });

  $("#add1hours").click(function () { publish("viewport.move", [12.5]); });
  $("#subtract1hours").click(function () { publish("viewport.move", [-12.5]); });

  $("#city-search").typeahead({
    source: function (query, process) {
      return $.get('search', { q: query }, function (data) {
        searchResults = data.results;
        var names = [];
        for (var i = 0; i < data.results.length; i++) {
          names.push(data.results[i].city + ", " + data.results[i].country);
        }
        return process(names);
      });
    },
    minLength: 3,
    updater: function (item) {
      var splitAt = item.indexOf(",");
      var name = item.substring(0, splitAt);
      var country = item.substring(splitAt + 2);
      for (var i = 0; i < searchResults.length; i++) {
        var candidate = searchResults[i];
        if (name == candidate.city && country == candidate.country) {
          console.log("plotting " + candidate.city);
          var nextTransitionDate = new Date(candidate.nextTimeChange);
          var newCity = new CityTime(candidate.city, candidate.offset, candidate.dstOffset, nextTransitionDate, candidate.inDst);
          zoneslider.plotCity(newCity);
          rememberCities();
          break;
        }
      }
    }
  });
};

function startTick() {
  setInterval(function () { publish('tick'); }, 1000);
};


$(function () {
  setupTools();
  this.zoneslider = drawZoneslider();
  loadFromCookie();
  startTick();
  this.zoneslider.printTimeText();
});

subscribe("save", function () {
  rememberCities();
});


