/**
 * Selectized combobox methods.
 *
 * Export
 *     initCombobox
 *     initComboboxes
 *     getSelVal
 *     setSelVal
 *     updatePlaceholderText
 *     replaceSelOpts
 *     triggerComboChangeReturnPromise
 *
 * TOC
 *     OPTIONS
 *     UTILITY
 */
import * as opts from './get-options.js';
import * as util from './combobox-util.js';
/* ===================== OPTIONS ============================================ */
export function getOptsFromStoredData() {
    return opts.getOptsFromStoredData(...arguments);
}
export function getFieldOptions() {
    return opts.getFieldOptions(...arguments);
}
export function getRcrdOpts() {
    return opts.getRcrdOpts(...arguments);
}
export function buildSrcOpts() {
    return opts.buildSrcOpts(...arguments);
}
export function getTaxonOpts() {
    return opts.getTaxonOpts(...arguments);
}
export function alphabetizeOpts() {
    return opts.alphabetizeOpts(...arguments);
}
/* ===================== UTILITY ============================================ */
export function initCombobox() {
    return util.initCombobox(...arguments);
}
export function updatePlaceholderText() {
    return util.updatePlaceholderText(...arguments);
}
export function getSelVal() {
    return util.getSelVal(...arguments);
}
export function getSelTxt() {
    return util.getSelTxt(...arguments);
}
export function setSelVal() {
    return util.setSelVal(...arguments);
}
export function resetCombobox() {
    return util.resetCombobox(...arguments);
}
export function enableCombobox() {
    return util.enableCombobox(...arguments);
}
export function enableComboboxes() {
    return util.enableComboboxes(...arguments);
}
export function enableFirstCombobox() {
    return util.enableFirstCombobox(...arguments);
}
export function focusCombobox() {
    return util.focusCombobox(...arguments);
}
export function focusFirstCombobox() {
    return util.focusFirstCombobox(...arguments);
}
export function triggerComboChangeReturnPromise() {
    return util.triggerComboChangeReturnPromise(...arguments);
}
export function destroySelectizeInstance() {
    return util.destroySelectizeInstance(...arguments);
}
export function replaceSelOpts() {
    return util.replaceSelOpts(...arguments);
}
export function removeOpt() {
    return util.removeOpt(...arguments);
}