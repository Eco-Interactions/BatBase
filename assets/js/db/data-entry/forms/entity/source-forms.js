/**
 *
 *
 *
 * Exports:             Imported by:
 *     getSrcTypeRows                   forms-maim
 *     handleCitText                    forms-main
 *     handleSpecialCaseTypeUpdates     forms-main
 *     loadSrcTypeFields                forms-main
 */
import * as _forms from '../forms-main.js';

/**
 * citTimeout - prevents citation text being generated multiple times.
 */
const app = {};

/* -------------------------- FACADE ---------------------------------------- */
export function getComboEvents(entity) {
    const events = {
        'Citation': {
            'CitationType': { add: false, change: loadCitTypeFields },
            'Authors': { add: initAuthForm.bind(null, 1), change: onAuthSelection },
        }, 
        'Publication': {
            'PublicationType': { change: loadPubTypeFields },
            'Publisher': { change: onPublSelection, add: initPublisherForm },
            'Authors': { add: initAuthForm.bind(null, 1), change: onAuthSelection },
            'Editors': { change: onEdSelection, add: initEdForm.bind(null, 1) }
        }
    };
    return events[entity] ? events[entity] : {}
}
// export function initAuthForm(val) {
//     _auth.initAuthForm(val);    
// }
// export function initEdForm(val) {
//     _auth.initEdForm(val);
// }
// export function onAuthSelection(val) {
//     _auth.onAuthSelection(val);    
// }
// export function onEdSelection(val) {
//     _auth.onEdSelection(val);    
// }
// export function initPubForm(val) {
//     _pub.initPubForm(val);
// }
// export function initPublisherForm(val) {
//     _publ.initPublisherForm(val);
// }

/*-------------- Publication ------------------------------------------------*/

/**
 * When a user enters a new publication into the combobox, a create-publication
 * form is built and appended to the interaction form. An option object is 
 * returned to be selected in the interaction form's publication combobox.
 */
export function initPubForm(value) {                                                   console.log('   --initPubForm [%s]', value); //console.log("Adding new pub! val = %s", value);
    const fLvl = getSubFormLvl('sub');
    const val = value === 'create' ? '' : value;
    if ($('#'+fLvl+'-form').length !== 0) { return _errs.openSubFormErr('Publication', null, fLvl); }
    initEntitySubForm('publication', fLvl, 'flex-row med-sub-form', {'Title': val}, 
        '#Publication-sel')
    .then(appendPubFormAndFinishBuild);
}
function appendPubFormAndFinishBuild(form) {
    $('#CitationTitle_row').after(form);
    _cmbx.initFormCombos('publication', 'sub', fP.forms.sub.selElems);
    $('#Title_row input').focus();
    form_ui.setCoreRowStyles('#publication_Rows', '.sub-row');
}
/**
 * Loads the deafult fields for the selected Publication Type. Clears any 
 * previous type-fields and initializes the selectized dropdowns.
 */
