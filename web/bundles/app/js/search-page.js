(function(){  //console.log("Anything you can do, you can do awesome...");
	/**
	 * openRows = The identifier for the row in datagrid to be expanded on grid-load
	 */
	var gridDiv, rcrdsById, taxaByLvl, curTree,
		openRows = [], 
		rowData = [], 
		columnDefs = [];
	var curFocus = localStorage ? localStorage.getItem('curFocus') : false; 	
    var levels = ['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'];
	var localStorage = setlocalStorage();
	var gridOptions = {
	    columnDefs: getColumnDefs(),
	    getHeaderCellTemplate: getHeaderCellTemplate, 
	    getNodeChildDetails: getNodeChildDetails,
	    getRowClass: getRowStyleClass,
	    onRowGroupOpened: softRefresh,
	    onBeforeFilterChanged: beforeFilterChange, 
	    onAfterFilterChanged: afterFilterChanged,
        enableColResize: true,
        enableSorting: true,
        unSortIcon: true,
        enableFilter: true,
        rowHeight: 26
	};
	document.addEventListener('DOMContentLoaded', onDOMContentLoaded); 

	function onDOMContentLoaded () {
		// localStorage.clear();
		curFocus = localStorage ? localStorage.getItem('curFocus') : false; 	 console.log("curFocus = ", curFocus)
		$("#search-focus").change(selectSearchFocus);
		$('button[name="xpand-tree"]').click(toggleExpandTree);
		$('button[name="clr-grid-fltrs"]').click(clearAllGridFilters);
		setGridStatus('No Active Filters.'); 
	    initSearchState();
		selectSearchFocus();
	}
	function selectSearchFocus(e) {  											//console.log("select(ing)SearchFocus")
	    showLoadingMsg();
	    if ( $('#search-focus').val() == 'locs' ) { getLocations();  }
	    if ( $('#search-focus').val() == 'taxa' ) { getDomains();  }
	}
	function initSearchState() {
		if (curFocus){ $('#search-focus').val(curFocus);
		} else { $('#search-focus').val("taxa"); }
	} 
	function showLoadingMsg() {
		$('#borderLayout_eRootPanel').fadeTo(100, .3);
	    $('#popUpDiv, #overlay').show();
	}
	function hideLoadingMsg() {
		$('#borderLayout_eRootPanel').fadeTo(100, 1);
	    $('#popUpDiv, #overlay').hide();
	}
	function toggleExpandTree() {  console.log("toggleExpandTree")
  		var expanded = $(this).data('xpanded');
  		if (expanded) { 
  			gridOptions.api.collapseAll();
			$('#xpand-tree').html("&nbspExpand Tree Data&nbsp");
		} else { 
			gridOptions.api.expandAll();	
			$('#xpand-tree').html("Collapse Tree Data");
  		}
		$(this).data("xpanded", !expanded);
	}
	function resetToggleTreeBttn() {
		$('#xpand-tree').html("&nbspExpand Tree Data&nbsp");
		$('#xpand-tree').data("xpanded", false);
	}
/*=================Search Methods=============================================*/
	function ifChangedFocus(focus) {
		if (focus !== curFocus) { //console.log("clearing local storage. curFocus = ", curFocus);
			curFocus = focus;
			populateStorage('curFocus', focus);
		}
		clearPastHtmlOptions()
	}
	function clearPastHtmlOptions() {
		$('#sort-opts, #opts-col2').fadeTo(150, 0, emptySearchOpts);
	}
	function emptySearchOpts() {
		$('#opts-col2').empty();
		$('#sort-opts').empty();
		$('#sort-opts, #opts-col2').fadeTo(0, 1);
	}
/*------------------Interaction Record Methods-----------------------------------*/
	/**
	 * Checks if interaction records have been saved in local storage. If not, sends 
	 * ajax to get them with @storeInteractions as the success callback. If records 
	 * are available in storage call @fillTreeWithInteraction. 
	 */
	function getInteractions() {  												console.log("getInteractions called. ")
		var intRcrds = localStorage ? localStorage.getItem('intRcrds') : false; 
		showLoadingMsg();
		if ( intRcrds ) { console.log("Stored interactions loaded = %O", JSON.parse(intRcrds));
			fillTreeWithInteractions( JSON.parse(intRcrds) ); 
		} else { sendAjaxQuery({}, 'ajax/search/interaction', storeInteractions); }
	}
	function storeInteractions(data) {  										console.log("Interaction success! rcrds = %O", data.results);
		var intRcrds = JSON.stringify(data.results);
		populateStorage('intRcrds', intRcrds);  
		fillTreeWithInteractions( data.results );
	}
	/**
	 * Back fills the displayed search focus' data tree with interaction records
	 * and then rebuilds the displayed grid.
	 */
	function fillTreeWithInteractions(intRcrds) {   							console.log("fillTreeWithInteractionscalled.");
		var gridBuilder;
		var focus = localStorage.getItem('curFocus'); 

		if (focus === "taxa"){  console.log("focus = 'taxa'");
			gridBuilder = buildBrowseSearchOptsndGrid;
			fillTaxaSetWithInteractionRcrds(curTree);  
		} else if (focus === "locs") { console.log("focus = 'locs'");
			gridBuilder = loadLocGrid;
			fillLocsSetWithInteractionRcrds(curTree)
		}
		clearPreviousGrid();
		gridBuilder(curTree);
	    hideLoadingMsg();
	    /**
	     * The taxa tree is structured as a familial heirarchy, with the domain taxa
	     * as the top-most parent, and the first "sibling".
	     */
		function fillTaxaSetWithInteractionRcrds(treeObj) { 					console.log("fillTaxaSetWithInteractionRcrds called. taxaTree = %O", treeObj) 
			for (var sibling in treeObj) {   
				replaceTaxaInteractions(treeObj[sibling].interactions, intRcrds)
				if (treeObj[sibling].children !== null) { fillTaxaSetWithInteractionRcrds(treeObj[sibling].children) }
			}
		}
		function replaceTaxaInteractions(interactionsObj) {   					// console.log("replaceTaxaInteractions called. interactionsObj = %O", interactionsObj);
			for (var role in interactionsObj) {
				if (interactionsObj[role] !== null) { 
					replaceInteractions(interactionsObj[role]) }
			}
		}
		/**
		 * The Location tree obj has regions as keys at the top-most level. If 
		 * that region has countries, it is an object with it's countries as keys. 
		 * If a region has no countries, and for every country key, the location 
		 * records are in array format.
		 */
		function fillLocsSetWithInteractionRcrds(treeObj) { 					console.log("fillLocsSetWithInteractionRcrds. locsTree = %O", treeObj);
			for (var topKey in treeObj) {  										// console.log("topKey of treeObj = ", topKey);
				if (Array.isArray(treeObj[topKey])) {  
					getArrayInteractions(treeObj[topKey]);
					continue;
				}
				fillLocsSetWithInteractionRcrds(treeObj[topKey]);
			}
		}
		function getArrayInteractions(treeAry) { 								// console.log("treeAry = %O", treeAry)
			treeAry.forEach(function(locObj){
				replaceInteractions(locObj.interactions, intRcrds)
			});
		}
		function replaceInteractions(interactionsAry) {  						// console.log("replaceInteractions called. interactionsAry = %O", interactionsAry);
			interactionsAry.forEach(function(intId, idx, orgAry){
				orgAry[idx] = intRcrds[intId];
			});
		}
	} /* End fillTreeWithInteractions */

/*------------------Location Search Methods-----------------------------------*/
	function getLocations() {
		var storedLocs = localStorage ? localStorage.getItem('locRcrds') : false; 
		ifChangedFocus("locs");
		if( storedLocs ) {  console.log("Stored Locations Loaded");
			showLocSearch(JSON.parse(storedLocs));
		} else {  console.log("Locations Not Found In Storage.");
			sendAjaxQuery({}, 'ajax/search/location', storeAndLoadLocs);
		}
	}
	function storeAndLoadLocs(data) {											console.log("location data recieved. %O", data);
		var locRcrds = sortLocTree(data.results);
		populateStorage('locRcrds', JSON.stringify(locRcrds));
		showLocSearch(locRcrds);
	}
	function sortLocTree(locData) {
		var sortedLocs = {};
		var regions = Object.keys(locData).sort();  								//console.log("regions = %O", regions)
		for (var i=0; i<regions.length; i++){
			if (Array.isArray(locData[regions[i]])) { 
				sortedLocs[regions[i]] = locData[regions[i]].sort();
				continue;
			}
			sortedLocs[regions[i]] = sortCountryLvl(locData[regions[i]]);
		}
		return sortedLocs;
	}
	function sortCountryLvl(regionObj) {
		var countries = Object.keys(regionObj).sort();
		var returnObj = {};
		for (var i=0; i<countries.length; i++){
			returnObj[countries[i]] = regionObj[countries[i]].sort(alphaLocDesc);
		}		
		return returnObj;
	}
	function alphaLocDesc(a, b) {
		var x=a.desc.toLowerCase();
	    var y=b.desc.toLowerCase();
	    return x<y ? -1 : x>y ? 1 : 0;
	}
	function showLocSearch(locData) {  										//console.log("showLocSearch called. locData = %O", locData)
		clearPreviousGrid();
		loadLocGrid(locData);
		getInteractions();		
	}
	/*-----------------Grid Methods-------------------------------------------*/
	function loadLocGrid(locData) {
		var topRegionRows = [];
		var finalRowData = [];   console.log("locData = %O", locData);
		curTree = locData;
		for (var region in locData) { // console.log("region = ", region)
			topRegionRows.push( [getLocRowData(locData[region], region)] );
		}
		topRegionRows.forEach(function(regionRowAry){ $.merge(finalRowData, regionRowAry);	}); 

		rowData = finalRowData;													//console.log("rowData = %O", rowData);
		loadGrid("Location Tree");
	}
	function getLocRowData(locObj, locName) {  //console.log("getLocRowData. arguments = %O", arguments);
		return {
			name: locName || null,	/* Interaction rows have no name to display. */
			isParent: locObj.interactionType === undefined,  /* Only interaction records return false. */
			open: openRows.indexOf(locName) !== -1, 
			children: getLocRowDataForChildren(locObj),
			interactions: locObj.intRcrds !== undefined,     /* Location objects have collections of interactions as children. */     
		};		
	}
	function getLocRowDataForChildren(locObj) {// console.log("getLocRowDataForChildren called. locObj = %O", locObj)
		var regionRows = [];
		if (locObj.interactionType !== undefined) { return false; }
		if (Array.isArray(locObj)) { return handleUnspecifiedRegions(locObj); }
		if (locObj.interactions !== undefined) { return getlocIntRowData(locObj.interactions); }

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
		return intRcrdAry.map(function(intRcrd){ // console.log("intRcrd = %O", intRcrd);
			var intRcrdObj = { isParent: false };
			return getIntData(intRcrd, intRcrdObj);
		});
	}
/*------------------Taxa Search Methods---------------------------------------*/
	function getDomains() {  
		var storedDomains = localStorage ? localStorage.getItem('domainRcrds') : false; 
		ifChangedFocus("taxa");
		if( storedDomains ) {  console.log("Stored Domains Loaded");
			showTaxonSearch(JSON.parse(storedDomains));
		} else {  console.log("Domains Not Found In Storage.");
			sendAjaxQuery({props: ['slug', 'name']}, 'ajax/search/domain', storeAndLoadDomains);
		}
	}
	function storeAndLoadDomains(data) {										//console.log("domain data recieved. %O", data);
		populateStorage('domainRcrds', JSON.stringify(data.results));
		showTaxonSearch(data.results);
	}
	function showTaxonSearch(data) { 	
		buildTaxaSearchHtml(data);
		initTaxaSearchState();
		getAllTaxaRcrds();
	}
	function initTaxaSearchState() { // console.log("$('#sel-domain').val() = ", $('#sel-domain').val())
		if ($('#sel-domain').val() === null) { $('#sel-domain').val('4'); }
	}
	/** Ajax to get all interaction rcrds. */
	function getAllTaxaRcrds() {
		var params = {
			props: ['displayName', 'slug' ],
			roles: ['ObjectRoles', 'SubjectRoles']
		};
		var storedTaxa = localStorage ? localStorage.getItem('taxaRcrds') : false; 
		if( storedTaxa ) {  		console.log("Stored taxaRcrds Loaded");
			rcrdsById = JSON.parse(storedTaxa);
			onTaxaSearchMethodChange();
		} else {   console.log("taxaRcrds Not Found In Storage.");
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
		$('#sort-opts').fadeTo(0, .3);

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
		resetToggleTreeBttn();
		showDomainTree(domainTaxon);
		getInteractions();
	}
	/** Show all data for domain. */
	function showDomainTree(domainTaxon) {							//  console.log("domainTaxon=%O", domainTaxon)
		storeDomainLevel();
		getTaxaTreeAndBuildGrid(domainTaxon);
		$('#sort-opts').fadeTo(500, 1);
	    // hideLoadingMsg();

		function storeDomainLevel() {
			var domainLvl = domainTaxon.level;
			populateStorage('domainLvl', domainLvl);
		}
	}
	/** Build taxaTree with passed taxon as the top of the tree.  */
	function getTaxaTreeAndBuildGrid(topTaxon) {
		var taxaTree = buildTaxaTree(topTaxon);
		curTree = taxaTree;
		openRows = [topTaxon.id.toString()];  									//console.log("openRows=", openRows)
		taxaByLvl = separateByLevel(taxaTree, topTaxon.displayName); 				// console.log("taxaByLvl = %O", taxaByLvl)
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
	function buildBrowseSearchOptsndGrid(taxaTree, curSet) {  					// console.log("taxaByLvl = %O", taxaByLvl)
		var curTaxaByLvl = curSet || taxaByLvl;
		var levels = Object.keys(curTaxaByLvl);
		var domainLvl = levels.shift();
		var lvlOptsObj = buildTaxaLvlOptions(curTaxaByLvl);

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
		var domainLvl = localStorage.getItem('domainLvl');

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
			var lvls = Object.keys(taxaByLvl);
			var domainLvl = localStorage.getItem('domainLvl');
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
/*---------------------------- Taxa Specific Filters-------------------------------- */
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
			var domainLvl = localStorage.getItem('domainLvl');
        	var domain = {};
        	domain[domainLvl] = taxaByLvl[domainLvl][[Object.keys(taxaByLvl[domainLvl])[0]]].id;
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
		var lvls = Object.keys(taxaByLvl);
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
			if (parent.level === localStorage.getItem('domainLvl')) {return}  //console.log("first key ")
			if (relatedTaxaOpts[parent.level] === undefined) { relatedTaxaOpts[parent.level] = {}; }
			relatedTaxaOpts[parent.level][parent.displayName] = parent;
			if (parent.parentTaxon) { getParents(parent.parentTaxon); }
		}
		function addEmptyLvlOpts() {  console.log("taxaByLvl = %O", taxaByLvl)
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
	/*---------Data Formatting------------------------------------------------*/
	function loadTaxaGrid(taxaTree) {  console.log("loadTaxaGrid called. taxaTree = %O", taxaTree)
		var topTaxaRows = [];
		var finalRowData = [];
		for (var taxon in taxaTree) {
			topTaxaRows.push( getTaxaRowData(taxaTree[taxon]) );
		}
		topTaxaRows.forEach(function(taxaRowAry){ $.merge(finalRowData, taxaRowAry);	}); 

		rowData = finalRowData;													// console.log("rowData = %O", rowData);

		loadGrid("Taxa Tree");
	}
	function getTaxaRowData(taxon) { 
		var taxonName = taxon.level === "Species" ? 
			taxon.displayName : taxon.level + " " + taxon.displayName;
		return [{
			id: taxon.id,
			name: taxonName,
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
	/*===================Shared===============================================*/
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

    /*--------------AG Grid Methods-------------------------------------------*/
    	// function isExternalFilterPresent() { //console.log("isTaxonymSelected('filter')", isTaxonymSelected('filter'))
	// 	return isTaxonymSelected('filter');
	// }
	// function doesExternalFilterPass(node) {	// console.log("externally filtering. node = %O", node);  
	//  	return true; 
	// }
	function loadGrid(mainCol, gridOpts) {  // console.log("final rows = %O", rowData);
		var gridOptObj = gridOpts || gridOptions;
		gridOptObj.rowData = rowData;
		gridOptObj.columnDefs = getColumnDefs(mainCol),

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
	/**
	 * Copied from agGrid's default template, with columnId added to create unique ID's
	 * @param  {obj} params  {column, colDef, context, api}
	 */
	function getHeaderCellTemplate(params) {  
		var colId = params.column.colId + 'ColFilterIcon';  
		return '<div class="ag-header-cell">' +
	        '  <div id="agResizeBar" class="ag-header-cell-resize"></div>' +
	        '  <span id="agMenu" class="ag-header-icon ag-header-cell-menu-button"></span>' +
	        '  <div id="agHeaderCellLabel" class="ag-header-cell-label">' +
	        '    <span id="agSortAsc" class="ag-header-icon ag-sort-ascending-icon"></span>' +
	        '    <span id="agSortDesc" class="ag-header-icon ag-sort-descending-icon"></span>' +
	        '    <span id="agNoSort" class="ag-header-icon ag-sort-none-icon"></span>' +
	        '    <a name="' + colId + '" id="agFilter" class="anything ag-header-icon ag-filter-icon"></a>' +
	        '    <span id="agText" class="ag-header-cell-text"></span>' +
	        '  </div>' +
	        '</div>'; 
	}
	function softRefresh() { gridOptions.api.refreshView(); }
	function getColumnDefs(mainCol) {  
		return [{headerName: mainCol, field: "name", width: 300, cellRenderer: 'group', suppressFilter: true,
					cellRendererParams: { innerRenderer: innerCellRenderer, padding: 20 }, 
					cellClass: getCellStyleClass },		//cellClassRules: getCellStyleClass
			    {headerName: "Subject Taxon", field: "subject", width: 175, headerTooltip: "The subject of the interaction." },
			    {headerName: "Object Taxon", field: "object", width: 150 , suppressFilter: true },
			    {headerName: "Interaction Type", field: "interactionType", width: 165, filter: UniqueValuesFilter },
			    {headerName: "Tags", field: "tags", width: 100, filter: UniqueValuesFilter},
			    {headerName: "Habitat Type", field: "habitatType", width: 140, filter: UniqueValuesFilter },
			    {headerName: "Country", field: "country", width: 100, filter: UniqueValuesFilter },
			    {headerName: "Region", field: "region", width: 100, filter: UniqueValuesFilter },
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
		var lvlAry = [1, 2, 3, 4, 5, 6, 7];
		if (params.data.name === undefined || params.data.name === null) {
			var isTaxa = params.data.taxaLvl !== undefined ? lvlClassMap[params.data.taxaLvl] : false;
			// var lvlIdx = lvlAry[Math.floor(Math.random() * lvlAry.length)];
			// var lvlClass = lvlClassMap[Object.keys(lvlClassMap)[lvlIdx]];
			return isTaxa || 'row-kingdom';
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
 	/*========================Filter Functions================================*/
	function onFilterChange() {
		gridOptions.api.onFilterChanged();
	}
	function afterFilterChanged() {} //console.log("afterFilterChange") 
	/** Resets Grid Status' Active Filter display */
	function beforeFilterChange() {  console.log("beforeFilterChange")
		clearGridStatus();
		getActiveDefaultGridFilters();	
	} 
	/**
	 * Resets grid state to top focus options: Taxa are reset to the domain level, 
	 * and locations are entirely reset.
	 */
	function clearAllGridFilters() { 
		var prevDomain = $('#sel-domain').val(); console.log("prevDomain = ", prevDomain)			
		if (prevDomain){
			$('#sel-domain').val(prevDomain);
			onTaxaSearchMethodChange();
		} else {
			clearPreviousGrid();
			selectSearchFocus(); 
		}
		getActiveDefaultGridFilters();
	}
	/** Returns an obj with all filter models. */
	function getAllFilterModels() {
		return {
			"Subject Taxon": gridOptions.api.getFilterApi("subject").getModel(),
			"Object Taxon": gridOptions.api.getFilterApi("object").getModel(),
			"Interaction Type": gridOptions.api.getFilterApi("interactionType").getModel(),
			"Tags": gridOptions.api.getFilterApi("tags").getModel(),
			"Habitat Type": gridOptions.api.getFilterApi("habitatType").getModel(),
			"Country": gridOptions.api.getFilterApi("country").getModel(),
			"Region": gridOptions.api.getFilterApi("region").getModel(),
			"Location Desc.": gridOptions.api.getFilterApi("location").getModel(),
			"Citation": gridOptions.api.getFilterApi("citation").getModel(),
			"Note": gridOptions.api.getFilterApi("note").getModel()
		}; 	
	}
	/**
	 * Checks all filter models for any active filters. Sets grid-status with resulting 
	 * active filters.
	 */
	function getActiveDefaultGridFilters() {									// console.log("getActiveDefaultGridFilters called.")
		var filterStatus;
		var intro =  'Columns with Active Filters: ';
		var activeFilters = [];
		if (gridOptions.api === undefined) { return; }
		var filterModels = getAllFilterModels();		
		var columns = Object.keys(filterModels);		

		for (var i=0; i < columns.length; i++) {
			if (filterModels[columns[i]] !== null) { activeFilters.push(columns[i]); }
		}
		filterStatus = activeFilters.length > 0 ? intro + activeFilters.join(', ') : 'No Active Filters.';
		setGridStatus(filterStatus); 
	}
	function setGridStatus(status) {  console.log("setGridStatus. status = ", status)
		$('#grid-status').text(status);
	}
	function clearGridStatus() {
		$('#grid-status').empty();
		activeFilters = [];
	}
    /**
     * Class function: 
     * This filter presents all unique values of column to potentially filter on.
     */
    function UniqueValuesFilter() {}
    UniqueValuesFilter.prototype.init = function (params) { //console.log("UniqueValuesFilter.prototype.init. params = %O", params)
	    this.model = new UnqValsColumnFilterModel(params.colDef, params.rowModel, params.valueGetter, params.doesRowPassOtherFilter);
        this.filterModifiedCallback = params.filterModifiedCallback;
	    this.valueGetter = params.valueGetter;
        this.colDef = params.colDef;
	    this.filterActive = true;
	    this.filterChangedCallback = params.filterChangedCallback; 
        this.rowsInBodyContainer = {};
    	this.eGui = document.createElement('div');
		this.eGui.innerHTML = '<div>' +
            '<div class="ag-filter-header-container">' +
            '<label>' +
            '<input id="selectAll" type="checkbox" class="ag-filter-checkbox"/>' +
            ' ( Select All )' +
            '</label>' +
            '</div>' +
            '<div class="ag-filter-list-viewport">' +
            '<div class="ag-filter-list-container">' +
            '<div id="itemForRepeat" class="ag-filter-item">' +
            '<label>' +
            '<input type="checkbox" class="ag-filter-checkbox" filter-checkbox="true"/>' +
            '<span class="ag-filter-value"></span>' +
            '</label>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        this.createGui();
        this.createApi();
    }
    UniqueValuesFilter.prototype.getGui = function () {
	    return this.eGui;
    }
    UniqueValuesFilter.prototype.isFilterActive = function() {
	    return this.model.isFilterActive();
    }
    UniqueValuesFilter.prototype.doesFilterPass = function (node) {
	    if (this.model.isEverythingSelected()) { return true; }  // if no filter, always pass
	    if (this.model.isNothingSelected()) { return false; }    // if nothing selected in filter, always fail
	    var value = this.valueGetter(node);
	    value = makeNull(value);
	    if (Array.isArray(value)) {
	        for (var i = 0; i < value.length; i++) {
	            if (this.model.isValueSelected(value[i])) { return true; }
	        }
	        return false;
	    } else { return this.model.isValueSelected(value); }
	    
	    return true;
	}
    UniqueValuesFilter.prototype.getApi = function () { // Not Working??
        return this.api;
    };
    UniqueValuesFilter.prototype.createApi = function () {
	    var model = this.model;
        var that = this;
        this.api = {
            isFilterActive: function () {
                return model.isFilterActive();
            },
            selectEverything: function () { 
                that.eSelectAll.checked = true;
            },
            selectNothing: function () {
                that.eSelectAll.checked = false;
            },
            unselectValue: function (value) {
                model.unselectValue(value);
                that.refreshVirtualRows();
            },
            selectValue: function (value) {
                model.selectValue(value);
                that.refreshVirtualRows();
            },
            isValueSelected: function (value) {
                return model.isValueSelected(value);
            },
            isEverythingSelected: function () {
                return model.isEverythingSelected();
            },
            isNothingSelected: function () {
                return model.isNothingSelected();
            },
            getUniqueValueCount: function () {
                return model.getUniqueValueCount();
            },
            getUniqueValue: function (index) {
                return model.getUniqueValue(index);
            },
            getModel: function () {
                return model.getModel();
            },
            setModel: function (dataModel) {
            	if (dataModel === null) { that.eSelectAll.checked = true; } 
            	model.setModel(dataModel);
                that.refreshVirtualRows();
            }, 
            refreshHeader: function() {
				gridOptions.api.refreshHeader();
            }
        };  
    }  
    // optional methods
    UniqueValuesFilter.prototype.afterGuiAttached = function(params) {
        this.drawVirtualRows();
    };
    UniqueValuesFilter.prototype.onNewRowsLoaded = function () {}
    UniqueValuesFilter.prototype.onAnyFilterChanged = function () {
    	var colFilterModel = this.model.getModel();								
    	if ( colFilterModel === null ) { return; }
    	var col = Object.keys(colFilterModel)[0];
    	var colFilterIconName = col + 'ColFilterIcon'; 							// console.log("colFilterIconName = %O", colFilterIconName)
    	var selectedStr = colFilterModel[col].length > 0 ? colFilterModel[col].join(', ') : "None";

    	$('a[name=' + colFilterIconName + ']').attr("title", "Showing:\n" + selectedStr);
    }
    UniqueValuesFilter.prototype.destroy = function () {}
    // Support methods
	UniqueValuesFilter.prototype.createGui = function () {
	    var _this = this;
	    this.eListContainer = this.eGui.querySelector(".ag-filter-list-container");
	    this.eFilterValueTemplate = this.eGui.querySelector("#itemForRepeat");
	    this.eSelectAll = this.eGui.querySelector("#selectAll");
	    this.eListViewport = this.eGui.querySelector(".ag-filter-list-viewport");
	    this.eListContainer.style.height = (this.model.getUniqueValueCount() * 20) + "px";
	    removeAllChildren(this.eListContainer);
	    this.eSelectAll.onclick = this.onSelectAll.bind(this);
	    if (this.model.isEverythingSelected()) { this.eSelectAll.checked = true; 
	    } else if (this.model.isNothingSelected()) { this.eSelectAll.checked = false; }
	};
    UniqueValuesFilter.prototype.onSelectAll = function () {
        var checked = this.eSelectAll.checked;
        if (checked) { this.model.selectEverything(); }
        else { this.model.selectNothing(); }

        this.updateAllCheckboxes(checked);
        this.filterChangedCallback();
    };
    UniqueValuesFilter.prototype.updateAllCheckboxes = function (checked) {
        var currentlyDisplayedCheckboxes = this.eListContainer.querySelectorAll("[filter-checkbox=true]");
        for (var i = 0, l = currentlyDisplayedCheckboxes.length; i < l; i++) {
            currentlyDisplayedCheckboxes[i].checked = checked;
        }
    };
    UniqueValuesFilter.prototype.refreshVirtualRows = function () {
        this.clearVirtualRows();
        this.drawVirtualRows();
    };
    UniqueValuesFilter.prototype.clearVirtualRows = function () {
        var rowsToRemove = Object.keys(this.rowsInBodyContainer);
        this.removeVirtualRows(rowsToRemove);
    };
    //takes array of row id's
    UniqueValuesFilter.prototype.removeVirtualRows = function (rowsToRemove) {  // console.log("removeVirtualRows called. rows = %O", rowsToRemove)
        var _this = this;
        rowsToRemove.forEach(function (indexToRemove) {
            var eRowToRemove = _this.rowsInBodyContainer[indexToRemove];
            _this.eListContainer.removeChild(eRowToRemove);
            delete _this.rowsInBodyContainer[indexToRemove];
        });
    };
  	UniqueValuesFilter.prototype.drawVirtualRows = function () {
	    var topPixel = this.eListViewport.scrollTop;
	    var firstRow = Math.floor(topPixel / 20);
	    this.renderRows(firstRow);
	};
	UniqueValuesFilter.prototype.renderRows = function (start) {
	    var _this = this;
	    for (var rowIndex = start; rowIndex <= this.model.getDisplayedValueCount(); rowIndex++) {
	        //check this row actually exists (in case overflow buffer window exceeds real data)
	        if (this.model.getDisplayedValueCount() > rowIndex) {
	            var value = this.model.getDisplayedValue(rowIndex);
	            _this.insertRow(value, rowIndex);
	        }
	    }
	};
	UniqueValuesFilter.prototype.insertRow = function (value, rowIndex) {
	    var _this = this;
	    var eFilterValue = this.eFilterValueTemplate.cloneNode(true);
	    var valueElement = eFilterValue.querySelector(".ag-filter-value");
        var blanksText = '( Blanks )';
        var displayNameOfValue = value === null || value === "" ? blanksText : value;
        valueElement.innerHTML = displayNameOfValue;
	    var eCheckbox = eFilterValue.querySelector("input");
	    eCheckbox.checked = this.model.isValueSelected(value);
	    eCheckbox.onclick = function () {
	        _this.onCheckboxClicked(eCheckbox, value);
	    };
	    eFilterValue.style.top = (20 * rowIndex) + "px";
	    this.eListContainer.appendChild(eFilterValue);
	    this.rowsInBodyContainer[rowIndex] = eFilterValue;
	};
	UniqueValuesFilter.prototype.onCheckboxClicked = function (eCheckbox, value) {
	    var checked = eCheckbox.checked;
	    if (checked) {
	        this.model.selectValue(value);
	        if (this.model.isEverythingSelected()) {
	            this.eSelectAll.checked = true;
	        }
	    }
	    else {
	        this.model.unselectValue(value);
			this.eSelectAll.checked = false;
	        //if set is empty, nothing is selected
	        if (this.model.isNothingSelected()) {
	            this.eSelectAll.checked = false;
	        }
	    }
	    this.filterChangedCallback();
	};
	/*------------------------UnqValsColumnFilterModel----------------------------------*/
	/** Class Function */
    function UnqValsColumnFilterModel(colDef, rowModel, valueGetter, doesRowPassOtherFilters) { // console.log("UnqValsColumnFilterModel.prototype.init. arguments = %O", arguments);
 		this.colDef = colDef;			// console.log("colDef = %O", this.colDef);
        this.rowModel = rowModel;		// console.log("rowModel = %O", this.rowModel);
        this.valueGetter = valueGetter; // console.log("valueGetter = %O", this.valueGetter);
        this.doesRowPassOtherFilters = doesRowPassOtherFilters; // console.log("doesRowPassOtherFilters = %O", this.doesRowPassOtherFilters);
        this.filterParams = this.colDef.filterParams;  // console.log("filterParams = %O", this.filterParams);
        this.usingProvidedSet = this.filterParams && this.filterParams.values;
        this.createAllUniqueValues();
        this.createAvailableUniqueValues();
        this.displayedValues = this.availableUniqueValues;
        this.selectedValuesMap = {};
        this.selectEverything();
    }
	UnqValsColumnFilterModel.prototype.createAllUniqueValues = function () {
        if (this.usingProvidedSet) { 
        	this.allUniqueValues = toStrings(this.filterParams.values);
        }
        else { this.allUniqueValues = toStrings(this.getUniqueValues()); }
        this.allUniqueValues.sort(); 
    };
    UnqValsColumnFilterModel.prototype.getUniqueValues = function () {
        var _this = this;
        var uniqueCheck = {};
        var result = [];
        this.rowModel.forEachNode(function (node) {
            if (!node.group) {
                var value = _this.valueGetter(node);
                if (value === "" || value === undefined) { value = null; }
                addUniqueValueIfMissing(value);
            }
        });
        function addUniqueValueIfMissing(value) {
            if (!uniqueCheck.hasOwnProperty(value)) {
                result.push(value);
                uniqueCheck[value] = 1; }
        }
        return result;
    };
    UnqValsColumnFilterModel.prototype.createAvailableUniqueValues = function () {
        this.availableUniqueValues = this.allUniqueValues;
    };
    UnqValsColumnFilterModel.prototype.getUniqueValueCount = function () {
        return this.allUniqueValues.length;
    };
    UnqValsColumnFilterModel.prototype.selectEverything = function () {
        var count = this.allUniqueValues.length;
        for (var i = 0; i < count; i++) {
            var value = this.allUniqueValues[i];
            this.selectedValuesMap[value] = null;
        }
        this.selectedValuesCount = count;
        // this.
    };
    UnqValsColumnFilterModel.prototype.selectNothing = function () {
        this.selectedValuesMap = {};
        this.selectedValuesCount = 0;
    };
    UnqValsColumnFilterModel.prototype.unselectValue = function (value) {
        if (this.selectedValuesMap[value] !== undefined) {
            delete this.selectedValuesMap[value];
            this.selectedValuesCount--;
        }
    };
    UnqValsColumnFilterModel.prototype.selectValue = function (value) {
        if (this.selectedValuesMap[value] === undefined) {
            this.selectedValuesMap[value] = null;
            this.selectedValuesCount++;
        }
    };
    UnqValsColumnFilterModel.prototype.isEverythingSelected = function () {
        return this.allUniqueValues.length === this.selectedValuesCount;
    };
    UnqValsColumnFilterModel.prototype.isNothingSelected = function () {
        return this.allUniqueValues.length === 0;
    };
    UnqValsColumnFilterModel.prototype.isValueSelected = function (value) {
        return this.selectedValuesMap[value] !== undefined;
    };
    UnqValsColumnFilterModel.prototype.getDisplayedValueCount = function () {
        return this.displayedValues.length;
    };
    UnqValsColumnFilterModel.prototype.getDisplayedValue = function (index) {
        return this.displayedValues[index];
    };
    UnqValsColumnFilterModel.prototype.isFilterActive = function () {
        return this.allUniqueValues.length !== this.selectedValuesCount;
    	// return false;
    };
    UnqValsColumnFilterModel.prototype.getModel = function () {
        var model = {};
        var column = this.colDef.field;
        model[column] = [];
        if (!this.isFilterActive()) { return null; }
        var selectedValues = [];
        iterateObject(this.selectedValuesMap, function (key) {
            model[column].push(key);
        });
        return model;
    };
    UnqValsColumnFilterModel.prototype.setModel = function (model, isSelectAll) {
        if (model && !isSelectAll) {
            this.selectNothing();
            for (var i = 0; i < model.length; i++) {
                var newValue = model[i];
                if (this.allUniqueValues.indexOf(newValue) >= 0) {
                    this.selectValue(model[i]);
                } else { console.warn('Value ' + newValue + ' is not a valid value for filter'); }
            }
        }
        else { this.selectEverything(); }
    };
/*----------------------Util----------------------------------------------------------------------*/
	function addOrRemoveCssClass(element, className, add) {
        if (add) { addCssClass(element, className);
        } else { removeCssClass(element, className); }
	}
	function removeCssClass(element, className) {
        if (element.className && element.className.length > 0) {
            var cssClasses = element.className.split(' ');
            var index = cssClasses.indexOf(className);
            if (index >= 0) {
                cssClasses.splice(index, 1);
                element.className = cssClasses.join(' ');
            }
        }
    };
    function addCssClass(element, className) {
        if (element.className && element.className.length > 0) {
            var cssClasses = element.className.split(' ');
            if (cssClasses.indexOf(className) < 0) {
                cssClasses.push(className);
                element.className = cssClasses.join(' ');
            }
        }
        else { element.className = className; }
    };
   /*---------Unique Values Filter Utils--------*/
    function loadTemplate(template) {
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = template;
        return tempDiv.firstChild;
    }
    function toStrings(array) {
        return array.map(function (item) {
            if (item === undefined || item === null || !item.toString) {
                return null;
            } else { return item.toString(); }
        });
    }
	function removeAllChildren(node) {
        if (node) {
            while (node.hasChildNodes()) {
                node.removeChild(node.lastChild); }
        }
    }
    function makeNull(value) {
        if (value === null || value === undefined || value === "") {
            return null;
        } else { return value; }
    }
    function iterateObject(object, callback) {
        var keys = Object.keys(object);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = object[key];
            callback(key, value);
        }
    };
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
function setlocalStorage() {
		if (storageAvailable('localStorage')) { 
	   		return window['localStorage'];  									//console.log("Storage available. Setting now. localStorage = %O", localStorage);
		} else { 
			return false; 				      									// console.log("No Local Storage Available"); 
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
		if (localStorage) { 													// console.log("localStorage active.");
			localStorage.setItem(key, val);
		} else { console.log("No Local Storage Available"); }
	}
	function getRemainingStorageSpace() {
		 var limit = 1024 * 1024 * 5; // 5 MB
		 return limit - unescape(encodeURIComponent(JSON.stringify(localStorage))).length;
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