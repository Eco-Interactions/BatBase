/**
 * Source form code: Authors, Citations, Publication, and Publisher
 *
 * Exports:             
 *     finishSourceToggleAllFields
 *     getSrcTypeRows                   
 *     handleCitText                    
 *     handleSpecialCaseTypeUpdates     
 *     initCreateForm
 *     loadSrcTypeFields                
 *     selectExistingAuthors
 *     
 * Code Sections:
 *     COMBOBOX INIT
 *     ENTITY FORMS
 *         PUBLICATION
 *         CITATION
 *             CREATE FORM
 *             SHARED EDIT & CREATE FUNCS
 *             TYPE-SPECIFIC UPDATES
 *             AUTO-GENERATE CITATION
 *             HIGHTLIGHT EMPTY CITATION FIELDS
 *          SHARED PUBLICATION AND CITATION HELPERS
 *              GET SOURCE-TYPE ROWS
 *              UPDATE FIELD LABELS
 *              UPDATE NUMBER INPUTS
 *          AUTHOR
 *              AUTHOR SELECTION
 *              AUTHOR CREATE
 *     EDIT FORMS
 *     HELPERS
 */
import * as _f from '../../forms-main.js'; 

let timeout = null; //Prevents citation text being generated multiple times.
const rmvdAuthField = {};

/** Inits comboboxes for the source forms. */
export function initFormCombos(entity, fLvl) {
    const events = getEntityComboEvents(entity);
    _f.cmbx('initFormCombos', [entity, fLvl, events]);
}
function getEntityComboEvents(entity) {
    return  {
        'citation': {
            'CitationType': { add: false, change: loadCitTypeFields },
            'Authors': { add: initAuthForm.bind(null, 1), change: onAuthSelection },
        },
        'publication': {
            'PublicationType': { change: loadPubTypeFields },
            'Publisher': { change: onPublSelection, add: initPublisherForm },
            'Authors': { add: initAuthForm.bind(null, 1), change: onAuthSelection },
            'Editors': { change: onEdSelection, add: initEdForm.bind(null, 1) }
        }
    }[entity];
}
/* ************************* ENTITY FORMS *********************************** */
export function initCreateForm(entity, name) {                                  //console.log('entity [%s], name [%s]', entity, name)
    const funcs = {
        'author': initAuthForm, 
        'editor': initEdForm,
        'citation': initCitForm,
        'publication': initPubForm,
        'publisher': initPublisherForm
    };
    funcs[entity](name);
}
/* ========================== PUBLICATION =================================== */
/* ---------------- CREATE FORM --------------------- */
/**
 * When a user enters a new publication into the combobox, a create-publication
 * form is built and appended to the interaction form. An option object is 
 * returned to be selected in the interaction form's publication combobox.
 */
