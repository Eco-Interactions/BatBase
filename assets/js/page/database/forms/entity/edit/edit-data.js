/**
 * Sets field values with entity data for edit forms.
 *
 * Export
 *     setEditFieldValues
 *
 * TOC
 *
 */
import { _u } from '~util';

export function setEditFieldValues(data, fState) {                  /*dbug-log*/console.log('--setEditFieldValues data[%O] fState[%O]', data, fState);
    const entity = fState.core ? fState.core : fState.name;
    return setFieldValues(data, fState, entity);
}
function setFieldValues(data, fState, entity) {
    const map = {
        Interaction: setIntData,
        Location: setLocData,
        Source: setSrcData,
        Taxon: setTxnData
    };
    return map[entity](data, fState);
}
/* ========================== INTERACTION =================================== */
function setIntData(data, fState) {                                 /*dbug-log*/console.log('--setIntData data[%O] fState[%O]', data, fState);
    const int = data.interaction[fState.id];                        /*dbug-log*/console.log('  --int[%O]', int);
    return {};
}

/* ============================ LOCATION ==================================== */
function setLocData(data, fState) {                                 /*dbug-log*/console.log('--setLocData data[%O] fState[%O]', data, fState);
    const loc = data.location[fState.id];                           /*dbug-log*/console.log('  --loc[%O]', loc);
    return {};
}
/* ============================ SOURCE ====================================== */
function setSrcData(data, fState) {                                 /*dbug-log*/console.log('--setSrcData data[%O] fState[%O]', data, fState);
    const e = {
        core: data.source[fState.id],
        detail: getSrcEntity(data, data.source[fState.id])
    };                                                              /*dbug-log*/console.log('  --entities[%O]', e);
    Object.values(fState.fields).forEach(setSrcFieldValue);
    fState.editing.detail = e.detail.id;

    function setSrcFieldValue(fConfg) {                             /*dbug-log*/console.log('  --setSrcFieldValue fConfg[%O]', fConfg);
        if (!fConfg.prop) { return; }
        const v = Object.keys(fConfg.prop).map(ent => e[ent][fConfg.prop[ent]])[0];
        if (!v) { return; }                                         /*dbug-log*/console.log('  --v[%O]', v);
        fConfg.value =  v.id ? v.id : v;
    }
}
function getSrcEntity(data, src) {
    const name = _u('lcfirst', [src.sourceType.displayName]);                             /*dbug-log*/console.log('  --getSrcEntity src[%O] name[%s]', src, name);
    return data[name][src[name]];
}
/* ========================== TAXON =================================== */
function setTxnData(data, fState) {                                 /*dbug-log*/console.log('--setTxnData data[%O] fState[%O]', data, fState);
    const txn = data.taxon[fState.id];                              /*dbug-log*/console.log('  --txn[%O]', txn);
    return {};
}





/* ========================== INTERACTION =================================== */
// function setIntData(data, fState) {
//     // body...
// }
/* ========================== INTERACTION =================================== */
// function setIntData(data, fState) {
//     // body...
// }
