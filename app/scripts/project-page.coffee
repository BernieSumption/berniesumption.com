
$(document).ready ->

  frameWrapper = $('.popover-frame')
  iframe = null

  showPopover = (href) ->
    unless iframe
      iframe = $('<iframe>').attr('src', href)
      frameWrapper.fadeIn().prepend(iframe)

  hidePopover = ->
    if iframe
      _iframe = iframe
      iframe = null
      frameWrapper.fadeOut ->
        _iframe.remove()
        _iframe = null

  $('a.play').click ->
    showPopover $(this).attr('href')
    return false

  $('.popover-frame .close').click ->
    hidePopover()
    return false

  $(document).keyup (event) ->

    if event.keyCode is 27
        hidePopover()
