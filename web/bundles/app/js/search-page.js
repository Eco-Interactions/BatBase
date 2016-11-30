(function(){  
	/**
     * The search grid is built to display the eco-interaction records organized by
     * a selected "focus": taxa (grouped then by domain: bat, plant, arthropod), 
     * locations, or sources (grouped by either publications or authors). 
     * 
     * focusStorage = obj container for misc data used for each focus of the grid.
	 */
    var intro, columnDefs = [], focusStorage = {}; 
    var allTaxaLvls = ['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'];
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
    resetFocusStorag();
    /**
     * Container for all data needed for a given search focus. Reset on focus change.
     * openRows = The identifier for the row in datagrid to be expanded on grid-load.
     * Other properties stored: rcrdsById (all focus records), curTree (data tree 
     * displayed in grid), selectedOpts (dropdown values to be selected for the current tree)
     */
    function resetFocusStorag() {
        focusStorage = {}; 
        focusStorage.curFocus = localStorage ? localStorage.getItem('curFocus') : false ;  
        focusStorage.openRows = focusStorage.curFocus === "taxa" ? [$('#sel-domain').val()] : [];
    }
	function onDOMContentLoaded () {
		clearLocalStorageCheck();
		addDomEventListeners();
        extendJquery();
		authDependentInit();
	    initSearchState();
	}
	function clearLocalStorageCheck() {
        var prevVisit = localStorage ? localStorage.getItem('prevVisit') || false : false;
        if (localStorage && !localStorage.getItem('eta')){
			localStorage.clear();
			if ( prevVisit ) { populateStorage('prevVisit', true); }
			populateStorage('eta', true);
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
        $('button[name="xpand-1"]').click(expandTreeByOne);
		$('button[name="collapse-1"]').click(collapseTreeByOne);
		$('button[name="reset-grid"]').click(resetDataGrid);
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
/*-------------------- Top "State" Managment Methods -------------------------*/
	function initSearchState() {
		if (focusStorage.curFocus){ $('#search-focus').val(focusStorage.curFocus);
		} else { $('#search-focus').val("taxa"); }
		initNoFiltersStatus();		
        setUpFutureDevUi();
		selectSearchFocus();
	} 
    function setUpFutureDevUi() {
        $('button[name="show-hide-col"]').prop('disabled', true);
        $('button[name="show-hide-col"]').css({'opacity': '.8', 'cursor': 'not-allowed' });
        addFutureDevMsg();
    }
    function addFutureDevMsg() { console.log("addFutureDevMsg")
        var $msgDiv = $('<div/>', { id: 'futrDevMsg' })
        $msgDiv.html("<p><b>This is where the search options available for all views will go. </b>" + 
        "Such as year and elevation range, habitat and interaction type, " +
        " as well as any other criteria that would be helpful to focus the data." +
        "</p><br><p>Below is a 'Show/Hide Columns' button that will allow users to select " +
        "the data that will be shown in the grid and/or csv exported.</p>");
        $msgDiv.appendTo('#opts-col3');
    }
	function selectSearchFocus(e) {  							                console.log("---select(ing)SearchFocus = ", $('#search-focus').val())
	    showPopUpMsg();
	    if ( $('#search-focus').val() == 'srcs' ) { ifChangedFocus("srcs", getSources);  }
	    if ( $('#search-focus').val() == 'locs' ) { ifChangedFocus("locs", getLocations);  }
	    if ( $('#search-focus').val() == 'taxa' ) { ifChangedFocus("taxa", getTaxa);  }
	    showWalkthroughIfFirstVisit();
	}
	/**
	 * Updates and resets the focus 'state' of the search, either 'taxa', 'locs' or 'srcs'.
	 */
	function ifChangedFocus(focus, buildGridFunc) { 							//console.log("ifChangedFocus called.")
        if (focus !== focusStorage.curFocus) {   
            populateStorage("curFocus", focus);
            localStorage.removeItem("curDomain");
            initNoFiltersStatus();
            clearPreviousGrid();
            resetFocusStorag();
            resetToggleTreeBttn(false);
            clearPastHtmlOptions();
        } else { buildGridFunc(); }
        /** Called seperately so @emptySearchOpts is called once. */
        function clearPastHtmlOptions() {    
            $('#opts-col2').fadeTo(100, 0);
            $('#opts-col1').fadeTo(100, 0, emptySearchOpts);
        }
        function emptySearchOpts() {                                            //console.log("emptying search options");
            $('#opts-col2').empty();
            $('#sort-opts').empty();
            $('#opts-col1, #opts-col2').fadeTo(0, 1);
            buildGridFunc();
        }
    } /* End ifChangedFocus */

/*------------------Interaction Search Methods--------------------------------------*/
	/**
	 * If interaction data is already in local storage, the data is sent to 
	 * @fillTreeWithInteractions to begin rebuilding the data grid. Otherwise, an
	 * ajax call gets the data which is stored @storeTaxa before being sent to  
	 * to @fillTreeWithInteractions.  	 
	 */
	function getInteractionsAndFillTree() {  	                                //console.log("getInteractionsAndFillTree called. Tree = %O", focusStorage.curTree);
		var intRcrds = localStorage ? JSON.parse(localStorage.getItem('intRcrds')) : false; 
		fadeGrid();
		if ( intRcrds ) { //console.log("Stored interactions loaded = %O", JSON.parse(intRcrds));
			fillTreeWithInteractions(intRcrds); 
		} else { sendAjaxQuery({}, 'search/interaction', storeInteractions); }
	}
	function storeInteractions(data) {  										//console.log("Interaction success! rcrds = %O", data);
		populateStorage('intRcrds', JSON.stringify(data.intRcrds));  
		fillTreeWithInteractions( data.intRcrds );
	}
	/**
	 * Fills the current tree data with interaction records and calls the= grid 
     * build method for the current focus. Hides popup message and the filter 
     * button on the tree column - as it, by design, only filters on leaf nodes.
	 */
	function fillTreeWithInteractions(intRcrds) {   							//console.log("fillTreeWithInteractionscalled.");
        var focus = focusStorage.curFocus; 
		var curTree = focusStorage.curTree; 
        var fillMethods = { taxa: fillTaxaTree, locs: fillLocTree, srcs: fillSrcTree };
        var gridBuilderMap = { taxa: buildTaxaSearchUiAndGrid, 
            locs: buildLocSearchUiAndGrid, srcs: buildSrcSearchUiAndGrid };    

		// clearPreviousGrid();
		fillMethods[focus](curTree, intRcrds);
		gridBuilderMap[focus](curTree);
	    hidePopUpMsg();
	    hideGroupColFilterMenu();
	} 

    function fillTaxaTree(curTree, intRcrds) {                                  //console.log("fillingTaxaTree")
    	fillTaxaSetWithInteractionRcrds(intRcrds, curTree);  
    	fillHiddenTaxaColumns(curTree, intRcrds);
    }
	/**
	 * Recurses through each taxon's 'children' property and replaces all 
	 * interaction ids with the interaction records.
	 */
	function fillTaxaSetWithInteractionRcrds(intRcrds, curTree) { 	            //console.log("fillTaxaSetWithInteractionRcrds called. taxaTree = %O", curTree) 
		for (var curNode in curTree) {   
			replaceTaxaInteractions(curTree[curNode].interactions, intRcrds);
			if (curTree[curNode].children !== null) { fillTaxaSetWithInteractionRcrds(intRcrds, curTree[curNode].children) }
		}
	}
	function replaceTaxaInteractions(interactionsObj, intRcrds) {   					    //console.log("replaceTaxaInteractions called. interactionsObj = %O", interactionsObj);
		for (var role in interactionsObj) {
			if (interactionsObj[role] !== null) {                               //console.log("interactions found!")
				interactionsObj[role] = replaceInteractions(interactionsObj[role], intRcrds) }
		}
	}
	/**
	 * Recurses through each location's 'children' property and replaces all 
	 * interaction ids with the interaction records.
	 */
	function fillLocTree(treeBranch, intRcrds) { 		                        //console.log("fillLocTree called. taxaTree = %O", treeBranch) 
		for (var curNode in treeBranch) {                                       //console.log("curNode = %O", treeBranch[curNode]);
			if (treeBranch[curNode].interactions !== null) { 
				treeBranch[curNode].interactions = replaceInteractions(treeBranch[curNode].interactions, intRcrds); }
			if (treeBranch[curNode].children) { 
				fillLocTree(treeBranch[curNode].children, intRcrds); }
		}
	}
	/**
	 * Recurses through each source's 'children' property until it finds the citation
	 * source, and fills it's children interaction id's with their interaction records.
	 */
    function fillSrcTree(curTree, intRcrds) { 
    	for (var srcName in curTree) {                                          //console.log("-----processing src %s = %O. children = %O", srcName, curTree[srcName], curTree[srcName].children);
            fillSrcInteractions(curTree[srcName]);
	    }
        /**
         * Recurses through each source's 'children' property until all sources in 
         * curTree have interaction record refs replaced with the records. 
         */
        function fillSrcInteractions(curSrc) {                                  //console.log("fillSrcInteractions. curSrc = %O. parentSrc = %O", curSrc, parentSrc);
           var srcChildren = [];
            if (curSrc.isDirect) { replaceSrcInts(curSrc);}
            curSrc.children.forEach(function(childSrc){
                fillSrcInteractions(childSrc); 
            });
        }
        function replaceSrcInts(curSrc) {
            curSrc.interactions = replaceInteractions(curSrc.interactions, intRcrds); 
        }

    } /* End fillSrcTree */
	function replaceInteractions(interactionsAry, intRcrds) {                   //console.log("replaceInteractions called. interactionsAry = %O", interactionsAry);
		return interactionsAry.map(function(intId){
			if (typeof intId === "number") {	                                //console.log("new record = %O", intRcrds[intId]);
				return intRcrds[intId];	
			}  console.log("####replacing interactions a second time? Ary = %O", interactionsAry);
		});
	}
	/**
	 * Returns an interaction record object with flat data in grid-ready format. 
	 */
	function buildIntRowData(intRcrd, treeLvl){                                 //console.log("intRcrd = %O", intRcrd);
        return {
            isParent: false,
            treeLvl: treeLvl,
            type: "intRcrd", 
			id: intRcrd.id,
            subject: getTaxonName(intRcrd.subject),
            object: getTaxonName(intRcrd.object),
            interactionType: intRcrd.interactionType,
            habitat: intRcrd.habitatType || null,
            citation: intRcrd.source.fullText,
            tags: getTags(intRcrd.tags),
            location: intRcrd.location ? intRcrd.location.name : null,
            country: intRcrd.location ? intRcrd.location.country : null,
            region: intRcrd.location ? intRcrd.location.region : null,
            elev: intRcrd.elevation,
            elevMax: intRcrd.elevationMax,
            lat: intRcrd.latitude,
            long: intRcrd.longitude,
            gps: intRcrd.gpsData,
			note: intRcrd.note, 
        };
	}
	function getTags(tagAry) {
		var tagStrAry = [];
		tagAry.forEach(function(tagStr) { tagStrAry.push(tagStr); });
		return tagStrAry.join(', ');
	}
	function getTaxonName(taxaData) { 											//console.log("taxaData = %O", taxaData)
		return taxaData.level === "Species" ? 
			taxaData.name : taxaData.level + ' ' + taxaData.name;
	}	
/*------------------Taxa Search Methods---------------------------------------*/
    /**
     * If taxa data is already in local storage, the domain and taxa records are 
     * sent to @initTaxaSearchUi to begin building the data grid. Otherwise, an
     * ajax call gets the records and they are stored @storeTaxa before continuing 
     * to @initTaxaSearchUi.  
     */
    function getTaxa() { 
        var rcrdData = {}; 
        rcrdData.domainRcrds = localStorage ? 
            JSON.parse(localStorage.getItem('domainRcrds')) : false; 
        if( rcrdData.domainRcrds ) { //console.log("Stored Taxa Loaded");
            rcrdData.taxaRcrds = JSON.parse(localStorage.getItem('taxaRcrds'));
            initTaxaSearchUi(rcrdData);
        } else { //console.log("Taxa Not Found In Storage.");
            sendAjaxQuery({}, 'search/taxa', storeTaxa);
        }
    }
    function storeTaxa(data) {                                          		//console.log("taxa data recieved. %O", data);
        populateStorage('domainRcrds', JSON.stringify(data.domainRcrds));
        populateStorage('taxaRcrds', JSON.stringify(data.taxaRcrds));
        initTaxaSearchUi(data);
    }
    /**
     * If the taxa search html isn't already built and displayed, calls @buildTaxaDomainHtml
     * If no domain already selected, sets the default domain value for the taxa search grid. 
     * Builds domain tree @initTaxaTree and saves all present levels with data 
     * @storeCurDomainlvls and continues @getInteractionsAndFillTree.  
     */
    function initTaxaSearchUi(data) {
        var domainTaxonRcrd;
        rcrdsById = data.taxaRcrds;
        if (!$("#sel-domain").length) { buildTaxaDomainHtml(data.domainRcrds); }  
        setTaxaDomain();  
        
        domainTaxonRcrd = storeAndReturnDomain();
        initTaxaTree(domainTaxonRcrd);
        storeCurDomainLvls();
        getInteractionsAndFillTree();
    }
    /** Restores stored domain from previous session or sets the default 'Plants'. */
    function setTaxaDomain() {
        var domainVal;
        var storedDomain = localStorage.getItem('curDomain');                   //console.log("storedDomain = ", storedDomain)
        if ($('#sel-domain').val() === null) { 
            domainVal = storedDomain !== null ? storedDomain : "3";  
            $('#sel-domain').val(domainVal);
        }
    }
    /**
     * Saves all present levels with data in the default domain tree in the 
     * global focusStorage obj as 'allDomainLvls'.
     */
    function storeCurDomainLvls() {
        focusStorage["allDomainLvls"] = Object.keys(focusStorage.taxaByLvl);
    }
    /** Event fired when the taxa domain select box has been changed. */
    function onTaxaDomainChange(e) {  
        var domainTaxon = storeAndReturnDomain();
        resetCurTreeState();
        rebuildTaxaTree(domainTaxon, true);
    }
    /**
     * Gets the currently selected taxa domain's id, gets the record for the taxon, 
     * stores both it's id and level in the global focusStorag, and returns 
     * the taxon's record.
     */
    function storeAndReturnDomain() {
        var domainId = $('#sel-domain').val();
        var domainTaxonRcrd = getDetachedRcrd(domainId, rcrdsById);                        //console.log("domainTaxon = %O", domainTaxon)
        var domainLvl = domainTaxonRcrd.level;
        populateStorage('curDomain', domainId);
        focusStorage.curDomain = domainId;
        focusStorage.domainLvl = domainLvl;

        return domainTaxonRcrd;
    }
    /**
     * Rebuilds taxa tree for the passed taxon.
     * NOTE: This is the entry point for taxa grid rebuilds as filters alter data
     * contained in taxa data tree.
     */
    function rebuildTaxaTree(topTaxon, domainTreeInit) {                        //console.log("domainTaxon=%O", domainTaxon)
        var taxonRcrd = topTaxon;
        clearPreviousGrid();
        initTaxaTree(taxonRcrd);
        if (domainTreeInit) { storeCurDomainLvls(); }
        getInteractionsAndFillTree();
    }
    /**
     * Builds a family tree of taxon data with passed taxon as the top of the tree. 
     * To the global focus storage obj, the taxon is added to the 'openRows' array,  
     * the tree is added as 'curTree', and all taxa sorted by level as'taxaByLvl'. 
     */
    function initTaxaTree(topTaxon) {
        buildTaxaTree(topTaxon);                                 
        focusStorage.openRows = [topTaxon.id.toString()];                                    //console.log("openRows=", openRows)
    }
    /**
     * Returns a taxonomic family tree with taxa record data of the parent domain 
     * taxon and all children and stores it as 'curTree' in the global focusStorage obj. 
     * Seperates taxa in current tree by level and stores in focusStorage as 'taxaByLvl'.
     */
    function buildTaxaTree(topTaxon) {                                          //console.log("buildTaxaTree called for topTaxon = %O", topTaxon);
        var tree = {};                                                          //console.log("tree = %O", tree);
        tree[topTaxon.displayName] = topTaxon;  
        topTaxon.children = getChildTaxa(topTaxon.children);    

        focusStorage.curTree = tree;  
        focusStorage.taxaByLvl = seperateTaxaTreeByLvl(tree, topTaxon.displayName);                 //console.log("taxaByLvl = %O", focusStorage.taxaByLvl)
        /**
         * Recurses through each taxon's 'children' property and returns a record 
         * for each child ID found. 
         */
        function getChildTaxa(children) {                                       //console.log("get Child Taxa called. children = %O", children);
            if (children === null) { return null; }
            return children.map(function(child){
                if (typeof child === "object") { return child; }

                var childRcrd = getDetachedRcrd(child, rcrdsById);                         //console.log("child = %O", child);
                if (childRcrd.children.length >= 1) { 
                    childRcrd.children = getChildTaxa(childRcrd.children);
                } else { childRcrd.children = null; }

                return childRcrd;
            });
        }
    } /* End buildTaxaTree */
    /**
     * Returns an object with taxa records keyed by their display name and organized 
     * under their respective levels.
     */
    function seperateTaxaTreeByLvl(taxaTree, topTaxon) {
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
    } /* End seperateTaxaTreeByLvl */
    /**
     * Builds the options html for each level in the tree's select dropdown @buildTaxaSelectOpts
     * Creates and appends the dropdowns @loadLevelSelectElems; @transformTaxaDataAndLoadGrid 
     * to transform tree data into grid format and load the data grid.
     */
    function buildTaxaSearchUiAndGrid(taxaTree) {                   	        //console.log("taxaByLvl = %O", focusStorage.taxaByLvl);
        var curTaxaByLvl = focusStorage.taxaByLvl;                              //console.log("curTaxaByLvl = %O", curTaxaByLvl);
        var lvlOptsObj = buildTaxaSelectOpts(curTaxaByLvl);
        var levels = Object.keys(lvlOptsObj);
        if (levels.indexOf(focusStorage.domainLvl) !== -1) { levels.shift(); } //Removes domain level

        loadLevelSelectElems(lvlOptsObj, levels);
        transformTaxaDataAndLoadGrid(taxaTree);
    } 
    /*------------------ Build Taxa Search Ui --------------------------------*/
    /**
     * Builds the select box for the taxa domains that will become the data tree 
     * nodes displayed in the grid.
     */
    function buildTaxaDomainHtml(data) {                                        //console.log("buildTaxaDomainHtml called. ");
        var browseElems = createElem('span', { id:"sort-taxa-by", text: "Group Taxa by: " });
        var domainOpts = getDomainOpts(data);   //console.log("domainOpts = %O", domainOpts);
        $(browseElems).append(buildSelectElem( domainOpts, { class: 'opts-box', id: 'sel-domain' }));

        $('#sort-opts').append(browseElems);
        $('#sel-domain').change(onTaxaDomainChange);
        $('#sort-opts').fadeTo(0, 1);

        function getDomainOpts(data) {
            var optsAry = [];
            for (var taxonId in data) {                                         //console.log("taxon = %O", data[taxonId]);
                optsAry.push({ value: taxonId, text: data[taxonId].name });
            }
            return optsAry;
        }
    } /* End buildTaxaDomainHtml */
    /**
     * Builds select option objs for each level with data in the current taxa domain.
     * If there is no data after filtering at a level, a 'none' option obj is built
     * and that value added to the global focusStorage.selectedVals obj.
     */
    function buildTaxaSelectOpts(rcrdsByLvl) {                                  //console.log("buildTaxaSelectOpts rcrds = %O", rcrdsByLvl);
        var optsObj = {};
        var curDomainLvls = focusStorage.allDomainLvls.slice(1);                //console.log("curDomainLvls = %O", curDomainLvls) //Skips domain lvl 
        curDomainLvls.forEach(function(lvl) {
            if (lvl in rcrdsByLvl) { getLvlOptsObjs(rcrdsByLvl[lvl], lvl);
            } else { fillInLvlOpts(lvl); }
        });
        return optsObj;

        function getLvlOptsObjs(rcrds, lvl) {
            var taxaNames = Object.keys(rcrdsByLvl[lvl]).sort();                //console.log("taxaNames = %O", taxaNames);
            optsObj[lvl] = buildTaxaOptions(taxaNames, rcrdsByLvl[lvl]);
            if (taxaNames.length > 0 && taxaNames[0] !== "None") {
                optsObj[lvl].unshift({value: 'all', text: '- All -'});
            }
        }
        function fillInLvlOpts(lvl) {                                           //console.log("fillInEmptyAncestorLvls. lvl = ", lvl);
            var taxon;
            if (lvl in focusStorage.selectedVals) {
                taxon = getDetachedRcrd(focusStorage.selectedVals[lvl], rcrdsById);
                optsObj[lvl] = [{value: taxon.id, text: taxon.displayName}];    
            } else {
                optsObj[lvl] = [{value: 'none', text: '- None -'}];
                focusStorage.selectedVals[lvl] = "none";
            }
        }
    } /* End buildTaxaSelectOpts */
    function buildTaxaOptions(taxaNames, taxaRcrds) {
        return taxaNames.map(function(taxaKey){
            return {
                value: taxaRcrds[taxaKey].id,
                text: taxaKey
            };
        });
    }
    function loadLevelSelectElems(levelOptsObj, levels) {             console.log("loadLevelSelectElems. lvlObj = %O", levelOptsObj)
        var elems = buildTaxaSelects(levelOptsObj, levels);
        clearCol2();        
        $('#opts-col2').append(elems);
        setSelectedTaxaVals(focusStorage.selectedVals);
    }
    function buildTaxaSelects(lvlOpts, levels) {  
        var selElems = [];
        levels.forEach(function(level) {
            var labelElem = createElem('label', { class: "lbl-sel-opts flex-row" });
            var spanElem = createElem('span', { text: level + ': ', class: "opts-span" });
            var selectElem = buildSelectElem(
                lvlOpts[level], { class: "opts-box", id: 'sel' + level }, updateTaxaSearch);
            $(labelElem).append([spanElem, selectElem]);
            selElems.push(labelElem);
        });
        return selElems;
    }
    function setSelectedTaxaVals(selected) {                                    //console.log("selected in setSelectedTaxaVals = %O", selected);
        if (selected === undefined) {return;}
        focusStorage.allDomainLvls.forEach(function(lvl) {                      //console.log("lvl ", lvl)
            var selId = '#sel' + lvl;
            $(selId).find('option[value="all"]').hide();
            if (selected[lvl]) {                                                //console.log("selecting = ", lvl, selected[lvl])
                $(selId).val(selected[lvl]); 
                $(selId).find('option[value="none"]').hide();
            }
        });
    }
    /*-------- Taxa Data Formatting ------------------------------------------*/
    /**
     * Transforms the tree's taxa record data into the grid format and sets the 
     * row data in the global focusStorage object as 'rowData'. Calls @loadGrid.
     */
    function transformTaxaDataAndLoadGrid(taxaTree) {                           //console.log("transformTaxaDataAndLoadGrid called. taxaTree = %O", taxaTree)
        var finalRowData = [];
        for (var topTaxon in taxaTree) {
            finalRowData.push( getTaxonRowData(taxaTree[topTaxon], 0) );
        }
        focusStorage.rowData = finalRowData;                                    //console.log("rowData = %O", rowData);
        loadGrid("Taxa Tree");
    }
    /**
     * Recurses through each taxon's 'children' property and returns a row data obj 
     * for each taxon in the tree.
     */
    function getTaxonRowData(taxon, treeLvl) {                                           //console.log("taxonRowData. taxon = %O. rcrdsById = %O", taxon, rcrdsById)
        var taxonName = taxon.level === "Species" ? 
            taxon.displayName : taxon.level + " " + taxon.displayName;
        var intCount = getIntCount(taxon); 
        return {
            id: taxon.id,
            name: taxonName,
            isParent: true,                     //taxon.interactions !== null || taxon.children !== null was the test, but I'm pretty sure this is always true with taxa
            parentTaxon: taxon.parentTaxon,
            open: focusStorage.openRows.indexOf(taxon.id.toString()) !== -1, 
            children: getTaxonChildRowData(taxon, treeLvl),
            treeLvl: treeLvl,
            interactions: intCount !== null,          
            intCnt: intCount,   
        }; 
    } /* End getTaxonRowData */
    /**
     * Checks whether this taxon has interactions in either the subject or object
     * roles. Returns the interaction count if any records are found, null otherwise. 
     * NOTE: Only counting one role with interactions currently.
     */
    function getIntCount(taxon) {
        var intsFound = false;
        var intCnt = null;
        for ( var role in taxon.interactions ) {
            if (intsFound) {continue}  /* Only counting one role with interactions. */
            intsFound = taxon.interactions[role] === null ? false : taxon.interactions[role].length > 0;    
            if (intsFound) { intCnt = taxon.interactions[role].length; }    
        }
        return intCnt;
    } 
    /**
     * Returns both interactions for the curTaxon and rowData for any children.
     * If there are children, the interactions for the curTaxon are grouped as 
     * the first child row under "Unspecified [taxonName] Interactions", otherwise
     * any interactions are added as rows directly beneath the taxon.
     */
    function getTaxonChildRowData(curTaxon, curTreeLvl) { 
        var childRows = [];

        if (curTaxon.children !== null && curTaxon.children.length > 0) {
            getUnspecifiedInts(curTreeLvl);
            curTaxon.children.forEach(function(childTaxon){
                childRows.push( getTaxonRowData(childTaxon, curTreeLvl + 1));
            });
        } else { childRows = getTaxonIntRows(curTaxon, curTreeLvl); }

        return childRows;

        function getUnspecifiedInts(curTreeLvl) {
            var domainMap = { '2': 'Bat', '3': 'Plant', '4': 'Arthropod' };  
            var name = curTaxon.id in domainMap ?  
                domainMap[curTaxon.id] : curTaxon.displayName;
            getUnspecifiedTaxonInts(name, curTreeLvl);
        }
        /**
         * Groups interactions attributed directly to a taxon with child-taxa
         * and adds them as it's first child row. 
         * Note: Domain interactions are built closed, otherwise they would be expanded
         * by default
         */
        function getUnspecifiedTaxonInts(taxonName, treeLvl) { 
            var domainIds = ["2", "3", "4"];  
            if (getIntCount(curTaxon) !== null) { 
                childRows.push({
                    id: curTaxon.id,
                    name: 'Unspecified ' + taxonName + ' Interactions',
                    isParent: true,
                    open: domainIds.indexOf(curTaxon.id) === -1 ? false : 
                        focusStorage.openRows.indexOf(curTaxon.id.toString()) !== -1,
                    children: getTaxonIntRows(curTaxon, treeLvl),
                    treeLvl: treeLvl,
                    interactions: true,
                    groupedInts: true
                });
            }
        }
    } /* End getTaxonChildRowData */
    function getTaxonIntRows(taxon, treeLvl) {                                      //console.log("getTaxonInteractions for = %O", taxon);
        var ints = [];
        for (var role in taxon.interactions) {
            if ( taxon.interactions[role] !== null && taxon.interactions[role].length >= 1 ) {
                taxon.interactions[role].forEach(function(intRcrd){
                    ints.push( buildIntRowData(intRcrd, treeLvl));
                });
            }
        }
        return ints;
    }
/*------------------Location Search Methods-----------------------------------*/
	/**
	 * If location data is already in local storage, the records and top regions are 
	 * sent to @buildLocTree to begin building the data tree and grid. Otherwise, an
	 * ajax call gets the records and they are stored @storeLocs before continuing 
	 * to @buildLocTree.  
	 */
	function getLocations() {
		var data = {};
		data.locRcrds = localStorage ? JSON.parse(localStorage.getItem('locRcrds')) : false; 
		if( data.locRcrds ) {  
			rcrdsById = data.locRcrds;
			data.topRegions = JSON.parse(localStorage.getItem('topRegions'));   //console.log("Stored Locations Loaded = %O", data);
			buildLocTreeAndGrid(data.topRegions);
		} else { //console.log("Locations Not Found In Storage.");
			sendAjaxQuery({}, 'search/location', storeLocs);
		}
	}
    /**
     * Stores location records and the topmost-region location ids. @buildLocTree 
     * Builds a tree of location data with regions at the top level, and sub-regions,
     * countries, areas, and points as nested children.
     */
	function storeLocs(data) {													console.log("location data recieved. %O", data);
		populateStorage('locRcrds', JSON.stringify(data.locRcrds));
		populateStorage('topRegions', JSON.stringify(data.topRegions));
		rcrdsById = data.locRcrds;   
		buildLocTreeAndGrid(data.topRegions);
	}
    function buildLocTreeAndGrid(topLocs) {
        buildLocTree(topLocs);
        getInteractionsAndFillTree();
    }
    /**
     * Rebuilds loc tree with passed location, or the default top regions, as the
     * top nodes of the new tree with all sub-locations nested beneath @buildLocTree.
     * Resets 'openRows' and clears grid. Continues @buildLocTreeAndGrid.
     */
    function rebuildLocTree(topLoc) {                                           //console.log("-------rebuilding loc tree. topLoc = %O", topLoc);
        var topLocs = topLoc || JSON.parse(localStorage.getItem('topRegions'));
        focusStorage.openRows = topLocs.length === 1 ? topLocs[0] : [];
        clearPreviousGrid();
        buildLocTreeAndGrid(topLocs);
    }
	/**
	 * Builds a tree of location data with passed locations at the top level, and 
     * sub-locations as nested children. Alphabetizes the tree @sortLocTree and 
	 * adds tree to the global focusStorage obj as 'curTree'. 
	 */	
	function buildLocTree(topLocIds) {                                          //console.log("passed 'top' locIds = %O", topLocIds)
		var topLoc;
		var locTree = {};                                                       //console.log("tree = %O", locTree);

        topLocIds.forEach(function(topLocId){  
            topLoc = getDetachedRcrd(topLocId, rcrdsById);                                 //console.log("--topLoc = %O", topLoc);
            locTree[topLoc.displayName] = topLoc;   
            topLoc.children = fillChildLocRcrds(topLoc.childLocs);
        });  
        focusStorage.curTree = sortLocTree(locTree);
	}
	function fillChildLocRcrds(childLocIds) {
		var locRcrd;
		var branch = [];
		childLocIds.forEach(function(locId){
			if (typeof locId === "number") {
				locRcrd = getDetachedRcrd(locId, rcrdsById);   
				branch.push(locRcrd);
				if (locRcrd.childLocs.length >= 1) { 
					locRcrd.children = fillChildLocRcrds(locRcrd.childLocs);
                }
			} else { console.log("~~~child location [object]~~~"); return locId; }
		});
		return branch;
	}
	/** Sorts the location tree alphabetically. */
	function sortLocTree(tree) {
		var keys = Object.keys(tree).sort();    
		var sortedTree = {};
		for (var i=0; i<keys.length; i++){ 
			sortedTree[keys[i]] = sortChildLocs(tree[keys[i]]);
		}
		return sortedTree;
	
		function sortChildLocs(loc) { 
			if (loc.children) {  
				loc.children = loc.children.sort(alphaLocNames);
				loc.children.forEach(sortChildLocs);
			}
			return loc;
		} 
	} /* End sortLocTree */
	/** Alphabetizes array via sort method. */
	function alphaLocNames(a, b) { 
		var x = a.displayName.toLowerCase();
	    var y = b.displayName.toLowerCase();
	    return x<y ? -1 : x>y ? 1 : 0;
	}
	/**
     * Builds the options html for each level in the tree's select dropdown @buildTaxaSelectOpts
	 * Creates and appends the dropdowns @loadLevelSelectElems; @transformTaxaDataAndLoadGrid 
	 * to transform tree data into grid format and load the data grid.
	 * NOTE: This is the entry point for taxa grid rebuilds as filters alter data
	 * contained in taxa data tree.
	 */
	function buildLocSearchUiAndGrid(locTree) {                                 //console.log("buildLocSearchUiAndGrid called. locTree = %O", locTree)
        loadLocSearchHtml(locTree);
		transformLocDataAndLoadGrid(locTree);
	}
    /**
     * Builds the options html for each level in the tree's select dropdown @buildTaxaSelectOpts
     */
    function loadLocSearchHtml(curTree) {  
        var locOptsObj = buildLocSelectOpts(curTree);
        var elems = buildLocSelects(locOptsObj);
        clearCol2();        
        selectNoneVals(locOptsObj);
        $('#opts-col2').append(elems);
        setSelectedLocVals();
    }
    /** Builds arrays of options objects for the dropdown html select elements */
    function buildLocSelectOpts(curTree) {  
        var proessedOpts = { region: [], country: [] };
        var optsObj = { region: [], country: [] }; 
        for (var topNode in curTree) { buildLocOptsForNode(curTree[topNode]); }
        sortLocOpts();
        addAllAndNoneOpts();
        return optsObj; 
        /**
         * Recurses through the current tree locs' 'children' and builds loc options
         * for unique regions and countries found. Skips interaction records, which 
         * are identified by their "note" property.
         */
        function buildLocOptsForNode(locNode) {  
            if (locNode.hasOwnProperty("note")) {return;}                       //console.log("buildLocOptsForNode %s = %O", locNode.displayName, locNode)
            var locType = locNode.locationType;  
            if (locType === "Region") { getRegionOpts(locNode) } 
            if (locType === "Country") { getCountryOpts(locNode) }
            if (locNode.children) { locNode.children.forEach(buildLocOptsForNode); }
        }
        function getRegionOpts(locNode) {  //val: id, txt: name
            var isTopRegion = locNode.parentLoc === null;
            var optName = isTopRegion ? locNode.displayName : '->' + locNode.displayName;
            if (proessedOpts.region.indexOf(locNode.displayName) === -1) {  //console.log("getRegionOpts adding hab = %s from %O", locNode.habitatType.name,  locNode);
                optsObj.region.push({ value: locNode.id, text: optName });
                proessedOpts.region.push(locNode.displayName);
            }
        }
        function getCountryOpts(locNode) {
            if (proessedOpts.country.indexOf(locNode.displayName) === -1) {  //console.log("getCountryOpts adding hab = %s from %O", locNode.habitatType.name,  locNode);
                optsObj.country.push({ value: locNode.id, text: locNode.displayName });
                proessedOpts.country.push(locNode.displayName);
            }
        }
        /** Sorts countries alphabetically. Regions were sorted earlier. */
        function sortLocOpts() { 
            optsObj["country"] = optsObj["country"].sort(alphaLocObjs);
        }
        /** If select options array is empty, add 'none' option, else add 'all'.  */
        function addAllAndNoneOpts() {
            for (var selName in optsObj) {                                      //console.log("addAllAndNoneOpts for %s = %O", selName, optsObj[selName])
                var option = optsObj[selName].length === 0 ?
                    {value: 'none', text: '- None -'} : {value: 'all', text: '- All -'};   
                optsObj[selName].unshift(option);
            }
        }
    } /* End buildLocSelectOpts */
    /** Alphabetizes array via sort method. */
    function alphaLocObjs(a, b) { 
        var x = a.text.toLowerCase();
        var y = b.text.toLowerCase();
        return x<y ? -1 : x>y ? 1 : 0;
    }
    /** Builds the dropdown html elements */
    function buildLocSelects(locOptsObj) {  
        var selElems = [];
        for (var locSelName in locOptsObj) {
            var selName = ucfirst(locSelName);
            var labelElem = createElem('label', { class: "lbl-sel-opts flex-row" });
            var spanElem = createElem('span', { text: selName + ': ', class: "opts-span" });
            var selectElem = buildSelectElem(
                locOptsObj[locSelName], { class: "opts-box", id: 'sel' + selName }, updateLocSearch);
            $(labelElem).append([spanElem, selectElem]);
            selElems.push(labelElem);
        }
        return selElems;
    }
    function selectNoneVals(locOptsObj) {
        var sel = focusStorage.selectedOpts;
        for (var selType in locOptsObj) {
            if (locOptsObj[selType][0].value === 'none') { sel[selType] = 'none'; }
        }          
    }
    function setSelectedLocVals() {                                             //console.log("openRows = %O", focusStorage.openRows);           
        var selId;
        var selected = focusStorage.selectedOpts;                               //console.log("selected in setSelectedLocVals = %O", selected);
        if (!selected) {return}
        Object.keys(selected).forEach(function(selName) {
            selId = '#sel' + ucfirst(selName);
            $(selId).val(selected[selName]); 
            $(selId).find('option[value="all"]').hide();
            $(selId).find('option[value="none"]').hide();
        });
    }
/*---------Loc Data Formatting------------------------------------------------*/
	/**
	 * Transforms the tree's location data into the grid format and sets the row 
     * data in the global focusStorage object as 'rowData'. Calls @loadGrid.
	 */
	function transformLocDataAndLoadGrid(locTree) {
		var finalRowData = [];  //console.log("locTree = %O", locTree);

		for (var topNode in locTree) { //console.log("topNode = ", topNode)
			finalRowData.push( getLocRowData(locTree[topNode], 0)); 
		}
		focusStorage.rowData = finalRowData;													//console.log("rowData = %O", rowData);
		loadGrid("Location Tree");
	}
	/**
	 * Returns a row data object for the passed location and it's children. 
	 */
	function getLocRowData(locRcrd, treeLvl) { //console.log("--getLocRowData called for %s = %O", locRcrd.displayName, locRcrd);
		return {
            id: locRcrd.id,
			name: locRcrd.displayName,	/* Interaction rows have no name to display. */
			isParent: locRcrd.interactionType === undefined,  /* Only interaction records return false. */
            open: focusStorage.openRows.indexOf(locRcrd.id) !== -1, 
            children: getLocRowDataForRowChildren(locRcrd, treeLvl),
		    treeLvl: treeLvl,
            interactions: locRcrd.interactions !== null,     /* Location objects have collections of interactions as children. */     
            locGroupedInts: locRcrd.children && locRcrd.interactions !== null
        };		
	}
    /**
     * Returns rowData for both interactions for the current location and for any children.
     * If there are children, the interactions for the current location are grouped as 
     * the first child row under "Unspecified [locName] Interactions", otherwise
     * any interactions are added as rows directly beneath the taxon.
     */
	function getLocRowDataForRowChildren(locRcrd, pTreeLvl) {   //console.log("getLocRowDataForChildren called. locRcrd = %O", locRcrd)
		var childRows = [];
    
        if (locRcrd.children) {
            getUnspecifiedLocInts(locRcrd.interactions, pTreeLvl);
            locRcrd.children.forEach(function(childLoc){
                childRows.push( getLocRowData(childLoc, pTreeLvl + 1));
            });
        } else { childRows = getLocIntRows(locRcrd.interactions, pTreeLvl); }

		return childRows;
        /**
         * Groups interactions attributed directly to a location with child-locations
         * and adds them as it's first child row. 
         */
        function getUnspecifiedLocInts(intsAry, treeLvl) {   
            var locName = locRcrd.displayName === "Unspecified" ? 
                "Location" : locRcrd.displayName;
            if (intsAry !== null) { 
                childRows.push({
                    id: locRcrd.id,
                    name: 'Unspecified ' + locName + ' Interactions',
                    isParent: true,
                    open: false,
                    children: getLocIntRows(intsAry, treeLvl),
                    interactions: true,
                    treeLvl: treeLvl,
                    groupedInts: true
                });
            }
        }
    } /* End getLocRowDataForChildren */
	/**
	 * Returns an array of interaction record objs. On the init pass for a new data
	 * set, interactions in array are only their id. Once the interaction records have 
	 * been filled in, interaction data objects are created and returned for each taxon.
	 */
	function getLocIntRows(intRcrdAry, treeLvl) {
		if (intRcrdAry) {
			return intRcrdAry.map(function(intRcrd){                            //console.log("intRcrd = %O", intRcrd);
				return buildIntRowData(intRcrd, treeLvl);
			});
		}
		return [];
	}
/*------------------Source Search Methods-----------------------------------*/
    /**
     * If source data is already in local storage, the author and publication records 
     * are sent to @initSrcSearchUi to begin building the data grid. Otherwise, an
     * ajax call gets the records and they are stored @seperateAndStoreSrcs before continuing 
     * to @initSrcSearchUi.  
     */
   	function getSources() {
		var sortedSrcs = {};
		var srcRcrdsById = localStorage ? JSON.parse(localStorage.getItem('srcRcrds')) : false; 
		if( srcRcrdsById ) {  //console.log("Stored Source data Loaded");
			sortedSrcs.author = JSON.parse(localStorage.getItem('authRcrds'));
			sortedSrcs.publication = JSON.parse(localStorage.getItem('pubRcrds'));
			initSrcSearchUi(sortedSrcs, srcRcrdsById);
            // seperateAndStoreSrcs({srcRcrds: srcRcrdsById, pubTypes: JSON.parse(localStorage.getItem('pubTypes')) }); 
		} else { //console.log("Sources Not Found In Storage.");
			sendAjaxQuery({}, 'search/source', seperateAndStoreSrcs);
		}
	}
	function seperateAndStoreSrcs(data) {						                console.log("source data recieved. %O", data);
		var preppedData = sortAuthAndPubRcrds(data.srcRcrds); 					console.log("preppedData = %O", preppedData);
        populateStorage('srcRcrds', JSON.stringify(data.srcRcrds));
		populateStorage('pubTypes', JSON.stringify(data.pubTypes));
		populateStorage('authRcrds', JSON.stringify(preppedData.author));
		populateStorage('pubRcrds', JSON.stringify(preppedData.publication));
		initSrcSearchUi(preppedData, data.srcRcrds);
	}
    /**
     * Sources have two types of 'tree' data: Authors -> Interactions, and
     * Publications->Citations->Interactions. Publications are collected by first 
     * identifiying Citations and getting their direct publication parent to reduce redundant tree data.
     */
    function sortAuthAndPubRcrds(srcRcrds) {                                    console.log("srcRcrds = %O", srcRcrds);
        var type, parentPub;
        var sortedSrcs = { author: {}, publication: {} };
        
        for (var key in srcRcrds) {
            type = Object.keys(srcRcrds[key].sourceType)[0];  
            if (type === "author" || type === "publication") {
                sortedSrcs[type][srcRcrds[key].displayName] = srcRcrds[key];
            } 
        }
        return sortedSrcs; 
    } /* End sortAuthAndPubRcrds */
	/**
	 * All source records are stored in 'rcrdsById'. Builds the source domain select 
	 * box @buildSrcDomainHtml and sets the default domain. Builds the selected domain's
	 * source tree @initSrcTree. Continues building grid @buildSrcSearchUiAndGrid. 
	 */
    function initSrcSearchUi(sortedSrcDomains, srcRcrdsById) {		            //console.log("init search ui");
        var domainRcrds;
        rcrdsById = srcRcrdsById;
        if (!$("#sel-domain").length) { buildSrcDomainHtml(sortedSrcDomains); }  
        setSrcDomain();  
        domainRcrds = storeAndReturnCurDomainRcrds();
        initSrcTree(domainRcrds);
        getInteractionsAndFillTree();
    }
    /** Restores stored domain from previous session or sets the default 'Publications'. */
    function setSrcDomain() {
        var srcDomainVal;
        var storedDomain = localStorage.getItem('curDomain');                   //console.log("storedDomain = ", storedDomain)
        if ($('#sel-domain').val() === null) { 
            srcDomainVal = storedDomain !== null ? storedDomain : "pubs";  
            $('#sel-domain').val(srcDomainVal);
        }
    }
    /**
     * Builds the select box for the source domain types that will become the data
     * tree nodes displayed in the grid. 
     */
    function buildSrcDomainHtml(data) {                                        	//console.log("buildTaxaDomainHtml called. ");
        var browseElems = createElem('span', { id:"sort-srcs-by", text: "Source Type: " });
        var domainOpts = getDomainOpts(data);   								//console.log("domainOpts = %O", domainOpts);
        $(browseElems).append(buildSelectElem(domainOpts, { class: 'opts-box', id: 'sel-domain' }));

        $('#sort-opts').append(browseElems);
        $('#sel-domain').change(onSrcDomainChange);
        $('#sort-opts').fadeTo(0, 1);

        function getDomainOpts(data) {
            var sourceDomains = Object.keys(data);
            var srcTypeMap = { "author": "auths", "publication": "pubs" };
            var opts = sourceDomains.map(function(srcType){
            	return { value: srcTypeMap[srcType], text: ucfirst(srcType) + 's' };
            });
            return opts;
        }
    } /* End buildSrcDomainHtml */
    /** Event fired when the source domain select box has been changed. */
    function onSrcDomainChange(e) {  
        clearPreviousGrid();
        resetCurTreeState();
        resetToggleTreeBttn(false);
        rebuildSrcTree();
    }
    /** Rebuilds source tree for the selected source domain. */
    function rebuildSrcTree() {
        var domainRcrds = storeAndReturnCurDomainRcrds();                       //console.log("---Search Change. domainRcrds = %O", domainRcrds);
        initSrcTree(domainRcrds);
        getInteractionsAndFillTree();
    }
    /** Returns the records for the source domain currently selected. */
    function storeAndReturnCurDomainRcrds() {							//May or may not need this
        var srcTransMap = { "auths": ["author", "authRcrds"], "pubs": ["publication", "pubRcrds"] };
        var domainVal = $('#sel-domain').val();                                 //console.log("domainVal = ", domainVal)                     
        focusStorage.curDomain = domainVal;
        populateStorage('curDomain', domainVal);
        return JSON.parse(localStorage.getItem(srcTransMap[domainVal][1]));
    }
    /**
     * Builds a family tree of source data of the selected source domain: authors 
     * @buildAuthSrcTree and publications @buildPubSrcTree. Adds the tree to 
     * the global focusStorage obj as 'curTree', 
     */
    function initSrcTree(domainRcrds) {                                         //console.log("initSrcTree domainRcrds = %O", domainRcrds);
    	var tree;
        if (focusStorage.curDomain === "pubs") { tree = buildPubSrcTree(domainRcrds);   
        } else { tree = buildAuthSrcTree(domainRcrds); }
        focusStorage.curTree = sortSrcTree(tree);
    }  
    /** Sorts the Source tree nodes alphabetically. */
    function sortSrcTree(tree) {
        var orgKeys = Object.keys(tree); 
        var keys =  focusStorage.curDomain === "pubs" ?
            orgKeys.sort() : orgKeys;    
        var sortedTree = {};
        for (var i=0; i<keys.length; i++){ 
            sortedTree[keys[i]] = sortChildSrcs(tree[keys[i]]);
        }
        return sortedTree;
        /** Alphabetizes child source nodes. Skips interaction records. */
        function sortChildSrcs(src) { 
            if (src.children && src.children.length > 0 && !src.children[0].interactionType) {
                src.children = src.children.sort(alphaSrcNames);
                src.children.forEach(sortChildSrcs);
            }
            return src;
        } 
    } /* End sortSrcTree */
    /**
     * Alphabetizes array via sort method.
     * Display names are buried in the 'sourceType' object because citation display 
     * names are, incorrectly and emporarily, their short-text rather than their title.
     */
    function alphaSrcNames(a, b) {  
        var xName = a.sourceType[Object.keys(a.sourceType)[0]].displayName;
        var yName = b.sourceType[Object.keys(b.sourceType)[0]].displayName;
        var x = xName.toLowerCase();
        var y = yName.toLowerCase();
        return x<y ? -1 : x>y ? 1 : 0;
    }
/*-------------- Publication Source Tree -------------------------------------------*/
    /**
     * Returns a heirarchical tree with Authors as top nodes of the data tree. 
     * Each interaction is attributed directly to a citation source, which currently 
     * always has a 'parent' publication source.
     * Publication Source Tree:
     * ->Publication Title
     * ->->Citation Title
     * ->->->Interactions Records
     */
    function buildPubSrcTree(pubRcrds) {                                        console.log("buildPubSrcTree. Tree = %O", pubRcrds);
    	for (var pubName in pubRcrds) {
    		pubRcrds[pubName] = getPubData(pubRcrds[pubName]);
    	}
    	return pubRcrds;
    }
    function getPubData(pubRcrd) {
    	pubRcrd.children = getPubChildren(pubRcrd);
    	return pubRcrd;
    }
    function getPubChildren(pubRcrd) {
    	if (pubRcrd.childSources === null) { return []; }

    	return pubRcrd.childSources.map(function(srcId) {
    		return getPubData(getDetachedRcrd(srcId, rcrdsById));
    	});
	}
/*-------------- Author Source Tree -------------------------------------------*/
    /**
     * Returns a heirarchical tree with Authors as top nodes of the data tree, 
     * with their contributibuted works and the interactions they contained nested 
     * within. Authors with no contributions are not added to the tree.
     * Author Source Tree:
     * ->Author
     * ->->Citation Title (Publication Title)
     * ->->->Interactions Records
     */
    function buildAuthSrcTree(authSrcRcrds) {                                   //console.log("----buildAuthSrcTree");
        var contribs, author;
    	var authorTreeAry = [];
        for (var authName in authSrcRcrds) {                                    //console.log("rcrd = %O", authSrcRcrds[authName]);
            contribs = authSrcRcrds[authName].sourceType.author.contributions;
            if (contribs.length < 1) {continue;}
            author = getDetachedRcrd(authName, authSrcRcrds);
    		author.children = getAuthChildren(authSrcRcrds[authName].sourceType.author); 
            authorTreeAry.push(author);
    	}  
    	return sortAuthTree(authorTreeAry);  
    }  
    /** For each source work contribution, gets any additional publication children
     * @getPubData and return's the source record.
     */
    function getAuthChildren(authData) { 		                                //console.log("getAuthChildren contribs = %O", authData.contributions);
    	return authData.contributions.map(function(workSrcId){
    		return getPubData(getDetachedRcrd(workSrcId, rcrdsById));
    	});
    }
    function sortAuthTree(authTreeAry) {  
        var tree = {};  
        var sortedAuths = authTreeAry.sort(alphaLastName);                      
        sortedAuths.forEach(function(auth) {
            tree[auth.displayName] = auth;
        });
        return tree;
    }
    /** Alphabetizes array via sort method. */
    function alphaLastName(authA, authB) {
        var x = authA.sourceType.author.lastName.toLowerCase();
        var y = authB.sourceType.author.lastName.toLowerCase();
        return x<y ? -1 : x>y ? 1 : 0;
    }
    /**
     * Will build the select elems for the source search options. Clears previous 
     * grid. Calls @transformSrcDataAndLoadGrid to transform tree data into grid 
     * format and load the data grid.
     * NOTE: This is the entry point for source grid rebuilds as filters alter data
     * contained in the data tree.
     */
    function buildSrcSearchUiAndGrid(srcTree) {                                 console.log("buildSrcSearchUiAndGrid called. tree = %O", srcTree);
        clearPreviousGrid();
        if (focusStorage.curDomain === "pubs") { loadPubSearchHtml(srcTree); 
        } else { loadAuthSearchHtml(srcTree); }
        transformSrcDataAndLoadGrid(srcTree);
    } 
    function loadPubSearchHtml(srcTree) {
        var pubTypeOpts = buildPubSelectOpts();
        var pubSelElem = buildPubSelects(pubTypeOpts);
        clearCol2();        
        $('#opts-col2').append(pubSelElem);
    }
    function buildPubSelectOpts() {
        var pubTypes = JSON.parse(localStorage.getItem('pubTypes'));
        var pubOpts = [{value: 'all', text: '- All -'}];                        //console.log("pubTypes = %O", pubTypes);
        for (var typeId in pubTypes) {
            pubOpts.push({ value: typeId, text: pubTypes[typeId] });
        }
        return pubOpts.sort(alphaPubTypes);
    }
    function alphaPubTypes(a, b) {
        var x = a.text.toLowerCase();
        var y = b.text.toLowerCase();
        return x<y ? -1 : x>y ? 1 : 0;
    }
    /** Builds the publication type dropdown */
    function buildPubSelects(pubTypeOpts) {                                     //console.log("buildPubSelects pubTypeOpts = %O", pubTypeOpts)
        var labelElem = createElem('label', { class: "lbl-sel-opts flex-row" });
        var spanElem = createElem('span', { text: 'Publication Type:', class: 'opts-span'});
        var selectElem = buildSelectElem(
            pubTypeOpts, { class: "opts-box", id: 'selPubTypes' }, updatePubSearch
        );
        $(labelElem).css('width', '255px');
        $(selectElem).css('width', '115px');
        $(labelElem).append([spanElem, selectElem]);
        return labelElem;
    }
    /** Builds a text input for searching author names. */
    function loadAuthSearchHtml(srcTree) {
        var labelElem = createElem('label', { class: "lbl-sel-opts flex-row" });
        var inputElem = createElem('input', { name: 'authNameSrch', type: 'text', placeholder: "Author Name"  });
        var bttn = createElem('button', { text: 'Search', name: 'authSrchBttn', class: "ag-fresh grid-bttn" });
        $(inputElem).onEnter(updateAuthSearch);
        $(bttn).css('margin-left', '5px');
        $(bttn).click(updateAuthSearch);
        $(labelElem).append([inputElem, bttn]);
        clearCol2();        
        $('#opts-col2').append(labelElem);
    }
    /*--------- Source Data Formatting ---------------------------------------*/
    /**
     * Transforms the tree's source record data into the grid format and sets the 
     * row data in the global focusStorage object as 'rowData'. Calls @loadGrid.
     */
    function transformSrcDataAndLoadGrid(srcTree) {                             //console.log("transformSrcDataAndLoadGrid called.")
        var prefix = focusStorage.curDomain === "pubs" ? "Publication" : "Author";
        var treeName = prefix + ' Tree';
        var finalRowData = [];

        for (var topNode in srcTree) {
            finalRowData.push( getSrcRowData(srcTree[topNode], 0) );
        }
        focusStorage.rowData = finalRowData;                                    //console.log("rowData = %O", focusStorage.rowData);
        loadGrid(treeName);
    }
    function getSrcRowData(src, treeLvl) {                                      //console.log("getSrcRowData. source = %O, type = ", src, type);
        return {
            id: src.id,
            name: src.displayName,
            isParent: true,      
            type: getPubType(src),
            parentSource: src.parentSource,
            open: focusStorage.openRows.indexOf(src.id.toString()) !== -1, 
            children: getChildSrcRowData(src, treeLvl),
            treeLvl: treeLvl,
            interactions: src.isDirect,          //Only rows with interaction are colored
        };  
    } 
    /**
     * Recurses through each source's 'children' property and returns a row data obj 
     * for each source node in the tree.
     */
    function getChildSrcRowData(curSrc, treeLvl) {
        if (curSrc.isDirect) { return getIntRowChildren(curSrc, treeLvl); }
        if (curSrc.children === null) { return []; }
        
        return curSrc.children.map(function(childSrc) {                         //console.log("childSrc = %O", childSrc);
            return getSrcRowData(childSrc, treeLvl + 1);
        });
    }
    function getIntRowChildren(curSrc, treeLvl) {
        return curSrc.interactions.map(function(intRcrd) {
            return buildIntRowData(intRcrd, treeLvl);
        });
    }
    function getPubType(srcRcrd) {                                                                                              
        return srcRcrd.sourceType && srcRcrd.sourceType.publication ? 
            srcRcrd.sourceType.publication.type : null;
    }
/*================== Filter Functions ========================================*/
    /*------------------ Taxa Filter Updates ---------------------------------*/
	/**
	 * When a level dropdown is changed, the grid is updated with the selected taxon
	 * as the top of the new tree. If the dropdowns are cleared, the taxa-grid is 
	 * reset to the domain-level taxon. The level drop downs are updated to show 
     * related taxa .
	 */
	function updateTaxaSearch() {                                               //console.log("updateTaxaSearch val = ", $(this).val())
		var selectedTaxaId = $(this).val(); 									//console.log("selectedTaxaId = %O", selectedTaxaId);
		var selTaxonRcrd = getDetachedRcrd(selectedTaxaId, rcrdsById);  
		focusStorage.selectedVals = getRelatedTaxaToSelect(selTaxonRcrd);  		//console.log("selectedVals = %O", focusStorage.selectedVals);

		updateFilterStatus();
        rebuildTaxaTree(selTaxonRcrd);

		function updateFilterStatus() {
			var curLevel = selTaxonRcrd.level;
			var taxonName = selTaxonRcrd.displayName;
			var status = "Filtering on: " + curLevel + " " + taxonName; 
			clearGridStatus();
			setExternalFilterStatus(status);
		}
	} /* End updateTaxaSearch */
	/** Selects ancestors of the selected taxa to set as value of their levels dropdown. */
	function getRelatedTaxaToSelect(selTaxonObj) {                              //console.log("getRelatedTaxaToSelect called for %O", selTaxonObj);
		var topTaxaIds = [1, 2, 3, 4]; //Animalia, chiroptera, plantae, arthropoda 
		var selected = {};                                                      //console.log("selected = %O", selected)
		var lvls = Object.keys(focusStorage.taxaByLvl);
		lvls.shift(); //removes domain, 'group taxa by', level

		selectAncestorTaxa(selTaxonObj);
		return selected;

		function selectAncestorTaxa(taxon) {	                                //console.log("selectedTaxaid = %s, obj = %O", taxon.id, taxon)
			if ( topTaxaIds.indexOf(taxon.id) === -1 ) {
				selected[taxon.level] = taxon.id; 								//console.log("setting lvl = ", taxon.level)
				selectAncestorTaxa(getDetachedRcrd(taxon.parentTaxon, rcrdsById))
			}
		}
	} /* End getRelatedTaxaToSelect */
    /*------------------ Location Filter Updates -----------------------------*/
    /**
     * When a location dropdown is changed, the column for that dropdown is filtered 
     * and the grid is updated with the filtered data tree. Selected values are 
     * derived and stored @getSelectedVals.      
     * */
    function updateLocSearch() {                                                console.log("\n\n\n\n-----updateLocSearch 'this' = ", $(this));
        var selElemId = $(this).attr("id");
        var selVal = $(this).val();
        var selTypeMap = { selCountry: "country", selRegion: "region" };

        focusStorage.selectedOpts = getSelectedVals(selVal, selElemId);
        filterGridOnLocCol(selVal, selTypeMap[selElemId]);
        /** Loops through all selElems and stores user selected values. */
        function getSelectedVals(selVal, selElemId) {
            var val, type;
            var sel = {};
            var selType = selTypeMap[selElemId];
            for (var selElem in selTypeMap) {
                val = $('#' + selElem).val();
                type = selTypeMap[selElem];
                if (val !== 'none' && val !== 'all') { sel[type] = val; }
            }
            return sel;    
        }
    } /* End updateLocSearch */
    /**
     * Uses column filter to rebuild the grid. Rebuilds tree and the location
     * search option dropdowns from the displayed tree data in the grid after filter.
     * Note: There are no records with "Asia" as the region, thus the unique values grid filter
     * is only aware of Asia's sub-regions
     */
    function filterGridOnLocCol(selVal, colName) {                              //console.log("filterGridOnLocCol selected = %s for %s", selVal, colName);
        var filterVal = rcrdsById[selVal].displayName;
        var colModel = filterVal !== "Asia" ? 
            [filterVal] : ["East Asia", "South & Southeast Asia", "West & Central Asia"];
        
        gridOptions.api.getFilterApi(colName).setModel(colModel);
        buildFilteredLocTree(selVal, colName);
        loadLocSearchHtml(focusStorage.curTree);
        gridOptions.api.onGroupExpandedOrCollapsed();
    }
    /**
     * Builds new tree out of displayed rows after filter. If a location type has been 
     * selected, add each parent row displayed to the openRows collection so the 
     * grid is displayed with the selected location already opened.
     */
    function buildFilteredLocTree(selVal, colName) {
        var gridModel = gridOptions.api.getModel();                             //console.log("gridModel = %O", gridModel);
        var tree = {};
        var selNodeOpened = isNaN(selVal);

        gridModel.rowsToDisplay.forEach(function(topNode) {                     //console.log("rowToDisplay = %O", topNode)
            tree[topNode.data.name] = getFilteredChildData(topNode);
        });
        focusStorage.curTree = tree;
        /** [addParentOpenRows description] */
        function addParentOpenRows(node) {
            node.expanded = true;
            node.data.open = true;
            if (node.data.id == selVal) { selNodeOpened = true; }
        }
        /** Recurses through displayed children until finding the leaf interaction records. */
        function getFilteredChildData(treeNode) {                                     //console.log("getHabTreeData. node = %O", treeNode);
            if (treeNode.data.hasOwnProperty("note")) { return treeNode.data; }
            if (!selNodeOpened) { addParentOpenRows(treeNode); }
            var locNode = getDetachedRcrd(treeNode.data.id, rcrdsById); 
            var locNodeChildren = treeNode.childrenAfterFilter;
            if (locNodeChildren) { locNode.children = locNodeChildren.map(getFilteredChildData); }
            return locNode; 
        }
    } /* End buildFilteredLocTree */
    /*------------------ Source Filter Updates -------------------------------*/
    /**
     * When the publication type dropdown is changed, the grid is rebuilt with data 
     * filtered by the selected type. 
     */
    function updatePubSearch() {                                                //console.log("\n-----updatePubSearch");
        var selElemId = $(this).attr("id");
        var selVal = $(this).val();
        var selText = $("#selPubTypes option[value='"+selVal+"']").text();      //console.log("selText = ", selText)
        var newRows = selVal === "all" ?
            focusStorage.rowData : getPubTypeRows(focusStorage.rowData, selVal);
        gridOptions.api.setRowData(newRows);
        updateSrcFilterStatus(selVal, selText+'s');
    } 
    function getPubTypeRows(rowAry, selVal) {                                           
        var rows = [];
        rowAry.forEach(function(row) {  
            if (row.type == selVal) { rows.push(row); }
        });  
        return rows;
    }
    /**
     * When the input author search box is submitted, by either pressing 'enter' or
     * by clicking on the 'search' button, the author tree is rebuilt with only 
     * authors that contain the case insensitive substring.
     */
    function updateAuthSearch() {                                               //console.log("\n-----updateAuthSearch");
        var authNameStr = $('input[name="authNameSrch"]').val().trim().toLowerCase();       
        var newRows = authNameStr === "" ?
            focusStorage.rowData : getAuthRows(focusStorage.rowData, authNameStr);
        gridOptions.api.setRowData(newRows);
        updateSrcFilterStatus(authNameStr, '"' + authNameStr + '"');
    }
    function getAuthRows(rowAry, authNameStr) {
        var rowAuthName;
        var rows = [];
        rowAry.forEach(function(row) {  
            if (row.name.toLowerCase().indexOf(authNameStr) >= 0) {
                rows.push(row);
            }
        });  
        return rows;
    }
    function updateSrcFilterStatus(selVal, selText) {  
        var status = "Filtering on: " + selText;
        clearGridStatus();
        if (selVal === "all" || selVal === "") {
            initNoFiltersStatus();
        } else { setExternalFilterStatus(status); }
    }
/*================ Grid Methods ==============================================*/
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
    	function syncTaxaHeir(taxonName, lvl, parentTaxon) { //console.log("syncTaxaHeir parentTaxon = ", parentTaxon);
    		if (parentTaxon === null || parentTaxon === 1) { fillInAvailableLevels(lvl);
    		} else { clearLowerLvls(rcrdsById[parentTaxon].level) }

    		curTaxaHeirarchy[lvl] = taxonName;
    	}
    	/**
    	 * Inits the taxa-heirarchy object that will be used to track of the current
    	 * parent chain of each taxon being processed. 
    	 */
    	function fillInAvailableLevels(topLvl) { 
    		var topIdx = allTaxaLvls.indexOf(topLvl);
    		for (var i = topIdx; i < allTaxaLvls.length; i++) { 
    			curTaxaHeirarchy[allTaxaLvls[i]] = null;
    		}  
    	}
    	function clearLowerLvls(parentLvl) {
    		var topIdx = allTaxaLvls.indexOf(parentLvl);
    		for (var i = ++topIdx; i < allTaxaLvls.length; i++) { curTaxaHeirarchy[allTaxaLvls[i]] = null; }
    	}
    	function fillInteractionRcrdsWithTaxaTreeData(intObj) {
    		for (var role in intObj) {
    			if (intObj[role] !== null) { intObj[role].forEach(addTaxaTreeFields) }
    		}
    	} 
		function addTaxaTreeFields(intRcrdObj) {
			for (var lvl in curTaxaHeirarchy) { 
                colName = 'tree' + lvl; 
				intRcrdObj[colName] = lvl === 'Species' ? 
					getSpeciesName(curTaxaHeirarchy[lvl]) : curTaxaHeirarchy[lvl];
			}
		}
		function getSpeciesName(speciesName) {
			return speciesName === null ? null : ucfirst(curTaxaHeirarchy['Species'].split(' ')[1]);
		}
    } /* End fillHiddenColumns */
    /**
     * Builds the grid options object and passes everyting into agGrid, which 
     * creates and shows the grid.
     */
	function loadGrid(treeColTitle, gridOpts) {  //console.log("loading grid. rowdata = %s", JSON.stringify(rowData, null, 2));
		var gridDiv = document.querySelector('#search-grid');
        var gridOptObj = gridOpts || gridOptions;
		gridOptObj.rowData = focusStorage.rowData;
		gridOptObj.columnDefs = getColumnDefs(treeColTitle),

	    new agGrid.Grid(gridDiv, gridOptObj);
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
		var domain = focusStorage.curDomain || false;  
		var taxaLvlPrefix = domain ? (domain == 2 ? "Subject" : "Object") : "Tree"; 

		return [{headerName: mainCol, field: "name", width: 264, cellRenderer: 'group', suppressFilter: true,
					cellRendererParams: { innerRenderer: innerCellRenderer, padding: 20 }, 
					cellClass: getCellStyleClass },		//cellClassRules: getCellStyleClass
			    {headerName: taxaLvlPrefix + " Kingdom", field: "treeKingdom", width: 150, hide: true },
			    {headerName: taxaLvlPrefix + " Phylum", field: "treePhylum", width: 150, hide: true },
			    {headerName: taxaLvlPrefix + " Class", field: "treeClass", width: 150, hide: true },
			    {headerName: taxaLvlPrefix + " Order", field: "treeOrder", width: 150, hide: true },
			    {headerName: taxaLvlPrefix + " Family", field: "treeFamily", width: 150, hide: true },
			    {headerName: taxaLvlPrefix + " Genus", field: "treeGenus", width: 150, hide: true },
			    {headerName: taxaLvlPrefix + " Species", field: "treeSpecies", width: 150, hide: true },
			    {headerName: "Count", field: "intCnt", width: 81, headerTooltip: "Interaction Count", volatile: true },
			    {headerName: "Subject Taxon", field: "subject", width: 133, cellRenderer: addToolTipToCells },
			    {headerName: "Object Taxon", field: "object", width: 133, cellRenderer: addToolTipToCells  },
			    {headerName: "Interaction Type", field: "interactionType", width: 146, cellRenderer: addToolTipToCells, filter: UniqueValuesFilter },
			    {headerName: "Habitat", field: "habitat", width: 100, cellRenderer: addToolTipToCells, filter: UniqueValuesFilter },
			    {headerName: "Tags", field: "tags", width: 75, filter: UniqueValuesFilter},
			    {headerName: "Citation", field: "citation", width: 100, cellRenderer: addToolTipToCells},
                {headerName: "Location Description", field: "location", width: 175, cellRenderer: addToolTipToCells },
                {headerName: "Country", field: "country", width: 100, cellRenderer: addToolTipToCells, filter: UniqueValuesFilter },
                {headerName: "Region", field: "region", width: 88, cellRenderer: addToolTipToCells, filter: UniqueValuesFilter },
                {headerName: "Elevation", field: "elev", width: 150, hide: true },
                {headerName: "Elev Max", field: "elevMax", width: 150, hide: true },
                {headerName: "Latitude", field: "lat", width: 150, hide: true },
                {headerName: "Longitude", field: "long", width: 150, hide: true },
                // {headerName: "GPS Data", field: "gps", width: 150, hide: true }, //No data currently in the db
			    {headerName: "Note", field: "note", width: 110, cellRenderer: addToolTipToCells} ];
	}
    /** Adds tooltip to Tree cells */
	function innerCellRenderer(params) { 										//console.log("params in cell renderer = %O", params)
        var name = params.data.name || null;   
        return name === null ? null : '<span title="'+name+'">'+name+'</span>';
	}
    /** Adds tooltip to Interaction row cells */
    function addToolTipToCells(params) {
        var value = params.value || null;
        return value === null ? null : '<span title="'+value+'">'+value+'</span>';
    }
    /*================== Row Styling =========================================*/
	/** Adds a css background-color class to interaction record rows. */
    function getRowStyleClass(params) { 					                    //console.log("getRowStyleClass params = %O... lvl = ", params, params.data.treeLvl);
        if (params.data.name === undefined || params.data.name === null) { 
            return getRowColorClass(params.data.treeLvl);
        } 
    }
    /**
     * Adds a background-color to displayed cells with open child interaction rows, or 
     * displayed cells of grouped interactions rows attributed directly to an expanded 
     * cell - eg, The tree cell for Africa is highlighted once Africa has been expanded,
     * as well as the 'Unspecified Africa Interactions' cell the interaction record
     * rows are still grouped underneath. 
     */
    function getCellStyleClass(params) {                                        //console.log("getCellStyleClass params = %O", params);
        if (params.node.expanded === true && isOpenRowWithChildInts(params) || 
            isNameRowforClosedGroupedInts(params)) {                            //console.log("setting style class")
            return getRowColorClass(params.data.treeLvl);
        } 
    }
    function isOpenRowWithChildInts(params) {
        if (params.data.locGroupedInts) { return hasIntsAfterFilters(params); }
        return params.data.interactions === true && params.data.name !== undefined;
    }
    /**
     * Returns true only if the location row's child interactions are present in 
     * data tree after filtering.
     */
    function hasIntsAfterFilters(params) {
        return params.node.childrenAfterFilter.some(function(childRow) {
            return childRow.data.name.split(" ")[0] === "Unspecified";
        });
    }
    function isNameRowforClosedGroupedInts(params) {  
        return params.data.groupedInts === true;
    }
    /** Returns a color based on the tree level of the row. */
    function getRowColorClass(treeLvl) {
        var rowColorArray = ['purple', 'green', 'blue', 'yellow', 'turquoise', 'orange', 'red'];
        var styleClass = 'row-' + rowColorArray[treeLvl];                       //console.log("styleClass = ", styleClass);
        return styleClass;
    }
    function getNodeChildDetails(rcrd) {                                        //  console.log("rcrd = %O", rcrd)  
        if (rcrd.isParent) {
            return { group: true, expanded: rcrd.open, children: rcrd.children };
        } else { return null; }
    }
 	/*================== Filter Functions ====================================*/
	function onFilterChange() {
		gridOptions.api.onFilterChanged();
	}
	function afterFilterChanged() {} //console.log("afterFilterChange") 
	/** Resets Grid Status' Active Filter display */
	function beforeFilterChange() {  //console.log("beforeFilterChange")
		// clearGridStatus();
        getActiveDefaultGridFilters();    
	} 
	/** Returns an obj with all filter models. */
	function getAllFilterModels() {
		return {
			"Subject Taxon": gridOptions.api.getFilterApi("subject").getModel(),
			"Object Taxon": gridOptions.api.getFilterApi("object").getModel(),
			"Interaction Type": gridOptions.api.getFilterApi("interactionType").getModel(),
			"Tags": gridOptions.api.getFilterApi("tags").getModel(),
			"Habitat": gridOptions.api.getFilterApi("habitat").getModel(),
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
						setExternalFilterStatus(tempStatusTxt + ', ');
					}
					return activeFilters.join(', ') + '.'; }
			}
		}
	}
	function setGridFilterStatus(status) {  //console.log("setGridFilterStatus. status = ", status)
		$('#grid-filter-status').text(status);
	}
	function setExternalFilterStatus(status) {
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
                // that.refreshVirtualRows();
                that.filterChangedCallback();
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
        } else { this.selectEverything(); }
    };
