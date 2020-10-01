/**
 * Handles building and managing the form comboboxes.
 *
 * EXPORTS:
 *     buildMultiSelect
 *     buildMultiSelectElem
 *     buildSelect
 *     buildTagField
 *     clearCombobox
 *     enableCombobox
 *     enableComboboxes
 *     enableFirstCombobox
 *     focusCombobox
 *     focusFirstCombobox
 *     getLocationOpts
 *     getRcrdOpts
 *     getSelectStoredOpts
 *     getSelVal
 *     getSelTxt
 *     getSrcOpts
 *     getTaxonOpts
 *     initSingle
 *     initFormCombos
 *     resetFormCombobox
 *     setSelVal
 *     updateComboboxOptions
 *
 * TOC
 *    COMBOBOX HELPERS
 *        INIT
 *        (EN/DIS)ABLE COMBOBOXES
 *        FOCUS COMBOBOX
 *        GETTERS & (RE)SETTERS
 *    COMBOBOX BUILDERS
 *        TAGS COMBOBOX
 *        SINGLE SELECT/COMBOS
 *        MULTI-SELECT/COMBOS
 *    OPTIONS BUILDERS
 *        SOURCE
 *        TAXON
 *        LOCATION
 */
import { _u } from '../../../../db-main.js';
import { _state, _val, getSubFormLvl } from '../../../forms-main.js';

/* ====================== COMBOBOX HELPERS ================================== */
/* -------------------------- INIT ------------------------------------------ */
/**
 * Inits the combobox, using 'selectize', according to the passed config.
 * Note: The 'selectize' library turns select dropdowns into input comboboxes
 * that allow users to search by typing and, when configured, add new options
 * not in the list by triggering a sub-form for that entity.
 */
export function initSingle(confg, fLvl) {                                       //console.log("initSingle. CONFG = %O. fLvl = ", confg, fLvl)
    const options = {
        create: confg.add,
        onChange: confg.change,
        placeholder: 'Select ' + confg.name
    };
    if (confg.options) { addAdditionalOptions(); }
    $(confg.id).selectize(options);
    /** All non-standard options are added to this 'options' prop. */
    function addAdditionalOptions() {
        for (let opt in confg.options) {
            options[opt] = confg.options[opt];
        }
    }
}
/**
 * Inits 'selectize' for each select elem in the form's 'selElems' array
 * according to the 'selMap' config. Empties array after intializing.
 */
export function initFormCombos(entity, fLvl, comboEvents) {                     //console.log("initFormCombos. [%s] formLvl = [%s], events = %O", entity, fLvl, comboEvents);
    const elems = _state('getFormProp', [fLvl, 'selElems']);
    elems.forEach(selectizeElem);
    _state('setFormProp', [fLvl, 'selElems', []]);

    function selectizeElem(fieldName) {                                         //console.log("Initializing --%s-- select", field);
        const confg = getFieldConfg(comboEvents, fieldName);
        confg.id = confg.id || '#'+fieldName+'-sel';
        // $(confg.id).off('change');
        initSingle(confg, fLvl);
    }
}
function getFieldConfg(comboEvents, fieldName) {
    const baseConfg = getBaseFieldConfg(fieldName) ;                            //console.log('baseConfg = %O, eventConfg = %O', baseConfg, comboEvents);
    const eventConfg = comboEvents[fieldName] || {};
    return Object.assign(baseConfg, eventConfg);
}
function getBaseFieldConfg(fieldName) {
    const confgName = fieldName.replace(/([A-Z])/g, ' $1');
    const confgs = {
        'Authors': { name: 'Authors', id: '#Authors-sel1' },
        'Editors': { name: 'Editors', id: '#Editors-sel1' },
        'InteractionTags': { name: 'Interaction Tags',
            options: { delimiter: ",", maxItems: null }},
    };
    return confgs[fieldName] || { name: confgName };
}
/* ----------------- (EN/DIS)ABLE COMBOBOXES -------------------------------- */
export function enableCombobox(selId, enable = true) {                          //*console.log('enableCombobox [%s] ? ', selId, enable);
    if (enable === false) { return $(selId)[0].selectize.disable(); }
    $(selId)[0].selectize.enable();
}
export function enableComboboxes($pElems, enable) {
    $pElems.each((i, elem) => { enableCombobox('#'+elem.id, enable)});
}
export function enableFirstCombobox(cntnrId, enable = true) {
    const selElems = $(cntnrId+' .selectized').toArray();                       //console.log("[%s] first elem = %O", cntnrId, selElems[0]);
    const firstElem = $('#'+ selElems[0].id)[0].selectize;
    return enable ? firstElem.enable() : firstElem.disable();
}
/* ------------------------- FOCUS COMBOBOX --------------------------------- */
export function focusCombobox(selId, focus) {
    if (!focus) { return $(selId)[0].selectize.blur(); }
    $(selId)[0].selectize.focus();
}
export function focusFirstCombobox(cntnrId, focus) {
    const selElems = $(cntnrId+' .selectized').toArray();                       //console.log("[%s] first elem = %O", cntnrId, selElems[0]);
    focusCombobox('#'+ selElems[0].id, focus);
}
export function clearCombobox(selId) {                                          //console.log("clearCombobox [%s]", selId);
    const selApi = $(selId)[0].selectize;
    selApi.clear('silent');
    selApi.updatePlaceholder();
    selApi.removeOption('');
}
/* --------------------- GETTERS & (RE)SETTERS ------------------------------ */
export function getSelVal(id) {                                                 //console.log('getSelVal [%s]', id);
    return $(id)[0].selectize.getValue();
}
export function getSelTxt(id) {                                                 //console.log('getSelTxt. id = ', id);
    return $(id)[0].innerText;
}
export function setSelVal(id, val, silent) {                                    //console.log('setSelVal [%s] = [%s]. silent ? ', id, val, silent);
    const $selApi = $(id)[0].selectize;
    if ($(id)[0].multiple) {
        $selApi.setValue(val, silent);
    } else {
        $selApi.addItem(val, silent);
    }
}
/**
 * Clears and enables the parent combobox for the exited form. Removes any
 * placeholder options and, optionally, brings it into focus.
 */
