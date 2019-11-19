/**
 * Sub-forms, form rows, fiele elements, etc.
 *
 * Exports:                 Imported by: 
 *     initSubForm                  db-forms
 *     buildFormRows                db-forms, edit-forms
 *     getFormFieldRows             db-forms, edit-forms
 *     checkReqFieldsAndToggleSubmitBttn    db-forms
 *     ifAllRequiredFieldsFilled    db-forms, edit-forms
 *     getSrcOpts               db-forms
 *     buildFormRow             db-forms
 *     buildTagField            db-forms
 *     buildLongTextArea        db-forms
 *     getRcrdOpts              db-forms
 *     getTaxonOpts             db-forms
 *     buildMultiSelectElems    db-forms
 */

import * as _u from '../../../util.js';
import * as _forms from '../forms-main.js';
import * as db_forms from '../../db-forms.js';
// import * as _errs from '../validation/f-errs.js';
import { buildFormFooter } from './form-footer.js';
import * as _cmbx from './combobox-util.js';
import * as _fCnfg from '../etc/form-config.js';


let fP;
const _errs = _forms.err;
/**
 * Builds and returns the subForm according to the passed params. Disables the 
 * select elem 'parent' of the sub-form. 
 * (container)DIV>[(header)P, (fields)DIV, (buttons)DIV]
 */
export function initSubForm(params, fLvl, fClasses, fVals, selId) {             //console.log('initSubForm called. args = %O', arguments)
    fP  = params;
    const formEntity = fP.forms[fLvl].entity;
    return buildFormRows(formEntity, fVals, fLvl)
        .then(buildFormContainer)

    function buildFormContainer(rows) {
        const subFormContainer = buildSubFormCntnr(); 
        const bttns = buildFormFooter(formEntity, fLvl, 'create', null, fP);
        $(subFormContainer).append([buildFormHdr(), rows, bttns]);
        _forms.memory('addToFormMemory', [fLvl, 'pSelId', selId]);
        _cmbx.enableCombobox(selId, false);
        fP = null;
        return subFormContainer;
    }
    function buildSubFormCntnr() {
        const attr = {id: fLvl+'-form', class: fClasses + ' flex-wrap'};
        return _u.buildElem('div', attr);
    }
    function buildFormHdr() {
        const attr = { text: 'New '+_u.ucfirst(formEntity), id: fLvl+'-hdr' };
        return _u.buildElem('p', attr);
    }
}
/** 
 * Builds and returns the default fields for entity sub-form and returns the 
 * row elems. Inits the params for the sub-form in the global fP obj.
 */
export function buildFormRows(entity, fVals, fLvl, params) {                    //console.log('buildFormRows. args = %O', arguments)
    if (params) { fP = params; }
    return getFormFieldRows(entity, fVals, fLvl)
        .then(returnFinishedRows.bind(null, entity, params));
}
function returnFinishedRows(entity, params, rows) {
    const attr = { id: entity+'_Rows', class: 'flex-row flex-wrap'};
    const rowCntnr = _u.buildElem('div', attr);
    $(rowCntnr).append(rows);
    if (params) { fP = null; }
    return rowCntnr;
}
/** -------------------- Form Row Builders ------------------------------ */
/**
 * Returns rows for the entity form fields. If the form is a source-type, 
 * the type-entity form config is used. 
 */
export function getFormFieldRows(entity, fVals, fLvl, params) {
    // const typeConfg = fP.forms[fLvl].typeConfg;
    if (params) { fP = params; }
    const fObj = getFieldTypeObj(entity, fLvl);
    return buildRows(fObj, entity, fVals, fLvl)
        .then(orderRows.bind(null, fObj.order));
}
/* ------------ BUILD FORM FIELDS' TYPE OBJ ------------- */
/**
 * Returns an obj with the entity's field defs and all required fields.
 * @return {obj} .fields   Obj - k: fieldName, v: fieldType.
 *               .required Ary of required fields
 */
