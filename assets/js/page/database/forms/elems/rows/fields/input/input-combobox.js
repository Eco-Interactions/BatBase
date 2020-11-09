/**
 * Handles building and managing the form comboboxes.
 *
 * Export
 *     buildComboInput
 *     buildMultiSelectElem
 *     initFormCombos
 *     resetFormCombobox
 *
 * TOC
 *    COMBOBOX BUILDERS
 *        TAGS COMBOBOX
 *        SINGLE SELECT/COMBOS
 *        MULTI-SELECT/COMBOS
 *    COMBOBOX HELPERS
 *        INIT
 *        RESET
 */
import { _cmbx, _db, _el } from '~util';
import { _state, _val, getSubFormLvl } from '~form';
/* ====================== COMBOBOX BUILDERS ================================= */
export function buildComboInput(field, entity, fLvl) {              /*dbug-log*///console.log('buildComboInput [%s] = %O', field.type, field);
    const map = {
        multiSelect: buildMultiSelect,
        select: buildSelect,
        tags: buildTagField,
    };
    return map[field.type](entity, field, fLvl);
}
/* ---------------------- TAGS COMBOBOX ------------------------------------- */
/**
 * Creates and returns a select dropdown that will be initialized with 'selectize'
 * to allow multiple selections. A data property is added for use form submission.
 */
function buildTagField(entity, field, fLvl) {
    const attr = { id: 'sel-'+field.name, class: field.class };
    const tagSel = _el('getSelect', [[], attr]);
    $(tagSel).data('inputType', 'tags');
    _state('addComboToFormState', [fLvl, field.name]);
    return tagSel;
}
/* --------------------- SINGLE SELECT/COMBOS ------------------------------- */
/**
 * Creates and returns a select dropdown for the passed field. If it is one of
 * a larger set of select elems, the current count is appended to the id. Adds
 * the select's fieldName to the subForm config's 'selElem' array to later
 * init the 'selectize' combobox.
 */
function buildSelect(entity, field, fLvl, cnt) {                    /*dbug-log*///console.log("buildSelect [%s] field [%s], fLvl [%s], cnt [%s]", entity, field, fLvl, cnt);
    return _cmbx('getFieldOptions', [field.name])
        .then(finishSelectBuild);

    function finishSelectBuild(opts) {                              /*dbug-log*///console.log('finishSelectBuild [%s] opts %O', field, opts);
        const fieldId = 'sel-' + (cnt ? field.name + cnt : field.name);
        const attr = { id: fieldId, class: field.class};
        _state('addComboToFormState', [fLvl, field.name]);
        return _el('getSelect', [opts, attr]);
    }
}
/* ---------------------- MULTI-SELECT/COMBOS ------------------------------- */
/**
 * Creates a select dropdown field wrapped in a div container that will
 * be reaplced inline upon selection. Either with an existing Author's name,
 * or the Author create form when the user enters a new Author's name.
 */
function buildMultiSelect(entity, field, fLvl) {                    /*dbug-log*///console.log("buildMultiSelect [%s][%s]", entity, field);
    const cntnr = _el('getElem', ['div', { id: 'sel-cntnr-' + field.name, class: 'sel-cntnr' }]);
    return buildMultiSelectElem(entity, field, fLvl, 1)
        .then(returnFinishedMultiSelectFields);

    function returnFinishedMultiSelectFields(fields) {
        $(cntnr).data('inputType', 'multiSelect').data('cnt', 1);
        $(cntnr).append(fields);
        return cntnr;
    }
}
export function buildMultiSelectElem(entity, field, fLvl, cnt) {
    return buildSelect(entity, field, fLvl, cnt)
        .then(returnFinishedMultiSelectField);

    function returnFinishedMultiSelectField(input) {
        const wrapper = _el('getElem', ['div', {class: 'flex-row'}]);
        const lbl = buildMultiSelectLbl(cnt)
        $(input).change(storeMultiSelectValue.bind(null, fLvl, cnt, field.name));
        $(wrapper).append([lbl, input]);
        return wrapper;
    }
}
function buildMultiSelectLbl(cnt) {
    const attr = {text: getCntLabel(cnt), class:'multi-span'};
    const lbl = _el('getElem', ['span', attr]);
    $(lbl).css({padding: '.2em .5em 0 0', width: '2.2em'});
}
function getCntLabel(cnt) {
    const map = {1: '1st: ', 2:'2nd: ', 3:'3rd: '};
    return cnt in map ? map[cnt] : cnt+'th: ';
}
function storeMultiSelectValue(fLvl, cnt, field, e) {               /*dbug-log*///console.log('storeMultiSelectValue. lvl = %s, cnt = %s, field = %s, e = %O', fLvl, cnt, field, e);
    const valueObj = _state('getFormFieldData', [fLvl, field]).val; /*dbug-log*///console.log('fieldObj = %O', fieldObj);
    valueObj[cnt] = e.target.value || null;
    _state('setFormFieldData', [fLvl, field, valueObj, 'multiSelect']);
    checkForBlanksInOrder(valueObj, field, fLvl);
}
/**
 * Author/editor fields must have all fields filled continuously. There can
 * be no blanks in the selected order. If found, an alert is shown to the user.
 */