export function resetFormCombobox(fLvl, focus) {
    const selId = _state('getFormParentId', [fLvl]);
    if (!selId) { return; }
    const combobox = $(selId)[0].selectize;
    combobox.clear('silent');
    combobox.enable();
    combobox.removeOption(''); //Removes the "Creating [entity]..." placeholder.
    if (focus) { combobox.focus();
    } else if (focus === false) { combobox.blur(); }
}
/** Clears previous options and adds the new ones. Optionally focuses the combobox. */
export function updateComboboxOptions(selId, opts, focus) {
    const selApi = $(selId)[0].selectize;
    selApi.clear('silent');
    selApi.clearOptions();
    selApi.addOption(opts);
    selApi.refreshOptions(false);
    if (focus === true) {  }
}
/* ====================== COMBOBOX BUILDERS ================================= */
/* ---------------------- TAGS COMBOBOX ------------------------------------- */
/**
 * Creates and returns a select dropdown that will be initialized with 'selectize'
 * to allow multiple selections. A data property is added for use form submission.
 */
export function buildTagField(entity, field, fLvl) {
    const attr = { id: field + '-sel', class: 'med-field'};
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
export function buildSelect(entity, field, fLvl, cnt) {                         //console.log("buildSelect [%s] field [%s], fLvl [%s], cnt [%s]", entity, field, fLvl, cnt);
    return getSelectOpts(field)
        .then(finishSelectBuild);

    function finishSelectBuild(opts) {                                          //console.log('[%s] opts = %O', field, opts);
        const fieldId = cnt ? field + '-sel' + cnt : field + '-sel';
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
export function buildMultiSelect(entity, field, fLvl) {                           //console.log("entity = %s. field = ", entity, field);
    const cntnr = _u('buildElem', ['div', { id: field+'-sel-cntnr'}]);
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
function storeMultiSelectValue(fLvl, cnt, field, e) {                           //console.log('storeMultiSelectValue. lvl = %s, cnt = %s, field = %s, e = %O', fLvl, cnt, field, e);
    const valueObj = _state('getFormFieldData', [fLvl, field]).val;             //console.log('fieldObj = %O', fieldObj);
    valueObj[cnt] = e.target.value || null;
    _state('setFormFieldData', [fLvl, field, valueObj, 'multiSelect']);
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
     _val('reportFormFieldErr', [field, errTags[field], fLvl]);
}
function ifPreviousErrClearIt(field, fLvl) {
    if (!$('#'+field+'_errs.'+fLvl+'-active-errs')) { return; }
    _val('clrContribFieldErr', [field, fLvl]);
}
/* ====================== OPTIONS BUILDERS ================================== */
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
        'Group': [ getRealmGroupOpts, null ],
        'HabitatType': [ getStoredOpts, 'habTypeNames'],
        // 'InteractionTags': [ getTagOpts, 'interaction' ],
        // 'InteractionType': [ getSelectStoredOpts, 'intTypeNames' ],
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
export function getSrcOpts(prop, field, rcrds) {
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
/** Returns an array of taxonyms for the passed level and the form's realm. */
export function getTaxonOpts(level, field, r, g) {
    const realm = r ? r : _state('getTaxonProp', ['realmName']);
    const group = g ? g : _state('getTaxonProp', ['group']);
    return _u('getOptsFromStoredData', [realm+group+level+'Names'])
        .then(buildTaxonOpts);

        function buildTaxonOpts(opts) {
            opts.unshift({ value: 'create', text: 'Add a new '+level+'...'});
            return opts;
        }
}
function getRealmOpts(prop, field) {
    const realms = _state('getTaxonProp', ['realms']);
    const opts = Object.keys(realms).map(getRealmOpt).filter(o => o);
    return opts.sort((a, b) => _u('alphaOptionObjs', [a, b]));

    function getRealmOpt(name) {
        if (name === 'Bat') { return null; }
        return { value: realms[name], text: name };
    }
}
function getRealmGroupOpts(prop, field) {
    const realm = _state('getTaxonProp', ['realmName']);
    return _u('getOptsFromStoredData', [realm+'GroupNames']);
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
    opts = opts.sort((a, b) => _u('alphaOptionObjs', [a, b]));
    opts.unshift({ value: 'create', text: 'Add a new Location...'});
    return opts;

    function buildLocOpt(id) {
        return { value: id, text: rcrds[id].displayName };
    }
}