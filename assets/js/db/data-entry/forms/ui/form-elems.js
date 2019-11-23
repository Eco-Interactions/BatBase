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

// import * as _u from '../../../util.js';
import * as _forms from '../forms-main.js';
import * as db_forms from '../../db-forms.js';
// import * as _errs from '../validation/f-errs.js';
import { buildFormFooter } from './form-footer.js';
import * as _fCnfg from '../etc/form-config.js';


let fP;
const _errs = _forms.err;
const _u = _forms._util;
const _mmry = _forms.memory;
/**
 * Builds and returns the subForm according to the passed params. Disables the 
 * select elem 'parent' of the sub-form. 
 * (container)DIV>[(header)P, (fields)DIV, (buttons)DIV]
 */
export function initSubForm(fLvl, fClasses, fVals, selId) {                     console.log('       /initSubForm called. args = %O', arguments)
    fP = _mmry('getAllFormMemory');
    const formEntity = _mmry('getFormEntity', [fLvl]);  console.log('formEntity = ', formEntity);  
    return buildFormRows(formEntity, fVals, fLvl)
        .then(buildFormContainer)

    function buildFormContainer(rows) {
        const subFormContainer = buildSubFormCntnr(); 
        const bttns = buildFormFooter(formEntity, fLvl, 'create', null, fP);
        $(subFormContainer).append([buildFormHdr(), rows, bttns]);
        _mmry('setFormProp', [fLvl, 'pSelId', selId]);
        _forms.uiCombos('enableCombobox', [selId, false]);
        fP = null;
        return subFormContainer;
    }
    function buildSubFormCntnr() {
        const attr = {id: fLvl+'-form', class: fClasses + ' flex-wrap'};
        return _u('buildElem', ['div', attr]);
    }
    function buildFormHdr() {
        const attr = { text: 'New '+_u('ucfirst', [formEntity]), id: fLvl+'-hdr' };
        return _u('buildElem', ['p', attr]);
    }
}
/** 
 * Builds and returns the default fields for entity sub-form and returns the 
 * row elems. Inits the params for the sub-form in the global fP obj.
 */
export function buildFormRows(entity, fVals, fLvl, params) {                    //console.log('buildFormRows. args = %O', arguments)
    setFormParams(params);
    return getFormFieldRows(entity, fVals, fLvl)
        .then(returnFinishedRows.bind(null, entity, params));
}
function setFormParams(params) {
    if (params) { fP = params; 
    } else if (!fP) { 
        fP = _mmry('getAllFormMemory'); 
    }
}
function returnFinishedRows(entity, params, rows) {
    const attr = { id: entity+'_Rows', class: 'flex-row flex-wrap'};
    const rowCntnr = _u('buildElem', ['div', attr]);
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
    fP = params ? params : _mmry('getAllFormMemory');
    const fObj = getFieldTypeObj(_u('lcfirst', [entity]), fLvl);
    return buildRows(fObj, entity, fVals, fLvl)
        .then(orderRows.bind(null, fObj.order));
}
/* ------------ BUILD FORM FIELDS' TYPE OBJ ------------- */
/**
 * Returns an obj with the entity's field defs and all required fields.
 * @return {obj} .fields   Obj - k: fieldName, v: fieldType.
 *               .required Ary of required fields
 */
function getFieldTypeObj(entity, fLvl) {                                        //console.log('getFieldTypeObj for [%s] @ [%s] level. confg = %O typeConfg = %O', entity, fLvl, fConfg, typeConfg);
    const confg = {
        entity: entity,
        form: _fCnfg.getFormConfg(entity), 
        type: getEntityTypeFormConfg(entity, fLvl),
        showAll: fP.forms[fLvl].expanded
    };
    return buildFieldTypeObj(confg, fP.forms[fLvl].fieldConfg);
}   
function getEntityTypeFormConfg(entity, fLvl) {
    const type = fP.forms[fLvl].entityType;
    return type ? _fCnfg.getFormConfg(entity).types[type] : false;
}
function buildFieldTypeObj(confg, fieldConfg) {                //console.log('fieldConfg = %O', fieldConfg);
    fieldConfg.fields = getIncludedFields(confg);
    fieldConfg.order = getFieldOrder(confg);                     
    fieldConfg.required = getRequiredFields(confg);
    return fieldConfg;
}
function getIncludedFields(confg) {
    const allFields = getFieldTypes(confg);
    const included = {}
    getFormFields(confg).forEach(field => included[field] = allFields[field]);    
    return included;
}
function getFieldTypes(confg) {
    const coreFields = _fCnfg.getCoreFieldDefs(confg.entity);
    return Object.assign(coreFields, confg.form.add);
}
/**
 * Returns an array of fields to include in the form. If the form is a 
 * source-type, the type-entity form config is combined with the main-entity's.
 * Eg, Publication-type confgs are combined with publication's form confg.
 */
