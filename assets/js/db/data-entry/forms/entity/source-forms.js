/**
 * Source form code: Authors, Citations, Publication, and Publisher
 *
 * Code Sections:
 *     PUBLICATION
 *     CITATION
 *         TYPE-SPECIFIC UPDATES
 *         AUTO-GENERATE CITATION
 *     SHARED PUBLICATION AND CITATION HELPERS
 *     AUTHOR
 *         AUTHOR SELECTION
 *         AUTHOR CREATE
 *     UI HELPERS
 *
 * Exports:             Imported by: forms-main
 *     finishSourceToggleAllFields
 *     getSrcTypeRows                   
 *     handleCitText                    
 *     handleSpecialCaseTypeUpdates     
 *     initCreateForm
 *     loadSrcTypeFields                
 *     selectExistingAuthors
 */
import * as _forms from '../forms-main.js';

let timeout = null; //Prevents citation text being generated multiple times.
const _cmbx = _forms.uiCombos;
const _elems = _forms.uiElems;
const _errs = _forms.err;
const _mmry = _forms.memory;
const _ui = _forms.ui;
const _u = _forms._util;

export function initCreateForm(entity) {
    const funcs = {
        'author': initAuthForm, 
        'editor': initEdForm,
        'citation': initCitForm,
        'publication': initPubForm,
        'publisher': initPublisherForm
    };
    funcs[entity]();
}
/* ========================== PUBLICATION =================================== */
/**
 * When a user enters a new publication into the combobox, a create-publication
 * form is built and appended to the interaction form. An option object is 
 * returned to be selected in the interaction form's publication combobox.
 */
function initPubForm(value) {                                                   console.log('       /--initPubForm [%s]', value); 
    const fLvl = _forms.getSubFormLvl('sub');
    if ($('#'+fLvl+'-form').length !== 0) { 
        return _errs('openSubFormErr', ['Publication', null, fLvl]); 
    }
    const val = value === 'create' ? '' : value;
    initPubMemory(fLvl);
    buildAndAppendPubForm(val, fLvl);
}
function initPubMemory(fLvl) {
    _mmry('initEntityFormMemory', ['publication', 'sub', '#Publication-sel', 'create']);
    _mmry('setonFormCloseHandler', [fLvl, enablePubField]);
}
function buildAndAppendPubForm(val, fLvl) {
    _elems('initSubForm', 
        [fLvl, 'med-sub-form', {'Title': val}, '#Publication-sel']) 
    .then(appendPubFormAndFinishBuild);
}
function appendPubFormAndFinishBuild(form) {  console.log('form = %O', form)
    $('#CitationTitle_row')[0].parentNode.after(form); 
    _cmbx('initFormCombos', ['publication', 'sub', getPubComboEvents()]);
    $('#Title_row input').focus();
    _ui('setCoreRowStyles', ['#publication_Rows', '.sub-row']);
}
function getPubComboEvents() {  
    return {
        'PublicationType': { change: loadPubTypeFields },
        'Publisher': { change: onPublSelection, add: initPublisherForm },
        'Authors': { add: initAuthForm.bind(null, 1), change: onAuthSelection },
        'Editors': { change: onEdSelection, add: initEdForm.bind(null, 1) }
    }
}
/**
 * Loads the deafult fields for the selected Publication Type. Clears any 
 * previous type-fields and initializes the selectized dropdowns.
 */
