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
export function buildViewConfg(c, viewSets) {                       /*dbug-log*///console.log("--setDisplayedFieldConfg confg[%O] viewSets[%O]", c, _u('snapshot', [viewSets]));
    c.infoSteps = 0;
    c.view = viewSets[c.display].map(row => getRowConfg(c, row));
}
/* ======================== PROCESS ROW-FIELDS ============================== */
function getRowConfg(c, row) {
    return row.map(g => getGroupConfgs(c, g));
}
/** Note: "group" == <td> */
function getGroupConfgs(c, g) {
    if (Array.isArray(g)) { return getHorzGroup(c, g); }
    if (_u('isObj', [g])) { return getVertGroup(c, g); }
    return getSingleConfg(c, g);
}
/* -------------------- HORIZONTAL GROUP ------------------------------------ */
function getHorzGroup(c, g) {
    return {
        class: g.class,
        confgs: g.map(f => getGroupConfgs(c, f)),
        dir: 'row'
    };
}
/* -------------------- STACKED GROUP --------------------------------------- */
function getVertGroup(c, g) {
    return {
        class: g.class,
        confgs: g.fields.map(f => getGroupConfgs(c, f)),
        dir: 'col'
    };
}
/* ======================== BUILD FIELD-CONFG =============================== */
function getSingleConfg(c, f) {
    return f === '' ? { emptyField: true } : getFieldConfg(c, f);
}
/* ------------------------- BUILDER ---------------------------------------- */
function getFieldConfg(c, name) {                                   /*dbug-log*///console.log("   --getFieldConfg [%s] [%O]", name, c.fields[name]);
    const fConfg = getBaseFieldConfg();                             /*dbug-log*///console.log('       --fieldConfg [%O]', fConfg);
    trackFieldData(fConfg, c);
    return buildFieldConfg(fConfg, c);

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
function buildFieldConfg(fConfg, c) {                            /*dbug-log*///console.log('--buildFieldConfg fConfg[%O] c[%O]', fConfg, c);
    setFieldStyleClass(fConfg, c.group);
    copyFormState(fConfg, c);
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