function getFormFields(confg) {                                
    const dfault = getCoreEntityFields(confg);
    const typeFields = getEntityTypeFields(confg);
    return dfault.concat(typeFields);
}
function getCoreEntityFields(confg) {
    const fields = confg.form.required.concat(confg.form.suggested);
    return confg.showAll ? fields.concat(confg.form.optional) : fields;
}
function getEntityTypeFields(confg) {
    const fields = confg.type ? 
        confg.type.required.concat(confg.type.suggested) : [];
    return  confg.showAll ? fields.concat(typeConfg.optional) : fields;
}
function getFieldOrder(cfg) {
    const order = cfg.showAll ? getExpandedOrder(cfg) : getDefaultOrder(cfg); 
    return order.map(field => field);
}
/** <type> eg: publication - book, jounrnal, thesis, record, and other 'types'. */
function getExpandedOrder(cfg) {
    return cfg.type ? cfg.form.order.opt.concat(cfg.type.order.opt) : cfg.form.order.opt;
}
function getDefaultOrder(cfg) {
    return cfg.type ? cfg.form.order.sug.concat(cfg.type.order.sug) : cfg.form.order.sug;
}
function getRequiredFields(cfg) {
    return cfg.type ? cfg.type.required.concat(cfg.form.required) : cfg.form.required;
}
/* ===================== BUILD FORM FIELD ROW =============================== */
/** @return {ary} Rows for each field in the entity field obj. */
function buildRows(fieldObj, entity, fVals, fLvl) {                             console.log("buildRows. fLvl = [%s] fields = [%O]", fLvl, fieldObj);
    const rows = [];
    for (let field in fieldObj.fields) {                                        //console.log("  field = ", field);
        rows.push(buildRow(field, fieldObj, entity, fVals, fLvl));
    }  
    return Promise.all(rows);
}
/**
 * @return {div} Form field row with required-state and value (if passed) set.  
 */
