/**
 * Selectized combobox methods.
 *
 * Export
 *     initCombobox
 *     initComboboxes
 *     getSelVal
 *     setSelVal
 *     updatePlaceholderText
 *     replaceSelOpts
 *     triggerComboChangeReturnPromise
 *
 * TOC
 *
 */
import { _db, _u } from '~db';
/** Active Selectize configuration objects. Field name (k): confg (v)  */
const confgs = {};
/**
 * Inits the combobox, using 'selectize', according to the passed config.
 * Note: The 'selectize' library turns select dropdowns into input comboboxes
 * that allow users to search by typing and, when configured, add new options
 * not in the list by triggering a sub-form for that entity.
 * {obj} confg - required: name, onChange. All other props are selectize params.
 */
export function initCombobox(confg, onBlur = false) {
    const options = buildComboboxOptions(confg, onBlur);            /*dbug-log*/console.log("initCombobox. confg = %O finalConfg = %O", confg, options);
    $(options.id).selectize(options);
    addToComboConfgMemory(confg, options);
}
function buildComboboxOptions(confg, onBlur) {
    const comboOpts = Object.assign({
        create: confg.create ? confg.create : false,
        id: confg.id ? confg.id : '#sel-'+confg.name.split(' ').join(''),
    }, confg);
    comboOpts.placeholder = getPlaceholer(comboOpts.id, confg.name, true); //confg.create
    comboOpts.onBlur = onBlur ? saveOrRestoreSelection : false;
    return comboOpts;
}
/** For multiple combos in a container, their order number is appended to the field. */
function addToComboConfgMemory(confg, options) {
    const key = confg.confgName ? confg.confgName : confg.name.split(' ').join('');
    confgs[key] = options;                                          /*dbug-log*///console.log('sel[%s] = %O', options.id, $(options.id))
}
/* ------------------------- PLACEHOLDER ------------------------------------ */
/**
 * Note: Combos that allow creating will always have that create option. The var
 * (optCnt = 0) is passed to set the placeholder as '- NONE -'.
 */
function getPlaceholer(id, name, add, optCnt) {
    optCnt = optCnt ? optCnt : $(id + ' > option').length;
    const placeholder = 'Select ' + name
    return optCnt || add ? placeholder : '- None -';
}
export function updatePlaceholderText(field, newTxt, optCnt) {      /*dbug-log*///console.log('updating placeholder text to [%s] for elem = %O', newTxt, elem);
    const selApi = getSelApi(field)
    updatePlaceholder(selApi, field, newTxt, optCnt);
}
function updatePlaceholder(selApi, field, newTxt, optCnt) {
    selApi.settings.placeholder = getPlaceholer(confgs[field].id, newTxt, false, optCnt);
    selApi.updatePlaceholder();
}
/* ---------------------- GET COMBO DATA ------------------------------------ */
export function getSelVal(field) {  //Not sure why this was needed instead of just using jquery .val()
    const selApi = getSelApi(field);                                /*dbug-log*///console.log('getSelVal [%s] = [%s]', field, selApi.getValue());
    return selApi.getValue();
}
export function getSelTxt(field) {
    return $(confgs[field].id)[0].innerText;
}
/* ---------------------- SET COMBO DATA ------------------------------------ */
export function setSelVal(field, val, silent) {                     /*dbug-log*///console.log('setSelVal [%s] (silent ? %s) = [%O]', field, silent, val);
    const selApi = getSelApi(field);
    setComboVal(selApi, field, val, silent);
    saveFieldValDataIfFieldTypeMustRemainedFilled(field, val);
}
function setComboVal(selApi, field, val, silent) {                  /*dbug-log*///console.log('%s setComboVal [%s] => [%s]. selApi = %O', silent, field, val, selApi);
    if (isMultiSelCombo(field)) {
        selApi.setValue(val, silent)
    } else if (Array.isArray(val)) {
        val.forEach(v => selApi.addItem(v, 'silent'))
    } else {
        selApi.addItem(val, 'silent');
    }
}
function saveFieldValDataIfFieldTypeMustRemainedFilled(field, val) {
    if (!confgs[field].onBlur) { return; }
    saveSelVal($(confgs[field].id), val);
}
/**
 * For comboboxes on the database page that must remain filled for the UI to stay synced.
 * onBlur: the elem is checked for a value. If one is selected, it is saved.
 * If none, the previous is restored.
 */
