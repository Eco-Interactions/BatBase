/**
 * Returns an object with (k) the form field and (v) value.
 * TODO: DOCUMENT
 *
 * Export
 *     getValidatedFormData
 *
 * TOC
 *     SERVER-DATA OBJ
 *         INIT
 *         RETURN
 *     WRANGLE DATA
 *         WRANGLE FIELD
 *         GET DATA
 *         SET DATA
 *             GENERAL
 *             SPECIFIC
 *             ENTITY
 *                 LOCATION/GEOJSON
 *                 AUTHOR
 *     TRACK FAILURES
 */
import { _alert, _cmbx, _db, _u } from '~util';
import { _state } from '~form';
// import * as eData from './entity-data.js';
/**
 * [ld description]
 * @type {Object}
 */
let ld = {
    data: {}
};
export default function getValidatedFormData(confg) {
    if (confg.editing) { ld.data.ids = confg.editing; }
    ld.confg = confg;
    initServerDataObj(confg);                                       /*temp-log*/console.log('+--getValidatedFormData. name[%s] ld[%O]', confg.name, ld);
    return Promise.all(wrangleFormData())
        .then(alertIfFailures)
        .then(returnServerData);
}
/* =================== SERVER-DATA OBJ ====================================== */
/** [buildServerDataObj description] */
function initServerDataObj(c) {                                     /*dbug-log*/console.log('   --initServerDataObj c[%O]', c);
    const entity = c.core ? c.core : c.name;
    initEntityDataObj('core', entity);
    if (!c.core) { return; }
    initDetailDataObj(c.name);
}
/* ------------------------- INIT ------------------------------------------- */
function initEntityDataObj(dKey, name) {
    if (ld.data[dKey]) { return; }
    ld.data[dKey] = { flat: {}, rel:{} };
    ld.data[dKey+'Entity'] = _u('lcfirst', [name]);
}
function initDetailDataObj(name) {
    const entity = name ? name : 'GeoJson';
    initEntityDataObj('detail', entity);
}
/* ------------------------- RETURN ----------------------------------------- */
function returnServerData() {
    const sData = _u('snapshot', [ld.data]);
    ld = { data:{} };
    return sData;
}
/* ========================= WRANGLE DATA =================================== */
function wrangleFormData() {
    return Object.values(ld.confg.fields).map(wrangleField);
}
/* ------------------------- WRANGLE FIELD ---------------------------------- */
/** [wrangleField description] */
function wrangleField(fConfg) {                                     /*dbug-log*/console.log('       --wrangleField [%s][%O]', fConfg.name, fConfg);
    const fKey = fConfg.entity ? 'rel' : 'flat';
    if (!fConfg.active) { return; }  //Field not active. TODO: if field had data before edit began, set field "null" here
    if (fConfg.value === undefined) { return handleEmptyFieldData(fConfg); } //Field never set
    if (!getFieldValue(fConfg)) { handleEmptyFieldData(fConfg); }
    if (fConfg.prep) { return handleDataPreparation(fKey, fConfg);  }
    const prop = fKey === 'rel' ? fConfg.entity : fConfg.name;
    setServerData(fKey, prop, getFieldValue(fConfg));
}
function handleEmptyFieldData(fConfg) {
    if (!fConfg.required) { return; }
    trackFailure(fConfg.name, fConfg.value);
}
/**
 * [handleDataPreparation description]
 * @param  {[type]} fConfg
 * @return {[type]}         [description]
 */
function handleDataPreparation(fKey, fConfg) {                      /*dbug-log*/console.log('           --handleDataPreparation [%s][%O]', fKey, fConfg);
    Object.keys(fConfg.prep).forEach(handleDataPrep);

    function handleDataPrep(handler) {
        eval(handler)(fKey, fConfg, ...fConfg.prep[handler]);
    }
}
/* ----------------------- GET DATA ----------------------------------------- */
function getFieldValue(fConfg) {
    if (fConfg.type === 'multiSelect') { return !!Object.keys(fConfg.value).length; }
    if (!_u('isObj', [fConfg.value])) { return fConfg.value; }
    return fConfg.value.value; //combos
}
/* ----------------------- SET DATA ----------------------------------------- */
/**
 * [setServerData description]
 * @param {[type]} g [description]
 * @param {[type]} p [description]
 * @param {[type]} v [description]
 * @param {String} e [description]
 */
