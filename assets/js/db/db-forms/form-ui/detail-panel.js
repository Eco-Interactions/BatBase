/**
 *
 * Code Contents:
 *     INIT DETAIL PANEL
 *     ADD TO PANEL
 *         INTERACTION PANEL
 *         LOCATION PANEL
 *         SOURCE PANEL
 *         TAXON PANEL
 *     CLEAR PANELS
 *     HELPERS
 *
 * Exports:                 Imported by:
 *     clearDetailPanel             form-ui
 *     clearFieldDetailPanel        db-forms
 *     getDetailPanelElems          form-ui
 *     updateSrcDetailPanel         form-ui
 */
import * as _u from '../../util.js';
import { getRcrd, getEntityRcrds } from '../db-forms.js';



/* ===================== INIT DETAIL PANEL ================================== */
export function getDetailPanelElems(entity, id, fP) {                                      //console.log("getDetailPanelElems. action = %s, entity = %s", fP.action, fP.entity)
    var getDetailElemFunc = fP.action === 'edit' && fP.entity !== 'interaction' ?
        getSubEntityEditDetailElems : getInteractionDetailElems;
    var cntnr = _u.buildElem('div', { 'id': 'form-details' });
    var intIdStr = id ? 'Id:  ' + id : '';
    $(cntnr).append(_u.buildElem('h3', { 'text': _u.ucfirst(entity) + ' Details' }));
    $(cntnr).append(getDetailElemFunc(entity, id, cntnr));
    $(cntnr).append(_u.buildElem('p', { id: 'ent-id',  'text': intIdStr }));
    return cntnr;
}
function getInteractionDetailElems(entity, id, cntnr) {
    return ['src','loc'].map(en => initDetailDiv(en));
}
function initDetailDiv(ent) {
    var entities = {'src': 'Source', 'loc': 'Location'};
    var div = _u.buildElem('div', { 'id': ent+'-det', 'class': 'det-div' });
    $(div).append(_u.buildElem('h5', { 'text': entities[ent]+':' }));        
    $(div).append(_u.buildElem('div', { 'text': 'None selected.' }));
    return div;
}
/** Returns the elems that will display the count of references to the entity. */
function getSubEntityEditDetailElems(entity, id, cntnr) {                       console.log("getSubEntityEditDetailElems for [%s]", entity);
    var refEnts = {
        'author': [ 'cit', 'int' ],     'citation': [ 'int' ],
        'location': [ 'int' ],          'publication': ['cit', 'int' ],
        'taxon': [ 'ord', 'fam', 'gen', 'spc', 'int' ],   
        'publisher': [ 'pub', 'int']  
    };
    var div = _u.buildElem('div', { 'id': 'det-cnt-cntnr' });
    $(div).append(_u.buildElem('span'));        
    $(div).append(refEnts[entity].map(en => initCountDiv(en)));
    return div;
}
function initCountDiv(ent) { 
    var entities = { 'cit': 'Citations', 'fam': 'Families', 'gen': 'Genera', 
        'int': 'Interactions', 'loc': 'Locations', 'ord': 'Orders',
        'pub': 'Publications', 'spc': 'Species', 'txn': 'Taxa', 
    };
    var div = _u.buildElem('div', { 'id': ent+'-det', 'class': 'cnt-div flex-row' });
    $(div).append(_u.buildElem('div', {'text': '0' }));
    $(div).append(_u.buildElem('span', {'text': entities[ent] }));
    return div;
}
/* ========================== ADD TO PANEL ================================== */
/* -------------------- INTERACTION PANEL ----------------------------------- */
/**
 * When the Publication, Citation, or Location fields are selected, their data 
 * is added se the side detail panel of the form. For other entity edit-forms: 
 * the total number of referencing records is added. 
 */
