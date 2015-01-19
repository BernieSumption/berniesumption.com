

$(".parallax-bg").each (i, item) ->
  $item = $(item)
  $window = $(window)
  $window.scroll (event) ->
    scrollTop = $window.scrollTop()
    height = $item.height()
    if scrollTop < height
      item.style.backgroundPositionY = Math.floor(scrollTop * 0.5) + "px"
