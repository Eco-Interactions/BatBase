/**
 * Handles building Options objects for comboboxes throughout the site.
 *
 * Export
 *
 * TOC
 *
 */
import { _alert, _u } from '~util';
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
    const options = buildComboboxOptions(confg, onBlur);            /*dbug-log*///console.log("initCombobox [%s] confg = %O finalConfg = %O", confg.name, confg, options);
    $(options.id).selectize(options);
    addToComboConfgMemory(confg, options);
}
function buildComboboxOptions(confg, onBlur) {
    const comboOpts = { ...getBaseComboConfg(confg), ...confg };
    comboOpts.create = getComboCreateFunc(confg.create, confg.name);
    comboOpts.placeholder = getPlaceholer(comboOpts.id, confg.name, true);
    comboOpts.onBlur = onBlur || confg.blur ? saveOrRestoreSelection : false;
    return comboOpts;
}
function getBaseComboConfg(confg) {
    return {
        id: confg.id ? confg.id : '#sel-'+confg.name.split(' ').join(''),
        onItemAdd: workAroundSelectizeEvent
    };
}
/**
 * When replacing or adding new options to a combobox, this event was causing the
 * change event to fire, even with 'silent'. No noticeable side effects to this yet...
 */
function workAroundSelectizeEvent(val) {
    let e = this._events['item_add'];
    delete this._events['item_add'];
    this.addItem(val);
    this._events['item_add'] = e;
}
function getComboCreateFunc(createFunc, name) {
    const entity = name.split(' ')[0];
    return createFunc ? onComboCreate.bind(null, createFunc, entity) : false;
}
function onComboCreate(createFunc, entity, val) {                   /*dbug-log*///console.log('--onComboCreate text?[%s]', val);
    createFunc(val);
    // return { text: `Add a new ${_u('ucfirst', [entity])}...`, value: '' };
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
    name = name.split(' Filter')[0];
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
        val.forEach(v => selApi.addItem(v, silent))
    } else {
        selApi.addItem(val, silent);
    }
}
function saveFieldValDataIfFieldTypeMustRemainedFilled(field, val) {
    if (!confgs[getFieldConfgKey(field)].onBlur) { return; }
    saveSelVal($(confgs[getFieldConfgKey(field)].id), val);
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
    $pElems.each((i, elem) => { enableCombobox(elem.id.split('sel-')[1], enable)});
}
export function enableFirstCombobox(field, enable = true, sufx = '_f-cntnr') {
    const combos = $(`#${field}${sufx} .selectized`).toArray();     /*dbug-log*///console.log("--enableFirstCombobox field[%s] sufx[%s] enable[%s] combos[%O]", field, sufx, enable, combos);
    const first = $('#'+ combos[0].id)[0].selectize;              /*dbug-log*///console.log("     --first[%O]", first);
    return enable ? first.enable() : first.disable();
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
export function focusFirstComboboxInRow(entity, focus = true, row = 1) {
    const field = $(`#${entity}_fields`)[0].childNodes[row-1].childNodes[0];/*dbug-log*///console.log("--focusFirstComboboxInRow entity[%s] field[%O]", entity, field);
    return focusFirstCombobox('#'+field.id, focus);
}
/* -------------------- REPLACE ON CHANGE ----------------------------------- */
export function updateComboChangeEvent(field, onChange) {           /*dbug-log*///console.log('--updateComboChangeEvent field[%s] onChange[%s]', field, onChange);
    const selApi = getSelApi(field);
    confgs[getFieldConfgKey(field)].onChange = onChange;
    selApi.off('change');
    selApi.on('change', onChange);
}
/* -------------------- TRIGGER CHANGE -------------------------------------- */
export function triggerComboChangeReturnPromise(field, val) {       /*dbug-log*///console.log('triggerComboChange [%s] = [%s]', field, val);
    const selApi = getSelApi(field);
    const onChange = confgs[getFieldConfgKey(field)].onChange;
    setComboVal(selApi, field, val, 'silent');
    return onChange(val);
}
/* ----------------------- DESTROY ------------------------------------------ */
export function destroySelectizeInstance(field) {
    if (!confgs[getFieldConfgKey(field)]) { return; }
    // ERROR THROWN SOMETIMES. FRUSTRATING BUG. TODO.
    // $(confgs[getFieldConfgKey(field)].id)[0].selectize.destroy();
    delete confgs[getFieldConfgKey(field)];
}
/* -------------------------- OPTIONS --------------------------------------- */
export function getOptionTotal(field) {
    const selApi = getSelApi(field);
    return Object.keys(selApi.options).length;
}
export function removeOptions(field, vals) {
    const selApi = getSelApi(field);
    vals.forEach(v => selApi.removeOption(v, 'silent'));
    /*dbug-log*///vals.forEach(v => { selApi.removeOption(v, 'silent'); console.log('removing[%s]', v); });
}
export function replaceSelOpts(field, opts) {                       /*dbug-log*///console.log('--replaceSelOpts field[%s] opts[%O]', field, opts)
    const selApi = getSelApi(field);
    clearCombobox(selApi);
    selApi.addOption(opts);
    selApi.refreshOptions(false); //Don't trigger options-dropdown
    const name = confgs[getFieldConfgKey(field)].name.split(' Filter')[0];
    updatePlaceholder(selApi, field, name, opts.length);
}
export function addOpt(field, opt) {
    const selApi = getSelApi(field);
    selApi.addOption(opt, 'silent');
}
export function removeOpt(field, val) {
    const selApi = getSelApi(field);
    selApi.removeOption(val, 'silent');
}
/* -------------------- GET VALUE FOR TEXT ---------------------------------- */
export function getOptionValueForText(field, text) {
    const selApi = getSelApi(field);
    return getValueForText(text, selApi.options);
}
function getValueForText(text, options) {
    const key = Object.keys(options).filter(o => options[o].text === text);
    return options[key].value;
}

/* ======================= HELPERS ========================================== */
function getFieldConfgKey(field) {
    return field.split(' ').join('');
}
function getSelApi(field) {
    field = getFieldConfgKey(field);                              /*dbug-log*///console.log('getSelApi [%s] = %O', field, _u('snapshot', [confgs]));
    if (!confgs[field]) { return _alert('alertIssue', ['comboboxNotFound', {field: field}]); }
    //If the combo was removed
    return $(confgs[field].id).length ? $(confgs[field].id)[0].selectize : false;
}
function isMultiSelCombo(field) {
    return !!$(confgs[getFieldConfgKey(field)].id)[0].multiple;
}
function clearCombobox(selApi) {
    selApi.clear('silent');
    selApi.clearOptions();
}
// function toggleChangeHandler(field, selApi, remove = false) {       /*dbug-log*///console.log('toggleChangeHandler [%s]remove?[%s] %O', field, remove, selApi);
//     if (remove) { return selApi.off('change'); }
//     selApi.on('change', confgs[getFieldConfgKey(field)].onChange);
// }