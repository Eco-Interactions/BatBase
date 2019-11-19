/**
 * Handles individual Entity edit forms. 
 *
 * Exports:             Imported by:
 *     showEntityEditForm       db-forms
 */
import * as _u from '../../../util.js';
import * as _elems from '../ui/form-elems.js';
import * as _cmbx from '../ui/combobox-util.js';
// import * as _errs from '../validation/f-errs.js';
import * as _forms from '../forms-main.js';
import * as db_forms from '../../db-forms.js';
import * as form_ui from '../ui/form-ui.js';
import * as db_map from '../../../db-map/db-map.js';
import * as _fCnfg from '../etc/form-config.js';
import { buildFormFooter } from '../ui/form-footer.js';
import { fillRelationalDataInPanel } from '../ui/detail-panel.js';

let fP;
const _errs = _forms.err;
const _mmry = _forms.memory;

/** Shows the entity's edit form in a pop-up window on the search page. */
export function showEntityEditForm(id, entity, params) {                        console.log("       //showEntityEditForm [%s] [%s]", entity, id);                  console.log("Editing [%s] [%s]", entity, id);  
    fP = params;
    initEditForm(id, entity)
    .then(() => onEditFormLoadComplete(id, entity))
    .catch(err => _u.alertErr(err));;
}
/** Inits the edit top-form, filled with all existing data for the record. */
function initEditForm(id, entity) {  
    return getEditFormFields(id, entity)
        .then(fields => form_ui.buildAndAppendForm('top', fields, id))
        .then(hideFieldCheckboxes)
        .then(() => finishEditFormBuild(entity))
        .then(() => fillExistingData(entity, id));
}   
function hideFieldCheckboxes() {
    $('.top-pin').addClass('invis');
    return Promise.resolve();
}
/** Returns the form fields for the passed entity.  */
function getEditFormFields(id, entity) {
    const edgeCase = { 'citation': getSrcTypeFields, 'interaction': getIntFormFields, 
        'publication': getSrcTypeFields, 'taxon': getTaxonEditFields };
    const fieldBldr = entity in edgeCase ? edgeCase[entity] : buildEditFormFields;  
    fP.forms.expanded[entity] = true;
    return fieldBldr(entity, id);
}   
function getIntFormFields(entity, id) {
    return _forms.getFormFields('interaction', fP);
}
function getSrcTypeFields(entity, id) {
    const srcRcrd = db_forms.getRcrd('source', id);
    const type = db_forms.getRcrd(entity, srcRcrd[entity]);
    const typeId = type[entity+'Type'].id;
    return _forms.getSrcTypeRows(entity, typeId, 'top', type[entity+'Type'].displayName);
}
/** Returns the passed entity's form fields. */
function buildEditFormFields(entity, id) {
    const formConfg = _fCnfg.getFormConfg(entity);
    return _elems.getFormFieldRows(entity, formConfg, null, {}, 'top', fP);
}
function finishEditFormBuild(entity) {
    const hndlrs = {
        'citation': finishCitEditFormBuild, 'interaction': form_ui.finishEntityFormBuild.bind(null, 'interaction'), 
        'location': finishLocEditFormBuild, 'taxon': finishTaxonEditFormBuild,
    };
    if (entity in hndlrs) { hndlrs[entity]()  
    } else {
        _cmbx.initFormCombos(entity, 'top', fP.forms.top.selElems); 
        $('#top-cancel').unbind('click').click(form_ui.exitFormPopup);
        $('.all-fields-cntnr').hide();
    }
}
/*------------------- Fills Edit Form Fields -----------------------------*/
/** Fills form with existing data for the entity being edited. */
function fillExistingData(entity, id) {
    if (entity == 'interaction') { return fillInteractionData(id); }
    fillFormWithEntityData(entity, id);
}
function fillInteractionData(id) {
    _u.getData('interaction')
    .then(ints => {
        fP.records.interaction = ints;
        fillFormWithEntityData('interaction', id)
    });
}
function fillFormWithEntityData(entity, id) {
    addDisplayNameToForm(entity, id);
    fillEntityData(entity, id); 
    if (_elems.ifAllRequiredFieldsFilled('top')) { db_forms.toggleSubmitBttn('#top-submit', true); }
}
function addDisplayNameToForm(ent, id) {
    if (ent === 'interaction') { return; }
    const prnt = _fCnfg.getParentEntity(ent);
    const entity = prnt || ent;
    const rcrd = db_forms.getRcrd(entity, id);                                           
    $('#top-hdr')[0].innerText += ': ' + rcrd.displayName; 
    $('#det-cnt-cntnr span')[0].innerText = 'This ' + ent + ' is referenced by:';
}
/** Note: Source types will get their record data at fillSrcData. */
function fillEntityData(ent, id) {  
    const hndlrs = { 'author': fillSrcData, 'citation': fillSrcData,
        'location': fillLocData, 'publication': fillSrcData, 
        'publisher': fillSrcData, 'taxon': fillTaxonData, 
        'interaction': fillIntData };
    const rcrd = db_forms.getRcrd(ent, id);                                              console.log("   --fillEntityData [%s] [%s] = %O", ent, id, rcrd);
    hndlrs[ent](ent, id, rcrd);
}
function fillIntData(entity, id, rcrd) {  
    const fields = {
        'InteractionType': 'select', 'Location': 'select', 'Note': 'textArea', 
        'Object': 'taxon', 'Source': 'source', 'Subject': 'taxon', 
        'InteractionTags': 'tags' };
    fillFields(rcrd, fields, true);
}
function fillLocData(entity, id, rcrd) {
    const fields = _fCnfg.getCoreFieldDefs(entity);  
    handleLatLongFields();
    fillFields(rcrd, fields);
    fillRelationalDataInPanel(entity, rcrd);
    fP.editing.detail = rcrd.geoJsonId || null;
    if (rcrd.geoJsonId) { storeLocGeoJson(rcrd.geoJsonId); }
    /* Sets values without triggering each field's change method. */
    function handleLatLongFields() {
        delete fields.Latitude;
        delete fields.Longitude;
        delete fields.Country;
        $('#Latitude_row input').val(rcrd.latitude);
        $('#Longitude_row input').val(rcrd.longitude);
        _cmbx.setSelVal('#Country-sel', rcrd.country.id, 'silent');
    }
    function storeLocGeoJson(id) {                                              
        fP.forms.top.geoJson = _u.getData('geoJson').then(data => data[id]);
    }
} /* End fillLocData */
function fillTaxonData(entity, id, rcrd) {                                      //console.log('fillTaxonData. rcrd = %O', rcrd)
    fillRelationalDataInPanel(entity, rcrd);
}
/** Fills all data for the source-type entity.  */
function fillSrcData(entity, id, rcrd) { 
    var src = db_forms.getRcrd("source", id);                                            
    var detail = db_forms.getRcrd(entity, src[entity]);                                  //console.log("fillSrcData [%s] src = %O, [%s] = %O", id, src, entity, detail);
    var fields = getSourceFields(entity);                                       //console.log('fields = %O', fields)
    setSrcType()
    .then(() => {
        setSrcData();
        setDetailData();
    });
    function setSrcType() {
        if (['citation', 'publication'].indexOf(entity) == -1) { return Promise.resolve(); }
        const typeProp = entity == 'citation' ? 'citationType' : 'publicationType';
        const typeId = detail[typeProp].id;
        const typeName = detail[typeProp].displayName;
        const typeElem = $('#'+_u.ucfirst(entity)+'Type-sel')[0];
        return _forms.loadSrcTypeFields(entity, typeId, typeElem, typeName);
    }
    function setSrcData() {
        fillFields(src, fields.core);
        fillRelationalDataInPanel(entity, src);            
    }
    function setDetailData() {
        fillFields(detail, fields.detail);
        setAdditionalFields(entity, src, detail);
        fP.editing.detail = detail.id;
    }
} /* End fillSrcData */
function getSourceFields(entity) {
    return { core: _fCnfg.getCoreFieldDefs(entity), detail: _fCnfg.getFormConfg(entity).add };
}
/** ----------- Shared ---------------------------- */
function fillFields(rcrd, fields, shwAll) {                                     //console.log('rcrd = %O, fields = %O', rcrd, fields);
    const fieldHndlrs = {
        'text': setText, 'textArea': setTextArea, 'select': setSelect, 
        'fullTextArea': setTextArea, 'multiSelect': addToFormVals,
        'tags': setTagField, 'cntry': setCntry, 'source': addSource, 
        'taxon': addTaxon
    };
    for (let field in fields) {                                                 //console.log('------- Setting field [%s]', field);
        if (!db_forms.fieldIsDisplayed(field, 'top') && !shwAll) { continue; }           //console.log("field [%s] type = [%s] fields = [%O] fieldHndlr = %O", field, fields[field], fields, fieldHndlrs[fields[field]]);
        addDataToField(field, fieldHndlrs[fields[field]], rcrd);
    }  
}
function addDataToField(field, fieldHndlr, rcrd) {                              //console.log("addDataToField [%s] [%0] rcrd = %O", field, fieldHndlr, rcrd);
    var elemId = field.split(' ').join('');
    var prop = _u.lcfirst(elemId);
    fieldHndlr(elemId, prop, rcrd);
}
/** Adds multiSelect values to the form's val object. */
function addToFormVals(fieldId, prop, rcrd) {                                   //console.log("addToFormVals [%s] [%s] rcrd = %O", fieldId, prop, rcrd);
    const vals = fP.forms.top.fieldConfg.vals;
    vals[fieldId] = {type: 'multiSelect'};
    vals[fieldId].val = rcrd[prop]; 
    if (!$('#'+_u.ucfirst(prop)+'-sel-cntnr').length) { return; }
    db_forms.selectExistingAuthors(_u.ucfirst(prop), rcrd[prop], 'top');
}
function setText(fieldId, prop, rcrd) {                                         //console.log("setTextField [%s] [%s] rcrd = %O", fieldId, prop, rcrd);
    $('#'+fieldId+'_row input').val(rcrd[prop]).change();   
}
function setTextArea(fieldId, prop, rcrd) {
    $('#'+fieldId+'_row textarea').val(rcrd[prop]).change();   
}
function setSelect(fieldId, prop, rcrd) {                                       //console.log("setSelect [%s] [%s] rcrd = %O", fieldId, prop, rcrd);
    var id = rcrd[prop] ? rcrd[prop].id ? rcrd[prop].id : rcrd[prop] : null;
    _cmbx.setSelVal('#'+fieldId+'-sel', id);
}
function setTagField(fieldId, prop, rcrd) {                                     //console.log("setTagField. rcrd = %O", rcrd)
    var tags = rcrd[prop] || rcrd.tags;
    tags.forEach(tag => _cmbx.setSelVal('#'+fieldId+'-sel', tag.id));
}    
function setCntry(fieldId, prop, rcrd) {
    _cmbx.setSelVal('#Country-sel', rcrd.country.id);
}
function setAdditionalFields(entity, srcRcrd, detail) {
    setTitleField(entity, srcRcrd);
    setPublisherField(entity, srcRcrd);
    setCitationEdgeCaseFields(entity, detail);
}
function setTitleField(entity, srcRcrd) {                                       //console.log("setTitleField [%s] rcrd = %O", entity, srcRcrd)
    if (["publication", "citation"].indexOf(entity) === -1) { return; }
    const name = entity === 'publication' ? 
        srcRcrd.displayName : getCitTitle(srcRcrd.citation);
    $('#Title_row input[type="text"]').val(name).change();

    function getCitTitle(citId) {
        return db_forms.getRcrd('citation', citId).displayName;
    }
} /* End setTitleField */
function setPublisherField(entity, srcRcrd) { 
    if (entity !== 'publication' || !db_forms.fieldIsDisplayed('Publisher', 'top')) { return; }    
    _cmbx.setSelVal('#Publisher-sel', srcRcrd.parent);
}
function setCitationEdgeCaseFields(entity, citRcrd) {
    if (entity !== 'citation') { return; }
    $('#CitationText_row textarea').val(citRcrd.fullText);
    $('#Issue_row input[type="text"]').val(citRcrd.publicationIssue);
    $('#Pages_row input[type="text"]').val(citRcrd.publicationPages);
    $('#Volume_row input[type="text"]').val(citRcrd.publicationVolume);
}
function addTaxon(fieldId, prop, rcrd) {                                        //console.log("addTaxon [%s] [%O] rcrd = %O", fieldId, prop, rcrd);
    var selApi = $('#'+ fieldId + '-sel')[0].selectize;
    var taxon = fP.records.taxon[rcrd[prop]];                          
    selApi.addOption({ value: taxon.id, text: _forms.getTaxonDisplayName(taxon) });
    selApi.addItem(taxon.id);
}
function addSource(fieldId, prop, rcrd) {
    var citSrc = fP.records.source[rcrd.source];  
    _cmbx.setSelVal('#Publication-sel', citSrc.parent);
    _cmbx.setSelVal('#CitationTitle-sel', rcrd.source);
}
/* ---- On Form Fill Complete --- */
function onEditFormLoadComplete(id, entity) {                                       //console.log('onEditFormLoadComplete. entity = ', entity);
    const map = { 
        'citation': setSrcEditRowStyle, 'location': finishLocEditForm, 
        'publication': setSrcEditRowStyle };
    if (!map[entity]) { return; }
    map[entity](id);
}
function setSrcEditRowStyle() {
    form_ui.setCoreRowStyles('#form-main', '.top-row');
}
function finishLocEditForm(id) {
    db_forms.addMapToLocForm('#location_Rows', 'edit');
    finishLocFormAfterMapLoad(id);
}
function finishLocFormAfterMapLoad(id) {
    if ($('#loc-map').data('loaded')) {
        form_ui.setCoreRowStyles('#form-main', '.top-row');
        db_map.addVolatileMapPin(id, 'edit', _cmbx.getSelVal('#Country-sel'));
    } else {
        window.setTimeout(() => finishLocFormAfterMapLoad(id), 500);
    }
}