function getFieldTypeObj(entity, fLvl) {                     //console.log('getFieldTypeObj for [%s] @ [%s] level. confg = %O typeConfg = %O', entity, fLvl, fConfg, typeConfg);
    const formConfg = _fCnfg.getFormConfg(entity);
    const typeConfg = getEntityTypeFormConfg(entity);
    return buildFieldTypeObj(formConfg, typeConfg, fP.forms[fLvl].fieldConfg);
}   
function getEntityTypeFormConfg() {
    const type = fP.forms[fLvl].entityType;
    return type ? _fCnfg.getFormConfg(entity).types[type] : false;
}
function buildFieldTypeObj(formConfg, typeConfg, fieldConfg) {
    fieldConfg.fields = getIncludedFields(entity, fConfg, tConfg);
    fieldConfg.order = getFieldOrder(fConfg, tConfg, entity);                     
    fieldConfg.required = getRequiredFields(fConfg, tConfg);
    return fieldConfg;
}
function getIncludedFields(entity, fConfg, tConfg) {
    const included = getFormFields(fConfg, typeConfg, entity);       
    const allFields = Object.assign(_fCnfg.getCoreFieldDefs(entity), fConfg.add);
    included.forEach(field => fieldConfg.fields[field] = allFields[field]);    
    return included;
}
/**
 * Returns an array of fields to include in the form. If the form is a 
 * source-type, the type-entity form config is combined with the main-entity's.
 * Eg, Publication-type confgs are combined with publication's form confg.
 */
function getFormFields(fConfg, typeConfg, entity) {                             //console.log('getting form fields for fConfg = %O typeConfg = %O', fConfg, typeConfg);
    const showAllFields = fP.forms.expanded[entity];
    const dfault = getCoreFields(entity, fConfg, showAllFields);
    const typeFields = getEntityTypeFields(entity, typeConfg, showAllFields);
    return dfault.concat(typeFields);
}
function getCoreFields(entity, fConfg, showAllFields) {
    return fP.forms.expanded[entity] ? 
        fConfg.required.concat(fConfg.suggested).concat(fConfg.optional) :
        fConfg.required.concat(fConfg.suggested); 
}
function getEntityTypeFields(entity, typeConfg, showAllFields) {
    return typeConfg && shwAll ? 
        typeConfg.required.concat(typeConfg.suggested).concat(typeConfg.optional) :
        typeConfg ? typeConfg.required.concat(typeConfg.suggested) : []; 
}
/** Returns the order the form fields should be displayed. */
function getFieldOrder(fConfg, typeConfg, entity) {
    const shwAll = fP.forms.expanded[entity];
    const order = typeConfg && shwAll ? 
        fConfg.order.opt.concat(typeConfg.order.opt) : 
        typeConfg ? 
            fConfg.order.sug.concat(typeConfg.order.sug) : 
            shwAll && fConfg.order.opt ? fConfg.order.opt : fConfg.order.sug; 
    return order.map(field => field); //removes references to confg obj.
}
function getRequiredFields(fConfg, tConfg) {
    return tConfg ? tConfg.required.concat(fConfg.required) : fConfg.required;
}
/* ===================== BUILD FORM FIELD ROW =============================== */
/** @return {ary} Rows for each field in the entity field obj. */
function buildRows(fieldObj, entity, fVals, fLvl) {                             //console.log("buildRows. fLvl = [%s] fields = [%O]", fLvl, fieldObj);
    const rows = [];
    for (let field in fieldObj.fields) {                                        //console.log("  field = ", field);
        rows.push(buildRow(field, fieldObj, entity, fVals, fLvl));
    }  
    return Promise.all(rows);
}
/**
 * @return {div} Form field row with required-state and value (if passed) set.  
 */
