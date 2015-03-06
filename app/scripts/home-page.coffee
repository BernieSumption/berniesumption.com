

$(".jumbo-card").each (i, item) ->

  $item = $(item)
  $window = $(window)
  $parallax = $item.find(".parallax-image")
  $window.scroll ->
    scrollTop = $window.scrollTop()
    height = $item.height()
    if scrollTop < height
      targetScroll = Math.max(Math.floor(scrollTop * 0.2), 0)
      $parallax.css('top', targetScroll + "px")



