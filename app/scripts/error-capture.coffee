callback = (stackframes) ->
  stringifiedStack = stackframes.map((sf) ->
    sf.toString()
    return
  ).join('\n')
  console.log "here it is: " + stringifiedStack

postAnalyticsError = (errorString) ->
  console.log errorString
  ga 'send', 'event', 'error', errorString

handleJSException = (ex) ->
  postAnalyticsError "exception: " + ex + "\n\t" + printStackTrace({e: ex}).join("\n\t")

window.onerror = (error) ->
  postAnalyticsError "onerror: " + error

# wrap a function to log any exceptions that it throws
exceptionLogWrapper = (f) ->
  return ->
    try
      f.apply(this, arguments)
    catch error
      handleJSException(error)
      throw error
