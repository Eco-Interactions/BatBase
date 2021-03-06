/**
 * Handles updating the confg before changes that affect form rebuilds.
 * TODO:DOCUMENT
 *
 * Export
 *     onEntityTypeChangeUpdateConfg
 *     onFieldViewChangeUpdateConfg
 *
 * TOC
 *     ENTITY-TYPE CHANGED
 *     FIELD-VIEW CHANGED
 */
import { _u } from '~util';
import { _state } from '~form';
import { getBaseConfg, setDisplayedFieldConfg } from '../confg-main.js';
/* ====================== ENTITY-TYPE CHANGED =============================== */
/** On form entity-type change, entity-type confg merged with current confg. */
export function onEntityTypeChangeUpdateConfg(fLvl) {               /*dbug-log*///console.log('+--onEntityTypeChangeUpdateConfg [%s]', fLvl);
    const confg = _state('getFormState', [fLvl]);
    const vals = _state('getFieldValues', [fLvl]);
    updateTypeConfg(confg, vals);
}
function updateTypeConfg(c, vals) {                                 /*dbug-log*///console.log('   --updateTypeConfg [%s][%s][%O] vals[%O]', c.name, c.type, c, vals);
    const mConfg = getBaseConfg(c.name, c.group, c.type);
    updateConfg(c, mConfg, vals);                                   /*dbug-log*///console.log('   --FINAL [%s] confg[%O]', c.name, c);
}
/** [updateConfg description] */
function updateConfg(c, mConfg, vals) {                             /*dbug-log*///console.log('   --updateConfg confg[%O] mConfg[%O]', c, mConfg);
    const replace = ['fields'];
    replace.forEach(p => c[p] = mConfg[p]);
    setDisplayedFieldConfg(c, mConfg.views, vals);
}
/* ======================= FIELD-VIEW CHANGED =============================== */
/** [onFieldViewChangeUpdateConfg description] */
export function onFieldViewChangeUpdateConfg(fLvl) {                /*dbug-log*///console.log('+--onFieldViewChangeUpdateConfg [%s]', fLvl);
    const confg = _state('getFormState', [fLvl]);
    const vals = _state('getFieldValues', [fLvl]);
    updateViewConfg(confg, vals);
}
function updateViewConfg(c, vals) {                                 /*dbug-log*///console.log('+--onFieldViewChangeUpdateConfg [%s][%s][%O] vals[%O]', c.name, c.type, c, vals);
    const mConfg = getBaseConfg(c.name, c.group, c.type);
    c.display = c.display === 'all' ? 'simple' : 'all';
    setDisplayedFieldConfg(c, mConfg.views, vals);                  /*dbug-log*///console.log('   --FINAL [%s] confg[%O]', c.name, c);
}