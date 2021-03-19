/**
 * Handles loading the citation-type fields.
 *
 * Export
 *     loadCitTypeFields
 *     selectDefaultCitType
 *     handleSpecialCaseTypeUpdates
 *
 * TOC
 *     SELECT DEFAULT-TYPE
 *     LOAD TYPE-FIELDS
 *     UPDATE UI FOR CITATION-TYPE
 *     ADD PUB DATA
 */
import { _db, _cmbx } from '~util';
import {  _state, _elems, getSubFormLvl } from '~form';
import * as sForm from '../../src-form-main.js';
/* ----------------------- SELECT DEFAULT-TYPE ------------------------------ */
export function selectDefaultCitType() {
    return _db('getData', ['citTypeNames'])
        .then(types => setCitType(types));
}
function setCitType(cTypes) {
    const fLvl = getSubFormLvl('sub');
    const pData = _state('getFieldState', [fLvl, 'ParentSource', 'misc']);
    const pubType = pData.pubType.displayName;
    const defaultType = getDefaultCitType(pubType, pData);
    _elems('setSilentVal', ['sub', 'CitationType', cTypes[defaultType]]);
    if (!_state('isEditForm')) { addPubData(cTypes[defaultType], defaultType, fLvl); }
    return loadCitTypeFields(cTypes[defaultType], defaultType);
}
function getDefaultCitType(pubType, pData) {
    return {
        'Book': getBookDefault(pubType, pData),
        'Journal': 'Article',
        'Other': 'Other',
        'Thesis/Dissertation': 'Ph.D. Dissertation'
    }[pubType];
}
function getBookDefault(pubType, pData) {
    const pubAuths = pData.src.authors;
    return pubAuths ? 'Book' : 'Chapter';
}
/* -------------------------- LOAD TYPE-FIELDS ------------------------------ */
/**
 * Adds relevant data from the parent publication into formVals before
 * loading the default fields for the selected Citation Type. If this is an
 * edit form, skip loading pub data...
 */
export function loadCitTypeFields(typeId, typeName) {               /*dbug-log*///console.log('           /--loadCitTypeFields');
    const fLvl = getSubFormLvl('sub');
    const type = typeName || this.$input[0].innerText;
    return sForm.loadSrcTypeFields('Citation', typeId, type)
        .then(finishCitTypeFields);

    function finishCitTypeFields() {
        sForm.handleCitText(fLvl);
        _elems('setDynamicFormStyles', ['Citation']);
        _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
    }
}
/* ------------------- UPDATE UI FOR CITATION-TYPE -------------------------- */
/**
 * Shows/hides the author field depending on whether the publication has authors
 * already. Disables title field for citations that don't allow sub-titles.
 */
export function handleSpecialCaseTypeUpdates(type, fLvl) {          /*dbug-log*///console.log('handleSpecialCaseTypeUpdates [%s]', type)
    const hndlrs = {
        'Book': updateBookFields,
        'Chapter': updateBookFields,
        "Master's Thesis": toggleTitleField,
        'Museum record': disableFilledFields,
        'Other': disableFilledFields,
        'Ph.D. Dissertation': disableTitleField,
        'Report': disableFilledFields
    };
    if (Object.keys(hndlrs).indexOf(type) === -1) { return; }
    hndlrs[type](type, fLvl);

    function updateBookFields() {
        if (type === 'Book'){ disableTitleField()} else { enableTitleField()}
    }
}
function disableFilledFields() {
    $('#Title_f input').prop('disabled', true);
    $('#Year_f input').prop('disabled', true);
    disableAuthorField();
}
function disableAuthorField() {
    if ($(`#Author_f-cntnr `)[0].children.length > 1) {
        $(`#Author_f-cntnr`)[0].lastChild.remove();
    }
    _cmbx('enableComboboxes', [$(`#Author_f-cntnr select`), false]);
}
function toggleTitleField(disable = false) {
    $('#Title_f input').prop('disabled', !disable);
}
/* ------------------------- ADD PUB DATA ----------------------------------- */
/** Adds or removes publication data from the form's values, depending on type. */
function addPubData(typeId, type, fLvl) {
    const copy = ['Book', "Master's Thesis", 'Museum record', 'Other',
        'Ph.D. Dissertation', 'Report', 'Chapter' ];
    const addSameData = copy.indexOf(type) !== -1;
    addPubValues(fLvl, addSameData, type);
}
function addPubValues(fLvl, addValues, type) {
    const fData = _state('getFormState', [fLvl, 'fields']);
    const pSrc = fData.ParentSource.misc.src;
    addPubTitle();
    addPubYear();
    addAuthorsToCitation();
    _state('setFormState', [fLvl, 'fields', fData]);
    /**
     * Adds the pub title to the citations form vals, unless the type should
     * be skipped, ie. have it's own title.
     * TODO (may not actually be needed. REFACTOR and check in later)
     */
    function addPubTitle() {
        if (fData.DisplayName.value) { return; }
        const skip = ['Chapter'];
        fData.DisplayName.value = addValues && skip.indexOf(type) === -1 ?
            pSrc.displayName : '';
    }
    function addPubYear() {
        fData.Year.value = addValues ? pSrc.year : '';
    }
    function addAuthorsToCitation() {
        const pAuths = pSrc.authors;
        if (!addValues || !pAuths) { return; }
        fData.Authors.value = pAuths ? pAuths : null;
    }
}