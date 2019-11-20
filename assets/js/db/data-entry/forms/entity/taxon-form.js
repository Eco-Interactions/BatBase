/**
 *
 *
 * Exports:                 Imported by:
 *     finishTaxonSelectUi       forms-main
 */
import * as _forms from '../forms-main.js';

const _mmry = _forms.memory;
const _cmbx = _forms.uiCombos;
const _elems = _forms.uiElems;
const _u = _forms._util;

export function getComboEvents(entity, fieldName) {
    return {
        'Species': { change: onLevelSelection, add: initTaxonForm },
        'Family': { change: onLevelSelection, add: initTaxonForm },
        'Genus': { change: onLevelSelection, add: initTaxonForm },
        'Order': { change: onLevelSelection, add: initTaxonForm },
        'Class': { change: onLevelSelection, add: initTaxonForm },
        'Realm': { change: onRealmSelection }
    };
}
/**
 * Customizes the taxon-select form ui. Either re-sets the existing taxon selection
 * or brings the first level-combo into focus. Clears the [role]'s' combobox. 
 */
export function finishTaxonSelectUi(role) {                                     //console.log('finishTaxonSelectUi')
    const fLvl = _forms.getSubFormLvl('sub');
    const selCntnr = role === 'Subject' ? '#'+fLvl+'-form' : '#realm-lvls';
    customizeElemsForTaxonSelectForm(role);
    if (ifResettingTxn(role)) { resetPrevTaxonSelection($('#'+role+'-sel').val());
    } else { _cmbx('focusFirstCombobox', [selCntnr]); }
    _u('replaceSelOpts', ['#'+role+'-sel', []]);
}
function ifResettingTxn(role) {  
    const prevSel = _mmry('getTaxonProp', 'prevSel');
    const resetting = prevSel ? prevSel.reset : false;
    return $('#'+role+'-sel').val() || resetting;
}
export function enableTaxonLvls(disable) {
    const enable = disable == undefined ? true : false;
    $.each($('#sub-form select'), (i, sel) => _cmbx('enableCombobox', ['#'+sel.id, enable]));
}

function setTaxonParams(role, realmName, id) {                                  //console.log('setTaxonParams. args = %O', arguments)
    const tPs = _mmry('getMemoryProp', ['taxonPs']);
    tPs.realm = realmName;
    return getRealmTaxon(realmName).then(updateTaxonParams);

    function updateTaxonParams(realmTaxon) {
        tPs.realmTaxon = realmTaxon;
        tPs.curRealmLvls = tPs.allRealmLvls[realmName];
        _mmry('setMemoryProp', ['taxonPs', tPs]);
    }
}
/** Shows a New Taxon form with the only field, displayName, filled and ready to submit. */
function initTaxonForm(value) {                                                 console.log('           --initTaxonForm [%s]', value);
    const val = value === 'create' ? '' : value;
    const selLvl = this.$control_input[0].id.split('-sel-selectize')[0]; 
    const fLvl = fP.forms.taxonPs.prntSubFormLvl || getSubFormLvl('sub2'); //refact
    if (selLvl === 'Species' && !$('#Genus-sel').val()) {
        return _errs.formInitErr(selLvl, 'noGenus', fLvl);
    }
    enableTaxonLvls(false);
    showNewTaxonForm(val, selLvl, fLvl);
} 
function showNewTaxonForm(val, selLvl, fLvl) {                                  //console.log("showNewTaxonForm. val, selVal, fLvl = %O", arguments)
    fP.forms.taxonPs.formTaxonLvl = selLvl;
    buildTaxonForm().then(disableSubmitButtonIfEmpty.bind(null, '#sub2-submit', val));

    function buildTaxonForm() {
        return initEntitySubForm('taxon', fLvl, 'sml-sub-form', {'DisplayName': val}, 
            '#'+selLvl+'-sel')
            .then(appendTxnFormAndFinishBuild);
    }
    function appendTxnFormAndFinishBuild(form) {
        $('#'+selLvl+'_row').append(form);
        enableSubmitBttn('#'+fLvl+'-submit');
        $('#'+fLvl+'-hdr')[0].innerText += ' '+ selLvl;
        $('#DisplayName_row input').focus();
        if (selLvl == 'Species') { updateSpeciesSubmitBttn(fLvl); }
    }
}  /* End showTaxonForm */
function updateSpeciesSubmitBttn(fLvl) {
    $('#'+fLvl+'-submit').off('click').click(submitSpecies.bind(null, fLvl));
}
function submitSpecies(fLvl) {                                                  //console.log('submitSpecies. fLvl = %s', fLvl);
    const species = $('#DisplayName_row input')[0].value;
    if (nameNotCorrect()) { return _errs.reportFormFieldErr('Species', 'needsGenusName', fLvl); }
    getFormValuesAndSubmit('#'+fLvl+'-form',  fLvl, 'taxon');
    
    function nameNotCorrect() {
        const genus = _cmbx.getSelTxt('#Genus-sel');                                  //console.log('Genus = %s, Species = %s', genus, species);
        const speciesParts = species.split(' ');
        return genus !== speciesParts[0];
    }
}
/**
 * Removes any previous realm comboboxes. Shows a combobox for each level present 
 * in the selected Taxon realm, plant (default) or arthropod, filled with the 
 * taxa at that level. 
 */
