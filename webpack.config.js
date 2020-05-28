const Encore = require('@symfony/webpack-encore');
/* ========= PROD ======= */ 
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
/* ======== ALL =========== */
const autoProvidedVars = { L: 'leaflet', $: 'jquery', Sentry: '@sentry/browser' };
/** ======================== Configuration ================================== */
Encore
/* ======== DEV ======= */
    /* During rebuilds, all webpack assets that are not used will be removed. */
    .setPublicPath('/batplant/web/build')
/* ========= PROD ======= */ 
    /* the public path used by the web server to access the previous directory */
    // .setPublicPath('/build')
    /* Sends source maps to Sentry for bug/issue tracking. */
    // .addPlugin(new SentryWebpackPlugin({
    //     include: '.', test: [/\.js$/], release: '20200527_BEI', 
    //     debug: true, ignore: ['web', 'node_modules', 'webpack.config.js',  
    //         'vendor', '/assets/js/libs/*', '/assets/libs/*', 'var', 'features'],
    // }))
/* ======== ALL =========== */
    // the project directory where all compiled assets will be stored
    .setOutputPath('web/build')
    /** The prefix isn't being recognized for some reason */
    .setManifestKeyPrefix('build')
    // allow legacy applications to use $/jQuery as an app variable 
    // Note: Doesn't work if js not processed through webpack
    .autoProvidejQuery()
    // enable source maps during development
    .enableSourceMaps(true)
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
    /** ------- Loaders ----------------- */
    .enableStylusLoader()
    // .configureLoaderRule('images', loaderRule => {
    //     loaderRule.test = /\.(png|svg|jpe?g|gif)$/;
    //     loaderRule.options = { name: 'images/[name].[hash:8].[ext]' };
    // })
    // .addLoader({ test: /\.(pdf)$/, loader: 'file-loader', 
    //     options: { name: '../uploads/publications/[name].[ext]' } })
    /** ------- Files to process ----------------- */
    .copyFiles([{
        from: './assets/images',
        to: 'images/[name].[ext]'
    },{
        from: './assets/files',
        to: 'files/[name].[ext]'
    }])
    /** ------- Site Js/Style Entries ----------------- */
    .addEntry('app', './assets/js/app/oi.js')
    .addEntry('db', './assets/js/db-pg/db-main.js')
    .addEntry('feedback', './assets/js/app/feedback/feedback-viewer.js')
    .addEntry('pdfs', './assets/js/misc/view-pdfs.js')
    // if the same module (e.g. jquery) is required by multiple entry files, they will require the same object.
    .enableSingleRuntimeChunk()
    // Optimizes code by breaking files into the smallest size needed to run the page (builds lots of files)
    .splitEntryChunks()
; 
const confg = Encore.getWebpackConfig();

/* Force Webpack to display errors/warnings */
// confg.stats.errors = true;
// confg.stats.warnings = true;

// Change the source map generated in development mode so logs show the original code line numbers
if (Encore.isProduction()) {
    confg.devtool = 'source-map';
} else {
    confg.devtool = 'eval-source-map';
}
module.exports = confg;