const Encore = require('@symfony/webpack-encore');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
// const CircularDependencyPlugin = require('circular-dependency-plugin')
// const WorkboxPlugin = require('workbox-webpack-plugin');

const autoProvidedVars = { L: 'leaflet' };
const appFiles = './assets/js/app/oi.js';
const dbFiles = './assets/js/db/db-page.js';
const fdbkFiles = './assets/js/misc/feedback-viewer.js';
const libFiles = ['jquery', 'leaflet', 'leaflet-control-geocoder',
        './assets/js/libs/selectize.min.js', './assets/js/libs/flatpickr.min.js'];
 
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
    .addEntry('app', appFiles)
    .addEntry('db', dbFiles)
    .addEntry('feedback', fdbkFiles)
    .createSharedEntry('libs', libFiles)
; 
const local = Encore.getWebpackConfig();

// Set a unique name for the config (needed to generate assets via cli!)
local.name = 'local';
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
    .addEntry('app', appFiles)
    .addEntry('db', dbFiles)
    .addEntry('feedback', fdbkFiles)
    .createSharedEntry('libs', libFiles)
; 
const server = Encore.getWebpackConfig();
// Set a unique name for the config (needed to generate assets via cli!)
server.name = 'server';
// Remove the old version of uglify (doesn't parce es6)
server.plugins = server.plugins.filter(
    plugin => !(plugin instanceof webpack.optimize.UglifyJsPlugin)
);
// Add the new one
server.plugins.push(new UglifyJsPlugin());

// export the final configuration
module.exports = [server, local];

// Run [yarn run encore dev --config-name server] to generate assets for sites on server