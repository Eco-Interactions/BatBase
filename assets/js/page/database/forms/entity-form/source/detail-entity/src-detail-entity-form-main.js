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
/* ------------------------ PUBLISHER --------------------------------------- */
export function onPublSelection() {
    return publisher.onPublSelection(...arguments);
}
/* ------------------------- PUBLICATION ------------------------------------ */
/* ------------------------- CITATION --------------------------------------- */
export function handleCitText() {
    return citation.handleCitText(...arguments);
}
/* --------------------- PUBLICATION AND CITATION --------------------------- */
export function finishFieldLoad(entity, fLvl) {
    if (entity === 'citation') { return citation.finishFieldLoad(); }
    publication.finishFieldLoad(fLvl);
}
export function loadSrcTypeFields() {
    return typeFields.loadSrcTypeFields(...arguments);
}
/* ------------------------- INIT FORM COMBOS ------------------------------- */
/** Inits comboboxes for the source forms. */
export function initCombos(fLvl, entity) {
    const events = getEntityComboEvents(fLvl, entity);              /*dbug-log*///console.log("initCombos. [%s] formLvl = [%s], events = %O", entity, fLvl, events);
    if (!events) { return; }
    _elems('initFormCombos', [fLvl, events]);
}
function getEntityComboEvents(fLvl, entity) {
    return  {
        'Citation': {
            'CitationType': {
                onChange: citation.loadCitTypeFields.bind(null, fLvl) },
            'Author': {
                create: author.initCreateForm.bind(null, 1, 'Author'),
                onChange: author.onAuthAndEdSelection.bind(null, 1, 'Author')
            },
        },
        'Publication': {
            'PublicationType': {
                onChange: publication.loadPubTypeFields.bind(null, fLvl) },
            'Publisher': {
                create: initCreateForm,
                onChange: onPublSelection },
            'Author': {
                create: author.initCreateForm.bind(null, 1, 'Author'),
                onChange: author.onAuthAndEdSelection.bind(null, 1, 'Author')
            },
            'Editor': {
                create: author.initCreateForm.bind(null, 1, 'Editor'),
                onChange: author.onAuthAndEdSelection.bind(null, 1, 'Editor')
            }
        }
    }[entity];
}
/* ************************* ENTITY FORMS *********************************** */
export function initCreateForm(entity, name) {                      /*dbug-log*///console.log('initCreateForm [%s] name [%s]', entity, name)
    const funcs = {
        Author: author.initCreateForm.bind(null, 1, 'Author'),
        Citation: citation.initCreateForm,
        Editor: author.initCreateForm.bind(null, 1, 'Editor'),
        Publication: publication.initCreateForm,
        Publisher: publisher.initCreateForm
    };
    return funcs[entity](name);
}
export function initEditForm(entity, id) {                          /*dbug-log*///console.log('initEditForm entity[%s] id[%s]', entity, id);
    const funcs = {
        Author: author.initEditForm,
        Citation: citation.initEditForm,
        Publication: publication.initEditForm,
        Publisher: publisher.initEditForm
    };
    return funcs[entity](id);
}