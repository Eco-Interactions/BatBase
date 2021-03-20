/**
 *
 *
 * Export
 *     setDisplayedFieldConfg
 *
 * TOC
 *
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
function getRowConfg(c, v, row) {
    return row.map(g => getGroupConfgs(c, v, g));
}
function getGroupConfgs(c, v, g) {
    if (Array.isArray(g)) { return getHorzGroup(c, v, g); }
    if (_u('isObj', [g])) { return getVertGroup(c, v, g); }
    return getSingleConfg(c, v, g);
}
function getHorzGroup(c, v, g) {
    return {
        class: g.class,
        confgs: g.map(f => getGroupConfgs(c, v, f)),
        dir: 'row'
    };
}
function getVertGroup(c, v, g) {
    return {
        class: g.class,
        confgs: g.fields.map(f => getGroupConfgs(c, v, f)),
        dir: 'col'
    };
}
function getSingleConfg(c, v, f) {
    return f === '' ? { emptyField: true } : getFieldConfg(c, v, f);
}
function getFieldConfg(c, v, name) {                                /*dbug-log*///console.log("   --getFieldConfg [%s] [%O]", name, c.fields[name]);
    const confg = getBaseFieldConfg();                              /*dbug-log*///console.log('       --fieldConfg [%O]', confg);
    if (confg.info) { ++c.infoSteps; }
    setFieldStyleClass(confg, c.group);
    confg.group = c.group;
    confg.pinnable = c.pinnable || false;
    setFieldValue(confg, v);
    return confg;

    function getBaseFieldConfg() {
        return c.fields[name] ? c.fields[name] : getConfgByLabel(name);
    }
    function getConfgByLabel() {
        return Object.values(c.fields).find(f => f.label === name);
    }
}
/** [setFieldStyleClass description] */
function setFieldStyleClass(fConfg, fLvl) {
    if (fConfg.class) { return; } //Style class set in form-confg   /*dbug-log*///console.log('setFieldStyleClass fConfg[%O] fLvl[%s]', fConfg, fLvl);
    fConfg.class = fLvl + '-field';
}
/** [setFieldValue description] */
function setFieldValue(f, vals) {
    const val = vals[f.label] ? vals[f.label] : vals[f.name];
    if (!val) { return; }
    f.value = val;
}