var timeUnits = require("minium/timeunits");
var browserUtils = require("browser-utils");

function extractImageData () {
  var PADDING = 10;
  
  var img = $(this).get(0);
  var width = 400 * (img.width > img.height ? 1 : img.width / img.height);
  var height = 400 * (img.height > img.width ? 1 : img.height / img.width);
  
  var canvas = document.createElement('canvas');
  canvas.width = width + PADDING;
  canvas.height = height + PADDING;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, PADDING / 2, PADDING / 2, width, height);
  
  return {
    width: width, 
    height: height, 
    mimeType: "image/png",
    base64Data: canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, '')
  };
}

function GoogleImagesPage(base, openWindow) {
  base = $(base);
  this.windows = base.windows();
  this.openWindow = openWindow;
  
  if (this.openWindow) {
    this.parent = base;
    this.base = this.windows.has(this.windows.find("title").containingText("Google"));
  } else {
    this.base = base;
  }
  
  this.base = this.base.with(minium.interactionListeners.onException().thenRetry());
}

GoogleImagesPage.prototype.open = function () {
  if (this.openWindow) {
    // opens a new tab using browser-side javascript
    this.parent.apply(browserUtils.openWindow, [ "https://images.google.com", '_blank' ]);
  } else {
    this.base.browser().get("https://images.google.com");
  }
};

GoogleImagesPage.prototype.close = function () {
  if (this.openWindow) {
    this.base.close();
  }
};

GoogleImagesPage.prototype.find = function (word) {
  this.open();
  
  var stabilize = browserUtils.stabilize;
  
  var searchFld = this.base.find(":text").withName("q");
  var searchBtn = this.base.find(":submit");

  var dropdownOptions = this.base.find(".hdtbItm").visible();
  var colorDropdown = this.base.find("[role=button]").withText("Color").unless(dropdownOptions);
  var fullColorOption = this.base.find("#ic_trans a").visible();
  var typeDropdown = this.base.find("[role=button]").withText("Type").unless(dropdownOptions);
  var typeOption = this.base.find("#itp_lineart a").visible();
  var imgThumbs = this.base.find("#rg_s .rg_i").unless(colorDropdown).unless(dropdownOptions);
  var immersiveContainer = this.base.find(".immersive-container").withCss("visibility", "visible").applyWebElements(browserUtils.stabilize);
  var detailImg = immersiveContainer.find(".irc_mimg img[src^=http]");
  var viewImgBtn = immersiveContainer.find(".irc_but").withText("View image");
  
  searchFld.fill(word + " filetype:png");
  searchBtn.click();
  colorDropdown.click();
  fullColorOption.click();
  typeDropdown.click();
  typeOption.click();
  
  for (var imgThumb in Iterator(imgThumbs.waitForExistence())) {
    imgThumb.click();
    if (detailImg.checkForExistence()) {
      viewImgBtn.click();
      break;
    }
  }

  // ensure it is neither Quick Draw or Google Images pages
  var imgWindow = this.windows.not(this.windows.has("#button-play, [name=q]"));
  var img = imgWindow.find("img");
  
  var imageData = img.apply(extractImageData);
  
  imgWindow.close();
  this.close();
  
  return imageData;
};

if (typeof module !== 'undefined') module.exports = GoogleImagesPage;
