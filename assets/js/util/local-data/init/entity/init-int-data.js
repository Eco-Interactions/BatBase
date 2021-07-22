/**
 * Modifies interaction-data for local storage:
 * - [entity]Names - an object with each entity's displayName(k) and id.
 * - subjectNames - Array of valid subject taxon-group ids.
 * * interaction - Adds the Taxon Group's ids to each record to filter by groups.
 *
 * Export
 *     modifyIntDataForLocalDb
 */
import * as db from '../../local-data-main.js';
import { getNameObj, getTypeObj } from '../init-helpers.js';

export function modifyIntDataForLocalDb(data) {                     /*dbug-log*///console.log("modifyIntDataForLocalDb called. data = %O", data);
    db.setDataInMemory('intTypeNames', getTypeObj(data.interactionType));
    db.setDataInMemory('tagNames', getNameObj(Object.keys(data.tag), data.tag));
    addGroupIdProps(data.interaction);
    addValidSubjectGroups(data.validInteraction);
}
function addGroupIdProps(ints) {
    const taxa = db.getMmryData('taxon');
    Object.keys(ints).forEach(i => addGroupIds(ints[i]));
    db.setDataInMemory('interaction', ints);                        /*dbug-log*///console.log('taxa[%O]', taxa)

    function addGroupIds(int) {                                     /*dbug-log*///console.log('addGroupIds intRcrd[%O]', int)
        int.objGroupId = taxa[int.object].group.id.toString();
        int.subjGroupId = taxa[int.subject].group.id.toString();
    }
}
function addValidSubjectGroups(vInts) {
    db.setDataInMemory('subjectNames', getSubjectGroupNames(vInts));
}
function getSubjectGroupNames(vInts) {
    const names = {};
    const groups = db.getMmryData('group');
    const subjects = Object.values(vInts).map(v => v.subjectSubGroup);
    Object.values(groups).forEach(addIfValidInteractionSubject);    /*dbug-log*///console.log('--getSubjectGroupNames data[%O]', names);
    return names;

    function addIfValidInteractionSubject(group) {                  /*dbug-log*///console.log('   --addIfValidInteractionSubject group[%O]', group);
        const isValid = Object.keys(group.subGroups).find(ifValidSubject);
        if (!isValid) { return; }
        names[group.displayName] = group.id;
    }
    function ifValidSubject(id) {
        return subjects.indexOf(parseInt(id)) !== -1;
    }
}