function saveOrRestoreSelection() {                                 /*dbug-log*///console.log('----------- saveOrRestoreSelection')
    const $elem = this.$input;
    const field = $elem.data('field');
    const prevVal = $elem.data('val');
    const curVal = getSelVal(field);
    return curVal ? saveSelVal($elem, curVal) : setSelVal(field, prevVal, 'silent');
}
function saveSelVal($elem, val) {
    $elem.data('val', val);
}
export function resetCombobox(field) {                              /*dbug-log*///console.log("resetCombobox [%s]", fields);
    const selApi = getSelApi(field);
    selApi.clear('silent');
    selApi.updatePlaceholder();     //REMOVE?    // selApi.removeOption('');  //Removes the "Creating [entity]..." placeholder.
}
/* ----------------- (EN/DIS)ABLE COMBOBOXES -------------------------------- */
export function enableCombobox(field, enable = true) {              /*dbug-log*///*console.log('enableCombobox [%s] ? [%s]', fields, enable);
    const selApi = getSelApi(field);
    if (enable === false) { return selApi.disable(); }
    selApi.enable();
}
export function enableComboboxes($pElems, enable) {
    $pElems.each((i, elem) => { enableCombobox('#'+elem.id.split('sel-')[1], enable)});
}
export function enableFirstCombobox(field, enable = true) {
    const selElems = $(`#sel-cntnr-${field} .selectized`).toArray();/*dbug-log*///console.log("[%s] first elem = %O", field, selElems);
    const firstElem = $('#'+ selElems[0].id)[0].selectize;
    return enable ? firstElem.enable() : firstElem.disable();
}
/* ------------------------- FOCUS COMBOBOX --------------------------------- */
export function focusCombobox(field, focus = true) {                /*dbug-log*///console.log("focusCombobox [%s] ? [%s]", field, focus);
    const selApi = getSelApi(field);
    return focus ? selApi.focus() : selApi.blur();
}
export function focusFirstCombobox(cntnrId, focus) {
    const selElems = $(cntnrId+' .selectized').toArray();           /*dbug-log*///console.log("focusFirstCombobox of [%s] = %O", cntnrId, selElems[0]);
    focusCombobox(selElems[0].id.split('sel-')[1], focus);
}
/* -------------------- TRIGGER CHANGE -------------------------------------- */
export function triggerComboChangeReturnPromise(field, val) {       /*dbug-log*///console.log('triggerComboChange [%s] = [%s]', field, val);
    const selApi = getSelApi(field);
    const onChange = confgs[field].onChange;
    setComboVal(selApi, field, val, 'silent');
    return onChange(val);
}
/* ----------------------- DESTROY ------------------------------------------ */
export function destroySelectizeInstance(field) {
    if (!confgs[field]) { return; }
    $('#sel-'+confgs[name].id)[0].selectize.destroy();
}

/** ==================== GET OPTIONS ======================================== */
/** --------------------- STORED DATA --------------------------------------- */
/** Builds options out of a stored entity-name object. */
export function getOptsFromStoredData(prop) {
    return _db('getData', [prop, true]).then(data => {              /*dbug-log*///console.log('getOptsFromStoredData [%s] = %O', prop, data);
        if (!data) { console.log('NO STORED DATA for [%s]', prop);return []; }
        return getOptions(data, Object.keys(data).sort());
    });
}
/** --------------------- BUILD OPTIONS ------------------------------------- */
/**
 * Builds options out of the entity-name  object. Name (k) ID (v). If an option
 * group is passed, an additional 'group' key is added that will serve as a category
 * for the options in the group.
 */
