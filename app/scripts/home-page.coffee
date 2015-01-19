

$(".jumbo-card").each (i, item) ->
  $item = $(item)
  $window = $(window)
  $window.scroll (event) ->
    scrollTop = $window.scrollTop()
    height = $item.height()
    if scrollTop < height
      $item.css('backgroundPositionY', Math.floor(scrollTop * 0.5))