function buildRow(field, fieldsObj, entity, fVals, fLvl) {                      //console.log("buildRow. field [%s], fLvl [%s], fVals = %O, fieldsObj = %O", field, fLvl, fVals, fieldsObj);
    return buildFieldInput(fieldsObj.fields[field], entity, field, fLvl)
        .then(buildFieldRow);

    function buildFieldRow(input) {                                             //console.log('input = %O', input);
        const isReq = isFieldRequried(field, fLvl, fieldsObj.required);    
        addFieldToFormFieldObj();
        fillFieldIfValuePassed(input);
        $(input).change(storeFieldValue.bind(null, input, field, fLvl, null));
        return buildFormRow(_u.ucfirst(field), input, fLvl, isReq, "");
    }
    /** Adds the field, and it's type and value, to the form's field obj.  */
    function addFieldToFormFieldObj() {
        const confg = { val: fVals[field], type: fieldsObj.fields[field] };
        _forms.memory('setFormFieldConfg', [fLvl, field, fieldObj]);
        // db_forms.setFormFieldConfg(fLvl, field, confg);
    }
    /** Sets the value for the field if it is in the passed 'fVals' obj. */
    function fillFieldIfValuePassed(input) {                                    //console.log('filling value in [%s]', field);
        if (field in fVals) { 
            if (fieldsObj.fields[field] === "multiSelect") { return; }          //console.log('---filling');
            $(input).val(fVals[field]); 
        }
    }
} /* End buildRow */ 
/**
 * Adds field value to the form's confg object. Calls @handleCitText to check 
 * citation fields for any changes to the generated and displayed citation text.
 */
function storeFieldValue(elem, fieldName, fLvl, value) {            
    const val = value || $(elem).val();                             
    if (['Authors', 'Editors'].indexOf(fieldName) != -1) { return; }
    if (fieldName !== "CitationText") { _forms.handleCitText(fLvl); }
    _forms.memory('setFormFieldValueMemory', [fLvl, fieldName, val]);
    // db_forms.setFormFieldValueMemory(fLvl, fieldName, val);
}
/** Stores value at index of the order on form, ie the cnt position. */
function storeMultiSelectValue(fLvl, cnt, field, e) {                           //console.log('storeMultiSelectValue. lvl = %s, cnt = %s, field = %s, e = %O', fLvl, cnt, field, e);
    if (e.target.value === "create") { return; }
    const fieldObj = _forms.memory('getFormFieldConfg', [fLvl, field]);                                //console.log('getCurrentFormFieldVals. vals = %O', vals);
    if (!fieldObj.val) { fieldObj.val = {}; }
    fieldObj.val[cnt] = e.target.value || null;
    _forms.memory('setFormFieldConfg', [fLvl, field, fieldObj]);
    // db_forms.setFormFieldConfg(fLvl, field, fieldObj);
    checkForBlanksInOrder(fieldObj.val, field, fLvl);    
}
/**
 * Author/editor fields must have all fields filled continuously. There can 
 * be extra blanks on the end, but none at the beginning. If blanks are found,
 * an error is shown to the user, otherwise any active errors are cleared. 
 */