/*-------- Edit Taxon Methods ----------*/
/**
 * Returns the elements of the edit-taxon form. 
 * <div>Parent Taxon: [Level][Display-name]</> <bttnInput>"Edit Parent"</>
 * <select>[Taxon-level]</>    <input type="text">[Taxon Display-name]</>
 *     <button>Update Taxon</> <button>Cancel</>
 */
export function getTaxonEditFields(entity, id) {
    const taxon = fP.records.taxon[id];  
    const realm = taxon.realm.displayName;
    const role = realm === 'Bat' ? 'Subject' : 'Object';
    return _mmry('initTaxonParams', [role, realm])
        .then(() => buildTaxonEditFields(taxon));
}
function finishTaxonEditFormBuild() {
    $('#top-cancel').off('click').click(form_ui.exitFormPopup);
    $('#top-submit').off('click').click(submitTaxonEdit);
    initTaxonEditCombo('txn-lvl', checkForTaxonLvlErrs); 
    $('.all-fields-cntnr').hide();
}
function buildTaxonEditFields(taxon) {
    const prntElems = getPrntTaxonElems(taxon);
    const txnElems = getEditTaxonFields(taxon)
    return prntElems.concat(txnElems);
}
function getPrntTaxonElems(taxon) {                                             //console.log("getPrntTaxonElems for %O", taxon);
    const prnt = fP.records.taxon[taxon.parent]; 
    const elems = [ buildNameElem(prnt), buildEditPrntBttn(prnt) ];
    return [ buildTaxonEditFormRow('Parent', elems, 'top') ];
}
function buildNameElem(prnt) {
    var div = _u.buildElem('div', { id: 'txn-prnt' });
    setTaxonPrntNameElem(prnt, div);
    $(div).css({'padding-top': '4px'});
    return div;
}
function setTaxonPrntNameElem(prnt, elem, pText) {
    var div = elem || $('#txn-prnt')[0];
    var text = pText || _forms.getTaxonDisplayName(prnt);
    div.innerHTML = '<b>Taxon Parent</b>: &nbsp ' + text;
    if (prnt) { $(div).data('txn', prnt.id).data('lvl', prnt.level.id); }
}
function buildEditPrntBttn(prnt) {
    var bttn = _u.buildElem('input', { type: 'button', value: 'Change Parent', 
        id: 'chng-prnt', class: 'ag-fresh tbl-bttn' });
    $(bttn).click(buildParentTaxonEditFields);
    return bttn;
}
function getEditTaxonFields(taxon) {                                            //console.log("getEditTaxonFields for [%s]", taxon.displayName);
    const input = _u.buildElem('input', { id: 'txn-name', type: 'text', value: taxon.displayName });
    const lvlSel = getlvlSel(taxon, 'top')
    return [buildTaxonEditFormRow('Taxon', [lvlSel, input], 'top')];
}
function getlvlSel(taxon, fLvl) {
    const opts = getTaxonLvlOpts(taxon); 
    const sel = _u.buildSelectElem(opts, { id: 'txn-lvl' });
    $(sel).data({ 'txn': taxon.id, 'lvl': taxon.level.id });
    return sel;
}
/** Returns an array of options for the levels in the taxon's realm. */
function getTaxonLvlOpts(taxon) {
    const opts = {};
    const realmLvls = fP.forms.taxonPs.curRealmLvls.map(lvl => lvl);  
    realmLvls.shift();  //Removes the realm-level
    buildLvlOptsObj();
    return _u.buildOptsObj(opts, Object.keys(opts));

    function buildLvlOptsObj() {
        const lvls = _u.snapshot(fP.forms.taxonPs.lvls);                            //console.log('realmLvls = %O, allLvls = %O', _u.snapshot(realmLvls), _u.snapshot(lvls));
        for (let i = lvls.length - 1; i >= 0; i--) {
            if (realmLvls.indexOf(lvls[i]) != -1) { opts[lvls[i]] = i+1; }
        }
    }
}
/**
 * Returns a level select with all levels in the taxon-parent's realm and a 
 * combobox with all taxa at the parent's level and the current parent selected.
 * Changing the level select repopulates the taxa with those at the new level.
 * Entering a taxon that does not already exists will open the 'create' form.
 */