function loadPubTypeFields(typeId) {                                            console.log('           --loadPubTypeFields');
    const elem = this.$input[0];  
    return loadSrcTypeFields('publication', typeId, elem)
    .then(finishPubTypeFields);

    function finishPubTypeFields() {
        ifBookAddAuthEdNote();
        form_ui.setCoreRowStyles('#publication_Rows', '.sub-row');
    }
}
/** Shows the user a note above the author and editor elems. */
function ifBookAddAuthEdNote() {        
    if ($('#PublicationType-sel')[0].innerText !== 'Book') { return; }
    const note = _u.buildElem('div', { class: 'skipFormData' });
    $(note).html('<i>Note: there must be at least one author OR editor ' +
        'selected for book publications.</i>')
    $(note).css({'margin': 'auto'});
    $('#Authors_row').before(note);
}
/*-------------- Citation ------------------------------------------------*/
/** Returns a form row with an empty citation select dropdown. */
// function buildCitFieldRow() {                                                   console.log('       --buildCitFieldRow');
//     const selElem = _u.buildSelectElem([], {id: 'CitationTitle-sel', class: 'lrg-field'});
//     return _elems.buildFormRow('CitationTitle', selElem, 'top', true);
// }
// /** Fills the citation combobox with all citations for the selected publication. */
// function fillCitationField(pubId) {                                             //console.log("initCitSelect for publication = ", pubId);
//     _cmbx.enableCombobox('#CitationTitle-sel');
//     _cmbx.updateComboboxOptions('#CitationTitle-sel', getPubCitationOpts(pubId));
// }
// /** Returns an array of option objects with citations for this publication.  */
// function getPubCitationOpts(pubId) {
//     const pubRcrd = fP.records.source[pubId];  
//     if (!pubRcrd) { return [{ value: 'create', text: 'Add a new Citation...'}]; }
//     const opts = _elems.getRcrdOpts(pubRcrd.children, fP.records.source);
//     opts.unshift({ value: 'create', text: 'Add a new Citation...'});
//     return opts;
// }
// /** 
//  * When a Citation is selected, both 'top' location fields are initialized
//  * and the publication combobox is reenabled. 
//  */    
// function onCitSelection(val) {                                                  console.log('       --onCitSelection [%s]', val);
//     if (val === 'create') { return openCreateForm('CitationTitle'); }
//     if (val === '' || isNaN(parseInt(val))) { return form_ui.clearDetailPanel('cit', true); }                     //console.log("cit selection = ", parseInt(val));                          
//     form_ui.updateSrcDetailPanel('cit', fP.records.source);
//     if (!fP.editing) { $('#CitationTitle_pin').focus(); }
// }    
/** Shows the Citation sub-form and disables the publication combobox. */
export function initCitForm(v) {                                                       console.log("       --initCitForm [%s]", v);
    const fLvl = getSubFormLvl('sub');
    const val = v === 'create' ? '' : v;
    if ($('#'+fLvl+'-form').length !== 0) { return _errs.openSubFormErr('CitationTitle', '#CitationTitle-sel', fLvl); }
    initEntitySubForm('citation', fLvl, 'flex-row med-sub-form', {'Title': val}, 
        '#CitationTitle-sel')
    .then(appendCitFormAndFinishBuild.bind(null, fLvl));
    _u.getData(['author', 'publication']).then(data => addSourceDataToMemory(data));
}
function appendCitFormAndFinishBuild(fLvl, form) {                              console.log('           --appendCitFormAndFinishBuild');
    $('#CitationTitle_row').after(form);
    _cmbx.initFormCombos('citation', 'sub', fP.forms.sub.selElems);
    selectDefaultCitType(fLvl).then(finishCitFormUiLoad.bind(null, fLvl));
}
function finishCitFormUiLoad(fLvl) {
    _cmbx.enableCombobox('#Publication-sel', false);
    $('#Abstract_row textarea').focus();
    form_ui.setCoreRowStyles('#citation_Rows', '.sub-row');
    if (_elems.ifAllRequiredFieldsFilled(fLvl)) { enableSubmitBttn('#'+fLvl+'-submit'); }
}
function addSourceDataToMemory(data) {
    Object.keys(data).forEach(k => fP.records[k] = data[k]);
}
function selectDefaultCitType(fLvl) {
    return _u.getData('citTypeNames').then(setCitType.bind(null, fLvl));
}
function setCitType(fLvl, citTypes) {
    const pubType = fP.forms[fLvl].pub.pub.publicationType.displayName;
    const dfaults = {
        'Book': getBookDefault(pubType, fLvl), 'Journal': 'Article', 
        'Other': 'Other', 'Thesis/Dissertation': 'Ph.D. Dissertation' 
    };
    _cmbx.setSelVal('#CitationType-sel', citTypes[dfaults[pubType]]);
}
function getBookDefault(pubType, fLvl) {
    if (pubType !== 'Book') { return 'Book'; }
    const pubAuths = fP.forms[fLvl].pub.src.authors;
    return pubAuths ? 'Book' : 'Chapter';
}
/**
 * Adds relevant data from the parent publication into formVals before 
 * loading the default fields for the selected Citation Type. If this is an 
 * edit form, skip loading pub data... 
 */
