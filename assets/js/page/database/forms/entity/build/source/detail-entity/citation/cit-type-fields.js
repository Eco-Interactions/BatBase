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
import { _cmbx, _db, _u } from '~util';
import {  _elems, _state } from '~form';
import * as sForm from '../../src-form-main.js';
/* ----------------------- SELECT DEFAULT-TYPE ------------------------------ */
export function selectDefaultCitType() {                            /*dbug-log*///console.log('           /--selectDefaultCitType');
    return _db('getData', ['citTypeNames'])
        .then(types => setCitType(types));
}
function setCitType(cTypes) {
    const fLvl = _state('getSubFormLvl', ['sub']);
    const pData = _state('getFieldState', [fLvl, 'ParentSource', 'misc']);
    const pubType = pData.pubType.displayName;
    const defaultType = getDefaultCitType(pubType, pData);
    _cmbx('setSelVal', ['CitationType', cTypes[defaultType], 'silent']);
    addPubData(cTypes[defaultType], defaultType, fLvl);
    return loadCitTypeFields(cTypes[defaultType], defaultType);
}
function getDefaultCitType(pubType, pData) {
    return {
        Book: getBookDefault(pubType, pData),
        Journal: 'Article',
        Other: 'Other',
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
export function loadCitTypeFields(typeId, typeName) {               /*dbug-log*///console.log('           /--loadCitTypeFields id[%s] type[%s]', typeId, typeName);
    const fLvl = _state('getSubFormLvl', ['sub']);
    const type = typeName ? typeName : _cmbx('getSelTxt', ['CitationType']);
    return sForm.loadSrcTypeFields('Citation', typeId, type)
        .then(() => sForm.handleCitText(fLvl));
}
/* ------------------- UPDATE UI FOR CITATION-TYPE -------------------------- */
/**
 * Shows/hides the author field depending on whether the publication has authors
 * already. Disables title field for citations that don't allow sub-titles.
 */
export function handleSpecialCaseTypeUpdates(type, fLvl) {          /*dbug-log*///console.log('handleSpecialCaseTypeUpdates [%s][%s]', fLvl, type)
    const hndlrs = {
        Book: updateTitleField,
        Chapter: updateTitleField,
        "Master's Thesis": updateTitleField,
        'Museum record': disableFilledFields,
        Other: disableFilledFields,
        'Ph.D. Dissertation': updateTitleField,
        Report: disableFilledFields
    };
    if (Object.keys(hndlrs).indexOf(type) === -1) { return; }
    hndlrs[type](type, fLvl);
}
function updateTitleField(type) {
    if (type === 'Chapter'){
        toggleTitleField();
    } else {
        toggleTitleField('disable');
    }
}
function disableFilledFields(type, fLvl) {                          /*dbug-log*///console.log('disableFilledFields');
    $('#DisplayName_f input').prop('disabled', true);
    $('#Year_f input').prop('disabled', true);
    disableAuthorField(fLvl);
}
function disableAuthorField(fLvl) {
    _cmbx('enableComboboxes', [$(`#Author_f-cntnr select`), false]);
    const cnt = _state('getFieldState', [fLvl, 'Author', 'count']); /*dbug-log*///console.log('--disableAuthorField [%s] cnt[%s]', fLvl, cnt);
    sForm.removeAuthField('Author', cnt);
}
function toggleTitleField(disable = false) {                        /*dbug-log*///console.log('toggleTitleField disable?[%s]', disable);
    $('#DisplayName_f input').prop('disabled', !disable);
}
/* ------------------------- ADD PUB DATA ----------------------------------- */
/** Adds or removes publication data from the form's values, depending on type. */
function addPubData(typeId, type, fLvl) {                           /*dbug-log*///console.log('--addPubData[%s] type[%s][%s]', fLvl, type, typeId);
    const copy = ['Book', "Master's Thesis", 'Museum record', 'Other',
        'Ph.D. Dissertation', 'Report', 'Chapter' ];
    const addSameData = copy.indexOf(type) !== -1;
    addPubValues(fLvl, addSameData, type);
}
function addPubValues(fLvl, addValues, type) {
    if (_state('isEditForm', ['top'])) { return; }
    const fData = _state('getFormState', [fLvl, 'fields']);         /*dbug-log*///console.log('--addPubValues fData[%O]', _u('snapshot', [fData]))
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
    function addAuthorsToCitation() {                               /*dbug-log*///console.log('--addAuthorsToCitation');
        if (!fData.Author.value) { fData.Author.value = {}; }
        if (Object.keys(fData.Author.value).length) { return; }
        const pAuths = pSrc.authors;                                /*dbug-log*///console.log('    --pAuths?[%O]', pAuths);
        if (!addValues || !pAuths) { return; }
        fData.Author.value = pAuths ? pAuths : null;
    }
}