function checkForBlanksInOrder(vals, field, fLvl) {                             //console.log('checkForBlanksInOrder. [%s] vals = %O', field, vals);
    const map = { 'Authors': 'fillAuthBlanks', 'Editors': 'fillEdBlanks' };
    let blank = false;

    for (let ord in vals) {
        blank = vals[ord] && blank ? "found" :
            !vals[ord] && !blank ? "maybe" : blank;  
    } 
    if (blank === "found") { return _errs.reportFormFieldErr(field, map[field], fLvl); }
    if ($('#'+field+'_errs.'+fLvl+'-active-errs')) { _errs.clrContribFieldErr(field, fLvl); }
}
function buildFieldInput(fieldType, entity, field, fLvl) {                      //console.log('buildFieldInput. type [%s], entity [%s], field [%s], lvl [%s]', fieldType, entity, field, fLvl);
    const buildFieldType = { 'text': buildTextInput, 'tags': buildTagField, 
        'select': buildSelectCombo, 'multiSelect': buildMultiSelectCntnr,  
        'textArea': buildTextArea, 'fullTextArea': buildLongTextArea };
    return Promise.resolve(buildFieldType[fieldType](entity, field, fLvl));
}
function getFieldClass(fLvl, fieldType) {  
    const classes = { 'top': 'lrg-field', 'sub': 'med-field', 'sub2': 'med-field' };
    return fieldType === 'long' ? (fLvl === 'top' ? 'xlrg-field top' :
        'xlrg-field') : classes[fLvl];
}
/** Returns true if field is in the required fields array. */
function isFieldRequried(field, fLvl, reqFields) {                              //console.log('isFieldRequried. fLvl = [%s], fP = %O', fLvl, fP);
    return reqFields.indexOf(field) !== -1;
}
/** Reorders the rows into the order set in the form config obj. */
function orderRows(order, rows) {                                               //console.log("    ordering rows = %O, order = %O", rows, order);
    rows.sort((a, b) => {
        let x = order.indexOf(a.id.split("_row")[0]);  
        let y = order.indexOf(b.id.split("_row")[0]); 
        return x < y ? -1 : x > y ? 1 : 0;
    });
    return rows;
}

/*----------------------- Form Input Builders ----------------------------*/
function buildTextInput(entity, field, fLvl) { 
    return _u.buildElem('input', { 'type': 'text', class: getFieldClass(fLvl) });
}
function buildTextArea(entity, field, fLvl) {                                     
    return _u.buildElem('textarea', {class: getFieldClass(fLvl) });
}
export function buildLongTextArea(entity, field, fLvl) {
    return _u.buildElem('textarea', 
        { class: getFieldClass(fLvl, 'long'), id:field+'-txt' });
}
/**
 * Creates and returns a select dropdown for the passed field. If it is one of 
 * a larger set of select elems, the current count is appended to the id. Adds 
 * the select's fieldName to the subForm config's 'selElem' array to later 
 * init the 'selectize' combobox. 
 */
function buildSelectCombo(entity, field, fLvl, cnt) {                           //console.log("buildSelectCombo [%s] field %s, fLvl [%s], cnt [%s]", entity, field, fLvl, cnt);                            
    return getSelectOpts(field).then(finishComboBuild);

    function finishComboBuild(opts) {
        const fieldId = cnt ? field + '-sel' + cnt : field + '-sel';
        const sel = _u.buildSelectElem(opts, { id: fieldId , class: getFieldClass(fLvl)});
        _forms.memory('addComboToMemory', [fLvl, field]);
        return sel;
    }
}
/**
 * Creates a select dropdown field wrapped in a div container that will
 * be reaplced inline upon selection. Either with an existing Author's name, 
 * or the Author create form when the user enters a new Author's name. 
 */
function buildMultiSelectCntnr(entity, field, fLvl) {                           //console.log("entity = %s. field = ", entity, field);
    const cntnr = _u.buildElem('div', { id: field+'-sel-cntnr'});
    return buildMultiSelectElems(entity, field, fLvl, 1)
        .then(returnFinishedMultiSelectFields);

    function returnFinishedMultiSelectFields(fields) {
        $(cntnr).data('inputType', 'multiSelect').data('cnt', 1);
        $(cntnr).append(fields);
        return cntnr;
    }
}
export function buildMultiSelectElems(entity, field, fLvl, cnt) {
    return buildSelectCombo(entity, field, fLvl, cnt)
        .then(returnFinishedMultiSelectField);

    function returnFinishedMultiSelectField(fieldElem) {
        const wrapper = _u.buildElem('div', {class: 'flex-row'});
        const lbl = buildMultiSelectLbl(cnt)
        $(fieldElem).change(storeMultiSelectValue.bind(null, fLvl, cnt, field));
        $(wrapper).append([lbl, fieldElem]);
        return wrapper;
    }

} /* End buildMultiSelectElems */
function buildMultiSelectLbl(cnt) {
    const lbl = _u.buildElem('span', {text: getCntLabel(cnt), class:'multi-span'});
    $(lbl).css({padding: '.2em .5em 0 0', width: '2.2em'});
}
function getCntLabel(cnt) {
    const map = {1: '1st: ', 2:'2nd: ', 3:'3rd: '};
    return cnt in map ? map[cnt] : cnt+'th: '; 
}
/**
 * Creates and returns a select dropdown that will be initialized with 'selectize'
 * to allow multiple selections. A data property is added for use form submission.
 */