function setServerData(g, p, v, k = 'core') {
    if (!ld.data[k]) { initDetailDataObj(); }
    if (!v && ld.confg.action !== 'edit') { return; }               /*dbug-log*///console.log('           --setServerData [%s][%s][%s] = [%O]', k, g, p, v);
    ld.data[k][g][p] = v;
}
/* ___________________________________ GENERAL ______________________________ */
function setCoreData(g, fConfg) {                                   /*dbug-log*///console.log('               --setCoreData [%s] fConfg[%O]', g, fConfg);
    const val = getFieldValue(fConfg);
    setServerData(g, fConfg.name, val); //Value
}
function setDetailData(g, fConfg) {                                 /*dbug-log*///console.log('               --setDetailData [%s] fConfg[%O]', g, fConfg);
    const val = getFieldValue(fConfg);
    setServerData(g, fConfg.name, val, 'detail'); //Value
}
/* ___________________________________ SPECIFIC _____________________________ */
function renameField(g, fConfg, name, dKey = 'core') {              /*dbug-log*///console.log('               --renameField [%s]entity[%s] fConfg[%O]', name, dKey, g, fConfg);
    setServerData(g, name, getFieldValue(fConfg), dKey);
}
function setCoreType(g, fConfg) {                                   /*dbug-log*///console.log('               --setCoreType [%s] fConfg[%O]', g, fConfg);
    if (typeof fConfg.value !== 'string') { return trackFailure(fConfg.name, fConfg.value); }
    setServerData(g, fConfg.entity, fConfg.value);  //String type name
    // setServerData('flat', 'hasDetail', true);  //String type name
}
function setParent(g, fConfg, entity) {                             /*dbug-log*///console.log('               --setParent [%s]entity[%s] fConfg[%O]', g, entity, fConfg);
    const prop = 'Parent' + entity;
    const val = getFieldValue(fConfg);
    if (isNaN(val)) { return trackFailure(prop, val); }
    setServerData(g, prop, val); //Value
}
function setDetailEntity(g, fConfg) {                               /*dbug-log*///console.log('               --setDetailEntity [%s] fConfg[%O]', g, fConfg);
    const val = getFieldValue(fConfg);
    if (isNaN(val)) { return trackFailure(fConfg.name, val); }
    setServerData(g, fConfg.name, val, 'detail'); //Value
}
/**
 * [setCoreAndDetail description]
 * @param {[type]} g           [description]
 * @param {[type]} fConfg      [description]
 * @param {[type]} emptyString There are no additional params needed.
 */
function setCoreAndDetail(g, fConfg, emptyString) {
    ['core', 'detail'].forEach(e => setServerData(g, fConfg.name, fConfg.value, e));
}
/* ______________________________________ ENTITY ____________________________ */
    /* ----------------------- AUTHOR --------------------------------------- */
