/**
 * Facade for source-type code.
 *
 * TOC
 *     AUTHOR
 *
 */
import * as auth from './author-src-form.js';
import * as publisher from './publisher-src-form.js';
// import * as auth from './author-src-form.js';
// import * as auth from './author-src-form.js';

/* --------------------------- AUTHOR --------------------------------------- */
export function selectExistingAuthsOrEds() {
    return auth.selectExistingAuthsOrEds(...arguments);
}
export function onAuthAndEdSelection() {
    return auth.onAuthAndEdSelection(...arguments);
}
export function initAuthOrEdForm() {
    return auth.initAuthOrEdForm(...arguments);
}
/* ------------------------ PUBLISHER --------------------------------------- */
export function initPublisherForm() {
    return publisher.initPublisherForm(...arguments);
}
export function onPublSelection() {
    return publisher.onPublSelection(...arguments);
}