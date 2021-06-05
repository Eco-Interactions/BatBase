/**
 * Functions that add data to local-storage.
 *
 * Exports
 *     addContribData
 *     addGroupDataToRcrd
 *     addInteractionRole
 *     addInteractionToEntity
 *     addObjGroupIdToRcrd
 *     addToNameProp
 *     addToParentRcrd
 *     addToRcrdAryProp
 *     addToRcrdProp
 *     addToTaxonNames
 *     updateDataProps
 */
import { _u } from '~util';
import * as db from '../../../local-data-main.js';
/** Add the new record to the prop's stored records object.  */
export function addToRcrdProp(prop, rcrd, entity) {
    const rcrds = db.getMmryData(prop);                             /*dbug-log*///console.log("               --addToRcrdProp. [%s] = %O. rcrd = %O", prop, _u('snapshot', [rcrds]), _u('snapshot', [rcrd]));
    rcrds[rcrd.id] = rcrd;
    db.setDataInMemory(prop, rcrds);
}
export function addGroupDataToRcrd(prop, rcrd, entity) {
    const taxa = db.getMmryData('taxon');                           /*dbug-log*///console.log("               --addGroupDataToRcrd. taxa = %O. rcrd = %O", _u('snapshot', [taxa]), _u('snapshot', [rcrd]));
    const taxon = taxa[rcrd.id];
    taxon.group = taxon.group ? taxon.group : getTaxonGroup(taxon, taxa);
    db.setDataInMemory('taxon', taxa);
}
function getTaxonGroup(taxon, taxa, prev) {
    const parent = taxa[taxon.parent];
    if (parent.group) { return parent.group; }
    return getTaxonGroup(parent, taxa, taxon);
}
export function addGroupIdToRcrd(role, prop, rcrd, entity) {
    const rcrdProp = (role === 'Object' ? 'obj' : 'subj') + 'GroupId';
    const ints = db.getMmryData('interaction');
    const taxa = db.getMmryData('taxon');
    const taxon = taxa[rcrd[role]];                                 /*dbug-log*///console.log("               --addObjGroupIdToRcrd. taxon = %O. rcrd = %O", taxon, _u('snapshot', [rcrd]));
    rcrd[rcrdProp] = taxon.group.id;
    db.setDataInMemory('interaction', ints);
}
/** Add the new record to the prop's stored records object.  */
export function addToRcrdAryProp(prop, rcrd, entity) {
    const rcrds = db.getMmryData(prop);                             /*dbug-log*///console.log("               --addToRcrdAryProp. [%s] = %O. rcrd = %O", prop, rcrds, rcrd);
    if (!ifNewRcrd(rcrds, rcrd.id)) { return; }
    rcrds.push(rcrd.id);
    db.setDataInMemory(prop, rcrds);
}
/** Add the new entity's display name and id to the prop's stored names object.  */
export function addToNameProp(prop, rcrd, entity) {
    const nameObj = db.getMmryData(prop);
    nameObj[rcrd.displayName] = rcrd.id;
    db.setDataInMemory(prop, nameObj);
}
function ifNewRcrd(ary, id) {
    return ary.indexOf(id) === -1;
}
/** Adds a new child record's id to it's parent's 'children' array. */
export function addToParentRcrd(prop, rcrd, entity) {
    if (!rcrd.parent) { return; }
    const rcrds = db.getMmryData(prop);                             /*dbug-log*///console.log("               --addToParentRcrd. [%s] = %O. rcrd = %O", prop, rcrds, rcrd);
    const parent = rcrds[rcrd.parent];
    if (!ifNewRcrd(parent.children, rcrd.id)) { return; }
    parent.children.push(rcrd.id);
    db.setDataInMemory(prop, rcrds);
}
/**
 * Adds the Taxon's name to the stored names for it's group and rank.
 * Note: 'group' is added above, so the taxon from storage is used rather than the rcrd.
 */
