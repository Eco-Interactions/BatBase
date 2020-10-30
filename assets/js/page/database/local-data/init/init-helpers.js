/**
 * Helper methods for the entity-data init process.
 *
 * Exports
 *     getRcrds
 *     getNameObj
 *     getTypeObj
 *     getType
 *
 */
/** Returns an object with a record (value) for each id (key) in passed array.*/
export function getRcrds(ids, rcrds) {
    const data = {};
    ids.forEach(id => data[id] = rcrds[id]);
    return data;
}
/** Returns an object with each entity record's displayName (key) and id. */
export function getNameObj(ids, rcrds) {                            /*dbug-log*///console.log('ids = %O, rcrds = %O', ids, rcrds);
    const data = {};
    ids.forEach(id => data[rcrds[id].displayName] = id);            /*dbug-log*///console.log("nameDataObj = %O", data);
    return data;
}
/** Returns an object with each entity types's displayName (key) and id. */
export function getTypeObj(typeObj) {
    const data = {};
    for (var id in typeObj) {
        data[typeObj[id].displayName] = id;
    }
    return data;
}
export function getType(types, type, collection) {
    for (let t in types) {
        if (types[t].slug === type) { return types[t][collection]; }
    }
}
// --> SAVE FOR A TIME WHEN MULTIPLE ENTITIES ARE USING TAGS IN THIS WAY <---
// /** Returns an object with each entity tag's displayName (key) and id. */
// function getTagData(tags, entity) {
//     const data = {};
//     for (var id in tags) {
//         if ( tags[id].constrainedToEntity === entity ) {
//             data[tags[id].displayName] = id;
//         }
//     }
//     return data;
// }