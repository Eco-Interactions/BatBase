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
/* ====================== BUILD FIELD ======================================= */
export function buildFormField(fConfg) {
    return _el('getFieldInput', [fConfg])
        .then(buildField.bind(null, fConfg));
}
function buildField(fConfg) {
    const field = buildFormFieldElems(fConfg);
    updateFormFieldState(fConfg);
    return field;
}
/**
 * [buildFormFieldElems description]
 * @param  {[type]} f
 * @return {[type]}    [description]
 */
function buildFormFieldElems(f) {                                   /*dbug-log*///console.log('+--buildFormField f[%O]', f);
    handleFieldChangeListeners(f);
    const field = f.type.includes('multi') ? f.input : _el('getFieldElems', [f]);
    addPinIfFieldDataCanPersistThroughMultipleSubmits(f, field);
    return field;
}
export function buildDynamicFormField(fConfg) {
    return _el('buildMultiSelectField', [fConfg])
        .then(addChangeEventAndReturnField);

    function addChangeEventAndReturnField(input) {
        fConfg.input = input;
        setOnMultiSelectChangeListener(fConfg);
        return input;
    }
}
/* -------------------------- IF PINNABLE ------------------------------------ */
/**
 * [addPinIfFieldDataCanPersistThroughMultipleSubmits description]
 * @param {[type]} f [description]
 * @param {[type]} field
 */
function addPinIfFieldDataCanPersistThroughMultipleSubmits(f, field) {/*dbug-log*///console.log('    --addPinIfFieldDataCanPersistThroughMultipleSubmits pinnable?[%s] field[%O]', f.pinnable, field);
    if (!f.pinnable) { return; }
    const pin = getFormFieldPin(f.name);
    $(field.lastChild).append(pin);
}
/* -------------------------- FIELD STATE ----------------------------------- */
/**
 * Note: This method is the first form-method after the util elem-build.
    //todo remove build-data before storing confg
 * @param  {[type]} ) {                                              console.log('       --updateFormState f[%O]', _u('snapshot', [f]) [description]
 * @return {[type]}   [description]
 */
function updateFormFieldState(f) {                                  /*dbug-log*///console.log('       --updateFormState f[%O]', _u('snapshot', [f]));
    f.shown = true;
    _state('setFieldState', [f.group, f.name, f, false]);  //overwrites current field-state-data
}
/* =========================== ON FIELD CHANGE ============================== */
/** [handleFieldChangeListeners description] */
function handleFieldChangeListeners(f) {                             /*dbug-log*///console.log('   --handleFieldChangeListeners',);
    ifCitationFormAutoGenerateCitationOnChange(f);
    onChangeStoreFieldValue(f);
    if (f.required) { handleRequiredField(f); }
}
/* -------------- IF CITATION FORM, REGENERATE CITATION --------------------- */
/**
 * [ifCitationFormAutoGenerateCitationOnChange description]
 * @return {[type]} [description]
 */
function ifCitationFormAutoGenerateCitationOnChange(f) {
    if (f.name === 'citation'){
        $(f.input).change(_form.bind(null, 'handleCitText', [f.group]));
    }
}
/* ---------------- IF REQUIRED FIELD, HANDLE SUBMIT ------------------------ */
/**
 * Required field's have a 'required' class added which appends '*' to their
 * label. Added to the input elem is a change event reponsible for enabling/
 * disabling the submit button and a form-level data property.
 */
function handleRequiredField(f) {
    $(f.input).change(checkRequiredFields);
    $(f.input).data('fLvl', f.group);
}
/**
 * On a required field's change event, the submit button for the element's form
 * is enabled if all of it's required fields have values and it has no open child
 * forms.
 */
function checkRequiredFields(e) {                                   /*dbug-log*///console.log('   --checkRequiredFields e = %O', e)
    const fLvl = $(e.currentTarget).data('fLvl');
   _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
}
/* ----------------------- STORE FIELD-DATA --------------------------------- */
/**
 * [onChangeStoreFieldValue description]
 * @return {[type]} [description]
 */
function onChangeStoreFieldValue(f) {
    if (ifCustomFieldStoreListener(f)) { return setCustomFieldStoreListener(f); }
    $(f.input).change(storeFieldValue.bind(null, f.input, f.name, f.group, null));
}
function ifCustomFieldStoreListener(f) {
    return f.misc && f.misc.customValueStore;
}
function setCustomFieldStoreListener(f) {
    if (f.type === 'multiSelect') { return setOnMultiSelectChangeListener(f); }
    //Otherwise, handled elsewhere
}
function storeFieldValue(elem, fieldName, fLvl, value, e) {         /*dbug-log*///console.log('   --storeFieldValue [%s][%O]', fieldName, elem);
    const val = value || $(elem).val();
    _state('setFieldState', [fLvl, fieldName, val]);
}
/* ________________ MULTI-SELECT DATA ________________ */
/** [setOnMultiSelectChangeListener description] */
function setOnMultiSelectChangeListener(f) {                        /*dbug-log*///console.log('setOnMultiSelectChangeListener fConfg[%O]', f);
    $(f.input).change(storeMultiSelectValue.bind(null, f.group, f.count, f.name));
}
/** [storeMultiSelectValue description] */
function storeMultiSelectValue(fLvl, cnt, fName, e) {               /*dbug-log*///console.log('@--storeMultiSelectValue lvl[%s] cnt[%s]fName[%s], e[%O]', fLvl, cnt, fName, e);
    const vals = _state('getFormData', [fLvl, fName]);              /*dbug-log*///console.log('   --vals[%O]', vals);
    vals[cnt] = e.target.value || null;
    _state('setFieldState', [fLvl, fName, vals]);
    // checkForAuthValIssues(valueObj, fName, fLvl); //MOVE TO AUTHOR CODE
}
/* ---------------- AUTH|EDITOR VALIDATION ---------------------------------- */
//TODO
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
function checkForBlanksInOrder(vals, fName, fLvl) {                 /*dbug-log*///console.log('checkForBlanksInOrder. [%s] vals = %O', fName, vals);
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
    const alertTags = { Author: 'fillAuthBlanks', Editor: 'fillEdBlanks' };
     _val('showFormValAlert', [fName, alertTags[fName], fLvl]);
}
function checkForDuplicates(vals, fName, fLvl) {                    /*dbug-log*///console.log('checkForDuplicates. [%s] vals = %O', fName, vals);
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
function getFormFieldPin(fName) {                                   /*dbug-log*///console.log('getFormFieldPin [%s]', fName);
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