/**
 * Handles loading the citation-type fields.
 *
 * Export
 *     loadCitTypeFields
 *     selectDefaultCitType
 *     handleCitationTypeData
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
    handleCitationTypeData(defaultType, fLvl);
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
/* ------------------------- ADD PUB DATA ----------------------------------- */
export function handleCitationTypeData(type, fLvl) {                /*dbug-log*///console.log('handleCitationTypeData [%s][%s]', fLvl, type)
    const copy = ['Book', "Master's Thesis", 'Museum record', 'Other',
        'Ph.D. Dissertation', 'Report', 'Chapter' ];
    const addSameData = copy.indexOf(type) !== -1;
    addPubValues(fLvl, addSameData, type);
}
/**
 * Adds or removes publication data from the form's values and elems, disabling
 * fields with data from the publication entity.
 */
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
    function addPubTitle() {                                        /*dbug-log*///console.log('--addPubTitle');
        const skip = ['Chapter', 'Article'];
        fData.DisplayName.value = addValues && skip.indexOf(type) === -1 ? pSrc.displayName : '';
        toggleTitleField(skip.indexOf(type) !== -1);
    }
    function toggleTitleField(enable = false) {                     /*dbug-log*///console.log('toggleTitleField enable?[%s]', enable);
        $('#DisplayName_f input').prop('disabled', !enable);
        const title = enable ? '' : fData.DisplayName.value;
        $('#DisplayName_f input').val(title);
    }
    function addPubYear() {
        fData.Year.value = addValues ? pSrc.year : '';
            $('#Year_f input').prop('disabled', addValues);
    }
    function addAuthorsToCitation() {                               /*dbug-log*///console.log('--addAuthorsToCitation');
        if (!fData.Author.value) { fData.Author.value = {}; }
        const pAuths = pSrc.authors;                                /*dbug-log*///console.log('    --pAuths?[%O]', pAuths);
        if (!addValues || !pAuths) { return; }
        fData.Author.value = pAuths ? pAuths : null;
        disableAuthorField(fLvl);
    }
}
function disableAuthorField(fLvl) {
    if (!$('#sel-Author1').length) { return; }
    _cmbx('enableComboboxes', [$(`#Author_f-cntnr select`), false]);
    sForm.removeAuthorComboIfEmpty('Author', fLvl);
}