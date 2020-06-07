/**
 * Handles individual entity show pages: Interaction and Taxon.
 * 
 * TOC:
 * 
 */                                                                        

initShowPage();
/* ========================== INIT SHOW PAGE ================================ */
function initShowPage () {                                          
    require('../../styles/pages/entity-show.styl');
    buildShowPage($('body').data('this-url'), $('#entity-show').data('entity'))
    setColumnSizes();
}
function buildShowPage (url, entityData) {
    const entity = getShowEntity(url);                              /*Perm-log*/console.log('   *//init[%s]ShowPage = %O', entity, entityData);
    const builder = getShowPageBuilder(entity);
    builder(entityData);
}
function getShowEntity (url) {
    return url.split('/').splice(-2, 1)[0];
}
function getShowPageBuilder (entity) {
    return {
        'interaction': buildIntShowPage, 'taxon': buildTxnShowPage
    }[entity];
}
/* ------------------------- SHOW INTERACTION ------------------------------- */
function buildIntShowPage (intData) {
    const dtlHtml = buildIntDetailsHtml(intData);
    const srcHtml = buildIntSourceHtml(intData);
    const locHtml = buildIntLocationHtml(intData);
    $('#entity-show').append([dtlHtml, srcHtml, locHtml].filter(h => h));
}
function buildIntDetailsHtml (intData) {
    return 'test'
}
function buildIntSourceHtml (intData) {
    // body... 
}
function buildIntLocationHtml (intData) {
    // body... 
}
/* --------------------------- SHOW TAXON ----------------------------------- */
function buildTxnShowPage (txnData) {

}







/* ======================== SHOW PAGE STYLES ================================ */
/* ------------------------- SET ROW COLUMN WIDTHS -------------------------- */
/**
 * Sets column flex-grow based on the percentage of the field value character count
 * of the totsl characters for all field values in this row. CSS min-width set at 122px. 
 */
function setColumnSizes () {
    $('.sect-row').each(sizeRowColumnData);
}
function sizeRowColumnData (i, el) {  
    const contentSizes = [];
    let total = 0;
    $(el.children).each(getDataCharCnt);
    $(el.children).each(setColWidth);

    function getDataCharCnt (i, field) {
        contentSizes[i] = field.children[1].innerText.length;
        total += contentSizes[i];
    }
    function setColWidth (i, field) {
        const colW = Math.round(contentSizes[i]*100/total);
        $(field.children[1]).css('flex-grow', colW);
    }
}