var browserUtils = {
  stabilize: function () {
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
  },
  
  openWindow: function (url, name, specs, replace) {
    window.open(url, name || '_blank', specs, replace);
  }
};

if (typeof module !== 'undefined') module.exports = browserUtils;