function buildParentTaxonEditFields() {   
    buildParentTaxonEditElems($('#txn-prnt').data('txn'))        
    .then(appendPrntFormElems)
    .then(finishPrntFormBuild);
}
function appendPrntFormElems(elems) {
    const cntnr = _u.buildElem("div", { class: "sml-sub-form flex-row pTaxon", id: "sub-form" });
    $(cntnr).append(elems);
    $('#Parent_row').after(cntnr);
}
function buildParentTaxonEditElems(prntId) {
    var prnt = fP.records.taxon[prntId];
    var hdr = [buildEditParentHdr()];
    var bttns = [buildFormFooter("parent", "sub", "edit", true, fP)];
    return getParentEditFields(prnt).then(fields => hdr.concat(fields, bttns));
}
function buildEditParentHdr() {
    var hdr = _u.buildElem("h3", { text: "Select New Taxon Parent", id:'sub-hdr' });
    return hdr;
}
function getParentEditFields(prnt) {  
    const realm = _u.lcfirst(prnt.realm.displayName);      
    return _forms.initEntityFormMemory(realm, 'sub', null, 'edit')
        .then(fP => _elems.buildFormRows(realm, {}, 'sub', null, fP))
        .then(modifyAndReturnPrntRows);
    
    function modifyAndReturnPrntRows(rows) {
        const realmSelRow = getRealmLvlRow(prnt);
        $(rows).css({ 'padding-left': '.7em' });
        fP.forms.taxonPs.prntSubFormLvl = 'sub2';
        return [realmSelRow, rows];
    }
}
function getRealmLvlRow(taxon) { 
    const realmLvl = fP.forms.taxonPs.curRealmLvls[0];
    const lbl = _u.buildElem('label', { text: realmLvl });
    const taxonym = _u.buildElem('span', { text: taxon.realm.displayName });
    $(taxonym).css({ 'padding-top': '.55em' });
    return buildTaxonEditFormRow(realmLvl, [lbl, taxonym], 'sub');
}
/**
 * Initializes the edit-parent form's comboboxes. Selects the current parent.
 * Hides the species row. Adds styles and modifies event listeners. 
 */