function buildRow(field, fieldsObj, entity, fVals, fLvl) {                      console.log("buildRow. field [%s], fLvl [%s], fVals = %O, fieldsObj = %O", field, fLvl, fVals, fieldsObj);
    return buildFieldInput(fieldsObj.fields[field], entity, field, fLvl)
        .then(buildFieldRow);

    function buildFieldRow(input) {                                             //console.log('input = %O', input);
        const isReq = isFieldRequried(field, fLvl, fieldsObj.required);    
        addFieldToFormFieldObj();
        fillFieldIfValuePassed(input);
        $(input).change(storeFieldValue.bind(null, input, field, fLvl, null));
        return buildFormRow(_u('ucfirst', [field]), input, fLvl, isReq, "");
    }
    /** Adds the field, and it's type and value, to the form's field obj.  */
    function addFieldToFormFieldObj() {
        const confg = { val: fVals[field], type: fieldsObj.fields[field] };
        _mmry('setFormFieldConfg', [fLvl, field, fieldsObj]);
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
    if (fieldName !== 'CitationText') { _forms.handleCitText(fLvl); }
    _mmry('setFormFieldValueMemory', [fLvl, fieldName, val]);
}
/** Stores value at index of the order on form, ie the cnt position. */
function storeMultiSelectValue(fLvl, cnt, field, e) {                           //console.log('storeMultiSelectValue. lvl = %s, cnt = %s, field = %s, e = %O', fLvl, cnt, field, e);
    if (e.target.value === "create") { return; }
    const fieldObj = _mmry('getFormFieldConfg', [fLvl, field]);                               
    if (!fieldObj.val) { fieldObj.val = {}; }
    fieldObj.val[cnt] = e.target.value || null;
    _mmry('setFormFieldConfg', [fLvl, field, fieldObj]);
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
        blank = vals[ord] && blank ? 'found' :
            !vals[ord] && !blank ? 'maybe' : blank;  
    } 
    if (blank === 'found') { return _errs.reportFormFieldErr(field, map[field], fLvl); }
    if ($('#'+field+'_errs.'+fLvl+'-active-errs')) { _errs.clrContribFieldErr(field, fLvl); }
}
function buildFieldInput(fieldType, entity, field, fLvl) {                      //console.log('buildFieldInput. type [%s], entity [%s], field [%s], lvl [%s]', fieldType, entity, field, fLvl);
    const builders = { 'text': buildTextInput, 'tags': buildTagField, 
        'select': buildSelectCombo, 'multiSelect': buildMultiSelectCntnr,  
        'textArea': buildTextArea, 'fullTextArea': buildLongTextArea };
    return Promise.resolve(builders[fieldType](entity, field, fLvl));
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
    const attr = { 'type': 'text', class: getFieldClass(fLvl) };
    return _u('buildElem', ['input', attr]);
}
function buildTextArea(entity, field, fLvl) {                                     
    return _u('buildElem', ['textarea', {class: getFieldClass(fLvl) }]);
}
export function buildLongTextArea(entity, field, fLvl) {
    const attr = { class: getFieldClass(fLvl, 'long'), id:field+'-txt' };
    return _u('buildElem', ['textarea', attr]);
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
        const attr = { id: fieldId , class: getFieldClass(fLvl)};
        _mmry('addComboToMemory', [fLvl, field]);
        return _u('buildSelectElem', [opts, attr]);
    }
}
/**
 * Creates a select dropdown field wrapped in a div container that will
 * be reaplced inline upon selection. Either with an existing Author's name, 
 * or the Author create form when the user enters a new Author's name. 
 */