function checkForBlanksInOrder(vals, field, fLvl) {                 /*dbug-log*///console.log('checkForBlanksInOrder. [%s] vals = %O', field, vals);
    let blank = checkForBlanks(vals);
    if (blank === 'found') { return alertBlank(field, fLvl); }
    ifPreviousAlertClearIt(field, fLvl);
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
function alertBlank(field, fLvl) {
    const alertTags = { 'Authors': 'fillAuthBlanks', 'Editors': 'fillEdBlanks' };
     _val('showFormValAlert', [field, alertTags[field], fLvl]);
}
function ifPreviousAlertClearIt(field, fLvl) {
    if (!$('#'+field+'_alert.'+fLvl+'-active-alert')) { return; }
    _val('clrContribFieldAlert', [field, fLvl]);
}
/* ====================== COMBOBOX HELPERS ================================== */
/* -------------------------- INIT ------------------------------------------ */
/**
 * Inits 'selectize' for each select elem in the form's 'selElems' array
 * according to the 'selMap' config. Empties array after intializing.
 */
export function initFormCombos(entity, fLvl, comboEvents) {         /*dbug-log*///console.log("initFormCombos. [%s] formLvl = [%s], events = %O", entity, fLvl, comboEvents);
    const elems = _state('getFormProp', [fLvl, 'selElems']);        /*dbug-log*///console.log('elems = %O', elems)
    elems.forEach(selectizeElem);
    _state('setFormProp', [fLvl, 'selElems', []]);

    function selectizeElem(fieldName) {
        const confg = getFieldConfg(comboEvents, fieldName);        /*dbug-log*///console.log("   Initializing [%s] confg = %O", fieldName, confg);
        _cmbx('initCombobox', [confg]);
        if (!confg.create) { _cmbx('removeOpt', [fieldName, 'create']); }
    }
}
function getFieldConfg(comboEvents, fieldName) {
    const baseConfg = getBaseFieldConfg(fieldName) ;                /*dbug-log*///console.log('[%s] baseConfg = %O, eventConfg = %O', fieldName, baseConfg, comboEvents);
    const eventConfg = comboEvents[fieldName] || {};
    return Object.assign(baseConfg, eventConfg);
}
function getBaseFieldConfg(fieldName) {
    const confgMap = {
        'Authors': { id: '#sel-Authors1', confgName: 'Authors1' },
        'Editors': { id: '#sel-Editors1', confgName: 'Editors1' },
        'InteractionTags': { delimiter: ",", maxItems: null },
    };
    const confg = confgMap[fieldName] ? confgMap[fieldName] : {};
    confg.name = fieldName.replace(/([A-Z])/g, ' $1').trim(); //Adds a space between words in CamelCase string.
    if (!confg.id) { confg.id = '#sel-'+fieldName; }
    return confg;
}
/* -------------------------------- RESET ----------------------------------- */
/**
 * Clears and enables the parent combobox for the exited form. Removes any
 * placeholder options and, optionally, brings it into focus.
 */
export function resetFormCombobox(fLvl, focus) {
    const selId = _state('getFormParentId', [fLvl]);                /*dbug-log*///console.log('resetFormCombobox [%s][%s] focus?[%s]', selId, fLvl, focus);
    if (!selId) { return; }
    const field = selId.split('sel-')[1];
    _cmbx('resetCombobox', [field]);
    _cmbx('enableCombobox', [field]);
    _cmbx('focusCombobox', [field, focus]);
}