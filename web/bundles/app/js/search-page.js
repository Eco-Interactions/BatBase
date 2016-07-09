(function(){  console.log("Anything you can do, you can do awesome...");
	/**
	 * openRows = The identifier for the row in datagrid to be expanded on grid-load
	 */
	var gridDiv, rcrdsById, dataSet, 
		openRows = [], 
		rowData = [], 
		columnDefs = [];
    var levels = ['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'];
	var sessionStorage = setSessionStorage();
	var gridOptions = {
	    columnDefs: getColumnDefs(),
	    getNodeChildDetails: getNodeChildDetails,
	    getRowClass: getRowStyleClass,
	    onRowGroupOpened: softRefresh,
        enableColResize: true,
        enableSorting: true,
        unSortIcon: true,
        enableFilter: true,
        rowHeight: 26
	};

	document.addEventListener('DOMContentLoaded', onDOMContentLoaded); 

	function onDOMContentLoaded () {
		$("#search-focus").change(selectSearchFocus);
		selectSearchFocus();
	}
	function selectSearchFocus(e) {  											console.log("select(ing)SearchFocus")
	    if ( $('#search-focus').val() == 'locs' ) { getLocations();  }
	    if ( $('#search-focus').val() == 'taxa' ) { getDomains();  }
	}
/*=================Search Methods=============================================*/
/*----------------------Shared------------------------------------------------*/
	/*-------------------Grid Methods-----------------------------------------*/
	function loadGrid(gridOpts) {  // console.log("final rows = %O", rowData);
		var gridOptObj = gridOpts || gridOptions;
		gridOptObj.rowData = rowData;

	    gridDiv = document.querySelector('#search-grid');
	    new agGrid.Grid(gridDiv, gridOptObj);
	}
	function getIntData(intRcrd, intRcrdObj){
		for (var field in intRcrd) {
			if ( field === 'id' ) { continue; }
			if ( field === 'tags' ) { intRcrdObj[field] = getTags(intRcrd[[field]]); }
			if ( field === "subject" || field === "object" ) { 
				intRcrdObj[field] = getTaxonName(intRcrd[field]);	
			} else {
				intRcrdObj[field] = intRcrd[field];
			}
		}  																 		// console.log("getTaxaIntData called. intRowData = %O", intRowData);
		return intRcrdObj;
	}	
	function getTags(tagAry) {
		var tagStrAry = [];
		tagAry.forEach(function(tagStr) {
			tagStrAry.push(tagStr);
		});
		return tagStrAry.join(', ');
	}
	function getTaxonName(taxaData) { 											//console.log("taxaData = %O", taxaData)
		return taxaData.level == "Species" ? 
				taxaData.name : 
				taxaData.level + ' ' + taxaData.name;
	}	

	/*-------------------Html Methods-----------------------------------------*/
	function clearCol2() {
		$('#opts-col2').empty();
	}
	/** Creates an opts obj for each 'item' in array with value and text as 'item' */
	function buildSimpleOpts(optAry) {
		var opts = []
		optAry.forEach(function(option){
			opts.push({
				value: option,
				text: option  });
		});
		opts.unshift({value: 'all', text: '- All -'});
		return opts;
	}	
/*------------------Location Search Methods-----------------------------------*/
	function getLocations() {
		var storedLocs = sessionStorage ? sessionStorage.getItem('locRcrds') : false; 
		if( storedLocs ) {  console.log("Stored Locations Loaded");
			showLocSearch(JSON.parse(storedLocs));
		} else {  console.log("Locations Not Found In Storage.");
			sendAjaxQuery({}, 'ajax/search/location', storeAndLoadLocs);
		}
	}
	function storeAndLoadLocs(data) {											console.log("location data recieved. %O", data);
		populateStorage('locRcrds', JSON.stringify(data.results));
		showLocSearch(data.results);
	}
	function showLocSearch(locData) {  											console.log("showLocSearch called. locData = %O", locData)
		showLocSearchHtml(locData);
		loadLocGrid(locData)		
	}
	/*-----------------Grid Methods-------------------------------------------*/
	function loadLocGrid(locData) {
		var topRegionRows = [];
		var finalRowData = [];   console.log("topRegionRows = %O", topRegionRows);
		for (var region in locData) {
			topRegionRows.push( [getLocRowData(locData[region], region)] );
		}
		topRegionRows.forEach(function(regionRowAry){ $.merge(finalRowData, regionRowAry);	}); 

		rowData = finalRowData;													console.log("rowData = %O", rowData);
		loadGrid();
	}
	function getLocRowData(locObj, locName) {  //console.log("getLocRowData. arguments = %O", arguments);
		return {
			// id: taxon.id,
			name: locName || null,	/* Interaction rows have no name to display. */
			isParent: locObj.interactionType === undefined,  /* Only interaction records return false. */
			open: openRows.indexOf(locName) !== -1, 
			children: getLocRowDataForChildren(locObj),
			// taxaLvl: taxon.level,
			interactions: locObj.intRcrds !== undefined,     /* Location objects have collections of interactions as children. */     
		};		
	}
	function getLocRowDataForChildren(locObj) {
		var regionRows = [];
		if (locObj.interactionType !== undefined) { return false; }
		if (Array.isArray(locObj)) { return handleUnspecifiedRegions(locObj); }
		if (locObj.intRcrds !== undefined) { return getlocIntRowData(locObj.intRcrds); }

		for (var country in locObj) {
			regionRows.push( getLocRowData( locObj[country], country ) );
		}
		return regionRows;
	}
	function handleUnspecifiedRegions(locAry) {
		return locAry.map(function(locObj){
			return getLocRowData(locObj, locObj.desc);
		});
	}
	function getlocIntRowData(intRcrdAry) {
		return intRcrdAry.map(function(intRcrd){  console.log("intRcrd = %O", intRcrd);
			var intRcrdObj = { isParent: false };
			return getIntData(intRcrd, intRcrdObj);
		});
	}




	/*-----------------Html Methods-------------------------------------------*/
	function showLocSearchHtml(locData) {
		var locOpts = buildLocOptions(locData);
		var locSelElems = buildLocSelectElems(locOpts);
		clearCol2();
		$('#opts-col2').append(locSelElems);
	}
	function buildLocOptions(locData) {
		var countries = [];
		var regions = [];
		var optsObj = {};
		for (var region in locData) {  
			if (Array.isArray(locData[region])) { 
				regions.push(region);
				continue; 
			} 
			regions.push(region); 
			addCountries(locData[region]);
		}
		optsObj["Region"] = buildSimpleOpts(regions.sort());
		optsObj["Country"] = buildSimpleOpts(countries.sort());
		return optsObj;

		function addCountries(region) {
			for (var country in region) {  
				countries.push(country);
			} 
		}
	} /* End buildLocOptions */
	function buildLocSelectElems(locOptsObj) {
		var elems = [];
		for (var selVal in locOptsObj) {
			var text = selVal + ': ';
			var id = 'sel' + selVal;
			var labelElem = createElem('label', { class: "lvl-select flex-row" });
			var spanElem = createElem('span', { text: text });
			var selectElem = buildSelectElem(locOptsObj[selVal], { class: "opts-box", id: id });
			$(labelElem).append([spanElem, selectElem]);
			elems.push(labelElem);
		}
		return elems;
	}
/*------------------Taxa Search Methods---------------------------------------*/
	function getDomains() {  
		var storedDomains = sessionStorage ? sessionStorage.getItem('domainRcrds') : false; 
		if( storedDomains ) {  console.log("Stored Domains Loaded");
			showTaxonSearch(JSON.parse(storedDomains));
		} else {  console.log("Domains Not Found In Storage.");
			sendAjaxQuery({props: ['slug', 'name']}, 'ajax/search/domain', storeAndLoadDomains);
		}
	}
	function storeAndLoadDomains(data) {										console.log("domain data recieved. %O", data);
		populateStorage('domainRcrds', JSON.stringify(data.results));
		showTaxonSearch(data.results);
	}
	function showTaxonSearch(data) { 											 
		buildTaxaSearchHtml(data);
		initSearchState();
		getAllTaxaRcrds();
	}
	function initSearchState() {
		$('#sel-domain').val('4');
	}
	/** Ajax to get all interaction rcrds. */
	function getAllTaxaRcrds() {
		var params = {
			props: ['displayName', 'slug' ],
			roles: ['ObjectRoles', 'SubjectRoles']
		};
		var storedTaxa = sessionStorage ? sessionStorage.getItem('taxaRcrds') : false; 
		if( storedTaxa ) {  													console.log("Stored taxaRcrds Loaded");
			rcrdsById = JSON.parse(storedTaxa);
			onTaxaSearchMethodChange();
		} else {  																console.log("taxaRcrds Not Found In Storage.");
			sendAjaxQuery(params, 'ajax/search/taxa', recieveTaxaRcrds);
		}
	}
	function recieveTaxaRcrds(data) {  											 console.log("taxaRcrds recieved. %O", data);
		rcrdsById = data.results;
		populateStorage('taxaRcrds', JSON.stringify(rcrdsById));	
		onTaxaSearchMethodChange();
	}
	/**
	 * Builds the HTML for the search methods available for the taxa-focused search,
	 * both text search and browsing through the taxa names by level.
	 */
	function buildTaxaSearchHtml(data) { 										// console.log("buildTaxaSearchHtml called. ");
		var browseElems = createElem('span', { text: "Sort by: " });
		var filterBttnCntnr = createElem('div', { id: "filter-bttns", class: "flex-col" });
		var domainOpts = getDomainOpts(data); 	//	console.log("domainOpts = %O", domainOpts);
		$(browseElems).append(buildSelectElem(domainOpts, { class: 'opts-box', id: 'sel-domain' }));

		$('#sort-opts').append([browseElems, filterBttnCntnr]);
		addFilterButtons();
		$('#sel-domain').change(selectTaxaDomain);
		
        function getDomainOpts(data) {
        	var optsAry = [];
        	for (var taxonId in data) { 										//console.log("taxon = %O", data[taxonId]);
        		optsAry.push({ value: taxonId, text: data[taxonId].name });
        	}
        	return optsAry;
        }
	} /* End buildTaxaSearchHtml */
	function addFilterButtons() {
		addClearLevelSelectsBttn();
		addApplyFiltersBttn();
	}
	function addClearLevelSelectsBttn() { 
		if (!$('#clearLvls').length) {
			var button = createElem('input', {id:'clearLvls', type: 'button', value: 'Clear Level Filters'});
			$('#filter-bttns').append(button);
		}
	}
	function addApplyFiltersBttn() {
		if (!$('#applyFilters').length) {
			var button = createElem('input', {id:'applyFilters', type: 'button', value: 'Apply Filters'});
			$('#filter-bttns').append(button);
		}		
	}
	function onTaxaSearchMethodChange(e) { 
		clearPreviousGrid();		
		selectTaxaDomain();
	}
	function selectTaxaDomain(e) {
    	var domainTaxon = rcrdsById[$('#sel-domain').val() || 4]; 					// console.log("domainTaxon = %O", domainTaxon)
		showAllDomainInteractions(domainTaxon);
	}
	/** Show all data for domain. */
	function showAllDomainInteractions(domainTaxon) {							//  console.log("domainTaxon=%O", domainTaxon)
		storeDomainLevel();
		getTaxaTreeAndBuildGrid(domainTaxon);
		
		function storeDomainLevel() {
			var domainLvl = domainTaxon.level;
			populateStorage('domainLvl', domainLvl);
		}
	}
	/** Build taxaTree with passed taxon as the top of the tree.  */
	function getTaxaTreeAndBuildGrid(topTaxon) {
		var taxaTree = buildTaxaTree(topTaxon);
		openRows = [topTaxon.id.toString()];  									//console.log("openRows=", openRows)
		dataSet = separateByLevel(taxaTree, topTaxon.displayName); 				// console.log("dataSet = %O", dataSet)
		buildBrowseSearchOptsndGrid(taxaTree);
	}
	/**
	 * Returns an object with taxa records keyed by their display name and organized 
	 * under their respective levels.
	 */
	function separateByLevel(taxaTree, topTaxon) {
		var separated = {};
		separate(taxaTree[topTaxon]);
		return separated;

		function separate(taxon) {
			if (separated[taxon.level] === undefined) { separated[taxon.level] = {}; }
			separated[taxon.level][taxon.displayName] = taxon;
			
			if (taxon.children) { 
				taxon.children.forEach(function(child){ separate(child); }); 
			}
		}
	} /* End separateByLevel */
	/**
	 * Separates interaction records by level @separateByLevel(); builds select dropdowns
	 * for each level populated with the taxonymns at that level @buildSelects(); 
	 * clears any previous search data @clearPreviousSearch(); appends selects; 
	 * builds taxonomic heirarchy of taxa @buildTaxaTree(); 
	 * transforms data into grid format and loads data grid @loadTaxaGrid().
	 */
	function buildBrowseSearchOptsndGrid(taxaTree, curSet) {  					// console.log("dataSet = %O", dataSet)
		var curDataSet = curSet || dataSet;
		var levels = Object.keys(curDataSet);
		var domainLvl = levels.shift();
		var lvlOptsObj = buildTaxaLvlOptions(curDataSet);

		clearPreviousGrid();
		setLevelSelects();
		loadTaxaGrid( taxaTree );

		$('#clearLvls').click(setLevelSelects);
		$('#applyFilters').click(updateTaxaBrowseSearch);

		function setLevelSelects() {
			loadLevelSelectElems( lvlOptsObj, levels );
		}
	} /* End buildBrowseSearchOptsndGrid */
	function rmvClearLevelSelectsBttn() {
		if ($('#clearLvls').length) { $('#clearLvls').remove(); }
	}
	/*----------------Apply Fitler Update Methods-----------------------------*/
	function updateGrid(taxaTree) {
		syncLevelSelects();
		clearPreviousGrid();
		loadTaxaGrid(taxaTree);
	}
	function updateTaxaBrowseSearch() {
		var selectedTaxa = isTaxonymSelected(); 								// console.log("selectedTaxa = %O", selectedTaxa);
		var domainLvl = sessionStorage.getItem('domainLvl');

		if (domainLvl in selectedTaxa) {
			loadGridForTaxon(selectedTaxa[domainLvl]);
		} else {
			levels.some(function(lvl){
				if (selectedTaxa[lvl]) {
					loadGridForTaxon(selectedTaxa[lvl])
					return true; } });
		}

		function loadGridForTaxon(taxonId) {
			var topTaxon = rcrdsById[taxonId];
			var taxaTree = buildTaxaTree(topTaxon);
			openRows = getSelectedRowIds(selectedTaxa); 						//  console.log("openRows =%O", openRows)
			updateGrid(taxaTree);
		}
	} /* End updateTaxaBrowseSearch */
	function getSelectedRowIds(selected) { 										// console.log("selected = %O", selected)
		var ary = [];
		for (var lvl in selected) { 
			pushSelectedId(selected[lvl]);		}
		return ary;

		function getParentId(taxonId) {  										// console.log("taxonId = ", taxonId)
			var taxon = rcrdsById[taxonId];   
			var parentId = taxon.parentTaxon;
			pushSelectedId(parentId);
		}
		function pushSelectedId(id) {
			if (id !== null) {
				id = id.toString();
				ary.push(id);
				getParentId(id); 
			}
		}
	} /* End getSelectedRowIds */
	function loadLevelSelectElems(levelOptsObj, lvls, selected) {
		var elems = buildSelects(levelOptsObj, lvls);
		clearCol2();		
		$('#opts-col2').append(elems);
		setSelectedVals(selected);
	}
	function setSelectedVals(selected) {										//  console.log("selected in setSelectedVals = %O", selected);
		for (var lvl in selected) {
			var selId = '#sel' + lvl;
			$(selId).val(selected[lvl]);
		}
	}
	function clearPreviousGrid() {
		if (gridOptions.api) { gridOptions.api.destroy(); }		
	}
	function buildTaxaLvlOptions(rcrds) { 											// console.log("lvlOptsBuild rcrds = %O", rcrds);
		var optsObj = {};
		for (var lvl in rcrds) {
			var taxaNames = Object.keys(rcrds[lvl]).sort(); 					//console.log("taxaNames = %O", taxaNames);
			optsObj[lvl] = buildTaxaOptions(taxaNames, rcrds[lvl]);
			if (taxaNames.length === 0) { 
				optsObj[lvl].push({value: 'none', text: '- None -'});
			} else if (taxaNames.length > 0) {
				optsObj[lvl].unshift({value: 'all', text: '- All -'});
			}
		}
		fillInMissingLvls();
		return optsObj;

		function fillInMissingLvls() {
			var lvls = Object.keys(dataSet);
			var domainLvl = sessionStorage.getItem('domainLvl');
			lvls.forEach(function(lvl){
				if (lvl !== domainLvl && optsObj[lvl] === undefined) { 
					optsObj[lvl] = [{value: 'none', text: '- None -'}]; 
				}
			});
		}
	}
	function buildTaxaOptions(taxaNames, taxaRcrds) {
		return taxaNames.map(function(taxaKey){
			return {
				value: taxaRcrds[taxaKey].id,
				text: taxaKey
			};
		});
	}
	function buildSelects(lvlOpts, levelAry) {
		var selElems = [];
		levelAry.forEach(function(level){
			var text = level + ': ';
			var id = 'sel' + level;
			var labelElem = createElem('label', { class: "lvl-select flex-row" });
			var spanElem = createElem('span', { text: text });
			var selectElem = buildSelectElem(lvlOpts[level], { class: "opts-box", id: id });
			$(labelElem).append([spanElem, selectElem]);
			selElems.push(labelElem);
		});
		return selElems;
	}
	/**
	 * Returns a taxonomic hierarchy of the interaction data.
	 * @param  {object} toplvltaxa Taxonomic hierarchy starting with the domain taxa.
	 * @param  {object} taxaObj    Interaction records returned from the server.
	 */
	function buildTaxaTree(topTaxon) { 
		var tree = {}; 					console.log("tree = %O", tree);
		tree[topTaxon.displayName] = topTaxon;  
		topTaxon.children = getChildTaxa(topTaxon.children);	

		return tree;

		function getChildTaxa(children) {										// console.log("get Child Taxa called. arguments = %O", arguments);
			if (children === null) { return null; }
			return children.map(function(child){
				if (typeof child === "object") { return child; }

				var childRcrd = rcrdsById[child]; 								// console.log("child = %O", child);

				if (childRcrd.children.length >= 1) { 
					childRcrd.children = getChildTaxa(childRcrd.children);
				} else { childRcrd.children = null; }

				return childRcrd;
			});
		}
	} /* End buildTaxaTree */
/*------------------AG Grid Methods-------------------------------------------*/
	function softRefresh() { gridOptions.api.refreshView(); }
	function getColumnDefs() {  
		return [{headerName: "Taxa Tree", field: "name", width: 300, cellRenderer: 'group', 
					cellRendererParams: { innerRenderer: innerCellRenderer, padding: 20 }, cellClass: getCellStyleClass },		//cellClassRules: getCellStyleClass
			    {headerName: "Subject Taxon", field: "subject", width: 175,},
			    {headerName: "Object Taxon", field: "object", width: 150 },
			    {headerName: "Interaction Type", field: "interactionType", width: 125,},
			    {headerName: "Tags", field: "tags", width: 100,},
			    {headerName: "Habitat Type", field: "habitatType", width: 125 },
			    {headerName: "Country", field: "country", width: 100 },
			    {headerName: "Region", field: "region", width: 100 },
			    {headerName: "Location Description", field: "location", width: 300,},
			    {headerName: "Citation", field: "citation", width: 300,},
			    {headerName: "Note", field: "note", width: 300,} ];
	}
	function innerCellRenderer(params) { 										// console.log("params in cell renderer = %O", params)
		return params.data.name || null;
	}
	function getRowStyleClass(params) { 										// console.log("getRowStyleClass params = %O", params);
		var lvlClassMap = {
			'Kingdom': 'row-kingdom',	'Phylum': 'row-phylum',
			'Class': 'row-class',		'Order': 'row-order',
			'Family': 'row-family',		'Genus': 'row-genus',
			'Species': 'row-species'
		};
		if (params.data.name === undefined) {
			return lvlClassMap[params.data.taxaLvl];
		} 
	}
	function getCellStyleClass(params) {									//	 console.log("getCellStyleClass params = %O", params);
		var lvlClassMap = {
			'Kingdom': 'row-kingdom',	'Phylum': 'row-phylum',
			'Class': 'row-class',		'Order': 'row-order',
			'Family': 'row-family',		'Genus': 'row-genus',
			'Species': 'row-species'
		};
		if ((params.node.expanded === true && params.data.interactions === true 
					&& params.data.name !== undefined) || params.node.data.domainInts === true) {
			return lvlClassMap[params.data.taxaLvl];
		}
	}
	function getNodeChildDetails(rcrd) {										//	console.log("rcrd = %O", rcrd)	
	    if (rcrd.isParent) {
	        return {
	            group: true,
	            expanded: rcrd.open,
	            children: rcrd.children
	        };
	    } else { return null; }
  	}
 	/*---------Filter Functions------------------------------*/
	function onFilterChange() {
		gridOptions.api.onFilterChanged();
	}
/*---------------------------- Taxa Specific -------------------------------- */
 	/*---------Filter Functions------------------------------*/
	// function isExternalFilterPresent() { //console.log("isTaxonymSelected('filter')", isTaxonymSelected('filter'))
	// 	return isTaxonymSelected('filter');
	// }
	// function doesExternalFilterPass(node) {	// console.log("externally filtering. node = %O", node);  
	//  	return true; 
	// }
	function isTaxonymSelected(filterCheck) {
        var filterSelections = {};  console.log("filterSelections = %O", filterSelections)
        var selected = false;

        levels.forEach(function(lvl){
        	var selId = '#sel' + lvl;  console.log("level = %s, val = %s", lvl, $(selId).val());
        	if ($(selId).val() !== undefined && $(selId).val() !== null && $(selId).val() !== 'all') { 
        		filterSelections[lvl] = $(selId).val();
        		selected = true;
        	} 
        });
        return selected === false ? selectDomain() : filterSelections; 

        function selectDomain() {
			var domainLvl = sessionStorage.getItem('domainLvl');
        	var domain = {};
        	domain[domainLvl] = dataSet[domainLvl][[Object.keys(dataSet[domainLvl])[0]]].id;
        	return domain;
        }
	}
	/*------------------Level Select Methods----------------------------------*/
	function syncLevelSelects() {
		var selected = isTaxonymSelected();
		var selectedVals = getSelectedVals(selected);							//console.log("selectedVals = %O", selectedVals)
		repopulateDropDowns(selected, selectedVals);
	}
	function repopulateDropDowns(selected, selectedVals) {
		var revLevels = levels.map(function(lvl){return lvl}).reverse(); 
		var relatedTaxaOpts = {};
		var lvls = Object.keys(dataSet);
		lvls.shift();
		
		buildRelatedTaxaOptsObj();
		
		var lvlOptsObj = buildTaxaLvlOptions(relatedTaxaOpts);
		loadLevelSelectElems(lvlOptsObj, lvls, selectedVals);

		function buildRelatedTaxaOptsObj() {
			revLevels.some(function(lvl, idx) {
				if (selected[lvl] && selected[lvl] !== 'none') {
					buildTaxaOptsObj(selected[lvl], lvl, idx);
					return true;
				}
			}); 																// console.log("relatedTaxaOpts = %O", relatedTaxaOpts);
		}
		function buildTaxaOptsObj(lowestSelectedID, lvl, idx) {
			var selected = rcrdsById[lowestSelectedID];
			relatedTaxaOpts[lvl] = {};
			relatedTaxaOpts[lvl][selected.displayName] = selected;

			if (selected.children) { getChildren(selected.children); }
			getParents(selected.parentTaxon);
			addEmptyLvlOpts();
		}
		function getChildren(directChildren) {
			directChildren.forEach(function(grandChild){
				if (relatedTaxaOpts[grandChild.level] === undefined) { relatedTaxaOpts[grandChild.level] = {}; }
				relatedTaxaOpts[grandChild.level][grandChild.displayName] = grandChild;
				if (grandChild.children) { getChildren(grandChild.children); }
			});
		}
		function getParents(parentId) {
			if (parentId === 1 || parentId === null) {return} 
			var parent = rcrdsById[parentId];
			if (parent.level === sessionStorage.getItem('domainLvl')) {return}  //console.log("first key ")
			if (relatedTaxaOpts[parent.level] === undefined) { relatedTaxaOpts[parent.level] = {}; }
			relatedTaxaOpts[parent.level][parent.displayName] = parent;
			if (parent.parentTaxon) { getParents(parent.parentTaxon); }
		}
		function addEmptyLvlOpts() {  console.log("dataSet = %O", dataSet)
			lvls.forEach(function(lvl) {
				if (relatedTaxaOpts[lvl] === undefined) { relatedTaxaOpts[lvl] = {}; }
			});
		}
	} /* End repopulateDropDowns */
	function getSelectedVals(selected) {
		var vals = {};
		for (var lvl in selected) {
			vals[lvl] = selected[lvl];  										//console.log("selected in getselectedVals = %O", JSON.parse(JSON.stringify(selected)));
		}
		return vals;
	}
	/*---------Data Conversion------------------------------*/
	function loadTaxaGrid(taxaTree) {  console.log("loadTaxaGrid called. taxaTree = %O", taxaTree)
		var topTaxaRows = [];
		var finalRowData = [];
		for (var taxon in taxaTree) {
			topTaxaRows.push( getTaxaRowData(taxaTree[taxon]) );
		}
		topTaxaRows.forEach(function(taxaRowAry){ $.merge(finalRowData, taxaRowAry);	}); 

		rowData = finalRowData;													// console.log("rowData = %O", rowData);

		loadGrid();
	}
	function getTaxaRowData(taxon) { 
		return [{
			id: taxon.id,
			name: taxon.displayName,
			isParent: taxon.interactions !== null || taxon.children !== null,
			open: openRows.indexOf(taxon.id.toString()) !== -1, 
			children: getTaxaRowDataForChildren(taxon),
			taxaLvl: taxon.level,
			interactions: taxaHasInteractions(taxon),          
		}];		
	} /* End getTaxaRowData */
	function taxaHasInteractions(taxon) {
		var intsFound = false;
		for ( var role in taxon.interactions ) {
			if (intsFound) {continue}
			intsFound = taxon.interactions[role] === null ? false : taxon.interactions[role].length > 0;		
		}
		return intsFound;
	} 
	function getTaxaRowDataForChildren(parent) {
		var chldData = [];
		var tempChldArys = [];
		var domainMap = {
			'2': 'Bat',
			'3': 'Plant',
			'4': 'Arthropod'
		};  

		if ( parent.id in domainMap ) { getDomainInteractions(parent, domainMap[parent.id]);   
		} else { tempChldArys.push(getTaxaInteractions(parent)); }

		for (var childKey in parent.children) {
			if (parent.children !== null) { tempChldArys.push( getTaxaRowData(parent.children[childKey]) )}
		}

		tempChldArys.forEach(function(ary){	$.merge(chldData, ary);	});		

		return chldData;
		/** Groups interactions attributed directly to a domain. */
		function getDomainInteractions(taxon, domain) {
			if (taxaHasInteractions(taxon)) { 
				chldData.push({
					id: taxon.id,
					name: 'Unspecified ' + domain + ' Interactions',
					isParent: true,
					open: false,
					children: getTaxaInteractions(taxon),
					taxaLvl: taxon.level,
					interactions: true,
					domainInts: true
				});
			}
		}
	}
	function getTaxaInteractions(taxon) {
		var ints = [];
		var taxaLvl = taxon.level; 
		for (var role in taxon.interactions) {
			if ( taxon.interactions[role] !== null && taxon.interactions[role].length >= 1 ) {
				taxon.interactions[role].forEach(function(intRcrd){
					ints.push( getTaxaIntData(intRcrd, taxaLvl) );
				});
			}
		}
		return ints;
	}
	function getTaxaIntData(intRcrd, taxaLvl) {
		var intRowData = { isParent: false,
						taxaLvl: taxaLvl 
		};
		return getIntData(intRcrd, intRowData);
	}
/*----------------------Util----------------------------------------------------------------------*/
	/*------------ HTML Generators ---------------------------*/
	function buildSelectElem(options, attrs, selected) {
		var selectElem = createElem('select', attrs); 
		var selected = selected || 'all';
		
		options.forEach(function(opts){
			$(selectElem).append($("<option/>", {
			    value: opts.value,
			    text: opts.text
			}));
		});

		$(selectElem).val(selected);
		$(selectElem).change(syncLevelSelects);
		return selectElem;
	}
	function createElem(tag, attrs) {   //console.log("createElem called. tag = %s. attrs = %O", tag, attrs);// attr = { id, class, name, type, value, text }
	    var elem = document.createElement(tag);
		if (attrs) {
		    elem.id = attrs.id || '';
		    elem.className = attrs.class || '';   //Space separated classNames

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
	/* --------------------- General Helpers ---------------------------------*/
	function ucfirst(string) { 
		return string.charAt(0).toUpperCase() + string.slice(1); 
	}
/*------------------------------Storage Methods-------------------------------*/
function setSessionStorage() {
		if (storageAvailable('sessionStorage')) { 
	   		return window['sessionStorage'];  									//console.log("Storage available. Setting now. sessionStorage = %O", sessionStorage);
		} else { 
			return false; 				      									// console.log("No Session Storage Available"); 
		}
	}
	function storageAvailable(type) {
		try {
			var storage = window[type];
			var x = '__storage_test__';

			storage.setItem(x, x);
			storage.removeItem(x);
			return true;
		}
		catch(e) {
			return false;
		}
	}
	function populateStorage(key, val) {
		if (sessionStorage) { 													// console.log("SessionStorage active.");
			sessionStorage.setItem(key, val);
		} else { console.log("No Session Storage Available"); }
	}
	function getRemainingStorageSpace() {
		 var limit = 1024 * 1024 * 5; // 5 MB
		 return limit - unescape(encodeURIComponent(JSON.stringify(sessionStorage))).length;
	}
	function sizeOfString(string) {
		return string.length;
	}
/*-----------------AJAX ------------------------------------------------------*/
	function sendAjaxQuery(dataPkg, url, successCb) {  							console.log("Sending Ajax data =%O", dataPkg)
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
		var entity = "Your Mom";												console.log("--%s Success! data = %O, textStatus = %s, jqXHR = %O", entity, data, textStatus, jqXHR);
	}
	function ajaxError(jqXHR, textStatus, errorThrown) {
		console.log("ajaxError = %s - jqXHR:%O", errorThrown, jqXHR);
	}
}());