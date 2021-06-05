/**
 * Adds entity data to local storage.
 *
 * Exports
 *     addCoreEntityData
 *     addDetailEntityData
 *
 * TOC
 *     CORE ENTITY DATA
 *         MODIFY ENTITY RECORD
 *         UPDATE RELATED ENTITIES
 *     DETAIL-ENTITY DATA
 *     EXECUTE UPDATES
 */
import { _db, _u } from '~util';
import { updateData } from '../execute-update.js';
import * as a from './add-funcs.js';

/* ======================== CORE-ENTITY DATA ================================ */
/** Updates stored-data props related to a core-entity record with new data. */
export function addCoreEntityData(entity, rcrd) {                   /*dbug-log*///console.log("       --Updating Core entity. %s. %O", entity, rcrd);
    updateCoreData(entity, rcrd);
    updateCoreDataProps(entity, _db('getMmryData', [entity])[rcrd.id]);
}
/**
 * Updates the stored core-records array and the stored entityType array.
 * Note: Taxa are the only core entity without 'types'.
 */
function updateCoreData(entity, rcrd) {                             /*dbug-log*///console.log("           --Updating [%s] data = %O", entity, rcrd);
    a.addToRcrdProp(entity, rcrd);
    handleEntityLocalDataUpdates(entity, rcrd);
}
/* -------------------- MODIFY ENTITY RECORD -------------------------------- */
function handleEntityLocalDataUpdates(entity, rcrd) {
    const update = {
        'taxon': {
            'group': a.addGroupDataToRcrd
        },
        'interaction': {
            'objGroupId': a.addGroupIdToRcrd.bind(null, 'object'),
            'subjGroupId': a.addGroupIdToRcrd.bind(null, 'subject'),
        }
    };
    if (!update[entity]) { return; }
    updateDataProps(entity, rcrd, update[entity]);
}
/* -------------------- UPDATE RELATED ENTITIES ----------------------------- */
function updateCoreDataProps(entity, rcrd) {
    const updateFuncs = getRelDataHndlrs(entity, rcrd);             /*dbug-log*///console.log('updatedatahandlers = %O', updateFuncs);
    updateDataProps(entity, rcrd, updateFuncs)
}
/** Returns an object of relational data properties and their update methods. */
function getRelDataHndlrs(entity, rcrd) {
    const type = entity === "source" ? getSourceType(entity, rcrd) : false;/*dbug-log*///console.log("type = ", type);
    const update = {
        'interaction': {
            'location': a.addInteractionToEntity,
            'source': a.addInteractionToEntity,
            'subject': a.addInteractionRole,
            'object': a.addInteractionRole, // 'interactionType': addToTypeProp, 'tag': addToTagProp
        },
        'location': {
            'location': a.addToParentRcrd, //'habitatType': addToTypeProp, 'locationType': addToTypeProp
        },
        'source': {
            'author': {
                'authSrcs': a.addToRcrdAryProp
            },
            'citation': {
                'authors': a.addContribData,
                'source': a.addToParentRcrd, /* 'tag': addToTagProp */
            },
            'publication': {
                'pubSrcs': a.addToRcrdAryProp,
                'authors': a.addContribData,
                'source': a.addToParentRcrd,
                'editors': a.addContribData
            },
            'publisher': {
                'publSrcs': a.addToRcrdAryProp
            },

        },
        'taxon': {
            'taxon': a.addToParentRcrd,
            'taxonNames': a.addToTaxonNames
        },
    };
    return type ? update[entity][type] : update[entity];
}
/** Returns the records source-type. */
function getSourceType(entity, rcrd) {                              /*dbug-log*///console.log('getSourceType. [%s] = %O', entity, rcrd);
    const type = _u('lcfirst', [entity])+"Type";
    return _u('lcfirst', [rcrd[type].displayName]);
}
/* ======================== DETAIL-ENTITY DATA ============================== */
/** Updates stored-data props related to a detail-entity record with new data. */
export function addDetailEntityData(entity, rcrd) {                 /*dbug-log*///console.log("       --Updating Detail: [%s] %O", entity, rcrd);
    return updateDetailData(entity, rcrd)
}
function updateDetailData(entity, rcrd) {
    const update = {
        'author': {
            'author': a.addToRcrdProp
        },
        'citation': {
            'citation': a.addToRcrdProp //Not necessary to add to citation type object.
        },
        'geoJson': {
            'geoJson': a.addToRcrdProp
        },
        'publication': {
            'publication': a.addToRcrdProp, /*'publicationType': addToTypeProp*/
        },
        'publisher': {
            'publisher': a.addToRcrdProp
        },
    };
    return updateDataProps(entity, rcrd, update[entity]);
}
/* ======================== EXECUTE UPDATES ================================= */
/** Sends entity-record data to each storage property-type handler. */
function updateDataProps(entity, rcrd, updateFuncs) {               /*dbug-log*///console.log("           --updateDataProps [%s]. %O. updateFuncs = %O", entity, rcrd, updateFuncs);
    const params = { entity: entity, rcrd: rcrd, stage: 'addData' };
    if (!updateFuncs) { return; }
    Object.keys(updateFuncs).forEach(prop => {
        updateData(updateFuncs[prop], prop, params);
    });
}