/**
 * Form-field builder.  rowDiv>(alertDiv, fieldDiv>(label, input, [pin]))
 * - onChange:
 *     -- Update value in field-state
 *     -- If required-field, the form submit-button is toggled as needed.
 *     -- If citation form, citation-text auto-generated as needed.
 * TODO: DOCUMENT
 *
 * Export
 *     buildFormField
 *     setOnMultiSelectChangeListener
 *
 * TOC
 *     BUILD INPUT
 *     BUILD FIELD
 *         IF PINNABLE
 *         FIELD STATE
 *         SET VALUE
 *     ON FIELD CHANGE
 *         IF CITATION FORM, REGENERATE CITATION
 *         IF REQUIRED FIELD, HANDLE SUBMIT
 *         STORE FIELD-DATA
 *             MULTI-SELECT DATA
 */
import { _el, _u } from '~util';
import { _state } from '~form';

let f;

export function buildFormField(fConfg, input) {
    f = fConfg;                                                     /*dbug-log*/console.log('buildFormField field[%O]', f);
    const field = buildFormFieldElems(input);
    addPinIfFieldDataCanPersistThroughMultipleSubmits(field);
    updateFormFieldState();
    return field;
}
/* ====================== BUILD FIELD ======================================= */
function buildFormFieldElems(input) {                               /*dbug-log*/console.log('buildFormFieldElems input[%O]', input);
    f.input = input;
    handleFieldChangeListeners(f);
    return _el('getFieldElems', [f]);
}
/* -------------------------- IF PINNABLE ------------------------------------ */
function addPinIfFieldDataCanPersistThroughMultipleSubmits(field) { /*dbug-log*/console.log('addPinIfFieldDataCanPersistThroughMultipleSubmits pinnable?[%s]', f.pinnable);
    if (!f.pinnable) { return; }
    const pin = getFormFieldPin(f.name);
    $(field).append(pin);
}
/* -------------------------- FIELD STATE ----------------------------------- */
function updateFormFieldState() {                                   /*dbug-log*/console.log('updateFormState f[%O]', _u('snapshot', [f]));
    if (f.combo) { _state('addComboToFormState', [f.group, f.name]) };
}
/* --------------------------- SET VALUE ------------------------------------ */
function setFieldValue() {
    _state('setFormFieldData', [f.group, f.name, f.value, f.type]);
    if (f.type != 'multiSelect') { $(f.input).val(f.value); }
}
/* =========================== ON FIELD CHANGE ============================== */
function handleFieldChangeListeners() {                             /*dbug-log*/console.log('handleFieldChangeListeners',);
    ifCitationFormAutoGenerateCitationOnChange();
    onChangeStoreFieldValue(f);
    if (f.required) { handleRequiredField(); }
}
/* -------------- IF CITATION FORM, REGENERATE CITATION --------------------- */
function ifCitationFormAutoGenerateCitationOnChange() {
    if (f.name === 'citation'){
        $(f.input).change(_form.bind(null, 'handleCitText', [fLvl]));
    }
}
/* ---------------- IF REQUIRED FIELD, HANDLE SUBMIT ------------------------ */
/**
 * Required field's have a 'required' class added which appends '*' to their
 * label. Added to the input elem is a change event reponsible for enabling/
 * disabling the submit button and a form-level data property. The input elem
 * is added to the form param's reqElems property.
 */
function handleRequiredField() {
    $(f.input).change(checkRequiredFields);
    $(f.input).data('fLvl', f.group);
    _state('addRequiredFieldInput', [f.group, f.input]);
}
/**
 * On a required field's change event, the submit button for the element's form
 * is enabled if all of it's required fields have values and it has no open child
 * forms.
 */
function checkRequiredFields(e) {                                   /*dbug-log*/console.log('checkRequiredFields e = %O', e)
    const fLvl = $(e.currentTarget).data('fLvl');
   _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
}
/* ----------------------- STORE FIELD-DATA --------------------------------- */
function onChangeStoreFieldValue() {
    if (f.type === 'multiSelect') { return setOnMultiSelectChangeListener(); }
    $(f.input).change(storeFieldValue.bind(null, f.input, f.name, f.group, null));
}
function storeFieldValue(elem, fieldName, fLvl, value, e) {         /*dbug-log*/console.log('storeFieldValue [%s] fieldConfg = %O', fieldName, elem);
    const val = value || $(elem).val();
    _state('setFormFieldData', [fLvl, fieldName, val]);
}
/* ________________ MULTI-SELECT DATA ________________ */
/**
 * [setOnMultiSelectChangeListener description]
 * @param {[type]} ) {                                 console.log('setOnMultiSelectChangeListener input[%O]', f.input [description]
 */
