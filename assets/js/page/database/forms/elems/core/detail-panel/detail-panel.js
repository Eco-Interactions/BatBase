/**
 * The form detail-panel is used to display additional data about the entity
 * being edited, showing all related entities, or shows the contained data within
 * the interaction create/edit form (source and location details).
 *
 * Exports:
 *     clearDetailPanel
 *     clearFieldDetails
 *     fillEditEntityDetailPanel
 *     fillLocDataInDetailPanel
 *     getDetailPanelElems
 *     updateSrcDetails
 *
 * Code Contents:
 *     INIT DETAIL PANEL
 *     EDIT FORM RELATIONAL DETAILS
 *         LOCATION
 *         SOURCE
 *         TAXON
 *         HELPERS
 *     INTERACTION FORM SUB-ENTITY DETAIL PANEL
 *         LOCATION DETAILS
 *         SOURCE DETAILS
 *     CLEAR PANELS
 */
import { _el, _u } from '~util';
import { _state } from '~form';

/* ===================== INIT DETAIL PANEL ================================== */
export function getDetailPanelElems(entity, id, action) {           /*temp-log*/console.log("getDetailPanelElems action[%s] entity[%s] id?[%s]", action, entity, id);
    const cntnr = _el('getElem', ['div', { id: 'form-details', class: _u('lcfirst', [entity]) }]);
    $(cntnr).append(buildPanelHeader(entity));
    $(cntnr).append(getDetailElems(entity, action));
    $(cntnr).append(getEntityIdFooter(id));
    return cntnr;
}
function buildPanelHeader(entity) {
    const txt = entity + ' Details';
    return _el('getElem', ['h3', { 'text':  txt}]);
}
function getEntityIdFooter(id) {
    const intIdStr = id ? 'Id:  ' + id : '';
    return _el('getElem', ['p', { id: 'ent-id',  'text': intIdStr }]);
}
function getDetailElems(entity, action) {
    const builder = action === 'edit' && entity !== 'Interaction' ?
        getSubEntityEditDetailElems : getInteractionDetailElems;
    return builder(entity);
}
function getInteractionDetailElems(entity) {
    return ['src','loc'].map(en => initDetailDiv(en));
}
function initDetailDiv(ent) {
    const div = getDetailContainer(ent);
    $(div).append(getDetailHeader(ent));
    $(div).append(getInitDetailData());
    return div;
}
function getDetailContainer(ent) {
    const attr = { 'id': ent+'-det', 'class': 'det-div' };
    return  _el('getElem', ['div', attr]);
}
function getDetailHeader(ent) {
    const entities = {'src': 'Source', 'loc': 'Location'};
     return _el('getElem', ['h5', { 'text': entities[ent]+':' }]);
}
function getInitDetailData() {
    return _el('getElem', ['div', { 'text': 'None selected.' }]);
}
/** Returns the elems that will display the count of references to the entity. */
function getSubEntityEditDetailElems(entity) {                      /*dbug-log*///console.log("--getSubEntityEditDetailElems for entity[%s]", entity);
    const div = _el('getElem', ['div', { 'id': 'det-cnt-cntnr' }]);
    $(div).append(_el('getElem', ['span']));
    $(div).append(getCountElemForEachReferencedEntityType(entity));
    return div;
}
function getCountElemForEachReferencedEntityType(entity) {
    const referencedEntities = {
        Author: [ 'cit', 'int' ],
        Citation: [ 'int' ],
        Location: [ 'int' ],
        Publication: ['cit', 'int' ],
        Publisher: [ 'pub', 'int'],
        Taxon: [ 'ord', 'fam', 'gen', 'spc', 'int' ],
    };
    return referencedEntities[entity].map(initCountDiv);
}
function initCountDiv(ent) {
    const div = getCntCntnr(ent);
    $(div).append(getInitCntElem());
    $(div).append(getEntityNameElem(ent));
    return div;
}
function getCntCntnr(ent) {
    const attr = { 'id': ent+'-det', 'class': 'cnt-div flex-row' };
    return _el('getElem', ['div', attr]);
}
function getInitCntElem() {
    return _el('getElem', ['div', {'text': '0' }]);
}
function getEntityNameElem(ent) {
    const entities = { 'cit': 'Citations', 'fam': 'Families', 'gen': 'Genera',
        'int': 'Interactions', 'loc': 'Locations', 'ord': 'Orders',
        'pub': 'Publications', 'spc': 'Species', 'txn': 'Taxa',
    };
    return _el('getElem', ['span', {'text': entities[ent] }]);
}
/* ================== EDIT FORM RELATIONAL DETAILS ========================== */
export function fillEditEntityDetailPanel(id) {                     /*dbug-log*///console.log('+--fillEditEntityDetailPanel id[%s]', id);
    const entity = getFormEntity();
    const rcrd = _state('getRcrd', [_u('lcfirst', [entity]), id]);
    const map = {
        Location: fillLocDetailData,
        Source: fillSrcDetailData,
        Taxon: fillTxnDetailData
    };
    map[entity](_state('getFormState', ['top', 'name']), rcrd);
}
function getFormEntity() {
    const fState = _state('getFormState', ['top']);
    return fState.core ? fState.core : fState.name;
}
/* ----------- LOCATION --------- */
function fillLocDetailData(entity, rcrd) {
    addCntToEditFormDetailPanel({ int: rcrd.interactions.length });
}
/* ----------- SOURCE --------- */
/** Adds a count of all refences to the entity to the form's detail-panel. */
function fillSrcDetailData(entity, srcRcrd) {                       /*dbug-log*///console.log('--fillSrcDataInDetailPanel. [%s]. srcRcrd = %O', entity, srcRcrd);
    const refObj = { int: getSrcIntCnt(entity, srcRcrd) };
    addAddtionalRefs();                                             /*dbug-log*///console.log('   --refObj = %O', refObj);
    addCntToEditFormDetailPanel(refObj);

    function addAddtionalRefs() {
        if (entity === 'Citation') { return; }
        const ref = entity === 'Publisher' ? 'pub' : 'cit';
        refObj[ref] = srcRcrd.children.length || srcRcrd.contributions.length;
    }
}
function getSrcIntCnt(entity, rcrd) {                               /*dbug-log*///console.log('--getSrcIntCnt. entity[%s] rcrd[%O]', entity, rcrd);
    return entity === 'Citation' ?
        rcrd.interactions.length : getAllSourceInts(rcrd);
}
function getAllSourceInts(rcrd) {
    const srcRcrds = _state('getEntityRcrds', ['source']);
    return getTtlIntCnt(rcrd, 'interactions', srcRcrds);
}
/* ------------- TAXON --------- */
function fillTxnDetailData(entity, rcrd) {
    const txnRcrds = _state('getEntityRcrds', ['taxon']);
    const refs = {
        'int': getTtlIntCnt(rcrd, 'objectRoles', txnRcrds) +
            getTtlIntCnt(rcrd, 'subjectRoles', txnRcrds)
    };
    getTaxonChildRefs(rcrd, txnRcrds);
    addCntToEditFormDetailPanel(refs);
    adjustDetailPanelElems();

    function getTaxonChildRefs(txn) {
        txn.children.forEach(id => addChildRefData(txnRcrds[id]));
    }
    function addChildRefData(child) {
        const key = getRankKey(child)
        refs[key] += 1;
        getTaxonChildRefs(child);
    }
    function getRankKey(taxon) {
        const ranks = {'Order':'ord','Family':'fam','Genus':'gen','Species':'spc'};
        const key = ranks[taxon.rank.displayName];
        if (!refs[key]) { refs[key] = 0; }
        return key;
    }
}
function adjustDetailPanelElems() {
    $.each($('[id$="-det"] div'), (i, elem) => {
        removeIfEmpty(elem);
        useSingularTenseIfNecessary(elem);
    });
}
function removeIfEmpty(elem) {
    if (elem.innerText == 0) {  elem.parentElement.remove(); }
}
function useSingularTenseIfNecessary(elem) {
    const singular = { 'Orders': 'Order', 'Families': 'Family', 'Genera': 'Genus',
        'Species': 'Species', 'Interactions': 'Interaction' };
    if (elem.innerText == 1) {  elem.nextSibling.innerText = singular[elem.nextSibling.innerText]; }
}
/* -------- HELPERS ----------- */
/** Adds a count of realted entities to the edit form's detail panel. */
function addCntToEditFormDetailPanel(refObj) {
    for (let ent in refObj) {
        $('#'+ent+'-det div')[0].innerText = refObj[ent];
    }
}
function getTtlIntCnt(rcrd, intProp, entityRcrds) {                 /*dbug-log*///console.log('       --getTtlIntCnt prop[%s] rcrd[%O]', intProp, rcrd);
    let ints = rcrd[intProp].length;
    if (rcrd.children.length) { ints += getChildIntCnt(rcrd.children);}
    if (rcrd.contributions) { ints += getChildIntCnt(rcrd.contributions);}
    return ints;

    function getChildIntCnt(children) {
        let cnt = 0;
        children.forEach(function(child){
            child = entityRcrds[child];
            cnt += getTtlIntCnt(child, intProp, entityRcrds);
        });
        return cnt;
    }
}
/* ========== INTERACTION FORM SUB-ENTITY DETAIL PANEL ====================== */
/**
 * When the Publication, Citation, or Location fields are selected, their data
 * is added se the side detail panel of the form. For other entity edit-forms:
 * the total number of referencing records is added.
 */