function loadPubTypeFields(typeId) {                                            console.log('           /--loadPubTypeFields');
    const elem = this.$input[0];  
    return loadSrcTypeFields('publication', typeId, elem)
        .then(finishPubTypeFields);

    function finishPubTypeFields() {
        ifBookAddAuthEdNote();
        _ui('setCoreRowStyles', ['#publication_Rows', '.sub-row']);
    }
}
/** Shows the user a note above the author and editor elems. */
function ifBookAddAuthEdNote() {        
    if ($('#PublicationType-sel')[0].innerText !== 'Book') { return; }
    const note = _u('buildElem', ['div', { class: 'skipFormData' }]);
    $(note).html('<i>Note: there must be at least one author OR editor ' +
        'selected for book publications.</i>')
    $(note).css({'margin': 'auto'});
    $('#Authors_row')[0].parentNode.before(note);
}
/* ========================== CITATION ====================================== */
/** Shows the Citation sub-form and disables the publication combobox. */
function initCitForm(v) {                                                       console.log("       /--initCitForm [%s]", v);
    const fLvl = _forms.getSubFormLvl('sub');
    if ($('#'+fLvl+'-form').length !== 0) { 
        return _errs('openSubFormErr', ['CitationTitle', '#CitationTitle-sel', fLvl]); 
    }
    const val = v === 'create' ? '' : v;
    _u('getData', [['author', 'publication']])
    .then(data => initCitFormMemory(data, fLvl))
    .then(() => buildAndAppendCitForm(val, fLvl));
}
function initCitFormMemory(data, fLvl) {
    addSourceDataToMemory(data, fLvl);
    _mmry('initEntityFormMemory', ['citation', fLvl, '#CitationTitle-sel', 'create']);
    _mmry('setonFormCloseHandler', [fLvl, enablePubField]);
    addPubRcrdsToMemory(data.publication, fLvl);
    return Promise.resolve();
}
function addSourceDataToMemory(data, fLvl) {
    const records = _mmry('getMemoryProp', ['records']);
    Object.keys(data).forEach(k => records[k] = data[k]);
    _mmry('setMemoryProp', ['records', records]);
}
function addPubRcrdsToMemory(pubRcrds, fLvl) {
    const pubSrc = getSrcRcrd($('#Publication-sel').val()); 
    const pub = pubRcrds[pubSrc.publication];
    _mmry('setFormProp', [fLvl, 'rcrds', { pub: pub, src: pubSrc}]);
}
function getSrcRcrd(pubId) {
    if (pubId) { return _mmry('getRcrd', ['source', pubId]); } //When not editing citation record.
    const rcrd = _mmry('getRcrd', ['source', fP.editing.core]);
    return _mmry('getRcrd', ['source', rcrd.parent]);
}
function buildAndAppendCitForm(val, fLvl) {
    initCitSubForm(val, fLvl)
    .then(form => appendCitFormAndFinishBuild(form, fLvl));
}
function initCitSubForm(val, fLvl) {
    return _elems('initSubForm', 
        [fLvl, 'med-sub-form', {'Title': val}, '#CitationTitle-sel']); 
}
function appendCitFormAndFinishBuild(form, fLvl) {                              //console.log('           --appendCitFormAndFinishBuild');
    $('#CitationTitle_row')[0].parentNode.after(form);
    _cmbx('initFormCombos', ['citation', 'sub', getCitComboEvents()]);
    selectDefaultCitType(fLvl)
    .then(() => finishCitFormUiLoad(fLvl));
}
function getCitComboEvents() {
    return {
        'CitationType': { add: false, change: loadCitTypeFields },
        'Authors': { add: initAuthForm.bind(null, 1), change: onAuthSelection },
    };
}
function finishCitFormUiLoad(fLvl) {
    _cmbx('enableCombobox', ['#Publication-sel', false]);
    $('#Abstract_row textarea').focus();
    _ui('setCoreRowStyles', ['#citation_Rows', '.sub-row']);
    if (_elems('ifAllRequiredFieldsFilled', [fLvl])) { 
        _ui('toggleSubmitBttn', ['#'+fLvl+'-submit']); 
    }
}
function selectDefaultCitType(fLvl) {
    return _u('getData', ['citTypeNames'])
        .then(types => setCitType(fLvl, types));
}
function setCitType(fLvl, citTypes) {
    const rcrds = _mmry('getFormProp', ['rcrds', fLvl]);
    const pubType = rcrds.pub.publicationType.displayName;                      
    const defaultType = {
        'Book': getBookDefault(pubType, rcrds, fLvl), 'Journal': 'Article', 
        'Other': 'Other', 'Thesis/Dissertation': 'Ph.D. Dissertation' 
    }[pubType];
    _cmbx('setSelVal', ['#CitationType-sel', citTypes[defaultType]]);
}
function getBookDefault(pubType, rcrds, fLvl) {
    if (pubType !== 'Book') { return 'Book'; }
    const pubAuths = rcrds.src.authors;  
    return pubAuths ? 'Book' : 'Chapter';
}
/**
 * Adds relevant data from the parent publication into formVals before 
 * loading the default fields for the selected Citation Type. If this is an 
 * edit form, skip loading pub data... 
 */