export function setOnMultiSelectChangeListener(input = f.input) {   /*dbug-log*/console.log('setOnMultiSelectChangeListener input[%O]', input);
 //PAUSE   // f.input
}
/**
 * [storeMultiSelectValue description]
 * @param  {[type]} fLvl  [description]
 * @param  {[type]} cnt   [description]
 * @param  {[type]} fieldConfg [description]
 * @return {[type]}       [description]
 */
function storeMultiSelectValue(fLvl, cnt, fName, e) {               /*dbug-log*/console.log('storeMultiSelectValue. lvl = %s, cnt = %s, fName = %s, e = %O', fLvl, cnt, fName, e);
    const valueObj = _state('getFormFieldData', [fLvl, fName]).val; /*dbug-log*/console.log('fieldObj = %O', fieldObj);
    valueObj[cnt] = e.target.value || null;
    _state('setFormFieldData', [fLvl, fName, valueObj, 'multiSelect']);
    // checkForAuthValIssues(valueObj, fName, fLvl); //MOVE TO AUTHOR CODE
}
/* ---------------- AUTH|EDITOR VALIDATION ---------------------------------- */
function checkForAuthValIssues(vals, fName, fLvl) {
    const issues = [
        checkForBlanksInOrder(vals, fName, fLvl),
        checkForDuplicates(vals, fName, fLvl)
    ].filter(i => i);
    if (issues.length) { return; }
    ifPreviousAlertClearIt(fName, fLvl);
}
function ifPreviousAlertClearIt(fName, fLvl) {
    if (!$('#'+fName+'_alert.'+fLvl+'-active-alert')) { return; }
    _val('clrContribFieldAlert', [fName, fLvl]);
}
/**
 * Author/editor fields must have all fields filled continuously. There can
 * be no blanks in the selected order. If found, an alert is shown to the user.
 */
function checkForBlanksInOrder(vals, fName, fLvl) {                 /*dbug-log*/console.log('checkForBlanksInOrder. [%s] vals = %O', fName, vals);
    let blank = checkForBlanks(vals);
    if (blank !== 'found') { return; }
    alertBlank(fName, fLvl);
    return true;
}
function checkForBlanks(vals) {
    let blanks = false;
    checkValsForBlanks();
    return blanks;

    function checkValsForBlanks() {
        for (let ord in vals) {
            blanks = vals[ord] && blanks ? 'found' :
                !vals[ord] && !blanks ? 'maybe' : blanks;
        }
    }
}
function alertBlank(fName, fLvl) {
    const alertTags = { 'Authors': 'fillAuthBlanks', 'Editors': 'fillEdBlanks' };
     _val('showFormValAlert', [fName, alertTags[fName], fLvl]);
}
function checkForDuplicates(vals, fName, fLvl) {                    /*dbug-log*/console.log('checkForDuplicates. [%s] vals = %O', fName, vals);
    const dups = Object.values(vals).filter((v, i, self) => self.indexOf(v) !== i);
    if (!dups.length) { return; }
    _val('showFormValAlert', [fName, 'dupAuth', fLvl]);
    return true;
}

/* ============================== FIELD PIN ================================= */
/**
 * [getPinElem description]
 * TODO : REFACTOR
 * @param  {[type]} fName [description]
 * @return {[type]}       [description]
 */
function getFormFieldPin(fName) {                                   /*dbug-log*/console.log('getFormFieldPin [%s]', fName);
    const pin = buildPinElem(fName);
    handledRelatedFieldPins(pin, fName);
    return pin;
}
function buildPinElem(fName) {
    const attr = {type: 'checkbox', id: fName+'_pin', class: 'top-pin'};
    const pin = _el('getElem', ['input', attr]);
    _u('addEnterKeypressClick', [pin]);
    return pin;
}
function handledRelatedFieldPins(pin, fName) {
    const relFields = ['CitationTitle', 'Country-Region', 'Location', 'Publication'];
    if (relFields.indexOf(fName) !== -1) { $(pin).click(checkConnectedFieldPin); }
}
/**
 * When a dependent field is pinned, the connected field will also be pinned.
 * If the connected field is unpinned, the dependant field is as well.
 */
