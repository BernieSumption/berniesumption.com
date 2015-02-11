(function() {
  $(".jumbo-card").each(function(i, item) {
    var $item, $window;
    $item = $(item);
    $window = $(window);
    return $window.scroll(function(event) {
      var height, scroll, scrollTop;
      scrollTop = $window.scrollTop();
      height = $item.height();
      if (scrollTop < height) {
        scroll = Math.max(Math.floor(scrollTop * 0.5), 0);
        return $item.css('backgroundPositionY', scroll);
      }
    });
  });

}).call(this);

(function() {
  $(document).ready(function() {
    var frameWrapper, hidePopover, iframe, resizeMain, showPopover;
    frameWrapper = $('.popover-frame');
    iframe = null;
    showPopover = function(href) {
      if (!iframe) {
        iframe = $('<iframe>').attr('src', href);
        return frameWrapper.fadeIn().prepend(iframe);
      }
    };
    hidePopover = function() {
      var _iframe;
      if (iframe) {
        _iframe = iframe;
        iframe = null;
        return frameWrapper.fadeOut(function() {
          _iframe.remove();
          return _iframe = null;
        });
      }
    };
    $('a.play-button').click(function() {
      showPopover($(this).attr('href'));
      return false;
    });
    $('.popover-frame .close-button').click(function() {
      hidePopover();
      return false;
    });
    $(document).keyup(function(event) {
      if (event.keyCode === 27) {
        return hidePopover();
      }
    });
    resizeMain = function() {
      var headingHeight;
      headingHeight = $('.heading').height();
      if (headingHeight) {
        return $('.main').css('top', headingHeight);
      }
    };
    resizeMain();
    $(document).load(resizeMain);
    return $(window).resize(resizeMain);
  });

}).call(this);

(function() {
  (function() {
    var resizeViewport;
    resizeViewport = function() {
      var content, cw, minWidth, scale, vp, width;
      cw = document.body.clientWidth;
      minWidth = 420;
      if (cw < minWidth) {
        width = minWidth;
        scale = (cw / minWidth).toFixed(2);
      } else {
        width = "device-width";
        scale = "1";
      }
      content = "width=" + width + ", initial-scale=" + scale + ", minimum-scale=" + scale;
      vp = $("viewport");
      if (vp.attr("content") !== content) {
        return vp.attr("content", content);
      }
    };
    $(window).on("orientationchange", resizeViewport);
    return resizeViewport();
  })();

}).call(this);
