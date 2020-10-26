/**
 * Handles building and managing the form comboboxes.
 *
 * TOC
 *    COMBOBOX HELPERS
 *        INIT
 *        RESET
 *    COMBOBOX BUILDERS
 *        TAGS COMBOBOX
 *        SINGLE SELECT/COMBOS
 *        MULTI-SELECT/COMBOS
 *    OPTIONS BUILDERS
 *        SOURCE
 *        TAXON
 *        LOCATION
 */
import { _u } from '../../../../../db-main.js';
import { _state, _val, getSubFormLvl } from '../../../../forms-main.js';

/* ====================== COMBOBOX HELPERS ================================== */
/* -------------------------- INIT ------------------------------------------ */
/**
 * Inits 'selectize' for each select elem in the form's 'selElems' array
 * according to the 'selMap' config. Empties array after intializing.
 */
export function initFormCombos(entity, fLvl, comboEvents) {         /*dbug-log*/console.log("initFormCombos. [%s] formLvl = [%s], events = %O", entity, fLvl, comboEvents);
    const elems = _state('getFormProp', [fLvl, 'selElems']);
    elems.forEach(selectizeElem);
    _state('setFormProp', [fLvl, 'selElems', []]);

    function selectizeElem(fieldName) {
        const confg = getFieldConfg(comboEvents, fieldName);        /*dbug-log*/console.log("   Initializing [%s] confg = %O", fieldName, confg);
        _u('initCombobox', [confg]);
    }
}
function getFieldConfg(comboEvents, fieldName) {
    const baseConfg = getBaseFieldConfg(fieldName) ;                /*dbug-log*///console.log('baseConfg = %O, eventConfg = %O', baseConfg, comboEvents);
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
    const selId = _state('getFormParentId', [fLvl]);
    if (!selId) { return; }
    const field = selId.split('sel-')[1];
    _u('resetCombobox', [field]);
    _u('enableCombobox', [field]);
    _u('focusCombobox', [field, focus]);
}
/* ====================== COMBOBOX BUILDERS ================================= */
export function buildComboInput(type, entity, field, fLvl) {        /*dbug-log*///console.log('buildComboInput [%s], args = %O', type, arguments);
    const map = {
        multiSelect: buildMultiSelect,
        select: buildSelect,
        tags: buildTagField,
    };
    return map[type](entity, field, fLvl);
}
/* ---------------------- TAGS COMBOBOX ------------------------------------- */
/**
 * Creates and returns a select dropdown that will be initialized with 'selectize'
 * to allow multiple selections. A data property is added for use form submission.
 */
function buildTagField(entity, field, fLvl) {
    const attr = { id: 'sel-'+field, class: 'med-field'};
    const tagSel = _u('buildSelectElem', [[], attr]);
    $(tagSel).data('inputType', 'tags');
    _state('addComboToFormState', [fLvl, field]);
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
    return getSelectOpts(field)
        .then(finishSelectBuild);

    function finishSelectBuild(opts) {                              /*dbug-log*///console.log('[%s] opts = %O', field, opts);
        const fieldId = 'sel-' + (cnt ? field + cnt : field);
        const attr = { id: fieldId , class: 'med-field'};
        _state('addComboToFormState', [fLvl, field]);
        return _u('buildSelectElem', [opts, attr]);
    }
}
/* ---------------------- MULTI-SELECT/COMBOS ------------------------------- */
/**
 * Creates a select dropdown field wrapped in a div container that will
 * be reaplced inline upon selection. Either with an existing Author's name,
 * or the Author create form when the user enters a new Author's name.
 */
