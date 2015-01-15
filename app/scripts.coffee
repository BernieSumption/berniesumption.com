#
# * Sidr
# * https://github.com/artberri/sidr
# *
# * Copyright (c) 2013 Alberto Varela
# * Licensed under the MIT license.
# 
(($) ->
  sidrMoving = false
  sidrOpened = false
  
  # Private methods
  privateMethods =
    
    # Check for valids urls
    # From : http://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-an-url
    isUrl: (str) ->
      # protocol
      # domain name
      # OR ip (v4) address
      # port and path
      # query string
      pattern = new RegExp("^(https?:\\/\\/)?" + "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + "((\\d{1,3}\\.){3}\\d{1,3}))" + "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + "(\\?[;&a-z\\d%_.~+=-]*)?" + "(\\#[-a-z\\d_]*)?$", "i") # fragment locator
      unless pattern.test(str)
        false
      else
        true

    
    # Loads the content into the menu bar
    loadContent: ($menu, content) ->
      $menu.html content
      return

    
    # Add sidr prefixes
    addPrefix: ($element) ->
      elementId = $element.attr("id")
      elementClass = $element.attr("class")
      $element.attr "id", elementId.replace(/([A-Za-z0-9_.\-]+)/g, "sidr-id-$1")  if typeof elementId is "string" and "" isnt elementId
      $element.attr "class", elementClass.replace(/([A-Za-z0-9_.\-]+)/g, "sidr-class-$1")  if typeof elementClass is "string" and "" isnt elementClass and "sidr-inner" isnt elementClass
      $element.removeAttr "style"
      return

    execute: (action, name, callback) ->
      
      # Check arguments
      if typeof name is "function"
        callback = name
        name = "sidr"
      else name = "sidr"  unless name
      
      # Declaring
      $menu = $("#" + name)
      $body = $($menu.data("body"))
      $html = $("html")
      menuWidth = $menu.outerWidth(true)
      speed = $menu.data("speed")
      side = $menu.data("side")
      displace = $menu.data("displace")
      onOpen = $menu.data("onOpen")
      onClose = $menu.data("onClose")
      bodyAnimation = undefined
      menuAnimation = undefined
      scrollTop = undefined
      bodyClass = ((if name is "sidr" then "sidr-open" else "sidr-open " + name + "-open"))
      
      # Open Sidr
      if "open" is action or ("toggle" is action and not $menu.is(":visible"))
        
        # Check if we can open it
        return  if $menu.is(":visible") or sidrMoving
        
        # If another menu opened close first
        if sidrOpened isnt false
          methods.close sidrOpened, ->
            methods.open name
            return

          return
        
        # Lock sidr
        sidrMoving = true
        
        # Left or right?
        if side is "left"
          bodyAnimation = left: menuWidth + "px"
          menuAnimation = left: "0px"
        else
          bodyAnimation = right: menuWidth + "px"
          menuAnimation = right: "0px"
        
        # Prepare page if container is body
        if $body.is("body")
          scrollTop = $html.scrollTop()
          $html.css("overflow-x", "hidden").scrollTop scrollTop
        
        # Open menu
        if displace
          $body.addClass("sidr-animating").css(
            width: $body.width()
            position: "absolute"
          ).animate bodyAnimation, speed, ->
            $(this).addClass bodyClass
            return

        else
          setTimeout (->
            $(this).addClass bodyClass
            return
          ), speed
        $menu.css("display", "block").animate menuAnimation, speed, ->
          sidrMoving = false
          sidrOpened = name
          
          # Callback
          callback name  if typeof callback is "function"
          $body.removeClass "sidr-animating"
          return

        
        # onOpen callback
        onOpen()
      
      # Close Sidr
      else
        
        # Check if we can close it
        return  if not $menu.is(":visible") or sidrMoving
        
        # Lock sidr
        sidrMoving = true
        
        # Right or left menu?
        if side is "left"
          bodyAnimation = left: 0
          menuAnimation = left: "-" + menuWidth + "px"
        else
          bodyAnimation = right: 0
          menuAnimation = right: "-" + menuWidth + "px"
        
        # Close menu
        if $body.is("body")
          scrollTop = $html.scrollTop()
          $html.removeAttr("style").scrollTop scrollTop
        $body.addClass("sidr-animating").animate(bodyAnimation, speed).removeClass bodyClass
        $menu.animate menuAnimation, speed, ->
          $menu.removeAttr("style").hide()
          $body.removeAttr "style"
          $("html").removeAttr "style"
          sidrMoving = false
          sidrOpened = false
          
          # Callback
          callback name  if typeof callback is "function"
          $body.removeClass "sidr-animating"
          return

        
        # onClose callback
        onClose()
      return

  
  # Sidr public methods
  methods =
    open: (name, callback) ->
      privateMethods.execute "open", name, callback
      return

    close: (name, callback) ->
      privateMethods.execute "close", name, callback
      return

    toggle: (name, callback) ->
      privateMethods.execute "toggle", name, callback
      return

    
    # I made a typo, so I mantain this method to keep backward compatibilty with 1.1.1v and previous
    toogle: (name, callback) ->
      privateMethods.execute "toggle", name, callback
      return

  $.sidr = (method) ->
    if methods[method]
      methods[method].apply this, Array::slice.call(arguments, 1)
    else if typeof method is "function" or typeof method is "string" or not method
      methods.toggle.apply this, arguments
    else
      $.error "Method " + method + " does not exist on jQuery.sidr"
    return

  $.fn.sidr = (options) ->
    settings = $.extend(
      name: "sidr" # Name for the 'sidr'
      speed: 200 # Accepts standard jQuery effects speeds (i.e. fast, normal or milliseconds)
      side: "left" # Accepts 'left' or 'right'
      source: null # Override the source of the content.
      renaming: true # The ids and classes will be prepended with a prefix when loading existent content
      body: "body" # Page container selector,
      displace: true # Displace the body content or not
      onOpen: -> # Callback when sidr opened

      onClose: -> # Callback when sidr closed
    , options)
    name = settings.name
    $sideMenu = $("#" + name)
    
    # If the side menu do not exist create it
    $sideMenu = $("<div />").attr("id", name).appendTo($("body"))  if $sideMenu.length is 0
    
    # Adding styles and options
    $sideMenu.addClass("sidr").addClass(settings.side).data
      speed: settings.speed
      side: settings.side
      body: settings.body
      displace: settings.displace
      onOpen: settings.onOpen
      onClose: settings.onClose

    
    # The menu content
    if typeof settings.source is "function"
      newContent = settings.source(name)
      privateMethods.loadContent $sideMenu, newContent
    else if typeof settings.source is "string" and privateMethods.isUrl(settings.source)
      $.get settings.source, (data) ->
        privateMethods.loadContent $sideMenu, data
        return

    else if typeof settings.source is "string"
      htmlContent = ""
      selectors = settings.source.split(",")
      $.each selectors, (index, element) ->
        htmlContent += "<div class=\"sidr-inner\">" + $(element).html() + "</div>"
        return

      
      # Renaming ids and classes
      if settings.renaming
        $htmlContent = $("<div />").html(htmlContent)
        $htmlContent.find("*").each (index, element) ->
          $element = $(element)
          privateMethods.addPrefix $element
          return

        htmlContent = $htmlContent.html()
      privateMethods.loadContent $sideMenu, htmlContent
    else $.error "Invalid Sidr Source"  if settings.source isnt null
    @each ->
      $this = $(this)
      data = $this.data("sidr")
      
      # If the plugin hasn't been initialized yet
      unless data
        $this.data "sidr", name
        if "ontouchstart" of document.documentElement
          $this.bind "touchstart", (e) ->
            theEvent = e.originalEvent.touches[0]
            @touched = e.timeStamp
            return

          $this.bind "touchend", (e) ->
            delta = Math.abs(e.timeStamp - @touched)
            if delta < 200
              e.preventDefault()
              methods.toggle name
            return

        else
          $this.click (e) ->
            e.preventDefault()
            methods.toggle name
            return

      return


  return
)(jQuery)