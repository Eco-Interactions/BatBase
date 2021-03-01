/**
 * Builds a form-field:
 * containerDiv->(alertDiv, fieldDiv->(label, input))
 * TODO: DOCUMENT
 *
 * Export
 *     getFieldElems
 *
 * TOC
 *     FIELD CONTAINER
 *     FIELD
 *         CONTAINER
 *         LABEL
 */
import { _el, _u } from '~util';

/**
 * @arg  {Object}   (f)field - Field configuration and input element.
 * @arg  {String}   [f.class] - Field style-class
 * @arg  {Object}   [f.flow] - Flex-direction class suffix.
 * @arg  {String}   [f.group] - Used for styling and intro-tutorials
 * @arg  {Str|Obj}  [f.info] - Text used for tooltip and|or intro-tutorial.
 * @arg  {Node}     *f.input - Field input element [required]
 * @arg  {String}   [f.type] - Flags edge-case field types: 'multiSelect'
 * @arg  {String}   [f.label] - Text to use for label. If false, no label is built.
 * @arg  {String}   *f.name - Field name [required] Will be used for IDs
 * @arg  {Boolean}  [f.required] - True if field is required in a containing form.
 * //TODO: Move below into input-builder validation
 * @arg  {Object}   [f.charLimits] - If present, shows user mix/max char limitations.
 * @arg  {Object}   [f.charLimits.max] - Max-character count for an input field.
 * @arg  {Object}   [f.charLimits.min] - Min-character count for an input field.
 */
let f = null;
/**
 * Builds a form field.
 * @return {Node}   containerDiv->(alertDiv, fieldDiv->(label, input))
 */
export function getFieldElems(fConfg) {                             /*dbug-log*/console.log('getFieldElems confg[%O]', fConfg);
    f = fConfg;
    const cntnr = buildContainer();
    const alertDiv = _el('getElem', ['div', { id: f.name+'_alert'}]);
    const fieldElems = getFieldLabelAndInput();
    $(cntnr).append([alertDiv, fieldElems]);
    return cntnr;
}
/* ======================== CONTAINER ======================================= */
function buildContainer() {
    const elSuffx = f.type.includes('multi') ? '_f-cntnr' : '_f';
    const attr = { class: getCntnrClass(), id: f.id+elSuffx};
    return _el('getElem', ['div', attr]);
    /** Returns the style classes for the field container. */
    function getCntnrClass() {
        const groupClass = f.group ? f.group + elSuffx : null;
        const rowClass = f.class ? f.class : null;
        return [groupClass, rowClass].filter(c => c).join(' ');
    }
}
function getFieldLabelAndInput() {
    const cntnr = buildFieldContainer(f.group, f.info, f.flow);
    const label = buildFieldLabel();
    setValidationEvents();
    $(cntnr).append([label, f.input]);
    return cntnr;
}
/* ========================= FIELD ========================================== */
function buildFieldContainer(group, info, dir = 'row') {
    const attr = { class: 'field-elems flex-'+dir, title: getInfoTxt(info)};
    const cntnr = _el('getElem', ['div', attr]);
    if (info) { addTutorialDataAttr(cntnr, group, info); }
    return cntnr;
}
function addTutorialDataAttr(cntnr, group, info) {
    $(cntnr).addClass(group+'-intro')
        .attr({
            'data-intro': getInfoTxt(info, 'intro'),
            'data-intro-group': group+'-intro'
        });
}
function getInfoTxt(info, key = 'tooltip') {
    return !info ? '' : (typeof info === 'string' ? info : info[key]);
}
/* -------------------------- LABEL ----------------------------------------- */
function buildFieldLabel() {
    if (f.label === false) { return; }
    f.label = getFieldName();
    const attr = { id: f.id+'_lbl', class: getLabelClass(), text: f.label };
    return _el('getElem', ['label', attr]);
}
function getLabelClass() {
    return f.required ? 'required' : '';
}
function getFieldName() {
    if (f.label) { return f.label; }
    return _u('addSpaceBetweenCamelCaseUnlessHyphen', [f.name]);
}
/* =========================== VALIDATION =================================== */
// Data-entry form validation handled in form module. TODO: MERGE
function setValidationEvents() {
    if (!f.val) { return; }
    const map = {
        charLimits: setCharLimitsAlertEvent
    };
    Object.keys(f.val).forEach(type => map[type]());
}
/* --------------------- INPUT CHAR-COUNT ----------------------------------- */
function setCharLimitsAlertEvent() {
    const min = f.val.charLimits.min;
    const max = f.val.charLimits.max;
    $(f.input).keyup(updateCharLimits.bind(null, field, min, max));
}
//Field bound to change event
function updateCharLimits(field, min, max, e) {
    const alert = {
        new: getCharAlert(e.target.value.length, min, max),
        old: $(`#${f.name}_alert`).text(),
        onInvalid: f.val.charLimits.onInvalid,
        onValid: f.val.charLimits.onValid
    };
    handleNewOrClearedAlert(alert, f.name);
    $(`#${f.name}_alert`).text(alert.new);
}
function getCharAlert(curCnt, min, max) {
    return curCnt < min ? `${curCnt} characters (${min} min)` :
        curCnt > max ? `${curCnt} characters (${max} max)` : '';
}
function handleNewOrClearedAlert(alert, fieldName) {
    if (alert.new && !alert.old) {
        $(`#${fieldName}_alert`).addClass('alert-active');
        alert.onInvalid();
    } else if (!alert.new && alert.old) {
        $(`#${fieldName}_alert`).removeClass('alert-active');
        alert.onValid();
    }
}