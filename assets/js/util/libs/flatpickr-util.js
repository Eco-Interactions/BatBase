/**
 * App utility methods for the Flatpickr calendar used for date/time selection.
 *
 * Export
 *     getNewCalendar
 *
 * TOC
 *     INIT
 *     PLUG-INS
 */
import * as Flatpickr from 'flatpickr';
import * as ConfirmDatePlugin from 'flatpickr/dist/plugins/confirmDate/confirmDate.js';
import * as DateRangePlugin from 'flatpickr/dist/plugins/rangePlugin.js';
/* ========================== INIT ========================================== */
/**
 * Instantiates the flatpickr calendar and returns the flatpickr calendar.
 * @param  {obj}  confg  Required: elemId(str), onClose(fun), plugins(ary)
 * @return {obj}         New Flatpickr calendar instance.
 */
export function getNewCalendar(confg) {                             /*dbug-log*///console.log('getNewCalendar [%s] confg = %O', confg.elemId, confg);
    return new Flatpickr(confg.elemId, getCalOptions(confg));
}
function getCalOptions(confg) {
    const opts = {
        altInput: true,
        defaultDate: getDefaultTimeIfTesting(confg.elemId),
        disableMobile: true,
        enableTime: confg.enableTime,
        maxDate: 'today',
        onClose: confg.onClose,
        onReady: getCalOnReadyMethod(confg.enableTime),
        plugins: getCalPlugins(confg.plugins),
    };
    if (confg.mode) { opts.mode = confg.mode }                       /*dbug-log*///console.log('getCalOpts = %O', opts)
    return opts;
}
/** If time can be selected, sets the default time to be 1200 AM. */
function getCalOnReadyMethod(time) {
    return time ? function() {this.amPM.textContent = "AM"} : Function.prototype;
}
/**
 * There doesn't seem to be a way to set the date on the flatpickr calendar
 * from the selenium/behat tests. A data property is added to the calendar elem
 * and that date is set as the default for the calendar.
 */
function getDefaultTimeIfTesting(id) {
    return $(id).data('defaultDate') || false;
}
/* ========================== PLUG-INS ====================================== */
/**
 * Instanciates the plugins for the new fltpickr calendar.
 * @param  {array} plugins  Names of plugins to include.
 * @return {array}         Instanciated plugins.
 */
function getCalPlugins(plugins) {
    if (!plugins) { return []; }
    return Object.keys(plugins).map(k => getPlugin(k, plugins[k]));
}
function getPlugin(name, opts) {                                    /*dbug-log*///console.log('New [%s] = %O', name, opts);
    return {
        'confirm':  getConfirmDatePlugin,
        'range':    getDateRangePlugin
    }[name](opts);
}
function getConfirmDatePlugin(opts) {                               /*dbug-log*///console.log('getConfirmDatePlugin. opts = %O', opts);
    return new ConfirmDatePlugin(opts);
}
function getDateRangePlugin(opts) {                                 /*dbug-log*///console.log('getDateRangePlugin. opts = %O', opts);
    return new DateRangePlugin(opts);
}