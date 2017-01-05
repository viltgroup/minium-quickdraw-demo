var timeUnits = require("minium/timeunits");
var offsets = require("minium/offsets");
var simplify = require("simplify");
require("browser-utils");

function QuickDrawPage(base) {
  this.base = $(base);
  this.newroundCard = this.base.find("#newround-card.visible").stabilize();
  this.drawingCanvas = this.base.find("#drawingCanvas").unless(".covercard.visible");
  this.playBtn = this.base.find("#button-play").visible();
  this.challengeWordElem = this.newroundCard.find("#challengetext-word");
  this.gotItBtn = this.newroundCard.find("#button-newround-play");
}

QuickDrawPage.prototype.open = function () {
  this.base.browser().get("https://quickdraw.withgoogle.com/");
};

QuickDrawPage.prototype.startPlaying = function () {
  this.open();
  this.playBtn.click();
};

QuickDrawPage.prototype.nextWord = function (getDrawing) {
  if (this.newroundCard.checkForExistence()) {
    return this.challengeWordElem.waitForExistence().text();
  }
  return null;
};

QuickDrawPage.prototype.drawAll = function (getDrawing) {
  var word;
  while ((word = this.nextWord())) {
    var drawing = getDrawing(word);
    
    this.draw(drawing);
    
    this.drawingCanvas.checkForUnexistence("slow");
  }
};

QuickDrawPage.prototype.draw = function (drawing) {
  this.gotItBtn.click();
  
  // fast canvas
  var fastCanvas = this.drawingCanvas.freeze();
  var lines = drawing.lines;
  fastCanvas.waitForExistence();
    
  var stopDrawing = false;
  drawing.lines.forEach(function (line) {
    if (stopDrawing) return;
    
    var linePoints = simplify(line, 1.5);
    linePoints
      .map(function (p) {
        // offset for each point
        return offsets.at(offsets.horizontal.center.plus(p.x - drawing.width / 2), offsets.vertical.center.plus(p.y - drawing.height / 2));
      })
      .forEach(function (offset, i, offsets) {
        if (stopDrawing || this.newroundCard.checkForExistence("immediate")) {
          stopDrawing = true;
          fastCanvas.release(offset);
          return;
        }
      
        switch (i) {
          // start of line
          case 0:
            fastCanvas.clickAndHold(offset);
            break;
          // end of line
          case offsets.length - 1:
            fastCanvas.release(offset);
            break;
          // intermediate points
          default:
            fastCanvas.moveTo(offset);
        }
      });
  });
  
  this.drawingCanvas.waitForUnexistence("slow");
};

if (typeof module !== 'undefined') module.exports = QuickDrawPage;
