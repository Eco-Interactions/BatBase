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
 *     selectExistingAuthsOrEds
 *
 * TOC:
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
 *              SUBMIT CONFIRMATION MODAL
 *          AUTHOR
 *              AUTHOR SELECTION
 *              AUTHOR CREATE
 *     EDIT FORMS
 *     HELPERS
 */
import { _modal, _u } from '../../../db-main.js';
import { _state, _elems, _cmbx, _form, _panel, _val, getSubFormLvl, getNextFormLevel, submitForm, getValidatedFormData } from '../../forms-main.js';
import * as typeForm from './types/src-type-form-main.js'


let timeout = null; //Prevents citation text being generated multiple times.
let rmvdAuthField = {};

/** Inits comboboxes for the source forms. */
export function initFormCombos(entity, fLvl) {
    const events = getEntityComboEvents(entity);                                //console.log("initFormCombos. [%s] formLvl = [%s], events = %O", entity, fLvl, events);
    if (!events) { return; }
    _cmbx('initFormCombos', [entity, fLvl, events]);
}
function getEntityComboEvents(entity) {
    return  {
        'citation': {
            'CitationType': {
                change: loadCitTypeFields },
            'Authors': {
                add: typeForm.initAuthOrEdForm.bind(null, 1, 'Authors'),
                change: typeForm.onAuthAndEdSelection.bind(null, 1, 'Authors')
            },
        },
        'publication': {
            'PublicationType': {
                change: loadPubTypeFields },
            'Publisher': {
                add: initPublisherForm,
                change: onPublSelection },
            'Authors': {
                add: typeForm.initAuthOrEdForm.bind(null, 1, 'Authors'),
                change: typeForm.onAuthAndEdSelection.bind(null, 1, 'Authors')
            },
            'Editors': {
                add: typeForm.initAuthOrEdForm.bind(null, 1, 'Editors'),
                change: typeForm.onAuthAndEdSelection.bind(null, 1, 'Editors')
            }
        }
    }[entity];
}
/* ************************* ENTITY FORMS *********************************** */
export function initCreateForm(entity, name) {                                  //console.log('entity [%s], name [%s]', entity, name)
    const funcs = {
        'author': typeForm.initAuthOrEdForm.bind(null, 1, 'Authors'),
        'editor': typeForm.initAuthOrEdForm.bind(null, 1, 'Editors'),
        'citation': initCitForm,
        'publication': initPubForm,
        'publisher': initPublisherForm
    };
    return funcs[entity](name);
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
    _cmbx('clearCombobox', ['#CitationTitle-sel']);
    _panel('clearFieldDetails', ['CitationTitle']);
    return buildAndAppendPubForm(val);
}
function initPubMemory() {
    _state('addEntityFormState', ['publication', 'sub', '#Publication-sel', 'create']);
}
function buildAndAppendPubForm(val) {
    return _elems('initSubForm',
        ['sub', 'med-sub-form', {'Title': val}, '#Publication-sel'])
    .then(form => appendPubFormAndFinishBuild(form));
}
function appendPubFormAndFinishBuild(form) {
    $('#CitationTitle_row')[0].parentNode.after(form);
    finishSourceForm('publication', 'sub');
    $('#Title_row input').focus();
    _elems('setCoreRowStyles', ['#publication_Rows', '.sub-row']);
    $('#PublicationType-lbl').css('min-width', '125px');
}
/**
 * Loads the deafult fields for the selected Publication Type. Clears any
 * previous type-fields and initializes the selectized dropdowns.
 */