function loadCitTypeFields(typeId) {                                            console.log('       /--loadCitTypeFields');
    const fLvl = _forms.getSubFormLvl('sub');
    const elem = this.$input[0];
    if (!_mmry('isEditForm')) { handlePubData(typeId, elem, fLvl); }
    return loadSrcTypeFields('citation', typeId, elem)
        .then(finishCitTypeFields);

    function finishCitTypeFields() {
        handleSpecialCaseTypeUpdates(elem, fLvl);
        if (!timeout) { handleCitText(fLvl); }
        _ui('setCoreRowStyles', ['#citation_Rows', '.'+fLvl+'-row']);
    }
}
/* ------------------------ TYPE-SPECIFIC UPDATES --------------------------- */
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
        const params = _mmry('getFormMemory', [fLvl]);                          
        const pubAuths = params.rcrds.src.authors;      
        if (!pubAuths) { return showAuthorField(); }
        removeAuthorField();
        if (type === 'Book'){ disableTitleField()} else { enableTitleField()}

        function showAuthorField() {                                            
            if (!params.misc.authRow) { return; }
            $('#citation_Rows').append(params.misc.authRow);
            addRequiredFieldInput(fLvl, params.misc.authElem);
            delete params.misc.authRow;
            delete params.misc.authElem;
        }
        function removeAuthorField() {                                          
            params.misc.authRow = $('#Authors_row').detach();
            params.reqElems = params.reqElems.filter(removeAuthElem);  

            function removeAuthElem(elem) {
                if (!elem.id.includes('Authors')) { return true; }
                params.misc.authElem = elem;                                
                return false;
            }
        } 
    } /* End updateBookFields */
    function disableFilledFields() {
        $('#Title_row input').prop('disabled', true);
        $('#Year_row input').prop('disabled', true);
        disableAuthorField();
    }
    function disableAuthorField() {
        $('#Authors-sel-cntnr')[0].lastChild.remove();
        _cmbx('enableComboboxes', [$('#Authors-sel-cntnr select'), false]);
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
    const type = citTypeElem.innerText;                                         
    const copy = ['Book', "Master's Thesis", 'Museum record', 'Other', 
        'Ph.D. Dissertation', 'Report', 'Chapter' ];
    const addSameData = copy.indexOf(type) !== -1;
    addPubValues(fLvl, addSameData, type);
}
function addPubValues(fLvl, addValues, type) {
    const vals = _mmry('getFormProp', ['vals', fLvl]);  
    const rcrds = _mmry('getFormProp', ['rcrds', fLvl]);
    addPubTitle(addValues, fLvl, type);
    addPubYear(addValues, fLvl);
    addAuthorsToCitation(addValues, fLvl, type);
    /** 
     * Adds the pub title to the citations form vals, unless the type should 
     * be skipped, ie. have it's own title. (may not actually be needed. REFACTOR and check in later)
     */
    function addPubTitle(addTitle, fLvl, type) {     
        const skip = ['Chapter']; 
        vals.Title = {};
        vals.Title.val = addTitle && skip.indexOf(type) === -1 ? 
            rcrds.src.displayName : '';  
    }
    function addPubYear(addYear, fLvl) {  
        vals.Year = {};
        vals.Year.val = addYear ? rcrds.src.year : '';
    }
    function addAuthorsToCitation(addAuths, fLvl, type) { 
        const pubAuths = rcrds.src.authors;  
        if (addAuths && pubAuths) { return addExistingPubContribs(fLvl, pubAuths); }
    }
    /**
     * If the parent publication has existing authors, they are added to the new 
     * citation form's author field(s). 
     */
    function addExistingPubContribs(fLvl, auths) {  
        vals.Authors = { type: "multiSelect" };
        vals.Authors.val = auths ? auths : (vals.length > 0 ? vals : null);
    }
}
/* ----------------------- AUTO-GENERATE CITATION --------------------------- */
/**
 * Checks all required citation fields and sets the Citation Text field.
 * If all required fields are filled, the citation text is generated and 
 * displayed. If not, the default text is displayed in the disabled textarea.
 * Note: to prevent multiple rebuilds, a timeout is used.
 */