function handleAuthorNames(g, fConfg) {
    const names = getAuthNameValues(ld.confg.fields);
    setServerData('flat', 'DisplayName', buildAuthDisplayName(names));
    setServerData('flat', 'DisplayName', buildAuthDisplayName(names), 'detail');
    setServerData('flat', 'FullName', buildAuthFullName(names), 'detail');
}
function getAuthNameValues(fields) {                                /*dbug-log*///console.log('--getAuthNameValues fields[%O]', fields);
    const sufx = fields.Suffix.value;
    return {
        first: fields.FirstName.value,
        middle: fields.MiddleName.value,
        last: fields.LastName.value,
        suffix: sufx && sufx[sufx.length-1] !== '.' ? sufx+'.' : sufx
    };
}
function buildAuthDisplayName(names) {                              /*dbug-log*///console.log('--buildAuthDisplayName names[%O]', names);
    if (!names.first) { return names.last; }
    const name = [names.last+',', names.first, names.middle, names.suffix];
    return name.filter(n => n).join(' ');
}
function buildAuthFullName(names) {                                 /*dbug-log*///console.log('--buildAuthFullName names[%O]', names);
    return Object.values(names).filter(n => n).join(' ');
}
function setSuffix(g, fConfg) {
    const v = fConfg.value;
    const sufx = v && v[v.length-1] == '.' ? v.slice(0, -1) : v;
    setServerData('flat', 'Suffix', sufx, 'detail');
}
function setContributors(g, fConfg) {
    const data = Object.keys(fConfg.value).length ?
        getContribs(fConfg.value) : getContribs(ld.confg.fields.Editor.value, true);
    setServerData(g, 'Contributor', data);
}
function getContribs(vals, isEditor = false) {                      /*dbug-log*///console.log('           --getContributorData editors?[%s] vals[%O]', isEditor, vals);
    const data = {};
    Object.keys(vals).forEach(buildContributorData);
    return data;

    function buildContributorData(ord) {
        const contrib = {
            ord: ord,
            isEditor: isEditor
        };                                                          /*dbug-log*///console.log('               --buildContributorData [%O]', contrib);
        data[vals[ord]] = contrib;
    }
}
    /* ----------- CITATION ------------------------------------------------- */
function setCitationTitle(g, fConfg) {
    const title = fConfg.value;
    setServerData('flat', 'Title', title, 'detail');
    setServerData('flat', 'DisplayName', getUniqueCitationName(title), 'detail');
    setServerData('flat', 'DisplayName', getUniqueCitationName(title));
}
function getUniqueCitationName(citationTitle) {
    const pubTitle = ld.confg.fields.ParentSource.misc.pub.displayName;/*dbug-log*///console.log('--getUniqueCitationName citationTitle[%s] pubTitle[%s]', citationTitle, pubTitle)
    return pubTitle == citationTitle ? citationTitle + '(citation)' : citationTitle;
}
    /* ----------- LOCATION/GEOJSON ----------------------------------------- */
function setGeoJsonData(g, fConfg) {                                /*dbug-log*///console.log('               --setGeoJsonData [%s] fConfg[%O]', g, fConfg);
    const displayPoint = getDisplayCoordinates(fConfg.value, ld.confg.fields.Longitude.value);
    setServerData('flat', 'DisplayPoint', displayPoint, 'detail');
    setServerData('flat', 'Type', 'Point', 'detail');
    setServerData('flat', 'Coordinates', getCoordValue(displayPoint), 'detail');
}
function getDisplayCoordinates(lat, lng) {
    return JSON.stringify([ lng, lat ]);
}
function getCoordValue(displayPoint) {
    const geoJson = _state('getFormState', ['top', 'geoJson']);
    return geoJson ? geoJson.coordinates : displayPoint;

}
    /* ----------------------- TAXON ---------------------------------------- */
function buildTaxonDisplayName(g, fConfg) {
    const rank = _cmbx('getSelTxt', ['Rank']);
    const dName = rank === 'Species' ? fConfg.value : rank +' '+ fConfg.value;/*dbug-log*/console.log('--buildTaxonDisplayName rank[%s] name[%s]', rank, dName);
    setServerData('flat', 'DisplayName', dName);
}
/* =========================== TRACK FAILUTES =============================== */
function trackFailure(prop, value) {                                 /*dbug-log*///console.log('--trackFailure prop[%s] val[%O]', prop, value);
    if (!ld.data.fails) { ld.data.fails = {}; }
    ld.data.fails[prop] = value;
}
function alertIfFailures() {
    if (!ld.data.fails) { return; }                                 /*dbug-log*///console.log('--alertIfFailures [%O]', ld.data);
    _alert('alertIssue', ['dataPrepFail', JSON.stringify(ld.data.fails) ]);
}