export function buildTagField(entity, field, fLvl) {
    return getSelectOpts(field).then(buildTagElem);

    function buildTagElem(opts) {
        const tagSel = _u.buildSelectElem(opts, { id: field + '-sel', 
            class: getFieldClass(fLvl)});
        $(tagSel).data('inputType', 'tags');
        return tagSel;
    }
}
/* ---------- Option Builders --------------------------------------------*/
/** Returns and array of options for the passed field type. */
function getSelectOpts(field) {                                                 //console.log("getSelectOpts. for %s", field);
    var optMap = {
        "Authors": [ getSrcOpts, 'authSrcs'],
        "CitationType": [ getCitTypeOpts, 'citTypeNames'],
        "Class": [ getTaxonOpts, 'Class' ],
        "Country": [ _u.getOptsFromStoredData, 'countryNames' ],
        "Editors": [ getSrcOpts, 'authSrcs'],
        "Family": [ getTaxonOpts, 'Family' ],
        "Genus": [ getTaxonOpts, 'Genus' ],
        "HabitatType": [ _u.getOptsFromStoredData, 'habTypeNames'],
        "InteractionTags": [ getTagOpts, 'interaction' ],
        "InteractionType": [ _u.getOptsFromStoredData, 'intTypeNames' ],
        "Order": [ getTaxonOpts, 'Order' ],
        "PublicationType": [ _u.getOptsFromStoredData, 'pubTypeNames'],
        "Publisher": [ getSrcOpts, 'publSrcs'],
        "Realm": [ getRealmOpts, null ],
        "Species": [ getTaxonOpts, 'Species' ],
        // "Tags": [ getTagOpts, 'source' ],
    };
    var getOpts = optMap[field][0];
    var fieldKey = optMap[field][1];
    return getOpts(fieldKey, field);
}
/** Builds options out of the passed ids and their entity records. */
export function getRcrdOpts(ids, rcrds) {
    var idAry = ids || Object.keys(rcrds);
    return idAry.map(function(id) {
        let text = rcrds[id].displayName.includes('(citation)') ? 
            rcrds[id].displayName.split('(citation)')[0] : rcrds[id].displayName;
        return { value: id, text: text };
    });
}
/** Returns an array of options objects for tags of the passed entity. */
function getTagOpts(entity) {
    return _u.getOptsFromStoredData(entity+"Tags");
}
/** Returns an array of source-type (prop) options objects. */
export function getSrcOpts(prop, field, rcrds) {
    const map = { 'pubSrcs': 'Publication', 'publSrcs': 'Publisher', 
        'authSrcs': field ? field.slice(0, -1) : 'Author' };
    return _u.getData(prop).then(buildSrcOpts);

    function buildSrcOpts(ids) {
        const srcs = rcrds || fP.records.source;
        const opts = getRcrdOpts(ids, srcs);
        opts.unshift({ value: 'create', text: 'Add a new '+map[prop]+'...'});
        return opts;
    }
}
/**
 * Return the citation type options available for the parent publication type.
 * Also adds the parent publication and source records to the fP obj. 
 */
