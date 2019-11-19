/**
 *
 *
 *
 * 
 */
import * as _cmbx from './combobox-util.js';
import * as _elems from './form-elems.js';
import * as _pnl from './detail-panel.js';

export function elems(funcName, params) {
    return _elems[funcName](...params);
}
export function combos(funcName, params) {
    return _cmbx[funcName](...params);
}
export function panel(funcName, params) {
    return _pnl[funcName](...params);
}