/**
 *
 * TODO: DOCUMENT
 */
import { _el } from '~util';

export function getRowContainer(entity, fLvl) {
    const attr = { id: getCntnrId(entity, fLvl), class: 'flex-row flex-wrap'};
    return _el('getElem', ['div', attr]);
}
function getCntnrId(entity, fLvl) {
    const baseId = entity+'_fields';
    return $('#'+baseId).length ? baseId+'_'+fLvl : baseId;
}