function finishPrntFormBuild() {                                                //console.log("fP = %O", fP);    
    var realmLvl = fP.forms.taxonPs.curRealmLvls[0];
    _cmbx.initFormCombos(null, 'sub', fP.forms.sub.selElems);
    selectParentTaxon($('#txn-prnt').data('txn'), realmLvl);
    $('#Species_row').hide();
    $('#'+realmLvl+'_row .field-row')[0].className += ' realm-row';
    $('#sub-submit').attr('disabled', false).css('opacity', '1');
    $('#sub-submit').off('click').click(closePrntEdit);
    $('#sub-cancel').off('click').click(cancelPrntEdit);
    setTaxonPrntNameElem(null, null, " ");
    $('#chng-prnt').attr({'disabled': true}).css({'opacity': '.6'});
    db_forms.toggleSubmitBttn('#top-submit', false);
    $('#sub-submit')[0].value = 'Select Taxon';
}
function selectParentTaxon(prntId, realmLvl) {                                  //console.log('selectParentTaxon. prntId [%s], realmLvl [%s]', prntId, realmLvl);                 
    var parentLvl = fP.records.taxon[prntId].level.displayName;  
    if (parentLvl == realmLvl) { return clearAllOtherLvls(); }
    clearAllOtherLvls();
    _cmbx.setSelVal('#'+parentLvl+'-sel', prntId);
}
function clearAllOtherLvls() {
    $.each($('#sub-form select[id$="-sel"]'), function(i, elem){ 
        $(elem)[0].selectize.clear('silent');
    });
}
function closePrntEdit() {                                                  
    var prnt =  db_forms.getSelectedTaxon() || fP.forms.taxonPs.realmTaxon;              //console.log("closePrntEdit called. prnt = %O", prnt);
    exitPrntEdit(prnt);
}
function cancelPrntEdit() {                                                     //console.log("cancelPrntEdit called.");
    var prnt = fP.records.taxon[$('#txn-prnt').data('txn')];
    exitPrntEdit(prnt);
}
function exitPrntEdit(prnt) {
    if (checkForParentLvlErrs(prnt.level.id)) { return; }
    resetAfterEditParentClose(prnt);
}
function resetAfterEditParentClose(prnt) {
    clearLvlErrs('#Parent_errs', 'sub');
    fP.forms.taxonPs.prntSubFormLvl = null;
    $('#sub-form').remove();
    $('#chng-prnt').attr({'disabled': false}).css({'opacity': '1'});
    setTaxonPrntNameElem(prnt);
    db_forms.toggleSubmitBttn('#top-submit', true);
}
/**
 * Ensures that the new taxon-level is higher than its children, and that a 
 * species taxon being edited has a genus parent selected.
 */
