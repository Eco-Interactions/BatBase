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
import { _elems, _state } from '~form';

let f;

export function buildFormField(fConfg) {
    f = fConfg;                                                     /*dbug-log*/console.log('+--buildFormField fConfg[%O]', f);
    const field = buildFormFieldElems();
    addPinIfFieldDataCanPersistThroughMultipleSubmits(field);
    updateFormFieldState();
    return field;
}
/* ====================== BUILD FIELD ======================================= */
function buildFormFieldElems() {                                    /*dbug-log*/console.log('   --buildFormFieldElems', );
    handleFieldChangeListeners(f);
    return _el('getFieldElems', [f]);
}
/* -------------------------- IF PINNABLE ------------------------------------ */
function addPinIfFieldDataCanPersistThroughMultipleSubmits(field) { /*dbug-log*/console.log('    --addPinIfFieldDataCanPersistThroughMultipleSubmits pinnable?[%s] field[%O]', f.pinnable, field);
    if (!f.pinnable) { return; }
    const pin = getFormFieldPin(f.name);
    $(field.lastChild).append(pin);
}
/* -------------------------- FIELD STATE ----------------------------------- */
function updateFormFieldState() {                                   /*dbug-log*/console.log('       --updateFormState f[%O]', _u('snapshot', [f]));
    if (f.combo) { _state('addComboToFormState', [f.group, f.name]); }
    f.shown = true;
    //todo remove build-data before storing confg
    _state('setFieldState', [f.group, f.name, f, false]);  //overwrites current field-state-data
}
/* =========================== ON FIELD CHANGE ============================== */
function handleFieldChangeListeners() {                             /*dbug-log*/console.log('   --handleFieldChangeListeners',);
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
 * disabling the submit button and a form-level data property.
 */
function handleRequiredField() {
    $(f.input).change(checkRequiredFields);
    $(f.input).data('fLvl', f.group);
}
/**
 * On a required field's change event, the submit button for the element's form
 * is enabled if all of it's required fields have values and it has no open child
 * forms.
 */
function checkRequiredFields(e) {                                   /*dbug-log*/console.log('   @--checkRequiredFields e = %O', e)
    const fLvl = $(e.currentTarget).data('fLvl');
   _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
}
/* ----------------------- STORE FIELD-DATA --------------------------------- */
function onChangeStoreFieldValue() {
    if (ifCustomFieldStoreListener()) { return setCustomFieldStoreListener(); }
    $(f.input).change(storeFieldValue.bind(null, f.input, f.name, f.group, null));
}
function ifCustomFieldStoreListener() {
    return f.misc && f.misc.customValueStore;
}
function setCustomFieldStoreListener() {
    if (f.type === 'multiSelect') { return setOnMultiSelectChangeListener(); }
    //Otherwise, handled elsewhere
}
function storeFieldValue(elem, fieldName, fLvl, value, e) {         /*dbug-log*/console.log('   @--storeFieldValue [%s] fieldConfg = %O', fieldName, elem);
    const val = value || $(elem).val();
    _state('setFieldState', [fLvl, fieldName, val]);
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
    const valueObj = _state('getFormFieldData', [fLvl, fName, 'value']); /*dbug-log*/console.log('fieldObj = %O', fieldObj);
    valueObj[cnt] = e.target.value || null;
    _state('setFieldState', [fLvl, fName, valueObj]);
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