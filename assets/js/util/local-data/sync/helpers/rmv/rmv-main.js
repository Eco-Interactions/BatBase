/**
 * Removes data invalidated by edits to the entity.
 *
 * Export
 *     removeInvalidatedData
 *     hasEdits
 *
 * TOC
 *     REMOVE ENTITY DATA
 *     REMOVE HANDLERS
 */
import { _u } from '~db';
import * as db from '../../../local-data-main.js';
import { updateData } from '../execute-update.js';
import * as r from './rmv-funcs.js';

export function removeInvalidatedData(data) {                       /*dbug-log*///console.log("           --removeInvalidatedData called. data = %O", data);
    updateRelatedCoreData(data, data.coreEdits);
    updateRelatedDetailData(data);
}
/* ------------------------ REMOVE ENTITY DATA ------------------------------ */
function updateRelatedCoreData(data, edits) {
    if (!hasEdits(edits)) { return; }
    removeInvalidatedDataProps(data.core, data.coreEntity, edits);
}
function updateRelatedDetailData(data) {
    if (!hasEdits(data.detailEdits)) { return; }
    removeInvalidatedDataProps(data.detail, data.detailEntity, data.detailEdits);
}
export function hasEdits(editObj) {
    return editObj && Object.keys(editObj).length > 0;
}
/** Updates relational storage props for the entity. */
function removeInvalidatedDataProps(entity, rcrd, edits) {          /*dbug-log*///console.log("               --removeInvalidatedDataProps called for [%s]. edits = %O", entity, edits);
    const params = { entity: entity, rcrd: rcrd, stage: 'rmvData' };
    const handlers = getRmvDataPropHndlrs(entity);
    return Object.keys(edits).forEach(prop => {
        if (!handlers[prop]) { return ; }
        updateData(handlers[prop], prop, params, edits);
    });
}
/* ------------------------ REMOVE HANDLERS --------------------------------- */
/** Returns an object with relational properties and their removal handlers. */
function getRmvDataPropHndlrs(entity) {
    return {
        'author': {},
        'citation': {}, // 'citationType': rmvFromTypeProp,
        'geoJson': {},
        'interaction': {
            'Location': r.rmvIntAndAdjustTotalCnts,
            'Source': r.rmvIntFromEntity,
            'Subject': r.rmvIntFromTaxon,
            'Object': r.rmvIntFromTaxon,/* 'interactionType': rmvFromTypeProp,*/ /* 'tag': rmvFromTagProp */
        },
        'location': {
            'ParentLocation': r.rmvFromParent, /*'locationType': rmvFromTypeProp*/
        },
        'publication': {},  //'publicationType': rmvFromTypeProp
        'publisher': {},
        'source': {
            'Contributor': r.rmvContrib,
            'ParentSource': r.rmvFromParent,/* 'tag': rmvFromTagProp */
        },
        'taxon': {
            'DisplayName': r.rmvFromNameProp,
            'Group': r.rmvFromNameProp,
            'ParentTaxon': r.rmvFromParent,
            'SubGroup': r.rmvFromNameProp,
            'Rank': r.rmvFromNameProp,
        }
    }[entity];
}