function checkConnectedFieldPin() { //move to interaction confg
    const fName = this.id.split("_pin")[0];
    const params = {
        'CitationTitle': { checked: true, relField: 'Publication' },
        'Country-Region': { checked: false, relField: 'Location' },
        'Location': { checked: true, relField: 'Country-Region' },
        'Publication': { checked: false, relField: 'CitationTitle' },
    }
    checkFieldPins(this, params[fName].checked, params[fName].relField);
}
function checkFieldPins(curPin, checkState, relField) {
    if (curPin.checked === checkState) {
        if ($('#'+relField+'_pin')[0].checked === checkState) { return; }
        $('#'+relField+'_pin')[0].checked = checkState;
    }
}
// export default function buildFormFieldContainer(field, input, fLvl, rowClss, info) {/*dbug-log*/console.log('buildFormFieldContainer[%s][%s] class?[%s] info?[%s] input = %O', field, fLvl, rowClss, info, input);
//     const rowDiv = buildRowContainer(field, input, fLvl, rowClss);
//     const alertDiv = _el('getElem', ['div', { id: field+'_alert'}]);
//     const fieldCntnr = buildField(input, field, fLvl, info);
//     $(rowDiv).append([alertDiv, fieldCntnr]);
//     return rowDiv;
// }
// function buildRowContainer(field, input, fLvl, rowClss) {
//     const attr = { class: getRowClasses(), id: field + '_fCntnr'}
//     return _el('getElem', ['div', attr]);
//     /** Returns the style classes for the row. */
//     function getRowClasses() {
//         const rowClass = input.className.includes('xlrg-field') ?
//             'full_fCntnr' : (fLvl + '_fCntnr') + (rowClss ? (' '+rowClss) : '');
//         return rowClass;
//     }
// }
// function buildField(input, field, fLvl, info) {
//     const cntnr = buildFieldContainer(fLvl, info);
//     const label = buildFieldLabel(input, field);
//     const pin = fLvl === 'top' ? getPinElem(field) : null;
//     $(cntnr).append([label, input, pin]);
//     return cntnr;
// }

// function buildFieldContainer(fLvl, info) {
//     const attr = { class: 'form-field flex-row', title: getInfoTxt(info)};
//     const cntnr = _el('getElem', ['div', attr]);
//     if (info) { addTutorialDataAttr(cntnr, fLvl, info); }
//     return cntnr;
// }
// /** Used for the form-specific tutorials. */
// function addTutorialDataAttr(cntnr, fLvl, info) {
//     $(cntnr).addClass(fLvl+'-intro')
//         .attr({
//             'data-intro': getInfoTxt(info, 'intro'),
//             'data-intro-group': fLvl+'-intro'
//         });
// }
// function getInfoTxt(info, key = 'tooltip') {
//     return typeof info === 'string' ? info : info[key];
// }
// function buildFieldLabel(input, field) {
//     const attr = { id: field+'-lbl', class: getLabelClass(), text: getFieldName()};
//     return _el('getElem', ['label', attr]);

//     function getLabelClass() {
//         return $(input).data('fLvl') ? 'required' : '';
//     }
//     function getFieldName() {
//         const fieldName = field.includes('-') ? field : field.replace(/([A-Z])/g, ' $1'); //Adds space between pascal-cased words
//         return _u('ucfirst', [fieldName]).trim();
//     }
// }
// function getPinElem(field) {
//     const pin = buildPinElem(field);
//     handledRelatedFieldPins(pin, field);
//     return pin;
// }
// function buildPinElem(field) {
//     const attr = {type: 'checkbox', id: field+'_pin', class: 'top-pin'};
//     const pin = _el('getElem', ['input', attr]);
//     _u('addEnterKeypressClick', [pin]);
//     return pin;
// }
// function handledRelatedFieldPins(pin, field) {
//     const relFields = ['CitationTitle', 'Country-Region', 'Location', 'Publication'];
//     if (relFields.indexOf(field) !== -1) { $(pin).click(checkConnectedFieldPin); }
// }
// /**
//  * When a dependent field is pinned, the connected field will also be pinned.
//  * If the connected field is unpinned, the dependant field is as well.
//  */
// function checkConnectedFieldPin() {
//     const field = this.id.split("_pin")[0];
//     const params = {
//         'CitationTitle': { checked: true, relField: 'Publication' },
//         'Country-Region': { checked: false, relField: 'Location' },
//         'Location': { checked: true, relField: 'Country-Region' },
//         'Publication': { checked: false, relField: 'CitationTitle' },
//     }
//     checkFieldPins(this, params[field].checked, params[field].relField);
// }
// function checkFieldPins(curPin, checkState, relField) {
//     if (curPin.checked === checkState) {
//         if ($('#'+relField+'_pin')[0].checked === checkState) { return; }
//         $('#'+relField+'_pin')[0].checked = checkState;
//     }
// }