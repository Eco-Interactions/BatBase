/**
 * Modifies interaction-data for local storage:
 * - [entity]Names - an object with each entity's displayName(k) and id.
 * * interaction - Adds the Object Group to each interaction record to filter Bat
 *     records by object group.
 *
 * Export
 *     modifyIntDataForLocalDb
 */
import * as db from '../../local-data-main.js';
import { getNameObj, getTypeObj } from '../init-helpers.js';

export function modifyIntDataForLocalDb(data) {                     /*dbug-log*///console.log("modifyIntDataForLocalDb called. data = %O", data);
    db.setDataInMemory('intTypeNames', getTypeObj(data.interactionType));
    db.setDataInMemory('tagNames', getNameObj(Object.keys(data.tag), data.tag));
    db.deleteMmryData('tag');
    addObjGroupIdProp(data.interaction);
}
function addObjGroupIdProp(ints) {
    const taxa = db.getMmryData('taxon');
    Object.keys(ints).forEach(i => addObjectGroupId(ints[i]));
    db.setDataInMemory('interaction', ints);

    function addObjectGroupId(int) {
        int.objGroup = taxa[int.object].group.id.toString();
    }
}