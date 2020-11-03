/**
 * Sets current entity data in the edit-form fields.
 *
 * Export
 *     fillFormWithEntityData
 *
 * TOC
 *     ADD DISPLAY NAME
 *     ENTITY FIELD-DATA
 *         INTERACTION
 *         LOCATION
 *         SOURCE
 *         TAXON
 *     FILL FIELD-DATA
 */
import { _u } from '~db';
import { _state, _elems, _confg, _form, _panel } from '../forms-main.js';

export function fillFormWithEntityData(entity, id) {
    const cEntity =  _confg('getCoreEntity', [entity]);
    addDisplayNameToForm(cEntity, id, entity);
    fillEntityData(cEntity, id, entity)
    .then(checkFieldsAndToggleSubmit);
}
/* ---------------------- ADD DISPLAY NAME ---------------------------------- */
function addDisplayNameToForm(cEntity, id, entity) {
    if (entity === 'interaction') { return; }
    const rcrd = _state('getRcrd', [cEntity, id]);
    $('#top-hdr')[0].innerText += ': ' + rcrd.displayName;
    $('#det-cnt-cntnr span')[0].innerText = 'This ' + entity + ' is referenced by:';
}
/* ====================== ENTITY FIELD-DATA ================================= */
/** Note: Source types will get their record data at fillSrcData. */
function fillEntityData(cEntity, id, entity) {
    const hndlrs = {
        'interaction': fillIntData, 'location': fillLocData,
        'source': fillSrcData,      'taxon': fillTaxonData  };
    const rcrd = _state('getRcrd', [cEntity, id]);                  /*dbug-log*///console.log("      --fillEntityData [%s] [%s] = %O", cEntity, id, rcrd);
    return Promise.resolve(hndlrs[cEntity](cEntity, id, rcrd, entity));
}
function updateEditDetailMemory(detailId) {
    const editObj = _state('getStateProp', ['editing']);
    editObj.detail = detailId;
    _state('setStateProp', ['editing', editObj]);
}
/* ------------------------- INTERACTION ------------------------------------ */
function fillIntData(entity, id, rcrd, dEntity) {
    const fields = getInteractionFieldFillTypes();
    setTypeAndTagInitValuesAsDataFieldElems(rcrd);
    fillFields(rcrd, fields, true);
}
function getInteractionFieldFillTypes() {
    const fieldTypes = _confg('getCoreFieldDefs', ['interaction']);
    removeFieldsWithSpecialHandling(fieldTypes);
    ['Subject', 'Object'].forEach(f => fieldTypes[f] = 'taxon');
    fieldTypes.Source = 'source';
    return fieldTypes;
}
function removeFieldsWithSpecialHandling(fieldTypes) {
    const fields = ['Publication', 'CitationTitle', 'InteractionType', 'InteractionTags'];
    fields.forEach(f => delete fieldTypes[f]);
}
/**
 * Values will be set in fields in the change event for the taxon role combos.
 */