function getCitTypeOpts(prop) {  
    const fLvl = _forms.getSubFormLvl('sub');
    return _u.getData(prop).then(buildCitTypeOpts);

    function buildCitTypeOpts(types) {
        return _u.buildOptsObj(types, getCitTypeNames().sort())
    }
    function getCitTypeNames() {
        const opts = {
            'Book': ['Book', 'Chapter'], 'Journal': ['Article'],
            'Other': ['Museum record', 'Other', 'Report'],
            'Thesis/Dissertation': ["Master's Thesis", 'Ph.D. Dissertation']
        };
        setPubInParams()
        return opts[fP.forms[fLvl].pub.pub.publicationType.displayName];
    }
    function setPubInParams() {
        const pubSrc = getSrcRcrd($('#Publication-sel').val());
        const pub = _mmry('getRcrd', ['publication', pubSrc.publication]);
        _mmry('addToFormMemory', [fLvl, 'pub', { pub: pub, src: pubSrc}]);
    }
    function getSrcRcrd(pubId) {
        if (pubId) { return fP.records.source[pubId]; } //When not editing citation record.
        const rcrd = _mmry('getRcrd', ['source', fP.editing.core]);
        return fP.records.source[rcrd.parent];
    }
} /* End getCitTypeOpts */
/** Returns an array of taxonyms for the passed level and the form's realm. */
export function getTaxonOpts(level, field, r) {
    let realm = r || fP.forms.taxonPs.realm;
    return _u.getOptsFromStoredData(realm+level+'Names')
        .then(buildTaxonOpts);

        function buildTaxonOpts(opts) {                                         //console.log("taxon opts for [%s] = %O", fP.forms.taxonPs.realm+level+"Names", opts)        
            opts.unshift({ value: 'create', text: 'Add a new '+level+'...'});
            return opts;
        }
}
function getRealmOpts() {
    return _u.getOptsFromStoredData('objectRealmNames');  
}
/**
 * Each element is built, nested, and returned as a completed row. 
 * rowDiv>(errorDiv, fieldDiv>(label, input, [pin]))
 */
export function buildFormRow(field, input, fLvl, isReq, rowClss) {                     //console.log('building form row for [%s], req? [%s]', field, isReq);
    const fieldName = field.replace(/([A-Z])/g, ' $1'); //Adds space between pascal-cased words
    const rowDiv = _u.buildElem('div', { class: getRowClasses(), 
        id: field + '_row'});
    const errorDiv = _u.buildElem('div', { id: field+'_errs'}); 
    const fieldCntnr = _u.buildElem('div', { class: 'field-row flex-row'});
    const label = _u.buildElem('label', {text: _u.ucfirst(fieldName).trim(), id:field+'-lbl'});
    const pin = fLvl === 'top' ? getPinElem(field) : null;     
    if (isReq) { handleRequiredField(label, input, fLvl); } 
    $(fieldCntnr).append([label, input, pin]);
    $(rowDiv).append([errorDiv, fieldCntnr]);
    return rowDiv;
    /** Returns the style classes for the row. */
    function getRowClasses() { 
         var rowClass = input.className.includes('xlrg-field') ? 
            'full-row' : (fLvl + '-row') + (rowClss ? (' '+rowClss) : '');      //console.log("rowClass = ", rowClass)
        return rowClass; 
    }
} /* End buildFormRow */
function getPinElem(field) {
    var relFields = ["CitationTitle", "Country-Region", "Location", "Publication"];
    var pin = _u.buildElem("input", {type: "checkbox", id: field+"_pin", class: 'top-pin'});
    _u.addEnterKeypressClick(pin);
    if (relFields.indexOf(field) !== -1) { $(pin).click(checkConnectedFieldPin); }
    return pin;
}
/**
 * When a dependent field is pinned, the connected field will also be pinned.
 * If the connected field is unpinned, the dependant field is as well.
 */
function checkConnectedFieldPin() {
    var field = this.id.split("_pin")[0]; 
    var params = {
        "CitationTitle": { checked: true, relField: "Publication" },
        "Country-Region": { checked: false, relField: "Location" },
        "Location": { checked: true, relField: "Country-Region" },
        "Publication": { checked: false, relField: "CitationTitle" },
    }
    checkFieldPins(this, params[field].checked, params[field].relField);
}
function checkFieldPins(curPin, checkState, relField) {
    if (curPin.checked === checkState) {
        if ($('#'+relField+'_pin')[0].checked === checkState) { return; }
        $('#'+relField+'_pin')[0].checked = checkState;
    }
}
/**
 * Required field's have a 'required' class added which appends '*' to their 
 * label. Added to the input elem is a change event reponsible for enabling/
 * disabling the submit button and a form-level data property. The input elem
 * is added to the form param's reqElems property. 
 */
