/**
 * Returns an object with (k) the form field and (v) value.
 *
 * Exports:             Imported by: 
 *     getValidatedFormData         db-forms
 */
import * as _i from '../forms-main.js';

let mmry;

/**
 * Loops through all rows in the form with the passed id and returns an object 
 * of the form values. Entity data not contained in an input on the form is 
 * added @handleAdditionalEntityData.
 */
export default function getValidatedFormData(entity, fLvl, submitting) {
    mmry = _i.mmry('getAllFormMemory');                                         //console.log('           --getValidatedFormData. [%s]', entity);
    const elems = $('#'+entity+'_Rows')[0].children;                            
    const formVals = {};
    for (let i = 0; i < elems.length; i++) { getInputData(elems[i]); }  
    if (formVals.displayName) { formVals.displayName = _i.util('ucfirst', [formVals.displayName]) }
    return handleAdditionalEntityData(entity)
        .then(returnFormVals);

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
        const field = cntnr.children[0];
        return _i.util('lcfirst', [field.innerText.trim().split(" ").join("")]); 
    }
    function getMultiFieldRowData(cntnr) {
        cntnr.children.forEach(fieldElem => getInputData(fieldElem));
    }
    /** Edge case input type values are processed via their type handlers. */
    function getInputVals(fieldName, input, type) {
        const typeHandlers = {
            'multiSelect': _i.getSelectedVals, 'tags': getTagVals
        };
        return typeHandlers[type](input, fieldName);
    }
    /** Adds an array of tag values. */
    function getTagVals(input, fieldName) {                                 
        return _i.cmbx('getSelVal', ['#'+_i.util('ucfirst', [fieldName])+'-sel']);
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
            'taxon': [ getTaxonData ],
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
            if (namePiece.length === 1) { namePiece += '.'; }
            displayName += ' '+namePiece; 
         } 
    } /* End getAuthDisplayName */
    /** ---- Additional Citation data ------ */
    function getPublicationData() {
        formVals.publication = mmry.editing ? 
            mmry.forms[fLvl].rcrds.src.id : $('#Publication-sel').val();
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
        const type = $('#CitationType-sel option:selected').text();
        const fulls = ['Book', "Master's Thesis", 'Museum record', 'Other', 
            'Ph.D. Dissertation', 'Report' ];
        if (fulls.indexOf(type) === -1) { return; }
        const pubTitle = mmry.forms[fLvl].rcrds.src.displayName;
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
        return _i.util('getData', ['locTypeNames']).then(locTypes => {
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
        return _i.util('getData', ['topRegionNames'])
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
    function getTaxonData() {
        const formTaxonLvl = mmry.forms.taxonPs.formTaxonLvl;
        formVals.parentTaxon = getParentTaxon(formTaxonLvl);
        formVals.level = formTaxonLvl;
    }
    /** -------------------- Additional Taxon Data -----------------------*/ 
    /**
     * Checks each parent-level combo for a selected taxon. If none, the realm
     * taxon is added as the new Taxon's parent.
     */
    function getParentTaxon(lvl) {
        var lvls = mmry.forms.taxonPs.lvls;
        var parentLvl = lvls[lvls.indexOf(lvl)-1];
        if ($('#'+parentLvl+'-sel').length) { 
            return $('#'+parentLvl+'-sel').val() || getParentTaxon(parentLvl);
        } 
        return mmry.forms.taxonPs.realmTaxon.id;
    }
    function returnFormVals() {  
        checkForErrors(entity, formVals, fLvl);  
        return formVals.err ? Promise.reject() : Promise.resolve(formVals);
    }
} /* End getValidatedFormData */
function checkForErrors(entity, formVals, fLvl) {
    const errs = { author: checkDisplayNameForDups, editor: checkDisplayNameForDups };
    if (!errs[entity]) { return; }
    errs[entity](entity, formVals, fLvl);
}
/**
 * Checks to ensure the new author's name doesn't already exist in the database. 
 * If it does, a prompt is given to the user to check to ensure they are not 
 * creating a duplicate, and to add initials if they are sure this is a new author. 
 */
function checkDisplayNameForDups(entity, vals, fLvl) {                          //console.log('checkDisplayNameForDups [%s] vals = %O', entity, vals);
    if (mmry.action === 'edit') { return; }
    const cntnr = $('#'+_i.util('ucfirst', [entity])+'s-sel1')[0];
    const opts = cntnr.selectize.options;  
    const dup = checkForDuplicate(opts, vals.displayName);  
    if (!dup) { return; }
    _i.err.reportFormFieldErr('FirstName', 'dupAuth', fLvl);
    vals.err = true;
}
function checkForDuplicate(opts, name) {  
    const newName = name.replace(/\./g,'').toLowerCase(); 
    const optKeys = Object.keys(opts);
    return optKeys.find(k => {
        let optName = opts[k].text.replace(/\./g,'').toLowerCase(); 
        return optName == newName
    });
}