/**
 * Returns an object with (k) the form field and (v) value.
 *
 * Export
 *     getValidatedFormData
 */
import { _u } from '../../db-main.js';
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
    const formVals = {};
    for (let i = 0; i < elems.length; i++) { getInputData(elems[i]); }
    if (formVals.displayName) { formVals.displayName = _u('ucfirst', [formVals.displayName]) }
    return handleAdditionalEntityData(entity)
        .then(() => formVals);

    /** Get's the value from the form elem and set it into formVals. */
    function getInputData(elem) {
        if (elem.className.includes('skipFormData')) { return; }                //console.log("elem = %O", elem)
        if (elem.className.includes('cntnr-row')) { return getMultiFieldRowData(elem); }
        const fieldName = getInputFieldNameFromCntnr(elem.children[1]);
        const input = elem.children[1].children[1];                             //console.log("           --get[%s]InputData = %O", fieldName, input);
        formVals[fieldName] = parseFieldData();                                 //console.log('[%s] = [%s]', fieldName, formVals[fieldName]);

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
    /** Concatonates all Author name fields and adds it as 'fullName' in formVals. */
    function getAuthFullName() {
        const nameFields = ['firstName', 'middleName', 'lastName', 'suffix'];
        const fullName = [];
        nameFields.forEach(function(field) {
            if (formVals[field]) { fullName.push(formVals[field]) };
        });
        formVals.fullName = fullName.join(" ");
    }
    /** Concats author Last, First Middle Suffix as the author display name.*/
    function getAuthDisplayName() {
        let displayName = formVals.lastName + ',';
        ["firstName", "middleName", "suffix"].forEach(name => {
            if (formVals[name]) { addToDisplayName(formVals[name]); };
        });
        formVals.displayName = displayName;

        function addToDisplayName(namePiece) {
            displayName += ' '+namePiece;
         }
    } /* End getAuthDisplayName */
    /** ---- Additional Citation data ------ */
    function getPublicationData() {
        formVals.publication = fS.editing ?
            fS.forms[fLvl].rcrds.src.id : $('#sel-Publication').val();
    }
    /** Adds 'displayName', which will be added to both the form data objects. */
    function addCitDisplayName() {
        formVals.displayName = formVals.title ? formVals.title : formVals.chapterTitle;
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
        if (formVals.displayName.includes('(citation)')) { return; }
        if (pubTitle != formVals.displayName) { return; }
        formVals.displayName += '(citation)';
    }
    /** ---- Additional Location data ------ */
    /** Adds the elevation unit abbrevation, meters, if an elevation was entered. */
    function addElevUnits() {
        if (formVals.elevation) { formVals.elevUnitAbbrv = 'm'; }
    }
    /** Pads each to the 13 scale set by the db. This eliminates false change flags. */
    function padLatLong() {
        if (formVals.latitude) {
            formVals.latitude = parseFloat(formVals.latitude).toFixed(14);
        }
        if (formVals.longitude) {
            formVals.longitude = parseFloat(formVals.longitude).toFixed(14);
        }
    }
    /**
     * Sets location type according to the most specific data entered.
     * "Point": if there is lat/long data. "Area" otherwise.
     */
    function getLocType() {
        return _u('getData', ['locTypeNames']).then(locTypes => {
            const type = formVals.longitude || formVals.latitude ? 'Point' : 'Area';
            formVals.locationType = locTypes[type];
        });
    }
    /**
     * If no location is selected for an interaction record, the country field
     * is checked for a value. If set, it is added as the interaction's location;
     * if not, the 'Unspecfied' location is added.
     */
    function handleUnspecifiedLocs(entity) {
        if (formVals.location) { return; }
        if (formVals.country) { return getUnspecifiedLocId(); }
        formVals.location = formVals.country;
    }
    /** Returns the id of the Unspecified region. */
    function getUnspecifiedLocId() {
        return _u('getData', ['topRegionNames'])
            .then(regions => regions['Unspecified']);
    }
    /** ---- Additional Publication data ------ */
    /**
     * Builds contributor object with all contributing authors and editors,
     * distinguished by an isEditor flag.
     */
    function addContributorData() {
        if (!formVals.contributor) { formVals.contributor = {}; }
        if (formVals.editors) { addContribs(formVals.editors, true); }
        if (formVals.authors) { addContribs(formVals.authors, false); }

        function addContribs(vals, isEd) {                                      //console.log('addContributorData. editors ? [%s] formVals = %O', isEd, vals)
            for (let ord in vals) {
                let id = vals[ord];
                formVals.contributor[id] = { isEditor: isEd, ord: ord };
            }
        }
    } /* End addContributorData */
    /** ---- Additional Taxon data ------ */
    function getTaxonRankData() {
        const formTaxonRank = fS.forms.taxonData.formTaxonRank;
        formVals.parentTaxon = getParentTaxon(formTaxonRank);
        formVals.rank = formTaxonRank;
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
// function checkForErrors(entity, formVals, fLvl) {
//     const errs = { author: checkDisplayNameForDups, editor: checkDisplayNameForDups };
//     if (!errs[entity]) { return; }
//     errs[entity](entity, formVals, fLvl);
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