function addDataToIntDetailPanel(ent, propObj) {                                //console.log('ent = [%s], propObj = %O', ent, propObj);
    var html = getDataHtmlString(propObj);   
    clearDetailPanel(ent, false, html)   
}
/** Returns a ul with an li for each data property */
function getDataHtmlString(props) {
    var html = [];
    for (var prop in props) {
        html.push('<li><b>'+prop+'</b>: '+ props[prop]+ '</li>');
    }
    return '<ul class="ul-reg">' + html.join('\n') + '</ul>';
}
/* ------------------------- LOCATION PANEL --------------------------------- */
/** Displays the selected location's data in the side detail panel. */
export function fillLocDataInDetailPanel(locRcrd) {  
    addDataToIntDetailPanel('loc', getLocDetailDataObj(locRcrd));
}
/** Returns an object with selected location's data. */
function getLocDetailDataObj(locRcrd) {  
    const data = {};
    const allData = getAllLocData(locRcrd);

    for (let field in allData) {
        if (!allData[field]) { continue; }
        data[field] = allData[field];
    }
    return data;
}
function getAllLocData(locRcrd) {
    return {
        'Name': locRcrd.displayName, 
        'Description': locRcrd.description || '',            
        'Habitat Type': locRcrd.habitatType ? locRcrd.habitatType.displayName : '', 
        'Latitude': locRcrd.latitude || '',
        'Longitude': locRcrd.longitude || '',
        'Elevation': locRcrd.elevation || '',            
        'Elevation Max': locRcrd.elevationMax || '',       
    };
}
/* ------------------------- SOURCE PANEL ----------------------------------- */
/** Adds source data to the interaction form's detail panel. */
export function updateSrcDetailPanel(entity) {                        console.log('           --updateSrcDetailPanel');
    const data = {}; 
    const srcRcrds = getEntityRcrds('source');
    buildSourceData();
    addDataToIntDetailPanel('src', data);

    function buildSourceData() {
        const pubSrc = srcRcrds[$('#Publication-sel').val()];
        const pub = getRcrd('publication', pubSrc.publication);
        const pubType = getSrcType(pub, 'publication');  
        const citId = $('#CitationTitle-sel').val();
        const citSrc = citId ? srcRcrds[citId] : false;  
        const cit = citSrc ? getRcrd('citation', citSrc.citation) : false;
        const citType = cit ? getSrcType(cit, 'citation') : false;   console.log('citation src [%s] = %O, details = %O', citId, citSrc, cit); 

        addCitationText();
        addPubTitleData();
        addCitTitleData();
        addAuths();
        addEds();
        addYear();
        addAbstract();

        function addCitationText() {
            data['Citation'] = cit ? cit.fullText : '(Select Citation)';  console.log('cit full text', cit.fullText)
        }
        function addPubTitleData() {
            const pubTitleField = pubType && pubType !== 'Other' ? 
                pubType + ' Title' : 'Publication Title';  
            data[pubTitleField] = pub.displayName;
            addDescription(pubSrc.description, pubType);

            function addDescription(desc, type) {
                if (!desc) { return; } 
                const prefix = type !== 'Other' ? type : 'Publication';
                data[prefix+' Description'] = desc;
            }
        } /* End addPubTitleData */
        function addCitTitleData() {
            const subTitle = getCitTitle();  
            if (!subTitle) { return; }
            const citTitleField = citType && citType !== 'Other' ? 
                citType + ' Title' : 'Citation Title';
            data[citTitleField] = subTitle;
            
            function getCitTitle() {  
                if (!cit) { return false; }
                return cit.displayName === pub.displayName ? false : cit.displayName;
            }
        } /* End addCitTitleData */
        function addAuths() {
            const rcrdWithAuths = pubSrc.authors ? pubSrc : 
                citSrc && citSrc.authors ? citSrc : false; 
            if (!rcrdWithAuths) { return; }
            const cnt = Object.keys(rcrdWithAuths.authors).length; 
            const prop = 'Author' + (cnt === 1 ? '' : 's'); 
            data[prop] = getAuthorNames(rcrdWithAuths);
        }
        function addEds() {  
            if (!pubSrc.editors) { return; }
            const cnt = Object.keys(pubSrc.editors).length;
            const prop = 'Editor' + (cnt === 1 ? '' : 's'); 
            data[prop] =  getAuthorNames(pubSrc, true);
        }
        function addYear() {
            const yr = pubSrc.year ? pubSrc.year : citSrc ? citSrc.year : false;
            if (!yr) { return; }
            data['Year'] = yr;
        }
        function addAbstract() {
            if (!cit || !cit.abstract) { return; }
            data.Abstract = cit.abstract;
        }
        function getSrcType(rcrd, entity) { 
            return rcrd[entity+'Type'] ? rcrd[entity+'Type'].displayName : false;
        }
    } /* End buildSourceData */
    /** Returns a comma seperated sting of all authors attributed to the source. */
    function getAuthorNames(srcRcrd, editors) {
        const authStr = [];  
        const prop = editors ? 'editors' : 'authors'; 
        for (let ord in srcRcrd[prop]) {
            let authId = srcRcrd[prop][ord];
            authStr.push(getAuthName(authId));
        }
        return authStr.length ? authStr.join('. ')+'.' : authStr;
    }
    /** Returns the name of the author with the passed id. */
    function getAuthName(id) {
        const auth = srcRcrds[id];
        return auth.displayName;  
} /* End updateSrcDetailPanel */
}
/* =========================== CLEAR PANEL ================================== */
export function clearDetailPanel(ent, reset, html) {                                   //console.log('clearDetailPanel for [%s]. html = ', ent, html)
    if (ent === 'cit') { return updateSrcDetailPanel('cit'); }
    if (ent === 'pub') { ent = 'src'; }
    const newDetails = reset ? 'None selected.' : html;
    $('#'+ent+'-det div').empty();
    $('#'+ent+'-det div').append(newDetails); 
    return Promise.resolve();
}
export function clearFieldDetailPanel(field) {
    let detailFields = {
        'Location': 'loc', 'CitationTitle': 'src', 'Publication': 'src' };
    if (Object.keys(detailFields).indexOf(field) !== -1) {  
        clearDetailPanel(detailFields[field], true);
    }
}