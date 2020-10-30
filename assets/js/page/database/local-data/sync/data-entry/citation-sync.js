/**
 * When Source data is changed, all related citation fullText is regenerated.
 *
 * Export
 *     ifSourceDataEditedUpdatedCitations
 *
 * TOC
 *     UPDATE RELATED CITATIONS
 *     REGENERATE CITATIONS
 *     SERVER-DATA UPDATE
 *     LOCAL-DATA UPDATE
 */
import { _forms, _u } from '~db';
import * as db from '../../local-data-main.js';
import { updateLocalEntityData, hasEdits } from '../db-sync-main.js';

let srcRcrds;

export default function ifSourceDataEditedUpdatedCitations(data) {  /*dbug-log*///console.log('ifSourceDataEditedUpdatedCitations data = %O', data);
    if (!isSrcDataEdited(data)) { return Promise.resolve(); }
    srcRcrds = db.getMmryData('source');
    return updateRelatedCitations(data);
}
function isSrcDataEdited(data) {
    return data.core == 'source' && data.detail !== 'citation' &&
        ( hasEdits(data.coreEdits) || hasEdits(data.detailEdits) );
}
/* -------------------- UPDATE RELATED CITATIONS ---------------------------- */
/** Updates the citations for edited Authors, Publications or Publishers. */
function updateRelatedCitations(data) {                             /*dbug-log*///console.log('updateRelatedCitations. data = %O', data);
    const srcData = data.coreEntity;
    const srcType = srcData.sourceType.displayName;
    const citIds = srcType == 'Author' ? getChildCites(srcData.contributions) :
        srcType == 'Publication' ? srcData.children :
        srcType == 'Publisher' ? getChildCites(srcData.children) : false;
    if (!citIds) { return; }
    return updateCitations(citIds, getSourceDetailData());

    function getChildCites(srcs) {
        const citIds = [];
        srcs.forEach(id => {
            const src = srcRcrds[id];
            if (src.citation) { return citIds.push(id); }
            src.children.forEach(cId => citIds.push(cId))
        });
        return citIds;
    }
}
function getSourceDetailData() {
    return {
        author: db.getMmryData('author'),
        citation: db.getMmryData('citation'),
        publisher: db.getMmryData('publisher')
    }
}
/* -------------------- REGENERATE CITATIONS -------------------------------- */
function updateCitations(citIds, rcrds) {                           /*dbug-log*///console.log('updateCitations. citIds = %O, rcrds = %O', citIds, rcrds);
    const proms = [];
    citIds.forEach(id => proms.push(updateCitText(id)));
    return Promise.all(proms).then(onUpdateSuccess)

    function updateCitText(id) {
        const citSrc = srcRcrds[id];
        const params = {
            cit: rcrds.citation[citSrc.citation],
            citSrc: citSrc,
            pubSrc: srcRcrds[citSrc.parent],
            rcrds: {
                author: rcrds.author,
                publisher: rcrds.publisher,
                citation: rcrds.citation,
                source: srcRcrds
            }
        };
        const citText = _u('generateCitationText', [params]);       /*dbug-log*///console.log('citText = %O', citText)
        return updateCitationData(citSrc, citText);
    }
}
/* -------------------- SERVER-DATA UPDATE ---------------------------------- */
/** Sends ajax data to update citation and source entities. */
function updateCitationData(citSrc, text) {
    const data = { srcId: citSrc.id, text: text };
    return _u('sendAjaxQuery', [
        data, 'crud/citation/edit', Function.prototype, citUpdateErr]);
}
function citUpdateErr(e) {
     _forms('_val', ['formSubmitError', e]);
}
/* --------------------- LOCAL-DATA UPDATE ---------------------------------- */
function onUpdateSuccess(ajaxData) {
    return Promise.all(ajaxData.map(data => handledUpdatedSrcData(data)));
}
function handledUpdatedSrcData(data) {
    if (data.error) { return Promise.resolve(_forms('_val', ['errUpdatingData', ['updateRelatedCitationsErr']])); }
    return updateLocalEntityData(data.results);
}