export function handleCitText(formLvl) {                                        //console.log('   --handleCitText')
    if (timeout) { return; }
    timeout = window.setTimeout(buildCitTextAndUpdateField, 500);

    function buildCitTextAndUpdateField() {                                     console.log('           /--buildCitTextAndUpdateField')
        const fLvl = formLvl || _forms.getSubFormLvl('sub');
        const $elem = $('#CitationText_row textarea');
        if (!$elem.val()) { initializeCitField($elem); } 
        timeout = null;
        return getCitationFieldText($elem, fLvl)
            .then(citText => updateCitField(citText, $elem));
    }
} 
function updateCitField(citText, $elem) {  
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
        return ifNoChildFormOpen(fLvl) && _elems('ifAllRequiredFieldsFilled', [fLvl]) ? 
           buildCitationText(fLvl) : 
           ($elem.val() === dfault ? false : dfault);
    }
}
function ifNoChildFormOpen(fLvl) {  
    return $('#'+_forms.getNextFormLevel('child', fLvl)+'-form').length == 0; 
}
/** ============= SHARED PUBLICATION AND CITATION HELPERS =================== */
/**
 * Loads the deafult fields for the selected Source Type's type. Clears any 
 * previous type-fields and initializes the selectized dropdowns. Updates 
 * any type-specific labels for fields.  
 * Eg, Pubs have Book, Journal, Dissertation and 'Other' field confgs.
 */
export function loadSrcTypeFields(entity, typeId, elem, typeName) {             console.log('           /--loadSrcTypeFields [%s][%s]', entity, typeName);
    const fLvl = _forms.getSubFormLvl('sub');
    resetOnFormTypeChange(entity, typeId, fLvl);
    return getSrcTypeRows(entity, typeId, fLvl, typeName)
        .then(finishSrcTypeFormBuild);
        
    function finishSrcTypeFormBuild(rows) {  console.log('rows = %O', rows)
        $('#'+entity+'_Rows').append(rows);
        _cmbx('initFormCombos', [entity, fLvl, getComboEvents(entity)]);
        _ui('fillComplexFormFields', [fLvl]);
        _elems('checkReqFieldsAndToggleSubmitBttn', [elem, fLvl]);
        updateFieldLabelsForType(entity, fLvl);
        focusFieldInput(entity);
    }
}
function resetOnFormTypeChange(entity, typeId, fLvl) {  
    const capsType = _u('ucfirst', [entity]);   
    const fMemory = _mmry('getFormMemory', [fLvl]);
    fMemory.vals[capsType+'Type'].val = typeId;
    fMemory.reqElems = [];
    _ui('toggleSubmitBttn', ['#'+fLvl+'-submit', false]); 
}
/**
 * Builds and return the form-field rows for the selected source type.
 * @return {ary} Form-field rows ordered according to the form config.
 */
export function getSrcTypeRows(entity, typeId, fLvl, type) {                    
    const fVals = getFilledSrcVals(entity, typeId, fLvl);                       
    setSourceType(entity, fLvl, type); 
    $('#'+entity+'_Rows').empty();     
    return _elems('getFormFieldRows', [entity, fVals, fLvl]);
}
function getFilledSrcVals(entity, typeId, fLvl) {
    const vals = _ui('getCurrentFormFieldVals', [fLvl]);
    vals[_u('ucfirst', [entity])+'Type'] = typeId;
    return vals;
}
/** Sets the type confg for the selected source type in form params. */
function setSourceType(entity, fLvl, tName) {
    const type = tName || getSourceTypeFromCombo(entity); 
    _mmry('setFormProp', [fLvl, 'entityType', type]);
}
function getSourceTypeFromCombo(entity) {
    const typeElemId = '#'+_u('ucfirst', [entity])+'Type-sel'; 
    return _cmbx('getSelTxt', [typeElemId]);
}
/**
 * Changes form-field labels to more specific and user-friendly labels for 
 * the selected type. 
 */
function updateFieldLabelsForType(entity, fLvl) {                               
    const typeElemId = '#'+_u('ucfirst', [entity])+'Type-sel'; 
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
            for (let $i = 0; $i < cntnrElem.children.length; $i++) {            
                if (cntnrElem.children[$i].tagName !== 'SELECT') {continue}
                updatePlaceholderText(cntnrElem.children[$i], newTxt);   
            }
        }    
    } /* End updateComboboxText */
} /* End updateFieldLabelsForType */
function updatePlaceholderText(elem, newTxt) {                                  
    elem.selectize.settings.placeholder = 'Select ' + newTxt;
    elem.selectize.updatePlaceholder();
}
function getComboEvents(entity) {
    return {
        'citation': getCitComboEvents, 'publication': getPubComboEvents
    }[entity]();
}
function focusFieldInput(type) {
    if (!$('#Title_row input').val()) { $('#Title_row input').focus() 
    } else {
        _cmbx('focusCombobox', ['#'+_u('ucfirst', [type])+'Type-sel', true]);
    }
}
/* ========================== PUBLISHER ===================================== */
function onPublSelection(val) {
    if (val === 'create') { return _forms.entity('createSub', ['Publisher']); }        
}
/**
 * When a user enters a new publisher into the combobox, a create-publisher
 * form is built, appended to the publisher field row and an option object is 
 * returned to be selected in the combobox. Unless there is already a sub2Form,
 * where a message will be shown telling the user to complete the open sub2 form
 * and the form init canceled.
 * Note: The publisher form inits with the submit button enabled, as display 
 *     name, aka val, is it's only required field.
 */