function initPubForm(value) {                                                   console.log('       /--initPubForm [%s]', value); 
    const val = value === 'create' ? '' : value;
    initPubMemory();
    buildAndAppendPubForm(val);
}
function initPubMemory() {
    _f.state('addEntityFormState', ['publication', 'sub', '#Publication-sel', 'create']);
}
function buildAndAppendPubForm(val) {
    _f.elems('initSubForm', 
        ['sub', 'med-sub-form', {'Title': val}, '#Publication-sel']) 
    .then(form => appendPubFormAndFinishBuild(form));
}
function appendPubFormAndFinishBuild(form) {  
    $('#CitationTitle_row')[0].parentNode.after(form); 
    initFormCombos('publication', 'sub');
    $('#Title_row input').focus();
    _f.elems('setCoreRowStyles', ['#publication_Rows', '.sub-row']);
    $('#PublicationType-lbl').css('min-width', '125px');
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
        $('#PublicationType-lbl').css('min-width', '125px');
        ifBookAddAuthEdNote();
        _f.elems('setCoreRowStyles', ['#publication_Rows', '.sub-row']);
    }
}
/** Shows the user a note above the author and editor elems. */
function ifBookAddAuthEdNote() {        
    if ($('#PublicationType-sel')[0].innerText !== 'Book') { return; }
    const note = _f.util('buildElem', ['div', { class: 'skipFormData' }]);
    $(note).html('<i>Note: there must be at least one author OR editor ' +
        'selected for book publications.</i>')
    $(note).css({'margin': 'auto'});
    $('#Authors_row')[0].parentNode.before(note);
}
/* ========================== CITATION ====================================== */
/* ---------------- CREATE FORM --------------------- */
/** Shows the Citation  sub-form and disables the publication combobox. */
function initCitForm(v) {                                                       console.log("       /--initCitForm [%s]", v);
    const val = v === 'create' ? '' : v;
    timeout = null;
    _f.util('getData', [['author', 'publication']])
    .then(data => initCitFormMemory(data))
    .then(() => buildAndAppendCitForm(val));
}
function initCitFormMemory(data) {
    addSourceDataToMemory(data);
    _f.state('addEntityFormState', ['citation', 'sub', '#CitationTitle-sel', 'create']);
    _f.state('setOnFormCloseHandler', ['sub', enablePubField]);
    addPubRcrdsToMemory(data.publication);
    return Promise.resolve();
}
function addSourceDataToMemory(data) {
    const records = _f.state('getStateProp', ['records']);
    Object.keys(data).forEach(k => records[k] = data[k]);
    _f.state('setStateProp', ['records', records]);
}
function addPubRcrdsToMemory(pubRcrds) {  
    const pubSrc = _f.state('getRcrd', ['source', $('#Publication-sel').val()]); 
    const pub = pubRcrds[pubSrc.publication];
    setPubInMemory(pubSrc, pub, 'sub');
}
function buildAndAppendCitForm(val) {
    initCitSubForm(val)
    .then(form => appendCitFormAndFinishBuild(form));
}
function initCitSubForm(val) {
    return _f.elems('initSubForm', 
        ['sub', 'med-sub-form', {'Title': val}, '#CitationTitle-sel']); 
}
function appendCitFormAndFinishBuild(form) {                                    //console.log('           --appendCitFormAndFinishBuild');
    $('#CitationTitle_row')[0].parentNode.after(form);
    initFormCombos('citation', 'sub');
    selectDefaultCitType()
    .then(() => finishCitFormUiLoad());
}
function finishCitFormUiLoad() {
    _f.cmbx('enableCombobox', ['#Publication-sel', false]);
    $('#Abstract_row textarea').focus();
    _f.elems('setCoreRowStyles', ['#citation_Rows', '.sub-row']);
}
function selectDefaultCitType() {
    return _f.util('getData', ['citTypeNames'])
        .then(types => setCitType(types));
}
function setCitType(citTypes) {
    const rcrds = _f.state('getFormProp', ['sub', 'rcrds']);
    const pubType = rcrds.pub.publicationType.displayName;                      
    const defaultType = {
        'Book': getBookDefault(pubType, rcrds), 'Journal': 'Article', 
        'Other': 'Other', 'Thesis/Dissertation': 'Ph.D. Dissertation' 
    }[pubType];
    _f.cmbx('setSelVal', ['#CitationType-sel', citTypes[defaultType]]);
}
function getBookDefault(pubType, rcrds) {
    if (pubType !== 'Book') { return 'Book'; }
    const pubAuths = rcrds.src.authors;  
    return pubAuths ? 'Book' : 'Chapter';
}
/* ---------------- SHARED EDIT & CREATE FUNCS --------------------- */
function setPubInMemory(pubSrc, pub, fLvl) {
    _f.state('setFormProp', [fLvl, 'rcrds', { pub: pub, src: pubSrc}]);
}
/**
 * Adds relevant data from the parent publication into formVals before 
 * loading the default fields for the selected Citation Type. If this is an 
 * edit form, skip loading pub data... 
 */
function loadCitTypeFields(typeId) {                                            //console.log('           /--loadCitTypeFields');
    const fLvl = _f.getSubFormLvl('sub');
    const elem = this.$input[0];
    if (!_f.state('isEditForm')) { addPubData(typeId, elem, fLvl); }
    return loadSrcTypeFields('citation', typeId, elem)
        .then(finishCitTypeFields);

    function finishCitTypeFields() {
        handleSpecialCaseTypeUpdates(elem, fLvl);
        handleCitText(fLvl);
        setCitationFormRowStyles(fLvl);
        _f.elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
    }
}
function setCitationFormRowStyles(fLvl) {
    _f.elems('setCoreRowStyles', ['#citation_Rows', '.'+fLvl+'-row']);
}
/* ------------------------ TYPE-SPECIFIC UPDATES --------------------------- */
/**
 * Shows/hides the author field depending on whether the publication has authors 
 * already. Disables title field for citations that don't allow sub-titles.
 */