function buildMultiSelect(entity, field, fLvl) {                    /*dbug-log*///console.log("buildMultiSelect [%s][%s]", entity, field);
    const cntnr = _u('buildElem', ['div', { id: 'sel-cntnr-' + field, class: 'sel-cntnr' }]);
    return buildMultiSelectElem(entity, field, fLvl, 1)
        .then(returnFinishedMultiSelectFields);

    function returnFinishedMultiSelectFields(fields) {
        $(cntnr).data('inputType', 'multiSelect').data('cnt', 1);
        $(cntnr).append(fields);
        return cntnr;
    }
}
/* --- used externally */
export function buildMultiSelectElem(entity, field, fLvl, cnt) {
    return buildSelect(entity, field, fLvl, cnt)
        .then(returnFinishedMultiSelectField);

    function returnFinishedMultiSelectField(input) {
        const wrapper = _u('buildElem', ['div', {class: 'flex-row'}]);
        const lbl = buildMultiSelectLbl(cnt)
        $(input).change(storeMultiSelectValue.bind(null, fLvl, cnt, field));
        $(wrapper).append([lbl, input]);
        return wrapper;
    }
}
function buildMultiSelectLbl(cnt) {
    const attr = {text: getCntLabel(cnt), class:'multi-span'};
    const lbl = _u('buildElem', ['span', attr]);
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
/* ====================== OPTIONS BUILDERS ================================== */
/** Returns and array of options for the passed field type. */
function getSelectOpts(field) {                                     /*dbug-log*///console.log("getSelectOpts. for [%s]", field);
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
        'Group': [ getGroupOpts, null ],
        'HabitatType': [ getStoredOpts, 'habTypeNames'],
        // 'InteractionTags': [ getTagOpts, 'interaction' ],
        // 'InteractionType': [ getSelectStoredOpts, 'intTypeNames' ],
        'Location': [ getLocationOpts, null ],
        'Order': [ getTaxonOpts, 'Order' ],
        'Object': [() => []],
        'Publication': [ getSrcOpts, 'pubSrcs'],
        'PublicationType': [ getStoredOpts, 'pubTypeNames'],
        'Publisher': [ getSrcOpts, 'publSrcs'],
        'Sub-Group': [ getSubGroupOpts, null ],
        'Species': [ getTaxonOpts, 'Species' ],
        'Subject': [() => []]
        // "Tags": [ getTagOpts, 'source' ],
    };
    if (!optMap[field]) { return Promise.resolve([]); }
    const getOpts = optMap[field][0];
    const fieldKey = optMap[field][1];
    return Promise.resolve(getOpts(fieldKey, field));
}
function getStoredOpts(prop, field) {
    return _u('getOptsFromStoredData', [prop]);
}
export function getSelectStoredOpts(prop, field, include) {
    return _u('getOptsFromStoredData', [prop])
        .then(opts => opts.filter(o => include.indexOf(o.text) !== -1));
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
/* -------------------------- SOURCE -------------------------------------- */
// NOTE: DON'T DELETE. USEFUL ONCE TAGS ARE USED FOR MORE THAN JUST INTERACTIONS.
// /** Returns an array of options objects for tags of the passed entity. */
// function getTagOpts(entity) {
//     return _u('getOptsFromStoredData', [entity+"Tags"]);
// }
/** Returns an array of source-type (prop) options objects. */
function getSrcOpts(prop, field, rcrds) {
    return _u('getData', [prop]).then(buildSrcOpts);

    function buildSrcOpts(ids) {
        const srcs = rcrds || _state('getEntityRcrds', ['source']);
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
function getCitTypeOpts(prop, field) {
    const fLvl = getSubFormLvl('sub');
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
        const pubRcrd = _state('getFormProp', [fLvl, 'rcrds']).pub;
        return opts[pubRcrd.publicationType.displayName];
    }
} /* End getCitTypeOpts */
/* -------------------------- TAXON ----------------------------------------- */
/** Returns an array of taxonyms for the passed rank and the form's taxon group. */
export function getTaxonOpts(rank, field, r, g) {
    const group = r ? r : _state('getTaxonProp', ['groupName']);
    const subGroup = g ? g : _state('getTaxonProp', ['subGroup']);  /*dbug-log*///console.log('getTaxonOpts [%s][%s][%s]Names', group, subGroup, rank)
    return _u('getOptsFromStoredData', [group+subGroup+rank+'Names'])
        .then(buildTaxonOpts);

        function buildTaxonOpts(opts) {
            opts.unshift({ value: 'create', text: 'Add a new '+rank+'...'});
            return opts;
        }
}
function getGroupOpts(prop, field) {
    const groups = _state('getTaxonProp', ['groups']);
    const opts = Object.keys(groups).map(getGroupOpt).filter(o => o);
    return _u('alphabetizeOpts', [opts]);

    function getGroupOpt(name) {
        if (name === 'Bat') { return null; }
        return { value: groups[name], text: name };
    }
}
function getSubGroupOpts(prop, field) {
    const group = _state('getTaxonProp', ['groupName']);
    return _u('getOptsFromStoredData', [group+'SubGroupNames']);
}
/* -------------------------- LOCATION -------------------------------------- */
/** Returns options for each country and region. */
function getCntryRegOpts(prop, field) {
    const proms = ['countryNames', 'regionNames'].map(k => _u('getOptsFromStoredData', [k]));
    return Promise.all(proms).then(data => data[0].concat(data[1]));
}
/** Returns an array of option objects with all unique locations.  */
export function getLocationOpts(prop, field) {
    const rcrds = _state('getEntityRcrds', ['location']);
    let opts = Object.keys(rcrds).map(buildLocOpt);
    opts = _u('alphabetizeOpts', [opts]);
    opts.unshift({ value: 'create', text: 'Add a new Location...'});
    return opts;

    function buildLocOpt(id) {
        return { value: id, text: rcrds[id].displayName };
    }
}