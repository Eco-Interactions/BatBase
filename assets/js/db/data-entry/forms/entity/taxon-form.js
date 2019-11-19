/**
 *
 *
 * Exports:                 Imported by:
 *     finishTaxonSelectUi       forms-main
 */
import * as _forms from '../forms-main.js';


export function getComboEvents(entity, fieldName) {
    return {
        'Species': { change: onLevelSelection, add: initTaxonForm },
        'Family': { change: onLevelSelection, add: initTaxonForm },
        'Genus': { change: onLevelSelection, add: initTaxonForm },
        'Order': { change: onLevelSelection, add: initTaxonForm },
        'Class': { change: onLevelSelection, add: initTaxonForm },
        'Realm': { change: onRealmSelection }
    };
}
/**
 * Customizes the taxon-select form ui. Either re-sets the existing taxon selection
 * or brings the first level-combo into focus. Clears the [role]'s' combobox. 
 */
export function finishTaxonSelectUi(role) {                                     //console.log('finishTaxonSelectUi')
    const fLvl = getSubFormLvl('sub');
    const selCntnr = role === 'Subject' ? '#'+fLvl+'-form' : '#realm-lvls';
    customizeElemsForTaxonSelectForm(role);
    if (ifResettingTxn(role)) { resetPrevTaxonSelection($('#'+role+'-sel').val());
    } else { _cmbx.focusFirstCombobox(selCntnr); }
    _u.replaceSelOpts('#'+role+'-sel', []);
}
function ifResettingTxn(role) {  
    return $('#'+role+'-sel').val() || fP.forms.taxonPs.prevSel.reset;
}
export function enableTaxonLvls(disable) {
    const enable = disable == undefined ? true : false;
    $.each($('#sub-form select'), (i, sel) => _cmbx.enableCombobox('#'+sel.id, enable));
}