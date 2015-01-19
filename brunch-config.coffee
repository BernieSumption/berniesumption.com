exports.config =
  # See http://brunch.io/#documentation for docs.
  files:
    javascripts:
      joinTo:
        'inc/app.js': /^app/
        'inc/vendor.js': /^bower_components/
    stylesheets:
      defaultExtension: 'less'
      joinTo: 'inc/app.css'
  modules:
    wrapper: false
    definition: false

  conventions:
    ignored: /jaded-brunch/


  plugins:
    autoReload:
      delay: 0.5

  server:
    noPushState: true