function addDataToIntDetailPanel(ent, propObj) {                    /*dbug-log*///console.log('addDataToIntDetailPanel ent[%s], propObj[%O]', ent, propObj);
    const html = getDataHtmlString(propObj);
    clearDetailPanel(ent, true, html)
}
/** Returns a ul with an li for each data property */
function getDataHtmlString(props) {
    const html = [];
    for (let prop in props) {
        html.push('<li><b>'+prop+'</b>: '+ props[prop]+ '</li>');
    }
    return '<ul class="ul-reg">' + html.join('\n') + '</ul>';
}
/* --------- LOCATION DETAILS --------- */
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
/* ----------- SOURCE DETAILS --------- */
/** Adds source data to the interaction form's detail panel. */
export function updateSrcDetails(entity) {                                      //console.log('           --updateSrcDetails');
    const data = {};
    const srcRcrds = _state('getEntityRcrds', ['source']);
    buildSourceData();
    addDataToIntDetailPanel('src', data);

    function buildSourceData() {
        const pubSrc = srcRcrds[$('#sel-Publication').val()];
        const pub = _state('getRcrd', ['publication', pubSrc.publication]);
        const pubType = getSrcType(pub, 'publication');
        const citId = $('#sel-CitationTitle').val();
        const citSrc = citId ? srcRcrds[citId] : false;
        const cit = !citSrc ? false :  _state('getRcrd', ['citation', citSrc.citation]);
        const citType = cit ? getSrcType(cit, 'citation') : false;              //console.log('citation src [%s] = %O, details = %O', citId, citSrc, cit);

        addCitationText();
        addPubTitleData();
        addCitTitleData();
        addAuths();
        addEds();
        addYear();
        addAbstract();

        function addCitationText() {
            data['Citation'] = cit ? cit.fullText : '(Select Citation)';        //console.log('cit full text', cit.fullText)
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
            if (!subTitle || subTitle.includes('(citation)')) { return; }
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
            const lc = _u('lcfirst', [entity]);
            return rcrd[lc+'Type'] ? rcrd[lc+'Type'].displayName : false;
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
    }
}
/* =========================== CLEAR PANEL ================================== */
export function clearDetailPanel(ent, reset, html) {                            //console.log('clearDetailPanel for [%s]. html = ', ent, html)
    if (ent === 'cit') { return updateSrcDetails('cit'); }
    if (ent === 'pub') { ent = 'src'; }
    const newDetails = reset ? html : 'None selected.';
    $('#'+ent+'-det div').empty();
    $('#'+ent+'-det div').append(newDetails);
    return Promise.resolve();
}
export function clearFieldDetails(field) {
    let detailFields = {
        'Location': 'loc', 'CitationTitle': 'src', 'Publication': 'src' };
    if (Object.keys(detailFields).indexOf(field) !== -1) {
        clearDetailPanel(detailFields[field]);
    }
}