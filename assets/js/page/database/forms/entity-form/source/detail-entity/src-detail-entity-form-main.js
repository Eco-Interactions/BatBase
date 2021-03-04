/**
 * Facade for source-type code.
 *
 * TOC
 *     AUTHOR
 *
 */
import { _elems } from '~form';
import * as author from './author/auth-form-main.js';
import * as publisher from './publisher/publisher-form.js';
import * as citation from './citation/citation-form.js';
import * as publication from './publication/publication-form.js';
import * as typeFields from './pub-and-cit-type-fields.js';

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
export function loadSrcTypeFields() {
    return typeFields.loadSrcTypeFields(...arguments);
}
/* ------------------------- INIT FORM COMBOS ------------------------------- */
/** Inits comboboxes for the source forms. */
export function initCombos(fLvl, entity) {
    const events = getEntityComboEvents(fLvl, entity);                    /*dbug-log*///console.log("initCombos. [%s] formLvl = [%s], events = %O", entity, fLvl, events);
    if (!events) { return; }
    _elems('initFormCombos', [fLvl, events]);
}
function getEntityComboEvents(fLvl, entity) {
    return  {
        'citation': {
            'CitationType': {
                onChange: loadCitTypeFields.bind(null, fLvl) },
            'Author': {
                create: author.initAuthOrEdForm.bind(null, 1, 'Author'),
                onChange: author.onAuthAndEdSelection.bind(null, 1, 'Author')
            },
        },
        'publication': {
            'PublicationType': {
                onChange: loadPubTypeFields.bind(null, fLvl) },
            'Publisher': {
                create: initPublisherForm,
                onChange: onPublSelection },
            'Author': {
                create: author.initAuthOrEdForm.bind(null, 1, 'Author'),
                onChange: author.onAuthAndEdSelection.bind(null, 1, 'Author')
            },
            'Editor': {
                create: author.initAuthOrEdForm.bind(null, 1, 'Editor'),
                onChange: author.onAuthAndEdSelection.bind(null, 1, 'Editor')
            }
        }
    }[entity];
}
/* ************************* ENTITY FORMS *********************************** */
export function initCreateForm(entity, name) {                      /*dbug-log*///console.log('initCreateForm [%s] name [%s]', entity, name)
    const funcs = {
        'author': initAuthOrEdForm.bind(null, 1, 'Author'),
        'citation': initCitForm,
        'editor': initAuthOrEdForm.bind(null, 1, 'Editor'),
        'publication': initPubForm,
        'publisher': initPublisherForm
    };
    return funcs[entity](name);
}