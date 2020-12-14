/**
 * Modifies interaction-data for local storage:
 * - [entity]Names - an object with each entity's displayName(k) and id.
 * * interaction - Adds the Object Group to each interaction record.
 * * interactionType - Handles required tags and tags restricted to a specific Object Group.
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
    modifyInteractionTypeTagData(data.interactionType);
}
function addObjGroupIdProp(ints) {
    const taxa = db.getMmryData('taxon');
    Object.keys(ints).forEach(i => addObjectGroupId(ints[i]));
    db.setDataInMemory('interaction', ints);

    function addObjectGroupId(int) {
        int.objGroup = taxa[int.object].group.id.toString();
    }
}
function modifyInteractionTypeTagData(intTypes) {
    for (let type in intTypes) {
        handleTagDataModification(intTypes[type]);
    }
}
function handleTagDataModification(intType) {
    handleRequiredTag(intType);
    handleGroupRestrictions(intType);
}
function handleRequiredTag(intType) {
    const map = {
        'Visitation': ['Flower'],
        'Transport': ['Arthropod', 'Bryophyte Fragment']
    };
    if (!map[intType.displayName]) { return; }
    intType.tags = intType.tags.map(t => {
        if (map[intType.displayName].indexOf(t.displayName) !== -1) { t.required = true; }
        return t;
    })
}
function handleGroupRestrictions(intType) {
    const map = {
        'Bryophyte Fragment': 'Plant',
        'Arthropod': 'Arthropod'
    };
    intType.tags = intType.tags.map(t => {
        if (map[t.displayName]) { t.group = map[t.displayName]; }
        return t;
    })
}