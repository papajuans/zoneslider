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

/***********************************/

var ZoneMarker = function(timebox, zone) {
  var self = this;
  this.timebox = timebox;
  this.zone = zone;
  this.time = this.zone.now();
  subscribe("drag", function(dx,dy){
    self.move(dx,dy);
  });
  subscribe("drag.end", function(){
    self.endDrag();
  });
  subscribe("drag.start", function(){
    self.startDrag();
  });
}

ZoneMarker.prototype.draw = function() {
  // Determine x offset based on currentTime
  var hourWidth = this.timebox.width / 24;
  var x = this.zone.now().getHours() * hourWidth + timebox.attr("x");
  console.log("calculated offset: " + x);
  this.timeline = paper.rect(x, 20, 1, 60).attr("stroke","#798BAB");
  this.label = paper.text(x, 120, this.getLabelText() ).attr({font: "16px Arial"});
}

ZoneMarker.prototype.getLabelText = function() {
  return this.zone.name + "\n" + TimeUtil.formatTime(this.time) + "\n" + TimeUtil.formatDate(this.time);
}

ZoneMarker.prototype.storePosition = function() {
  this.timeline_ox = this.timeline.attr("x");
  this.label_ox = this.label.attr("x");
}

ZoneMarker.prototype.wireDragging = function() {
  this.timeline.drag(this.dragging, this.starting, this.ending, this);
  this.label.drag(this.dragging, this.starting, this.ending, this);
}

ZoneMarker.prototype.starting = function() {
  publish("drag.start");
}

ZoneMarker.prototype.startDrag = function() {
  this.label.attr({opacity: 0.5});
  this.storePosition();
}

ZoneMarker.prototype.dragging = function(dx,dy) {
  publish("drag", [dx,dy]);
}

ZoneMarker.prototype.move = function(dx,dy) {
  this.timeline.attr({x: this.timeline_ox + dx});
  this.label.attr({x: this.label_ox+ dx});
  
  /*
  if(this.timeline_ox + dx > timeboxLastLine) {
    this.timeline.attr({x: timeboxFirstLine + dx - timeboxLastLine});
  }*/

  this.deltaSeconds = this.toSeconds(dx);
  var someTime = new Date(this.time.getTime() + this.deltaSeconds * 1000);
  this.label.attr({text: this.zone.name + "\n" + TimeUtil.formatTime(someTime) + "\n" + TimeUtil.formatDate(someTime)});
}

ZoneMarker.prototype.toSeconds = function(pixels) {
  var secondsInAPixel = (24 * 3600) / this.timebox.width;
  return pixels * secondsInAPixel;
}

ZoneMarker.prototype.ending = function() {
  publish("drag.end");
}

ZoneMarker.prototype.endDrag = function() {
  this.label.attr({opacity: 1});
  this.storePosition();
  this.time = new Date(this.time.getTime() + this.deltaSeconds*1000);
}


/***********************************/

var paper = Raphael("zoneslider",900,200);
var timebox = paper.rect(20,20,860,60);
timebox.attr("stroke", "#ccc");

var renderHourMarks = function(paper){ 
  var sixam = paper.path("M235,40L235,80");
  var sixam_label = paper.text(235,30, "6am").attr({font: "12px Arial"});
  var noon = paper.path("M445,40,L445,80");
  var non_label = paper.text(445,30, "12pm").attr({font: "12px Arial"});
  var sixpm = paper.path("M655,40,L655,80");
  var sixpm_label = paper.text(655,30, "6pm").attr({font: "12px Arial"});
}

renderHourMarks(paper);

var nyc = new Zone("NYC", -5);
var nycMarker = new ZoneMarker(paper, nyc);
nycMarker.draw();
nycMarker.wireDragging();

var london = new Zone("London", 0);
var londonMarker = new ZoneMarker(paper, london);
londonMarker.draw();
londonMarker.wireDragging();

var taipei = new Zone("Taipei", 8);
var taipeiMarker = new ZoneMarker(paper, taipei);
taipeiMarker.draw();
taipeiMarker.wireDragging();

