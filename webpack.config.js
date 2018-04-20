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
        agGrid: 'ag-grid',
        introJs: './assets/js/libs/intro.js'
    })
    
    /** ------- Site Js/Style Entries ----------------- */
    
    // will create web/build/app.js and web/build/app.css
    .addEntry('app', ['./assets/js/app/util.js', './assets/js/app/oi.js', 
        './assets/js/app/wysiwyg.js', './assets/js/app/feedback.js'  ])

    .addEntry('static', [ './assets/js/app/global.js', './assets/js/app/tos.js', 
        './assets/js/app/slider/eif-frames.js', './assets/js/app/slider/oislider-config.js',
        './assets/js/app/slider/oislider.js' ])

    .addEntry('search', [ './assets/js/srch/sync-data.js', './assets/js/srch/map-data.js', 
        './assets/js/srch/crud.js', './assets/js/srch/search-page.js' ])

    .addEntry('feedback', [ './assets/js/fdbk/buttons.html5.min.js', 
        './assets/js/fdbk/dataTables.buttons.min.js', './assets/js/fdbk/dataTables.fixedHeader.min.js',
        './assets/js/fdbk/dataTables.responsive.min.js', './assets/js/fdbk/jquery.dataTables.min.js',
        './assets/js/fdbk/oi-tables.js'])

    .createSharedEntry('libs', ['jquery', './assets/js/libs/beaverslider.js', 
        './assets/js/libs/selectize.min.js', './assets/js/libs/flatpickr.min.js'  ])
; 

// export the final configuration
module.exports = Encore.getWebpackConfig();