function checkForTaxonLvlErrs(txnLvl) {  
    var prntLvl = $('#txn-prnt').data('lvl');                                   //console.log("checkForTaxonLvlErrs. taxon = %s. parent = %s", txnLvl, prntLvl);
    var errObj = {
        'isGenusPrnt': isGenusPrnt(),
        'needsHigherLvl': lvlIsLowerThanKidLvls(txnLvl),
    };
    for (var tag in errObj) {  
        if (errObj[tag]) { return sendTxnErrRprt(tag, 'Taxon'); }
    }
    if ($('.top-active-errs').length) { _errs.clrNeedsHigherLvl(null, null, null, txnLvl); }
    checkForParentLvlErrs(prntLvl);
}
/** Returns true if the taxon's original level is Genus and it has children. */
function isGenusPrnt() {
    var orgTxnLvl = $('#txn-lvl').data('lvl');
    var txnId = $('#txn-lvl').data('txn');
    return orgTxnLvl == 6 && getHighestChildLvl(txnId) < 8;
}
/** 
 * Returns true if the passed level is lower or equal to the highest level of 
 * the taxon-being-edited's children.  
 */
function lvlIsLowerThanKidLvls(txnLvl) {                                    
    var highLvl = getHighestChildLvl($('#txn-lvl').data('txn'));                //console.log('lvlIsLowerThanKidLvls. txnLvl = %s, childHigh = %s', txnLvl, highLvl)                  
    return txnLvl >= highLvl;
}
function getHighestChildLvl(taxonId) {
    var high = 8;
    fP.records.taxon[taxonId].children.forEach(checkChildLvl);
    return high;

    function checkChildLvl(id) {
        var child = fP.records.taxon[id]
        if (child.level.id < high) { high = child.level.id; }
    }
} /* End getHighestChildLvl */
/**
 * Ensures that the parent taxon has a higher taxon-level and that a species 
 * taxon being edited has a genus parent selected.
 */
