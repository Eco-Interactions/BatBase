/**
 * Handles building Options objects for comboboxes throughout the site.
 *
 * Export
 *
 * TOC
 *    GET OPTIONS
 *        GROUP OPTIONS
 *        SIMPLE OPTIONS
 *    BUILD OPTIONS
 *        STORED DATA
 *        FIELD DATA
 *        BASIC ENTITY-OPTIONS
 *        SOURCE
 *        TAXON
 *        LOCATION
 *    HELPERS
 */
import { _db, _u } from '~util';
import { _state, getSubFormLvl } from '~form';
/* =========================== GET OPTIONS ================================== */
/**
 * Builds options out of the entity-name  object. Name (k) ID (v). If an option
 * group is passed, an additional 'group' key is added that will serve as a category
 * for the options in the group.
 */
function getOptions(entityObj, sortedKeys) {                        /*dbug-log*///console.log('getOptions = %O, order = %O', entityObj, sortedKeys);
    if (!Object.keys(entityObj).length) { return []; }
    return Object.values(entityObj)[0].group ?
        getOptGroups(entityObj, sortedKeys) : getSimpleOpts(entityObj, sortedKeys);
}
function getEntityOpt(name, id) {                                   /*dbug-log*///console.log('getEntityOpt [%s][%s]', name, id);
    return { text: _u('ucfirst', [name]), value: id};
}
/** --------------------- GROUP OPTIONS ------------------------------------- */
function getOptGroups(entityObj, sortedKeys) {
    return Object.keys(entityObj).map(getGroupOpt);

    function getGroupOpt(gName) {
        const opt = entityObj[gName];
        opt.text = gName;                                           /*dbug-log*///console.log('getOptGroup [%s] %O', gName, gSorted[gName]);
        return opt;
    }
}
function sortEntityDataByGroup(data, keys) {
    const sorted = {};
    keys.forEach(k => sortEntity(k, data[k]));
    return sorted;

    function sortEntity(name, oData) {
        if (!sorted[oData.group]) { sorted[oData.group] = []; }
        sorted[oData.group].push(getEntityOpt(name, oData.value));
    }
}
/** --------------------- SIMPLE OPTIONS ------------------------------------ */
function getSimpleOpts(entityObj, sortedKeys) {
    return sortedKeys.map(name => getEntityOpt(name, entityObj[name]));
}
/* ========================== BUILD OPTIONS ================================= */
/** --------------------- STORED DATA --------------------------------------- */
/** Builds options out of a stored entity-name object. */
export function getOptsFromStoredData(prop) {
    return _db('getData', [prop, true]).then(data => {              /*dbug-log*///console.log('getOptsFromStoredData [%s] = %O', prop, data);
        if (!data) { console.log('NO STORED DATA for [%s]', prop);return []; }
        return getOptions(data, Object.keys(data).sort());
    });
}
function getStoredOpts(fName, prop) {
    return getOptsFromStoredData(prop);
}
export function getSelectStoredOpts(prop, include) {
    return getOptsFromStoredData(prop)
        .then(opts => opts.filter(o => include.indexOf(o.text) !== -1));
}
/** --------------------- FIELD DATA ---------------------------------------- */
/** Returns and array of options for the passed field type. */
export function getFieldOptions(fName) {                            /*dbug-log*///console.log("getSelectOpts. for [%s]", fName);
    const optMap = {
        'Author': [ getSrcOpts, 'authSrcs'],
        'CitationType': [ getCitTypeOpts, 'citTypeNames'],
        'Class': [ getTaxonOpts, 'Class' ],
        'Country': [ getStoredOpts, 'countryNames' ],
        'Country-Region': [ getCntryRegOpts, null ],
        'CitationTitle': [() => []],
        'Editor': [ getSrcOpts, 'authSrcs'],
        'Family': [ getTaxonOpts, 'Family' ],
        'Genus': [ getTaxonOpts, 'Genus' ],
        'Group': [ getStoredOpts, 'groupNames' ],
        'HabitatType': [ getStoredOpts, 'habTypeNames'],
        'Location': [ getRcrdOpts, null ],
        'Order': [ getTaxonOpts, 'Order' ],
        'Object': [() => []],
        'Publication': [ getSrcOpts, 'pubSrcs'],
        'PublicationType': [ getStoredOpts, 'pubTypeNames'],
        'Publisher': [ getSrcOpts, 'publSrcs'],
        'Region': [ getStoredOpts, 'regionNames' ],
        'Sub-Group': [ getSubGroupOpts, null ],
        'Species': [ getTaxonOpts, 'Species' ],
        'Subject': [() => []]
    };
    if (!optMap[fName]) { return Promise.resolve([]); }
    const getOpts = optMap[fName][0];
    const fieldKey = optMap[fName][1];
    return Promise.resolve(getOpts(fName, fieldKey));
}
/* ----------------------- BASIC ENTITY-OPTIONS ----------------------------- */
/**
 * Builds options out of the passed ids and their entity records.
 * @param  {Object}     data [description]
 * @param  {Number[]}  [data.ids]    [description]
 * @param  {Object}    [data.rcrds] [description]
 * @return {[type]}     [description]
 */
