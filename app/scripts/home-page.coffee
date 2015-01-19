

$(".jumbo-card").each (i, item) ->
  $item = $(item)
  $window = $(window)
  $window.scroll (event) ->
    scrollTop = $window.scrollTop()
    height = $item.height()
    if scrollTop < height
      scroll = Math.max(Math.floor(scrollTop * 0.5), 0)
      $item.css('backgroundPositionY', scroll)