function checkForParentLvlErrs(prnt) {
    var prntLvl = prnt || $('#txn-prnt').data('lvl'); 
    var txnLvl = $('#txn-lvl').val();                                           //console.log("checkForParentLvlErrs. taxon = %s. parent = %s", txnLvl, prntLvl);
    var errs = [
        { 'needsHigherLvlPrnt': txnLvl <= prntLvl },
        { 'needsGenusPrnt': txnLvl == 7 && prntLvl != 6 }];
    var hasErrs = !errs.every(checkForErr);                                     //console.log('hasErrs? ', hasErrs)
    if (!hasErrs && $('.top-active-errs').length) {
        clearLvlErrs('#Parent_errs', 'sub'); 
    }
    return hasErrs;

    function checkForErr(errObj) {                                         
        for (var err in errObj) { 
            return errObj[err] ? sendTxnErrRprt(err, 'Parent') : true;
        }                                                                   
    }
} /* End checkForParentLvlErrs */
function sendTxnErrRprt(errTag, field) {                                              
    _errs.reportFormFieldErr(field, errTag, 'top');
    db_forms.toggleSubmitBttn('#top-submit', false);
    return false;
}
function clearLvlErrs(elemId, fLvl) {                                           //console.log('clearLvlErrs.')
    _errs.clearErrElemAndEnableSubmit($(elemId)[0], fLvl);
}
/** Inits a taxon select-elem with the selectize library. */
function initTaxonEditCombo(selId, chngFunc, createFunc) {                      //console.log("initTaxonEditCombo. selId = ", selId);
    var chng = chngFunc || Function.prototype;
    var options = { create: false, onChange: chng, placeholder: null }; 
    $('#'+selId).selectize(options);
    _cmbx.setSelVal('#'+selId, $('#'+selId).data('lvl'), 'silent');
}
/**
 * Each element is built, nested, and returned as a completed row. 
 * rowDiv>(errorDiv, fieldDiv>inputElems)
 */