export function getRcrdOpts(entity, ids = false, rcrds = false) {   /*dbug-log*///console.log('getRcrdOpts [%s] ids %O, rcrds %O', entity, ids, rcrds);
    rcrds = rcrds ? rcrds : _state('getEntityRcrds', [_u('lcfirst', [entity])]);
    ids = ids ? ids : Object.keys(rcrds);
    const opts = [ { text: `Add a new ${_u('ucfirst', [entity])}...`, value: 'create'} ];
    opts.push(...alphabetizeOpts(buildEntityOptions(ids, rcrds)));
    return opts;
}
function buildEntityOptions(ids, rcrds) {
    return ids.map(id => {
        const text = getEntityDisplayName(rcrds[id]);
        return { text: text, value: id };
    });
}
function getEntityDisplayName(entity) {
    // Removes text used to distinguish the names of citations of full publications in the database.
    return entity.displayName.includes('(citation)') ?
        entity.displayName.split('(citation)')[0] : entity.displayName;
}
/* -------------------------- SOURCE ---------------------------------------- */
// NOTE: DON'T DELETE. USEFUL ONCE TAGS ARE USED FOR MORE THAN JUST INTERACTIONS.
// /** Returns an array of options objects for tags of the passed entity. */
// function getTagOpts(entity) {
//     return _u('getOptsFromStoredData', [entity+"Tags"]);
// }
/** Returns an array of source-type (prop) options objects. */
function getSrcOpts(fName, prop, rcrds) {
    return _db('getData', [prop]).then(callSrcOptsBuildHandler);

    function callSrcOptsBuildHandler(ids) {
        return buildSrcOpts(getFieldName(), ids, rcrds);
    }
    function getFieldName() {
        return {
            'authSrcs': fName ? fName.slice(0, -1) : 'Author',
            'pubSrcs': 'Publication',
            'publSrcs': 'Publisher',
        }[prop];
    }
}
export function buildSrcOpts(srcType, ids, rcrds) {                 /*dbug-log*///console.log('   --buildSrcTypeOpts[%s] ids? %O, rcrds? %O', srcType, ids, rcrds);
    const opts = [ { text: `Add a new ${_u('ucfirst', [srcType])}...`, value: 'create'} ];
    if (!ids.length) { return opts; }
    opts.push(...getRcrdOpts('source', ids, rcrds));
    return opts;
}
/** Return the citation type options available for the parent-publication's type. */
function getCitTypeOpts(fName, prop) {                              /*dbug-log*///console.log('   --getCitTypeOpts[%s] fName[%s] prop[%s]', fName, prop);
    const fLvl = getSubFormLvl('sub');
    return _db('getData', [prop]).then(buildCitTypeOpts);

    function buildCitTypeOpts(types) {                              /*dbug-log*///console.log('   --buildCitTypeOpts[%O]', types);
        return getOptions(types, getCitTypeNames().sort());
    }
    function getCitTypeNames() {
        const opts = {
            Book: ['Book', 'Chapter'],
            Journal: ['Article'],
            Other: ['Museum record', 'Other', 'Report'],
            'Thesis/Dissertation': ["Master's Thesis", 'Ph.D. Dissertation']
        };
        const data = _state('getFieldState', [fLvl, 'ParentSource', 'misc']);
        return opts[data.pubType.displayName];
    }
}
/* -------------------------- TAXON ----------------------------------------- */
/** Returns an array of taxonyms for the passed rank and the form's taxon group. */
export function getTaxonOpts(fName, rank, r, g) {
    const group = r ? r : getGroupName();
    const subGroup = g ? g : getSubGroupName();                     /*dbug-log*///console.log('        getTaxonOpts [%s][%s][%s]Names', group, subGroup, rank)
    const opts = [ { text: `Add a new ${rank}...`, value: 'create'} ];
    return getStoredOpts(null, group+subGroup+rank+'Names')
        .then(o => {
            opts.push(...alphabetizeOpts(o));
            return opts;
        });
}
function getSubGroupOpts(fName, prop) {
    return getStoredOpts(null, getGroupName()+'SubGroupNames');
}
function getGroupName() {
    return _state('getFieldState', ['sub', 'Group', 'misc']).rcrd.displayName;
}
function getSubGroupName() {
    return _state('getFieldState', ['sub', 'Sub-Group', 'misc']).taxon.name;
}
/* -------------------------- LOCATION -------------------------------------- */
/** Returns options for each country and region. */
function getCntryRegOpts(fName, prop) {
    const proms = ['Country', 'Region'].map(getFieldOptions);
    return Promise.all(proms).then(data => data[0].concat(data[1]));
}
/** ==================== HELPERS ============================================ */
export function alphabetizeOpts(opts) {
    return opts.sort(alphaOptionObjs)
}
function alphaOptionObjs(a, b) {
    const x = a.text.toLowerCase();
    const y = b.text.toLowerCase();
    return x<y ? -1 : x>y ? 1 : 0;
}