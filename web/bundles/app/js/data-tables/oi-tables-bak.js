$(function(){
	ECO_INT_FMWK.dTblMngr = {};
	var dTblMngr = ECO_INT_FMWK.dTblMngr;
	ECO_INT_FMWK.stickyOffset = 423;						//How to make this variable accessible from oi.js?
	var tblId = $('.display').data("tbl");
	var tblFilter = '';			//console.log(filter);
	var tblLength = '';			//console.log(length);
	var tables = { locs_list : { selector: '#locs_list',
								sortCol: 2,
								pgLngth: 'fivehund',
								editCol: 8 },
					interaction_list: { selector: '#interaction_list',
								sortCol: 3,
								pgLngth: 'sevenk',
								editCol: 8 },
					loc_det_list: { selector: '#loc_det_list',
								sortCol: 1,
								pgLngth: 'onehund',
								editCol: 6 },
					cits_list:  { selector: '#cits_list',
								sortCol: 1,
								pgLngth: 'fivehund',
								editCol: 6 },
					pubs_list:  { selector: '#pubs_list',
								sortCol: 1,
								pgLngth: 'onehund',
								editCol: 5 },
					auths_list: { selector: '#auths_list',
								sortCol: 0,
								pgLngth: 'fivehund',
								editCol: 4 },
					int_exprt_tbl: { selector: '#int_exprt_tbl',
								sortCol: 0,
								pgLngth: 'svnkxprt',
								editCol: 19,
								exprt: true },
					cit_exprt_tbl: { selector: '#cit_exprt_tbl',
								sortCol: 0,
								pgLngth: 'fivehund',
								editCol: 11,
								exprt: true },
					auth_exprt_tbl: { selector: '#auth_exprt_tbl',
								sortCol: 0,
								pgLngth: 'fivehund',
								editCol: 5,
								exprt: true }
							};


	dTblMngr.isTbl = function() {						//		console.log("tbl is %O", tables[tblId]);
		dTblMngr.tbl = tables[tblId];					//		console.log("tbl = %O", dTblMngr.tbl);
   		var presence = dTblMngr.tbl ? true : false ;
   		return presence;
   		};/* END isTbl */

	dTblMngr.initTables = function() {
		var tbl	= dTblMngr.tbl;					//	console.log("dTblMngr.tbl = %O", tbl);
		var tblParamsAry = [];
		$.each(tbl, function(idx, val) { tblParamsAry.push(val); });	//	console.log("tblAry = %O", tblAry);
		tblFilter = tbl['selector'] + "_filter";			//console.log(filter);
		tblLength = tbl['selector'] + "_length";			//console.log(length);
		if (tbl.exprt) { ECO_INT_FMWK.stickyOffset = 0; }
		initOiDataTable.apply(null, tblParamsAry);
		//relocCtrls(filter, length);
	};/* END INIT TABLES */

	dTblMngr.relocCtrls = function() {
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

	function initOiDataTable(selector, dfltSrtCol, pgLgthList, lastExptCol) {  console.log(arguments);
		var xportCols = getExportColArray(lastExptCol);
		var $tableElem = $(selector);
		var editCol = $tableElem.data('editcol');
		var sortCol = $tableElem.data('sortcol') || dfltSrtCol;
		$tableElem.DataTable(getTblCfg(sortCol, editCol, pgLgthList, xportCols));
		new $.fn.dataTable.FixedHeader( $tableElem, { header: true, headerOffset: 86 } );
		return $tableElem;
	}
	function getTblCfg(sortCol, editCol, pgSzKey, xportCols) {
		var noSortCols = [ 0 ];
		var pgSzLists = {
			onehund: [25, 50, 100],
			fivehund: [25, 50, 100, 500],
			sevenk: [25, 50, 100, 500, 1000, 7000],
			svnkxprt: [10, 50, 100, 500, 1000, 7000]
		};
		var pgSzAry = pgSzLists[pgSzKey];
		if (editCol) {
			noSortCols.push(editCol);
		}
		return {
			"lengthMenu": pgSzAry,
			"scrollX": true,
			"scrollY": '75vh',			//Percentage of vertical height
			"columnDefs": [
				{ "orderable": false, "targets": noSortCols }
			],
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
	}

	function getExportColArray(lastShownColIdx) {
		var ary = [];
		for (var i = 1; i <= lastShownColIdx; i++) {
			ary.push(i);
		}
		return ary;
	}




});