function handleRequiredField(label, input, fLvl) {
    $(label).addClass('required');  
    $(input).change(checkRequiredFields);
    $(input).data('fLvl', fLvl);
    _forms.memory('addRequiredFieldInput', [fLvl, input]);
    // db_forms.addRequiredFieldInputToMemory(fLvl, input);
}
/**
 * On a required field's change event, the submit button for the element's form 
 * is enabled if all of it's required fields have values and it has no open child 
 * forms. 
 */
function checkRequiredFields(e) {                                               //console.log('checkRequiredFields e = %O', e)
    const input = e.currentTarget;
    const fLvl = $(input).data('fLvl');  
    checkReqFieldsAndToggleSubmitBttn(input, fLvl);
    _forms.handleCitText(fLvl);
}
/**
 * Note: The 'unchanged' property exists only after the create interaction form 
 * has been submitted and before any changes have been made.
 */
export function checkReqFieldsAndToggleSubmitBttn(input, fLvl) {                       //console.log('### checkingReqFields = %O, fLvl = %s, unchanged? ', input, fLvl, fP.forms.top.unchanged);
    const subBttnId = '#'+fLvl+'-submit';
    _forms.callFormFunc('interaction', 'resetIfFormWaitingOnChanges');  //After interaction form submit, the submit button is disabled until form data changes
    if (!isRequiredFieldFilled(fLvl, input) || hasOpenSubForm(fLvl)) {          //console.log('     disabling submit');
        db_forms.disableSubmitBttn(subBttnId); 
    } else if (ifAllRequiredFieldsFilled(fLvl)) {                               //console.log('     enabling submit');
        if (locHasGpsData(fLvl)) { return; }
        db_forms.enableSubmitBttn(subBttnId);
    }
}
/** Returns true if all the required elements for the current form have a value. */
export function ifAllRequiredFieldsFilled(fLvl) {                               //console.log("   ->-> ifAllRequiredFieldsFilled... fLvl = %s", fLvl)
    const reqElems = _forms.memory('getFormProp', ['reqElems', fLvl]);          //console.log('reqElems = %O', reqElems);
    return reqElems.every(isRequiredFieldFilled.bind(null, fLvl));
}
/** Note: checks the first input of multiSelect container elems.  */
function isRequiredFieldFilled(fLvl, elem) {                                    
    if ($('.'+fLvl+'-active-errs').length) { return false; }                    //console.log('       --checking [%s] = %O, value ? ', elem.id, elem, getElemValue(elem));
    return getElemValue(elem);

    function getElemValue(elem) {
        return elem.value ? true : 
            elem.id.includes('-cntnr') ? isCntnrFilled(elem) : false;  
    }
}
/**
 * Returns true if the first field of the author/editor container has a value. 
 * For book publications, either authors or editors are required. If there is 
 * no author value, the first editor value is returned instead. 
 */
function isCntnrFilled(elem) {                                                  //console.log('isCntnrFilled? elem = %O', elem);
    return isAFieldSelected('Authors') || isAFieldSelected('Editors');         
}
function isAFieldSelected(entity) {                                             //console.log('[%s] field = %O', entity, $('#'+entity+'-sel-cntnr')[0]);
    if (!$('#'+entity+'-sel-cntnr').length) { return false; } //When no editor select is loaded.
    const fields = $('#'+entity+'-sel-cntnr')[0].firstChild.children;           //console.log('fields = %O', fields);
    let isSelected = false;
    $.each(fields, (i, field) => { if ($(field).val()) { isSelected = true; } });
    return isSelected;
}
/** Returns true if the next sub-level form exists in the dom. */
function hasOpenSubForm(fLvl) {
    const childFormLvl = _forms.getNextFormLevel('child', fLvl);
    return $('#'+childFormLvl+'-form').length > 0;
}
/** Prevents the location form's submit button from enabling when GPS data entered.*/
function locHasGpsData(fLvl) {
    if (_forms.memory('getFormProp', ['entity', fLvl]) !== 'location') { return false; }
    return ['Latitude', 'Longitude'].some(field => {
        return $(`#${field}_row input`).val();
    });
}