function buildMultiSelectCntnr(entity, field, fLvl) {                           //console.log("entity = %s. field = ", entity, field);
    const cntnr = _u('buildElem', ['div', { id: field+'-sel-cntnr'}]);
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
        const wrapper = _u('buildElem', ['div', {class: 'flex-row'}]);
        const lbl = buildMultiSelectLbl(cnt)
        $(fieldElem).change(storeMultiSelectValue.bind(null, fLvl, cnt, field));
        $(wrapper).append([lbl, fieldElem]);
        return wrapper;
    }

} /* End buildMultiSelectElems */
function buildMultiSelectLbl(cnt) {
    const attr = {text: getCntLabel(cnt), class:'multi-span'};
    const lbl = _u('buildElem', ['span', attr]);
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
        const attr = { id: field + '-sel', class: getFieldClass(fLvl)};
        const tagSel = _u('buildSelectElem', [opts, attr]);
        $(tagSel).data('inputType', 'tags');
        return tagSel;
    }
}
/* ---------- Option Builders --------------------------------------------*/
/** Returns and array of options for the passed field type. */
function getSelectOpts(field) {                                                 //console.log("getSelectOpts. for %s", field);
    const optMap = {
        "Authors": [ getSrcOpts, 'authSrcs'],
        "CitationType": [ getCitTypeOpts, 'citTypeNames'],
        "Class": [ getTaxonOpts, 'Class' ],
        "Country": [ getStoredOpts, 'countryNames' ],
        "Editors": [ getSrcOpts, 'authSrcs'],
        "Family": [ getTaxonOpts, 'Family' ],
        "Genus": [ getTaxonOpts, 'Genus' ],
        "HabitatType": [ getStoredOpts, 'habTypeNames'],
        "InteractionTags": [ getTagOpts, 'interaction' ],
        "InteractionType": [ getStoredOpts, 'intTypeNames' ],
        "Order": [ getTaxonOpts, 'Order' ],
        "PublicationType": [ getStoredOpts, 'pubTypeNames'],
        "Publisher": [ getSrcOpts, 'publSrcs'],
        "Realm": [ getRealmOpts, null ],
        "Species": [ getTaxonOpts, 'Species' ],
        // "Tags": [ getTagOpts, 'source' ],
    };
    const getOpts = optMap[field][0];
    const fieldKey = optMap[field][1];
    return getOpts(fieldKey, field);
}
function getStoredOpts(prop) {
    return _u('getOptsFromStoredData', [prop]);
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
    return _u('getOptsFromStoredData', [entity+"Tags"]);
}
/** Returns an array of source-type (prop) options objects. */
export function getSrcOpts(prop, field, rcrds) {
    const map = { 'pubSrcs': 'Publication', 'publSrcs': 'Publisher', 
        'authSrcs': field ? field.slice(0, -1) : 'Author' };
    return _u('getData', [prop]).then(buildSrcOpts);

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
    return _u('getData', [prop]).then(buildCitTypeOpts);

    function buildCitTypeOpts(types) {
        return _u('buildOptsObj', [types, getCitTypeNames().sort()]);
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
        _mmry('setFormProp', [fLvl, 'pub', { pub: pub, src: pubSrc}]);
    }
    function getSrcRcrd(pubId) {
        if (pubId) { return fP.records.source[pubId]; } //When not editing citation record.
        const rcrd = _mmry('getRcrd', ['source', fP.editing.core]);
        return fP.records.source[rcrd.parent];
    }
} /* End getCitTypeOpts */
/** Returns an array of taxonyms for the passed level and the form's realm. */
export function getTaxonOpts(level, field, r) {
    let realm = r ? r : _mmry('getTaxonProp', ['realm']);
    return _u('getOptsFromStoredData', [realm+level+'Names'])
        .then(buildTaxonOpts);

        function buildTaxonOpts(opts) {                                         //console.log("taxon opts for [%s] = %O", fP.forms.taxonPs.realm+level+"Names", opts)        
            opts.unshift({ value: 'create', text: 'Add a new '+level+'...'});
            return opts;
        }
}
function getRealmOpts() {
    return _u('getOptsFromStoredData', ['objectRealmNames']);  
}
/**
 * Each element is built, nested, and returned as a completed row. 
 * rowDiv>(errorDiv, fieldDiv>(label, input, [pin]))
 */
export function buildFormRow(field, input, fLvl, isReq, rowClss) {                     //console.log('building form row for [%s], req? [%s]', field, isReq);
    const rowDiv = buildRowContainer(field, input, fLvl, rowClss);
    const errorDiv = _u('buildElem', ['div', { id: field+'_errs'}]); 
    const fieldCntnr = buildFieldContainer(input, field, fLvl, isReq);   
    $(rowDiv).append([errorDiv, fieldCntnr]);
    return rowDiv;
} 
function buildRowContainer(field, input, fLvl, rowClss) {
    const attr = { class: getRowClasses(), id: field + '_row'}
    return _u('buildElem', ['div', attr]);
    /** Returns the style classes for the row. */
    function getRowClasses() { 
        const rowClass = input.className.includes('xlrg-field') ? 
            'full-row' : (fLvl + '-row') + (rowClss ? (' '+rowClss) : '');      //console.log("rowClass = ", rowClass)
        return rowClass; 
    }
}
function buildFieldContainer(input, field, fLvl, isReq) {
    const cntnr = _u('buildElem', ['div', { class: 'field-row flex-row'}]);
    const label = buildFieldLabel(field);
    const pin = fLvl === 'top' ? getPinElem(field) : null;  
    $(cntnr).append([label, input, pin]);
    if (isReq) { handleRequiredField(label, input, fLvl); } 
    return cntnr;
}
function buildFieldLabel(field) {
    const fieldName = field.replace(/([A-Z])/g, ' $1'); //Adds space between pascal-cased words
    const attr = {text: _u('ucfirst', [fieldName]).trim(), id:field+'-lbl'};
    return _u('buildElem', ['label', attr]);
}
function getPinElem(field) {
    const pin = buildPinElem(field);
    handledRelatedFieldPins(pin, field);
    return pin;
}
function buildPinElem(field) {
    const attr = {type: 'checkbox', id: field+'_pin', class: 'top-pin'};
    const pin = _u('buildElem', ['input', attr]);
    _u('addEnterKeypressClick', [pin]);
    return pin;
}
function handledRelatedFieldPins(pin, field) {
    const relFields = ['CitationTitle', 'Country-Region', 'Location', 'Publication'];
    if (relFields.indexOf(field) !== -1) { $(pin).click(checkConnectedFieldPin); }
}
/**
 * When a dependent field is pinned, the connected field will also be pinned.
 * If the connected field is unpinned, the dependant field is as well.
 */
