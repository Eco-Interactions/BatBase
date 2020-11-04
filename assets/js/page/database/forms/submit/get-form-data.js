/**
 * Returns an object with (k) the form field and (v) value.
 *
 * Export
 *     getValidatedFormData
 */
import { _db } from '~util';
import { _u } from '~db';
import { _state, getSelectedVals } from '../forms-main.js';

let fS; //form state

/**
 * Loops through all rows in the form with the passed id and returns an object
 * of the form values. Entity data not contained in an input on the form is
 * added @handleAdditionalEntityData.
 */
export function getValidatedFormData(entity, fLvl, submitting = false) {
    fS = _state('getFormState');                                         //console.log('           --getValidatedFormData. [%s]', entity);
    const elems = getFormFieldElems(entity, fLvl);
    const fVals = {};
    for (let i = 0; i < elems.length; i++) { getInputData(elems[i]); }
    if (fVals.displayName) { fVals.displayName = _u('ucfirst', [fVals.displayName]) }
    return handleAdditionalEntityData(entity)
        .then(() => fVals);

    /** Get's the value from the form elem and set it into fVals. */
    function getInputData(elem) {
        if (elem.className.includes('skipFormData')) { return; }                //console.log("elem = %O", elem)
        if (elem.className.includes('cntnr-row')) { return getMultiFieldRowData(elem); }
        const fieldName = getInputFieldNameFromCntnr(elem.children[1]);
        const input = elem.children[1].children[1];                             //console.log("           --get[%s]InputData = %O", fieldName, input);
        fVals[fieldName] = parseFieldData();                                 //console.log('[%s] = [%s]', fieldName, fVals[fieldName]);

        /**
         * Returns the input value from specialized parsing methods or trims the
         * field value and returns the value, with numbers parsed as integers.
         */
        function parseFieldData () {
            const val = $(input).data('inputType') ?
                getInputVals(fieldName, input, $(input).data('inputType')) :
                input.value.trim() || null;
            return Number.isInteger(val) ? parseInt(val) : val;
        }
    }
    function getInputFieldNameFromCntnr(cntnr) {
        let field = removeInfoTextFromLabel(cntnr.children[0].innerText);
        return _u('lcfirst', [field.trim().split(" ").join("")]);
    }
    function removeInfoTextFromLabel (text) {
        return text.split(' (m)')[0].split(' (Bat)')[0];
    }
    function getMultiFieldRowData(cntnr) {
        cntnr.children.forEach(fieldElem => getInputData(fieldElem));
    }
    /** Edge case input type values are processed via their type handlers. */
    function getInputVals(fieldName, input, type) {
        const typeHandlers = {
            'multiSelect': getSelectedVals, 'tags': getTagVals
        };
        return typeHandlers[type](input, fieldName);
    }
    /** Adds an array of tag values. */
    function getTagVals(input, fieldName) {
        return _u('getSelVal', [_u('ucfirst', [fieldName])]);
    }
    function handleAdditionalEntityData(entity) {
        if (!submitting) { return Promise.resolve(); }
        const dataHndlrs = {
            'author': [ getAuthFullName, getAuthDisplayName ],
            'editor': [ getAuthFullName, getAuthDisplayName ],
            'citation': [ getPublicationData, addCitDisplayName, ifFullWorkCited,
                addContributorData ],
            'interaction': [ handleUnspecifiedLocs ],
            'location': [ addElevUnits, padLatLong, getLocType ],
            'publication': [ addContributorData ],
            'taxon': [ getTaxonRankData ],
        };
        if (!dataHndlrs[entity]) { return Promise.resolve(); }
        return Promise.all(dataHndlrs[entity].map(func => Promise.resolve(func())));
    }
    /** ---- Additional Author data ------ */
    /** Concatonates all Author name fields and adds it as 'fullName' in fVals. */
    function getAuthFullName() {
        const names = ['firstName', 'middleName', 'lastName', 'suffix'];
        fVals.fullName = names.map(f => fVals[f]).filter(n=>n).join(' ')
    }
    /** Concats author Last, First Middle Suffix as the author display name.*/
    function getAuthDisplayName() {
        const names = ['firstName','middleName','suffix'].map(getName).filter(n=>n).join(' ');
        fVals.displayName = fVals.lastName + (!!names ? ', '+names : '');

        function getName(field) {
            return fVals[field];
        }
    }
    /** ---- Additional Citation data ------ */
    function getPublicationData() {
        fVals.publication = fS.editing ?
            fS.forms[fLvl].rcrds.src.id : $('#sel-Publication').val();
    }
    /** Adds 'displayName', which will be added to both the form data objects. */
    function addCitDisplayName() {
        fVals.displayName = fVals.title ? fVals.title : fVals.chapterTitle;
    }
    /**
     * Appends '(citation)' to citations that are attributed to entire books
     * to maintain unique display names for both the publication and its citation.
     */
    function ifFullWorkCited() {
        const type = $('#sel-CitationType option:selected').text();
        const fulls = ['Book', "Master's Thesis", 'Museum record', 'Other',
            'Ph.D. Dissertation', 'Report' ];
        if (fulls.indexOf(type) === -1) { return; }
        const pubTitle = fS.forms[fLvl].rcrds.src.displayName;
        if (fVals.displayName.includes('(citation)')) { return; }
        if (pubTitle != fVals.displayName) { return; }
        fVals.displayName += '(citation)';
    }
    /** ---- Additional Location data ------ */
    /** Adds the elevation unit abbrevation, meters, if an elevation was entered. */
    function addElevUnits() {
        if (fVals.elevation) { fVals.elevUnitAbbrv = 'm'; }
    }
    /** Pads each to the 13 scale set by the db. This eliminates false change flags. */
    function padLatLong() {
        if (fVals.latitude) {
            fVals.latitude = parseFloat(fVals.latitude).toFixed(14);
        }
        if (fVals.longitude) {
            fVals.longitude = parseFloat(fVals.longitude).toFixed(14);
        }
    }
    /**
     * Sets location type according to the most specific data entered.
     * "Point": if there is lat/long data. "Area" otherwise.
     */
    function getLocType() {
        return _db('getData', ['locTypeNames']).then(locTypes => {
            const type = fVals.longitude || fVals.latitude ? 'Point' : 'Area';
            fVals.locationType = locTypes[type];
        });
    }
    /**
     * If no location is selected for an interaction record, the country field
     * is checked for a value. If set, it is added as the interaction's location;
     * if not, the 'Unspecfied' location is added.
     */
    function handleUnspecifiedLocs(entity) {
        if (fVals.location) { return; }
        if (fVals.country) { return getUnspecifiedLocId(); }
        fVals.location = fVals.country;
    }
    /** Returns the id of the Unspecified region. */
    function getUnspecifiedLocId() {
        return _db('getData', ['topRegionNames'])
            .then(regions => regions['Unspecified']);
    }
    /** ---- Additional Publication data ------ */
    /**
     * Builds contributor object with all contributing authors and editors,
     * distinguished by an isEditor flag.
     */
    function addContributorData() {
        if (!fVals.contributor) { fVals.contributor = {}; }
        if (fVals.editors) { addContribs(fVals.editors, true); }
        if (fVals.authors) { addContribs(fVals.authors, false); }

        function addContribs(vals, isEd) {                                      //console.log('addContributorData. editors ? [%s] fVals = %O', isEd, vals)
            for (let ord in vals) {
                let id = vals[ord];
                fVals.contributor[id] = { isEditor: isEd, ord: ord };
            }
        }
    } /* End addContributorData */
    /** ---- Additional Taxon data ------ */
    function getTaxonRankData() {
        const formTaxonRank = fS.forms.taxonData.formTaxonRank;
        fVals.parentTaxon = getParentTaxon(formTaxonRank);
        fVals.rank = formTaxonRank;
    }
    /** -------------------- Additional Taxon Data -----------------------*/
    /**
     * Checks each parent-rank combo for a selected taxon. If none, the group
     * taxon is added as the new Taxon's parent.
     */
    function getParentTaxon(rank) {
        const ranks = Object.keys(fS.forms.taxonData.ranks);
        const parentRank = ranks[ranks.indexOf(rank)-1];
        if (ifParentIsRootTaxon(rank, parentRank)) {
            return fS.forms.taxonData.groupTaxon.id;
        }
        return $('#sel-'+parentRank).val() || getParentTaxon(parentRank);

        function ifParentIsRootTaxon(rank, parentRank) {
            const subGroupRank = fS.forms.taxonData.groupTaxon.rank.displayName;
            return rank === subGroupRank || !parentRank;
        }
    }
}
/** Taxon edit forms can potentially have nested create forms. */
function getFormFieldElems(entity, fLvl) {
    let id = '#' + entity + '_Rows';
    if ($(id+'_'+fLvl).length) { id = id + '_' + fLvl; }
    return $(id)[0].children;
}
// function checkForErrors(entity, fVals, fLvl) {
//     const errs = { author: checkDisplayNameForDups, editor: checkDisplayNameForDups };
//     if (!errs[entity]) { return; }
//     errs[entity](entity, fVals, fLvl);
// }
// /**
//  * Checks to ensure the new author's name doesn't already exist in the database.
//  * If it does, a prompt is given to the user to check to ensure they are not
//  * creating a duplicate, and to add initials if they are sure this is a new author.
//  */
// function checkDisplayNameForDups(entity, vals, fLvl) {                          //console.log('checkDisplayNameForDups [%s] vals = %O', entity, vals);
//     if (fS.action === 'edit') { return; }
//     const cntnr = $('#sel-'+_u('ucfirst', [entity])+'s1')[0];
//     const opts = cntnr.selectize.options;
//     const dup = checkForDuplicate(opts, vals.displayName);
//     if (!dup) { return; }
//     _val.showFormValAlert('FirstName', 'dupAuth', fLvl);
//     vals.err = true;
// }
// function checkForDuplicate(opts, name) {
//     const newName = name.replace(/\./g,'').toLowerCase();
//     const optKeys = Object.keys(opts);
//     return optKeys.find(k => {
//         let optName = opts[k].text.replace(/\./g,'').toLowerCase();
//         return optName == newName
//     });
// }