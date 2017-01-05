var timeUnits = require("minium/timeunits");

var QuickDrawPage = require("quickdraw-page");
var GoogleImagesPage = require("gimages-page");
var ContourPage = require("contour-page");

var gimagesPage, contourPage, quickDrawPage;

World(function () {
  var base = $(":root");
  
  browser.configure()
    .defaultInterval(500, timeUnits.MILLISECONDS)
    .waitingPreset("slow")
      .timeout(30, timeUnits.SECONDS);
  
  gimagesPage = new GoogleImagesPage(base, true);
  contourPage = new ContourPage(base, true);
  quickDrawPage = new QuickDrawPage(base);
});

function getDrawing (word) {
  console.log("Searching for image " + word);
  
  var imageData = gimagesPage.find(word);
  var drawing = contourPage.getDrawing(imageData);
  
  return drawing;
}

When(/^I play Quick Draw$/, function () {
  quickDrawPage.play();
});

When(/^I start playing$/, function() {
  quickDrawPage.startPlaying();
});

When(/^I draw:$/, function(table) {
  table.raw().forEach(function (row) {
    var word = row[0];
    var drawing = getDrawing(word);
    quickDrawPage.draw(drawing);
  });
});

When(/^I draw an? (.*)$/, function (word) {
  var drawing = getDrawing(word);
  quickDrawPage.draw(drawing);
});

When(/^I draw all requested words$/, function () {
  quickDrawPage.drawAll(getDrawing);
});