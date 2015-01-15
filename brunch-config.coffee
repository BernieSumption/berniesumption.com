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
  plugins:
    less:
      regexp: 'foo' # other options: 'mediaquery', 'all'