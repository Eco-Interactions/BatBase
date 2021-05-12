/**
 * TODO: DOCUMENT
 *
 * Export
 *
 * TOC
 *
 */
import { _u } from '~util';
import { _confg } from '~form';
/* ======================= SET CORE STATE =================================== */
export function setStateProp(fS, prop, val) {                       /*dbug-log*///console.log('   --setStateProp [%s][%s][%O]', prop, val, fS);
    fS[prop] = val;
}
/**
 * Edge case: After form submit, the updated data is fetched and stored here, but
 * if the form is closed before the data is stored, cancel storing the data.
 */
export function setEntityRecords(fS, entity, rcrds) {               /*dbug-log*///console.log('   --setEntityRecords entity[%s] rcrds[%O] fS[%O]', entity, rcrds, fS);
    fS.records[entity] = rcrds;
}
/* ====================== SET FORM STATE ==================================== */
export function setFormState(fState, prop, val) {                   /*dbug-log*///console.log('   --setFormState [%s][%s][%O]', prop, val, fState);
    fState[prop] = val;
}
/* ----------------------- FIELDS ------------------------ */
export function setFieldState(fState, field, val, prop = 'value') { /*dbug-log*///console.log('    --setFieldState fields[%s] prop[%s] val?[%O] [%O]', field, prop, val, fState);//console.trace()
    let fData = fState.fields[field];
    if (!prop) { return fData = val; }
    fData[prop] = val;
    onFieldStateChange(fState, field, val, prop);
}
function onFieldStateChange(fState, field, val, prop) {
    const map = {
        required: toggleRequiredLabelClass
    };
    return map[prop] ? map[prop](...arguments) : null;
}
function toggleRequiredLabelClass(fState, field, val, prop) {
    if (val) {
        $(`#${field}_lbl`).addClass('required');
    } else {
        $(`#${field}_lbl`).removeClass('required');
    }
}
/* ___________________________ TAXON ________________________________________ */
/**
 * Note: Group init-value required.
 */
export function setTaxonGroupState(rcrds, f) {                      /*dbug-log*/console.log('--setTaxonGroupState rcrds[%O] f[%O]', rcrds, f);
    const group = getGroupEntity(rcrds, f);
    const sGroupId = getSubGroupId(rcrds, f, group);                /*dbug-log*/console.log('   --setTaxonGroupState subGroupId[%s] group[%O] ', sGroupId, group);
    setGroupState(rcrds.taxon, f, group);
    setSubGroupState(rcrds.taxon, f.fields, group.subGroups, sGroupId);
}
function getGroupEntity(rcrds, f) {
    return rcrds.group[f.fields.Group.value];
}
function getSubGroupId(rcrds, f, group) {
    if (f.fields['Sub-Group'].value) { return f.fields['Sub-Group'].value; }
    return Object.keys(group.subGroups)[0];
}
/** [setGroupState description] */
function setGroupState(taxa, fState, group) {                       /*dbug-log*/console.log('--setGroupState group[%O]', group);
    fState.fields.Group.value = group.id;
    fState.fields.Group.misc = {
        rcrd: group,
        subGroups: group.subGroups
    };                                                              /*dbug-log*/console.log('   --updated state[%O]', _u('snapshot', [fState.fields.Group.misc]));
}
/** [setSubGroupState description] */
function setSubGroupState(rcrds, fields, subGroups, sGroupId) {     /*dbug-log*/console.log('--setSubGroupState rcrds[%O], fields[%O], subGroups[%O], sGroupId[%s]', rcrds, fields, subGroups, sGroupId);
    const subGroup = subGroups[sGroupId];
    fields['Sub-Group'].shown = Object.keys(subGroups).length > 1;
    fields['Sub-Group'].value = subGroup.id;                     /*dbug-log*/console.log('--setSubGroupState fieldClass?[%O] subGroup[%O] subGroups[%O]', fields['Sub-Group'].class, subGroup, subGroups);
    fields['Sub-Group'].misc = {
        rcrd: subGroup,
        subRanks: subGroup.subRanks,
        taxon: rcrds[subGroup.taxon]
    };
}