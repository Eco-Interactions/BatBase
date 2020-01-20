import * as _i from '../../../forms-main.js';
/**
 * Builds and returns the subForm according to the passed params. Disables the 
 * select elem 'parent' of the sub-form. 
 * (container)DIV>[(header)P, (fields)DIV, (buttons)DIV]
 */
export default function(fLvl, fClasses, fVals, selId) {                         
    const formEntity = _i.mmry('getFormProp', [fLvl, 'entity']);  
    return _i.elems('buildFormRows', [formEntity, fVals, fLvl])
        .then(buildFormContainer)

    function buildFormContainer(rows) {
        const subFormContainer = buildSubFormCntnr(); 
        const bttns = _i.elems('getFormFooter', [formEntity, fLvl, 'create']);
        $(subFormContainer).append([buildFormHdr(), rows, bttns]);
        _i.mmry('setFormProp', [fLvl, 'pSelId', selId]);
        _i.cmbx('enableCombobox', [selId, false]);
        return subFormContainer;
    }
    function buildSubFormCntnr() {
        const attr = {id: fLvl+'-form', class: fClasses };        
        return _i.util('buildElem', ['div', attr]);
    }
    function buildFormHdr() {
        const attr = { text: 'New '+_i.util('ucfirst', [formEntity]), id: fLvl+'-hdr' };
        return _i.util('buildElem', ['p', attr]);
    }
}