function handleSpecialCaseTypeUpdates(elem, fLvl) {                      
    const type = elem.innerText;                                                //console.log('handleSpecialCaseTypeUpdates [%s]', type)
    const hndlrs = { 
        'Book': updateBookFields, 'Chapter': updateBookFields,
        "Master's Thesis": disableTitleField, 'Other': disableFilledFields,
        'Ph.D. Dissertation': disableTitleField, 'Museum record': disableFilledFields,
        'Report': disableFilledFields };
        if (Object.keys(hndlrs).indexOf(type) === -1) { return; }
    hndlrs[type](type, fLvl);

    function updateBookFields() {
        const _fs = _f.state('getFormLvlState', [fLvl]);                          
        const pubAuths = _fs.rcrds.src.authors;      
        if (!pubAuths) { return reshowAuthorField(); }
        removeAuthorField();
        if (type === 'Book'){ disableTitleField()} else { enableTitleField()}

        function reshowAuthorField() {                                            
            if (!rmvdAuthField.authRow) { return; } //Field was never removed
            $('#citation_Rows').append(rmvdAuthField.authRow);
            _f.state('addRequiredFieldInput', [fLvl, rmvdAuthField.authElem]);
            _f.state('setFormFieldData', [fLvl, 'Authors', {}, 'multiSelect']);
            delete rmvdAuthField.authRow;
            delete rmvdAuthField.authElem;
        }
        function removeAuthorField() {
            rmvdAuthField.authRow = $('#Authors_row').detach();
            _f.state('setFormProp', [fLvl, 'reqElems', removeAuthorElem()])
            removeFromFieldData();

            function removeAuthorElem() {
                return _fs.reqElems.filter(elem => {
                    if (!elem.id.includes('Authors')) { return true; }
                    rmvdAuthField.authElem = elem;                                
                    return false;
                });
            }
            function removeFromFieldData() {
                const data = _f.state('getFormProp', [fLvl, 'fieldData']);
                delete data.Authors;
                _f.state('setFormProp', [fLvl, 'fieldData', data]);
            }
        } 
    } /* End updateBookFields */
    function disableFilledFields() {
        $('#Title_row input').prop('disabled', true);
        $('#Year_row input').prop('disabled', true);
        disableAuthorField();
    }
    function disableAuthorField() {                                             
        if ($('#Authors-sel-cntnr')[0].children.length > 1) {
            $('#Authors-sel-cntnr')[0].lastChild.remove();
        }
        _f.cmbx('enableComboboxes', [$('#Authors-sel-cntnr select'), false]);
    }
    function disableTitleField() { 
        $('#Title_row input').prop('disabled', true);
    }
    function enableTitleField() {  
        $('#Title_row input').prop('disabled', false);
    }
} /* End handleSpecialCaseTypeUpdates */
/** Adds or removes publication data from the form's values, depending on type. */
function addPubData(typeId, citTypeElem, fLvl) {
    const type = citTypeElem.innerText;                                         
    const copy = ['Book', "Master's Thesis", 'Museum record', 'Other', 
        'Ph.D. Dissertation', 'Report', 'Chapter' ];
    const addSameData = copy.indexOf(type) !== -1;
    addPubValues(fLvl, addSameData, type);
}
function addPubValues(fLvl, addValues, type) {
    const fieldData = _f.state('getFormProp', [fLvl, 'fieldData']);  
    const rcrds = _f.state('getFormProp', [fLvl, 'rcrds']);
    addPubTitle(addValues, fLvl, type);
    addPubYear(addValues, fLvl);
    addAuthorsToCitation(addValues, fLvl, type);
    _f.state('setFormProp', [fLvl, 'fieldData', fieldData]);
    /** 
     * Adds the pub title to the citations form vals, unless the type should 
     * be skipped, ie. have it's own title. (may not actually be needed. REFACTOR and check in later)
     */
    function addPubTitle(addTitle, fLvl, type) {     
        if (fieldData.Title.val) { return; }     
        const skip = ['Chapter']; 
        fieldData.Title = {};
        fieldData.Title.val = addTitle && skip.indexOf(type) === -1 ? 
            rcrds.src.displayName : '';  
    }
    function addPubYear(addYear, fLvl) {  
        fieldData.Year = {};
        fieldData.Year.val = addYear ? rcrds.src.year : '';
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
        fieldData.Authors = { type: "multiSelect" };
        fieldData.Authors.val = auths ? auths : null;
    }
}
/* ----------------------- AUTO-GENERATE CITATION --------------------------- */
/**
 * Checks all required citation fields and sets the Citation Text field.
 * If all required fields are filled, the citation text is generated and 
 * displayed. If not, the default text is displayed in the disabled textarea.
 * Note: to prevent multiple rebuilds, a timeout is used.
 */