function checkConnectedFieldPin() {
    const field = this.id.split("_pin")[0]; 
    const params = {
        'CitationTitle': { checked: true, relField: 'Publication' },
        'Country-Region': { checked: false, relField: 'Location' },
        'Location': { checked: true, relField: 'Country-Region' },
        'Publication': { checked: false, relField: 'CitationTitle' },
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
    _mmry('addRequiredFieldInput', [fLvl, input]);
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
    if (!isRequiredFieldFilled(fLvl, input) || hasOpenSubForm(fLvl)) {          //console.log('     disabling submit');
        _forms.ui('toggleSubmitBttn', [subBttnId, false]); 
    } else if (ifAllRequiredFieldsFilled(fLvl)) {                               //console.log('     enabling submit');
        if (locHasGpsData(fLvl)) { return; }
        ifInteractionFormHandleReset(fLvl);
        _forms.ui('toggleSubmitBttn', [subBttnId, true]); 
    }
}
/** Returns true if all the required elements for the current form have a value. */
export function ifAllRequiredFieldsFilled(fLvl) {                               //console.log("   ->-> ifAllRequiredFieldsFilled... fLvl = %s", fLvl)
    const reqElems = _mmry('getFormProp', ['reqElems', fLvl]);          //console.log('reqElems = %O', reqElems);
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
    if (_mmry('getFormProp', ['entity', fLvl]) !== 'location') { return false; }
    return ['Latitude', 'Longitude'].some(field => {
        return $(`#${field}_row input`).val();
    });
}
/** After interaction form submit, the submit button is disabled until form data changes. */
function ifInteractionFormHandleReset(fLvl) {
    if (_mmry.getFormEntity(fLvl) !== 'interaction') { return; }
    _forms.callFormFunc('interaction', 'resetIfFormWaitingOnChanges');  
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
    const form = document.createElement('form');
    $(form).attr({'action': '', 'method': 'POST', 'name': 'top'});
    form.className = 'flex-row';
    form.id = 'top-form';
    return form;
}
function buildEntityFieldContainer(entity, fields) {
    const attr = { id: entity+'_Rows', class: 'flex-row flex-wrap' };
    const div = _u('buildElem', ['div', attr]);
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
    const  row = _u('buildElem', ['div', { class: 'exit-row' }]);
    $(row).append(getExitButton());
    return row;        
}
export function getExitButton() {
    const attr = { 'id': 'exit-form', 'class': 'tbl-bttn exit-bttn', 'type': 'button', 'value': 'X' }
    const bttn = _u('buildElem', ['input', attr]);
    $(bttn).click(_forms.exitFormWindow);
    return bttn;
}
function getFormHtml(entity, id, action) {
    const cntnr = _u('buildElem', ['div', { class: 'flex-row' }]);
    const detailPanelHtml = _forms.uiPanel('getDetailPanelElems', [entity, id, fP]);
    $(cntnr).append([getMainFormHtml(entity, action), detailPanelHtml]);
    return cntnr;
}
function getMainFormHtml(entity, action) { 
    const formWin = _u('buildElem', ['div', { id: 'form-main', class: fP.action }]);
    $(formWin).append(getHeaderHtml(entity, action));
    return formWin;
}
function getHeaderHtml(entity, action) {
    const title = (action == 'New' ? 'New ' : 'Editing ') + _u('ucfirst', [entity]);    
    return _u('buildElem', ['h1', { 'id': 'top-hdr', 'text': title }]);
}