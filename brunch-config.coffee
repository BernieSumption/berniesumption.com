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
    ignored: [/jaded-brunch/, /templates/]


  paths:
    public: "debug"

  overrides:
    production:
      sourceMaps: true
      paths:
        public: "dist"


  plugins:

    # digest:
    #   referenceFiles: /\.(html|css)$/
    #   infixes: ['@2x']

    jaded:
      staticPatterns: /^app(\/|\\)pages(\/|\\)(.+)\.jade$/

  server:
    noPushState: true