function onRealmSelection(val) {                                                console.log("               --onRealmSelection. val = ", val)
    if (val === '' || isNaN(parseInt(val))) { return Promise.resolve(); }          
    if ($('#realm-lvls').length) { $('#realm-lvls').remove(); } 
    const fLvl = getSubFormLvl('sub');
    return _u.getData('realm')
    .then(setRealmTaxonParams)
    .then(buildAndAppendRealmRows);

    function setRealmTaxonParams(realms) {
        const realm = realms[val].slug;
        return setTaxonParams('Object', _u.ucfirst(realm)).then(() => realm);
    }
    /** A row for each level present in the realm filled with the taxa at that level.  */
    function buildAndAppendRealmRows(realm) {  
        _elems.buildFormRows(realm, {}, fLvl, fP)
        .then(rows => appendRealmRowsAndFinishBuild(realm, rows, fLvl));
    }
    function appendRealmRowsAndFinishBuild(realm, rows, fLvl) {  
        const realmElems = _u.buildElem('div', { id: 'realm-lvls' });
        $(realmElems).append(rows);
        $('#Realm_row').append(realmElems);
        fP.forms[fLvl].fieldConfg.vals.Realm = { val: null, type: 'select' };
        _cmbx('initFormCombos', [realm, fLvl]);  
        _forms.finishTaxonSelectUi('Object');          
    }
}
/** Adds a close button. Updates the Header and the submit/cancel buttons. */
function customizeElemsForTaxonSelectForm(role) {
    $('#sub-hdr')[0].innerHTML = "Select " + role + " Taxon";
    $('#sub-hdr').append(getTaxonExitButton(role));
    $('#sub-submit')[0].value = "Select Taxon";        
    $('#sub-cancel')[0].value = "Reset";
    $('#sub-submit').unbind("click").click(selectTaxon);
    $('#sub-cancel').unbind("click").click(resetTaxonSelectForm);
}
function getTaxonExitButton(role) {
    const bttn = _elems('getExitButton');
    bttn.id = 'exit-sub-form';
    $(bttn).unbind("click").click(exitTaxonSelectForm.bind(null, role));
    return bttn;
}
/** Exits sub form and restores any previous taxon selection. */
function exitTaxonSelectForm(role) {
    exitForm('#sub-form', 'sub', false);
    const prevTaxon = fP.forms.taxonPs.prevSel; 
    if (prevTaxon) {
        _cmbx.updateComboboxOptions('#'+role+'-sel', { 
            value: prevTaxon.val, text: prevTaxon.text });
        _cmbx.setSelVal('#'+role+'-sel', prevTaxon.val);
    }
}
/** Removes and replaces the taxon form. */
function resetTaxonSelectForm() {                                               //console.log('resetTaxonSelectForm')                                     
    const prevTaxonId = fP.forms.taxonPs.prevSel.val;
    const initTaxonSelectForm = fP.forms.taxonPs.realm === 'Bat' ? 
        initSubjectSelect : initObjectSelect;
    fP.forms.taxonPs.prevSel.reset = true;
    $('#sub-form').remove();
    initTaxonSelectForm();
}
/** Resets the taxon to the one previously selected in the interaction form.  */
function resetPrevTaxonSelection(selId) {                                       //console.log('seId = %s, prevSel = %O', selId, fP.forms.taxonPs.prevSel);
    const id = selId || fP.forms.taxonPs.prevSel.val; 
    if (!id) { return; }
    const taxon = fP.records.taxon[id];                                         
    if (realmTaxonPrevSelected(taxon)) { return; }                              console.log('           --resetPrevTaxonSelection. [%s] = %O', id, taxon);
    selectPrevTaxon(taxon);
}
function realmTaxonPrevSelected(taxon) { 
    return fP.forms.taxonPs.curRealmLvls[0] == taxon.level.displayName;
}
function selectPrevTaxon(taxon) {
    fP.forms.taxonPs.prevSel = {val: taxon.id, text: _forms.getTaxonDisplayName(taxon)};        
    if (ifRealmReset(taxon.realm)) { return _cmbx.setSelVal('#Realm-sel', taxon.realm.id); }
    _cmbx.setSelVal('#'+taxon.level.displayName+'-sel', taxon.id);
    window.setTimeout(() => { delete fP.forms.taxonPs.reset; }, 1000);
}
function ifRealmReset(realm) {  
    return realm.displayName !== 'Bat' && $('#Realm-sel').val() != realm.id;
}
function preventComboboxFocus(realm) {
    const role = realm === 'Bat' ? 'subject' : 'object';  
    const fLvl = fP.forms[role];
    const selCntnr = realm === 'Bat' ? '#'+fLvl+'-form' : '#realm-lvls';        
    _cmbx.focusFirstCombobox(selCntnr, false);
}
/** Adds the selected taxon to the interaction-form's [role]-taxon combobox. */
function selectTaxon() {
    const role = fP.forms.taxonPs.realm === 'Bat' ? 'Subject' : 'Object';
    const opt = getSelectedTaxonOption();
    $('#sub-form').remove();
    _cmbx.updateComboboxOptions('#'+role+'-sel', opt);
    _cmbx.setSelVal('#'+role+'-sel', opt.value);
    _cmbx.enableCombobox('#'+role+'-sel', true);
}
/** Returns an option object for the most specific taxon selected. */
function getSelectedTaxonOption() {
    const taxon = getSelectedTaxon();                                           //console.log("selected Taxon = %O", taxon);
    return { value: taxon.id, text: _forms.getTaxonDisplayName(taxon) };
}
/** Finds the most specific level with a selection and returns that taxon record. */
export function getSelectedTaxon(aboveLvl) {
    var selElems = $('#sub-form .selectized').toArray();  
    if (fP.action == 'edit' && fP.forms.top.entity == 'taxon') { selElems.reverse(); } //Taxon parent edit form.
    var selected = selElems.find(isSelectedTaxon.bind(null, aboveLvl));                              //console.log("getSelectedTaxon. selElems = %O selected = %O", selElems, selected);
    return !selected ? false : fP.records.taxon[$(selected).val()];
}
function isSelectedTaxon(clrdLvl, elem) { 
    if (elem.id.includes('-sel') && !elem.id.includes('Realm')) { 
        if (clrdLvl && lvlIsChildOfClearedLvl(elem.id.split('-sel')[0])) { return; }
        return $(elem).val(); 
    }

    function lvlIsChildOfClearedLvl(lvlName) {
        var lvls = fP.forms.taxonPs.lvls;  
        return lvls.indexOf(lvlName) > lvls.indexOf(clrdLvl);
    }
}   
/**
 * When a taxon at a level is selected, all child level comboboxes are
 * repopulated with related taxa and the 'select' button is enabled. If the
 * combo was cleared, ensure the remaining dropdowns are in sync or, if they
 * are all empty, disable the 'select' button.
 */
