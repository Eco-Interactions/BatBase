/**
 * Initializes the Data Table library and table on certain pages.  
 */

import 'datatables';
import 'datatables.net-dt/css/jquery.dataTables.css';
import 'datatables.net-buttons';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';
import 'datatables.net-buttons/js/buttons.html5.js';
import 'datatables.net-fixedheader';
import 'datatables.net-fixedheader-dt/css/fixedHeader.dataTables.css';

export function init(tableName) { 
    const tables = {  /*      exportCol,  dataLngth  */
                feedback_tbl: [     5,  'onehund'],
                online_users_tbl:[  0,  'onehund'],
                biblio_tbl:   [     0,  'fivehund'],
                pub_pdf_tbl:   [    3,  'onehund'],
    };
    const params = tables[tableName];
    initOiDataTable(params[0], params[1], tableName);
    relocCtrls(tableName);
} 
function initOiDataTable(lastExptCol, dataLngth, tblName) {
    const xportCols = getExportColArray(lastExptCol);  
    const confg = getTblCfg(dataLngth, xportCols);                              //console.log('confg = %O', confg);
    const $tableElem = $('#' + tblName);                                        //console.log('tableElem = %O', $tableElem)
    $tableElem.DataTable(confg);
    new $.fn.dataTable.FixedHeader( $tableElem, { header: true, headerOffset: 86 } );
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
    const $filterDiv = $('#' + tableName + '_filter');
    const $pgLngthDiv = $('#' + tableName + '_length');
    const $btnDiv = $('#tbl-ctrl-div .dt-buttons');
    $btnDiv.attr('id', 'btn-div');
    $filterDiv.detach();
    $pgLngthDiv.detach();
    $btnDiv.detach();
    $('#hdr-right').append([$pgLngthDiv, $btnDiv, $filterDiv]);
};