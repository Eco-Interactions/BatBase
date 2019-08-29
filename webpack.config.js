const Encore = require('@symfony/webpack-encore');

const autoProvidedVars = { L: 'leaflet', $: 'jquery' };

/** ================= Create local development config ======================= */
Encore
    // the project directory where all compiled assets will be stored
    .setOutputPath('web/build/local')
    // the public path used by the web server to access the previous directory
    .setPublicPath('/batplant/web/build/local')
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
    .enableBuildNotifications(true, (options) => {
        options.alwaysNotify = true;
    })
    // filenames include a hash that changes whenever the file contents change
    .enableVersioning()
    // you can use this method to provide other common global variables,
    // such as '_' for the 'underscore' library
    .autoProvideVariables(autoProvidedVars)  
    // .addPlugin(
    //     new WorkboxPlugin.GenerateSW({
    //         // these options encourage the ServiceWorkers to get in there fast 
    //         // and not allow any straggling "old" SWs to hang around
    //         clientsClaim: true,
    //         skipWaiting: true,
    //         importsDirectory: 'sw/'
    // }))
    /** ------- Site Js/Style Entries ----------------- */
    .addEntry('app', './assets/js/app/oi.js')
    .addEntry('db', './assets/js/db/db-page.js')
    .addEntry('feedback', './assets/js/misc/feedback-viewer.js')
    .addEntry('pdfs', './assets/js/misc/view-pdfs.js')
    // .createSharedEntry('libs', './assets/js/app/libs.js')
    // if the same module (e.g. jquery) is required by multiple entry files, they will require the same object.
    .enableSingleRuntimeChunk()
; 
const local = Encore.getWebpackConfig();

// Set a unique name for the config (needed to generate assets via cli!)
local.name = 'local';
// reset Encore to build the second config
Encore.reset();

/** ======================= Create server config ============================ */
Encore
    // if the same module (e.g. jquery) is required by multiple entry files, they will require the same object.
    .enableSingleRuntimeChunk()
    // the project directory where all compiled assets will be stored
    .setOutputPath('web/build/server')
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
    // use this method to provide common global variables
    .autoProvideVariables(autoProvidedVars)
    // .addPlugin(
    //     new WorkboxPlugin.GenerateSW({
    //         // these options encourage the ServiceWorkers to get in there fast 
    //         // and not allow any straggling "old" SWs to hang around
    //         clientsClaim: true,
    //         skipWaiting: true,
    //         importsDirectory: 'sw/'
    // }))
    /** ------- Site Js/Style Entries ----------------- */
    .addEntry('app', './assets/js/app/oi.js')
    .addEntry('db', './assets/js/db/db-page.js')
    .addEntry('feedback', './assets/js/misc/feedback-viewer.js')
    .addEntry('pdfs', './assets/js/misc/view-pdfs.js')
    // if the same module (e.g. jquery) is required by multiple entry files, they will require the same object.
    .enableSingleRuntimeChunk()
; 
const server = Encore.getWebpackConfig();
// Set a unique name for the config (needed to generate assets via cli!)
server.name = 'server';
// Remove the old version of uglify (doesn't parce es6)
// server.plugins = server.plugins.filter(
//     plugin => !(plugin instanceof webpack.optimize.UglifyJsPlugin)
// );
// Add the new one
// server.plugins.push(new UglifyJsPlugin());

// export the final configuration
module.exports = [server, local];


// Run [yarn run encore dev --config-name server] to generate assets for sites on server