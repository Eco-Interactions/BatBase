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
/* ------------------------ PUBLISHER --------------------------------------- */
export function initPublisherForm() {
    return publisher.initPublisherForm(...arguments);
}
export function onPublSelection() {
    return publisher.onPublSelection(...arguments);
}
/* ------------------------- PUBLICATION ------------------------------------ */
export function initPubForm() {
    return publication.initPubForm(...arguments);
}
export function loadPubTypeFields() {
    return publication.loadPubTypeFields(...arguments);
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
/* --------------------- PUBLICATION AND CITATION --------------------------- */
export function finishPubOrCitEditForm(entity) {
    if (entity === 'citation') { return citation.finishCitationEditForm(); }
    publication.finishPublicationEditForm();
}
/* ------------------------- INIT FORM COMBOS ------------------------------- */
/** Inits comboboxes for the source forms. */
export function initFormCombos(entity, fLvl) {
    const events = getEntityComboEvents(entity);                    /*dbug-log*///console.log("initFormCombos. [%s] formLvl = [%s], events = %O", entity, fLvl, events);
    if (!events) { return; }
    _cmbx('initFormCombos', [entity, fLvl, events]);
}
function getEntityComboEvents(entity) {
    return  {
        'citation': {
            'CitationType': {
                change: loadCitTypeFields },
            'Authors': {
                add: initAuthOrEdForm.bind(null, 1, 'Authors'),
                change: onAuthAndEdSelection.bind(null, 1, 'Authors')
            },
        },
        'publication': {
            'PublicationType': {
                change: loadPubTypeFields },
            'Publisher': {
                add: initPublisherForm,
                change: onPublSelection },
            'Authors': {
                add: initAuthOrEdForm.bind(null, 1, 'Authors'),
                change: onAuthAndEdSelection.bind(null, 1, 'Authors')
            },
            'Editors': {
                add: initAuthOrEdForm.bind(null, 1, 'Editors'),
                change: onAuthAndEdSelection.bind(null, 1, 'Editors')
            }
        }
    }[entity];
}
/* ************************* ENTITY FORMS *********************************** */
export function initCreateForm(entity, name) {                      /*dbug-log*///console.log('entity [%s], name [%s]', entity, name)
    const funcs = {
        'author': initAuthOrEdForm.bind(null, 1, 'Authors'),
        'citation': initCitForm,
        'editor': initAuthOrEdForm.bind(null, 1, 'Editors'),
        'publication': initPubForm,
        'publisher': initPublisherForm
    };
    return funcs[entity](name);
}