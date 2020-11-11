/**
 * The first time a browser visits the search page all entity data is downloaded
 * from the server and stored locally using IndexedIdb.
 *
 * Entities downloaded with each ajax call:
 *   /geojson - GeoJson
 *   /interaction - Interaction, InteractionType, Tag *
 *   /lists - UserNamed
 *   /location - HabitatType, Location, LocationType
 *   /source - Author, Citation, CitationType, Publication, PublicationType,
 *       Source, SourceType
 *   /taxon - Taxon, Group, Rank
 *
 * Export
 *     initLocalDatabase
 *
 * TOC
 *     INIT FULL DATABASE
 *         INIT BASE TABLE
 *         DOWNLOAD REMAINING TABLE DATA
 *         DOWNLOAD REMAINING DATA
 *     STORE NEW USER-DATA
 */
import { initSearchStateAndTable, _ui } from '~db';
import * as db from '../local-data-main.js';
import { modifyTxnDataForLocalDb } from './entity/init-txn-data.js';
import { modifyLocDataForLocalDb } from './entity/init-loc-data.js';
import { modifySrcDataForLocalDb } from './entity/init-src-data.js';
import { modifyIntDataForLocalDb } from './entity/init-int-data.js';
import { modifyUsrDataForLocalDb } from './entity/init-usr-data.js';
/* ====================== INIT FULL DATABASE ================================ */
export function initLocalDatabase(reset) {                          /*Perm-log*/console.log("   *--initLocalDatabase");
    return db.fetchServerData('data-state')
        .then(data => db.setDataInMemory('lclDataUpdtdAt', data.state))
        .then(() => initTaxonDataAndLoadTable(reset))
        .then(downloadRemainingTableData)
        .then(downloadRemainingDataAndFullyEnableDb)
        .then(db.clearTempMemory);
}
/* ---------------- INIT BASE TABLE ----------------------------------------- */
function initTaxonDataAndLoadTable(reset) {
    return getAndSetData('taxon')
        .then(() => db.setUpdatedDataInLocalDb())
        .then(() => initSearchStateAndTable('taxa', false));
}
/* -------------- DOWNLOAD REMAINING TABLE DATA ----------------------------- */
function downloadRemainingTableData() {
    return getAndSetData('source')
        .then(() => getAndSetData('location'))
        .then(() => getAndSetData('interaction'))
        .then(() => db.setUpdatedDataInLocalDb())
        .then(() => initSearchStateAndTable());
}
/* --------------- DOWNLOAD REMAINING DATA ---------------------------------- */
function downloadRemainingDataAndFullyEnableDb() {
    return getAndSetData('geoJson')
        .then(() => getAndSetData('lists'))
        .then(() => db.setUpdatedDataInLocalDb())
        .then(() => _ui('onDataDownloadCompleteEnableUiFeatures'));
}
/* -------------------------- HELPERS --------------------------------------- */
function getAndSetData(url) {
    return db.fetchServerData(url)
        .then(data => setData(url, data))
}
function setData(url, data) {                                       /*Perm-log*/console.log('           *-storing [%s] data = %O', url, data);
    const setDataFunc = {
        'geoJson': Function.prototype,
        'interaction': modifyIntDataForLocalDb,
        'lists': modifyUsrDataForLocalDb,
        'location': modifyLocDataForLocalDb,
        'source': modifySrcDataForLocalDb,
        'taxon': modifyTxnDataForLocalDb,
    };
    return storeServerData(data)
        .then(() => setDataFunc[url](data));
}
/**
 * Loops through the data object returned from the server, parsing and storing
 * the entity data.
 */
function storeServerData(data) {                                    /*dbug-log*///console.log("storeServerData = %O", data);
    const ents = Object.keys(data);
    return ents.reduce((p, entity) => {                             /*dbug-log*///console.log("     entity = %s, data = %O", entity, data[entity]);
        return p.then(p => db.setDataInMemory(entity, db.parseData(data[entity])));
    }, Promise.resolve());
}
/* ===================== STORE NEW USER-DATA ================================ */
export function storeUserData(data) {
    modifyUsrDataForLocalDb(data)
}