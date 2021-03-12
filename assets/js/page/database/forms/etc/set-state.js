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
/* ___________________________ TAXON ________________________________________ */
export function setTaxonGroupState(fS, fLvl, vals) {
    const group = getGroupEntity(fS, fLvl, vals);
    const sGroupId = getSubGroupId(vals, group);                    /*dbug-log*///console.log('   --setTaxonGroupState subGroupId[%s] group[%O] ', sGroupId, group);
    setGroupState(fS.records.taxon, fS.forms[fLvl], group);
    setSubGroupState(fS, fS.forms[fLvl], group.subGroups, sGroupId);/*perm-log*/console.log('       --[%s] stateData = %O', group.displayName, fS.forms[fLvl]);
}
function getGroupEntity(fS, fLvl, vals) {
    return vals.Group ? fS.records.group[vals.Group] :
        fS.forms[fLvl].fields.Group.misc.rcrd;
}
function getSubGroupId(vals, group) {
    return vals['Sub-Group'] ? vals['Sub-Group'] : Object.keys(group.subGroups)[0];
}
/** [setGroupState description] */
function setGroupState(taxa, fState, group) {                       /*dbug-log*///console.log('--setGroupState group[%O]', group);
    if (!fState.fields['Group']) { fState.fields['Group'] = {}; }
    fState.fields['Group'].value = { text: group.displayName, value: group.id };
    fState.fields['Group'].misc = {
        rcrd: group,
        subGroups: group.subGroups
    };
}
/** [setSubGroupState description] */
function setSubGroupState(fS, fState, subGroups, sGroupId) {
    if (!fState.fields['Sub-Group']) { fState.fields['Sub-Group'] = {}; }
    const subGroup = subGroups[sGroupId];                           /*dbug-log*///console.log('--setSubGroupState subGroup[%O]', subGroup);
    fState.fields['Sub-Group'].class = subGroups.length > 1 ? '' : 'invis';
    fState.fields['Sub-Group'].value = { text: subGroup.name, value: sGroupId };
    fState.fields['Sub-Group'].misc = {
        subRanks: subGroup.subRanks,
        taxon: fS.records.taxon[subGroup.taxon]
    };
}