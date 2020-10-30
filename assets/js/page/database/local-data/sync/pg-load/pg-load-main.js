/**
 * On page load, all server-data updated since the last local-data update is downloaded.
 *
 * Exports
 *     syncLocalDbWithServer
 *
 * TOC
 *     CHECK FOR ENTITY UPDATES
 *     ADD UPDATED SERVER DATA TO LOCAL DB
 *     ON SYNC COMPLETE
 */
import { _u, initSearchStateAndTable } from '~db';
import * as db from '../../local-data-main.js';
import { reportDataSyncFailures } from '../db-sync-main.js';
import { downloadAndStoreUpdatedData } from './sync-updated-data.js';
import { validateAndUpdateUserData } from './user-data-sync.js';

export function syncLocalDbWithServer(lclUpdtdAt) {                 /*perm-log*/_u('logInDevEnv', ["   /--syncLocalDbWithServer. lclUpdtdAt = %O", lclUpdtdAt]);
    db.fetchServerData('data-state').then(checkAgainstLocalDataState);
    db.getData('user').then(validateAndUpdateUserData);
/* ------------------- CHECK FOR ENTITY UPDATES ----------------------------- */
    function checkAgainstLocalDataState(srvrUpdtdAt) {              /*dbug-log*///console.log('checkAgainstLocalDataState. srvrUpdtdAt = %O, lcl = %O', srvrUpdtdAt, lclUpdtdAt);
        if (ifTestEnvDbNeedsReset(srvrUpdtdAt.state.System)) { return db.resetStoredData(); }
        const entities = checkEachEntityForUpdates(srvrUpdtdAt.state);
        return entities.length ? syncDb(entities, srvrUpdtdAt.state) : initSearchPage();
    }
    function checkEachEntityForUpdates(srvrUpdtdAt) {               /*dbug-log*///console.log('checkEachEntityForUpdates. srvrUpdtdAt = %O, lcl = %O', srvrUpdtdAt, lclUpdtdAt);
        return Object.keys(srvrUpdtdAt).map(entity => {             /*dbug-log*///console.log('   --[%s] updates ? ', entity, entityHasUpdates(srvrUpdtdAt[entity], lclUpdtdAt[entity]));
            if (entity === 'System') { return false; }
            return entityHasUpdates(srvrUpdtdAt[entity], lclUpdtdAt[entity]) ?
                { name: entity, updated: lclUpdtdAt[entity] } : false;
        }).filter(e => e);
    }
}
/** Db is reset unless testing suite did not reload database. */
function ifTestEnvDbNeedsReset(systemUpdateAt) {
    return systemUpdateAt == "2020-05-20 11:11:11";
}
/**
 * Returns true if the first datetime is more recent than the second.
 * Note: for cross-browser date comparisson, dashes must be replaced with slashes.
 */
function entityHasUpdates(timeOne, timeTwo) {
    const time1 = timeOne.replace(/-/g,'/');
    const time2 = timeTwo.replace(/-/g,'/');                        /*dbug-log*///console.log("firstTimeMoreRecent? ", Date.parse(time1) > Date.parse(time2))
    return Date.parse(time1) > Date.parse(time2);
}
/* -------------- ADD UPDATED SERVER DATA TO LOCAL DB ----------------------- */
function syncDb(entities, dataUpdatedAt) {
    db.getAllStoredData().then(data => db.setMmryDataObj(data))
    .then(() => downloadAndStoreUpdatedData(entities))
    // .then(() => db.setData('lclDataUpdtdAt', dataUpdatedAt))
    .then(initSearchPage)
    .then(db.clearTempMemory);
}
/* --------------------- ON SYNC COMPLETE ----------------------------------- */
function initSearchPage() {
    reportDataSyncFailures();
    db.getData('curFocus', true).then(f => initSearchStateAndTable(f));
}