function initPublisherForm (value) {                                            console.log('       /--initPublisherForm [%s]', value); 
    const val = value === 'create' ? '' : value;
    const fLvl = _forms.getSubFormLvl('sub2');
    const prntLvl = _forms.getNextFormLevel('parent', fLvl);
    if ($('#'+fLvl+'-form').length !== 0) { 
        return _errs('openSubFormErr', ['Publisher', null, fLvl]); 
    }
    initEntitySubForm('publisher', fLvl, {'DisplayName': val}, '#Publisher-sel')
    .then(appendPublFormAndFinishBuild);

    function appendPublFormAndFinishBuild(form) {
        $('#Publisher_row').append(form);
        _ui('toggleSubmitBttn', ['#'+prntLvl+'-submit', false]);
        $('#DisplayName_row input').focus();
    }
}
/* ========================== AUTHOR ======================================== */
/* ----------------------------- AUTHOR SELECTION --------------------------- */
/** Loops through author object and adds each author/editor to the form. */
export function selectExistingAuthors(field, authObj, fLvl) {       
    if (!authObj || !$('#'+field+'-sel-cntnr').length) { return Promise.resolve(); }                                 
    Object.keys(authObj).reduce((p, ord) => { //p(romise), ord(er)  
        const selNextAuth = selectAuthor.bind(null, ord, authObj[ord], field, fLvl);
        return p.then(selNextAuth);
    }, Promise.resolve());
}
/** Selects the passed author and builds a new, empty author combobox. */
function selectAuthor(cnt, authId, field, fLvl) {
    if (!$('#'+field+'-sel'+ cnt).length) { return; }
    _cmbx('setSelVal', ['#'+field+'-sel'+ cnt, authId, 'silent']);
    return buildNewAuthorSelect(++cnt, authId, fLvl, field);
}
/**
 * When an author is selected, a new author combobox is initialized underneath
 * the last author combobox, unless the last is empty. The total count of 
 * authors is added to the new id.
 */
