$.fn.stabilize = function () {
  return this.applyWebElements(function () {
    return $(this).filter(function () {
      var prev = $(this).data("prevBoundingClientRect");
      var curr = $.extend({}, this.getBoundingClientRect());
      
      // if stable, returns this jquery object
      if (prev && prev.right === curr.right && prev.top === curr.top && prev.width === curr.width && prev.height === curr.height) {
        return true;
      }
      
      // else store current bounding box and return empty
      $(this).data("prevBoundingClientRect", curr);
      return false;
    });
  });
};
  
$.fn.openWindow = function () {
  this.apply(function (url, name, specs, replace) {
    window.open(url, name || '_blank', specs, replace);
  }, Array.prototype.slice.call(arguments));
};
