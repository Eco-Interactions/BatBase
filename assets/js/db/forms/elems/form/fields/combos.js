/**
 * Handles building select fields (which will be turned into comboboxes with selectize)
 * and building options arrays. 
 *
 * EXPORTS:
 *     buildMultiSelect
 *     buildMultiSelectElem
 *     buildSelect
 *     buildTagField
 *     getLocationOpts
 *     getRcrdOpts
 *     getSrcOpts
 *     getTaxonOpts
 *
 * CODE SECTIONS:
 *     TAGS COMBOBOX
 *     SINGLE SELECT/COMBOS
 *     MULTI-SELECT/COMBOS
 *     OPTIONS BUILDERS
 */
import * as _f from '../../../forms-main.js';

/* ---------------------- TAGS COMBOBOX ------------------------------------- */ 
/**
 * Creates and returns a select dropdown that will be initialized with 'selectize'
 * to allow multiple selections. A data property is added for use form submission.
 */
export function buildTagField(entity, field, fLvl) {
    const attr = { id: field + '-sel', class: 'med-field'};
    const tagSel = _f.util('buildSelectElem', [[], attr]);
    $(tagSel).data('inputType', 'tags');
    _f.mmry('addComboToFormState', [fLvl, field]);
    return tagSel;
}
/* --------------------- SINGLE SELECT/COMBOS ------------------------------- */ 
/**
 * Creates and returns a select dropdown for the passed field. If it is one of 
 * a larger set of select elems, the current count is appended to the id. Adds 
 * the select's fieldName to the subForm config's 'selElem' array to later 
 * init the 'selectize' combobox. 
 */
export function buildSelect(entity, field, fLvl, cnt) {                         //console.log("buildSelect [%s] field [%s], fLvl [%s], cnt [%s]", entity, field, fLvl, cnt);                            
    return getSelectOpts(field)
        .then(finishSelectBuild);

    function finishSelectBuild(opts) {  
        const fieldId = cnt ? field + '-sel' + cnt : field + '-sel';
        const attr = { id: fieldId , class: 'med-field'};
        _f.mmry('addComboToFormState', [fLvl, field]);
        return _f.util('buildSelectElem', [opts, attr]);
    }
}
/* ---------------------- MULTI-SELECT/COMBOS ------------------------------- */ 
/**
 * Creates a select dropdown field wrapped in a div container that will
 * be reaplced inline upon selection. Either with an existing Author's name, 
 * or the Author create form when the user enters a new Author's name. 
 */
export function buildMultiSelect(entity, field, fLvl) {                           //console.log("entity = %s. field = ", entity, field);
    const cntnr = _f.util('buildElem', ['div', { id: field+'-sel-cntnr'}]);
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
        const wrapper = _f.util('buildElem', ['div', {class: 'flex-row'}]);
        const lbl = buildMultiSelectLbl(cnt)
        $(input).change(storeMultiSelectValue.bind(null, fLvl, cnt, field));
        $(wrapper).append([lbl, input]);
        return wrapper;
    }
} 
function buildMultiSelectLbl(cnt) {
    const attr = {text: getCntLabel(cnt), class:'multi-span'};
    const lbl = _f.util('buildElem', ['span', attr]);
    $(lbl).css({padding: '.2em .5em 0 0', width: '2.2em'});
}
function getCntLabel(cnt) {
    const map = {1: '1st: ', 2:'2nd: ', 3:'3rd: '};
    return cnt in map ? map[cnt] : cnt+'th: '; 
}
function storeMultiSelectValue(fLvl, cnt, field, e) {                           //console.log('storeMultiSelectValue. lvl = %s, cnt = %s, field = %s, e = %O', fLvl, cnt, field, e);
    const valueObj = _f.mmry('getFormFieldData', [fLvl, field]).val;             //console.log('fieldObj = %O', fieldObj);                
    valueObj[cnt] = e.target.value || null;
    _f.mmry('setFormFieldData', [fLvl, field, valueObj, 'multiSelect']);
    checkForBlanksInOrder(valueObj, field, fLvl);    
}
/**
 * Author/editor fields must have all fields filled continuously. There can 
 * be no blanks in the selected order. If found, an error is shown to the user.
 */