function onAuthSelection(val) {                                                 
    handleAuthSelect(val);
}
function onEdSelection(val) {                                                   
    handleAuthSelect(val, 'editor');
}
function handleAuthSelect(val, ed) {                                            
    const authType = ed ? 'Editors' : 'Authors';                                
    let cnt = $('#'+authType+'-sel-cntnr').data('cnt');   
    if (val === '' || parseInt(val) === NaN) { return handleFieldCleared(authType, cnt); }
    const fLvl = _forms.getSubFormLvl('sub');
    if (cnt === 1) { toggleOtherAuthorTypeSelect(authType, false);  }                       
    if (val === 'create') { return _forms.entity('createSub', [authType, cnt]); } 
    handleCitText(fLvl);       
    if (lastAuthComboEmpty(cnt, authType)) { return; }
    buildNewAuthorSelect(cnt+1, val, fLvl, authType);
}
function handleFieldCleared(authType, cnt) {  
    syncWithOtherAuthorTypeSelect(authType);
    if ($('#'+authType+'-sel'+(cnt-1)).val() === '') {
        removeFinalEmptySelectField(authType, cnt);
    }
}
function syncWithOtherAuthorTypeSelect(authType) {
    if ($('#'+authType+'-sel1').val()) { return; }
    toggleOtherAuthorTypeSelect(authType, true);
}
function removeFinalEmptySelectField(authType, cnt) {  
    $('#'+authType+'-sel'+cnt)[0].selectize.destroy();  
    $('#'+authType+'-sel'+cnt)[0].parentNode.remove();
    $('#'+authType+'-sel-cntnr').data('cnt', --cnt);
}
function toggleOtherAuthorTypeSelect(type, enable) {
    const entity = type === 'Authors' ? 'Editors' : 'Authors';
    if (!$('#'+entity+'-sel-cntnr').length) { return; }
    _cmbx('enableFirstCombobox', ['#'+entity+'-sel-cntnr', enable]);
}
/** Stops the form from adding multiple empty combos to the end of the field. */
function lastAuthComboEmpty(cnt, authType) {  
    return $('#'+authType+'-sel'+cnt).val() === '';
}
/** Builds a new, empty author combobox */
function buildNewAuthorSelect(cnt, val, prntLvl, authType) {                    
    return _elems('buildMultiSelectElems', [null, authType, prntLvl, cnt])
        .then(appendNewAuthSelect);

    function appendNewAuthSelect(sel) {
        $('#'+authType+'-sel-cntnr').append(sel).data('cnt', cnt);
        _cmbx('initSingle', [getAuthSelConfg(authType, cnt), prntLvl]);
    }
}
function getAuthSelConfg(authType, cnt) {
    return { 
        add: getAuthAddFunc(authType, cnt), change: getAuthChngFnc(authType),
        id: '#'+authType+'-sel'+cnt,        name: authType.slice(0, -1) //removes 's' for singular type
    };
}
function getAuthChngFnc(authType) {
    return authType === 'Editors' ? onEdSelection : onAuthSelection;
}
function getAuthAddFunc(authType, cnt) {
    const add = authType === 'Editors' ? initEdForm : initAuthForm;
    return add.bind(null, cnt);
}
/** Removes the already selected authors from the new dropdown options. */
// function removeAllSelectedAuths(sel, fLvl, authType) { 
//     const auths = fP.forms[fLvl].fieldConfg.vals[authType].val;   
//     const $selApi = $(sel).data('selectize');                          
//     if (auths) { auths.forEach(id => $selApi.removeOption(id)); } 
// }
/* ------------------------ AUTHOR CREATE ----------------------------------- */
function initAuthForm(selCnt, val) {                                            //console.log("Adding new auth! val = %s, e ? ", val, arguments);      
    handleNewAuthForm(selCnt, val, 'Authors');
}
function initEdForm(selCnt, val) {                                              //console.log("Adding new editor! val = %s, e ? ", val, arguments);      
    handleNewAuthForm(selCnt, val, 'Editors');
}
/**
 * When a user enters a new author (or editor) into the combobox, a create 
 * form is built and appended to the field row. An option object is returned 
 * to be selected in the combobox. If there is already an open form at
 * this level , a message will be shown telling the user to complete the open 
 * form and the form init will be canceled.
 */
function handleNewAuthForm(authCnt, value, authType) {  
    const pId = '#'+authType+'-sel'+authCnt; 
    const fLvl = 'sub2';
    if ($('#'+fLvl+'-form').length !== 0) { 
        return _errs('openSubFormErr', [authType, pId, fLvl]); 
    }
    const val = value === 'create' ? '' : value;
    const singular = _u('lcfirst', [authType.slice(0, -1)]);
    initEntitySubForm(singular, fLvl, {'LastName': val}, pId)
    .then(appendAuthFormAndFinishBuild);

    function appendAuthFormAndFinishBuild(form) {        
        $('#'+authType+'_row').append(form);
        handleSubmitBttns();
        $('#FirstName_row input').focus();
    }
    function handleSubmitBttns() {
        const prntLvl = _forms.getNextFormLevel('parent', fLvl);
        _ui('toggleSubmitBttn', ['#'+prntLvl+'-submit', false]);
        _ui('toggleSubmitBttn', 
            ['#'+fLvl+'-submit', _elems('ifAllRequiredFieldsFilled', [fLvl])]);
    }
}
/** ======================== HELPERS ======================================== */
export function finishSourceToggleAllFields(entity, fVals, fLvl) {
    if (entity === 'publication') { ifBookAddAuthEdNote(fVals.PublicationType) 
    } else  { // 'citation'
        handleSpecialCaseTypeUpdates($('#CitationType-sel')[0], fLvl);
        if (!timeout) { handleCitText(fLvl); }
    }
    updateFieldLabelsForType(entity, fLvl);
}
/** When the Citation sub-form is exited, the Publication combo is reenabled. */
function enablePubField() {
    _cmbx('enableCombobox', ['#Publication-sel']);
    fillCitationField($('#Publication-sel').val());
}
function initEntitySubForm(entity, fLvl, fVals, pSel) {
    _mmry('initEntityFormMemory', [entity, fLvl, pSel, 'create']);       
    return _elems('initSubForm', [fLvl, 'sml-sub-form', fVals, pSel]);
}