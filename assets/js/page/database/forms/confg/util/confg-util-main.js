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
import * as update from './on-confg-change.js';

export function mergeIntoFormConfg() {
    merge.mergeIntoFormConfg(...arguments);
}
export function getBaseFormConfg() {
    return base.getBaseFormConfg(...arguments);
}
export function onEntityTypeChangeUpdateConfg() {
    update.onEntityTypeChangeUpdateConfg(...arguments);
}
export function onFieldViewChangeUpdateConfg() {
    update.onFieldViewChangeUpdateConfg(...arguments);
}