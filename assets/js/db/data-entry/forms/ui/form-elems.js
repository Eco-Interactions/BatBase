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
import * as _i from '../forms-main.js';
import { buildFormFooter } from './form-footer.js';

let mmry;
/**
 * Builds and returns the subForm according to the passed params. Disables the 
 * select elem 'parent' of the sub-form. 
 * (container)DIV>[(header)P, (fields)DIV, (buttons)DIV]
 */
export function initSubForm(fLvl, fClasses, fVals, selId) {                     //console.log('       /initSubForm called. args = %O', arguments)
    mmry = _i.mmry('getAllFormMemory');
    const formEntity = mmry.forms[fLvl].entity;  
    return buildFormRows(formEntity, fVals, fLvl)
        .then(buildFormContainer)

    function buildFormContainer(rows) {
        const subFormContainer = buildSubFormCntnr(); 
        const bttns = buildFormFooter(formEntity, fLvl, 'create', null, mmry);
        $(subFormContainer).append([buildFormHdr(), rows, bttns]);
        _i.mmry('setFormProp', [fLvl, 'pSelId', selId]);
        _i.cmbx('enableCombobox', [selId, false]);
        mmry = null;
        return subFormContainer;
    }
    function buildSubFormCntnr() {
        const attr = {id: fLvl+'-form', class: fClasses };        
        return _i.util('buildElem', ['div', attr]);
    }
    function buildFormHdr() {
        const attr = { text: 'New '+_i.util('ucfirst', [formEntity]), id: fLvl+'-hdr' };
        return _i.util('buildElem', ['p', attr]);
    }
}
/** 
 * Builds and returns the default fields for entity sub-form and returns the 
 * row elems. Inits the params for the sub-form in the global mmry obj.
 */
export function buildFormRows(entity, fVals, fLvl, params) {                    //console.log('buildFormRows. args = %O', arguments)
    setFormParams(params);
    return getFormFieldRows(entity, fVals, fLvl)
        .then(returnFinishedRows.bind(null, entity, params));
}
function setFormParams(params) {
    if (params) { mmry = params; 
    } else if (!mmry) { 
        mmry = _i.mmry('getAllFormMemory'); 
    }
}
function returnFinishedRows(entity, params, rows) {
    const attr = { id: entity+'_Rows', class: 'flex-row flex-wrap'};
    const rowCntnr = _i.util('buildElem', ['div', attr]);
    $(rowCntnr).append(rows);
    if (params) { mmry = null; }
    return rowCntnr;
}
/** -------------------- Form Row Builders ------------------------------ */
/**
 * Returns rows for the entity form fields. If the form is a source-type, 
 * the type-entity form config is used. 
 */
export function getFormFieldRows(entity, fVals, fLvl, params) {
    mmry = params ? params : _i.mmry('getAllFormMemory');
    const fObj = getFieldTypeObj(_i.util('lcfirst', [entity]), fLvl);
    return buildRows(fObj, entity, fVals, fLvl);
}
/* ------------ BUILD FORM FIELDS' TYPE OBJ ------------- */
/**
 * Returns an obj with the entity's field defs and all required fields.
 * @return {obj} .fields   Obj - k: fieldName, v: fieldType.
 *               .required Ary of required fields
 */