function onLevelSelection(val) {                                                console.log("           --onLevelSelection. val = [%s] isNaN? [%s]", val, isNaN(parseInt(val)));
    if (val === 'create') { return openLevelCreateForm(this.$input[0]); }
    if (val === '' || isNaN(parseInt(val))) { return syncTaxonCombos(this.$input[0]); } 
    const fLvl = getSubFormLvl('sub');
    repopulateCombosWithRelatedTaxa(val);
    enableSubmitBttn('#'+fLvl+'-submit');             
}
function openLevelCreateForm(selElem) {
    _forms.createSubEntity(selElem.id.split('-sel')[0]);
}
function syncTaxonCombos(elem) {                                                
    resetChildLevelCombos(getSelectedTaxon(elem.id.split('-sel')[0]));
}
function resetChildLevelCombos(selTxn) {                                        //console.log("resetChildLevelCombos. selTxn = %O", selTxn)
    const lvlName = selTxn ? selTxn.level.displayName : getRealmTopLevel();
    if (lvlName == 'Species') { return; }
    getChildlevelOpts(lvlName)
    .then(opts => repopulateLevelCombos(opts, {}));
}
function getRealmTopLevel() {
    return fP.forms.taxonPs.curRealmLvls[1];
}
function getChildlevelOpts(lvlName) { 
    var opts = {};
    var lvls = fP.forms.taxonPs.lvls;
    var lvlIdx = lvls.indexOf(lvlName)+2; //Skips selected level
    const realm = fP.forms.taxonPs.realm;

    return buildChildLvlOpts().then(() => opts);

    function buildChildLvlOpts() {
        const proms = [];
        for (var i = lvlIdx; i <= 7; i++) { 
            let p = _elems.getTaxonOpts(lvls[i-1], null, realm)
                .then(addToOpts.bind(null, i));
            proms.push(p);
        }                                                                       //console.log("getChildlevelOpts. opts = %O", opts);
        return Promise.all(proms);
    }
    function addToOpts(i, o) {  
        opts[i] = o;
    }
}
/**
 * Repopulates the comboboxes of child levels when a taxon is selected. Selected
 * and ancestor levels are populated with all taxa at the level and the direct 
 * ancestors selected. Child levels populate with only decendant taxa and
 * have no initial selection.
 * TODO: Fix bug with child taxa opt refill sometimes filling with all taxa.
 */
