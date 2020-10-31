/**
 * Builds a field-row:
 * rowDiv>(alertDiv, fieldDiv>(label, input))
 *
 * Export
 *     getFieldRow
 *
 * TOC
 *     ROW CONTAINER
 *     FIELD
 *         CONTAINER
 *         LABEL
 */
import { getElem, ucfirst } from '~util';
/**
 * Builds a field-row: rowDiv->(alertDiv, fieldDiv->(label, input))
 *
 * @arg  {Object}   field - Field configuration and input element.
 * @arg  {Node}     field.input - Field input element
 * @arg  {String}   field.name - Field name
 * @arg  {String}   [field.label] - Text to use for label. If false, no label is built.
 * @arg  {String}   [field.group] - Used for styling and intro-tutorials [optional]
 * @arg  {Object}   [field.flow] - Flex-direction class suffix.
 * @arg  {String|Object} [field.info] - Text used for tooltip and|or intro-tutorial.
 * @arg  {String}   [field.rClass] - Row style-class
 * @arg  {Boolean}  [field.required] - True if field is required in a containing form.
 *
 * @arg  {Object}   [field.charLimits] - If present, shows user mix/max char limitations.
 * @arg  {Object}   [field.charLimits.max] - Max-character count for an input field.
 * @arg  {Object}   [field.charLimits.min] - Min-character count for an input field.
 *
 * @return {Node}   rowDiv->(alertDiv, fieldDiv->(label, input))
 */
export function getFieldRow(field) {                                /*dbug-log*///console.log('getFieldRow = %O', field);
    const rowDiv = buildRowContainer(field);
    const alertDiv = getElem('div', { id: field.name+'_alert'});
    const fieldElems = getFieldElems(field);
    $(rowDiv).append([alertDiv, fieldElems]);
    return rowDiv;
}
/* --------------------- ROW CONTAINER -------------------------------------- */
function buildRowContainer(field) {
    const attr = { class: getRowClasses(), id: field.name + '_row'}
    return getElem('div', attr);
    /** Returns the style classes for the row. */
    function getRowClasses() {
        const rowClass = field.input.className.includes('xlrg-field') ?
            'full-row' : getRowClass(field);
        return rowClass;
    }
}
function getRowClass(field) {
    const groupClass = field.group ? field.group + '-row ' : null;
    const rowClass = field.rClass ? field.rClass : null;
    return [groupClass, rowClass].filter(c => c).join(' ');
}
/* ========================== FIELD ========================================= */
function getFieldElems(field) {
    const cntnr = buildFieldContainer(field.group, field.info, field.flow);
    const label = buildFieldLabel(field);
    setValidationEvents(field);
    $(cntnr).append([label, field.input]);
    return cntnr;
}
/* ---------------------- CONTAINER ----------------------------------------- */
/** Note: The formLvl class is used for the form-specific tutorials.
 */
function buildFieldContainer(group, info, dir = 'row') {
    const attr = { class: 'field-elems flex-'+dir, title: getInfoTxt(info)};
    const cntnr = getElem('div', attr);
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
function buildFieldLabel(field) {
    if (field.label === false) { return; }
    const attr = { id: field.name+'_lbl', class: getLabelClass(), text: getFieldName()};
    return getElem('label', attr);

    function getLabelClass() {
        return field.required ? 'required' : '';
    }
    function getFieldName() {
        if (field.label) { return field.label; }
        const fieldName = field.name.includes('-') ?
            field.name : field.name.replace(/([A-Z])/g, ' $1'); //Adds space between pascal-cased words
        return ucfirst(fieldName).trim();
    }
}
/* ===================== VALIDATION EVENTS ================================== */
function setValidationEvents(field) {
    if (!field.val) { return; }
    const map = {
        charLimits: setCharLimitsAlertEvent
    };
    Object.keys(field.val).forEach(type => map[type](field));
}
/* --------------------- INPUT CHAR-COUNT ----------------------------------- */
function setCharLimitsAlertEvent(field) {
    const min = field.val.charLimits.min;
    const max = field.val.charLimits.max;
    $(field.input).keyup(updateCharLimits.bind(null, field, min, max));
}
function updateCharLimits(field, min, max, e) {
    const alert = {
        new: getCharAlert(e.target.value.length, min, max),
        old: $(`#${field.name}_alert`).text(),
        onInvalid: field.val.charLimits.onInvalid,
        onValid: field.val.charLimits.onValid
    };
    handleNewOrClearedAlert(alert, field.name);
    $(`#${field.name}_alert`).text(alert.new);
}
function getCharAlert(curCnt, min, max) {
    return curCnt < min ? `${curCnt} characters (${min} min)` :
        curCnt > max ? `${curCnt} characters (${max} max)` : '';
}
function handleNewOrClearedAlert(alert, fieldName) {
    if (alert.new && !alert.old) {  console.log('New alert')
        $(`#${fieldName}_alert`).addClass('alert-active'); //Used to flag form invalid. "active-alert" used to style the active-alert
        alert.onInvalid();
    } else if (!alert.new && alert.old) {  console.log('Clear alert')
        $(`#${fieldName}_alert`).removeClass('alert-active');
        alert.onValid();
    }
}