var browserUtils = require("browser-utils");

function dropImage (imageData) {
  var elem = $(this).get(0);
  
  // http://stackoverflow.com/a/16245768
  var byteCharacters = atob(imageData.base64Data);
  var byteNumbers = new Array(byteCharacters.length);
  for (var i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  var byteArray = new Uint8Array(byteNumbers);
  
  var evObject = {
    target: elem,
    dataTransfer : {
      files : [ new Blob([ byteArray ], { type: imageData.mimeType }) ]
    }
  };
  
  var ev = document.createEvent('Event');
  ev.initEvent('drop', true, true);
  ev.originalEvent = evObject;
  ev.dataTransfer = evObject.dataTransfer;
  elem.dispatchEvent(ev);
}

function extractDrawing () {
  var parsePoint = function (s) {
    var parts = s.split(',');
    return { 
      x: parseInt(parts[0]), 
      y: parseInt(parts[1]) 
    };
  };
  
  var orderByLength = function (lines) {
    var lengths = lines.map(function (line) {
      var length = line.reduce(function (accum, p) {
        return {
          point: p,
          val: accum.val + Math.sqrt( Math.pow(accum.point.x - p.x, 2) + Math.pow(accum.point.y - p.y, 2) ) 
        };
      }, { val: 0, point: line[0] }).val;
      return { line: line, val: length };
    });
    lengths.sort(function (l1, l2) {
      return l2.val - l1.val;
    });
    return lengths.map(function (l) {
      return l.line;
    });
  }

  var drawing = $(this);
  var svg = drawing.get(0);
  var polylines = drawing.find("polyline");
  var lines = polylines.toArray()
    .map(function (polyline) {
      return $(polyline).attr('points')
        .split(' ')
        .filter(function (s) { return s })
        .map(parsePoint); 
    });

  var viewBox = svg.viewBox.baseVal;
  return {
    x: viewBox.x,
    y: viewBox.y,
    width: viewBox.width,
    height: viewBox.height,
    lines: orderByLength(lines)
  };
}

function orderByBoundingBox(lines) {
  var boxes = lines.map(function (line) {
    var minX = Number.MAX_SAFE_INTEGER, maxX = Number.MIN_SAFE_INTEGER, minY = Number.MAX_SAFE_INTEGER, maxY = Number.MIN_SAFE_INTEGER;
    for (var i = 0; i < line.length; i++) {
      var p = line[i];
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      line: line
    };
  });
  boxes.sort(function (b1, b2) {
    var area1 = b1.width * b1.height;
    var area2 = b2.width * b2.height;
    if (area1 === area2) return 0;
    return area1 > area2 ? -1 : 1;
  });
  return boxes.map(function (b) {
    return b.line;
  });
}

function ContourPage(base, openWindow) {
  base = $(base);
  this.windows = base.windows();
  this.openWindow = openWindow;
  
  if (this.openWindow) {
    this.parent = base;
    this.base = this.windows.has(this.windows.find("title").containingText("contour - Draw edges"));
  } else {
    this.base = base;
  }
}

ContourPage.prototype.open = function () {
  if (this.openWindow) {
    // opens a new tab using browser-side javascript
    this.parent.apply(browserUtils.openWindow, [ "https://jmperezperez.com/contour", '_blank' ]);
  } else {
    this.base.browser().get("https://jmperezperez.com/contour");
  }
};

ContourPage.prototype.close = function () {
  if (this.openWindow) {
    this.base.close();
  }
};

ContourPage.prototype.getDrawing = function (imageData) {
  this.open();
  var holder = this.base.find("#droparea");
  
  holder.apply(dropImage, [ imageData ]);
  
  var drawingElem = this.base.find("svg");
  var resultImg = this.base.find("#result").withCss("opacity", "1");
  
  resultImg.waitForExistence("slow");
  
  var drawing = drawingElem.apply(extractDrawing);
  this.close();
  
  return drawing;
};

if (typeof module !== 'undefined') module.exports = ContourPage;
