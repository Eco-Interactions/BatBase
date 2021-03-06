/**
 * TODO: DOCUMENT
 *
 * Export
 *
 * TOC
 *
 */

/* ======================= SET CORE STATE =================================== */
export function setStateProp(fS, prop, val) {                       /*dbug-log*///console.log('   --setStateProp [%s][%s][%O]', prop, val, fS);
    fS[prop] = val;
}
/**
 * Edge case: After form submit, the updated data is fetched and stored here, but
 * if the form is closed before the data is stored, cancel storing the data.
 */
export function setEntityRecords(fS, entity, rcrds) {               /*dbug-log*///console.log('   --setEntityRecords [%s][%O][%O]', entity, records, fS);
    fS.records[entity] = rcrds;
}
/* ============================ SETTERS ===================================== */
/* ----------------------- ENTITY FORM -------------------------------------- */
export function setFormState(fState, prop, val) {                   /*dbug-log*///console.log('   --setFormState [%s][%s][%O]', prop, val, fState);
    fState[prop] = val;
}
export function setFieldState(fState, field, val, prop = 'value') { /*dbug-log*///console.log('    --setFieldState fields[%s] prop[%s] val?[%O] [%O]', field, prop, val, fState);
    let fData = fState.fields[field];
    if (!prop) { return fData = val; }
    fData[prop] = val;
}
export function setOnFormCloseHandler(fState, hndlr) {              /*dbug-log*///console.log('    --setOnFormCloseHandler hndlr[%O] [%O]', hndlr, fState);
    fState.onFormClose = hndlr;
}
export function addRequiredFieldInput(fState, input) {              /*dbug-log*///console.log('    --addRequiredFieldInput input[%O] [%O]', input, fState);
    fState.reqElems.push(input);
}
/* _________________________ COMBOBOX _______________________________________ */
/* Note: Sub-group sel is removed from for single-root taxon groups (no subGroups). */
export function removeFieldFromComboInit(fState, fieldName) {       /*dbug-log*///console.log('    --removeFieldFromComboInit field[%s] [%O]', fieldName, fState);
    const field = fState.fields[fieldName];
    field.combo = false;
}
/* ___________________________ TAXON ________________________________________ */
export function setTaxonProp(fState, prop, val) {                   /*dbug-log*///console.log('    --setTaxonProp prop[%s][%s] [%O]', prop, val, fState);
    return fState.misc[prop] = val;
}
/** When a new taxon parent is selected in the taxon edit-form, groups data is updated. */
export function setTaxonGroupData(fState, taxon) {                  /*dbug-log*///console.log('    --setTaxonGroupData taxon[%O] [%O]', prop, val, fState);
    const txnData = fState.forms.taxonData;
    const group = fState.misc.groups[taxon.group.id];
    fState.misc.groupName = group.displayName;
    fState.misc.subGroupId = taxon.group.subGroup.id;
    fState.misc.subGroups = group.subGroups;
    fState.misc.groupTaxon = taxon;
}
