// webpack.config.js
const Encore = require('@symfony/webpack-encore');

Encore
    // the project directory where all compiled assets will be stored
    .setOutputPath('web/build/')

    // the public path used by the web server to access the previous directory
    .setPublicPath('build')

    // allow legacy applications to use $/jQuery as an app variable 
    // Note: Doesn't work if js not processed through webpack
    .autoProvidejQuery()
    
    // enable source maps during development
    .enableSourceMaps(!Encore.isProduction())

    // empty the outputPath dir before each build
    .cleanupOutputBeforeBuild()

    // show OS notifications when builds finish/fail
    .enableBuildNotifications()

    // filenames include a hash that changes whenever the file contents change
    .enableVersioning()

    // you can use this method to provide other common global variables,
    // such as '_' for the 'underscore' library
    .autoProvideVariables({
        agGrid: 'ag-grid'
    })
    
    /** ------- Site Js/Style Entries ----------------- */
    
    // will create web/build/app.js and web/build/app.css
    .addEntry('app', './assets/js/app/oi.js' )

    .addEntry('db', './assets/js/db/db-page.js')

    .addEntry('feedback', './assets/js/misc/feedback-viewer.js')

    .createSharedEntry('libs', ['jquery', './assets/js/libs/beaverslider.js', 
        './assets/js/libs/selectize.min.js', './assets/js/libs/flatpickr.min.js' ])
; 

// export the final configuration
module.exports = Encore.getWebpackConfig();