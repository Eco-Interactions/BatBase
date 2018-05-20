const Encore = require('@symfony/webpack-encore');
const WorkboxPlugin = require('workbox-webpack-plugin');

/** ================= Create local development config ======================= */
Encore
    // the project directory where all compiled assets will be stored
    .setOutputPath('web/build/')
    // the public path used by the web server to access the previous directory
    .setPublicPath('/batplant/web/build')
    /** The prefix isn't being recognized for some reason */
    .setManifestKeyPrefix('build')
    // allow legacy applications to use $/jQuery as an app variable 
    // Note: Doesn't work if js not processed through webpack
    .autoProvidejQuery()
    // enable source maps during development
    .enableSourceMaps(!Encore.isProduction())
    // empty the outputPath dir before each build
    .cleanupOutputBeforeBuild()
    // show OS notifications when builds finish/fail /** Stopped working and I don't know why. */
    .enableBuildNotifications()
    // filenames include a hash that changes whenever the file contents change
    .enableVersioning()
    // you can use this method to provide other common global variables,
    // such as '_' for the 'underscore' library
    .autoProvideVariables({
        agGrid: 'ag-grid',
        L: 'leaflet',
    })
    // .addPlugin(
    //     new WorkboxPlugin.GenerateSW({
    //         // these options encourage the ServiceWorkers to get in there fast 
    //         // and not allow any straggling "old" SWs to hang around
    //         clientsClaim: true,
    //         skipWaiting: true,
    //         importsDirectory: 'sw/'
    // }))
    /** ------- Site Js/Style Entries ----------------- */
    // will create web/build/app.js and web/build/app.css
    .addEntry('app', './assets/js/app/oi.js' )
    .addEntry('db', './assets/js/db/db-page.js')
    .addEntry('feedback', './assets/js/misc/feedback-viewer.js')
    .createSharedEntry('libs', ['jquery', './assets/js/libs/beaverslider.js', 
        './assets/js/libs/selectize.min.js', './assets/js/libs/flatpickr.min.js',
        'leaflet' ])
; 
const lclConfig = Encore.getWebpackConfig();
// Set a unique name for the config (needed to generate assets via cli!)
lclConfig.name = 'local';
// reset Encore to build the second config
Encore.reset();

/** ======================= Create server config ============================ */
Encore
    // the project directory where all compiled assets will be stored
    .setOutputPath('web/build/')
    // the public path used by the web server to access the previous directory
    .setPublicPath('/build')
    /** The prefix isn't being recognized for some reason */
    .setManifestKeyPrefix('build')
    // allow legacy applications to use $/jQuery as an app variable 
    // Note: Doesn't work if js not processed through webpack
    .autoProvidejQuery()
    // enable source maps during development
    .enableSourceMaps(!Encore.isProduction())
    // empty the outputPath dir before each build
    .cleanupOutputBeforeBuild()
    // show OS notifications when builds finish/fail /** Stopped working and I don't know why. */
    .enableBuildNotifications()
    // filenames include a hash that changes whenever the file contents change
    .enableVersioning()
    // you can use this method to provide other common global variables,
    // such as '_' for the 'underscore' library
    .autoProvideVariables({
        agGrid: 'ag-grid',
        L: 'leaflet',
    })
    // .addPlugin(
    //     new WorkboxPlugin.GenerateSW({
    //         // these options encourage the ServiceWorkers to get in there fast 
    //         // and not allow any straggling "old" SWs to hang around
    //         clientsClaim: true,
    //         skipWaiting: true,
    //         importsDirectory: 'sw/'
    // }))
    /** ------- Site Js/Style Entries ----------------- */
    // will create web/build/app.js and web/build/app.css
    .addEntry('app', './assets/js/app/oi.js' )
    .addEntry('db', './assets/js/db/db-page.js')
    .addEntry('feedback', './assets/js/misc/feedback-viewer.js')
    .createSharedEntry('libs', ['jquery', './assets/js/libs/beaverslider.js', 
        './assets/js/libs/selectize.min.js', './assets/js/libs/flatpickr.min.js',
        'leaflet' ])
; 
const serverConfg = Encore.getWebpackConfig();
// Set a unique name for the config (needed to generate assets via cli!)
serverConfg.name = 'server';

// export the final configuration
module.exports = lclConfig;

// Run [yarn run encore dev --config-name server] to generate assets for sites on server