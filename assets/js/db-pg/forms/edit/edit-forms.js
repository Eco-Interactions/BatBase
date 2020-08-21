/**
 * Handles individual Entity edit forms.
 *
 * Exports:             Imported by:
 *     editEntity           forms-main
 *
 * CODE SECTIONS
 *     FORM INIT
 *         FORM FIELDS
 *         FINISH FORM INIT
 *     FILL CURRENT ENTITY DATA
 *         INTERACTION
 *         LOCATION
 *         SOURCE
 *         TAXON
 *         FILL FORM-FIELD HELPERS
 */
import { _u } from '../../db-main.js';
import { _state, _elems, _confg, _cmbx, _form, _panel } from '../forms-main.js';


/** Shows the entity's edit form in a pop-up window on the search page. */
export default function editEntity(id, entity) {                                console.log("       //editEntity [%s] [%s]", entity, id);
    initEditForm(id, entity)
    .then(() => _form('finishEditFormInit', [entity, id]))
}
/* ============================== FORM INIT ================================= */
function initEditForm(id, entity) {
    return getEditFormFields(id, entity)
        .then(fields => buildAndAppendEditForm(fields, id, entity))
        .then(() => fillFormWithEntityData(entity, id));
}
function buildAndAppendEditForm(fields, id, entity) {
    return _elems('buildAndAppendForm', [fields, id])
        .then(() => finishEditFormBuild(entity))
}
/* --------------------------- FORM FIELDS ---------------------------------- */
/** Returns the form fields for the passed entity.  */
function getEditFormFields(id, entity) {
    _state('setFormProp', ['top', 'expanded', true]); //All possible fields are shown in edit fields.
    return buildEditFields(entity, id);
}
function buildEditFields(entity, id) {
    const complxBldrs = {
        'citation': 'getSrcTypeFields', 'publication': 'getSrcTypeFields',
        'taxon': 'getTaxonEditFields'
    };
    return complxBldrs[entity] ? getCmplxEditFields() : getEditFields(entity, id);

    function getCmplxEditFields() {
        return _form(complxBldrs[entity], [entity, id]);
    }
}
/** Returns the passed entity's form fields. */
function getEditFields(entity, id) {
    const formConfg = _confg('getFormConfg', [entity]);
    return _elems('getFormFieldRows', [entity, {}, 'top']);
}
/* ----------------------- FINISH FORM INIT --------------------------------- */
function finishEditFormBuild(entity) {
    $('.top-pin').remove(); //removes checkboxes used in interaction create forms
    const cmplx = ['citation', 'interaction', 'location', 'publication', 'taxon'];
    return cmplx.indexOf(entity) > -1 ? finishCmplxForm() : finishEditForm(entity);

    function finishCmplxForm() {
        return _form('finishEntityEditFormBuild', [entity]);
    }
}
function finishEditForm(entity) {
    _form('initFormCombos', [entity, 'top']);
    $('.all-fields-cntnr').hide();  //Hide the "Show all fields" checkbox
    return Promise.resolve();
}
/* =================== FILL CURRENT ENTITY DATA ============================= */
function fillFormWithEntityData(entity, id) {
    const cEntity =  _confg('getCoreEntity', [entity]);
    addDisplayNameToForm(cEntity, id, entity);
    fillEntityData(cEntity, id, entity)
    .then(checkFieldsAndToggleSubmit);
}
function addDisplayNameToForm(cEntity, id, entity) {
    if (entity === 'interaction') { return; }
    const rcrd = _state('getRcrd', [cEntity, id]);
    $('#top-hdr')[0].innerText += ': ' + rcrd.displayName;
    $('#det-cnt-cntnr span')[0].innerText = 'This ' + entity + ' is referenced by:';
}
/** Note: Source types will get their record data at fillSrcData. */
function fillEntityData(cEntity, id, entity) {
    const hndlrs = {
        'interaction': fillIntData, 'location': fillLocData,
        'source': fillSrcData,      'taxon': fillTaxonData  };
    const rcrd = _state('getRcrd', [cEntity, id]);                            console.log("      --fillEntityData [%s] [%s] = %O", cEntity, id, rcrd);
    return Promise.resolve(hndlrs[cEntity](cEntity, id, rcrd, entity));
}
function updateEditDetailMemory(detailId) {
    const editObj = _state('getStateProp', ['editing']);
    editObj.detail = detailId;
    _state('setStateProp', ['editing', editObj]);
}
/* ------------- INTERACTION ----------------- */
function fillIntData(entity, id, rcrd, dEntity) {
    const fields = getInteractionFieldFillTypes();
    fillFields(rcrd, fields, true);
}
function getInteractionFieldFillTypes() {
    const fieldTypes = _confg('getCoreFieldDefs', ['interaction']);
    ['Publication', 'CitationTitle'].forEach(f => delete fieldTypes[f]);
    ['Subject', 'Object'].forEach(f => fieldTypes[f] = 'taxon');
    fieldTypes.Source = 'source';
    return fieldTypes;
}
function addTaxon(fieldId, prop, rcrd) {
    const selApi = $('#'+ fieldId + '-sel')[0].selectize;
    const taxon = _state('getRcrd', ['taxon', rcrd[prop]]);
    selApi.addOption({ value: taxon.id, text: taxon.displayName });
    selApi.addItem(taxon.id);
}
function addSource(fieldId, prop, rcrd) {
    const citSrc = _state('getRcrd', ['source', rcrd.source])
    _cmbx('setSelVal', ['#Publication-sel', citSrc.parent]);
    _cmbx('setSelVal', ['#CitationTitle-sel', rcrd.source]);
}
/* ------------- LOCATION ----------------- */
function fillLocData(entity, id, rcrd, dEntity) {
    const fields = _confg('getCoreFieldDefs', [entity]);
    handleLatLongFields();
    fillFields(rcrd, fields);
    _panel('fillRelationalDataInPanel', [entity, rcrd]);
    if (rcrd.geoJsonId) { handleGeoJsonFill(rcrd.geoJsonId); }

    /* Sets values without triggering each field's change method. */
    function handleLatLongFields() {
        delete fields.Latitude;
        delete fields.Longitude;
        delete fields.Country;
        $('#Latitude_row input').val(parseFloat(rcrd.latitude));
        $('#Longitude_row input').val(parseFloat(rcrd.longitude));
        _cmbx('setSelVal', ['#Country-sel', rcrd.country.id, 'silent']);
    }
    function handleGeoJsonFill(geoId) {
        updateEditDetailMemory(geoId);
        storeLocGeoJson(geoId);
    }
    function storeLocGeoJson(id) {
        return _u('getData', ['geoJson'])
            .then(data => _state('setFormProp', ['top', 'geoJson', data[id]]));
    }
} /* End fillLocData */
/* ------------- SOURCE ----------------- */
/** Fills all data for the source-type entity.  */
function fillSrcData(entity, id, src, dEntity) {
    const detail = _state('getRcrd', [dEntity, src[dEntity]]);                //console.log("fillSrcData [%s] src = %O, [%s] = %O", id, src, entity, detail);
    const fields = getSourceFields(dEntity);
    setSrcData();
    setDetailData();
    setAdditionalFields(dEntity, src, detail);

    function setSrcData() {
        fillFields(src, fields.core);
        _panel('fillRelationalDataInPanel', [dEntity, src]);
    }
    function setDetailData() {
        fillFields(detail, fields.detail);
        updateEditDetailMemory(detail.id);
    }
}
function getSourceFields(entity) {
    return {
        core: _confg('getCoreFieldDefs', [entity]),
        detail: _confg('getFormConfg', [entity]).add
    };
}

