/**
 *
 *
 *
 */


export function ifAllRequiredFieldsFilled(fLvl) {
    const reqElems = _state('getFormProp', [fLvl, 'reqElems']);     /*dbug-log*///console.log("   ->-> ifAllRequiredFieldsFilled... [%s] = %O", fLvl, reqElems)
    return reqElems.every(isRequiredFieldFilled.bind(null, fLvl));
}
/** Note: checks the first input of multiSelect container elems.  */
function isRequiredFieldFilled(fLvl, elem) {
    if ($('.'+fLvl+'-active-alert').length) { return false; }       /*dbug-log*///console.log('       --checking [%s] = %O, value ? ', elem.id, elem, getElemValue(elem));
    return getElemValue(elem);

    function getElemValue(elem) {
        return elem.value ? true :
            elem.id.includes('-cntnr') ? isCntnrFilled(elem) : false;
    }
}
/**
 * Returns true if the first field of the author/editor container has a value.
 * For book publications, either authors or editors are required. If there is
 * no author value, the first editor value is returned instead.
 */
function isCntnrFilled(elem) {                                      /*dbug-log*///console.log('isCntnrFilled? elem = %O', elem);
    return isAFieldSelected('Authors') || isAFieldSelected('Editors');
}
function isAFieldSelected(entity) {                                 /*dbug-log*///console.log('[%s] field = %O', entity, $('#sel-cntnr-'+entity)[0]);
    if (!$(`#${entity}_f-cntnr`).length) { return false; } //When no editor select is loaded.
    const fields = $(`#${entity}_f-cntnr`)[0].firstChild.children;/*dbug-log*///c//console.log('fields = %O', fields);
    let isSelected = false;
    $.each(fields, (i, field) => { if ($(field).val()) { isSelected = true; } });
    return isSelected;
}