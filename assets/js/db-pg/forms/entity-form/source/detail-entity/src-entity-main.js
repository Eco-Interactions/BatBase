/**
 * Facade for source-type code.
 *
 * TOC
 *     AUTHOR
 *
 */
import * as author from './author-form.js';
import * as publisher from './publisher-form.js';
import * as citation from './citation/citation-form.js';
import * as publication from './publication-form.js';
/* --------------------------- AUTHOR --------------------------------------- */
export function selectExistingAuthsOrEds() {
    return author.selectExistingAuthsOrEds(...arguments);
}
export function onAuthAndEdSelection() {
    return author.onAuthAndEdSelection(...arguments);
}
export function initAuthOrEdForm() {
    return author.initAuthOrEdForm(...arguments);
}
/* ------------------------- CITATION --------------------------------------- */
export function initCitForm() {
    return citation.initCitForm(...arguments);
}
export function handleCitText() {
    return citation.handleCitText(...arguments);
}
export function loadCitTypeFields() {
    return citation.loadCitTypeFields.bind(this)(...arguments);
}
export function finishCitationEditForm() {
    return citation.finishCitationEditForm(...arguments);
}
/* ------------------------- PUBLICATION --------------------------------------- */
export function initPubForm() {
    return publication.initPubForm(...arguments);
}
export function loadPubTypeFields() {
    return publication.loadPubTypeFields(...arguments);
}
/* ------------------------ PUBLISHER --------------------------------------- */
export function initPublisherForm() {
    return publisher.initPublisherForm(...arguments);
}
export function onPublSelection() {
    return publisher.onPublSelection(...arguments);
}
/* ===================== PUBLICATION AND CITATION =========================== */
export function finishPubOrCitEditForm(entity) {
    if (entity === 'citation') { return citation.finishCitationEditForm(); }
    publication.finishPublicationEditForm();
}