/*=================CSV Methods================================================*/
	/**
	 * Exports a csv of the interaction records displayed in the grid, removing 
	 * tree rows and flattening tree data where possible: currently only taxa.
	 * For taxa csv export: The relevant tree columns are shown and also exported. 
	 */
	function exportCsvData() {
		var fileName = focusStorage.curFocus === "taxa" ? 
			"Bat Eco-Interaction Records by Taxa.csv" : "Bat Eco-Interaction Records by Location.csv";
		var params = {
			onlySelected: true,
			fileName: fileName,
			// customHeader: "This is a custom header.\n\n",
			// customFooter: "This is a custom footer."
		};
		if (focusStorage.curFocus === "taxa") { showOverlayAndTaxaCols(); }
		gridOptions.columnApi.setColumnsVisible(["name", "intCnt"], false)
		selectRowsForExport();
		gridOptions.api.exportDataAsCsv(params);
		returnGridState();
	}
	function returnGridState() {
		// if (focusStorage.curFocus === "taxa") { hideOverlayAndTaxaCols(); }
		gridOptions.columnApi.setColumnsVisible(["name", "intCnt"], true);
		gridOptions.api.deselectAll();
		hidePopUpMsg();
	}
	function showOverlayAndTaxaCols() {
		showPopUpMsg("Exporting...");
		gridOptions.columnApi.setColumnsVisible(getCurTaxaLvlCols(), true)

	}
	function getCurTaxaLvlCols() { //console.log("taxaByLvl = %O", focusStorage.taxaByLvl)
		var lvls = Object.keys(focusStorage.taxaByLvl);
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
	}