export function handleCitText(formLvl) {                                        //console.log('   --handleCitText. timeout? ', !!timeout); 
    if (timeout) { return; }
    timeout = window.setTimeout(buildCitTextAndUpdateField, 750);

    function buildCitTextAndUpdateField() {                                     console.log('           /--buildCitTextAndUpdateField')
        const fLvl = formLvl || _f.getSubFormLvl('sub');
        const $elem = $('#CitationText_row textarea');
        if (!$elem.val()) { initializeCitField($elem); } 
        const reqFieldsFilled = _f.elems('ifAllRequiredFieldsFilled', [fLvl]);
        
        return getCitationFieldText($elem, fLvl, reqFieldsFilled)
            .then(citText => updateCitField(citText, $elem))
            .then(() => ifReqFieldsFilledHighlightEmptyAndPrompt(fLvl, reqFieldsFilled))
            .then(() => {timeout = null;});
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
function getCitationFieldText($elem, fLvl, reqFieldsFilled) {  
    const dfault = 'The citation will display here once all required fields '+
        'are filled.';
    return Promise.resolve(getCitationText());

    function getCitationText() { 
        return ifNoChildFormOpen(fLvl) && reqFieldsFilled ? 
           _f.forms('getCitationText', [fLvl]) : 
           ($elem.val() === dfault ? false : dfault);
    }
}
function ifNoChildFormOpen(fLvl) {  
   return $('#'+_f.getNextFormLevel('child', fLvl)+'-form').length == 0; 
}
/* ---------------- HIGHTLIGHT EMPTY CITATION FIELDS ------------------------ */
/**
 * Highlights field continer if citation field is empty once all required fields 
 * are filled. Removes hightlights when filled.
 */
function ifReqFieldsFilledHighlightEmptyAndPrompt(fLvl, reqFieldsFilled) {
    if (!reqFieldsFilled) { return; }
    const empty = $('#citation_Rows div.field-row').filter(hightlightIfEmpty);
    if (!empty.length && $('.warn-msg').length) { return $('.warn-msg').remove(); }
    if ($('.warn-msg').length) { return; }
    $('#'+fLvl+'-submit').before('<div class="warn-msg warn">Please add highlighted data if available.</div>')
}
function hightlightIfEmpty(i, el) {
    const input = el.children[1]; 
    if (ifFieldShouldBeSkipped(el, ...el.children)) { return false; }
    $(el).addClass('warn');
    return true;
}
function ifFieldShouldBeSkipped (el, label, input) { 
    const ignore = ['Authors'];
    const skip = $(input).val() || ignore.indexOf(label.id.split('-')[0]) !== -1;
    if (skip && el.className.includes('warn')) { $(el).removeClass('warn'); }
    return skip;
}
/** ============= SHARED PUBLICATION AND CITATION HELPERS =================== */
/**
 * Loads the deafult fields for the selected Source Type's type. Clears any 
 * previous type-fields and initializes the selectized dropdowns. Updates 
 * any type-specific labels for fields.  
 * Eg, Pubs have Book, Journal, Dissertation and 'Other' field confgs.
 */
export function loadSrcTypeFields(entity, typeId, elem, typeName) {             //console.log('           /--loadSrcTypeFields [%s][%s]', entity, typeName);
    const fLvl = _f.getSubFormLvl('sub');
    resetOnFormTypeChange(entity, typeId, fLvl);
    return getSrcTypeRows(entity, typeId, fLvl, typeName)
        .then(finishSrcTypeFormBuild);
        
    function finishSrcTypeFormBuild(rows) {                                     //console.log('rows = %O', rows)
        $('#'+entity+'_Rows').append(rows);
        initFormCombos(entity, fLvl);
        return _f.elems('fillComplexFormFields', [fLvl])
        .then(afterComplexFieldsFilled);
    }
    function afterComplexFieldsFilled () { 
        _f.elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
        updateFieldsForSourceType(entity, fLvl)
        $('#Title_row input').focus();
        $('.top-pin').hide(); //edit-forms show pins after type change otherwise.
    }
}
function resetOnFormTypeChange(entity, typeId, fLvl) {  
    const capsType = _f.util('ucfirst', [entity]);   
    _f.state('setFormFieldData', [fLvl, capsType+'Type', typeId]);
    _f.state('setFormProp', [fLvl, 'reqElems', []]);
    _f.elems('toggleSubmitBttn', ['#'+fLvl+'-submit', false]); 
}
/* ----------------- GET SOURCE-TYPE ROWS ----------------------------------- */ 
/**
 * Builds and return the form-field rows for the selected source type.
 * @return {ary} Form-field rows ordered according to the form config.
 */
function getSrcTypeRows(entity, typeId, fLvl, type) {                    
    const fVals = getFilledSrcVals(entity, typeId, fLvl);                       
    setSourceType(entity, fLvl, type); 
    $('#'+entity+'_Rows').empty();     
    return _f.elems('getFormFieldRows', [entity, fVals, fLvl]);
}
function getFilledSrcVals(entity, typeId, fLvl) {
    const vals = _f.elems('getCurrentFormFieldVals', [fLvl]);
    vals[_f.util('ucfirst', [entity])+'Type'] = typeId;
    return vals;
}
/** Update form state for the selected source type. */
function setSourceType(entity, fLvl, tName) {
    const type = tName || getSourceTypeFromCombo(entity);                       //console.log('               --type = [%s]', type);
    _f.state('setFormProp', [fLvl, 'entityType', type]);
}
function getSourceTypeFromCombo(entity) {
    const typeElemId = '#'+_f.util('ucfirst', [entity])+'Type-sel'; 
    return _f.cmbx('getSelTxt', [typeElemId]);
}
/* ----------------- UPDATE SOURCE-TYPE FIELDS ------------------------------ */ 
function updateFieldsForSourceType (entity, fLvl) {
    updateFieldLabelsForType(entity, fLvl);
    updateInputTypes();
}
/* ------------------ LABELS -------------------- */ 
/**
 * Changes form-field labels to more specific and user-friendly labels for 
 * the selected type. 
 */
function updateFieldLabelsForType(entity, fLvl) {                               
    const typeElemId = '#'+_f.util('ucfirst', [entity])+'Type-sel'; 
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
/* ----------------- INPUTS ----------------------------------- */ 
function updateInputTypes () {
    setNumberInputs();
    setInputType('LinkUrl', 'url');
    // $('#Pages-lbl + input').attr('pattern', "[0-9]+([-\,][0-9]+)?");
}
function setNumberInputs () {
    const fields = ['Edition', 'Issue', 'Volume', 'Year'];
    fields.forEach(f => setInputType(f, 'number'));
}
function setInputType (fieldName, type) {                                    
    if (!$('#'+fieldName+'-lbl + input').length) { return; }                 
    $('#'+fieldName+'-lbl + input').attr('type', type);
}
/* ========================== PUBLISHER ===================================== */
function onPublSelection(val) {
    if (val === 'create') { return initPublisherForm(val); }        
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
function initPublisherForm(value) {                                             console.log('       /--initPublisherForm [%s]', value); 
    const val = value === 'create' ? '' : value;
    const fLvl = _f.getSubFormLvl('sub2');
    const prntLvl = _f.getNextFormLevel('parent', fLvl);
    if ($('#'+fLvl+'-form').length !== 0) { 
        return _f.val('openSubFormErr', ['Publisher', null, fLvl]); 
    }
    initEntitySubForm('publisher', fLvl, {'DisplayName': val}, '#Publisher-sel')
    .then(appendPublFormAndFinishBuild);

    function appendPublFormAndFinishBuild(form) {
        $('#Publisher_row').append(form);
        _f.elems('toggleSubmitBttn', ['#'+prntLvl+'-submit', false]);
        $('#DisplayName_row input').focus();
    }
}
/* ========================== AUTHOR ======================================== */
/* ----------------------------- AUTHOR SELECTION --------------------------- */
/** Loops through author object and adds each author/editor to the form. */
export function selectExistingAuthors(field, authObj, fLvl) {                   //console.log('selectExistingAuthors. args = %O', arguments); 
    if (ifFieldNotShownOrNoValToSelect(field, authObj)) { return Promise.resolve(); }
    toggleOtherAuthorTypeSelect(field, false);
    return Object.keys(authObj).reduce((p, ord) => { //p(romise), ord(er)  
        const selNextAuth = selectAuthor.bind(null, ord, authObj[ord], field, fLvl);
        return p.then(selNextAuth);
    }, Promise.resolve());
}
function ifFieldNotShownOrNoValToSelect(field, authObj) {
    return !Object.keys(authObj).length || !$('#'+field+'-sel-cntnr').length;
}
/** Selects the passed author and builds a new, empty author combobox. */
function selectAuthor(cnt, authId, field, fLvl) {                               //console.log('selectAuthor. args = %O', arguments)
    if (!$('#'+field+'-sel'+ cnt).length) { return Promise.resolve(); } //field hidden for certain citation types
    _f.cmbx('setSelVal', ['#'+field+'-sel'+ cnt, authId, 'silent']);
    return buildNewAuthorSelect(++cnt, authId, fLvl, field);
}
/**
 * When an author is selected, a new author combobox is initialized underneath
 * the last author combobox, unless the last is empty. The total count of 
 * authors is added to the new id.
 */
function onAuthSelection(val) {
    handleAuthSelect(val, null, this.$input[0].id.substr(-1));
}
function onEdSelection(val) {                                                   
    handleAuthSelect(val, 'editor', this.$input[0].id.substr(-1));
}
/** Note: If create form selected from dropdown, the count of that combo is used. */
function handleAuthSelect(val, ed, selCnt) {               
    const authType = ed ? 'Editors' : 'Authors';                                
    let cnt = $('#'+authType+'-sel-cntnr').data('cnt');   
    if (val === '' || parseInt(val) === NaN) { return handleFieldCleared(authType, cnt); }
    const fLvl = _f.getSubFormLvl('sub');
    if (cnt === 1) { toggleOtherAuthorTypeSelect(authType, false);  }                       
    if (val === 'create') { return handleNewAuthForm(selCnt, val, authType); } 
    if (lastAuthComboEmpty(cnt, authType)) { return; }
    buildNewAuthorSelect(cnt+1, val, fLvl, authType);
    
    function handleFieldCleared(authType, cnt) { 
        syncWithOtherAuthorTypeSelect(authType);
        handleCitText(fLvl);
        if ($('#'+authType+'-sel'+(cnt-1)).val() === '') {  
            removeFinalEmptySelectField(authType, cnt);
        }
    }
}
function syncWithOtherAuthorTypeSelect(authType) { 
    if ($('#'+authType+'-sel1').val()) { return; } //There are no selections in this type.
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
    _f.cmbx('enableFirstCombobox', ['#'+entity+'-sel-cntnr', enable]);
}
/** Stops the form from adding multiple empty combos to the end of the field. */
function lastAuthComboEmpty(cnt, authType) {  
    return $('#'+authType+'-sel'+cnt).val() === '';
}
/** Builds a new, empty author combobox */
function buildNewAuthorSelect(cnt, val, prntLvl, authType) {                    //console.log('buildNewAuthorSelect')            
    return _f.elems('buildMultiSelectElem', [null, authType, prntLvl, cnt])
        .then(appendNewAuthSelect);

    function appendNewAuthSelect(sel) { 
        $('#'+authType+'-sel-cntnr').append(sel).data('cnt', cnt);
        _f.cmbx('initSingle', [getAuthSelConfg(authType, cnt), prntLvl]);
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
function handleNewAuthForm(authCnt, value, authType) {                          //console.log('           /--handleNewAuthForm [%s][%s] - [%s]', authType, authCnt, value); 
    const pId = '#'+authType+'-sel'+authCnt; 
    const fLvl = _f.getSubFormLvl('sub2');
    if ($('#'+fLvl+'-form').length !== 0) { 
        return _f.val('openSubFormErr', [authType, pId, fLvl]); 
    }
    const val = value === 'create' ? '' : value;
    const singular = _f.util('lcfirst', [authType.slice(0, -1)]);
    initEntitySubForm(singular, fLvl, {'LastName': val}, pId)
    .then(appendAuthFormAndFinishBuild);

    function appendAuthFormAndFinishBuild(form) {        
        $('#'+authType+'_row').append(form);
        handleSubmitBttns();
        $('#'+fLvl+'-cancel').click(_f.cmbx.bind(null, 'clearCombobox', ['#'+authType+'-sel'+authCnt]))
        $('#FirstName_row input').focus();
    }
    function handleSubmitBttns() {
        const prntLvl = _f.getNextFormLevel('parent', fLvl);
        _f.elems('toggleSubmitBttn', ['#'+prntLvl+'-submit', false]);
        _f.elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
        $('#'+fLvl+'-cancel').click(toggleOtherAuthorTypeSelect.bind(null, authType, true));
    }
}
/* *************************** EDIT FORMS *********************************** */
export function getSrcTypeFields(entity, id) {
    const srcRcrd = _f.state('getRcrd', ['source', id]);
    const type = _f.state('getRcrd', [entity, srcRcrd[entity]]);
    const typeId = type[entity+'Type'].id;
    const typeName = type[entity+'Type'].displayName; 
    return ifCitationAddPubToMemory(entity, srcRcrd, id)
        .then(() => getSrcTypeRows(entity, typeId, 'top', typeName));
}
function ifCitationAddPubToMemory(entity, srcRcrd) {
    if (entity !== 'citation') { return Promise.resolve(); }
    return _f.util('getData', ['publication'])
        .then(setPubDataInMemory);

    function setPubDataInMemory(pubRcrds) {
        const pubSrc = _f.state('getRcrd', ['source', srcRcrd.parent]);
        const pub = pubRcrds[pubSrc.publication]
        setPubInMemory(pubSrc, pub, 'top');
    }
}
function getSrcRcrd(pubId) {
    const rcrd = _f.state('getRcrd', ['source', _f.state('getStateProp', '[editing]').core]);
    return _f.state('getRcrd', ['source', rcrd.parent]);
}
/** Note: Only citation & publication forms use this. */
export function finishEditFormBuild(entity) {                                   //console.log('---finishEditFormBuild')
    initFormCombos(entity, 'top');
    $('.all-fields-cntnr').hide();
    if (entity === 'citation') {
        handleSpecialCaseTypeUpdates($('#CitationType-sel')[0], 'top');
    } else {
        $('#PublicationType-lbl').css('min-width', '125px');
    }
    finishSourceToggleAllFields(entity, {}, 'top');
}
export function setSrcEditRowStyle() {
    _f.elems('setCoreRowStyles', ['#form-main', '.top-row']);
}

/** ======================== HELPERS ======================================== */
export function finishSourceToggleAllFields(entity, fVals, fLvl) {   
    if (entity === 'publication') { 
        ifBookAddAuthEdNote(fVals.PublicationType); 
    } else  { // 'citation'
        handleSpecialCaseTypeUpdates($('#CitationType-sel')[0], fLvl);
        handleCitText(fLvl);
    }
    updateFieldsForSourceType(entity, fLvl);
}
/** When the Citation sub-form is exited, the Publication combo is reenabled. */
function enablePubField() {
    _f.cmbx('enableCombobox', ['#Publication-sel']);
    _f.forms('fillCitationField', [$('#Publication-sel').val()]);
}
function initEntitySubForm(entity, fLvl, fVals, pSel) {
    _f.state('addEntityFormState', [entity, fLvl, pSel, 'create']);       
    return _f.elems('initSubForm', [fLvl, 'sml-sub-form', fVals, pSel]);
}