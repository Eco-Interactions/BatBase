(function(){  console.log("Anything you can do, you can do awesome...");
	/**
	 * openRow = The identifier for the row in datagrid to be expanded on grid-load
	 */
	var gridDiv, openRow, rowData = [], columnDefs = [];
	var gridOptions = {
	    columnDefs: getColumnDefs(),
	    rowData: rowData,
	    // debug: true,
	    getNodeChildDetails: getNodeChildDetails
        // rowSelection: 'multiple',
        // rowsAlreadyGrouped: true,
        // enableColResize: true,
        // enableSorting: true,
        // unSortIcon: true,
        // showToolPanel: true,
        // toolPanelSuppressValues: true,
        // toolPanelSuppressPivot: true,
        // enableFilter: true,
        // rowHeight: 26,
        // onRowClicked: rowClicked
	};

	document.addEventListener('DOMContentLoaded', onDOMContentLoaded); 

	function onDOMContentLoaded () {
		$("select[name='search-focus']").change(selectSearchFocus);

		selectSearchFocus();
	}
	function loadGrid(gridOpts) {
		var gridOptObj = gridOpts || gridOptions;
	    gridDiv = document.querySelector('#search-grid');
	    new agGrid.Grid(gridDiv, gridOptObj);
	}

	function selectSearchFocus(e) {
	    if ( $('#search-focus').val() == 'taxa' ) { getDomains();  }
	}
/*------------------AG Grid Methods-------------------------------------------*/
	function getColumnDefs() {
		return [{headerName: "Taxa Tree", field: "name", width: 300, cellRenderer: 'group', 
					cellRendererParams: { innerRenderer: innerCellRenderer }
        		},
			    {headerName: "Subject Taxon", field: "subject"},
			    {headerName: "Object Taxon", field: "object"},
			    {headerName: "Interaction Type", field: "interactionType"},
			    {headerName: "Tags", field: "tags"},
			    {headerName: "Habitat Type", field: "habitatType"},
			    {headerName: "Country", field: "country"},
			    {headerName: "Location Description", field: "location"},
			    {headerName: "Citation", field: "citation"},
			    {headerName: "Note", field: "note"}];
	}
	function innerCellRenderer(params) { // console.log("params in cell renderer = %O", params)
		return params.data.name || null;
	}
	function getNodeChildDetails(rcrd) {	//	console.log("rcrd = %O", rcrd)	
	    if (rcrd.isParent) {
	        return {
	            group: true,
	            expanded: rcrd.open,
	            children: rcrd.children
	        };
	    } else {
	        return null;
	    }
  	}
	function loadTaxaGrid(taxaTree, opentaxa) {
		var topTaxaRows = [];
		for (var taxon in taxaTree) {
			topTaxaRows.push( getRowData(taxaTree[taxon]) );
		}
		topTaxaRows.forEach(function(taxaRowAry){ $.merge(rowData, taxaRowAry);	});  console.log("final rows = %O", rowData);

		loadGrid();
	}
	function getRowData(taxon) {//   console.log("getRowData called for %s = %O. arguments = %O", taxon.displayName, taxon, arguments);
		var isParent = taxon.children !== null; 
		var rows = [];
		rows.push({
			name: taxon.displayName,
			isParent: taxon.interactions !== null || taxon.children !== null,
			open: taxon.slug === openRow,
			children: getRowDataForChildren(taxon),
			// data: {
	  //           "note": null,
	  //           "citation": "Willig, M. R., G. R. Camilo & S. J. Noble. 1993",
	  //           "interactionType": "Consumption",
	  //           "subject": "Artibeus planirostris",
	  //           "object": "Arachnida",
	  //           "location": "Chapada do Araripe in the Floresta Nacional Araripe-Apodí",
	  //           "country": "Brazil",
	  //           "habitatType": "Desert"
			// }
          
		});

		// getTaxaInteractions(taxon);
		
		return rows;
		
	} /* End getRowData */
	function getTaxaInteractions(taxon) {
		var ints = [];
		for (var role in taxon.interactions) {
			if ( taxon.interactions[role].length >= 1 ) {
				taxon.interactions[role].forEach(function(intRcrd){
					ints.push( getIntData(intRcrd) );
				});
			}
		}
		return ints;
	}
	function getIntData(intRcrd) {
		var skipFields = ['id', 'tags'];
		var rowData = {};

		for (var field in intRcrd) {
			if ( skipFields.indexOf(field) !== -1 ) { continue; }
			if ( field === "subject" || field === "object" ) {
				rowData[field] = getTaxonName(intRcrd[field]);	
			} else {
				rowData[field] = intRcrd[field];
			}
		}   // console.log("getIntData called. rowData = %O", rowData);
		return rowData;
	}
	function getTaxonName(taxaData) {  console.log("taxaData = %O", taxaData)
		return taxaData.level == "Species" ? 
				taxaData.name : 
				taxaData.level + ' ' + taxaData.name;
	}
	function getRowDataForChildren(parent) {
		var chldData = [];
		var tempChldArys = [];

		for (var childKey in parent.children) {
			if (parent.children !== null) {tempChldArys.push( getRowData(parent.children[childKey]) )}
		}

		tempChldArys.push(getTaxaInteractions(parent));

		tempChldArys.forEach(function(ary){
			$.merge(chldData, ary);
		});		//	console.log("chldData = %O", chldData);

		return chldData;
	}
		// parent: true,
            // open: true,
            // name: 'C:',
            // children: [
            //     {folder: true,
            //         name: 'Windows',
            //         size: '',
            //         type: 'File Folder',
            //         dateModified: '27/02/2014 04:12',
            //         children: [
            //             {name: 'bfsve.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'},
            //             {name: 'csup.txt', size: '1 kb', type: 'Text Document', dateModified: '27/11/2012 04:12'},
            //             {name: 'diagwrn.xml', size: '21 kb', type: 'XML File', dateModified: '18/03/2014 00:56'}
            //         ]
            //     },
// var columnDefs = [
//     {headerName: "Taxa Tree", field: "name"},
//     {headerName: "Subject", field: "subject"}
//     {headerName: "Object", field: "object"}
//     {headerName: "Interaction Type", field: "interactionType"},
//     {headerName: "Tags", field: "tags"},
//     {headerName: "Habitat Type", field: "habitatType"}
//     {headerName: "Country", field: "country"}
//     {headerName: "Location Description", field: "location"}
//     {headerName: "Citation", field: "citation"}
//     {headerName: "Note", field: "note"}
// ];/*------------------Taxa Search Methods---------------------------------------*/
	function getDomains() {
		var dataPkg = {
			repo: 'domain',
			repoQ: 'findAll',
			props: ['slug', 'name']		//Idx0 = findOneBy
		};
		sendAjaxQuery(dataPkg, 'ajax/search', showTaxonSearchMethods)
	}
	function showTaxonSearchMethods(data) {  console.log("data recieved. %O", data);
		buildTaxaSearchHtml(data);
		$("input[name='searchMethod']").change(taxaSearchMethod);

		taxaSearchMethod();
	}
	function taxaSearchMethod(e) { console.log("change fired");
	    if ( $('input[name="searchMethod"]:checked').val() == 'textSearch' ) {
	   		$("input[name='textEntry']").attr('disabled', false);
	   		$('#sel-domain').attr('disabled', true);
	    } else {  // Browse Taxa Names
	        $("input[name='textEntry']").attr('disabled', true);
	   		$('#sel-domain').attr('disabled', false);
			$('#sel-domain').change(selectTaxaDomain);

			selectTaxaDomain();
	    }
	}
	function selectTaxaDomain(e) {
    	if ( $('#sel-domain').val() === 'bat' ) { console.log("bats is selected") }  //showBatLevels();
    	if ( $('#sel-domain').val() === 'arthropod' ) { showBugLevels(); console.log("bugs is selected") }  //showBatLevels();
	}
	function showBugLevels() {
		var params = {
			repo: 'domain',
			id: 'arthropod',
			props: ['displayName', 'slug' ],
			refProps: ['parentTaxon', 'level'],
			roles: ['ObjectRoles']
		};
		openRow = 'arthropoda';		//Row in datagrid will be expanded on load
		sendAjaxQuery(params, 'ajax/search/taxa', buildBugLvlHtml);
	}
	function buildBugLvlHtml(data) { console.log("Success is yours. Data = %O", data);
		var taxaIntRcrds = separateByLevel(data.results);   console.log("taxaIntRcrds = %O", taxaIntRcrds);
		var elems = buildBugSelects(buildLvlOptions(taxaIntRcrds));

		$('#opts-row2').append(elems);

		loadTaxaGrid( buildTaxaTree(taxaIntRcrds['Phylum'], data['results']) );
	}
	function buildTaxaTree(toplvltaxa, taxaObj) { 
		var tree = {}
		for (var taxon in toplvltaxa) {  //console.log("toplvltaxa[taxon] = %O", toplvltaxa[taxon])
			tree[taxon] = toplvltaxa[taxon];  
			toplvltaxa[taxon].children = getChildTaxa(toplvltaxa[taxon].children, taxaObj);
		} console.log("tree = %O", tree);
		return tree;

		function getChildTaxa(children, taxaObj) { // console.log("get Child Taxa called. arguments = %O", arguments);
			return children.map(function(childId){
				var child = taxaObj[childId]; //console.log("childId = %s, child = %O", childId, child);

				if (child.children.length >= 1) { 
					child.children = getChildTaxa(child.children, taxaObj);
				} else {
					child.children = null;
				}

				return child;
			});
		}
	}
	function buildBugSelects(lvlOpts) {
		var selElems = [];
		selElems.push(createElem('span', { text: "Class: " }));
		selElems.push(buildSelectElem(lvlOpts.Class, { class: "opts-box", id: "selClass" }));
		selElems.push(createElem('span', { text: "Order: " }));
		selElems.push(buildSelectElem(lvlOpts.Order, { class: "opts-box", id: "selOrder" }));
		selElems.push(createElem('span', { text: "Family: " }));
		selElems.push(buildSelectElem(lvlOpts.Family, { class: "opts-box", id: "selFam" }));
		selElems.push(createElem('span', { text: "Genus: " }));
		selElems.push(buildSelectElem(lvlOpts.Genus, { class: "opts-box", id: "selGenus" }));
		selElems.push(createElem('span', { text: "Species: " }));
		selElems.push(buildSelectElem(lvlOpts.Species, { class: "opts-box", id: "selSpecies" }));
		return selElems;
	}
	function buildLvlOptions(rcrds) {
		var optsObj = {};
		for (var lvl in rcrds) {
			var taxaNames = Object.keys(rcrds[lvl]).sort(); //console.log("taxaNames = %O", taxaNames);
			optsObj[lvl] = buildTaxaOptions(taxaNames, rcrds[lvl]);
		}
		return optsObj;
	}
	function buildTaxaOptions(taxaNames, rcrds) {
		return taxaNames.map(function(taxaKey){
			return {
				value: rcrds[taxaKey].slug,
				text: taxaKey
			};
		});
	}
	function separateByLevel(rcrds) {
		var levels = ['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'];
		var topLvl = 6;
		var separated = {};

		for (var taxon in rcrds){
			if (separated[rcrds[taxon].level] === undefined) { separated[rcrds[taxon].level] = {}; }
			// Not doing anything with top level currently, but during refactor it may be more useful.
			if (levels.indexOf(rcrds[taxon].level) < topLvl) { topLvl = levels.indexOf(rcrds[taxon].level); }
			
			separated[rcrds[taxon].level][rcrds[taxon].displayName] = rcrds[taxon];
		}
		return separated;
	}
	function buildTaxaSearchHtml(data) {
		var txtSearchElems = buildTxtSearchElems();
		var browseElems = buildBrowseElems();
		var domainOpts = getDomainOpts(data.results); console.log("domainOpts = %O", domainOpts);
		$(browseElems).append(buildSelectElem(domainOpts, { class: 'opts-box', id: 'sel-domain' }));

		$('#focus-top-opts').append([txtSearchElems, browseElems]);
		/*-- Init State --*/
		$('input[name="searchMethod"][value=browseSearch]').prop('checked', true);
		$('#sel-domain').val('arthropod');

        function getDomainOpts(data) {
        	var optsAry = [];
        	for (var rcrdId in data) { //console.log("rcrdId = %O", data[rcrdId]);
        		optsAry.push({ value: data[rcrdId].slug, text: data[rcrdId].name });
        	}
        	return optsAry;
        }
		function buildTxtSearchElems() {
			var elems = createElem('label');
			$(elems).append(createElem('input', { name: 'searchMethod', type: 'radio', value: 'textSearch' })); 
			$(elems).append(createElem('span', { text: "Text Search" })); // console.log("elems = %O", elems)
			$(elems).append(createElem('input', { class:'opts-box', name: 'textEntry', type: 'text', placeholder: 'Enter Taxon Name' })); 
			return elems;
		}
		function buildBrowseElems() {
			var elems = createElem('label');
			$(elems).append(createElem('input', { name: 'searchMethod', type: 'radio', value: 'browseSearch' })); 
			$(elems).append(createElem('span', { text: "Browse Taxa Names" })); // console.log("elems = %O", elems)
			return elems;
		}
	} /* End buildTaxaSearchHtml */
/*----------------------Util----------------------------------------------------------------------*/
	function buildSelectElem(options, attrs) {
		var selectElem = createElem('select', attrs); 

		options.forEach(function(opts){
			$(selectElem).append($("<option/>", {
			    value: opts.value,
			    text: opts.text
			}));
		});
		return selectElem;
	}
	function createElem(tag, attrs) {   //console.log("createElem called. tag = %s. attrs = %O", tag, attrs);// attr = { id, class, name, type, value, text }
	    var elem = document.createElement(tag);
	
		if (attrs) {
		    elem.id = attrs.id || '';
		    elem.className = attrs.class || '';   //Space seperated classNames

		    if (attrs.text) { $(elem).text(attrs.text); }

		    if (attrs.name || attrs.type || attrs.value ) { 
		    	$(elem).attr({
		    		name: attrs.name   || '', 
		    		type: attrs.type   || '',
		    		value: attrs.value || '',
		    		placeholder: attrs.placeholder || '',
		    	}); 
		    }
		}
		
	    return elem;
	}
/*-----------------AJAX ------------------------------------------------------*/
	function sendAjaxQuery(dataPkg, url, successCb) {  console.log("Sending Ajax data =%O", dataPkg)
		$.ajax({
			method: "POST",
			url: url,
			success: successCb || dataSubmitSucess,
			error: ajaxError,
			data: JSON.stringify(dataPkg)
		});
	}
	/**
	 * Stores reference objects for posted entities with each record's temporary 
	 * reference id and the new database id.     
	 * Interactions are sent in sets of 1000, so the returns are collected in an array.
	 */
	function dataSubmitSucess(data, textStatus, jqXHR) { 
		var entity = "Your Mom";										console.log("--%s Success! data = %O, textStatus = %s, jqXHR = %O", entity, data, textStatus, jqXHR);
		// if ( entity === "interaction" ) {
		// 	if ( postedData.interaction === undefined ) { postedData.interaction = []; }
		// 	postedData.interaction.push( data[entity] );	
		// } else {
		// 	postedData[entity] = data[entity];  
		// }
	}
	function ajaxError(jqXHR, textStatus, errorThrown) {
		console.log("ajaxError = %s - jqXHR:%O", errorThrown, jqXHR);
	}
}());