/**
 * Builds and returns the subForm according to the passed params. Disables the
 * select elem 'parent' of the sub-form.
 * (container)DIV>[(header)P, (fields)DIV, (buttons)DIV]
 */
import * as _f from '../../forms-main.js';


export default function(fLvl, fClasses, fVals, selId) {
    const formEntity = _f.state('getFormProp', [fLvl, 'entity']);
    return _f.elems('buildFormRows', [formEntity, fVals, fLvl])
        .then(buildFormContainer)

    function buildFormContainer(rows) {
        const subFormContainer = buildSubFormCntnr();
        const bttns = _f.elems('getFormFooter', [formEntity, fLvl, 'create']);
        $(subFormContainer).append([buildFormHdr(), rows, bttns]);
        _f.state('setFormProp', [fLvl, 'pSelId', selId]);
        _f.cmbx('enableCombobox', [selId, false]);
        return subFormContainer;
    }
    function buildSubFormCntnr() {
        const attr = {id: fLvl+'-form', class: fClasses };
        return _f.util('buildElem', ['div', attr]);
    }
    function buildFormHdr() {
        const attr = { text: 'New '+_f.util('ucfirst', [formEntity]), id: fLvl+'-hdr' };
        return _f.util('buildElem', ['p', attr]);
    }
}