function buildTaxonEditFormRow(field, inputElems, fLvl) {
    var rowDiv = _u.buildElem('div', { class: fLvl + '-row', id: field + '_row'});
    var errorDiv = _u.buildElem('div', { id: field+'_errs'}); 
    var fieldCntnr = _u.buildElem('div', { class: 'field-row flex-row'});
    $(fieldCntnr).append(inputElems);
    $(rowDiv).append([errorDiv, fieldCntnr]);
    return rowDiv;
} 
function submitTaxonEdit() {
    const vals = {
        displayName: $('#Taxon_row > div.field-row.flex-row > input[type="text"]').val(),
        level:       $('#Taxon_row select').text(),
        parentTaxon: $('#txn-prnt').data('txn')
    };                                                                          //console.log("taxon vals = %O", vals);
    db_forms.buildFormDataAndSubmit('taxon', 'top', vals);
}
/*-------- Edit Citation Methods ----------*/
function finishCitEditFormBuild() {
    _cmbx.initFormCombos('citaion', 'top', fP.forms.top.selElems); 
    $('#top-cancel').unbind('click').click(form_ui.exitFormPopup);
    $('.all-fields-cntnr').hide();
    _forms.handleSpecialCaseTypeUpdates($('#CitationType-sel')[0], 'top');
}
/*-------- Edit Location Methods ----------*/
function finishLocEditFormBuild() {  
    _cmbx.initFormCombos('Location', 'top', fP.forms.top.selElems); 
    updateCountryChangeMethod();
    db_forms.addListenerToGpsFields(
        db_map.addVolatileMapPin.bind(null, fP.editing.core, 'edit', false));
    $('#top-cancel').unbind('click').click(form_ui.exitFormPopup);
    $('.all-fields-cntnr').hide();
}
function updateCountryChangeMethod() {
    $('#Country-sel')[0].selectize.off('change');
    $('#Country-sel')[0].selectize.on('change', 
        db_forms.focusParentAndShowChildLocs.bind(null, 'edit'));
}