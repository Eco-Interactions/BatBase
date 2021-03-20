/**
 * TODO: DOCUMENT
 *
 * Export
 *
 *
 * TOC
 *
 */
import * as merge from './merge-confgs.js';
import * as base from './base-confg.js';
import * as view from './build-view-confg.js';

export function mergeIntoFormConfg() {
    merge.mergeIntoFormConfg(...arguments);
}
export function mergeFieldConfg() {
    merge.mergeFieldConfg(...arguments);
}
export function getBaseFormConfg() {
    return base.getBaseFormConfg(...arguments);
}
export function buildViewConfg() {
    return view.buildViewConfg(...arguments);
}