/**
 * Builds and manipulates HTML options.
 *
 * TOC
 *     GET OPTIONS
 *     OPTIONS UTIL
 */
/** ==================== GET OPTIONS ======================================== */
/** Builds options out of a stored entity-name object. */
export function getOptsFromStoredData(prop) {
    return _db('getData', [prop, true]).then(data => {              /*dbug-log*///console.log('getOptsFromStoredData [%s].', prop);
        if (!data) { console.log('NO STORED DATA for [%s]', prop);return []; }
        return buildOptsObj(data, Object.keys(data).sort());
    });
}
/**
 * Builds options out of the entity-name  object. Name (k) ID (v). If an option
 * group is passed, an additional 'group' key is added that will serve as a category
 * for the options in the group.
 */
export function buildOptsObj(entityObj, sortedKeys) {               /*dbug-log*///console.log('buildOpts = %O, order = %O', entityObj, sortedKeys);
    return sortedKeys.map(name => {
        return typeof entityObj[name] === 'object' ?
            { group: entityObj[name].group,
              text: _u('ucfirst', [name]),
              value: entityObj[name].value
            } : { value: entityObj[name], text: _u('ucfirst', [name]) }
    });
}
/** ==================== OPTIONS UTIL ======================================= */
export function alphabetizeOpts(opts) {
    return opts.sort(alphaOptionObjs)
}
function alphaOptionObjs(a, b) {
    var x = a.text.toLowerCase();
    var y = b.text.toLowerCase();
    return x<y ? -1 : x>y ? 1 : 0;
}