export function addToTaxonNames(prop, rcrd, entity) {               /*dbug-log*///console.log('addToTaxonNames. prop = [%s] rcrd = %O', prop, rcrd);
    const taxon = db.getMmryData('taxon')[rcrd.id];
    const group = taxon.group.displayName;
    const subGroup = taxon.group.subGroup.name;
    const rank = taxon.rank.displayName;
    const nameProp = group+subGroup+rank+"Names";
    let data = db.getMmryData(nameProp) || {};
    data[taxon.name] = taxon.id; //done here because taxa use a base 'name' property, as they display typically with the rank prepended
    db.setDataInMemory(nameProp, data);
}
/** Adds the Interaction to the stored entity's collection.  */
export function addInteractionToEntity(prop, rcrd, entity) {        /*dbug-log*///console.log('addInteractionToEntity. prop = [%s] rcrd = %O', prop, rcrd);
    if (!rcrd[prop]) { return; }
    const rcrds = db.getMmryData(prop);
    const storedEntity = rcrds[rcrd[prop]];
    if (!storedEntity) { console.log('[%s][%s] not found', prop, rcrd[prop]); }
    if (!ifNewRcrd(storedEntity.interactions, rcrd.id)) { return; }
    storedEntity.interactions.push(rcrd.id);
    if (prop === 'source') { storedEntity.isDirect = true; }
    db.setDataInMemory(prop, rcrds);
}
/** Adds the Interaction to the taxon's subject/objectRole collection.  */
export function addInteractionRole(prop, rcrd, entity) {
    const taxa = db.getMmryData('taxon');
    const taxon = taxa[rcrd[prop]];
    if (!ifNewRcrd(taxon[prop+"Roles"], rcrd.id)) { return; }
    taxon[prop+"Roles"].push(rcrd.id);
    db.setDataInMemory("taxon", taxa);
}
/** When a Publication/Citation has been updated, add new author contributions. */
export function addContribData(prop, rcrd, entity) {                /*dbug-log*///console.log("               --addContribData. [%s] [%s]. rcrd = %O", prop, entity, rcrd);
    if (!rcrd[prop]) { return; }
    const changes = false;
    const srcObj = db.getMmryData('source');
    addNewContribData();
    if (changes) { db.setDataInMemory('source', srcObj); }

    function addNewContribData() {
        for (let ord in rcrd[prop]) {
            const authId = rcrd[prop][ord];
            if (!ifNewRcrd(srcObj[authId].contributions, rcrd.id)) { continue; }
            srcObj[authId].contributions.push(rcrd.id);
        }
    }
}
// NOTE: DON'T DELETE. WILL BE USED AGAIN WHEN TAGS ARE USED WITH MORE THAN JUST INTERACTIONS
// /** Adds a new tagged record to the tag's array of record ids. */
// function addToTagProp(prop, rcrd, entity) {
//     if (!rcrd.tags.length) { return; }
//     const tagObj = mmryData[prop].value;                                        //console.log("               --addToTagProp. [%s] = %O. rcrd = %O", prop, tagObj, rcrd);
//     const toAdd = rcrd.tags.filter(tag => ifNewRcrd(tagObj[tag.id][entity+'s'], rcrd.id));
//     if (!toAdd) { return; }
//     toAdd.forEach(tag => tagObj[tag.id][entity+'s'].push(rcrd.id));
//     db.setDataInMemory(prop, tagObj);
// }
// NOTE: DON'T DELETE. COULD BE USED AGAIN
/** Add the new record's id to the entity-type's stored id array.  */
// function addToTypeProp(prop, rcrd, entity) {                console.log('args = %O', arguments);
//     const typeId = rcrd[prop] ? rcrd[prop].id : false;
//     if (!typeId) { return; }
//     const typeObj = mmryData[prop].value;
//     if (!ifNewRcrd(typeObj[typeId][entity+'s'], rcrd.id)) { return; }
//     typeObj[typeId][entity+'s'].push(rcrd.id);
//     db.setDataInMemory(prop, typeObj);
// }
// function addToCoreTypeProp(entity, rcrd) {
//     if (entity === "taxon") { return Promise.resolve(); }
//     return addToTypeProp(entity+"Type", rcrd, entity);
// }