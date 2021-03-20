/**
 * Update the current field view confg.
 *
 * Export
 *     setDisplayedFieldConfg
 *
 * TOC
 *     PROCESS ROW-FIELDS
 *         HORIZONTAL GROUP
 *         STACKED GROUP
 *     BUILD FIELD-CONFG
 *         BUILDER
 *         TRACK FIELD-DATA
 *         STYLES
 *         COPY FORM-CONFG
 *         SET FIELD-VALUE
 *
 */
import { _u } from '~util';
/**
 * [buildViewConfg description]
 * @param  {[type]} c        [description]
 * @param  {[type]} viewSets [description]
 * @param  {Object} vals     [description]
 * @return {[type]}          [description]
 */
export function buildViewConfg(c, viewSets, vals = {}) {    /*dbug-log*///console.log("setDisplayedFieldConfg confg[%O] viewSets[%O] vals[%O]", c, viewSets, vals);
    c.infoSteps = 0;
    c.view = viewSets[c.display].map(row => getRowConfg(c, vals, row));
}
/* ======================== PROCESS ROW-FIELDS ============================== */
function getRowConfg(c, v, row) {
    return row.map(g => getGroupConfgs(c, v, g));
}
/** Note: "group" == <td> */
function getGroupConfgs(c, v, g) {
    if (Array.isArray(g)) { return getHorzGroup(c, v, g); }
    if (_u('isObj', [g])) { return getVertGroup(c, v, g); }
    return getSingleConfg(c, v, g);
}
/* -------------------- HORIZONTAL GROUP ------------------------------------ */
function getHorzGroup(c, v, g) {
    return {
        class: g.class,
        confgs: g.map(f => getGroupConfgs(c, v, f)),
        dir: 'row'
    };
}
/* -------------------- STACKED GROUP --------------------------------------- */
function getVertGroup(c, v, g) {
    return {
        class: g.class,
        confgs: g.fields.map(f => getGroupConfgs(c, v, f)),
        dir: 'col'
    };
}
/* ======================== BUILD FIELD-CONFG =============================== */
function getSingleConfg(c, v, f) {
    return f === '' ? { emptyField: true } : getFieldConfg(c, v, f);
}
/* ------------------------- BUILDER ---------------------------------------- */
function getFieldConfg(c, v, name) {                                /*dbug-log*///console.log("   --getFieldConfg [%s] [%O]", name, c.fields[name]);
    const fConfg = getBaseFieldConfg();                             /*dbug-log*///console.log('       --fieldConfg [%O]', fConfg);
    trackFieldData(fConfg, c);
    return buildFieldConfg(fConfg, c, v);

    function getBaseFieldConfg() {
        return c.fields[name] ? c.fields[name] : getConfgByLabel(name);
    }
    function getConfgByLabel() {
        return Object.values(c.fields).find(f => f.label === name);
    }
}
/* ----------------------- TRACK FIELD-DATA --------------------------------- */
function trackFieldData(fConfg, c) {
    if (fConfg.info) { ++c.infoSteps; }
}
function buildFieldConfg(fConfg, c, v) {                            /*dbug-log*/console.log('--buildFieldConfg fConfg[%O] c[%O] v?[%O]', fConfg, c, v);
    setFieldStyleClass(fConfg, c.group);
    copyFormState(fConfg, c);
    setFieldValue(fConfg, v);
    fConfg.current = true; //Field available in at least one of the views
    return fConfg;
}
/* ----------------------- STYLES ------------------------------------------- */
/** [setFieldStyleClass description] */
function setFieldStyleClass(fConfg, fLvl) {
    if (fConfg.class) { return; } //Style class set in form-confg
    fConfg.class = fLvl + '-field';                                 /*dbug-log*///console.log('--setFieldStyleClass fConfg[%O] fLvl[%s]', fConfg, fLvl);
}
/* ----------------------- COPY FORM-CONFG ---------------------------------- */
function copyFormState(fConfg, c) {
    fConfg.group = c.group;
    fConfg.pinnable = c.pinnable || false;
}
/* ----------------------- SET FIELD-VALUE ---------------------------------- */
/** [setFieldValue description] */
function setFieldValue(f, vals) {
    const val = vals[f.label] ? vals[f.label] : vals[f.name];
    if (!val) { return; }
    f.value = val;
}
