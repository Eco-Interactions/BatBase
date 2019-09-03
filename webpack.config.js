const Encore = require('@symfony/webpack-encore');

const autoProvidedVars = { L: 'leaflet', $: 'jquery' };

/** ================= CLI ======================= */
// yarn run encore [dev|production] [--watch]
/** ================= Configuration ======================= */
Encore
    // the project directory where all compiled assets will be stored
    .setOutputPath('web/build')

//--->
   /* ==== DEV ==== */
    .setPublicPath('/batplant/web/build')
    
   /* ==== PROD ==== */ 
    // the public path used by the web server to access the previous directory
    // .setPublicPath('/build')
//--->

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
    /** ------- Loaders ----------------- */
    // .configureLoaderRule('images', loaderRule => {
    //     loaderRule.test = /\.(png|svg|jpe?g|gif)$/;
    //     loaderRule.options = { name: 'images/[name].[hash:8].[ext]' };
    // })
    // .addLoader({ test: /\.(pdf)$/, loader: 'file-loader', 
    //     options: { name: '../uploads/publications/[name].[ext]' } })
    /** ------- Files to process ----------------- */
    // .copyFiles({
    //     from: './assets/uploads/publications',
    //     to: 'publications/[name].[hash:8].[ext]'
    // })
    /** ------- Site Js/Style Entries ----------------- */
    .addEntry('app', './assets/js/app/oi.js')
    .addEntry('db', './assets/js/db/db-page.js')
    .addEntry('feedback', './assets/js/misc/feedback-viewer.js')
    .addEntry('pdfs', './assets/js/misc/view-pdfs.js')
    // .createSharedEntry('libs', './assets/js/app/libs.js')
    // if the same module (e.g. jquery) is required by multiple entry files, they will require the same object.
    .enableSingleRuntimeChunk()
    .splitEntryChunks()
; 
const confg = Encore.getWebpackConfig();

// Change the source map generated in development mode so logs show the original code line numbers
if (!Encore.isProduction()) {
    confg.devtool = 'eval-source-map';
}

module.exports = confg;