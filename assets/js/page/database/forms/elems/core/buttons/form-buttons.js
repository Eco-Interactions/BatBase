/**
 * Code specific to form buttons.
 *
 * Export
 *     getExitButton
 *
 * TOC
 *
 */
import { _cmbx, _el, _modal, _u } from '~util';
import { _confg, _elems, _panel, _state } from '~form';

export function getExitButton(onExit) {
    const attr = { id: 'exit-form', class: 'exit-bttn', type: 'button', value: 'X' };
    const bttn = _el('getElem', ['input', attr]);
    $(bttn).click(onExit);
    return bttn;
}
/* __________________________________________________ HELP ELEMS ____________ */
export function getFormHelpElems(fLvl, infoSteps) {                 /*dbug-log*///console.log('+--getFormHelpElems fLvl[%s] infoSteps[%O]', fLvl, infoSteps);
    const cntnr = _el('getElem', ['div', { id: fLvl+'-help', class: 'flex-row'}]);
    $(cntnr).append(getFormWalkthroughBttn(fLvl, infoSteps));
    return cntnr;
}
function getFormWalkthroughBttn(fLvl, infoSteps) {
    if (fLvl === 'top' || !infoSteps) { return $('<div>')[0]; }
    const titleInfo = "Hover your mouse over any field and it's help popup will show, if it has one.";
    const bttn = buildWalkthroughButton(fLvl, titleInfo);
    $(bttn).click(_modal.bind(null, 'showTutorialModal', [fLvl]));
    setIntroWalkthroughAttrs(bttn, titleInfo, ++infoSteps, fLvl);
    return bttn;
}
function buildWalkthroughButton(fLvl, titleInfo) {
    const attr = {
        id: fLvl + '-walkthrough',
        title: titleInfo,
        type: 'button',
        value: 'Walkthrough',
    };
    return _el('getElem', ['input', attr]);
}
function setIntroWalkthroughAttrs(bttn, titleInfo, infoSteps, fLvl) {
    $(bttn).attr({
        'data-intro': titleInfo,
        'data-intro-group': fLvl+'-intro',
        'data-step': infoSteps
    });
}