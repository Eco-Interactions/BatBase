/**
 * Functions that remove data from local-storage.
 *
 * Export
 *     rmvContrib
 *     rmvFromNameProp
 *     rmvFromParent
 *     rmvIntAndAdjustTotalCnts
 *     rmvIntFromEntity
 *     rmvIntFromTaxon
 */
import * as db from '../../../local-data-main.js';
/** Removes the id from the ary. */
function rmvIdFromAry(ary, id) {
    ary.splice(ary.indexOf(id), 1);
}
/** Removes a record's id from the previous parent's 'children' array. */
export function rmvFromParent(prop, rcrd, entity, edits) {
    if (!edits[prop].old) { return; }
    const rcrds = db.getMmryData(entity);
    rmvIdFromAry(rcrds[edits[prop].old].children, rcrd.id);
    db.setDataInMemory(entity, rcrds);
}
/** Removes the Interaction from the stored entity's collection. */
export function rmvIntFromEntity(prop, rcrd, entity, edits) {
    const rcrds = db.getMmryData(prop);                             /*dbug-log*///console.log("               --rmvIntFromEntity. [%s] = %O. rcrd = %O, edits = %O", prop, rcrds, rcrd, edits);
    const storedEntity = rcrds[edits[prop].old];
    rmvIdFromAry(storedEntity.interactions, rcrd.id);
    db.setDataInMemory(prop, rcrds);
}
/** Removes the Interaction and updates parent location total counts.  */
export function rmvIntAndAdjustTotalCnts(prop, rcrd, entity, edits) {
    const rcrds = db.getMmryData(prop);                             /*dbug-log*///console.log("               --rmvIntFromLocation. [%s] = %O. rcrd = %O, edits = %O", prop, rcrds, rcrd, edits);
    const oldLoc = rcrds[edits[prop].old];
    const newLoc = rcrds[edits[prop].new];
    rmvIdFromAry(oldLoc.interactions, rcrd.id);
    adjustLocCnts(oldLoc, newLoc, rcrds);
    db.setDataInMemory(prop, rcrds);
}
function adjustLocCnts(oldLoc, newLoc, rcrds) {
    adjustLocAndParentCnts(oldLoc, false);
    adjustLocAndParentCnts(newLoc, true);

    function adjustLocAndParentCnts(loc, addTo) {                   /*dbug-log*///console.log('adjustLocAndParentCnts. args = %O', arguments);
        addTo ? ++loc.totalInts : --loc.totalInts;
        if (loc.parent) { adjustLocAndParentCnts(rcrds[loc.parent], addTo); }
    }
}
/** Removes the Interaction from the taxon's subject/objectRole collection. */
export function rmvIntFromTaxon(prop, rcrd, entity, edits) {
    const taxa = db.getMmryData('taxon');                           /*dbug-log*///console.log("               --rmvIntFromTaxon. [%s] = %O. taxa = %O", prop, taxa, rcrd);
    const taxon = taxa[edits[prop].old];
    rmvIdFromAry(taxon[prop+"Roles"], rcrd.id);
    db.setDataInMemory("taxon", taxa);
}
export function rmvContrib(prop, rcrd, entity, edits) {             /*dbug-log*///console.log("               --rmvContrib. edits = %O. rcrd = %O", edits, rcrd)
    const srcObj = db.getMmryData('source');
    edits.contributor.removed.forEach(id => {
        rmvIdFromAry(srcObj[id].contributions, rcrd.id)
    });
    db.setDataInMemory('source', srcObj);
}
export function rmvFromNameProp(prop, rcrd, entity, edits) {
    const taxonName = getTaxonName(edits, rcrd);
    const nameProp = getNameProp(edits, rcrd);
    const nameObj = db.getMmryData(nameProp);
    delete nameObj[taxonName];
    db.setDataInMemory(nameProp, nameObj);
}
function getTaxonName(edits, rcrd) {
    return edits.name ? edits.name.old : rcrd.name;
}
function getNameProp(edits, rcrd) {
    const subGroup = getSubGroup(edits.subGroup, rcrd);
    const rank = getRank(edits.rank, rcrd);
    return rcrd.group.displayName + subGroup + rank + 'Names';
}
function getSubGroup(subGroupEdits, rcrd) {
    return !subGroupEdits ? rcrd.group.subGroup : subGroupEdits.old;
}
function getRank(rankEdits, rcrd) {
    return !rankEdits ? rcrd.rank.displayName :
        db.getMmryData('rank')[rankEdits.old].displayName;
}
// /** Removes the record from the entity-type's stored array. */
// function rmvFromTypeProp(prop, rcrd, entity, edits) {
//     if (!edits[prop].old) { return; }
//     const typeObj = mmryData[prop].value;
//     const type = typeObj[edits[prop].old];
//     rmvIdFromAry(type[entity+'s'], rcrd.id);
//     db.setDataInMemory(prop, typeObj);
// }
// NOTE: DON'T DELETE. WILL BE USED AGAIN WHEN TAGS ARE USED WITH MORE THAN JUST INTERACTIONS
// /** Removes a record from the tag's array of record ids. */
// function rmvFromTagProp(prop, rcrd, entity, edits) {
//     if (!edits.tag.removed) { return; }
//     const tagObj = mmryData[prop].value;
//     edits.tag.removed.forEach(tagId => {
//         rmvIdFromAry(tagObj[tagId][entity+'s'], rcrd.id);
//     });
//     db.setDataInMemory(prop, tagObj);
// }