/*========================= Walkthrough ======================================*/
	function showWalkthroughIfFirstVisit() {
		var prevVisit = localStorage ? 
            localStorage.getItem('prevVisit') || false : false; 	 //console.log("newVisit = ", newVisit)
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
						element: "#opts-col4", 
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
            $('#search-grid').css("height", "888px");
            $('#show-tips').click(showTips);
            $('#search-focus').change(selectSearchFocus);
			$('#search-focus').val(focusStorage.curFocus);
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
        $('#show-tips').html("Hide Tips");
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
/*================= Utility ==================================================*/
    function clearCol2() {
        $('#opts-col2').empty();
    }
    function getDetachedRcrd(rcrdKey, orgnlRcrds) {
        return JSON.parse(JSON.stringify(orgnlRcrds[rcrdKey]));
    }
    function ucfirst(string) { 
        return string.charAt(0).toUpperCase() + string.slice(1); 
    }
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
    /**
     * Hides the group "tree" column's filter button. Filtering on the group 
     * column only filters the leaf nodes, by design. It is not useful.
     */
    function hideGroupColFilterMenu() {
        $('.ag-header-cell-menu-button.name').hide();
    }
    /*--------------------- Grid Button Methods ------------------------------*/
    function toggleExpandTree() {                                               //console.log("toggleExpandTree")
        var expanded = $('#xpand-tree').data('xpanded');
        if (expanded) { 
            gridOptions.api.collapseAll();
            $('#xpand-tree').html("Expand All");
        } else { 
            gridOptions.api.expandAll();    
            $('#xpand-tree').html("Collapse All");
        }
        $('#xpand-tree').data("xpanded", !expanded);
    }
    /**
     * Resets button based on passed boolean xpanded state. True for fully 
     * expanded and false when collapsed.
     */
    function resetToggleTreeBttn(xpanded) {
        var bttnText = xpanded ? "Collapse All" : "Expand All"; 
        $('#xpand-tree').html(bttnText);
        $('#xpand-tree').data("xpanded", xpanded);
    }
    /** Events fired when clicking the + or - tree buttons.  */
    function expandTreeByOne() {    
        toggleTreeByOneLvl(true);
    }
    function collapseTreeByOne() {
        toggleTreeByOneLvl(false);
    }
    /**
     * Opens/closes one level of the displayed data tree. If there are no closed 
     * rows left after updating, the toggle tree button is updated to 'Collapse All'. 
     */
    function toggleTreeByOneLvl(opening) {
        var gridModel = gridOptions.api.getModel();                             //console.log("gridModel = %O", gridModel);
        var bttXpandedAll = $("#xpand-tree").data('xpanded');
        if (opening && bttXpandedAll === true) {return;}

        gridModel.rowsToDisplay.forEach(function(row) {                         //console.log("rowToDisplay = %O", row)
            if (!opening && !isNextOpenLeafRow(row)) { return; }
            row.expanded = opening;
            row.data.open = opening;
        });
        gridOptions.api.onGroupExpandedOrCollapsed();
        updateToggleTreeButton();
        /**
         * Checks displayed rows against total rows after filters to determine
         * if there are any closed rows remaining. The toggle tree button is updated 
         * if necessary.
         */
        function updateToggleTreeButton() {
            var shownRows = gridModel.rowsToDisplay.length; 
            var allRows = getCurTreeRowCount();
            var closedRows = shownRows < allRows;                               //console.log("%s < %s ? %s... treeBttn = %s ", shownRows, allRows, closedRows, bttXpandedAll);

            if (!closedRows) { resetToggleTreeBttn(true); 
            } else if (bttXpandedAll === true) { resetToggleTreeBttn(false); }
        }
    } /* End toggleTreeByOneLvl */
    function getCurTreeRowCount() {
        var cnt = 0;
        gridOptions.api.forEachNodeAfterFilter(function(node){ cnt += 1; }); 
        return cnt;
    }
    /**
     * If there are no child rows, or if the child rows are closed, this is the open leaf.
     */
    function isNextOpenLeafRow(node) {                                          //console.log("node = %O", node);
        if (node.childrenAfterFilter) {
            if (node.childrenAfterFilter.length > 0) {  //TODO: remove check after fixing location data
                return node.childrenAfterFilter.every(function(childNode){
                    return !childNode.expanded;
                });
            }
        } 
        return true;
    }     
/*-----------------Grid Manipulation------------------------------------------*/
    function clearPreviousGrid() {  console.log("clearing grid");
        if (gridOptions.api) { gridOptions.api.destroy(); }     
    }
    /**
     * Resets grid state to top focus options: Taxa and source are reset at current
     * domain; locations are reset to the top regions.
     */
    function resetDataGrid() {   console.log("---reseting grid---")
        var resetMap = { taxa: onTaxaDomainChange, locs: rebuildLocTree, srcs: onSrcDomainChange };
        var focus = focusStorage.curFocus; 
        resetCurTreeState();
        resetMap[focus](); 
    }
    /** Resets storage props, buttons and filter status. */
    function resetCurTreeState() {
        resetCurTreeStorageProps();
        resetToggleTreeBttn(false);
        getActiveDefaultGridFilters();
        initNoFiltersStatus();
    }
    /** Deltes the props uesd for only the displayed grid in the global focusStorage. */
    function resetCurTreeStorageProps() {
        var props = ['curTree', 'selectedOpts', 'selectedVals'];
        props.forEach(function(prop){ delete focusStorage[prop]; });
    }
    /**
     * When the grid rowModel is updated, the total interaction count for each 
     * tree node, displayed in the "count" column, is updated to count only displayed
     * interactions. Any rows filtered out will not be included in the totals.
     */
    function onModelUpdated() {                                                 //console.log("--displayed rows = %O", gridOptions.api.getModel().rowsToDisplay);
        updateTtlRowIntCount( gridOptions.api.getModel().rootNode );
    }
    /**
     * Sets new interaction totals for each tree node @getChildrenCnt and then 
     * calls the grid's softRefresh method, which refreshes any rows with "volatile"
     * set "true" in the columnDefs - currently only "Count".
     */
    function updateTtlRowIntCount(rootNode) {
        getChildrenCnt(rootNode.childrenAfterFilter);  
        gridOptions.api.softRefreshView();
    }
    function getChildrenCnt(nodeChildren) {  //console.log("nodeChildren =%O", nodeChildren)
        var nodeCnt, ttl = 0;
        nodeChildren.forEach(function(child) {
            nodeCnt = 0;
            nodeCnt += addSubNodeInteractions(child);
            ttl += nodeCnt;
            if (nodeCnt !== 0 && child.data.intCnt !== null) { child.data.intCnt = nodeCnt; }
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
        } else { /* Interaction record row */
            ++cnt;
            child.data.intCnt = null; 
        }
        return cnt;
    }
    /*------------ HTML Functions -------------------------------------------*/
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
    /**
     * Builds a select drop down with the options, attributes and change method 
     * passed. Sets the selected option as the passed 'selected' or the default 'all'.
     */
	function buildSelectElem(options, attrs, changeFunc, selected) {
		var selectElem = createElem('select', attrs); 
		var selected = selected || 'all';
		
		options.forEach(function(opts){
			$(selectElem).append($("<option/>", {
			    value: opts.value,
			    text: opts.text
			}));
		});

		$(selectElem).val(selected);
        $(selectElem).change(changeFunc);
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
 /*------- Style Manipulation ---------------------------------------------*/
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
   /*---------Unique Values Filter Utils--------------------------------------*/
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
    /*--------------------------Jquery Extensions-----------------------------*/
        function extendJquery() {
            addOnEnterEvent();
        }
        function addOnEnterEvent() {
            $.fn.onEnter = function(func) {
                this.bind('keypress', function(e) {
                    if (e.keyCode == 13) func.apply(this, [e]);    
                });               
                return this; 
             };
        }
    /*--------------------------Storage Methods-------------------------------*/
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
    /*-------------AJAX ------------------------------------------------------*/
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
		console.log("Ajax Success! data = %O, textStatus = %s, jqXHR = %O", data, textStatus, jqXHR);
	}
	function ajaxError(jqXHR, textStatus, errorThrown) {
		console.log("ajaxError = %s - jqXHR:%O", errorThrown, jqXHR);
	}
}());