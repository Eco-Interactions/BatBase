/**
 * Checks all required citation fields, generates the citation, and sets the
 * disabled textarea field. Default text displays Until required fields are filled.
 *
 * Export
 *     buildCitTextAndUpdateField
 *
 * TOC
 *     GET CITATION TEXT
 *     GET ALL DATA FOR CITATION
 *     UPDATE FIELD
 */
import { _cmbx, _u } from '~util';
import { _elems, _state } from '~form';

export function buildCitTextAndUpdateField(fLvl) {                  /*dbug-log*///console.log('--buildCitTextAndUpdateField [%s]', fLvl);
    const $elem = $('#Description_f textarea');
    if (!$elem.val()) { initializeCitField($elem); }

    return getCitationFieldText($elem, fLvl)
        .then(citText => updateCitField(fLvl, citText, $elem))
}
function initializeCitField($elem) {
    $elem.prop('disabled', true).unbind('change').css({height: '6.6em'});
}
/* ------------------------ GET CITATION TEXT ------------------------------- */
/** Returns the citation field text or false if there are no updates. */
function getCitationFieldText($elem, fLvl) {
    const dfault = 'The citation will display here once all required fields are filled.';
    return Promise.resolve(getCitationText());

    function getCitationText() {
        return _elems('ifNoOpenSubFormAndAllRequiredFieldsFilled', [fLvl]) ?
            buildCitationText(fLvl) :
           ($elem.val() === dfault ? false : dfault);
    }
}
function ifNoChildFormOpen(fLvl) {
    const child = _state('getFormLevel', ['child', fLvl]);
   return $(`#${child}form`).length == 0;
}
function buildCitationText(fLvl) {                                  /*dbug-log*///console.log('--buildCitationText [%s]', fLvl);
    return _u('generateCitationText', [getDataForCitation(fLvl), true]);
}
/* -------------------- GET ALL DATA FOR CITATION --------------------------- */
function getDataForCitation(fLvl) {                                 /*dbug-log*///console.log('--getDataForCitation [%s]', fLvl);
    const fields = _state('getFormState', [fLvl, 'fields']);        /*dbug-log*///console.log('      --fields[%O]', fields);
    const data = {
        pubSrc: fields.ParentSource.misc.src,
        citSrc: { authors: fields.Author.value, year: fields.Year.value },
        cit: buildCitData(fields),
        showWarnings: true
    };                                                              /*dbug-log*///console.log('       --data[%O]', data);
    return { ...data, ...addEntityRecords() };
}
function buildCitData(fields) {                                     /*dbug-log*///console.log('--buildCitData [%O]', fields);
    return {
        citationType: { displayName: getCitationType(fields.CitationType.value) },
        title: fields.DisplayName.value,
        publicationPages: fields.Pages.shown ? fields.Pages.value : null,
        publicationIssue: fields.Issue.value,
        publicationVolume: getVolumeOrEdition(fields.Volume, fields.Edition),
    };
}
function getCitationType(val) {
    return val.text ? val.text : _cmbx('getSelTxt', ['CitationType']);
}
function getVolumeOrEdition(vol, ed) {
    return vol.value ? vol.value : ed.value;
}
function addEntityRecords() {
    const entities = ['author', 'citation', 'publisher', 'source'];
    return { rcrds: _state('getEntityRcrds', [entities])};
}
/* --------------------------- UPDATE FIELD --------------------------------- */
function updateCitField(fLvl, citText, $elem) {
    if (!citText) { return; }
    $elem.val(citText); //.change(); Why was this needed
    _state('setFieldState', [fLvl, 'Description', citText]);
}