function loadCitTypeFields(typeId) {                                            console.log('       --loadCitTypeFields');
    const fLvl = getSubFormLvl('sub');
    const elem = this.$input[0];
    if (!fP.editing) { handlePubData(typeId, elem, fLvl); }
    return loadSrcTypeFields('citation', typeId, elem)
    .then(finishCitTypeFields);

    function finishCitTypeFields() {
        handleSpecialCaseTypeUpdates(elem, fLvl);
        if (!app.citTimeout) { handleCitText(fLvl); }
        form_ui.setCoreRowStyles('#citation_Rows', '.'+fLvl+'-row');
    }
}
/**
 * Shows/hides the author field depending on whether the publication has authors 
 * already. Disables title field for citations that don't allow sub-titles.
 */
export function handleSpecialCaseTypeUpdates(elem, fLvl) {
    const type = elem.innerText;    
    const hndlrs = { 
        'Book': updateBookFields, 'Chapter': updateBookFields,
        "Master's Thesis": disableTitleField, 'Other': disableFilledFields,
        'Ph.D. Dissertation': disableTitleField };
        if (Object.keys(hndlrs).indexOf(type) === -1) { return; }
    hndlrs[type](type, fLvl);

    function updateBookFields() {
        const params = fP.forms[fLvl];                                          //console.log('params.pub.src = %O', JSON.parse(JSON.stringify(params.pub.src)));
        const pubAuths = params.pub.src.authors;      
        if (!pubAuths) { return showAuthorField(); }
        removeAuthorField();
        if (type === 'Book'){ disableTitleField()} else { enableTitleField()}

        function showAuthorField() {                                            //console.log('showing author field');
            if (!params.misc.authRow) { return; }
            $('#citation_Rows').append(params.misc.authRow);
            fP.forms[fLvl].reqElems.push(params.misc.authElem);
            delete fP.forms[fLvl].misc.authRow;
            delete fP.forms[fLvl].misc.authElem;
        }
        function removeAuthorField() {                                          //console.log('removing author field');
            let reqElems = params.reqElems;
            fP.forms[fLvl].misc.authRow = $('#Authors_row').detach();
            fP.forms[fLvl].reqElems = reqElems.filter(removeAuthElem);  

            function removeAuthElem(elem) {
                if (!elem.id.includes('Authors')) { return true; }
                params.misc.authElem = elem;                                
                return false;
            }
        } /* End removeAuthorField */
    } /* End updateBookFields */
    function disableFilledFields() {
        $('#Title_row input').prop('disabled', true);
        $('#Year_row input').prop('disabled', true);
        disableAuthorField();
    }
    function disableAuthorField() {
        $('#Authors-sel-cntnr')[0].lastChild.remove();
        _cmbx.enableComboboxes($('#Authors-sel-cntnr select'), false);
    }
    function disableTitleField() { 
        $('#Title_row input').prop('disabled', true);
    }
    function enableTitleField() {  
        $('#Title_row input').prop('disabled', false);
    }
} /* End handleSpecialCaseTypeUpdates */
/** Adds or removes publication data from the form's values, depending on type. */
function handlePubData(typeId, citTypeElem, fLvl) {
    const type = citTypeElem.innerText;                                     //console.log('citType = ', type);
    const copy = ['Book', "Master's Thesis", 'Museum record', 'Other', 
        'Ph.D. Dissertation', 'Report', 'Chapter' ];
    const addSameData = copy.indexOf(type) !== -1;
    addPubValues(fLvl, addSameData, type);
}
function addPubValues(fLvl, addValues, type) {
    addPubTitle(addValues, fLvl, type);
    addPubYear(addValues, fLvl);
    addAuthorsToCitation(addValues, fLvl, type);
}
/** 
 * Adds the pub title to the citations form vals, unless the type should 
 * be skipped, ie. have it's own title. (may not actually be needed. REFACTOR and check in later)
 */
