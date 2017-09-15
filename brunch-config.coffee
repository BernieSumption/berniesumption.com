exports.config =
  # See http://brunch.io/#documentation for docs.
  files:
    javascripts:
      joinTo: 'inc/app.js'
    stylesheets:
      joinTo: 'inc/app.css'
  modules:
    wrapper: false
    definition: false

  conventions:
    ignored: [/jaded-brunch/, /templates/]


  paths:
    public: "debug"

  npm:
    enabled: false

  overrides:
    production:
      sourceMaps: true
      paths:
        public: "dist"

  plugins:

    uglify:
      outSourceMap: "/inc/app.js.map"

    jaded:
      staticPatterns: /^app(\/|\\)pages(\/|\\)(.+)\.jade$/

  server:
    noPushState: true
