var timeUnits = require("minium/timeunits");
var offsets = require("minium/offsets");
var simplify = require("simplify");
// extends $ to have a stabilize function, which ensures that in 
// two different observations, position and dimensions don't change
require("browser-utils");

browser.configure()
  .defaultInterval(500, timeUnits.MILLISECONDS)
  .waitingPreset("slow")
    .timeout(30, timeUnits.SECONDS);


// page objects
var GoogleImagesPage = require("gimages-page");
var ContourPage = require("contour-page");

var newroundCard = $("#newround-card.visible").stabilize();
var drawingCanvas = $("#drawingCanvas").unless(".covercard.visible");
var playBtn = $("#button-play").visible();
var challengeWordElem = newroundCard.find("#challengetext-word");
var gotItBtn = newroundCard.find("#button-newround-play");

var gimagesPage = new GoogleImagesPage(":root", true);
var contourPage = new ContourPage(":root", true);

browser.get("https://quickdraw.withgoogle.com/");

playBtn.click();

var word = challengeWordElem.waitForExistence().text();
var imageData = gimagesPage.find(word);
var drawing = contourPage.getDrawing(imageData);

gotItBtn.click();

// fast canvas
var fastCanvas = drawingCanvas.freeze().waitForExistence();

var stopDrawing = false;
// iterate over lines
drawing.lines.forEach(function (line) {
  if (stopDrawing) return;
  
  var linePoints = simplify(line, 1.5);
  linePoints
    .map(function (p) {
      // offset for each point
      return offsets.at(offsets.horizontal.center.plus(p.x - drawing.width / 2), offsets.vertical.center.plus(p.y - drawing.height / 2));
    })
    .forEach(function (offset, i, offsets) {
      if (stopDrawing || newroundCard.checkForExistence("immediate")) {
        stopDrawing = true;
        fastCanvas.release(offset);
        return;
      }
    
      switch (i) {
        case 0: // start of line
          fastCanvas.clickAndHold(offset);
          break;
        case offsets.length - 1: // end of line
          fastCanvas.release(offset);
          break;
        default: // intermediate points
          fastCanvas.moveTo(offset);
      }
    });
});