function checkForBlanksInOrder(vals, field, fLvl) {                             //console.log('checkForBlanksInOrder. [%s] vals = %O', field, vals);
    let blank = checkForBlanks(vals);
    if (blank === 'found') { return reportFieldErr(field, fLvl); }
    ifPreviousErrClearIt(field, fLvl);
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
function reportFieldErr(field, fLvl) {
    const errTags = { 'Authors': 'fillAuthBlanks', 'Editors': 'fillEdBlanks' };
     _f.val('reportFormFieldErr', [field, errTags[field], fLvl]);
}
function ifPreviousErrClearIt(field, fLvl) {
    if (!$('#'+field+'_f.val.'+fLvl+'-active-errs')) { return; }
    _f.val('clrContribFieldErr', [field, fLvl]);
}
/* ----------------- OPTIONS BUILDERS --------------------------------------- */
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
        // 'InteractionTags': [ getTagOpts, 'interaction' ],
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
    return _f.util('getOptsFromStoredData', [prop]);
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
// NOTE: DON'T DELETE. USEFUL ONCE TAGS ARE USED FOR MORE THAN JUST INTERACTIONS.
// /** Returns an array of options objects for tags of the passed entity. */
// function getTagOpts(entity) {
//     return _f.util('getOptsFromStoredData', [entity+"Tags"]);
// }
/** Returns an array of source-type (prop) options objects. */
export function getSrcOpts(prop, field, rcrds) {  
    return _f.util('getData', [prop]).then(buildSrcOpts);

    function buildSrcOpts(ids) {   
        const srcs = rcrds || _f.mmry('getEntityRcrds', ['source']);
        const opts = getRcrdOpts(ids, srcs);
        opts.unshift({ value: 'create', text: 'Add a new '+getFieldName()+'...'});
        return opts;
    }
    function getFieldName() {
        return { 
            'pubSrcs': 'Publication',   'publSrcs': 'Publisher', 
            'authSrcs': field ? field.slice(0, -1) : 'Author' 
        }[prop];
    }
}
/** Return the citation type options available for the parent-publication's type. */
function getCitTypeOpts(prop) {  
    const fLvl = _f.getSubFormLvl('sub');  
    return _f.util('getData', [prop]).then(buildCitTypeOpts);

    function buildCitTypeOpts(types) {
        return _f.util('buildOptsObj', [types, getCitTypeNames().sort()]);
    }
    function getCitTypeNames() {
        const opts = {
            'Book': ['Book', 'Chapter'], 'Journal': ['Article'],
            'Other': ['Museum record', 'Other', 'Report'],
            'Thesis/Dissertation': ["Master's Thesis", 'Ph.D. Dissertation']
        };
        const pubRcrd = _f.mmry('getFormProp', [fLvl, 'rcrds']).pub; 
        return opts[pubRcrd.publicationType.displayName];
    }
} /* End getCitTypeOpts */
/** Returns an array of taxonyms for the passed level and the form's realm. */
export function getTaxonOpts(level, field, r) {
    let realm = r ? r : _f.mmry('getTaxonProp', ['realmName']);
    return _f.util('getOptsFromStoredData', [realm+level+'Names'])
        .then(buildTaxonOpts);

        function buildTaxonOpts(opts) {                                         //console.log("taxon opts for [%s] = %O", mmry.forms.realmData.realm+level+"Names", opts)        
            opts.unshift({ value: 'create', text: 'Add a new '+level+'...'});
            return opts;
        }
}
function getRealmOpts() {
    const realms = _f.mmry('getTaxonProp', ['realms']);
    const opts = Object.keys(realms).map(getRealmOpt).filter(o => o);  
    return opts;

    function getRealmOpt(name) {  
        if (name === 'Bat') { return null; }
        return { value: realms[name], text: name };
    }
}
/** Returns options for each country and region. */ 
function getCntryRegOpts() {
    const proms = ['countryNames', 'regionNames'].map(k => _f.util('getOptsFromStoredData', [k]));
    return Promise.all(proms).then(data => data[0].concat(data[1]));
}
/** Returns an array of option objects with all unique locations.  */
export function getLocationOpts() {
    const rcrds = _f.mmry('getEntityRcrds', ['location']);
    let opts = Object.keys(rcrds).map(buildLocOpt);
    opts = opts.sort((a, b) => _f.util('alphaOptionObjs', [a, b]));
    opts.unshift({ value: 'create', text: 'Add a new Location...'});
    return opts;
    
    function buildLocOpt(id) {
        return { value: id, text: rcrds[id].displayName };
    }
}