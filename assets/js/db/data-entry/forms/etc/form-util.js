/**
 *
 *
 *
 * Exports:             Imported by:
 *     getNextFormLevel     forms-main
 *     getSubFormLvl        forms-main
 */
import * as _forms from '../forms-main.js';

/** Returns the 'next' form level- either the parent or child. */
export function getNextFormLevel(next, curLvl) {  console.log('args = %O', arguments)
    const fLvls = _forms.memory('getMemoryProp', ['formLevels']);   console.log('levels = %O', fLvls)
    const nextLvl = next === 'parent' ? 
        fLvls[fLvls.indexOf(curLvl) - 1] : 
        fLvls[fLvls.indexOf(curLvl) + 1] ;
    return nextLvl;
}
/** 
 * Returns the sub form's lvl. If the top form is not the interaction form,
 * the passed form lvl is reduced by one and returned. 
 */
export function getSubFormLvl(intFormLvl) { 
    const mmry = _forms.memory('getAllFormMemory') 
    const fLvls = mmry.formLevels;
    return mmry.forms.top.entity === 'interaction' ? 
        intFormLvl : fLvls[fLvls.indexOf(intFormLvl) - 1];
}

/** Returns an obj with the order (k) of the values (v) inside of the container. */
export function getSelectedVals(cntnr, fieldName) {
    let vals = {};
    $.each(cntnr.children, (i, elem) => getCntnrFieldValue(i+1, elem.children));              
    return vals;
        
    function getCntnrFieldValue(cnt, subElems) {                                     
        $.each(subElems, (i, subEl) => { 
            if (subEl.value) { vals[cnt] = subEl.value; }});  
    }                                                                   
}