function addPubTitle(addTitle, fLvl, type) {     
    const vals = fP.forms[fLvl].fieldConfg.vals;           
    const skip = ['Chapter']; 
    vals.Title = {};
    vals.Title.val = addTitle && skip.indexOf(type) === -1 ? 
        fP.forms[fLvl].pub.src.displayName : '';  
}
function addPubYear(addYear, fLvl) {  
    const vals = fP.forms[fLvl].fieldConfg.vals;                       
    vals.Year = {};
    vals.Year.val = addYear ? fP.forms[fLvl].pub.src.year : '';
}
function addAuthorsToCitation(addAuths, fLvl, type) { 
    const vals = fP.forms[fLvl].fieldConfg.vals;                                //console.log('addAuthorsToCitation ? %s, vals = %O', addAuths, vals);
    const pubAuths = fP.forms[fLvl].pub.src.authors;  
    if (addAuths && pubAuths) { return addExistingPubContribs(fLvl, pubAuths); }
}
/**
 * If the parent publication has existing authors, they are added to the new 
 * citation form's author field(s). 
 */
function addExistingPubContribs(fLvl, auths) {  
    const vals = fP.forms[fLvl].fieldConfg.vals;  
    vals.Authors = { type: "multiSelect" };
    vals.Authors.val = auths ? auths : (vals.length > 0 ? vals : null);
}
/**
 * Checks all required citation fields and sets the Citation Text field.
 * If all required fields are filled, the citation text is generated and 
 * displayed. If not, the default text is displayed in the disabled textarea.
 * Note: to prevent multiple rebuilds, a timeout is used.
 */
export function handleCitText(formLvl) {                                        //console.log('   --handleCitText')
    if (app.citTimeout) { return; }
    app.citTimeout = window.setTimeout(buildCitTextAndUpdateField, 500);

    function buildCitTextAndUpdateField() {                                     console.log('           --buildCitTextAndUpdateField')
        const fLvl = formLvl || getSubFormLvl('sub');
        const $elem = $('#CitationText_row textarea');
        if (!$elem.val()) { initializeCitField($elem); } 
        delete app.citTimeout;
        return getCitationFieldText($elem, fLvl)
        .then(updateCitField.bind(null, $elem));
    }
} 
function updateCitField($elem, citText) {  
    if (!citText) { return; }
    $elem.val(citText).change();
}                   
function initializeCitField($elem) {
    $elem.prop('disabled', true).unbind('change').css({height: '6.6em'});
}
/** Returns the citation field text or false if there are no updates. */
function getCitationFieldText($elem, fLvl) {
    const dfault = 'The citation will display here once all required fields '+
        'are filled.';
    return Promise.resolve(getCitationText());

    function getCitationText() {
        return ifNoChildFormOpen(fLvl) && _elems.ifAllRequiredFieldsFilled(fLvl) ? 
           buildCitationText(fP, fLvl) : ($elem.val() === dfault ? false : dfault);
    }
}
function ifNoChildFormOpen(fLvl) {  
    return $('#'+getNextFormLevel('child', fLvl)+'-form').length == 0; 
}
/** ----- Publication and Citation Shared form helpers ------------ */
/**
 * Loads the deafult fields for the selected Source Type's type. Clears any 
 * previous type-fields and initializes the selectized dropdowns. Updates 
 * any type-specific labels for fields.  
 * Eg, Pubs have Book, Journal, Dissertation and 'Other' field confgs.
 */
