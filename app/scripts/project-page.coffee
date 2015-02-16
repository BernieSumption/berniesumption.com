
$(document).ready ->

  # PLAY BUTTON OPENS IN FULL WINDOW IFRAME

  frameWrapper = $('.popover-frame')
  iframe = null

  showPopover = (href) ->
    unless iframe
      iframe = $('<iframe>').attr('src', href)
      frameWrapper.fadeIn().prepend(iframe)
      ga 'send', 'event', 'project-play', href

  hidePopover = ->
    if iframe
      _iframe = iframe
      iframe = null
      frameWrapper.fadeOut ->
        _iframe.remove()
        _iframe = null

  $('a.play-button').click ->
    showPopover $(this).attr('href')
    return false

  $('.popover-frame .close-button').click ->
    hidePopover()
    return false

  $(document).keyup (event) ->

    if event.keyCode is 27
        hidePopover()

  # MAIN DIV RESIZES TO FILL AREA OF WINDOW NOT ALREADY FILLED BY HEADING

  resizeMain = ->
    headingHeight = $('.heading').height()
    if headingHeight
      $('.main').css('top', headingHeight)

  resizeMain()
  $(document).load resizeMain
  $(window).resize resizeMain

  # BACK LINK USES HISTORY IF PREVIOUS PAGE WAS HOME

  $('.back-button').click ->
    if document.referrer is this.href
      window.history.back()
