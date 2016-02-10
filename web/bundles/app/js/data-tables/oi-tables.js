$(function(){
	ECO_INT_FMWK.dTblMngr = {};
	var dTblMngr = ECO_INT_FMWK.dTblMngr;
	ECO_INT_FMWK.stickyOffset = 423;

	dTblMngr.initTables = function(tableName) {	/* 	lastExpt 				*/
		var tables = { 	/* 		sortCol	 pgLngth  	Col		exprt 	scroll  */
					 locs_list: [	2,	'fivehund',	9,		false,	false],
			  interaction_list: [	3,	'sevenk',	8,		false,	false],
				  loc_det_list: [	1,	'onehund',	3,		false,	false],
					 cits_list: [	1,	'fivehund',	6,		false,	false],
					 pubs_list: [	1,	'onehund',	5,		false,	false],
					auths_list: [	0,	'fivehund',	4,		false,	false],
				 int_exprt_tbl: [	0,	'sevenk',	19,		true,	true ],
				 cit_exprt_tbl: [	0,	'fivehund',	11,		true,	false],
				auth_exprt_tbl: [	0,	'fivehund',	4,		true,	false],
				  feedback_tbl: [   0,  'onehund',  5,  	true, 	false]
								};
		var tblParams = tables[tableName];
		tblParams.push('#' + tableName);
		initOiDataTable.apply(null, tblParams);

		function initOiDataTable(dfltSrtCol, pgLgthList, lastExptCol, isExprtPg, scroll, selector) {
			var xportCols = getExportColArray(lastExptCol);
			var $tableElem = $(selector);
			var editCol = $tableElem.data('editcol');
			var sortCol = $tableElem.data('sortcol') || dfltSrtCol;
			if (isExprtPg === true) { ECO_INT_FMWK.stickyOffset = 1; }
			$tableElem.DataTable(getTblCfg(sortCol, editCol, pgLgthList, xportCols, scroll));
			new $.fn.dataTable.FixedHeader( $tableElem, { header: true, headerOffset: 86 } );
			return $tableElem;

			function getExportColArray(lastShownColIdx) {
				var ary = [];
				var firstExtCol = isExprtPg ? 0 : 1;
				for (var i = firstExtCol; i <= lastShownColIdx; i++) {
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
					buttons: [	{	extend: 'copy',
									exportOptions: { columns: xportCols }
								},
								{	extend: 'csv',
									exportOptions: { columns: xportCols }
								}
							]
				};
				if (!isExprtPg) {
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

	dTblMngr.relocCtrls = function(tableName) {
		var tblFilter = '#' + tableName + "_filter";			//console.log(filter);
		var tblLength = '#' + tableName + "_length";			//console.log(length);
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
});
