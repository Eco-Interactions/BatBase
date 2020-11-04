/**
 * @module app/util
 * App util methods.
 *
 * TOC
 *     APP ALERTS
 *     APP MODALS
 * 	   AJAX
 *     HTML ELEMS
 *     FIELDS AND ROWS
 *     STRINGS
 *     MISC
 */
import * as db from './local-data/local-data-main.js';
import * as cmbx from './elems/combobox/combobox-main.js';
import * as elems from './elems/elems-main.js';
import * as uAjax from './misc/ajax-util.js';
import * as alert from './misc/alert-issue.js';
import * as modal from './misc/intro-modals.js';
import * as misc from './misc/misc-util-main.js';
import extendPrototypes from './misc/extend.js';

export function initUtil() {
    extendPrototypes();
}
/** ===================== MODULE-EXECUTOR =================================== */
export function executeMethod(funcName, mod, modName, caller, params = []) {
    if (!Array.isArray(params)) { params = [params]; }  //Catches events typically.
    try {
        return mod[funcName](...params);
    } catch(e) {
        alert.alertIssue('facadeErr', {module: modName, caller: caller, called: funcName, error: e.toString(), errMsg: e.message});
        if ($('body').data('env') === 'prod') { return; }
        console.error('[%s][%s] module: [%s] call failed.  params = %O, err = %O', caller, modName, funcName, params, e);
    }
}
function moduleMethod(funcName, mod, modName, params) {
    return executeMethod(funcName, mod, modName, 'app-main', params);
}
export function _alert(funcName, params = []) {
    return moduleMethod(funcName, alert, 'app-alert', params);
}
export function _cmbx(funcName, params = []) {
    return moduleMethod(funcName, cmbx, 'app-cmbx', params);
}
export function _db(funcName, params = []) {
    return moduleMethod(funcName, db, 'app-db', params);
}
export function _el(funcName, params = []) {
    return moduleMethod(funcName, elems, 'app-elems', params);
}
export function _modal(funcName, params = []) {
    return moduleMethod(funcName, db, 'app-db', params);
}
export function _u(funcName, params = []) {
    return moduleMethod(funcName, misc, 'app-util', params);
}