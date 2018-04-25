const exports = module.exports = {};  /*framePlayer init*/  
exports.stickyOffset = 423;
exports.initTables = function(tableName) {  /*  lastExpt                */
    requireJs();
    requireCss();
    initTable(tableName);
} 
function requireJs() {
    require('../../DT/js/jquery.dataTables.min.js'); 
    require('../../DT/js/dataTables.buttons.min.js');
    require('../../DT/js/buttons.html5.min.js'); 
    require('../../DT/js/dataTables.fixedHeader.min.js');
} 
function requireCss() { 
    require('../../DT/css/dataTable.css');
    require('../../DT/css/jquery.dataTables.min.css');
    require('../../DT/css/buttons.dataTables.min.css');
    require('../../DT/css/fixedHeader.dataTables.min.css');
}

function initTable(tableName) {
    var tables = {  /*      sortCol  pgLngth    Col  hideSlider scroll  */
                feedback_tbl: [   0,  'onehund',  5,    true,   false],
                biblio_tbl:   [   0,  'fivehund', 0,    false,  false],
    };
    var tblParams = tables[tableName];
    tblParams.push('#' + tableName);
    initOiDataTable.apply(null, tblParams);

    function initOiDataTable(dfltSrtCol, pgLgthList, lastExptCol, hideSlider, scroll, selector) {
        var xportCols = getExportColArray(lastExptCol);  
        var $tableElem = $(selector);
        var editCol = $tableElem.data('editcol');
        var sortCol = $tableElem.data('sortcol') || dfltSrtCol;
        if (hideSlider === true) { ECO_INT_FMWK.stickyOffset = 1; }
        $tableElem.DataTable(getTblCfg(sortCol, editCol, pgLgthList, xportCols, scroll));
        new $.fn.dataTable.FixedHeader( $tableElem, { header: true, headerOffset: 86 } );
        return $tableElem;

        function getExportColArray(lastShownColIdx) {
            var ary = [];
            for (var i = 0; i <= lastShownColIdx; i++) {
                ary.push(i);
            }
            return ary;
        }

        function getTblCfg(sortCol, editCol, pgSzKey, xportCols, scroll) {
            var colDefs = { "orderable": false, "targets": [ 0 ] };
            var pgSzLists = {
                onehund: [25, 50, 100],
                fivehund: [25, 50, 100, 500],
                sevenk: [25, 50, 100, 500, 1000, 7000]
            };
            var pgSzAry = pgSzLists[pgSzKey];
            var dataTablesCfg = {
                "lengthMenu": pgSzAry,
                "order": [[ sortCol, "asc" ]],
                "language": {
                  "search": "Filter records:"
                },
                dom: '<"#tbl-ctrl-div"lBf>tip',
                buttons: [  {   extend: 'copy',
                                exportOptions: { columns: xportCols }
                            },
                            {   extend: 'csv',
                                exportOptions: { columns: xportCols },
                                filename: 'Bat Eco-Interactions Bibliography '
                                    + new Date().today,
                            }
                        ]
            };  
            if (!hideSlider) {
                if (editCol !== false) {
                    colDefs.targets.push(editCol);
                }
                dataTablesCfg.columnDefs = [colDefs];
            }
            if (scroll === true) {
                dataTablesCfg.scrollX = true;
                dataTablesCfg.scrollY = '75vh';
            }  
            return dataTablesCfg;
        }/* End dataTblCfg */
    }  /* END initOiDataTable */
} /* END initTables */

exports.relocCtrls = function(tableName) {
    var tblFilter = '#' + tableName + "_filter";            
    var tblLength = '#' + tableName + "_length";            
    var $filterDiv = $(tblFilter);
    var $pgLngthDiv = $(tblLength);
    var $btnDiv = $( "#tbl-ctrl-div .dt-buttons" );

    $btnDiv.attr( "id", "btn-div" );
    $filterDiv.detach();
    $pgLngthDiv.detach();
    $btnDiv.detach();
    $( "#tbl-ctrls-reloc" ).append($pgLngthDiv);
    $( "#tbl-ctrls-reloc" ).append($btnDiv);
    $( "#tbl-ctrls-reloc" ).append($filterDiv);
};