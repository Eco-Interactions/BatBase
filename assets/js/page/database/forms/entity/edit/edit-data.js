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
    Object.values(fState.fields).forEach(setIntFieldValue);
    setComplexIntValues();

    function setIntFieldValue(fConfg) {                             /*dbug-log*/console.log('  --setIntFieldValue fConfg[%O]', fConfg);
        if (!fConfg.prop) { return; }
        const v = getFieldValue(fConfg, int);
        if (!v) { return; }                                         /*dbug-log*/console.log('  --field[%s] v[%O]', fConfg.name, v);
        fConfg.value =  v.id ? v.id : v;                                        //console.log('fConfg after [%O]', _u('snapshot', [fConfg]));
    }
    /** Note: Interaction type handled after form load. */
    function setComplexIntValues() {
        setSourceFields(fState.fields.CitationTitle.value);
        setLocationFields(fState.fields.Location.value);
        setTaxonFields(fState.fields.Subject, fState.fields.Object);
        setTagsField(fState.fields.InteractionTags);
    }
    function setSourceFields(citId) {
        const cSrc = data.source[citId];
        const pSrc = data.source[cSrc.parent];
        fState.fields.Publication.value = pSrc.id;
    }
    function setLocationFields(locId) {
        const loc = data.location[locId];
        const parentId = loc.country ? loc.country.id : loc.region.id;
        fState.fields['Country-Region'].value = parentId;
    }
    function setTagsField(tField) {
        tField.value = tField.value.map(t => t.id);
    }
    function setTaxonFields(subjField, objField) {
        setTaxonData(subjField, data.taxon[subjField.value]);
        setTaxonData(objField, data.taxon[objField.value]);
    }
    function setTaxonData(field, taxon) {
        field.misc = { id: taxon.group.subGroup.id };
    }
}

/* ============================ LOCATION ==================================== */
function setLocData(data, fState) {                                 /*dbug-log*///console.log('--setLocData data[%O] fState[%O]', data, fState);
    const loc = data.location[fState.id];                           /*dbug-log*///console.log('  --loc[%O]', loc);
    Object.values(fState.fields).forEach(setLocFieldValue);
    setGeoJsonData(fState.fields.GeoJson, data.geoJson[loc.geoJsonId])
    fState.editing.detail = loc.geoJsonId;

    function setLocFieldValue(fConfg) {                             /*dbug-log*///console.log('  --setLocFieldValue fConfg[%O]', fConfg);
        if (!fConfg.prop) { return; }
        const v = getFieldValue(fConfg, loc);
        if (!v) { return; }                                         /*dbug-log*///console.log('  --field[%s] v[%O]', fConfg.name, v);
        setFieldValue(fConfg, v);
    }
}
function setGeoJsonData(geoJsonField, geoJsonRcrd) {                /*dbug-log*///console.log('  --setGeoJsonData geoJsonField[%O] geoJsonRcrd[%O]', geoJsonField, geoJsonRcrd);
    geoJsonField.misc.rcrd = geoJsonRcrd;
}
/* ============================ SOURCE ====================================== */
function setSrcData(data, fState) {                                 /*dbug-log*///console.log('--setSrcData data[%O] fState[%O]', data, fState);
    const e = {
        core: data.source[fState.id],
        detail: getSrcEntity(data, data.source[fState.id])
    };                                                              /*dbug-log*///console.log('  --entities[%O]', e);
    Object.values(fState.fields).forEach(setSrcFieldValue);
    fState.editing.detail = e.detail.id;

    function setSrcFieldValue(fConfg) {                             /*dbug-log*///console.log('  --setSrcFieldValue fConfg[%O]', fConfg);
        if (!fConfg.prop) { return; }
        const v = getSrcFieldValue(fConfg);
        if (!v) { return; }                                         /*dbug-log*///console.log('  --field[%s] v[%O]', fConfg.name, v);
        if (fConfg.name === fState.name+'Type') { fState.type = v.displayName; }
        setFieldValue(fConfg, v);
    }
    function getSrcFieldValue(fConfg) {
        return Object.keys(fConfg.prop).map(ent => e[ent][fConfg.prop[ent]])[0];
    }
}
function getSrcEntity(data, src) {
    const name = _u('lcfirst', [src.sourceType.displayName]);       /*dbug-log*///console.log('  --getSrcEntity src[%O] name[%s]', src, name);
    return data[name][src[name]];
}
/* ========================== TAXON =================================== */
function setTxnData(data, fState) {                                 /*dbug-log*/console.log('--setTxnData data[%O] fState[%O]', data, fState);
    const txn = data.taxon[fState.id];                              /*dbug-log*/console.log('  --txn[%O]', txn);
    Object.values(fState.fields).forEach(setTxnFieldValue);
    fState.fields['Sub-Group'].value = txn.group.subGroup.id;

    function setTxnFieldValue(fConfg) {                             /*dbug-log*/console.log('  --setTxnFieldValue fConfg[%O]', fConfg);
        if (!fConfg.prop) { return; }
        const v = getFieldValue(fConfg, txn);
        if (!v) { return; }                                         /*dbug-log*/console.log('  --field[%s] v[%O]', fConfg.name, v);
        // if (fConfg.name === ) { fState.type = v.displayName; }
        setFieldValue(fConfg, v);
    }
}





/* ============================ HELPERS ===================================== */
function getFieldValue(fConfg, entity) {                            /*dbug-log*/console.log('  --getFieldValue fConfg[%O]', fConfg);
    return Object.values(fConfg.prop).map(prop => entity[prop])[0];
}
function setFieldValue(fConfg, v) {                                 /*dbug-log*/console.log('  --setFieldValue fConfg[%O]', fConfg);
    fConfg.value =  v.id ? v.id : ( isNaN(v) ? v : parseInt(v));    /*dbug-log*/console.log('       --fConfg after [%O]', _u('snapshot', [fConfg]));
}
// function setIntData(data, fState) {
//     // body...
// }
/* ========================== INTERACTION =================================== */
// function setIntData(data, fState) {
//     // body...
// }
