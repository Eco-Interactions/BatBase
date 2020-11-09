const Encore = require('@symfony/webpack-encore');
/* ========= PROD ======= */
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
/* ======== ALL =========== */
const autoProvidedVars = { L: 'leaflet', $: 'jquery', Sentry: '@sentry/browser' };
const path = require('path');
/** ======================== Configuration ================================== */
Encore
/* ======== DEV ======= */
    /* During rebuilds, all webpack assets that are not used will be removed. */
    .setPublicPath('/BatBase/public/build')
/* ========= SERVER ======= */
    /* the public path used by the web server to access the previous directory */
    // .setPublicPath('/build')
/* -------- PROD ------- */
    /* Sends source maps to Sentry for bug/issue tracking. */
    // .addPlugin(new SentryWebpackPlugin({
    //     include: '.', test: [/\.js$/], release: '20200926_BB',
    //     debug: true, ignore: ['web', 'node_modules', 'webpack.config.js',
    //         'vendor', '/assets/js/libs/*', '/assets/libs/*', 'var', 'features'],
    // }))
/* ======== ALL =========== */
    // the project directory where all compiled assets will be stored
    .setOutputPath('public/build')
    /** The prefix isn't being recognized for some reason */
    .setManifestKeyPrefix('build')
    // allow legacy applications to use $/jQuery as an app variable
    // Note: Doesn't work if js not processed through webpack
    .autoProvidejQuery()
    // enable source maps during development
    .enableSourceMaps(true)
    // empty the outputPath dir before each build
    .cleanupOutputBeforeBuild()
    // show OS notifications when builds finish/fail
    .enableBuildNotifications(true, (options) => {
        options.alwaysNotify = true;
    })
    // filenames include a hash that changes whenever the file contents change
    .enableVersioning()
    // you can use this method to provide other common global variables,
    // such as '_' for the 'underscore' library
    .autoProvideVariables(autoProvidedVars)
    /** ------- Loaders ----------------- */
    .enableStylusLoader()
    // .configureLoaderRule('images', loaderRule => {
    //     loaderRule.test = /\.(png|svg|jpe?g|gif)$/;
    //     loaderRule.options = { name: 'images/[name].[hash:8].[ext]' };
    // })
    .addLoader({
        test: /\.(pdf)$/,
        use: [ {
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: './assets/files/'
            }
        }]
    })
    /** ------- Files to process ----------------- */
    .copyFiles([{
        from: './assets/images',
        to: 'images/[name].[ext]'
    },{
        from: './assets/files',
        to: 'files/[name].[ext]'
    }])
    /** ------- Site Js/Style Entries ----------------- */
    .addEntry('app', './assets/js/main.js')
    .addEntry('db', './assets/js/page/database/db-main.js')
    .addEntry('feedback', './assets/js/page/feedback/feedback-viewer.js')
    .addEntry('pdfs', './assets/js/page/view-pdfs.js')
    .addEntry('entity', './assets/js/page/entity/entity-show.js')
    // if the same module (e.g. jquery) is required by multiple entry files, they will require the same object.
    .enableSingleRuntimeChunk()
    // Optimizes code by breaking files into the smallest size needed to run the page (builds lots of files)
    .splitEntryChunks()
;
const config = Encore.getWebpackConfig();

config.resolve.alias["db"] = path.resolve(__dirname, 'assets/js/page/database/');
config.resolve.alias["~db"] = path.resolve(__dirname, 'assets/js/page/database/db-main.js');
config.resolve.alias["~form"] = path.resolve(__dirname, 'assets/js/page/database/forms/forms-main.js');
config.resolve.alias["images"] = path.resolve(__dirname, 'assets/images/');
config.resolve.alias["styles"] = path.resolve(__dirname, 'assets/styles/');
config.resolve.alias["libs"] = path.resolve(__dirname, 'assets/libs/');
config.resolve.alias["~util"] = path.resolve(__dirname, 'assets/js/util/util-main.js');

/* Force Webpack to display errors/warnings */
// config.stats.errors = true;
// config.stats.warnings = true;

// Change the source map generated in development mode so logs show the original code line numbers
if (Encore.isProduction()) {
    config.devtool = 'source-map';
} else {
    config.devtool = 'eval-source-map';
}
module.exports = config;