export function loadSrcTypeFields(subEntity, typeId, elem, typeName) {                 console.log('           --loadSrcTypeFields.');
    const fLvl = getSubFormLvl('sub');
    resetOnFormTypeChange(subEntity, typeId, fLvl);
    return getSrcTypeRows(subEntity, typeId, fLvl, typeName)
    .then(finishSrcTypeFormBuild);
        
    function finishSrcTypeFormBuild(rows) {
        $('#'+subEntity+'_Rows').append(rows);
        _cmbx.initFormCombos(subEntity, fLvl, fP.forms[fLvl].selElems);
        fillComplexFormFields(fLvl);
        _elems.checkReqFieldsAndToggleSubmitBttn(elem, fLvl);
        updateFieldLabelsForType(subEntity, fLvl);
        focusFieldInput(subEntity);
    }
}
function resetOnFormTypeChange(subEntity, typeId, fLvl) {  
    const capsType = _u.ucfirst(subEntity);   
    fP.forms[fLvl].fieldConfg.vals[capsType+'Type'].val = typeId;
    fP.forms[fLvl].reqElems = [];
    disableSubmitBttn('#'+fLvl+'-submit'); 
}
/**
 * Builds and return the form-field rows for the selected source type.
 * @return {ary} Form-field rows ordered according to the form config.
 */
export function getSrcTypeRows(entity, typeId, fLvl, type) {                           //console.log('getSrcTypeRows. type = ', type);
    const fVals = getCurrentFormFieldVals(fLvl);
    setSourceType(entity, typeId, fLvl, type); 
    $('#'+entity+'_Rows').empty();     
    return _elems.getFormFieldRows(entity, fVals, fLvl, fP);
}
/** Sets the type confg for the selected source type in form params. */
function setSourceType(entity, id, fLvl, tName) {
    const typeElemId = '#'+_u.ucfirst(entity)+'Type-sel'; 
    const type = tName || _cmbx.getSelTxt(typeElemId);
    _forms.memory('setFormMemory', [fLvl, 'entityType', type]);
}
/**
 * Changes form-field labels to more specific and user-friendly labels for 
 * the selected type. 
 */
function updateFieldLabelsForType(entity, fLvl) {                               //console.log('--updating field labels.');
    const typeElemId = '#'+_u.ucfirst(entity)+'Type-sel'; 
    const type = $(typeElemId)[0].innerText;
    const trans = getLabelTrans();  
    const fId = '#'+fLvl+'-form';

    for (let field in trans) {                                                  //console.log('updating field [%s] to [%s]', field, trans[field]);
        const $lbl = $(fId+' label:contains('+field+')'); 
        $lbl.text(trans[field]);
        if ($(fId+' [id^='+field+'-sel]').length) { 
            updateComboText($lbl[0], field, trans[field]); 
        }
    }
    function getLabelTrans() {
        const trans =  {
            'publication': {
                'Thesis/Dissertation': { 'Publisher': 'Publisher / University' }
            },
            'citation': {
                'Book': {'Volume': 'Edition'}, 
                'Chapter': {'Title': 'Chapter Title'},
            }
        };
        return trans[entity][type];  
    }
    function updateComboText(lblElem, fieldTxt, newTxt) { 
        return lblElem.nextSibling.id.includes('-cntnr') ?
            updateAllComboPlaceholders($('#'+fieldTxt+'-sel-cntnr')[0]) :
            updatePlaceholderText($('#'+fieldTxt+'-sel')[0], newTxt);

        function updateAllComboPlaceholders(cntnrElem) {
            for (let $i = 0; $i < cntnrElem.children.length; $i++) {            //console.log('cntnr child = %O', cntnrElem.children[$i]);
                if (cntnrElem.children[$i].tagName !== 'SELECT') {continue}
                updatePlaceholderText(cntnrElem.children[$i], newTxt);   
            }
        }    
    } /* End updateComboboxText */
} /* End updateFieldLabelsForType */
function updatePlaceholderText(elem, newTxt) {                                  //console.log('updating placeholder text to [%s] for elem = %O', newTxt, elem);
    elem.selectize.settings.placeholder = 'Select ' + newTxt;
    elem.selectize.updatePlaceholder();
}
function focusFieldInput(type) {
    if (!$('#Title_row input').val()) { $('#Title_row input').focus() 
    } else {
        _cmbx.focusCombobox('#'+_u.ucfirst(type)+'Type-sel', true);
    }
}