/* -------------------- APPEND FIELDS AND FORM ------------------------------ */
export function buildAndAppendForm(fLvl, fields, id) { 
    fP = _forms.getFormMemory();
    showFormPopup(fP.action, fP.entity, id);
    const form = buildFormElem();  
    const fieldContainer = buildEntityFieldContainer(fP.entity, fields);
    $(form).append([fieldContainer, buildFormFooter(fP.entity, fLvl, fP.action, null, fP)]);
    $('#form-main').append(form);  
    return Promise.resolve();
}
/** Builds the form elem container. */
function buildFormElem() {
    var form = document.createElement("form");
    $(form).attr({"action": "", "method": "POST", "name": "top"});
    form.className = "flex-row";
    form.id = "top-form";
    return form;
}
function buildEntityFieldContainer(entity, fields) {
    const div = _u.buildElem('div', { id: entity+'_Rows', class: 'flex-row flex-wrap' });
    $(div).append(fields); 
    return div;
}

/* ======================== INIT FORM HTML ================================== */

/** Builds and shows the popup form's structural elements. */
function showFormPopup(action, entity, id) {
    $('#b-overlay').addClass('form-ovrly');
    $('#b-overlay-popup').addClass('form-popup');
    $('#b-overlay-popup').append(getFormWindowElems(entity, id, action));
    addFormStyleClass(entity);
}
/** Adds the width to both the popup window and the form element for each entity. */
function addFormStyleClass(entity, remove) {
    const map = {
        'interaction': 'lrg-form',  'publication': 'med-form',
        'publisher': 'sml-form',    'citation': 'med-form',
        'author': 'sml-form',       'location': 'med-form',
        'taxon': 'sml-form'
    };
    $('#form-main, .form-popup').removeClass(['lrg-form', 'med-form', 'sml-form']);
    $('#form-main, .form-popup').addClass(map[entity]);
}
/**
 * Returns the form window elements - the form and the detail panel.
 * section>(div#form-main(header, form), div#form-details(hdr, pub, cit, loc), footer)
 */
function getFormWindowElems(entity, id, action) {
    return [getExitButtonRow(), getFormHtml(entity, id, action)];
}
function getExitButtonRow() {
    var row = _u.buildElem('div', { class: 'exit-row' });
    $(row).append(getExitButton());
    return row;        
}
export function getExitButton() {
    const bttn = _u.buildElem('input', { 'id': 'exit-form', 
        'class': 'tbl-bttn exit-bttn', 'type': 'button', 'value': 'X' });
    $(bttn).click(_forms.exitFormPopup);
    return bttn;
}
function getFormHtml(entity, id, action) {
    const cntnr = _u.buildElem('div', { class: 'flex-row' });
    const detailPanelHtml = _forms.uiPanel('getDetailPanelElems', [entity, id, fP]);
    $(cntnr).append([getMainFormHtml(entity, action), detailPanelHtml]);
    return cntnr;
}
function getMainFormHtml(entity, action) { 
    const formWin = _u.buildElem('div', { id: 'form-main', class: fP.action });
    $(formWin).append(getHeaderHtml(entity, action));
    return formWin;
}
function getHeaderHtml(entity, action) {
    const title = (action == 'New' ? 'New ' : 'Editing ') + _u.ucfirst(entity);    
    return _u.buildElem('h1', { 'id': 'top-hdr', 'text': title });
}