(->
  resizeViewport = ->
    cw = document.body.clientWidth
    minWidth = 420
    if cw < minWidth
      width = minWidth
      scale = (cw / minWidth).toFixed(2)
    else
      width = "device-width"
      scale = "1"
    content = "width=" + width + ", initial-scale=" + scale + ", minimum-scale=" + scale
    vp = $("viewport")
    unless vp.attr("content") is content
      vp.attr("content", content)

  $(window).on("orientationchange", resizeViewport)
  resizeViewport()
)()