(function(){  
	/**
	 * openRows = The identifier for the row in datagrid to be expanded on grid-load
	 */
	var gridDiv, rcrdsById, taxaByLvl, curTree, intro,
		openRows = [], rowData = [], columnDefs = [];
	var curFocus = localStorage ? localStorage.getItem('curFocus') : false; 	
    var levels = ['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'];
	var localStorage = setlocalStorage();
	var gridOptions = {
	    columnDefs: getColumnDefs(),
	    rowSelection: 'multiple',	//Used for csv export
	    getHeaderCellTemplate: getHeaderCellTemplate, 
	    getNodeChildDetails: getNodeChildDetails,
	    getRowClass: getRowStyleClass,
	    onRowGroupOpened: softRefresh,
	    onBeforeFilterChanged: beforeFilterChange, 
	    onAfterFilterChanged: afterFilterChanged,
	    onModelUpdated: onModelUpdated,
        enableColResize: true,
        enableSorting: true,
        unSortIcon: true,
        enableFilter: true,
        rowHeight: 26
	};
	document.addEventListener('DOMContentLoaded', onDOMContentLoaded); 

	function onDOMContentLoaded () {
		clearLocalStorageCheck();
		curFocus = localStorage ? localStorage.getItem('curFocus') : false; 	//console.log("curFocus = ", curFocus)
		addDomEventListeners();
		authDependentInit();
	    initSearchState();
	}
	function clearLocalStorageCheck() {
			localStorage.clear();
		var prevVisit = localStorage ? localStorage.getItem('prevVisit') || false : false;
		if (localStorage && !localStorage.getItem('epsilon')){
			if ( prevVisit ) { populateStorage('prevVisit', true); }
			populateStorage('epsilon', true);
			showLoadingDataPopUp();
		}
	}
	/** Gets total number of interactions in the database and shows a loading popup message. */
	function showLoadingDataPopUp() {
		sendAjaxQuery({}, 'search/interaction/count', storeIntRcrdTotal);
	}
	function storeIntRcrdTotal(data) {  
		var ttlIntRcrds = data.rcrdCount; 
	    showPopUpMsg("Downloading and Caching\n" + ttlIntRcrds + " records.");	
	}
	function addDomEventListeners() {
		$("#search-focus").change(selectSearchFocus);
		$('button[name="xpand-tree"]').click(toggleExpandTree);
		$('button[name="reset-grid"]').click(resetGrid);
		$("#strt-tut").click(startIntro);
		$("#show-tips").click(showTips);
	}
	function authDependentInit() {
		var userRole = $('body').data("user-role");  							//console.log("----userRole === visitor ", userRole === "visitor")
		if (userRole === "visitor") {
			$('button[name="csv"]').prop('disabled', true);
			$('button[name="csv"]').prop('title', "Register to download.");
			$('button[name="csv"]').css({'opacity': '.8', 'cursor': 'not-allowed' });
		} else { $('button[name="csv"]').click(exportCsvData); }
	}
/*=================Helper Methods=============================================*/
	function showPopUpMsg(msg) {
		var popUpMsg = msg || "Loading...";
		$("#search-popUpDiv").text(popUpMsg);
	    $('#search-popUpDiv, #search-overlay').show();
	    fadeGrid();
	}
	function hidePopUpMsg() {
	    $('#search-popUpDiv, #search-overlay').hide();
	    showGrid();
	}
	function fadeGrid() {
		$('#borderLayout_eRootPanel, #grid-tools, #grid-opts').fadeTo(100, .3);
	}
	function showGrid() {
		$('#borderLayout_eRootPanel, #grid-tools, #grid-opts').fadeTo(100, 1);
	}
	function toggleExpandTree() {  												//console.log("toggleExpandTree")
  		var expanded = $(this).data('xpanded');
  		if (expanded) { 
  			gridOptions.api.collapseAll();
			$('#xpand-tree').html("&nbspExpand Tree&nbsp");
		} else { 
			gridOptions.api.expandAll();	
			$('#xpand-tree').html("Collapse Tree");
  		}
		$(this).data("xpanded", !expanded);
	}
	function resetToggleTreeBttn() {
		$('#xpand-tree').html("&nbspExpand Tree&nbsp");
		$('#xpand-tree').data("xpanded", false);
	}
	/**
	 * Hides the group "tree" column's filter button. Filtering on the group 
	 * column doesn't work as expected.
	 */
	function hideGroupColFilterMenu() {
		$('.ag-header-cell-menu-button.name').hide();
	}
/*-------------------- Top "State" Managment Methods -------------------------*/
	function initSearchState() {
		if (curFocus){ $('#search-focus').val(curFocus);
		} else { $('#search-focus').val("srcs"); }
		initNoFiltersStatus();		
		selectSearchFocus();
	} 
	function selectSearchFocus(e) {  							console.log("select(ing)SearchFocus")
	    showPopUpMsg();
	    if ( $('#search-focus').val() == 'srcs' ) { ifChangedFocus("srcs", getSources);  }
	    if ( $('#search-focus').val() == 'locs' ) { ifChangedFocus("locs", getLocations);  }
	    if ( $('#search-focus').val() == 'taxa' ) { ifChangedFocus("taxa", getTaxa);  }
	    showWalkthroughIfFirstVisit();
	}
	/**
	 * Updates and resets the focus 'state' of the search, either 'taxa' or 'locs'.
	 */
	function ifChangedFocus(focus, buildGridFunc) { 							//console.log("ifChangedFocus called.")
		if (focus !== curFocus) {   
			curFocus = focus;
			populateStorage('curFocus', focus);
			resetToggleTreeBttn();
			clearPastHtmlOptions();
		} else { buildGridFunc(); }
		/** Called seperately so @emptySearchOpts is called once. */
		function clearPastHtmlOptions() {    
			$('#opts-col2').fadeTo(100, 0);
			$('#opts-col1').fadeTo(100, 0, emptySearchOpts);
		}
		function emptySearchOpts() {  											//console.log("emptying search options");
			$('#opts-col2').empty();
			$('#sort-opts').empty();
			$('#opts-col1, #opts-col2').fadeTo(0, 1);
			buildGridFunc();
		}
	} /* End ifChangedFocus */
/*------------------Interaction (Record Fill) Methods-------------------------*/
	/**
	 * Checks if interaction records have been saved in local storage. If not, sends 
	 * ajax to get them with @storeInteractions as the success callback. If records 
	 * are available in storage call @fillTreeWithInteraction. 
	 */
	function getInteractionsAndBuildGrid() {  												//console.log("getInteractionsAndBuildGrid called. ")
		var intRcrds = localStorage ? localStorage.getItem('intRcrds') : false; 
		fadeGrid();
		if ( intRcrds ) { //console.log("Stored interactions loaded = %O", JSON.parse(intRcrds));
			fillTreeWithInteractions( JSON.parse(intRcrds) ); 
		} else { sendAjaxQuery({}, 'search/interaction', storeInteractions); }
	}
	function storeInteractions(data) {  										console.log("Interaction success! rcrds = %O", data.results);
		var intRcrds = JSON.stringify(data.results);
		populateStorage('intRcrds', intRcrds);  
		// fillTreeWithInteractions( data.results );
	}
	/**
	 * Back fills the displayed search focus' data tree with interaction records
	 * and then rebuilds the displayed grid.
	 */
	function fillTreeWithInteractions(intRcrds) {   							//console.log("fillTreeWithInteractionscalled.");
		var gridBuilder;
		var focus = localStorage.getItem('curFocus'); 
		clearPreviousGrid();

		if (focus === "taxa"){  //console.log("focus = 'taxa'");
			gridBuilder = buildBrowseSearchOptsndGrid;
			fillTaxaSetWithInteractionRcrds(curTree);  
	    	fillHiddenTaxaColumns(curTree);
		} else if (focus === "locs") { //console.log("focus = 'locs'");
			gridBuilder = loadLocGrid;
			fillLocsSetWithInteractionRcrds(curTree)
		}
		gridBuilder(curTree);
	    hidePopUpMsg();
	    hideGroupColFilterMenu();
	    /**
	     * The taxa tree is structured as a familial heirarchy, with the domain taxa
	     * as the top-most parent, and the first "sibling".
	     */
		function fillTaxaSetWithInteractionRcrds(treeObj) { 					//console.log("fillTaxaSetWithInteractionRcrds called. taxaTree = %O", treeObj) 
			for (var sibling in treeObj) {   
				replaceTaxaInteractions(treeObj[sibling].interactions, intRcrds);
				if (treeObj[sibling].children !== null) { fillTaxaSetWithInteractionRcrds(treeObj[sibling].children) }
			}
		}
		function replaceTaxaInteractions(interactionsObj) {   					//console.log("replaceTaxaInteractions called. interactionsObj = %O", interactionsObj);
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
		function fillLocsSetWithInteractionRcrds(treeObj) { 					//console.log("fillLocsSetWithInteractionRcrds. locsTree = %O", treeObj);
			for (var topKey in treeObj) {  										//console.log("topKey of treeObj = ", topKey);
				if (Array.isArray(treeObj[topKey])) {  
					getArrayInteractions(treeObj[topKey]);
				} else {
					fillLocsSetWithInteractionRcrds(treeObj[topKey]);
				}
			}
		}
		function getArrayInteractions(treeAry) { 								//console.log("treeAry = %O", treeAry)
			treeAry.forEach(function(locObj){
				replaceInteractions(locObj.interactions, intRcrds)
			});
		}
		function replaceInteractions(interactionsAry) {  						//console.log("replaceInteractions called. interactionsAry = %O", interactionsAry);
			interactionsAry.forEach(function(intId, idx, orgAry){
				if (typeof intId === "number") {	//If not, then the tree has already been 
					orgAry[idx] = intRcrds[intId];	//filled with the interaction records
				}
			});
		}
	} /* End fillTreeWithInteractions */
/*------------------Source Search Methods-----------------------------------*/
	function getSources() {
		var storedSrcs = localStorage ? localStorage.getItem('srcRcrds') : false; 
		if( storedSrcs ) {  //console.log("Stored Source data Loaded");
			showLocSearch(JSON.parse(storedLocs));
		} else { //console.log("Sources Not Found In Storage.");
			sendAjaxQuery({}, 'search/source', storeAndLoadSrcs);
		}
	}
	function storeAndLoadSrcs(data) {											console.log("source data recieved. %O", data);
		// var srcRcrds = sortSrcTree(data.results);
		// populateStorage('locRcrds', JSON.stringify(locRcrds));
		// showLocSearch(locRcrds);
	}
/*------------------Location Search Methods-----------------------------------*/
	function getLocations() {
		var storedLocs = localStorage ? localStorage.getItem('locRcrds') : false; 
		if( storedLocs ) {  //console.log("Stored Locations Loaded");
			showLocSearch(JSON.parse(storedLocs));
		} else { //console.log("Locations Not Found In Storage.");
			sendAjaxQuery({}, 'search/location', storeAndLoadLocs);
		}
	}
	function storeAndLoadLocs(data) {											console.log("location data recieved. %O", data);
		// var locRcrds = sortLocTree(data.results);
		// populateStorage('locRcrds', JSON.stringify(locRcrds));
		// showLocSearch(locRcrds);
	}
	/**
	 * Alpabetizes all locations and sub-locations in the data object and nests 
	 * sub-regions under their parent region.
	 */
	function sortLocTree(data) {
		// var locData = nestSubRegions(data);    //console.log("----locData = %O", locData);
		var sortedLocs = sortLocDataObj(data);   //console.log("sortedLocs = %O", sortedLocs)
		return sortedLocs;
	}
	/** Nests sub-regions under their parent regions. */
	// function nestSubRegions(data) {  									    //console.log("nestSubRegions called. locData = %O", data);
	// 	var subRegionMap = {
	// 		"North Africa" : "Africa", 			"North Asia" : "Asia",
	// 		"Sub-Saharan Africa" : "Africa",	"West & Central Asia" : "Asia",
	// 		"East Asia" : "Asia",				"South & Southeast Asia" : "Asia" };
	// 	var returnData = {};
	// 	returnData["Africa"] = { "Africa-Unspecified": data["Africa"]["Africa-Unspecified"] };
	// 	returnData["Asia"] = {};

	// 	for (var region in data) {   //console.log("region = ", region)
	// 		if (region in subRegionMap) { //console.log("region in subRegion map = %s, %s", region, subRegionMap[region])
	// 			returnData[subRegionMap[region]][region] = data[region];  //console.log("returnData[%s] = %O", region, returnData[subRegionMap[region]])
	// 		} else if (region !== "Africa"){ returnData[region] = data[region]; } 
	// 	}
	// 	return returnData;
	// }
	/** Alpabetizes all locations and sub-locations in the data object */
	function sortLocDataObj(data) {
		var keys = Object.keys(data).sort();  									//console.log("keys = %O", keys)
		var returnObj = {};
		for (var i=0; i<keys.length; i++){ 
			returnObj[keys[i]] = sortSubLocs(data[keys[i]]);
		}
		return returnObj;
	
		function sortSubLocs(locObj) {   										console.log("sortSubLocs locObj = %O", locObj)
			var subLocs = Object.keys(locObj).sort();
			var returnObj = {};

			for (var i=0; i<subLocs.length; i++){
				if (Array.isArray(locObj[subLocs[i]])) { 
					returnObj[subLocs[i]] = locObj[subLocs[i]].sort(alphaLocDesc);
				} else if (typeof locObj[subLocs[i]] === "object" && locObj[subLocs[i]] !== null) {  
					handleLocObj(locObj[subLocs[i]], subLocs[i]); }
			}		
			return returnObj;

			function handleLocObj(locObj, subLoc) {
				if (locObj.id === undefined) { returnObj[subLoc] = sortSubLocs(locObj); 
				} else { returnObj[subLoc] = locObj; }
			}
		} /* End sortSubLocs */
	} /* End sortLocDataObj */
	/** Alphabetizes array via sort method. */
	function alphaLocDesc(a, b) {
		var x=a.desc.toLowerCase();
	    var y=b.desc.toLowerCase();
	    return x<y ? -1 : x>y ? 1 : 0;
	}
	function showLocSearch(locData) {  											//console.log("showLocSearch called. locData = %O", locData)
		clearPreviousGrid();
		loadLocGrid(locData);
		getInteractionsAndBuildGrid();		
	}
	/*----------------- Location Methods recently moved ---------------------------------------------*/
	function loadLocGrid(locData) {
		var topRegionRows = [];
		var finalRowData = [];  //console.log("locData = %O", locData);
		curTree = locData;

		addFutureDevMsg();
		for (var region in locData) { //console.log("region = ", region)
			topRegionRows.push( [getLocRowData(locData[region], region)] );
		}
		topRegionRows.forEach(function(regionRowAry){ $.merge(finalRowData, regionRowAry);	}); 
		backfillSubInteractionsIntoCnt(finalRowData);
		rowData = finalRowData;													//console.log("rowData = %O", rowData);
		loadGrid("Location Tree");
	}
	function addFutureDevMsg() {
		$('#opts-col2').empty();
		var div = document.createElement("div");
		div.id = "loc-dev-msg";
		$(div).text("We will soon be restructuring how location data is " +
		 "stored in the database to be more flexible and more compatible with future " + 
		 " additions such as map views. Once that is complete, this location view will " + 
		 "have it's own hierarchy of filter dropdowns, similar to those currently on the taxon view.");
		$('#opts-col2').append(div);
	}
	function getLocRowData(locObj, locName) {  //console.log("getLocRowData. arguments = %O", arguments);
		return {
			name: locName || null,	/* Interaction rows have no name to display. */
			isParent: locObj.interactionType === undefined,  /* Only interaction records return false. */
			open: openRows.indexOf(locName) !== -1, 
			children: getLocRowDataForChildren(locObj),
			intCnt: locObj.interactions !== undefined ? locObj.interactions.length : null,
			interactions: locObj.interactions !== undefined,     /* Location objects have collections of interactions as children. */     
		};		
	}
	function getLocRowDataForChildren(locObj) {//console.log("getLocRowDataForChildren called. locObj = %O", locObj)
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
		return intRcrdAry.map(function(intRcrd){ //console.log("intRcrd = %O", intRcrd);
			var intRcrdObj = { isParent: false };
			return getIntData(intRcrd, intRcrdObj);
		});
	}
	/*-----------------Grid Methods-------------------------------------------*/
	/*----------------- Shared -----------------------------------------------*/
	/**
	 * When the grid rowModel is updated, the total interaction count for each 
	 * tree node, displayed in the "count" column, is updated to count only displayed
	 * interactions. Any rows filtered out will not be included in the totals.
	 */
	function onModelUpdated() {
		updateSubInteractionCount( gridOptions.api.getModel().rootNode );
	}
	/**
	 * Sets new interaction totals for each tree node @getChildrenCnt and then 
	 * calls the grid's softRefresh method, which refreshes any rows with "volatile"
	 * set "true" in the columnDefs - currently only "Count".
	 */
	function updateSubInteractionCount(rootNode) {
		getChildrenCnt(rootNode.childrenAfterFilter);  
		gridOptions.api.softRefreshView();
	}
	function getChildrenCnt(nodeChildren) {  //console.log("nodeChildren =%O", nodeChildren)
		var nodeCnt, ttl = 0;
		nodeChildren.forEach(function(child) {
			nodeCnt = 0;
			nodeCnt += addSubNodeInteractions(child);
			ttl += nodeCnt;
			if (nodeCnt !== 0 && child.data.intCnt !== null) { 
				child.data.intCnt = nodeCnt; }
		});
		return ttl;
	}
	/**
	 * Interaction records are identified by their lack of any children, specifically 
	 * their lack of a "childrenAfterFilter" property.
	 */
	function addSubNodeInteractions(child) {  
		var cnt = 0;
		if (child.childrenAfterFilter) {
			cnt += getChildrenCnt(child.childrenAfterFilter);
			if (cnt !== 0) { child.data.intCnt = cnt; }
		} else { 
			++cnt;
			child.data.intCnt = null; 
		}
		return cnt;
	}
	function backfillSubInteractionsIntoCnt(rowData) {   //console.log("rowData = %O", rowData);
		for (var treeNode in rowData) { //console.log("rowData[treeNode] = %O", rowData[treeNode]);
			var nodeIntCnt =  rowData[treeNode].intCnt || 0;
			var allSubsIntCnt = nodeIntCnt + addSubInteractions(rowData[treeNode]);
			rowData[treeNode].intCnt = allSubsIntCnt === 0 ? null : allSubsIntCnt;
			if (rowData[treeNode].children) { 
				backfillSubInteractionsIntoCnt(rowData[treeNode].children); 
			}
		}
	}
	function addSubInteractions(treeNode) {  //console.log("addSubInteractions called. treeNode =%O", treeNode);
		var cnt = 0;
		for (var childNode in treeNode.children) {
			if (treeNode.children[childNode].interactions) {
				var childCnt = treeNode.children[childNode].intCnt || 0; //console.log("childCnt = ", childCnt)
				cnt += childCnt;
			}
			if (treeNode.children[childNode].children) { cnt += addSubInteractions(treeNode.children[childNode]); }
		}
		return cnt;
	}
/*------------------Taxa Search Methods---------------------------------------*/
	/** Ajax to get all taxa and domain rcrds if not already stored. */
	function getTaxa() {  
		var storedDomains = localStorage ? localStorage.getItem('domainRcrds') : false; 
		if( storedDomains ) { //console.log("Stored Taxa Loaded");
			showTaxonSearch(JSON.parse(storedDomains));
		} else { // console.log("Taxa Not Found In Storage.");
			sendAjaxQuery({}, 'search/taxa', storeAndLoadTaxa);
		}
	}
	function storeAndLoadTaxa(data) {											console.log("taxa data recieved. %O", data);
		populateStorage('domainRcrds', JSON.stringify(data.domainData));
		populateStorage('taxaRcrds', JSON.stringify(data.taxaData));
		showTaxonSearch(data);
	}
	function showTaxonSearch(data) {
		if (!$("#sel-domain").length) { buildTaxaSearchHtml(data.domainData); } 	
		// initTaxaSearchState();
		// getAllTaxaRcrds(data);
	}
	function initTaxaSearchState() { //console.log("$('#sel-domain').val() = ", $('#sel-domain').val())
		var storedTaxa = localStorage.getItem('taxaRcrds'); 
		rcrdsById = JSON.parse(storedTaxa);
		
		if ($('#sel-domain').val() === null) { $('#sel-domain').val('3'); }
		onTaxaSearchMethodChange();
	}
	// function getTaxa() {  
	// 	var storedDomains = localStorage ? localStorage.getItem('domainRcrds') : false; 
	// 	if( storedDomains ) { //console.log("Stored Domains Loaded");
	// 		showTaxonSearch(JSON.parse(storedDomains));
	// 	} else { // console.log("Domains Not Found In Storage.");
	// 		sendAjaxQuery({}, 'search/taxa', storeAndLoadTaxa);
	// 	}
	// }
	// function storeAndLoadDomains(data) {										//console.log("domain data recieved. %O", data);
	// 	populateStorage('domainRcrds', JSON.stringify(data.results));
	// 	showTaxonSearch(data.results);
	// }
	// function showTaxonSearch(data) {
	// 	if (!$("#sel-domain").length) { buildTaxaSearchHtml(data); } 	
	// 	initTaxaSearchState();
	// 	getAllTaxaRcrds(data);
	// }
	// function initTaxaSearchState() { //console.log("$('#sel-domain').val() = ", $('#sel-domain').val())
	// 	if ($('#sel-domain').val() === null) { $('#sel-domain').val('3'); }
	// }
	// /** Ajax to get all interaction rcrds. */
	// function getAllTaxaRcrds(domainData) {  
	// 	var domainIds = Object.keys(domainData);  console.log("domainData = %O", domainData);
	// 	var storedTaxa = localStorage ? localStorage.getItem('taxaRcrds') : false; 
	// 	if( storedTaxa ) {  		//console.log("Stored taxaRcrds Loaded");
	// 		rcrdsById = JSON.parse(storedTaxa);
	// 		onTaxaSearchMethodChange();
	// 	} else { //  console.log("taxaRcrds Not Found In Storage.");
	// 		sendAjaxQuery({domainIds: domainIds}, 'search/taxa', recieveTaxaRcrds);
	// 	}
	// }
	// function recieveTaxaRcrds(data) {  											console.log("taxaRcrds recieved. %O", data);
	// 	// rcrdsById = data.results;
	// 	// populateStorage('taxaRcrds', JSON.stringify(rcrdsById));	
	// 	// onTaxaSearchMethodChange();
	// }
	/**
	 * Builds the HTML for the search methods available for the taxa-focused search,
	 * both text search and browsing through the taxa names by level.
	 */
	function buildTaxaSearchHtml(data) { 	 									//console.log("buildTaxaSearchHtml called. ");
		var browseElems = createElem('span', { id:"sort-taxa-by", text: "Group Taxa by: " });
		var filterBttnCntnr = createElem('div', { id: "filter-bttns", class: "flex-col" });
		var domainOpts = getDomainOpts(data); 	//	console.log("domainOpts = %O", domainOpts);
		$(browseElems).append(buildSelectElem(domainOpts, { class: 'opts-box', id: 'sel-domain' }));

		$('#sort-opts').append([browseElems, filterBttnCntnr]);
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

	function onTaxaSearchMethodChange(e) { 
		clearPreviousGrid();
		selectTaxaDomain();
	}
	function selectTaxaDomain(e) {	
    	var domainTaxon = rcrdsById[$('#sel-domain').val() || 4]; 					//console.log("domainTaxon = %O", domainTaxon)
		populateStorage('curDomain', $('#sel-domain').val());
		resetToggleTreeBttn();
		showDomainTree(domainTaxon);
		getInteractionsAndBuildGrid();
	}
	/** Show all data for domain. */
	function showDomainTree(domainTaxon) {							console.log("domainTaxon=%O", domainTaxon)
		storeDomainLevel();
		getTaxaTreeAndBuildGrid(domainTaxon);
		$('#sort-opts').fadeTo(150, 1);

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
		taxaByLvl = separateByLevel(taxaTree, topTaxon.displayName); 				//console.log("taxaByLvl = %O", taxaByLvl)
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
	function buildBrowseSearchOptsndGrid(taxaTree, curSet) {  					//console.log("taxaByLvl = %O", taxaByLvl)
		var curTaxaByLvl = curSet || taxaByLvl;  
		var levels = Object.keys(curTaxaByLvl);
		var domainLvl = levels.shift();
		var lvlOptsObj = buildTaxaLvlOptions(curTaxaByLvl);

		clearPreviousGrid();
		setLevelSelects();
		loadTaxaGrid( taxaTree );

		function setLevelSelects() { loadLevelSelectElems( lvlOptsObj, levels ); }
	} /* End buildBrowseSearchOptsndGrid */
	function rmvClearLevelSelectsBttn() {
		if ($('#clearLvls').length) { $('#clearLvls').remove(); }
	}
	/*----------------Apply Fitler Update Methods-----------------------------*/
	/**
	 * When a level dropdown is changed, the grid is updated with the selected taxon
	 * as the top of the new tree. If the dropdowns are cleared, the taxa-grid is 
	 * reset to the domain-level taxon. The level drop downs are updated to show related taxa.
	 */
	function updateTaxaSearch() {  //console.log("$(this).val() = ", $(this).val())
		var selectedTaxa = $(this).val(); 										//console.log("selectedTaxa = %O", selectedTaxa);
		var selTaxonRcrd = rcrdsById[selectedTaxa]  
		var selectedVals = getRelatedTaxaToSelect(selTaxonRcrd);  				//console.log("selectedVals = %O", selectedVals);

		repopulateDropDowns(selTaxonRcrd, selectedVals);
		updateFilterStatus();
		loadGridForTaxon();

		function loadGridForTaxon() {
			var taxaTree = buildTaxaTree(selTaxonRcrd);
			openRows = selectedTaxa; 

			clearPreviousGrid();
			loadTaxaGrid(taxaTree);
		}
		function updateFilterStatus() {
			var curLevel = selTaxonRcrd.level;
			var taxonName = selTaxonRcrd.displayName;
			var status = "Filtering on: " + curLevel + " " + taxonName; 
			clearGridStatus();
			setLevelFilterStatus(status);
		}
	} /* End updateTaxaSearch */
	/** Selects ancestors of the selected taxa to set as value of their levels dropdown. */
	function getRelatedTaxaToSelect(selectedTaxaObj) {
		var topTaxaIds = [1, 2, 3, 4]; //Animalia, chiroptera, plantae, arthropoda 
		var selected = {};
		var lvls = Object.keys(taxaByLvl);
		lvls.shift(); 		// remove domain, 'group taxa by', level

		selectAncestorTaxa(selectedTaxaObj);
		selectEmptyAnscestors(selectedTaxaObj.level);
		return selected;

		function selectAncestorTaxa(taxon) {									//console.log("selectedTaxaid = %s, obj = %O", taxon.id, taxon)
			if ( topTaxaIds.indexOf(taxon.id) === -1 ) {
				selected[taxon.level] = taxon.id; 								//console.log("setting lvl = ", taxon.level)
				selectAncestorTaxa(rcrdsById[taxon.parentTaxon])
			}
		}
		function selectEmptyAnscestors(prevLvl) { if (prevLvl === undefined) {return;}
			var nextLvl = levels[ levels.indexOf(prevLvl) - 1 ]; 
			if (lvls.indexOf(nextLvl) !== -1) {  
				if (selected[nextLvl] === undefined) { selected[nextLvl] = "none"; }
				selectEmptyAnscestors(nextLvl);
			}
		}
	} /* End getRelatedTaxaToSelect */
	function loadLevelSelectElems(levelOptsObj, lvls, selected) { 				//console.log("loadLevelSelectElems. arguments = %O", arguments)
		var elems = buildSelects(levelOptsObj, lvls);
		clearCol2();		
		$('#opts-col2').append(elems);
		setSelectedVals(selected);
	}
    function setSelectedVals(selected) {                   						//console.log("selected in setSelectedVals = %O", selected);
    	Object.keys(taxaByLvl).forEach(function(lvl) {
	        var selId = '#sel' + lvl;
			$(selId).find('option[value="all"]').hide();
    		if (selected !== undefined) {
	            if (selected[lvl]) { 
	            	$(selId).val(selected[lvl]); 
					$(selId).find('option[value="none"]').hide();
				}
	    	}
	    });
    }
	function clearPreviousGrid() {
		if (gridOptions.api) { gridOptions.api.destroy(); }		
	}
	function buildTaxaLvlOptions(rcrds) {  										//console.log("buildTaxaLvlOptions rcrds = %O", rcrds);
		var optsObj = {};
		for (var lvl in rcrds) {
			var taxaNames = Object.keys(rcrds[lvl]).sort(); 					//console.log("taxaNames = %O", taxaNames);
			optsObj[lvl] = buildTaxaOptions(taxaNames, rcrds[lvl]);
			if (taxaNames.length > 0 && taxaNames[0] !== "None") {
				optsObj[lvl].unshift({value: 'all', text: '- All -                 '});
			}
		}
		return optsObj;
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

		function getChildTaxa(children) {										//console.log("get Child Taxa called. children = %O", children);
			if (children === null) { return null; }
			return children.map(function(child){
				if (typeof child === "object") { console.log("taxa child object = %O", child); return child; }

				var childRcrd = rcrdsById[child]; 								//console.log("child = %O", child);

				if (childRcrd.children.length >= 1) { 
					childRcrd.children = getChildTaxa(childRcrd.children);
				} else { childRcrd.children = null; }

				return childRcrd;
			});
		}
	} /* End buildTaxaTree */
/*---------------------------- Taxa Specific Filters-------------------------------- */
	/**
	 * Goes through levels from kingdom through species and checks if that level dropdown
	 * exists and has a selected value. 
	 * @param  {[type]}  filterCheck [description]
	 * @return {Boolean}             [description]
	 */
	function isTaxonymSelected(filterCheck) {
        var filterSelections = {}; //console.log("filterSelections = %O", filterSelections)
        var selected = false;

        levels.forEach(function(lvl){
        	var selId = '#sel' + lvl;  //console.log("level = %s, val = %s", lvl, $(selId).val());
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
	/**
	 * Reloads level dropdowns based on the newest selected taxon. Only the direct
	 * decendents of the selected taxon are included in their level drop downs, 
	 * all taxa at levels above the selected taxa are included in the drop downs, 
	 * drect ancestors will be selected as their dropdownsx 'value' later.
	 */
	function repopulateDropDowns(selTaxonRcrd, selectedVals) {
		var lvls = Object.keys(taxaByLvl);
		lvls.shift(); 		// remove domain, 'group taxa by', level
		var relatedTaxaOpts = buildTaxaOptsObj(selTaxonRcrd, selTaxonRcrd.level);
		
		var lvlOptsObj = buildTaxaLvlOptions(relatedTaxaOpts);
		loadLevelSelectElems(lvlOptsObj, lvls, selectedVals);

		/**
		 *  Builds an object keyed by level with options for the dropdown build. 
		 *  The selected taxon will be the only taxon present in it's level, it's 
		 *  direct children will be put in at their respective levels, and all taxon 
		 *  in the levels above will be included in the dropdowns, later the direct
		 *  ancestors of the selected taxon will be also be set as their level's value.
		 */
		function buildTaxaOptsObj(selectedTaxon, lvl) {
			var relatedTaxaOpts = {};
			relatedTaxaOpts[lvl] = {};
			relatedTaxaOpts[lvl][selectedTaxon.displayName] = selectedTaxon;

			if (selectedTaxon.children) { getChildren(selectedTaxon.children); }
			initEmptyLowerLevels(selectedTaxon.level);
			getAllTaxaInHigherLevels(selectedTaxon.level);
			addEmptyLvls(selectedTaxon.level); 									//console.log("relatedTaxaOpts = %O", relatedTaxaOpts)
			return relatedTaxaOpts;
	
			function getChildren(directChildren) {  							//console.log("children = %O", directChildren)
				directChildren.forEach(function(grandChild){
					if (relatedTaxaOpts[grandChild.level] === undefined) { relatedTaxaOpts[grandChild.level] = {}; }
					relatedTaxaOpts[grandChild.level][grandChild.displayName] = grandChild;
					if (grandChild.children) { getChildren(grandChild.children); }
				});
			}
			function getAllTaxaInHigherLevels(prevLvl) { 						//console.log("--prevLvl = %s, lvls =%O", prevLvl, lvls)
				var nextLvl = levels[ levels.indexOf(prevLvl) - 1 ];
				var showLvl = lvls.indexOf(nextLvl);	//console.log("showLvl = ", showLvl) 						
				if (showLvl === -1 || nextLvl === localStorage.getItem('domainLvl')) {return;} 
				relatedTaxaOpts[nextLvl] = taxaByLvl[nextLvl];  //console.log("--higherLvl = ", nextLvl)
				if (selectedVals[nextLvl] === "none") { relatedTaxaOpts[nextLvl]["None"] = { id: "none" }; }
				getAllTaxaInHigherLevels(nextLvl);
			}
			function initEmptyLowerLevels(lastLvl) { 							//console.log("--lastLvl = ", lastLvl)
				var lowerLvl = levels[ levels.indexOf(lastLvl) + 1 ];   		//console.log("--lowerLvl = ", lowerLvl)
				if (lvls.indexOf[lowerLvl] !== -1 && relatedTaxaOpts[lowerLvl] === undefined){
					relatedTaxaOpts[lowerLvl] = {};
					relatedTaxaOpts[lowerLvl]["None"] = { id: 'none' };
					selectedVals[lowerLvl] = "none";
				};	
			}
			function addEmptyLvls(taxonLvl) {  									//console.log("relatedTaxaOpts before empty levels = %O", JSON.parse(JSON.stringify(relatedTaxaOpts)));
				var selectedLvlIdx = lvls.indexOf(taxonLvl);
				lvls.forEach(function(lvl) {
					if (relatedTaxaOpts[lvl] === undefined) { //console.log("lvl is undefined = ", lvl);
						var newLvlIdx = lvls.indexOf(taxonLvl);
						if (newLvlIdx < selectedLvlIdx) { relatedTaxaOpts[lvl] = taxaByLvl[lvl]; 
						} else { relatedTaxaOpts[lvl] = {}; }
						relatedTaxaOpts[lvl]["None"] = { id: 'none' };
						selectedVals[lvl] = "none";
					}
				});
			}
		} /* End buildTaxaOptsObj */
	} /* End repopulateDropDowns */
	function getSelectedVals(selected) {
		var vals = {};
		for (var lvl in selected) {
			vals[lvl] = selected[lvl];  										//console.log("selected in getselectedVals = %O", JSON.parse(JSON.stringify(selected)));
		}
		return vals;
	}
	/*---------Data Formatting------------------------------------------------*/
	function loadTaxaGrid(taxaTree) {  //console.log("loadTaxaGrid called. taxaTree = %O", taxaTree)
		var topTaxaRows = [];
		var finalRowData = [];
		for (var taxon in taxaTree) {
			topTaxaRows.push( getTaxaRowData(taxaTree[taxon]) );
		}
		topTaxaRows.forEach(function(taxaRowAry){ $.merge(finalRowData, taxaRowAry);	}); 
		backfillSubInteractionsIntoCnt(finalRowData);
		rowData = finalRowData;													//console.log("rowData = %O", rowData);

		loadGrid("Taxa Tree");
	}
	function getTaxaRowData(taxon) { //console.log("taxonRowData. taxon = %O. rcrdsById = %O", taxon, rcrdsById)
		var taxonName = taxon.level === "Species" ? 
			taxon.displayName : taxon.level + " " + taxon.displayName;
		return [{
			id: taxon.id,
			name: taxonName,
			isParent: taxon.interactions !== null || taxon.children !== null,
			parentTaxon: taxon.parentTaxon,
			open: openRows.indexOf(taxon.id.toString()) !== -1, 
			children: getTaxaRowDataForChildren(taxon),
			taxaLvl: taxon.level,
			interactions: taxaHasInteractions(taxon),          
			intCnt: taxaHasInteractions(taxon) ? getIntCount(taxon) : null,
		}];	
		/** Only counting one role with interactions currently. */
	} /* End getTaxaRowData */
	function taxaHasInteractions(taxon) {
		var intsFound = false;
		for ( var role in taxon.interactions ) {
			if (intsFound) {continue}
			intsFound = taxon.interactions[role] === null ? false : taxon.interactions[role].length > 0;	
			if (intsFound) { intCnt = taxon.interactions[role].length; }	
		}
		return intsFound;
	} 
	function getIntCount(taxon) {
		var intCnt = null;
		for ( var role in taxon.interactions ) {
			intsFound = taxon.interactions[role] === null ? false : taxon.interactions[role].length > 0;	
			if (intsFound) { intCnt = taxon.interactions[role].length; }	
		}  
		return intCnt;
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
    /**
     * Fills additional columns with flattened taxa-tree parent chain data for csv exports.
     */
    function fillHiddenTaxaColumns(curTaxaTree) {  
    	var curTaxaHeirarchy = {};
    	getNextLvlTaxaData(curTaxaTree);

    	function getNextLvlTaxaData(treeObj) {
	    	for(var topTaxon in treeObj) {  
	    		syncTaxaHeir( treeObj[topTaxon].displayName, treeObj[topTaxon].level, treeObj[topTaxon].parentTaxon);
	    		fillInteractionRcrdsWithTaxaTreeData( treeObj[topTaxon].interactions );
	    		if (treeObj[topTaxon].children) { 
	    			getNextLvlTaxaData( treeObj[topTaxon].children ); }	    		
	    	}
    	}
    	/**
    	 * The top taxon for the taxa domain triggers the taxa-heirarchy init @fillInAvailableLevels. 
    	 * For each subsequent taxa, every level more specific that the parent 
    	 * lvl is cleared from the taxa-heirarchy @clearLowerLvls.  
    	 */
    	function syncTaxaHeir(taxonName, lvl, parentTaxon) { 
    		if (parentTaxon === null || parentTaxon === 1) { fillInAvailableLevels(lvl);
    		} else { clearLowerLvls(rcrdsById[parentTaxon].level) }

    		curTaxaHeirarchy[lvl] = taxonName;
    	}
    	/**
    	 * Inits the taxa-heirarchy object that will be used to track of the current
    	 * parent chain of each taxon being processed. 
    	 * */
    	function fillInAvailableLevels(topLvl) { 
    		var topIdx = levels.indexOf(topLvl);
    		for (var i = topIdx; i < levels.length; i++) { 
    			curTaxaHeirarchy[levels[i]] = null;
    		}  
    	}
    	function clearLowerLvls(parentLvl) {
    		var topIdx = levels.indexOf(parentLvl);
    		for (var i = ++topIdx; i < levels.length; i++) { curTaxaHeirarchy[levels[i]] = null; }
    	}
    	function fillInteractionRcrdsWithTaxaTreeData(intObj) {
    		for (var role in intObj) {
    			if (intObj[role] !== null) { intObj[role].forEach(addTaxaTreeFields) }
    		}
    	} 
		function addTaxaTreeFields(intRcrdObj) {
    		var lvlMap = {
    			'Kingdom': 'treeKingdom', 'Phylum': 'treePhylum', 'Class': 'treeClass', 'Order': 'treeOrder', 
    			'Family': 'treeFamily', 'Genus': 'treeGenus', 'Species': 'treeSpecies' 
    		};
			for (var lvl in curTaxaHeirarchy) { 
				intRcrdObj[lvlMap[lvl]] = lvl === 'Species' ? 
					getSpeciesName(curTaxaHeirarchy[lvl]) : curTaxaHeirarchy[lvl];
			}
		}
		function getSpeciesName(speciesName) {
			return speciesName === null ? null : ucfirst(curTaxaHeirarchy['Species'].split(' ')[1]);
		}
    } /* End fillHiddenColumns */
	function loadGrid(mainCol, gridOpts) {  //console.log("final rows = %O", rowData);
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
		}  																 		//console.log("getTaxaIntData called. intRowData = %O", intRowData);
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
		var filterId = params.column.colId + 'ColFilterIcon';  
		return '<div class="ag-header-cell">' +
	        '  <div id="agResizeBar" class="ag-header-cell-resize"></div>' +
	        '  <span id="agMenu" class="' + params.column.colId + ' ag-header-icon ag-header-cell-menu-button"></span>' + //added class here so I can hide the filter on the group column, 
	        '  <div id="agHeaderCellLabel" class="ag-header-cell-label">' +									//which breaks the grid. The provided 'supressFilter' option doesn't work.
	        '    <span id="agSortAsc" class="ag-header-icon ag-sort-ascending-icon"></span>' +
	        '    <span id="agSortDesc" class="ag-header-icon ag-sort-descending-icon"></span>' +
	        '    <span id="agNoSort" class="ag-header-icon ag-sort-none-icon"></span>' +
	        '    <a name="' + filterId + '" id="agFilter" class="anything ag-header-icon ag-filter-icon"></a>' +
	        '    <span id="agText" class="ag-header-cell-text"></span>' +
	        '  </div>' +
	        '</div>'; 
	}
	function softRefresh() { gridOptions.api.refreshView(); }
	/**
	 * Tree columns are hidden until taxa export and are used for the flattened 
	 * taxa-tree data. The role is set to subject for 'bats' exports, object for plants and bugs.
	 */
	function getColumnDefs(mainCol) { 
		var domain = localStorage.getItem('curDomain') || false;  
		var taxaRole = domain ? (domain == 2 ? "Subject" : "Object") : "Tree"; 

		return [{headerName: mainCol, field: "name", width: 264, cellRenderer: 'group', suppressFilter: true,
					cellRendererParams: { innerRenderer: innerCellRenderer, padding: 20 }, 
					cellClass: getCellStyleClass },		//cellClassRules: getCellStyleClass
			    {headerName: taxaRole + " Kingdom", field: "treeKingdom", width: 150, hide: true },
			    {headerName: taxaRole + " Phylum", field: "treePhylum", width: 150, hide: true },
			    {headerName: taxaRole + " Class", field: "treeClass", width: 150, hide: true },
			    {headerName: taxaRole + " Order", field: "treeOrder", width: 150, hide: true },
			    {headerName: taxaRole + " Family", field: "treeFamily", width: 150, hide: true },
			    {headerName: taxaRole + " Genus", field: "treeGenus", width: 150, hide: true },
			    {headerName: taxaRole + " Species", field: "treeSpecies", width: 150, hide: true },
			    {headerName: "Count", field: "intCnt", width: 81, headerTooltip: "Interaction Count", volatile: true },
			    {headerName: "Subject Taxon", field: "subject", width: 133 },
			    {headerName: "Object Taxon", field: "object", width: 133  },
			    {headerName: "Interaction Type", field: "interactionType", width: 146, filter: UniqueValuesFilter },
			    {headerName: "Habitat Type", field: "habitatType", width: 125, filter: UniqueValuesFilter },
			    {headerName: "Tags", field: "tags", width: 75, filter: UniqueValuesFilter},
			    {headerName: "Country", field: "country", width: 100, filter: UniqueValuesFilter },
			    {headerName: "Region", field: "region", width: 88, filter: UniqueValuesFilter },
			    {headerName: "Location Description", field: "location", width: 175,},
			    {headerName: "Citation", field: "citation", width: 100,},
			    {headerName: "Note", field: "note", width: 110,} ];
	}
	function innerCellRenderer(params) { 										//console.log("params in cell renderer = %O", params)
		return params.data.name || null;
	}
	function getRowStyleClass(params) { 										//console.log("getRowStyleClass params = %O", params);
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
	function getCellStyleClass(params) {									//console.log("getCellStyleClass params = %O", params);
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
	function beforeFilterChange() {  //console.log("beforeFilterChange")
		// clearGridStatus();
        getActiveDefaultGridFilters();    
	} 
	/**
	 * Resets grid state to top focus options: Taxa are reset to the domain level, 
	 * and locations are entirely reset.
	 */
	function resetGrid() { 
		openRows = curFocus === "taxa" ? [$('#sel-domain').val()] : [];
		getInteractionsAndBuildGrid();
		resetToggleTreeBttn();
		getActiveDefaultGridFilters();
		initNoFiltersStatus();
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
	function getActiveDefaultGridFilters() {									//console.log("getActiveDefaultGridFilters called.")
		var filterStatus;
		var activeFilters = [];
		if (gridOptions.api === undefined) { return; }
		var filterModels = getAllFilterModels();		
		var columns = Object.keys(filterModels);		

		for (var i=0; i < columns.length; i++) {
			if (filterModels[columns[i]] !== null) { activeFilters.push(columns[i]); }
		}
		getFilterStatus();
		filterStatus = getFilterStatus();
		setGridFilterStatus(filterStatus); 
		
		function getFilterStatus() {
			var tempStatusTxt;
			if (activeFilters.length > 0) {
				if ($('#xtrnl-filter-status').text() === 'Filtering on: ') {
					return activeFilters.join(', ') + '.';
				} else {
					tempStatusTxt = $('#xtrnl-filter-status').text();
					if (tempStatusTxt.charAt(tempStatusTxt.length-2) !== ',') {  //So as not to add a second comma.
						setLevelFilterStatus(tempStatusTxt + ', ');
					}
					return activeFilters.join(', ') + '.'; }
			}
		}
	}
	function setGridFilterStatus(status) {  //console.log("setGridFilterStatus. status = ", status)
		$('#grid-filter-status').text(status);
	}
	function setLevelFilterStatus(status) {
		$('#xtrnl-filter-status').text(status);
	}
	function clearGridStatus() {
		$('#grid-filter-status, #xtrnl-filter-status').empty();
		activeFilters = [];
	}
	function initNoFiltersStatus() {
		$('#xtrnl-filter-status').text('Filtering on: ');
		$('#grid-filter-status').text('No Active Filters.');
	}
    /**
     * Class function: 
     * This filter presents all unique values of column to potentially filter on.
     */
    function UniqueValuesFilter() {}
    UniqueValuesFilter.prototype.init = function (params) { 					//console.log("UniqueValuesFilter.prototype.init. params = %O", params)
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
    	var colFilterIconName = col + 'ColFilterIcon'; 							//console.log("colFilterIconName = %O", colFilterIconName)
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
    UniqueValuesFilter.prototype.removeVirtualRows = function (rowsToRemove) {  //console.log("removeVirtualRows called. rows = %O", rowsToRemove)
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
    function UnqValsColumnFilterModel(colDef, rowModel, valueGetter, doesRowPassOtherFilters) { //console.log("UnqValsColumnFilterModel.prototype.init. arguments = %O", arguments);
 		this.colDef = colDef;			//console.log("colDef = %O", this.colDef);
        this.rowModel = rowModel;		//console.log("rowModel = %O", this.rowModel);
        this.valueGetter = valueGetter; //console.log("valueGetter = %O", this.valueGetter);
        this.doesRowPassOtherFilters = doesRowPassOtherFilters; //console.log("doesRowPassOtherFilters = %O", this.doesRowPassOtherFilters);
        this.filterParams = this.colDef.filterParams;  //console.log("filterParams = %O", this.filterParams);
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
/*=================CSV Methods================================================*/
	/**
	 * Exports a csv of the interaction records displayed in the grid, removing 
	 * tree rows and flattening tree data where possible: currently only taxa.
	 * For taxa csv export: The relevant tree columns are shown and also exported. 
	 */
	function exportCsvData() {
		var fileName = curFocus === "taxa" ? 
			"Bat Eco-Interaction Records by Taxa.csv" : "Bat Eco-Interaction Records by Location.csv";
		var params = {
			onlySelected: true,
			fileName: fileName,
			// customHeader: "This is a custom header.\n\n",
			// customFooter: "This is a custom footer."
		};
		if (curFocus === "taxa") { showOverlayAndTaxaCols(); }
		gridOptions.columnApi.setColumnsVisible(["name", "intCnt"], false)
		selectRowsForExport();
		gridOptions.api.exportDataAsCsv(params);
		returnGridState();
	}
	function returnGridState() {
		// if (curFocus === "taxa") { hideOverlayAndTaxaCols(); }
		gridOptions.columnApi.setColumnsVisible(["name", "intCnt"], true);
		gridOptions.api.deselectAll();
		hidePopUpMsg();
	}
	function showOverlayAndTaxaCols() {
		showPopUpMsg("Exporting...");
		gridOptions.columnApi.setColumnsVisible(getCurTaxaLvlCols(), true)

	}
	function getCurTaxaLvlCols() { //console.log("taxaByLvl = %O", taxaByLvl)
		var lvls = Object.keys(taxaByLvl);
		return lvls.map(function(lvl){ return 'tree' + lvl; });
	}
	function hideOverlayAndTaxaCols() {
		gridOptions.columnApi.setColumnsVisible(getCurTaxaLvlCols(), false)
	}
	/**
	 * Selects every interaction row in the currently displayed grid by expanding all
	 * rows in order to get all the rows via the 'rowsToDisplay' property on the rowModel.
	 */
	function selectRowsForExport() {
		var curDisplayedRows, returnRows;
		gridOptions.api.expandAll();
		curDisplayedRows = gridOptions.api.getModel().rowsToDisplay;  			
		curDisplayedRows.forEach(selectInteractions);
		console.log("selected rows = %O", gridOptions.api.getSelectedNodes())	
	}
	/**
	 * A row is identified as an interaction row by the 'interactionType' property
	 * present in the interaction row data.
	 */
	function selectInteractions(rowNode) { 
		if (rowNode.data.interactionType !== undefined) {  						
			rowNode.setSelected(true);
		}
	}/*========================= Walkthrough Methods ==================================================*/
	function showWalkthroughIfFirstVisit() {
		var prevVisit = localStorage ? localStorage.getItem('prevVisit') || false : false; 	 //console.log("newVisit = ", newVisit)
		if ( !prevVisit ) { 
			window.setTimeout(startIntro, 250); 
			populateStorage('prevVisit', true);
		}	
	}
	function startIntro(startStep){
		if (intro) { //console.log("intro = %O", intro)
			intro.exit() 
		} else { 
			buildIntro();
		}
		setGridState();
		intro.start();

		function buildIntro() {  //console.log("buildIntro called")
			intro = introJs();
			var startStep = startStep || 0; 

			intro.onexit(function() { resetGridState(); });
			intro.oncomplete(function() { resetGridState(); });

			intro.setOptions({
				showStepNumbers: false,
				skipLabel: "Exit",
				doneLabel: "I'm done.",
				tooltipClass: "intro-tips", 
				steps: [
					{
						element: "#tut-opts", 
						intro: "<h2><center>Welcome to Bat Eco-Interactions Search Page!</center></h2><br>" +
							"<b>This tutorial is a demonstration the search functionality.</b><br><br>It is available to you by " +
							"clicking on the \"Tutorial\" button at any time. There are also \"Search tips\" for " +
							"creative searches to filter your results you can explore once the tutorial ends.<br><br>You can exit the tutorial " +
							"by clicking 'Exit', or anywhere on the greyed background." +
							"<br><br><center><h2>Use your right arrow key or click 'Next' to start the tutorial.</h2></center>",
						position: "left",
					},
					{
						/*element: document.querySelector("#filter-opts"),*/
						element: "#filter-opts",
						intro: "<h3><center>The search results can be grouped by either<br> Taxa or Location.<center></h3> <br> " + 
							"<b>Interaction records will be displayed grouped under the outline tree in the first column of the grid.</b><br><br>" +
							"Locations are in a Region-Country-Location structure and Taxa are arranged by Parent-Child relationships." +
							"<br><br>Taxa are the default focus, the most complex, and where this tutorial will continue from.",
					},
					{
						element:"#sort-opts",
						intro: "<center><b>Results by taxa must be further grouped by the taxa realm: Bats, Plants, or Arthropoda.</b>" +
							"<br><br>We have selected Plants for this tutorial.</center>",
						position: "right"
					},
					{
						element: "#search-grid",
						intro: "<h3><center>The resulting interaction data is displayed here.</center></h3><br><b><center>When first displayed " +
							"all interactions in the database are available for further filtering or sorting.</center></b>" +
							"<br>The <b>'Count'</b> column shows the number of interactions attributed to each Taxon or Location in the outline tree." +
							"<br><br>The <b>'Subject Taxon'</b> column shows the bat taxon that each interaction is attributed to." +
							"<br><br>The <b>'Object Taxon'</b> column shows the plant or arthropod interacted <i>with</i>." +
							"<br><br> Columns can be resized by dragging the column header dividers and rearranged by dragging the header iteself." +
							"<br><br>Note on Taxa names: Species names include the genus in the species name and names at all other levels have the" +
							"level added to the start of their name.",
						position: "top"
					},
					{
						element: "#xpand-tree",   
						intro: "<b><center>Click here to expand and collapse the outline tree.</center></b><br><center>You can try it now.</center>",
						position: "right"
					},
					{
						element: "#search-grid",
						intro: "<h3><center>There are a few different ways to filter the results.</center></h3><br><b>Hovering over a " +
							"column header reveals the filter menu for that column.</b><br><br>Some columns can be filtered by text, " +
							"and others by selecting or deselecting values in that column.<br><br><center><b>Try exploring the filter menus " +
							"a bit now.</b></center>",
						position: "top"
					},
					{
						element: "button[name=\"reset-grid\"]",
						intro: "<b>Click here at any point to clear all filters and reset the results.</b>",
						position: "right"
					},
					{
						element: "#opts-col2",
						intro: "<h3><center>There are taxa-specific search filters available.</center></h3><br>" + 
							"<b>These dropdowns show all taxon levels that are used in the outline tree.</b> When first displayed, " +
							"all taxa for each level will be available in the dropdown selection lists.<br><br><b>You can focus  " +
							"on any part of the taxon tree by selecting a specific taxon from a dropdown.</b> The outline " +
							"will change to show the selected taxon as the top of the outline.<br><br><b>When a dropdown is used " +
							"to filter the data, the other dropdowns will also change to reflect the data shown.</b><br><br>- Dropdowns " +
							"below the selected level will contain only decendents of the selected Taxon.<br>- Dropdowns above the selected " +
							"level will have the direct ancestor selected, but will also contain all of the taxa at that higher level, allowing " +
							"the search to be broadened.<br>- Any levels that are not recorded in the selected Taxon's ancestry chain will have 'None' selected.",
						position: "left"
					},
					{
						element: "button[name=\"csv\"]",
						intro: "<h3><center>As a member of batplant.org, data displayed in the grid can be exported in csv format.</center></h3>" +
							"<br>The columns are exported in the order they are displayed in the grid.<br><br>For Taxa exports, " +
							"the outline tree will be translated into additional columns at the start of each interaction.<br><br>" +
							"The Location outline is not translated into the interaction data at this time, every other column " +
							"will export.<br><br>For an explanation of the csv format and how to use the file, see the note at the " + 
							"bottom of the \"Search Tips\"",
						position: "left"
					},
				]
			});
		} /* End buildIntro */
		function setGridState() {
			$('#search-grid').css("height", "444px");
			$('#search-focus').val("taxa");
	        $('#show-tips').off("click");
			// selectSearchFocus();
			$('#search-focus').off("change");
		}
		function resetGridState() {
			$('#search-focus').val("taxa");
			$('#search-grid').css("height", "888px");
	        $('#show-tips').click(showTips);
			$('#search-focus').change(selectSearchFocus);
		}
	} 	/* End startIntro */
	function initSearchTips() { 
		addPopUpStyles();
		$('#base-overlayPopUp').html(searchTips());
		bindEscEvents();
	}
	function showTips() {  //console.log("show tips called.")
		if (!$('#tips-close-bttn').length) { initSearchTips(); }
	    $('#base-overlay, #base-overlayPopUp').fadeIn(500);
        $('#show-tips').html("&nbsp&nbspHide Tips&nbsp&nbsp");
        $('#show-tips').off("click");
        $('#show-tips').click(hideTips);
	}
	function hideTips() {
	    $('#base-overlay').fadeOut(500, removeTips);
        $('#show-tips').html("Search Tips");
        $('#show-tips').off("click");
        $('#show-tips').click(showTips);
	}
	function removeTips() {  //console.log("removeTips called.")
	   	$('#base-overlay, #base-overlayPopUp').css("display", "none");
	}
	function addPopUpStyles() {
		$('#base-overlayPopUp').css({
			"font-size": "1.1em",
			"height": "666px",
			"width": "650px",
			"padding": "2.2em", 
			"text-align": "left",
			"margin": "auto"
		});
		setPopUpPos();
	}
	/**
	 * Finds top position of fixed parent overlay and then sets the popUp  position accordingly.
	 */
	function setPopUpPos() {
		var parentPos = $('#base-overlay').offset();
		$('#base-overlayPopUp').offset(
			{ top: (parentPos.top + 88)});  		//, left: 1000
	}
    function bindEscEvents() {
    	addCloseButton();
        $(document).on('keyup',function(evt) {
            if (evt.keyCode == 27) { hideTips(); }
        });
        $("#base-overlay").click(hideTips);
        $('#show-tips').off("click");
        $('#show-tips').click(hideTips);
        $("#base-overlayPopUp").click(function(e) { e.stopPropagation(); });
    }
    function addCloseButton() {
        $("#base-overlayPopUp").append(`
            <button id="tips-close-bttn" class="tos-bttn">Close</button>`);
        $('#tips-close-bttn').click(hideTips)
    }
   	function searchTips() {
		return `
			<h3>Tips for searching</h3>
            <ul class="disc-list" style="font-size: 1.1em width: 755px margin: auto"> 
                <br><li style="padding-left: 1em"><strong>To search by specific interaction or habitat types</strong> hover on 
                “Interaction Type” header, click on the revealed filter menu, and select which type 
                to include in your search. (<a href="definitions">Click here to see definitions</a> 
                for each interaction and habitat type.)</li>
                <br><li style="padding-left: 1em"><strong>Interested in knowing all the fruit species known from a bat species’ 
                diet?</strong> Search for the bat species, then select only “Fruit” and “Seed” in the filter 
                menu for the Tags column. This will provide you with a list of all plant species known to have their 
                fruit consumed, seeds consumed, and seeds dispersed by that particular bat species.</li>
                <br><li style="padding-left: 1em"><strong>Or all of the flower species known from a bat species’ diet?</strong> 
                Search for the bat species, then only “Flower” in the filter menu for the Tags column. This will provide 
                you with a list of all plant species known to have their flowers visited, consumed, 
                or pollinated by that particular bat species.</li>
                <br><li style="padding-left: 1em"><strong>Interested in knowing all of the bat species known to visit or 
                pollinate a particular plant species?</strong> Select Taxon for "Group interactions by" 
                and then Plant for “Group Taxa by”. You can the optionally narrow to the most specific 
                level you would like: family, genus, species. Next, select only “Flower” in the filter menu for the 
                Tags column. This will provide information on the bats that visited 
                the flower as well as those that have been confirmed pollinating it.</li>
                <br><li style="padding-left: 1em"><b>Follow along with the tutorial for a guided tour 
                of the search functionality.</b></li><br>
            </ul>
            <p style="font-size: 1.1em text-align: justify"> Note: "csv" stands for comma seperated values. The interaction
            data in the grid can be downloaded in this format, as a plain-text file containing tabular 
            data, and can be imported into spreadsheet programs like Excel, Numbers, and Google Sheets.</p>
            `;;

	}
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
		$(selectElem).change(updateTaxaSearch);
		// $(selectElem).click(hideones);
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
			return false; 				      									//console.log("No Local Storage Available"); 
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
		if (localStorage) { 													//console.log("localStorage active.");
			localStorage.setItem(key, val);
		} else { console.log("No Local Storage Available"); }
	}
	function removeFromStorage(key) {
		localStorage.removeItem(key);
	}
	function getRemainingStorageSpace() {
		 var limit = 1024 * 1024 * 5; // 5 MB
		 return limit - unescape(encodeURIComponent(JSON.stringify(localStorage))).length;
	}
	function sizeOfString(string) {
		return string.length;
	}
/*-----------------AJAX ------------------------------------------------------*/
	function sendAjaxQuery(dataPkg, url, successCb) {  							console.log("Sending Ajax data =%O arguments = %O", dataPkg, arguments)
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