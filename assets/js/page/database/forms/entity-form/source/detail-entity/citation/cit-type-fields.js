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
 */
import { _db, _cmbx } from '~util';
import {  _state, _elems, getSubFormLvl } from '~form';
import * as sForm from '../../src-form-main.js';

let rmvdAuthField = {};
/* ----------------------- SELECT DEFAULT-TYPE ------------------------------ */
export function selectDefaultCitType() {
    rmvdAuthField = {};
    return _db('getData', ['citTypeNames'])
        .then(types => setCitType(types));
}
function setCitType(citTypes) {
    const rcrds = _state('getFormProp', ['sub', 'rcrds']);
    const pubType = rcrds.pub.publicationType.displayName;
    const defaultType = getDefaultCitType(pubType, rcrds);
    _elems('setSilentVal', ['sub', 'CitationType', citTypes[defaultType]]);
    return loadCitTypeFields(citTypes[defaultType], defaultType);
}
function getDefaultCitType(pubType, rcrds) {
    return {
        'Book': getBookDefault(pubType, rcrds),
        'Journal': 'Article',
        'Other': 'Other',
        'Thesis/Dissertation': 'Ph.D. Dissertation'
    }[pubType];
}
function getBookDefault(pubType, rcrds) {
    const pubAuths = rcrds.src.authors;
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
    if (!_state('isEditForm')) { addPubData(typeId, type, fLvl); }
    return sForm.loadSrcTypeFields('citation', typeId, type)
        .then(finishCitTypeFields);

    function finishCitTypeFields() {
        handleSpecialCaseTypeUpdates(type, fLvl);
        sForm.handleCitText(fLvl);
        _elems('setCoreRowStyles', ['citation']);
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
        'Book': updateBookFields, 'Chapter': updateBookFields,
        "Master's Thesis": disableTitleField, 'Other': disableFilledFields,
        'Ph.D. Dissertation': disableTitleField, 'Museum record': disableFilledFields,
        'Report': disableFilledFields };
        if (Object.keys(hndlrs).indexOf(type) === -1) { return; }
    hndlrs[type](type, fLvl);

    function updateBookFields() {
        const fS = _state('getFormLvlState', [fLvl]);
        const pubAuths = fS.rcrds.src.authors;
        if (!pubAuths) { return reshowAuthorField(); }
        removeAuthorField();
        if (type === 'Book'){ disableTitleField()} else { enableTitleField()}

        function reshowAuthorField() {
            if (!rmvdAuthField.authRow) { return; } //Field was never removed
            $('#citation_fields').append(rmvdAuthField.authRow);
            _state('addRequiredFieldInput', [fLvl, rmvdAuthField.authElem]);
            _state('setFormFieldData', [fLvl, 'Authors', {}, 'multiSelect']);
            delete rmvdAuthField.authRow;
            delete rmvdAuthField.authElem;
        }
        function removeAuthorField() {
            rmvdAuthField.authRow = $('#Authors_f').detach();
            _state('setFormProp', [fLvl, 'reqElems', removeAuthorElem()])
            removeFromFieldData();

            function removeAuthorElem() {
                return fS.reqElems.filter(elem => {
                    if (!elem.id.includes('Authors')) { return true; }
                    rmvdAuthField.authElem = elem;
                    return false;
                });
            }
            function removeFromFieldData() {
                const data = _state('getFormProp', [fLvl, 'fieldData']);
                delete data.Authors;
                _state('setFormProp', [fLvl, 'fieldData', data]);
            }
        }
    }
    function disableFilledFields() {
        $('#Title_f input').prop('disabled', true);
        $('#Year_f input').prop('disabled', true);
        disableAuthorField();
    }
    function disableAuthorField() {
        if ($(`#Authors_f-cntnr`)[0].children.length > 1) {
            $(`#Authors_f-cntnr`)[0].lastChild.remove();
        }
        _cmbx('enableComboboxes', [$(`#Authors_f-cntnr select`), false]);
    }
    function disableTitleField() {
        $('#Title_f input').prop('disabled', true);
    }
    function enableTitleField() {
        $('#Title_f input').prop('disabled', false);
    }
}
/* ---------------------------- EDIT-FORM ----------------------------------- */
/** Adds or removes publication data from the form's values, depending on type. */
function addPubData(typeId, type, fLvl) {
    const copy = ['Book', "Master's Thesis", 'Museum record', 'Other',
        'Ph.D. Dissertation', 'Report', 'Chapter' ];
    const addSameData = copy.indexOf(type) !== -1;
    addPubValues(fLvl, addSameData, type);
}
function addPubValues(fLvl, addValues, type) {
    const fieldData = _state('getFormProp', [fLvl, 'fieldData']);
    const rcrds = _state('getFormProp', [fLvl, 'rcrds']);
    addPubTitle(addValues, fLvl, type);
    addPubYear(addValues, fLvl);
    addAuthorsToCitation(addValues, fLvl, type);
    _state('setFormProp', [fLvl, 'fieldData', fieldData]);
    /**
     * Adds the pub title to the citations form vals, unless the type should
     * be skipped, ie. have it's own title. (may not actually be needed. REFACTOR and check in later)
     */
    function addPubTitle(addTitle, fLvl, type) {
        if (fieldData.Title.val) { return; }
        const skip = ['Chapter'];
        fieldData.Title = {};
        fieldData.Title.val = addTitle && skip.indexOf(type) === -1 ?
            rcrds.src.displayName : '';
    }
    function addPubYear(addYear, fLvl) {
        fieldData.Year = {};
        fieldData.Year.val = addYear ? rcrds.src.year : '';
    }
    function addAuthorsToCitation(addAuths, fLvl, type) {
        const pubAuths = rcrds.src.authors;
        if (addAuths && pubAuths) { return addExistingPubContribs(fLvl, pubAuths); }
    }
    /**
     * If the parent publication has existing authors, they are added to the new
     * citation form's author field(s).
     */
    function addExistingPubContribs(fLvl, auths) {
        fieldData.Authors = { type: "multiSelect" };
        fieldData.Authors.val = auths ? auths : null;
    }
}