function repopulateCombosWithRelatedTaxa(selId) {
    var opts = {}, selected = {};                                               
    var lvls = fP.forms.taxonPs.lvls;  
    var taxon = fP.records.taxon[selId];                                        //console.log("repopulateCombosWithRelatedTaxa. taxon = %O, opts = %O, selected = %O", taxon, opts, selected);
    const realm = fP.forms.taxonPs.realm;

    taxon.children.forEach(addRelatedChild); 
    return buildUpdatedTaxonOpts()
        .then(repopulateLevelCombos.bind(null, opts, selected));

    function addRelatedChild(id) {                                              //console.log('addRelatedChild. id = ', id);
        var childTxn = fP.records.taxon[id];  
        var level = childTxn.level.id;
        addOptToLevelAry(childTxn, level);
        childTxn.children.forEach(addRelatedChild);
    }
    function addOptToLevelAry(childTxn, level) {
        if (!opts[level]) { opts[level] = []; }                                 //console.log("setting lvl = ", taxon.level)
        opts[level].push({ value: childTxn.id, text: childTxn.displayName });                                   
    }
    function buildUpdatedTaxonOpts() {
        return Promise.all([getSiblingOpts(taxon), getAncestorOpts(taxon.parent)])
        .then(buildOptsForEmptyLevels)
        .then(addCreateOpts);
    }
    function getSiblingOpts(taxon) {                                            
        return _elems.getTaxonOpts(taxon.level.displayName, null, realm).then(o => {                //console.log('getSiblingOpts. taxon = %O', taxon);
            opts[taxon.level.id] = o;
            selected[taxon.level.id] = taxon.id;
        });  
    }
    function getAncestorOpts(prntId) {                                          //console.log('getAncestorOpts. prntId = [%s]', prntId);
        var realmTaxa = [1, 2, 3, 4]; //animalia, chiroptera, plantae, arthropoda
        if (realmTaxa.indexOf(prntId) !== -1 ) { return Promise.resolve(); }
        const prntTaxon = getRcrd('taxon', prntId);
        selected[prntTaxon.level.id] = prntTaxon.id;                            
        return _elems.getTaxonOpts(prntTaxon.level.displayName, null, realm)
            .then(o => {                                                        //console.log("--getAncestorOpts - setting lvl = ", prntTaxon.level)
                opts[prntTaxon.level.id] = o;
                return getAncestorOpts(prntTaxon.parent);
            });
    }
    /**
     * Builds the opts for each level without taxa related to the selected taxon.
     * Ancestor levels are populated with all taxa at the level and will have 
     * the 'none' value selected.
     */
    function buildOptsForEmptyLevels() {                                        //console.log('buildOptsForEmptyLevels. opts = %O', _u.snapshot(opts));
        const topLvl = fP.forms.taxonPs.realm === "Arthropod" ? 3 : 5;  
        const proms = [];
        fillOptsForEmptyLevels();  
        return Promise.all(proms);

        function fillOptsForEmptyLevels() {             
            for (var i = 7; i >= topLvl; i--) {                                 //console.log('fillOptsForEmptyLevels. lvl = ', i);
                if (opts[i]) { continue; } 
                if (i > taxon.level.id) { opts[i] = []; continue; }
                buildAncestorOpts(i);
            }
        }
        function buildAncestorOpts(id) {
            selected[id] = 'none';
            proms.push(_elems.getTaxonOpts(lvls[id-1], null, realm)
                .then(o => opts[id] = o ));
        }
    }
    function addCreateOpts() {                      
        for (let lvl in opts) {                                                 //console.log("lvl = %s, name = ", lvl, lvls[lvl-1]);
            opts[lvl].unshift({ value: 'create', text: 'Add a new '+lvls[lvl-1]+'...'});
        }
        return Promise.resolve();
    }
} /* End fillAncestorTaxa */    
function repopulateLevelCombos(optsObj, selected) {                             //console.log('repopulateLevelCombos. optsObj = %O, selected = %O', optsObj, selected); //console.trace();
    var lvls = fP.forms.taxonPs.lvls;  
    Object.keys(optsObj).forEach(l => {                                         //console.log("lvl = %s, name = ", l, lvls[l-1]); 
        repopulateLevelCombo(optsObj[l], lvls[l-1], l, selected)
    });
}
/**
 * Replaces the options for the level combo. Selects the selected taxon and 
 * its direct ancestors.
 */
function repopulateLevelCombo(opts, lvlName, lvl, selected) {                   //console.log("repopulateLevelCombo for lvl = %s (%s)", lvl, lvlName);
    _u.replaceSelOpts('#'+lvlName+'-sel', opts, () => {});
    $('#'+lvlName+'-sel')[0].selectize.on('change', onLevelSelection);
    if (lvl in selected) { 
        if (selected[lvl] == 'none') { return _u.updatePlaceholderText('#'+lvlName+'-sel', null, 0); }
        _cmbx.setSelVal('#'+lvlName+'-sel', selected[lvl], 'silent'); 
    } 
}