function getFieldTypeObj(entity, fLvl) {                                        
    const confg = {
        entity: entity,
        form: _i.confg('getFormConfg', [entity]), 
        type: getEntityTypeFormConfg(entity, fLvl),
        showAll: mmry.forms[fLvl].expanded
    };
    return buildFieldTypeObj(confg, mmry.forms[fLvl].fieldConfg);
}   
function getEntityTypeFormConfg(entity, fLvl) {
    const type = mmry.forms[fLvl].entityType;
    return type ? _i.confg('getFormConfg', [entity]).types[type] : false;
}
function buildFieldTypeObj(confg, fieldConfg) {                                 //console.log('fieldConfg = %O', fieldConfg);
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
    const coreFields = _i.confg('getCoreFieldDefs', [confg.entity]);
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
    return  confg.showAll ? fields.concat(confg.type.optional) : fields;
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
function buildRows(fieldObj, entity, fVals, fLvl) {                             //console.log("buildRows. fLvl = [%s] fields = [%O]", fLvl, fieldObj);
    return Promise.all(fieldObj.order.map(field => {
        return Array.isArray(field) ? 
            buildMultiFieldRow(field) : buildSingleFieldRow(field);
    }));
    
    function buildMultiFieldRow(fields) {                                       //console.log('buildMultiFieldRow = %O', fields);
        const cntnr = _i.util('buildElem', ['div', { class: 'full-row flex-row cntnr-row' }]);
        const rows = fields.reduce(buildAndAppendField, Promise.resolve());
        return rows.then(() => cntnr);

        function buildAndAppendField(p, field) {
            return p.then(() => buildSingleFieldRow(field)
                .then(row => $(cntnr).append(row)));
        }
    }
    function buildSingleFieldRow(field) {                                       //console.log('buildSingleFieldRow [%s]', field);  
        return buildRow(field, fieldObj, entity, fVals, fLvl);
    }
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
        return buildFormRow(_i.util('ucfirst', [field]), input, fLvl, isReq, "");
    }
    /** Adds the field, and it's type and value, to the form's field obj.  */
    function addFieldToFormFieldObj() {
        const confg = { val: fVals[field], type: fieldsObj.fields[field] };
        _i.mmry('setFormFieldConfg', [fLvl, field, confg]);
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
    if (fieldName !== 'CitationText') { _i.entity('handleCitText', [fLvl]); }
    _i.mmry('setFormFieldValueMemory', [fLvl, fieldName, val]);
}
/** Stores value at index of the order on form, ie the cnt position. */
function storeMultiSelectValue(fLvl, cnt, field, e) {                           //console.log('storeMultiSelectValue. lvl = %s, cnt = %s, field = %s, e = %O', fLvl, cnt, field, e);
    if (e.target.value === 'create') { return; }
    let fieldObj = _i.mmry('getFormFieldConfg', [fLvl, field]);                   //console.log('fieldObj = %O', fieldObj);                
    if (!fieldObj.val) { fieldObj.val = {}; }
    fieldObj.val[cnt] = e.target.value || null;
    _i.mmry('setFormFieldConfg', [fLvl, field, fieldObj]);
    checkForBlanksInOrder(fieldObj.val, field, fLvl);    
}
/**
 * Author/editor fields must have all fields filled continuously. There can 
 * be extra blanks on the end, but none at the beginning. If blanks are found,
 * an error is shown to the user, otherwise any active errors are cleared. 
 */
function checkForBlanksInOrder(vals, field, fLvl) {                             //console.log('checkForBlanksInOrder. [%s] vals = %O', field, vals);
    const errTags = { 'Authors': 'fillAuthBlanks', 'Editors': 'fillEdBlanks' };
    let blank = checkForBlanks(vals);
    if (blank === 'found') { return reportFieldErr(field, errTags[field], fLvl); }
    clearPreviousErr(field, fLvl);
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
function reportFieldErr(field, errTag, fLvl) {
     _i.err('reportFormFieldErr', [field, errTag, fLvl]);
}
function clearPreviousErr(field, fLvl) {
    if (!$('#'+field+'_i.err.'+fLvl+'-active-errs')) { return; }
    _i.err('clrContribFieldErr', [field, fLvl]);
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
function isFieldRequried(field, fLvl, reqFields) {                              //console.log('isFieldRequried. fLvl = [%s], mmry = %O', fLvl, mmry);
    return reqFields.indexOf(field) !== -1;
}
/*----------------------- Form Input Builders ----------------------------*/
function buildTextInput(entity, field, fLvl) { 
    const attr = { 'type': 'text', class: getFieldClass(fLvl) };
    return _i.util('buildElem', ['input', attr]);
}
function buildTextArea(entity, field, fLvl) {                                     
    return _i.util('buildElem', ['textarea', {class: getFieldClass(fLvl) }]);
}
export function buildLongTextArea(entity, field, fLvl) {
    const attr = { class: getFieldClass(fLvl, 'long'), id:field+'-txt' };
    return _i.util('buildElem', ['textarea', attr]);
}
/**
 * Creates and returns a select dropdown for the passed field. If it is one of 
 * a larger set of select elems, the current count is appended to the id. Adds 
 * the select's fieldName to the subForm config's 'selElem' array to later 
 * init the 'selectize' combobox. 
 */
function buildSelectCombo(entity, field, fLvl, cnt) {                           //console.log("buildSelectCombo [%s] field [%s], fLvl [%s], cnt [%s]", entity, field, fLvl, cnt);                            
    return getSelectOpts(field)
        .then(finishSelectBuild);

    function finishSelectBuild(opts) {  
        const fieldId = cnt ? field + '-sel' + cnt : field + '-sel';
        const attr = { id: fieldId , class: getFieldClass(fLvl)};
        _i.mmry('addComboToMemory', [fLvl, field]);
        return _i.util('buildSelectElem', [opts, attr]);
    }
}
/**
 * Creates a select dropdown field wrapped in a div container that will
 * be reaplced inline upon selection. Either with an existing Author's name, 
 * or the Author create form when the user enters a new Author's name. 
 */
function buildMultiSelectCntnr(entity, field, fLvl) {                           //console.log("entity = %s. field = ", entity, field);
    const cntnr = _i.util('buildElem', ['div', { id: field+'-sel-cntnr'}]);
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
        const wrapper = _i.util('buildElem', ['div', {class: 'flex-row'}]);
        const lbl = buildMultiSelectLbl(cnt)
        $(fieldElem).change(storeMultiSelectValue.bind(null, fLvl, cnt, field));
        $(wrapper).append([lbl, fieldElem]);
        return wrapper;
    }

} /* End buildMultiSelectElems */
function buildMultiSelectLbl(cnt) {
    const attr = {text: getCntLabel(cnt), class:'multi-span'};
    const lbl = _i.util('buildElem', ['span', attr]);
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
        const tagSel = _i.util('buildSelectElem', [opts, attr]);
        $(tagSel).data('inputType', 'tags');
        _i.mmry('addComboToMemory', [fLvl, field]);
        return tagSel;
    }
}
/* ---------- Option Builders --------------------------------------------*/
/** Returns and array of options for the passed field type. */
function getSelectOpts(field) {                                                 //console.log("getSelectOpts. for [%s]", field);
    const optMap = {
        'Authors': [ getSrcOpts, 'authSrcs'],
        'CitationType': [ getCitTypeOpts, 'citTypeNames'],
        'Class': [ getTaxonOpts, 'Class' ],
        'Country': [ getStoredOpts, 'countryNames' ],
        'Country-Region': [ getCntryRegOpts, null ],
        'CitationTitle': [() => []],
        'Editors': [ getSrcOpts, 'authSrcs'],
        'Family': [ getTaxonOpts, 'Family' ],
        'Genus': [ getTaxonOpts, 'Genus' ],
        'HabitatType': [ getStoredOpts, 'habTypeNames'],
        'InteractionTags': [ getTagOpts, 'interaction' ],
        'InteractionType': [ getStoredOpts, 'intTypeNames' ],
        'Location': [ getLocationOpts, null ],
        'Order': [ getTaxonOpts, 'Order' ],
        'Object': [() => []],
        'Publication': [ getSrcOpts, 'pubSrcs'],
        'PublicationType': [ getStoredOpts, 'pubTypeNames'],
        'Publisher': [ getSrcOpts, 'publSrcs'],
        'Realm': [ getRealmOpts, null ],
        'Species': [ getTaxonOpts, 'Species' ],
        'Subject': [() => []]
        // "Tags": [ getTagOpts, 'source' ],
    };
    const getOpts = optMap[field][0];
    const fieldKey = optMap[field][1];
    return Promise.resolve(getOpts(fieldKey, field));
}
function getStoredOpts(prop) {
    return _i.util('getOptsFromStoredData', [prop]);
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
    return _i.util('getOptsFromStoredData', [entity+"Tags"]);
}
/** Returns an array of source-type (prop) options objects. */
export function getSrcOpts(prop, field, rcrds) {
    const map = { 'pubSrcs': 'Publication', 'publSrcs': 'Publisher', 
        'authSrcs': field ? field.slice(0, -1) : 'Author' };
    return _i.util('getData', [prop]).then(buildSrcOpts);

    function buildSrcOpts(ids) {
        const srcs = rcrds || _i.mmry('getEntityRcrds', ['source']);
        const opts = getRcrdOpts(ids, srcs);
        opts.unshift({ value: 'create', text: 'Add a new '+map[prop]+'...'});
        return opts;
    }
}
/** Return the citation type options available for the parent-publication's type. */
function getCitTypeOpts(prop) {  
    const fLvl = _i.getSubFormLvl('sub');  
    return _i.util('getData', [prop]).then(buildCitTypeOpts);

    function buildCitTypeOpts(types) {
        return _i.util('buildOptsObj', [types, getCitTypeNames().sort()]);
    }
    function getCitTypeNames() {
        const opts = {
            'Book': ['Book', 'Chapter'], 'Journal': ['Article'],
            'Other': ['Museum record', 'Other', 'Report'],
            'Thesis/Dissertation': ["Master's Thesis", 'Ph.D. Dissertation']
        };
        const pubRcrd = _i.mmry('getFormProp', ['rcrds', fLvl]).pub; 
        return opts[pubRcrd.publicationType.displayName];
    }
} /* End getCitTypeOpts */
/** Returns an array of taxonyms for the passed level and the form's realm. */
export function getTaxonOpts(level, field, r) {
    let realm = r ? r : _i.mmry('getTaxonProp', ['realm']);
    return _i.util('getOptsFromStoredData', [realm+level+'Names'])
        .then(buildTaxonOpts);

        function buildTaxonOpts(opts) {                                         //console.log("taxon opts for [%s] = %O", mmry.forms.taxonPs.realm+level+"Names", opts)        
            opts.unshift({ value: 'create', text: 'Add a new '+level+'...'});
            return opts;
        }
}
function getRealmOpts() {
    return _i.util('getOptsFromStoredData', ['objectRealmNames']);  
}
/** Returns options for each country and region. */ 
function getCntryRegOpts() {
    const proms = ['countryNames', 'regionNames'].map(k => _i.util('getOptsFromStoredData', [k]));
    return Promise.all(proms).then(data => data[0].concat(data[1]));
}
/** Returns an array of option objects with all unique locations.  */
export function getLocationOpts() {
    const rcrds = mmry.records.location;
    let opts = Object.keys(rcrds).map(buildLocOpt);
    opts = opts.sort((a, b) => _i.util('alphaOptionObjs', [a, b]));
    opts.unshift({ value: 'create', text: 'Add a new Location...'});
    return opts;
    
    function buildLocOpt(id) {
        return { value: id, text: rcrds[id].displayName };
    }
}
/**
 * Each element is built, nested, and returned as a completed row. 
 * rowDiv>(errorDiv, fieldDiv>(label, input, [pin]))
 */
export function buildFormRow(field, input, fLvl, isReq, rowClss) {              //console.log('building form row for [%s], req? [%s]', field, isReq);
    const rowDiv = buildRowContainer(field, input, fLvl, rowClss);
    const errorDiv = _i.util('buildElem', ['div', { id: field+'_i.err'}]); 
    const fieldCntnr = buildFieldContainer(input, field, fLvl, isReq);   
    $(rowDiv).append([errorDiv, fieldCntnr]);
    return rowDiv;
} 
function buildRowContainer(field, input, fLvl, rowClss) {
    const attr = { class: getRowClasses(), id: field + '_row'}
    return _i.util('buildElem', ['div', attr]);
    /** Returns the style classes for the row. */
    function getRowClasses() { 
        const rowClass = input.className.includes('xlrg-field') ? 
            'full-row' : (fLvl + '-row') + (rowClss ? (' '+rowClss) : '');      //console.log("rowClass = ", rowClass)
        return rowClass; 
    }
}
function buildFieldContainer(input, field, fLvl, isReq) {
    const cntnr = _i.util('buildElem', ['div', { class: 'field-row flex-row'}]);
    const label = buildFieldLabel(field);
    const pin = fLvl === 'top' ? getPinElem(field) : null;  
    $(cntnr).append([label, input, pin]);
    if (isReq) { handleRequiredField(label, input, fLvl); } 
    return cntnr;
}
function buildFieldLabel(field) {
    const fieldName = field.replace(/([A-Z])/g, ' $1'); //Adds space between pascal-cased words
    const attr = {text: _i.util('ucfirst', [fieldName]).trim(), id:field+'-lbl'};
    return _i.util('buildElem', ['label', attr]);
}
function getPinElem(field) {
    const pin = buildPinElem(field);
    handledRelatedFieldPins(pin, field);
    return pin;
}
function buildPinElem(field) {
    const attr = {type: 'checkbox', id: field+'_pin', class: 'top-pin'};
    const pin = _i.util('buildElem', ['input', attr]);
    _i.util('addEnterKeypressClick', [pin]);
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
    _i.mmry('addRequiredFieldInput', [fLvl, input]);
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
    _i.entity('handleCitText', [fLvl]);
}
/**
 * Note: The 'unchanged' property exists only after the create interaction form 
 * has been submitted and before any changes have been made.
 */
export function checkReqFieldsAndToggleSubmitBttn(input, fLvl) {                       //console.log('### checkingReqFields = %O, fLvl = %s, unchanged? ', input, fLvl, mmry.forms.top.unchanged);
    const subBttnId = '#'+fLvl+'-submit';
    if (!isRequiredFieldFilled(fLvl, input) || hasOpenSubForm(fLvl)) {          //console.log('     disabling submit');
        _i.ui('toggleSubmitBttn', [subBttnId, false]); 
    } else if (ifAllRequiredFieldsFilled(fLvl)) {                               //console.log('     enabling submit');
        if (locHasGpsData(fLvl)) { return; }
        _i.ui('toggleSubmitBttn', [subBttnId, true]); 
    }
}
/** Returns true if all the required elements for the current form have a value. */
export function ifAllRequiredFieldsFilled(fLvl) {                               //console.log("   ->-> ifAllRequiredFieldsFilled... fLvl = %s", fLvl)
    const reqElems = _i.mmry('getFormProp', ['reqElems', fLvl]);          
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
    const childFormLvl = _i.getNextFormLevel('child', fLvl);
    return $('#'+childFormLvl+'-form').length > 0;
}
/** Prevents the location form's submit button from enabling when GPS data entered.*/
function locHasGpsData(fLvl) {
    if (_i.mmry('getFormProp', ['entity', fLvl]) !== 'location') { return false; }
    return ['Latitude', 'Longitude'].some(field => {
        return $(`#${field}_row input`).val();
    });
}


/* -------------------- APPEND FIELDS AND FORM ------------------------------ */
export function buildAndAppendForm(fLvl, fields, id) { 
    mmry = _i.mmry('getAllFormMemory');
    showFormPopup(mmry.action, mmry.entity, id);
    const form = buildFormElem();  
    const fieldContainer = buildEntityFieldContainer(mmry.entity, fields);
    $(form).append([fieldContainer, buildFormFooter(mmry.entity, fLvl, mmry.action, null, mmry)]);
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
    const attr = { id: entity+'_Rows', class: 'flex-row' };
    const div = _i.util('buildElem', ['div', attr]);
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
    const  row = _i.util('buildElem', ['div', { class: 'exit-row' }]);
    $(row).append(getExitButton());
    return row;        
}
export function getExitButton() {
    const attr = { 'id': 'exit-form', 'class': 'tbl-bttn exit-bttn', 'type': 'button', 'value': 'X' }
    const bttn = _i.util('buildElem', ['input', attr]);
    $(bttn).click(_i.exitFormWindow);
    return bttn;
}
function getFormHtml(entity, id, action) {
    const cntnr = _i.util('buildElem', ['div', { class: 'flex-row' }]);
    const detailPanelHtml = _i.panel('getDetailPanelElems', [entity, id, mmry]);
    $(cntnr).append([getMainFormHtml(entity, action), detailPanelHtml]);
    return cntnr;
}
function getMainFormHtml(entity, action) { 
    const formWin = _i.util('buildElem', ['div', { id: 'form-main', class: mmry.action }]);
    $(formWin).append(getHeaderHtml(entity, action));
    return formWin;
}
function getHeaderHtml(entity, action) {
    const title = (action == 'New' ? 'New ' : 'Editing ') + _i.util('ucfirst', [entity]);    
    return _i.util('buildElem', ['h1', { 'id': 'top-hdr', 'text': title }]);
}