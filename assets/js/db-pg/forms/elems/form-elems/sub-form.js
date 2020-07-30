/**
 * Builds and returns the subForm according to the passed params. Disables the
 * select elem 'parent' of the sub-form.
 * (container)DIV>[(header)P, (fields)DIV, (buttons)DIV]
 */
import { _elems, _cmbx, _state } from '../../forms-main.js';
import { _u } from '../../../db-main.js';

export default function(fLvl, fClasses, fVals, selId) {
    const formEntity = _state('getFormProp', [fLvl, 'entity']);
    return _elems('buildFormRows', [formEntity, fVals, fLvl])
        .then(buildFormContainer)

    function buildFormContainer(rows) {
        const subFormContainer = buildSubFormCntnr();
        const bttns = _elems('getFormFooter', [formEntity, fLvl, 'create']);
        $(subFormContainer).append([buildFormHdr(), rows, bttns]);
        _state('setFormProp', [fLvl, 'pSelId', selId]);
        _cmbx('enableCombobox', [selId, false]);
        return subFormContainer;
    }
    function buildSubFormCntnr() {
        const attr = {id: fLvl+'-form', class: fClasses };
        return _u('buildElem', ['div', attr]);
    }
    function buildFormHdr() {
        const attr = { text: 'New '+_u('ucfirst', [formEntity]), id: fLvl+'-hdr' };
        return _u('buildElem', ['p', attr]);
    }
}