function setAdditionalFields(entity, srcRcrd, detail) {
    setWebsiteField(srcRcrd);
    if (["publication", "citation"].indexOf(entity) === -1) { return; }
    setTitleField(entity, srcRcrd);
    setPublisherField(entity, srcRcrd);
    setCitationEdgeCaseFields(entity, detail);
}
function setTitleField(entity, srcRcrd) {                                       //console.log("setTitleField [%s] rcrd = %O", entity, srcRcrd)
    const name = entity === 'publication' ?
        srcRcrd.displayName : getCitTitle(srcRcrd.citation);
    $('#Title_row input[type="text"]').val(name).change();

    function getCitTitle(citId) {
        return _state('getRcrd', ['citation', citId]).displayName;
    }
} /* End setTitleField */
function setPublisherField(entity, srcRcrd) {
    if (!_elems('ifFieldIsDisplayed', ['Publisher', 'top'])) { return; }
    _cmbx('setSelVal', ['#Publisher-sel', srcRcrd.parent]);
}
function setWebsiteField (srcRcrd) {
    $('#Website_row input').val(srcRcrd.linkUrl);
}
function setCitationEdgeCaseFields(entity, citRcrd) {
    if (entity !== 'citation') { return; }
    $('#CitationText_row textarea').val(citRcrd.fullText);
    $('#Issue_row input').val(parseInt(citRcrd.publicationIssue));
    $('#Pages_row input').val(citRcrd.publicationPages);
    $('#Volume_row input').val(parseInt(citRcrd.publicationVolume));
}
/* ------------- TAXON ----------------- */
function fillTaxonData(entity, id, rcrd, dEntity) {                                      //console.log('fillTaxonData. rcrd = %O', rcrd)
    _panel('fillRelationalDataInPanel', [entity, rcrd]);
}
/** -------------------- FILL FORM-FIELD HELPERS ---------------------------- */
function checkFieldsAndToggleSubmit() {
    _elems('checkReqFieldsAndToggleSubmitBttn', ['top']);
}
function fillFields(rcrd, fields) {                                             console.log('           --fillEditFields. rcrd = %O, fields = %O', rcrd, fields);
    const fieldHndlrs = {
        'doi': setInput,
        'fullTextArea': setTextArea,
        'multiSelect': setMultiSelect,
        'num': setInput,
        'page': setInput,
        'select': setSelect,
        'source': addSource,
        'tags': setTagField,
        'text': setInput,
        'taxon': addTaxon,
        'textArea': setTextArea,
        'url': setInput,
        'year': setInput,
    };
    for (let field in fields) {                                                 //console.log('------- Setting field [%s]', field);
        addDataToField(field, fieldHndlrs[fields[field]], rcrd);
    }
}
function ifFieldInForm(field) {
    return _elems('ifFieldIsDisplayed', [field, 'top']);
}
function addDataToField(field, fieldHndlr, rcrd) {                              //console.log("addDataToField [%s] [%O] rcrd = %O", field, fieldHndlr, rcrd);
    const elemId = field.split(' ').join('');
    const prop = _u('lcfirst', [elemId]);
    fieldHndlr(elemId, prop, rcrd);
}
/** Adds multiSelect values to the form's val object. */
function setMultiSelect(fieldId, prop, rcrd) {                                  //console.log("setMultiSelect [%s] [%s] rcrd = %O", fieldId, prop, rcrd);
    if (!rcrd[prop] || !ifFieldInForm(fieldId)) { return; }
    const ucProp = _u('ucfirst', [prop]);
    _state('setFormFieldData', ['top', ucProp, rcrd[prop]]);
    if (!$('#'+ucProp+'-sel-cntnr').length) { return; } //can this be the first line here?
    _form('selectExistingAuthors', [ucProp, rcrd[prop], 'top']);
}
function setInput(fieldId, prop, rcrd) {                                        //console.log("setInputField [%s] [%s] rcrd = %O", fieldId, prop, rcrd);
    const val = isNaN(parseInt(rcrd[prop])) ? rcrd[prop] : parseInt(rcrd[prop]);
    $('#'+fieldId+'_row input').val(val).change();
}
function setTextArea(fieldId, prop, rcrd) {
    $('#'+fieldId+'_row textarea').val(rcrd[prop]).change();
}
function setSelect(fieldId, prop, rcrd) {                                       //console.log("setSelect [%s] [%s] rcrd = %O", fieldId, prop, rcrd);
    const id = rcrd[prop] ? rcrd[prop].id ? rcrd[prop].id : rcrd[prop] : null;
    _cmbx('setSelVal', ['#'+fieldId+'-sel', id]);
}
function setTagField(fieldId, prop, rcrd) {                                     //console.log("setTagField. rcrd = %O", rcrd)
    const tags = rcrd[prop] || rcrd.tags;
    tags.forEach(tag => _cmbx('setSelVal', ['#'+fieldId+'-sel', tag.id]));
}