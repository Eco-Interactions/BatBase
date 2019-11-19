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
export function getNextFormLevel(next, curLvl) {
    const fLvls = _forms.memory('getAllFormMemory').formLevels;
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