function setTypeAndTagInitValuesAsDataFieldElems(rcrd) {
    $('#sel-InteractionType').data('init-val', rcrd.interactionType.id);
    $('#sel-InteractionType').data('init-val', rcrd.interactionType.id);
    $('#sel-InteractionTags').data('init-val', rcrd.tags.map(t => t.id).join(', '));
}
function addTaxon(field, prop, rcrd) {
    const selApi = $('#sel-'+ field)[0].selectize;
    const taxon = _state('getRcrd', ['taxon', rcrd[prop]]);
    _state('setTaxonProp', ['groupName', taxon.group.displayName]);
    selApi.addOption(new Option(taxon.displayName, taxon.id));
    selApi.addItem(taxon.id);
}
function addSource(field, prop, rcrd) {
    const citSrc = _state('getRcrd', ['source', rcrd.source])
    _u('setSelVal', ['Publication', citSrc.parent]);
    _u('setSelVal', ['CitationTitle', rcrd.source]);
}
/* ------------------------- LOCATION --------------------------------------- */
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
        ['lat', 'long'].forEach(setCoordField);
        _u('setSelVal', ['Country', rcrd.country.id, 'silent']);
    }
    function setCoordField(prefix) {
        const value = rcrd[`${prefix}itude`];
        if (!value) { return; }
        const $input = $(`#${_u('ucfirst', [prefix])}itude_row input`);
        $input.val(parseFloat(value));
    }
    function handleGeoJsonFill(geoId) {
        updateEditDetailMemory(geoId);
        storeLocGeoJson(geoId);
    }
    function storeLocGeoJson(id) {
        return _u('getData', ['geoJson'])
            .then(data => _state('setFormProp', ['top', 'geoJson', data[id]]));
    }
}
/* ------------------------- SOURCE ----------------------------------------- */
/** Fills all data for the source-type entity.  */
function fillSrcData(entity, id, src, dEntity) {
    const detail = _state('getRcrd', [dEntity, src[dEntity]]);       /*dbug-log*///console.log("fillSrcData [%s] src = %O, [%s] = %O", id, src, entity, detail);
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
function setTitleField(entity, srcRcrd) {
    const name = entity === 'publication' ?
        srcRcrd.displayName : getCitTitle(srcRcrd.citation);
    $('#Title_row input[type="text"]').val(name).change();

    function getCitTitle(citId) {
        return _state('getRcrd', ['citation', citId]).displayName;
    }
} /* End setTitleField */
function setPublisherField(entity, srcRcrd) {
    if (!_elems('ifFieldIsDisplayed', ['Publisher', 'top'])) { return; }
    _u('setSelVal', ['Publisher', srcRcrd.parent]);
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
/* ------------------------- TAXON ------------------------------------------ */
function fillTaxonData(entity, id, rcrd, dEntity) {                 /*dbug-log*///console.log('fillTaxonData. rcrd = %O', rcrd)
    _panel('fillRelationalDataInPanel', [entity, rcrd]);
}
/** ==================== FILL FIELD-DATA ==================================== */
function checkFieldsAndToggleSubmit() {
    _elems('checkReqFieldsAndToggleSubmitBttn', ['top']);
}
function fillFields(rcrd, fields) {                                 /*dbug-log*///console.log('           --fillEditFields. rcrd = %O, fields = %O', rcrd, fields);
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
    for (let field in fields) {                                     /*dbug-log*///console.log('------- Setting field [%s]', field);
        addDataToField(field, fieldHndlrs[fields[field]], rcrd);
    }
}
function ifFieldInForm(field) {
    return _elems('ifFieldIsDisplayed', [field, 'top']);
}
function addDataToField(field, fieldHndlr, rcrd) {                  /*dbug-log*///console.log("addDataToField [%s] [%O] rcrd = %O", field, fieldHndlr, rcrd);
    const fieldName = field.split(' ').join('');
    const prop = _u('lcfirst', [fieldName]);
    fieldHndlr(fieldName, prop, rcrd);
}
/** Adds multiSelect values to the form's val object. */
function setMultiSelect(field, prop, rcrd) {                        /*dbug-log*///console.log("setMultiSelect [%s] [%s] rcrd = %O", field, prop, rcrd);
    if (!rcrd[prop] || !ifFieldInForm(field)) { return; }
    const ucProp = _u('ucfirst', [prop]);
    _state('setFormFieldData', ['top', ucProp, rcrd[prop]]);
    if (!$('#sel-cntnr-'+ucProp).length) { return; } //can this be the first line here?
    _form('selectExistingAuthsOrEds', [ucProp, rcrd[prop], 'top']);
}
function setInput(field, prop, rcrd) {                              /*dbug-log*///console.log("setInputField [%s] [%s] rcrd = %O", field, prop, rcrd);
    const val = isNaN(parseInt(rcrd[prop])) ? rcrd[prop] : parseInt(rcrd[prop]);
    $('#'+field+'_row input').val(val).change();
}
function setTextArea(field, prop, rcrd) {
    $('#'+field+'_row textarea').val(rcrd[prop]).change();
}
function setSelect(field, prop, rcrd) {                             /*dbug-log*///console.log("setSelect [%s] [%s] rcrd = %O", field, prop, rcrd);
    const id = rcrd[prop] ? rcrd[prop].id ? rcrd[prop].id : rcrd[prop] : null;
    _u('setSelVal', [field, id]);
}
function setTagField(field, prop, rcrd) {                           /*dbug-log*///console.log("setTagField. rcrd = %O", rcrd)
    const tags = rcrd[prop] || rcrd.tags;
    tags.forEach(tag => _u('setSelVal', [field, tag.id]));
}