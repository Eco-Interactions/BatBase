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
 *         STORE FIELD-DATA
 *             MULTI-SELECT DATA
 */
import { _el, _u } from '~util';
import { _elems, _form, _state } from '~form';

let entity;
/* ====================== BUILD FIELD ======================================= */
export function buildFormField(fConfg, ent) {                       /*dbug-log*///console.log('--buildFormField fConfg[%O] entity[%s]', fConfg, ent);
    entity = ent;
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
function buildFormFieldElems(f) {                                   /*dbug-log*///console.log('--buildFormFieldElems f[%O]', f);
    handleFieldChangeListeners(f);
    const field = isDynamicInputField(f) ? f.input : _el('getFieldElems', [f]);
    addPinIfFieldDataCanPersistThroughMultipleSubmits(f, field);
    return field;
}
export function buildDynamicFormField(fConfg) {                     /*dbug-log*///console.log('+--buildDynamicFormField f[%O]', fConfg);
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
    delete f.input;
}
/* =========================== ON FIELD CHANGE ============================== */
/** [handleFieldChangeListeners description] */
function handleFieldChangeListeners(f) {                            /*dbug-log*///console.log('   --handleFieldChangeListeners',);
    ifCitationFormAutoGenerateCitationOnChange(f);
    onChangeStoreFieldValue(f);
}
/* -------------- IF CITATION FORM, REGENERATE CITATION --------------------- */
/**
 * [ifCitationFormAutoGenerateCitationOnChange description]
 * @return {[type]} [description]
 */
function ifCitationFormAutoGenerateCitationOnChange(f) {
    if (entity === 'Citation'){                                     /*dbug-log*///console.log('     --setAutoGenerateCitationOnChange');
        $(f.input).change(_form.bind(null, 'handleCitText', [f.group]));
    }
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
    if (isDynamicInputField(f)) { return setOnMultiSelectChangeListener(f); }
    //Otherwise, handled elsewhere
}
function storeFieldValue(elem, fieldName, fLvl, value, e) {         /*dbug-log*///console.log('   --storeFieldValue [%s][%O]', fieldName, elem);
    const val = value || $(elem).val();                             /*dbug-log*///console.log('       --val[%s]', val);
    _state('setFieldState', [fLvl, fieldName, val]);
    // if (!_state('getFieldState', [fLvl, fieldName, 'required'])) { return; }
   _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
}
/* ________________ MULTI-SELECT DATA ________________ */
/** [setOnMultiSelectChangeListener description] */
function setOnMultiSelectChangeListener(f) {                        /*dbug-log*///console.log('--setOnMultiSelectChangeListener [%s]fConfg[%O]', f.count, f);
    const field = f.count > 1 ? f.input.lastChild : f.input.lastChild.lastChild;
    const input = $(field).find('.f-input');                        /*dbug-log*///console.log('     --field[%O] input[%O]', field, input);
    $(input).change(storeMultiSelectValue.bind(null, f.group, f.count, f.name));
    if (!f.value) { f.value = {}; }
}
/** [storeMultiSelectValue description] */
function storeMultiSelectValue(fLvl, cnt, fName, e) {               /*dbug-log*///console.log('@--storeMultiSelectValue lvl[%s] cnt[%s]fName[%s], e[%O]', fLvl, cnt, fName, e);
    const vals = _state('getFieldState', [fLvl, fName]);
    const v = e.target.value ? e.target.value : null;               /*dbug-log*///console.log('   --prev[%O] cur[%O]', _u('snapshot', [vals]), vals);
    if (!v && Object.keys(vals).length == cnt) {
        delete vals[cnt];
    } else {
        vals[cnt] = v;
    }
    _state('setFieldState', [fLvl, fName, vals]);
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
/* ============================ HELPERS ===================================== */
function isDynamicInputField(f) {
    return f.type.includes('multi');
}