/**
 * Initializes the Data Table library and table on certain pages.
 */
import 'datatables.net';
import 'datatables.net-dt/css/jquery.dataTables.css';
import 'datatables.net-buttons';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';
import 'datatables.net-buttons/js/buttons.html5.js';

export function init(tableName) {
    const tables = {  /*      exportCol,  dataLngth  */
                feedback_tbl: [     5,  'onehund'],
                online_users_tbl:[  0,  'onehund'],
                biblio_tbl:   [     0,  'fivehund'],
                pub_pdf_tbl:   [    2,  'onehund'],
    };
    const params = tables[tableName];
    initOiDataTable([0], params[1], tableName);
    if (window.outerWidth < 1280 && tableName !== 'biblio_tbl') { return; } //Popup is displayed directing users to view page on computer.
    relocCtrls(tableName);
}
function initOiDataTable(lastExptCol, dataLngth, tblName) {
    const xportCols = getExportColArray(lastExptCol);
    const confg = getTblCfg(dataLngth, xportCols);                              //console.log('confg = %O', confg);
    const $tableElem = $('#' + tblName);                                        //console.log('tableElem = %O', $tableElem)
    $tableElem.DataTable(confg);
}
function getExportColArray(lastShownColIdx) {
    const ary = [];
    for (let i = 0; i <= lastShownColIdx; i++) {
        ary.push(i);
    }
    return ary;
}
function getTblCfg(dataLngth, xportCols) {
    const pgBreaks = {
        onehund: [25, 50, 100],
        fivehund: [25, 50, 100, 500],
        sevenk: [25, 50, 100, 500, 1000, 7000]
    };
    return {
        columnDefs: [{ orderable: false, targets: [ 0 ] }],
        lengthMenu:  pgBreaks[dataLngth],
        language: { search: 'Filter: ' },
        dom: '<"#tbl-ctrl-div"lBf>tip', //table elem display order
        buttons: [{
                extend: 'copy',
                className: 'dt-bttn',
                exportOptions: { columns: xportCols }
            },{
                extend: 'csv',
                className: 'dt-bttn',
                exportOptions: { columns: xportCols }}]
    };
}
function relocCtrls(tableName) {
    if (tableName === 'online_users_tbl') { return; }
    const $cntnr = getCntrlContainer();
    $cntnr.append(getDetachedCntrl('_filter'));
    responsivelyMovePageLengthCntrl();
    responsivelyReattachCntrls();

    function getDetachedCntrl(cntrlType) {
        return $('#' + tableName + cntrlType).detach();
    }
    function responsivelyMovePageLengthCntrl() {
        if (tableName == 'biblio_tbl' && window.outerWidth < 1220) { return; }
        $cntnr.prepend(getDetachedCntrl('_length'));
    }
    function responsivelyReattachCntrls() {
        if (window.outerWidth < 555) {
            $('#content-detail').prepend($cntnr);
        } else {
            $('#hdr-right').append($cntnr);
            ifBiblioPageMoveTableInfoAndPageSelect();
        }
    }
    function ifBiblioPageMoveTableInfoAndPageSelect() {
        if (tableName !== 'biblio_tbl') { return; }
        $('#'+tableName).before(getDetachedCntrl('_info'));
        $('#'+tableName).before(getDetachedCntrl('_paginate'));
    }
}
function getCntrlContainer() {
    const $cntnr = $('#tbl-ctrl-div .dt-buttons').detach();
    $cntnr.attr({'id': 'btn-div', 'class': 'flex-row'});
    return $cntnr;
}