export function getOptions(entityObj, sortedKeys) {                 /*dbug-log*///console.log('getOptions = %O, order = %O', entityObj, sortedKeys);
    return Object.values(entityObj)[0].group ?
        getOptGroups(entityObj, sortedKeys) : getSimpleOpts(entityObj, sortedKeys);
}
function getEntityOpt(name, id) {                                   /*dbug-log*///console.log('getEntityOpt [%s][%s]', name, id);
    return new Option(_u('ucfirst', [name]), id);
}
/** _____________________ GROUP OPTIONS _____________________________________ */
function getOptGroups(entityObj, sortedKeys) {
    const gSorted = sortEntityDataByGroup(entityObj, sortedKeys);
    return Object.keys(gSorted).map(getOptGroup);

    function getOptGroup(gName) {                                   /*dbug-log*///console.log('getOptGroup [%s] %O', gName, gSorted[gName]);
        const $group = $(`<optgroup label="${gName}" />`);
        $group.append(...gSorted[gName]);
        return $group[0];
    }
}
function sortEntityDataByGroup(data, keys) {
    const sorted = {};
    keys.forEach(k => sortEntity(k, data[k]));
    return sorted;

    function sortEntity(name, oData) {
        if (!sorted[oData.group]) { sorted[oData.group] = []; }
        sorted[oData.group].push(getEntityOpt(name, oData.value));
    }
}
/** _____________________ SIMPLE GROUPS _____________________________________ */
function getSimpleOpts(entityObj, sortedKeys) {
    return sortedKeys.map(name => getEntityOpt(name, entityObj[name]));
}
/** ==================== OPTIONS UTIL ======================================= */
export function alphabetizeOpts(opts) {
    return opts.sort(alphaOptionObjs)
}
function alphaOptionObjs(a, b) {
    const x = a.text.toLowerCase();
    const y = b.text.toLowerCase();
    return x<y ? -1 : x>y ? 1 : 0;
}
/* -------------------- REPLACE OPTIONS ------------------------------------- */
/**
 * Note: Change event is fired when options are replaced, so the event is removed
 *  and restored after the options are updated.
 */
export function replaceSelOpts(field, opts, changeHndlr, name) {    /*dbug-log*///console.log('replaceSelOpts [%s] opts = %O, args = %O', field, opts,  arguments)
    const selApi = getSelApi(field);
    clearCombobox(selApi);
    selApi.addOption(opts);
    selApi.refreshOptions(false); //Don't trigger options-dropdown
    const onChange = changeHndlr ? changeHndlr : confgs[field].onChange;
    replaceOnChangeEvent(selApi, onChange);
    updatePlaceholder(selApi, field, confgs[field].name, opts.length);
}
function replaceOnChangeEvent(selApi, onChange = false) {           /*dbug-log*///console.log('replaceOnChangeEvent selApi = %O, onChange = %O', selApi, onChange);
    selApi.off('change');
    selApi.on('change', onChange);
}
export function removeOpt(field, val) {
    const selApi = getSelApi(field);
    selApi.removeOption(val, 'silent');
}
/* ======================= HELPERS ========================================== */
function getSelApi(field) {                                         /*dbug-log*/console.log('getSelApi [%s] = %O', field, confgs);
    if (!confgs[field]) { return _u('alertIssue', ['comboboxNotFound', {field: field}]); }
    //If the combo was removed
    return $(confgs[field].id).length ? $(confgs[field].id)[0].selectize : false;
}
function isMultiSelCombo(field) {
    return !!$(confgs[field].id)[0].multiple;
}
function clearCombobox(selApi) {
    replaceOnChangeEvent(selApi);
    selApi.clear('silent');
    selApi.clearOptions();
}
function toggleChangeHandler(field, selApi, remove = false) {       /*dbug-log*///console.log('toggleChangeHandler [%s]remove?[%s] %O', field, remove, selApi);
    if (remove) { return selApi.off('change'); }
    selApi.on('change', confgs[field].onChange);
}