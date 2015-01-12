exports.config =
  # See http://brunch.io/#documentation for docs.
  files:
    javascripts:
      joinTo:
        'js/app.js': /^app/
        'js/vendor.js': /^bower_components/
    stylesheets:
      defaultExtension: 'less'
      joinTo: 'app.css'
  modules:
    wrapper: false
    definition: false
  plugins:
    less:
      regexp: 'foo' # other options: 'mediaquery', 'all'