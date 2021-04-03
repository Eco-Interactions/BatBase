/**
 * Returns an object with (k) the form field and (v) value.
 * TODO: DOCUMENT
 *
 * Export
 *     getValidatedFormData
 */
import { _alert, _cmbx, _db, _u } from '~util';
import { _state } from '~form';

let md = {};

export function getValidatedFormData(confg) {
    md.confg = confg;
    md.data = buildServerDataObj();                                 /*temp-log*/console.log('+--getValidatedFormData. [%s] [%O]', md.confg.name, md);
    return Promise.all(wrangleFormData())
        .then(alertIfFailures)
        .then(addEntityDataToFormData)
        .then(returnServerData);
}

function returnServerData() {
    const sData = JSON.parse(JSON.stringify(md.data));
    md = {};
    return sData;
}
function wrangleFormData() {
    return Object.values(md.confg.fields).map(getDataForServer);
}
/** [buildServerDataObj description] */
function buildServerDataObj() {                                     /*dbug-log*///console.log('   --buildServerDataObj');
    const serverData = {};
    setEntityObj('core');
    return md.confg.core ? addDetailData() : serverData;

    function setEntityObj(dKey) {
        serverData[dKey] = { flat: {}, rel:{} };
    }
    function addDetailData() {
        setEntityObj('detail');
        serverData.detailEntity = md.confg.core == 'Source' ? md.confg.name : 'GeoJson'
        return serverData;
     }
}
/**
 * [setServerData description]
 * @param {[type]} g [description]
 * @param {[type]} p [description]
 * @param {[type]} v [description]
 * @param {String} e [description]
 */
function setServerData(g, p, v, k = 'core') {
    if (!v && md.confg.action !== 'edit') { return; }               /*dbug-log*///console.log('           --setServerData [%s][%s][%s] = [%O]', k, g, p, v);
    md.data[k][g][p] = v;
}
/** [getDataForServer description] */
function getDataForServer(fConfg) {                                 /*dbug-log*///console.log('       --getDataForServer [%s][%O]', fConfg.name, fConfg);
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
function handleDataPreparation(fKey, fConfg) {                      /*dbug-log*///console.log('           --handleDataPreparation [%s][%O]', fKey, fConfg);
    Object.keys(fConfg.prep).forEach(handleDataPrep);

    function handleDataPrep(handler) {
        eval(handler)(fKey, fConfg, ...fConfg.prep[handler]);
    }
}
function getFieldValue(fConfg) {
    if (fConfg.type === 'multiSelect') { return returnMultiSelectValue(fConfg); }
    if (!_u('isObj', [fConfg.value])) { return fConfg.value; }
    return fConfg.value.value; //combos
}
function returnMultiSelectValue(fConfg) {                           /*dbug-log*///console.log('               --returnMultiSelectValue fConfg[%O]', fConfg);
    const map = {
        'Author': getContributorData,
        'Editor': getContributorData
    };
    return map[fConfg.name](fConfg);
}
/* =========================== DATA WRANGLERS =============================== */
/* ----------------------- GET DATA ----------------------------------------- */
function getContributorData(fConfg) {                               /*dbug-log*///console.log('           --getContributorData [%O]', fConfg);
    const data = {};
    Object.keys(fConfg.value).forEach(buildContributorData);
    return data;

    function buildContributorData(ord) {
        const contrib = {
            ord: ord,
            isEditor: fConfg.name === 'Editor'
        };
        data[fConfg.value[ord]] = contrib;

    }
}
/* ----------------------- SET DATA ----------------------------------------- */
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
    /* ----------- LOCATION/GEOJSON ----------------------------------------- */
function setGeoJsonData(g, fConfg) {                              /*dbug-log*///console.log('               --setGeoJsonData [%s] fConfg[%O]', g, fConfg);
    const displayPoint = buildDisplayCoordinates(fConfg.value, md.confg.fields.Longitude.value);
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
    /* ----------------------- AUTHOR --------------------------------------- */
function handleAuthorNames(argument) {
    // Build display name and full name
}
/* =========================== TRACK FAILUTES =============================== */
function trackFailure(prop, value) {                                 /*dbug-log*///console.log('--trackFailure prop[%s] val[%O]', prop, value);
    if (!md.data.fails) { md.data.fails = {}; }
    md.data.fails[prop] = value;
}
function alertIfFailures() {
    if (!md.data.fails) { return; }                                 /*dbug-log*///console.log('--alertIfFailures [%O]', md.data);
    _alert('alertIssue', ['dataPrepFail', JSON.stringify(md.data.fails) ]);
}
/* ========================= FINISH SERVER DATA ============================= */
function addEntityDataToFormData() {
    addEntityNames(md.confg.core);
    if (md.confg.group !== 'top') { return; }
    if (md.confg.editing) { md.data.ids = md.confg.editing; }

    function addEntityNames(core) {
        md.data.coreEntity = _u('lcfirst', [core ? core : md.confg.name]);
        if (core) { md.data.detailEntity =  _u('lcfirst', [md.confg.name]); }
    }
}