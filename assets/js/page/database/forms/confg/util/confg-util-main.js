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

export function mergeIntoFormConfg() {
    merge.mergeIntoFormConfg(...arguments);
}
export function getBaseFormConfg() {
    return base.getBaseFormConfg(...arguments);
}