function loadPubTypeFields(typeId) {                                            console.log('           /--loadPubTypeFields');
    return loadSrcTypeFields('publication', typeId)
        .then(finishPubTypeFields);

    function finishPubTypeFields() {
        setPubComboLabelWidth();
        ifBookAddAuthEdNote();
        _elems('setCoreRowStyles', ['#publication_Rows', '.sub-row']);
        ifThesisDissertationModifyLabel();
    }
}
function setPubComboLabelWidth() {
    const rowW = $('#PublicationType_row').width() - 14;
    $('#PublicationType_row, #Publisher_row, #Editors_row').css('max-width', rowW);
    $('#PublicationType-lbl, #Publisher-lbl, #Editors-lbl').css('min-width', '125px');
    $('#Authors-lbl').css('min-width', '109px');
}
function ifThesisDissertationModifyLabel() {
    const type = $('#PublicationType-sel')[0].innerText;
    if (type !== 'Thesis/Dissertation') { return; }
    $('#Publisher-lbl').css({'flex': '0 0 157px'});
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
/* ---------------- CREATE FORM --------------------- */
/** Shows the Citation  sub-form and disables the publication combobox. */
function initCitForm(v) {                                                       console.log("       /--initCitForm [%s]", v);
    const val = v === 'create' ? '' : v;
    timeout = null;
    rmvdAuthField = {};
    return _u('getData', [['author', 'publication']])
    .then(data => initCitFormMemory(data))
    .then(() => buildAndAppendCitForm(val));
}
function initCitFormMemory(data) {
    addSourceDataToMemory(data);
    _state('addEntityFormState', ['citation', 'sub', '#CitationTitle-sel', 'create']);
    _state('setOnFormCloseHandler', ['sub', enablePubField]);
    addPubRcrdsToMemory(data.publication);
    return Promise.resolve();
}
function addSourceDataToMemory(data) {
    const records = _state('getStateProp', ['records']);
    if (!records) { return; } //form was closed.
    Object.keys(data).forEach(k => records[k] = data[k]);
    _state('setStateProp', ['records', records]);
}
function addPubRcrdsToMemory(pubRcrds) {
    const pubSrc = _state('getRcrd', ['source', $('#Publication-sel').val()]);
    const pub = pubRcrds[pubSrc.publication];
    setPubInMemory(pubSrc, pub, 'sub');
}
function buildAndAppendCitForm(val) {
    return initCitSubForm(val)
    .then(form => appendCitFormAndFinishBuild(form));
}
function initCitSubForm(val) {
    return _elems('initSubForm',
        ['sub', 'med-sub-form', {'Title': val}, '#CitationTitle-sel']);
}
function appendCitFormAndFinishBuild(form) {                                    //console.log('           --appendCitFormAndFinishBuild');
    $('#CitationText_row textarea').attr('disabled', true);
    $('#CitationTitle_row')[0].parentNode.after(form);
    finishSourceForm('citation', 'sub');
    return selectDefaultCitType()
    .then(() => finishCitFormUiLoad());
}
function finishCitFormUiLoad() {
    _cmbx('enableCombobox', ['#Publication-sel', false]);
    $('#Abstract_row textarea').focus();
    _elems('setCoreRowStyles', ['#citation_Rows', '.sub-row']);
}
function selectDefaultCitType() {
    return _u('getData', ['citTypeNames'])
        .then(types => setCitType(types));
}
function setCitType(citTypes) {
    const rcrds = _state('getFormProp', ['sub', 'rcrds']);
    const pubType = rcrds.pub.publicationType.displayName;
    const defaultType = {
        'Book': getBookDefault(pubType, rcrds), 'Journal': 'Article',
        'Other': 'Other', 'Thesis/Dissertation': 'Ph.D. Dissertation'
    }[pubType];
    _cmbx('setSelVal', ['#CitationType-sel', citTypes[defaultType], 'silent']);
    return loadCitTypeFields(citTypes[defaultType], defaultType);
}
function getBookDefault(pubType, rcrds) {
    if (pubType !== 'Book') { return 'Book'; }
    const pubAuths = rcrds.src.authors;
    return pubAuths ? 'Book' : 'Chapter';
}
/* ---------------- SHARED EDIT & CREATE FUNCS --------------------- */
function setPubInMemory(pubSrc, pub, fLvl) {
    _state('setFormProp', [fLvl, 'rcrds', { pub: pub, src: pubSrc}]);
}
/**
 * Adds relevant data from the parent publication into formVals before
 * loading the default fields for the selected Citation Type. If this is an
 * edit form, skip loading pub data...
 */
function loadCitTypeFields(typeId, typeName) {                                            //console.log('           /--loadCitTypeFields');
    const fLvl = getSubFormLvl('sub');
    const type = typeName || this.$input[0].innerText;
    if (!_state('isEditForm')) { addPubData(typeId, type, fLvl); }
    return loadSrcTypeFields('citation', typeId, type)
        .then(finishCitTypeFields);

    function finishCitTypeFields() {
        handleSpecialCaseTypeUpdates(type, fLvl);
        handleCitText(fLvl);
        setCitationFormRowStyles(fLvl);
        _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
    }
}
function setCitationFormRowStyles(fLvl) {
    _elems('setCoreRowStyles', ['#citation_Rows', '.'+fLvl+'-row']);
}
/* ------------------------ TYPE-SPECIFIC UPDATES --------------------------- */
/**
 * Shows/hides the author field depending on whether the publication has authors
 * already. Disables title field for citations that don't allow sub-titles.
 */
function handleSpecialCaseTypeUpdates(type, fLvl) {                             //console.log('handleSpecialCaseTypeUpdates [%s]', type)
    const hndlrs = {
        'Book': updateBookFields, 'Chapter': updateBookFields,
        "Master's Thesis": disableTitleField, 'Other': disableFilledFields,
        'Ph.D. Dissertation': disableTitleField, 'Museum record': disableFilledFields,
        'Report': disableFilledFields };
        if (Object.keys(hndlrs).indexOf(type) === -1) { return; }
    hndlrs[type](type, fLvl);

    function updateBookFields() {
        const fS = _state('getFormLvlState', [fLvl]);
        const pubAuths = fS.rcrds.src.authors;
        if (!pubAuths) { return reshowAuthorField(); }
        removeAuthorField();
        if (type === 'Book'){ disableTitleField()} else { enableTitleField()}

        function reshowAuthorField() {
            if (!rmvdAuthField.authRow) { return; } //Field was never removed
            $('#citation_Rows').append(rmvdAuthField.authRow);
            _state('addRequiredFieldInput', [fLvl, rmvdAuthField.authElem]);
            _state('setFormFieldData', [fLvl, 'Authors', {}, 'multiSelect']);
            delete rmvdAuthField.authRow;
            delete rmvdAuthField.authElem;
        }
        function removeAuthorField() {
            rmvdAuthField.authRow = $('#Authors_row').detach();
            _state('setFormProp', [fLvl, 'reqElems', removeAuthorElem()])
            removeFromFieldData();

            function removeAuthorElem() {
                return fS.reqElems.filter(elem => {
                    if (!elem.id.includes('Authors')) { return true; }
                    rmvdAuthField.authElem = elem;
                    return false;
                });
            }
            function removeFromFieldData() {
                const data = _state('getFormProp', [fLvl, 'fieldData']);
                delete data.Authors;
                _state('setFormProp', [fLvl, 'fieldData', data]);
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
        _cmbx('enableComboboxes', [$('#Authors-sel-cntnr select'), false]);
    }
    function disableTitleField() {
        $('#Title_row input').prop('disabled', true);
    }
    function enableTitleField() {
        $('#Title_row input').prop('disabled', false);
    }
}
/** Adds or removes publication data from the form's values, depending on type. */
function addPubData(typeId, type, fLvl) {
    // const type = citTypeElem.innerText;
    const copy = ['Book', "Master's Thesis", 'Museum record', 'Other',
        'Ph.D. Dissertation', 'Report', 'Chapter' ];
    const addSameData = copy.indexOf(type) !== -1;
    addPubValues(fLvl, addSameData, type);
}
function addPubValues(fLvl, addValues, type) {
    const fieldData = _state('getFormProp', [fLvl, 'fieldData']);
    const rcrds = _state('getFormProp', [fLvl, 'rcrds']);
    addPubTitle(addValues, fLvl, type);
    addPubYear(addValues, fLvl);
    addAuthorsToCitation(addValues, fLvl, type);
    _state('setFormProp', [fLvl, 'fieldData', fieldData]);
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

    function buildCitTextAndUpdateField() {                                     //console.log('           /--buildCitTextAndUpdateField')
        const fLvl = formLvl || getSubFormLvl('sub');
        const $elem = $('#CitationText_row textarea');
        if (!$elem.val()) { initializeCitField($elem); }
        const reqFieldsFilled = _elems('ifAllRequiredFieldsFilled', [fLvl]);

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
            buildCitationText(fLvl) :
           ($elem.val() === dfault ? false : dfault);
    }
}
function ifNoChildFormOpen(fLvl) {
   return $('#'+getNextFormLevel('child', fLvl)+'-form').length == 0;
}
function buildCitationText(fLvl) {
    return getValidatedFormData('citation', fLvl, null)
        .then(fData => _u('generateCitationText', [getDataForCitation(fData, fLvl), true]));
}
function getDataForCitation(fData, fLvl) {                          /*dbug-log*///console.log('getDataForCitation [%s] fData = %O', fLvl, fData)
    const data = {
        pubSrc: _state('getFormProp', [fLvl, 'rcrds']).src,
        citSrc: { authors: fData.authors, year: fData.year },
        cit: buildCitData(fData),
        showWarnings: true
    };
    return Object.assign(data, addEntityRecords());
}
function buildCitData(fData) {
    return {
        citationType: { displayName: $('#CitationType-sel')[0].innerText },
        title: fData.title,
        publicationPages: fData.pages,
        publicationIssue: fData.issue,
        publicationVolume: fData.volume,
    };
}
function addEntityRecords() {
    const entities = ['author', 'citation', 'publisher', 'source'];
    return { rcrds: _state('getEntityRcrds', [entities])};
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
export function loadSrcTypeFields(entity, typeId, type) {                       //console.log('           /--loadSrcTypeFields [%s][%s]', entity, type);
    const fLvl = getSubFormLvl('sub');
    resetOnFormTypeChange(entity, typeId, fLvl);
    return getSrcTypeRows(entity, typeId, fLvl, type)
        .then(finishSrcTypeFormBuild);

    function finishSrcTypeFormBuild(rows) {                                     //console.log('rows = %O', rows)
        $('#'+entity+'_Rows').append(rows);
        initFormCombos(entity, fLvl);
        return _elems('fillComplexFormFields', [fLvl])
        .then(afterComplexFieldsFilled);
    }
    function afterComplexFieldsFilled () {
        _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
        updateFieldsForSourceType(entity, fLvl)
        $('#Title_row input').focus();
        if (_state('getStateProp', ['action']) === 'create') { return; }
        $('.top-pin').hide(); //edit-forms show pins after type change otherwise.
    }
}
function resetOnFormTypeChange(entity, typeId, fLvl) {
    const capsType = _u('ucfirst', [entity]);
    _state('setFormFieldData', [fLvl, capsType+'Type', typeId]);
    _state('setFormProp', [fLvl, 'reqElems', []]);
    _elems('toggleSubmitBttn', ['#'+fLvl+'-submit', false]);
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
    return _elems('getFormFieldRows', [entity, fVals, fLvl]);
}
function getFilledSrcVals(entity, typeId, fLvl) {
    const vals = _elems('getCurrentFormFieldVals', [fLvl]);
    vals[_u('ucfirst', [entity])+'Type'] = typeId;
    return vals;
}
/** Update form state for the selected source type. */
function setSourceType(entity, fLvl, tName) {
    const type = tName || getSourceTypeFromCombo(entity);                       //console.log('               --type = [%s]', type);
    _state('setFormProp', [fLvl, 'entityType', type]);
}
function getSourceTypeFromCombo(entity) {
    const typeElemId = '#'+_u('ucfirst', [entity])+'Type-sel';
    return _cmbx('getSelTxt', [typeElemId]);
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
/* ----------------- INPUTS ----------------------------------- */
function updateInputTypes () {
    setNumberInputs();
    setInputType('Website', 'url');
}
function setNumberInputs () {
    const fields = ['Edition', 'Issue', 'Volume', 'Year'];
    fields.forEach(f => setInputType(f, 'number'));
}
function setInputType (fieldName, type) {
    if (!$('#'+fieldName+'-lbl + input').length) { return; }
    $('#'+fieldName+'-lbl + input').attr('type', type);
}
/* -------------------- SUBMIT CONFIRMATION MODAL --------------------------- */
/**
 * If a URL is entered in the form, a modal is shown prompting the editor to
 * double check the links work before submitting.
 */
export function addConfirmationBeforeSubmit(entity, fLvl) {
    $(`#${fLvl}-submit`).off('click').click(showSubmitModal.bind(null, entity, fLvl));
}
function showSubmitModal(entity, fLvl) {
    const linkHtml = buildConfirmationModalHtml(fLvl);
    const submit = submitForm.bind(null, `#${fLvl}-form`, fLvl, entity);
    if (!linkHtml) { return submit(); }
    _modal('showSaveModal', [ buildModalConfg(fLvl, linkHtml, submit) ]);
    $(`#${fLvl}-submit`).css({'opacity': .5, cursor: 'not-allowed'})
    window.setTimeout(() => $('.modal-msg').css({width: 'max-content'}), 500);
}
function buildConfirmationModalHtml(fLvl) {
    const hdr = '<b>Please double-check URLs before submitting.</b><br><br>';
    const links = ['Doi', 'Website'].map(buildLinkHtmlForValues).filter(l=>l);
    return links.length ? hdr + links.join('<br><br>') : false;

    function buildLinkHtmlForValues(field) {
        const url = $(`#${fLvl}-form #${field}_row input`).val();
        return url ? buildUrlLink(field, url) : null;
    }
}
function buildUrlLink(field, url) {
    return `<b>${field}:</b> <a href="${url}"" target="_blank">${url}</a>`;
}
function buildModalConfg(fLvl, linkHtml, submit) {
    return {
        html: linkHtml,
        selector: `#${fLvl}-submit`,
        dir: 'left',
        submit: submit,
        bttn: 'SUBMIT'
    };
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
    const fLvl = getSubFormLvl('sub2');
    const prntLvl = getNextFormLevel('parent', fLvl);
    if ($('#'+fLvl+'-form').length !== 0) {
        return _val('openSubFormErr', ['Publisher', null, fLvl]);
    }
    return initEntitySubForm('publisher', fLvl, {'DisplayName': val}, '#Publisher-sel')
    .then(appendPublFormAndFinishBuild);

    function appendPublFormAndFinishBuild(form) {
        $('#Publisher_row').append(form);
        _elems('toggleSubmitBttn', ['#'+prntLvl+'-submit', false]);
        $('#DisplayName_row input').focus();
        addConfirmationBeforeSubmit('publisher', fLvl);
    }
}
/* ========================== AUTHOR ======================================== */
export function selectExistingAuthsOrEds() {
    return typeForm.selectExistingAuthsOrEds(...arguments);
}
/* *************************** EDIT FORMS *********************************** */
export function getSrcTypeFields(entity, id) {
    const srcRcrd = _state('getRcrd', ['source', id]);
    const type = _state('getRcrd', [entity, srcRcrd[entity]]);
    const typeId = type[entity+'Type'].id;
    const typeName = type[entity+'Type'].displayName;
    return ifCitationAddPubToMemory(entity, srcRcrd, id)
        .then(() => getSrcTypeRows(entity, typeId, 'top', typeName));
}
function ifCitationAddPubToMemory(entity, srcRcrd) {
    if (entity !== 'citation') { return Promise.resolve(); }
    return _u('getData', ['publication'])
        .then(setPubDataInMemory);

    function setPubDataInMemory(pubRcrds) {
        const pubSrc = _state('getRcrd', ['source', srcRcrd.parent]);
        const pub = pubRcrds[pubSrc.publication]
        setPubInMemory(pubSrc, pub, 'top');
    }
}
function getSrcRcrd(pubId) {
    const rcrd = _state('getRcrd', ['source', _state('getStateProp', '[editing]').core]);
    return _state('getRcrd', ['source', rcrd.parent]);
}
/** Note: Only citation & publication forms use this. */
export function finishEditFormBuild(entity) {                                   //console.log('---finishEditFormBuild')
    finishSourceForm(entity, 'top');
    $('.all-fields-cntnr').hide();
    if (entity === 'citation') {
        handleSpecialCaseTypeUpdates(_cmbx('getSelTxt', ['#CitationType-sel']), 'top');
        finishSourceToggleAllFields(entity, {}, 'top');
    } else if (entity === 'publication') {
        $('#PublicationType-lbl').css('min-width', '125px');
        finishSourceToggleAllFields(entity, {}, 'top');
    }
}
export function setSrcEditRowStyle() {
    _elems('setCoreRowStyles', ['#form-main', '.top-row']);
}

/** ======================== HELPERS ======================================== */
function finishSourceForm(entity, fLvl) {
    initFormCombos(entity, fLvl);
    addConfirmationBeforeSubmit(entity, fLvl);
}
export function finishSourceToggleAllFields(entity, fVals, fLvl) {
    if (entity === 'publication') {
        ifBookAddAuthEdNote(fVals.PublicationType);
    } else  { // 'citation'
        handleSpecialCaseTypeUpdates(_cmbx('getSelTxt', ['#CitationType-sel']), fLvl);
        handleCitText(fLvl);
    }
    updateFieldsForSourceType(entity, fLvl);
}
/** When the Citation sub-form is exited, the Publication combo is reenabled. */
function enablePubField() {
    _cmbx('enableCombobox', ['#Publication-sel']);
    _form('fillCitationCombo', [$('#Publication-sel').val()]);
}
export function initEntitySubForm(entity, fLvl, fVals, pSel) {
    _state('addEntityFormState', [entity, fLvl, pSel, 'create']);
    return _elems('initSubForm', [fLvl, 'sml-sub-form', fVals, pSel]);
}