/**
 * Handles exiting the root|sub form-containers.
 *
 * Export
 *     exitRootForm
 *     exitSubForm
 *
 */
import { _filter, _table } from '~db';
import { _elems, _state, clearFormMemory } from '~form';
/* ------------------------ ROOT-FORM --------------------------------------- */
/** Returns popup and overlay to their original/default state. */
export function exitRootForm(e, skipReset) {                       /*perm-log*/console.log('           --exitRootForm')
    hideSearchFormPopup();
    if (!skipReset) { refocusTableIfFormWasSubmitted(); }
    $('#b-overlay').removeClass('form-ovrly');
    $('#b-overlay-popup').removeClass('form-popup');
    $('#b-overlay-popup').empty();
    clearFormMemory();
}
function hideSearchFormPopup() {
    $('#b-overlay').css({display: 'none'});
}
/**
 * If the form was not submitted the table does not reload. Otherwise, if exiting
 * the edit-forms, the table will reload with the current focus; or, after creating
 * an interaction, the table will refocus into source-view. Exiting the interaction
 * forms also sets the 'int-updated-at' filter to 'today'.
 */
function refocusTableIfFormWasSubmitted() {
    const confg = _state('getFormState', ['top']);                  /*dbug-log*///console.log('refocusTableIfFormWasSubmitted');
    if (!confg.submit) { return; }
    if (confg.name === 'Interaction') { return refocusAndShowUpdates(); }
    _table('reloadTableWithCurrentFilters');
}
function refocusAndShowUpdates() {                                  /*dbug-log*///console.log('refocusAndShowUpdates.')
    if (_state('getFormState', ['top', 'action']) === 'create') {
        _filter('showTodaysUpdates', ['srcs']);
    } else {
        _table('reloadTableWithCurrentFilters');
    }
}
/* ------------------------- SUB-FORM --------------------------------------- */
/**
 * Removes the form container with the passed id, clears and enables the combobox,
 * and contextually enables to parent form's submit button. Calls the exit
 * handler stored in the form's params object.
 */
export function exitSubForm(fLvl, focus, onExit, data) {
    const exitFunc = onExit || _state('getFormState', [fLvl, 'onFormClose']);
    $(`#${fLvl}-form`).remove();                                   /*perm-log*/console.log("               --exitSubForm fLvl = %s, onExit = %O", fLvl, exitFunc);
    _elems('resetFormCombobox', [fLvl, !!focus]);
    if (exitFunc) { exitFunc(data); }
}