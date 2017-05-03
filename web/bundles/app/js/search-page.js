(function(){  
    /**
     * The search grid is built to display the eco-interaction records organized by
     * a selected "focus": taxa (grouped further by domain: bat, plant, arthropod), 
     * locations, or sources (grouped by either publications or authors). 
     *
     * userRole = Stores the role of the user.
     * cal = Stores the flatpickr calendar instance. 
     * intro = Stores an active tutorial/walk-through instance.
     * columnDefs = Array of column definitions for the grid.
     * focusStorage = obj container for misc data used for each focus of the grid.
     */
    var userRole, intro, cal, columnDefs = [], focusStorage = {}; 
    var eif = ECO_INT_FMWK;
    var _util = eif.util;
    var localStorage = _util.setlocalStorage();
    var gridOptions = getDefaultGridOptions();
    eif.search = {
        initSearchPage: initSearchPage,
        initSearchGrid: resetSearchGrid,
    };

    document.addEventListener('DOMContentLoaded', onDOMContentLoaded); 

    function onDOMContentLoaded () {
        clearLocalStorageCheck();
        showPopUpMsg('Loading...');
        addDomEventListeners();
        authDependentInit();
        initSearchState();
    }
    /** If local storage needs to be cleared, the datakey is updated */ 
    function clearLocalStorageCheck() {
        var dataKey = 'luv urself';
        if (localStorage && !localStorage.getItem(dataKey)) {
            localStorage.clear();
            _util.populateStorage(dataKey, true);
        }
    }
    /**
     * The first time a browser visits the search page, all data is downloaded
     * from the server and stored in LocalStorage. The intro-walkthrough is shown 
     * for the user @showIntroWalkthrough.
     */
    function initSearchPage() {
        showLoadingDataPopUp();
        showIntroWalkthrough();
    }
    /** Updates locally stored data with any modified data since the last page load. */
    function syncStoredData(pgDataUpdatedAt) {
        var dataUpdatedAt = _util.getDataFromStorage('dataUpdatedAt');          //console.log("dataUpdatedAt = %O", dataUpdatedAt);
        eif.syncData.sync(pgDataUpdatedAt);
    }
    /** Shows a loading popup message for the inital data-download wait. */
    function showLoadingDataPopUp() {
        showPopUpMsg("Downloading and caching all interaction records. Please " +
            "allow for a ~25 second download.");   
    }
    function addDomEventListeners() {
        $("#search-focus").change(selectSearchFocus);
        $('button[name="xpand-tree"]').click(toggleExpandTree);
        $('button[name="xpand-1"]').click(expandTreeByOne);
        $('button[name="collapse-1"]').click(collapseTreeByOne);
        $('button[name="reset-grid"]').click(resetDataGrid);
        $("#strt-tut").click(startIntroWalkthrough);
        $("#show-tips").click(showTips);
        $('#shw-chngd').change(toggleUpdatedAtFilterRadios);
        $('#fltr-tdy').change(filterInteractionsByTimeUpdated);
        $('#fltr-cstm').change(filterInteractionsByTimeUpdated);
    }
    function authDependentInit() {
        userRole = $('body').data("user-role");                                 //console.log("----userRole === visitor ", userRole === "visitor")
        if (userRole === "visitor") {
            $('button[name="csv"]').prop('disabled', true);
            $('button[name="csv"]').prop('title', "Register to download.");
            $('button[name="csv"]').css({'opacity': '.8', 'cursor': 'not-allowed' });
        } else { $('button[name="csv"]').click(exportCsvData); }
    }
/*-------------------- Top "State" Managment Methods -------------------------*/
    function initSearchState() {
        resetFocusStorage();
        toggleUpdatedAtFilterRadios();
        selectInitialSearchFocus();
        initNoFiltersStatus();      
        // setUpFutureDevUi();
        selectSearchFocus();
    } 
    /**
     * Container for param data needed for a selected focus. Resets on focus change.
     * - curFocus: Top grid sort - Taxon (taxa), Location (locs), or Source (srcs).
     * - openRows: Array of entity ids whose grid rows will be expanded on grid load.
     * Notable properties stored later: 
     * rcrdsById - all records for the current focus.
     * curDomain - focus' domain-level sort (eg, Taxon domains: Bat, Plant, Arthropod).
     * curTree - data 'tree' object to be displayed in grid.
     * rowData - array of rows displayed in the grid.
     * selectedOpts - search combobox values 'selected' for the current tree.
     */
    function resetFocusStorage() {                                              
        focusStorage = {}; 
        focusStorage.curFocus =  localStorage.getItem('curFocus') || "taxa";  
        focusStorage.openRows = [];                                             //console.log("focusStorage = %O", focusStorage);
    }
    /** Selects either Taxon, Location or Source in the grid-focus dropdown. */
    function selectInitialSearchFocus() {
        $('#search-focus').val(focusStorage.curFocus);
    }
    function setUpFutureDevUi() {
        $('button[name="show-hide-col"]').prop('disabled', true);
        $('button[name="show-hide-col"]').css({'opacity': '.8', 'cursor': 'not-allowed' });
        addFutureDevMsg();
    }
    function addFutureDevMsg() {                                                //console.log("addFutureDevMsg")
        var $msgDiv = $('<div/>', { id: 'futrDevMsg' })
        $msgDiv.html("<p><b>This is where the search options available for all views will go. </b>" + 
            "Such as year and elevation range, habitat and interaction type, " +
            " as well as any other criteria that would be helpful to focus the data." +
            "</p><br><p>Below is a 'Show/Hide Columns' button that will allow users to select " +
            "the data that will be shown in the grid and/or csv exported.</p>");
        $msgDiv.appendTo('#opts-col3');
    }
    /** Grid-rebuild entry point after crud-window close. */
    function resetSearchGrid() {
        resetToggleTreeBttn(false);
        selectSearchFocus();
    }
    function selectSearchFocus() {                                              //console.log("---select(ing)SearchFocus = ", $('#search-focus').val())
        var focus = $('#search-focus').val();         
        var builderMap = { 
            "locs": buildLocationGrid, "srcs": buildSourceGrid,
            "taxa": buildTaxonGrid 
        };  
        if (!localStorage.getItem('pgDataUpdatedAt')) { return; } 
        ifChangedFocus(focus, builderMap[focus]); 
    }
    /**
     * Updates and resets the focus 'state' of the search, either 'taxa', 'locs' or 'srcs'.
     */
    function ifChangedFocus(focus, buildGridFunc) {                             //console.log("ifChangedFocus called.")
        clearPreviousGrid();
        if (focus !== focusStorage.curFocus) {   
            _util.populateStorage("curFocus", focus);
            localStorage.removeItem("curDomain");
            initNoFiltersStatus();
            resetFocusStorage();
            resetToggleTreeBttn(false);
            clearPastHtmlOptions(); //buildGridFunc called here. 
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
     * @fillTreeWithInteractions to begin rebuilding the data grid. Otherwise, 
     * an ajax call gets the data which is stored @storeInteractions before being
     * sent to @fillTreeWithInteractions.    
     */
    function getInteractionsAndFillTree() {                                     //console.log("getInteractionsAndFillTree called. Tree = %O", focusStorage.curTree);
        var entityData = _util.getDataFromStorage('interaction');
        fadeGrid();
        if (entityData) { fillTreeWithInteractions(entityData); 
        } else { console.log("Error loading interaction data from storage."); }
    }
    /**
     * Fills the current tree data with interaction records @fillTree and starts 
     * the grid-building method chain for the current focus @buildGrid. Finally, 
     * calls @finishGridAndUiLoad for the final stage of the grid build. 
     */
    function fillTreeWithInteractions(intRcrds) {                               //console.log("fillTreeWithInteractionscalled.");
        var focus = focusStorage.curFocus; 
        var curTree = focusStorage.curTree; 

        fillTree(focus, curTree, intRcrds);
        buildGrid(focus, curTree);
        finishGridAndUiLoad();
    } 
    /** Replaces all interaction ids with records for every node in the tree.  */
    function fillTree(focus, curTree, intRcrds) {  
        var intEntities = ['taxon', 'location', 'source'];
        var entityData = _util.getDataFromStorage(intEntities);
        var fillMethods = { taxa: fillTaxonTree, locs: fillLocTree, srcs: fillSrcTree };
        fillMethods[focus](curTree, intRcrds);

        function fillTaxonTree(curTree) {                                        //console.log("fillingTaxonTree. curTree = %O", curTree);
            fillTaxaInteractions(curTree);  
            // fillHiddenTaxonColumns(curTree, intRcrds);
            function fillTaxaInteractions(treeLvl) {                            //console.log("fillTaxonInteractions called. taxonTree = %O", curTree) 
                for (var taxon in treeLvl) {   
                    fillTaxonInteractions(treeLvl[taxon]);
                    if (treeLvl[taxon].children !== null) { 
                        fillTaxaInteractions(treeLvl[taxon].children); }
                }
            }
            function fillTaxonInteractions(taxon) {                             //console.log("fillTaxonInteractions. taxon = %O", taxon);
                var roles = ['subjectRoles', 'objectRoles'];
                for (var r in roles) {
                    taxon[roles[r]] = replaceInteractions(taxon[roles[r]]); 
                }
            }
        } /* End fillTaxonTree */
        /**
         * Recurses through each location's 'children' property and replaces all 
         * interaction ids with the interaction records.
         */
        function fillLocTree(treeBranch) {                                      //console.log("fillLocTree called. taxonTree = %O", treeBranch) 
            for (var curNode in treeBranch) {                                   //console.log("curNode = %O", treeBranch[curNode]);
                if (treeBranch[curNode].interactions.length > 0) { 
                    treeBranch[curNode].interactions = replaceInteractions(treeBranch[curNode].interactions); }
                if (treeBranch[curNode].children) { 
                    fillLocTree(treeBranch[curNode].children); }
            }
        }
        /**
         * Recurses through each source's 'children' property until finding the
         * direct source, then replacing its interaction id's with their records.
         */
        function fillSrcTree(curTree) { 
            for (var srcName in curTree) {                                      //console.log("-----processing src %s = %O. children = %O", srcName, curTree[srcName], curTree[srcName].children);
                fillSrcInteractions(curTree[srcName]);
            }
            /**
             * Recurses through each source's 'children' property until all sources 
             * have any interaction ids replaced with the interaction records. 
             */
            function fillSrcInteractions(curSrc) {                              //console.log("fillSrcInteractions. curSrc = %O. parentSrc = %O", curSrc, parentSrc);
               var srcChildren = [];
                if (curSrc.isDirect) { replaceSrcInts(curSrc); }
                curSrc.children.forEach(function(childSrc){
                    fillSrcInteractions(childSrc); 
                });
            }
            function replaceSrcInts(curSrc) {
                curSrc.interactions = replaceInteractions(curSrc.interactions); 
            }

        } /* End fillSrcTree */
        /** Replace the interaction ids with their interaction records. */
        function replaceInteractions(interactionsAry) {                         //console.log("replaceInteractions called. interactionsAry = %O", interactionsAry);
            return interactionsAry.map(function(intId){
                if (typeof intId === "number") {                                //console.log("new record = %O",  JSON.parse(JSON.stringify(intRcrds[intId])));
                    return fillIntRcrd(getDetachedRcrd(intId, intRcrds)); 
                }  console.log("####replacing interactions a second time? Ary = %O", interactionsAry);
            });
        }
        /** Returns a filled record with all references replaced with entity records. */
        function fillIntRcrd(intRcrd) {
            for (var prop in intRcrd) { 
                if (prop in entityData) { 
                    intRcrd[prop] = entityData[prop][intRcrd[prop]];
                } else if (prop === "subject" || prop === "object") {
                    intRcrd[prop] = entityData.taxon[intRcrd[prop]];
                } else if (prop === "tags") {
                    intRcrd[prop] = intRcrd[prop].length > 0 ? 
                        getIntTags(intRcrd[prop]) : null;
                }
            }
            return intRcrd;
        }
        function getIntTags(tagAry) { 
            var tags = tagAry.map(function(tag){ return tag.displayName; });
            return tags.join(", ");
        }
    } /* End fillTree */
    /** Calls the start of the grid-building method chain for the current focus. */
    function buildGrid(focus, curTree) {
        var gridBuilderMap = { 
            locs: buildLocSearchUiAndGrid,  srcs: buildSrcSearchUiAndGrid,
            taxa: buildTaxonSearchUiAndGrid 
        };    
        gridBuilderMap[focus](curTree);
    }
    /** Returns an interaction rowData object with flat data in grid-ready format. */
    function buildIntRowData(intRcrd, treeLvl){                                 //console.log("intRcrd = %O", intRcrd);
        var rowData = {
            isParent: false,
            name: "",
            treeLvl: treeLvl,
            type: "intRcrd", 
            id: intRcrd.id,
            interactionType: intRcrd.interactionType.displayName,
            citation: intRcrd.source.description,
            subject: getTaxonName(intRcrd.subject),
            object: getTaxonName(intRcrd.object),
            tags: intRcrd.tags,
            note: intRcrd.note, 
        };
        if (intRcrd.location) { getLocationData(intRcrd.location); }
        return rowData;
        /** Adds to 'rowData' any location properties present in the intRcrd. */
        function getLocationData(locObj) {
            getSimpleLocData();
            getOtherLocData();
            /** Add any present scalar data. */
            function getSimpleLocData() {
                var props = {
                    location: 'displayName',    gps: 'gpsData',
                    elev: 'elevation',          elevMax: 'elevationMax',
                    lat: 'latitude',            long: 'longitude',
                };
                for (var p in props) {
                   if (locObj[props[p]]) { rowData[p] = locObj[props[p]]; } 
                }
            }
            /** Add data from property objects. */
            function getOtherLocData() {
                var props = {
                    country: "country",         region: "region",
                    habitat: "habitatType"          
                };
                for (var p in props) {
                    if (locObj[props[p]]) { 
                        rowData[p] = locObj[props[p]].displayName; } 
                }                
            }
        } /* End getLocationData */
    } /* End buildIntRowData */
    function getTaxonName(taxon) {                                           
        var lvl = taxon.level.displayName;  
        return lvl === "Species" ? taxon.displayName : lvl+' '+taxon.displayName;
    }   
/*------------------Taxon Search Methods---------------------------------------*/
    /**
     * Get all data needed for the Taxon-focused grid from local storage and send 
     * to @initTaxonSearchUi to begin the data-grid build.  
     */
    function buildTaxonGrid() {                                                 //console.log("Building Taxon Grid.");
        var data = _util.getDataFromStorage(['domain', 'taxon', 'level']); 
        if( data ) { initTaxonSearchUi(data);
        } else { console.log("Error loading taxon data from storage."); }
    }
    /**
     * If the taxon search comboboxes aren't displayed, build them @buildTaxonDomainHtml.
     * If no domain is selected, the default domain value is set. The domain-tree 
     * is built @initTaxonTree and all present taxon-levels are stored @storeLevelData. 
     * Continues grid build @getInteractionsAndFillTree.  
     */
    function initTaxonSearchUi(data) {                                          //console.log("initTaxonSearchUi. data = %O", data);
        var domainTaxonRcrd;
        focusStorage.rcrdsById = data.taxon;
        if (!$("#sel-domain").length) { buildTaxonDomainHtml(data.domain); }  
        setTaxonDomain();  
        
        domainTaxonRcrd = storeAndReturnDomain();
        initTaxonTree(domainTaxonRcrd);
        storeLevelData(domainTaxonRcrd);
        getInteractionsAndFillTree();
    }
    /** Restores stored domain from previous session or sets the default 'Plants'. */
    function setTaxonDomain() {
        var domainVal;
        var storedDomain = localStorage.getItem('curDomain');                   //console.log("storedDomain = ", storedDomain)
        if ($('#sel-domain').val() === null) { 
            domainVal = storedDomain !== null ? storedDomain : "3";  
            $('#sel-domain').val(domainVal);
        }
    }
    /**
     * Stores in the global focusStorage obj:
     * > taxonByLvl - object with taxon records in the current tree organized by 
     *   level and keyed under their display name.
     * > allDomainLvls - array of all levels present in the current domain tree.
     */
    function storeLevelData(topTaxon) {
        focusStorage["taxaByLvl"] = seperateTaxonTreeByLvl(topTaxon);           //console.log("taxaByLvl = %O", focusStorage.taxaByLvl)
        focusStorage["allDomainLvls"] = Object.keys(focusStorage.taxaByLvl);
    }
    function updateTaxaByLvl(topTaxon) {
        focusStorage["taxaByLvl"] = seperateTaxonTreeByLvl(topTaxon);           //console.log("taxaByLvl = %O", focusStorage.taxaByLvl)
    }
    /** Returns an object with taxon records by level and keyed with display names. */
    function seperateTaxonTreeByLvl(topTaxon) {
        var separated = {};
        separate(topTaxon);
        return separated;

        function separate(taxon) {
            var lvl = taxon.level.displayName;
            if (separated[lvl] === undefined) { separated[lvl] = {}; }
            separated[lvl][taxon.displayName] = taxon;
            
            if (taxon.children) { 
                taxon.children.forEach(function(child){ separate(child); }); 
            }
        }
    } /* End seperateTaxonTreeByLvl */
    /** Event fired when the taxon domain select box has been changed. */
    function onTaxonDomainChange(e) {  
        var domainTaxon = storeAndReturnDomain();
        resetCurTreeState();
        rebuildTaxonTree(domainTaxon, true);
    }
    /**
     * Gets the currently selected taxon domain's id, gets the record for the taxon, 
     * stores both it's id and level in the global focusStorag, and returns 
     * the taxon's record.
     */
    function storeAndReturnDomain() {
        var domainId = $('#sel-domain').val();
        var domainTaxonRcrd = getDetachedRcrd(domainId);                        //console.log("domainTaxon = %O", domainTaxonRcrd);
        var domainLvl = domainTaxonRcrd.level;
        _util.populateStorage('curDomain', domainId);
        focusStorage.curDomain = domainId;
        focusStorage.domainLvl = domainLvl;
        return domainTaxonRcrd;
    }
    /**
     * Builds a taxon data-tree for the passed taxon. The taxon levels present in 
     * the tree are stored or updated before continuing @getInteractionsAndFillTree.. 
     * Note: This is the entry point for filter-related taxon-grid rebuilds.
     */
    function rebuildTaxonTree(topTaxon, domainInit) {                           //console.log("domainTaxon=%O", domainTaxon)
        clearPreviousGrid();
        initTaxonTree(topTaxon);
        if (domainInit) { storeLevelData(topTaxon); 
        } else { updateTaxaByLvl(topTaxon); }
        getInteractionsAndFillTree();
    }
    /**
     * Builds a family tree of taxon data with passed taxon as the top of the tree. 
     * The top taxon's id is added to the global focus storage obj's 'openRows' 
     * and will be expanded on grid load. 
     */
    function initTaxonTree(topTaxon) {
        buildTaxonTree(topTaxon);                                 
        focusStorage.openRows = [topTaxon.id.toString()];                                    //console.log("openRows=", openRows)
    }
    /**
     * Returns a heirarchical tree of taxon record data from the top, parent, 
     * domain taxon through all children. The tree is stored as 'curTree' in the 
     * global focusStorage obj. 
     */
    function buildTaxonTree(topTaxon) {                                         //console.log("buildTaxonTree called for topTaxon = %O", topTaxon);
        var tree = {};                                                          //console.log("tree = %O", tree);
        tree[topTaxon.displayName] = topTaxon;  
        topTaxon.children = getChildTaxa(topTaxon.children);    
        focusStorage.curTree = tree;  
        /**
         * Recurses through each taxon's 'children' property and returns a record 
         * for each child ID found. 
         */
        function getChildTaxa(children) {                                       //console.log("getChildTaxa called. children = %O", children);
            if (children === null) { return null; }
            return children.map(function(child){
                if (typeof child === "object") { return child; }

                var childRcrd = getDetachedRcrd(child);                         //console.log("child = %O", child);
                if (childRcrd.children.length >= 1) { 
                    childRcrd.children = getChildTaxa(childRcrd.children);
                } else { childRcrd.children = null; }

                return childRcrd;
            });
        }
    } /* End buildTaxonTree */
    /**
     * Initialize a search-combobox for each level in the tree @loadTaxonComboboxes.
     * Transform tree data into grid rows and load grid @transformTaxonDataAndLoadGrid.
     */
    function buildTaxonSearchUiAndGrid(taxonTree) {                               //console.log("taxaByLvl = %O", focusStorage.taxaByLvl);
        loadTaxonComboboxes();
        transformTaxonDataAndLoadGrid(taxonTree);
    } 
    /*------------------ Build Taxon Search Ui --------------------------------*/
    /**
     * Builds the select box for the taxon domains that will become the data tree 
     * nodes displayed in the grid.
     */
    function buildTaxonDomainHtml(data) {                                        //console.log("buildTaxonDomainHtml called. ");
        var browseElems = _util.buildElem('span', { id:"sort-taxa-by", text: "Group Taxa by: " });
        var domainOpts = getDomainOpts(data);   //console.log("domainOpts = %O", domainOpts);
        $(browseElems).append(_util.buildSelectElem( domainOpts, { class: 'opts-box', id: 'sel-domain' }));

        $('#sort-opts').append(browseElems);
        $('#sel-domain').change(onTaxonDomainChange);
        $('#sort-opts').fadeTo(0, 1);

        function getDomainOpts(data) {  
            var optsAry = [];
            for (var id in data) {                                              //console.log("taxon = %O", data[taxonId]);
                optsAry.push({ value: data[id].taxon, text: data[id].displayName });
            }
            return optsAry;
        }
    } /* End buildTaxonDomainHtml */
    /**
     * Builds and initializes a search-combobox for each level present in the 
     * the unfiltered domain tree. Each level's box is populated with the names 
     * of every taxon at that level in the displayed, filtered, grid-tree. After 
     * appending, the selects are initialized with the 'selectize' library @initComboboxes. 
     */
    function loadTaxonComboboxes() {
        var curTaxaByLvl = focusStorage.taxaByLvl;                              //console.log("curTaxaByLvl = %O", curTaxaByLvl);
        var lvlOptsObj = buildTaxonSelectOpts(curTaxaByLvl);
        var levels = Object.keys(lvlOptsObj);
        if (levels.indexOf(focusStorage.domainLvl) !== -1) { levels.shift(); } //Removes domain level

        loadLevelSelects(lvlOptsObj, levels);
        // initComboboxes();
    }
    /**
     * Builds select options for each level with taxon data in the current domain.
     * If there is no data after filtering at a level, a 'none' option obj is built
     * and will be selected.
     */
    function buildTaxonSelectOpts(rcrdsByLvl) {                                  //console.log("buildTaxonSelectOpts rcrds = %O", rcrdsByLvl);
        var optsObj = {};
        var curDomainLvls = focusStorage.allDomainLvls.slice(1);                //console.log("curDomainLvls = %O", curDomainLvls) //Skips domain lvl 
        curDomainLvls.forEach(function(lvl) {
            if (lvl in rcrdsByLvl) { getLvlOptsObjs(rcrdsByLvl[lvl], lvl);
            } else { fillInLvlOpts(lvl); }
        });
        return optsObj;

        function getLvlOptsObjs(rcrds, lvl) {
            var taxonNames = Object.keys(rcrdsByLvl[lvl]).sort();                //console.log("taxonNames = %O", taxonNames);
            optsObj[lvl] = buildTaxonOptions(taxonNames, rcrdsByLvl[lvl]);
            if (taxonNames.length > 0 && taxonNames[0] !== "None") {
                optsObj[lvl].unshift({value: 'all', text: '- All -'});
            }
        }
        function fillInLvlOpts(lvl) {                                           //console.log("fillInEmptyAncestorLvls. lvl = ", lvl);
            var taxon;
            if (lvl in focusStorage.selectedVals) {
                taxon = getDetachedRcrd(focusStorage.selectedVals[lvl]);
                optsObj[lvl] = [{value: taxon.id, text: taxon.displayName}];    
            } else {
                optsObj[lvl] = [{value: 'none', text: '- None -'}];
                focusStorage.selectedVals[lvl] = "none";
            }
        }
    } /* End buildTaxonSelectOpts */
    function buildTaxonOptions(taxonNames, taxonData) {
        return taxonNames.map(function(taxonKey){
            return {
                value: taxonData[taxonKey].id,
                text: taxonKey
            };
        });
    }
    function loadLevelSelects(levelOptsObj, levels) {                           //console.log("loadLevelSelectElems. lvlObj = %O", levelOptsObj)
        var elems = buildTaxonSelects(levelOptsObj, levels);
        clearCol2();        
        $('#opts-col2').append(elems);
        setSelectedTaxonVals(focusStorage.selectedVals);
    }
    function buildTaxonSelects(lvlOpts, levels) {  
        var selElems = [];
        levels.forEach(function(level) {
            var labelElem = _util.buildElem('label', { class: "lbl-sel-opts flex-row" });
            var spanElem = _util.buildElem('span', { text: level + ': ', class: "opts-span" });
            var selectElem = _util.buildSelectElem(
                lvlOpts[level], { class: "opts-box", id: 'sel' + level }, updateTaxonSearch);
            $(labelElem).append([spanElem, selectElem]);
            selElems.push(labelElem);
        });
        return selElems;
    }
    function setSelectedTaxonVals(selected) {                                    //console.log("selected in setSelectedTaxonVals = %O", selected);
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
    /*-------- Taxon Data Formatting ------------------------------------------*/
    /**
     * Transforms the tree's taxon record data into the grid format and sets the 
     * row data in the global focusStorage object as 'rowData'. Calls @loadGrid.
     */
    function transformTaxonDataAndLoadGrid(taxonTree) {                         //console.log("transformTaxonDataAndLoadGrid called. taxonTree = %O", taxonTree)
        var finalRowData = [];
        for (var topTaxon in taxonTree) {
            finalRowData.push( getTaxonRowData(taxonTree[topTaxon], 0) );
        }
        focusStorage.rowData = finalRowData;                                    //console.log("rowData = %O", finalRowData);
        loadGrid("Taxon Tree");
    }
    /**
     * Recurses through each taxon's 'children' property and returns a row data obj 
     * for each taxon in the tree.
     */
    function getTaxonRowData(taxon, treeLvl) {                                  //console.log("taxonRowData. taxon = %O", taxon);
        var lvl = taxon.level.displayName;
        var name = lvl === "Species" ? taxon.displayName : lvl+" "+taxon.displayName;
        var intCount = getIntCount(taxon); 
        return {
            id: taxon.id,
            name: name,
            isParent: true,                     
            parentTaxon: taxon.parent,
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
     */
    function getIntCount(taxon) {
        var roles = ["subjectRoles", "objectRoles"];
        var intCnt = 0;
        roles.forEach(function(role) { intCnt += taxon[role].length; });
        return intCnt > 0 ? intCnt : null;
    } 
    /**
     * Returns both interactions for the curTaxon and rowData for any children.
     * The interactions for non-species Taxa are grouped as the first child row 
     * under "Unspecified [taxonName] Interactions", for species the interactions 
     * are added as rows directly beneath the taxon.
     */
    function getTaxonChildRowData(curTaxon, curTreeLvl) {
        var childRows = [];

        if (curTaxon.level.id !== 7){ //Species
            getUnspecifiedInts(curTreeLvl);
            if (curTaxon.children && curTaxon.children.length) { 
                getTaxonChildRows(curTaxon.children); 
            }
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
        function getTaxonChildRows(children) {
            children.forEach(function(childTaxon){
                childRows.push( getTaxonRowData(childTaxon, curTreeLvl + 1));
            });
        }
    } /* End getTaxonChildRowData */
    function getTaxonIntRows(taxon, treeLvl) {                                  //console.log("getTaxonInteractions for = %O", taxon);
        var roles = ["subjectRoles", "objectRoles"];
        var ints = [];
        roles.forEach(function(role) {
            if (taxon[role].length > 0) {
                taxon[role].forEach(function(intRcrd){
                    ints.push( buildIntRowData(intRcrd, treeLvl));
                });
            } 
        });
        return ints;
    }
/*------------------Location Search Methods-----------------------------------*/
    /** Get location data from local storage and sends it to @startLocGridBuild. */
    function buildLocationGrid() {
        var data = getLocData();
        if( data ) {  startLocGridBuild(data);
        } else { console.log("Error loading location data from storage."); }
    }
    function getLocData() {
        var locDataStorageProps = [
            'location', 'locationType', 'topRegionNames', 'countryNames', 'regionNames'
        ];
        return _util.getDataFromStorage(locDataStorageProps);
    }
    /**
     * Store the location records as 'rcrdsById' in focusStorage. Gets top region 
     * ids and sends them to @buildLocTreeAndGrid.
     */ 
    function startLocGridBuild(data) {                   
        focusStorage.rcrdsById = data.location;                                    
        focusStorage.data = data;
        buildLocTreeAndGrid(getTopRegionIds());
    }
    function getTopRegionIds() {
        var ids = [];
        var regions = focusStorage.data.topRegionNames;
        for (var name in regions) { ids.push(regions[name]); } 
        return ids;
    }
    /** 
     * Builds a tree of location data with regions at the top level, and sub-regions, 
     * countries, areas, and points as nested children @buildLocTree. Fills tree
     * with interactions and continues building the grid @getInteractionsAndFillTree.
     */
    function buildLocTreeAndGrid(topLocs) {
        buildLocTree(topLocs);
        getInteractionsAndFillTree();
    }
    /**
     * Rebuilds loc tree with passed location, or the default top regions, as the
     * top node(s) of the new tree with all sub-locations nested beneath @buildLocTree.
     * Resets 'openRows' and clears grid. Continues @buildLocTreeAndGrid.
     */
    function rebuildLocTree(topLoc) {                                           //console.log("-------rebuilding loc tree. topLoc = %O", topLoc);
        var topLocs = topLoc || getTopRegionIds();
        focusStorage.openRows = topLocs.length === 1 ? topLocs[0] : [];
        clearPreviousGrid();
        buildLocTreeAndGrid(topLocs);
    }
    /**
     * Builds a tree of location data with passed locations at the top level, and 
     * sub-locations as nested children. Adds the alphabetized tree to the global 
     * focusStorage obj as 'curTree'. 
     */ 
    function buildLocTree(topLocs) {                                            //console.log("passed 'top' locIds = %O", topLocs)
        var topLoc;
        var tree = {};                                                          //console.log("tree = %O", tree);
        topLocs.forEach(function(id){  
            topLoc = getDetachedRcrd(id);  
            tree[topLoc.displayName] = getLocChildren(topLoc);
        });  
        focusStorage.curTree = sortDataTree(tree);
    }
    /** Returns the location record with all child ids replaced with their records. */
    function getLocChildren(rcrd) {     
        if (rcrd.children.length > 0) { 
            rcrd.children = rcrd.children.map(getLocChildData);
        }
        return rcrd;
    }
    function getLocChildData(childId) {  
        return getLocChildren(getDetachedRcrd(childId));
    }
    /**
     * Builds the Location search comboboxes @loadLocComboboxes. Transform tree
     * data into grid rows and load the grid @transformLocDataAndLoadGrid.
     * Note: This is also the entry point for filter-related grid rebuilds.
     */
    function buildLocSearchUiAndGrid(locTree) {                                 //console.log("buildLocSearchUiAndGrid called. locTree = %O", locTree)
        loadLocComboboxes(locTree);
        transformLocDataAndLoadGrid(locTree);
    }
    /**
     * Create and append the location search comboboxes, Region and Country, and
     * set any previously 'selected' values.
     */
    function loadLocComboboxes(curTree) {  
        var locOpts = buildLocSelectOpts(curTree);
        var selElems = buildLocSelects(locOpts);
        clearCol2();        
        selectNoneVals(locOpts);
        $('#opts-col2').append(selElems);
        setSelectedLocVals();
    }
    /** Builds arrays of options objects for the location comboboxes. */
    function buildLocSelectOpts(curTree) {
        var processedOpts = { region: [], country: [] };
        var opts = { region: [], country: [] };
        for (var topNode in curTree) { buildLocOptsForNode(curTree[topNode]); }
        sortLocOpts();
        addAllAndNoneOpts();
        return opts; 
        /**
         * Recurses through the tree and builds a option object for each unique 
         * country and region in the current tree. Skips interaction records, which 
         * are identified by their "note" property.
         */
        function buildLocOptsForNode(locNode) {                                 //console.log("locNode = %O", locNode)
            if (locNode.hasOwnProperty("note")) {return;}                       //console.log("buildLocOptsForNode %s = %O", locNode.displayName, locNode)
            var locType = locNode.locationType.id;
            if (locType === 1 || locType === 2) { 
                getLocOpts(locNode.displayName, locNode.locationType.displayName); 
            }
            if (locNode.children) { locNode.children.forEach(buildLocOptsForNode); }
        }
        /** Adds an option object, if one has not already been added for this location. */
        function getLocOpts(name, type) {
            var locType = _util.lcfirst(type);
            if (processedOpts[locType].indexOf(name) === -1) {
                var id = focusStorage.data[locType + "Names"][name];             
                opts[locType].push({ value: id, text: name }); 
                processedOpts[locType].push(name);
            }
        }
        function sortLocOpts() {
            for (var type in opts) {
                opts[type] = opts[type].sort(alphaOptionObjs); 
            }
        }
        /**
         * If there are no options for a location type, add a 'none' option. 
         * Otherwise, add one for 'all'. 
         */
        function addAllAndNoneOpts() {
            for (var type in opts) {                                            //console.log("addAllAndNoneOpts for %s = %O", selName, opts[selName])
                var option = opts[type].length === 0 ? {value: 'none', text: '- None -'} 
                    : (opts[type].length > 1 ? {value: 'all', text: '- All -'} : null);   
                if (option) { opts[type].unshift(option); }
            }
        } 
    } /* End buildLocSelectOpts */
    /** Builds the location select elements */
    function buildLocSelects(locOptsObj) {  
        var selElems = [];
        for (var locSelName in locOptsObj) {
            var selName = _util.ucfirst(locSelName);
            var labelElem = _util.buildElem('label', { class: "lbl-sel-opts flex-row" });
            var spanElem = _util.buildElem('span', { text: selName + ': ', class: "opts-span" });
            var selectElem = _util.buildSelectElem(
                locOptsObj[locSelName], { class: "opts-box", id: 'sel' + selName }, updateLocSearch);
            $(labelElem).append([spanElem, selectElem]);
            selElems.push(labelElem);
        }
        return selElems;
    }
    function selectNoneVals(locOpts) {
        var sel = focusStorage.selectedOpts || createSelectedOptsObj();
        for (var type in locOpts) {
            if (locOpts[type][0].value === 'none') { sel[type] = 'none'; }
        }          
    }
    /** If selectedOpts is undefined, add it as an empty object. */
    function createSelectedOptsObj() {
        focusStorage.selectedOpts = {};
        return focusStorage.selectedOpts;
    }
    function setSelectedLocVals() {                                             //console.log("openRows = %O", focusStorage.openRows);           
        var selId;
        var selected = focusStorage.selectedOpts;                               //console.log("selected in setSelectedLocVals = %O", selected);
        Object.keys(selected).forEach(function(selName) {
            selId = '#sel' + _util.ucfirst(selName);
            $(selId).val(selected[selName]); 
            $(selId).find('option[value="all"]').hide();
            $(selId).find('option[value="none"]').hide();
        });
    }
/*--------- Location Data Formatting -----------------------------------------*/
    /**
     * Transforms the tree's location data into the grid format and sets the row 
     * data in the global focusStorage object as 'rowData'. Calls @loadGrid.
     */
    function transformLocDataAndLoadGrid(locTree) {
        var finalRowData = [];                                                  //console.log("locTree = %O", locTree);
        for (var topNode in locTree) {                                          //console.log("topNode = ", topNode)
            finalRowData.push( getLocRowData(locTree[topNode], 0)); 
        }
        focusStorage.rowData = removeLocsWithoutInteractions(finalRowData);     //console.log("rowData = %O", focusStorage.rowData);
        loadGrid("Location Tree");
    }
    /** Returns a row data object for the passed location and it's children.  */
    function getLocRowData(locRcrd, treeLvl) {                                  //console.log("--getLocRowData called for %s = %O", locRcrd.displayName, locRcrd);
        return {
            id: locRcrd.id,
            name: locRcrd.displayName,  /* Interaction rows have no name to display. */
            isParent: locRcrd.interactionType === undefined,  /* Only interaction records return false. */
            open: focusStorage.openRows.indexOf(locRcrd.id) !== -1, 
            children: getLocRowDataForRowChildren(locRcrd, treeLvl),
            treeLvl: treeLvl,
            interactions: locRcrd.interactions.length > 0,     /* Location objects have collections of interactions as children. */     
            locGroupedInts: hasGroupedInteractionsRow(locRcrd),
            type: locRcrd.locationType.displayName
        };      
    }
    function hasGroupedInteractionsRow(locRcrd) {
        return locRcrd.children.length > 0 && locRcrd.interactions.length > 0;
    }
    /**
     * Returns rowData for interactions at this location and for any children.
     * If there are both interactions and children, the interactions rows are 
     * grouped under the first child row as "Unspecified [locName] Interactions", 
     * otherwise interaction rows are added directly beneath the taxon.
     */
    function getLocRowDataForRowChildren(locRcrd, pTreeLvl) {                   //console.log("getLocRowDataForChildren called. locRcrd = %O", locRcrd)
        var childRows = [];
        var locType = locRcrd.locationType.displayName; 
        if (locType === "Region" || locType === "Country") {
            getUnspecifiedLocInts(locRcrd.interactions, pTreeLvl);
            locRcrd.children.forEach(getChildLocData);
        } else { childRows = getIntRowData(locRcrd.interactions, pTreeLvl); }
        return childRows;
        /**
         * Groups interactions attributed directly to a location with child-locations
         * and adds them as it's first child row. 
         */
        function getUnspecifiedLocInts(intsAry, treeLvl) {   
            var locName = locRcrd.displayName === "Unspecified" ? 
                "Location" : locRcrd.displayName;
            if (intsAry.length > 0) { 
                childRows.push({
                    id: locRcrd.id,
                    name: 'Unspecified ' + locName + ' Interactions',
                    isParent: true,
                    open: false,
                    children: getIntRowData(intsAry, treeLvl),
                    interactions: intsAry.length > 0,
                    treeLvl: treeLvl,
                    groupedInts: true
                });
            }
        }
        function getChildLocData(childLoc) {
            childRows.push(getLocRowData(childLoc, pTreeLvl + 1));
        }
    } /* End getLocRowDataForChildren */
    /** Filters out all locations with no interactions below them in the tree. */
    function removeLocsWithoutInteractions(rows) {  
        return rows.filter(function(row){
            if (row.children) { 
                row.children = removeLocsWithoutInteractions(row.children);
            }
            return row.interactions || hasChildInteractions(row);
        });
    }
    function hasChildInteractions(row) {
        if (!row.children) { return true; }
        return row.children.some(function(childRow) {
            return childRow.interactions;
        });
    }
/*------------------Source Search Methods-----------------------------------*/
    /**
     * Get all data needed for the Source-focused grid from local storage and send  
     * to @initSrcSearchUi to begin the data-grid build.  
     */
    function buildSourceGrid() {
        var entities = [ 'source', 'author', 'publication' ];
        var entityData = _util.getDataFromStorage(entities);
        if( entityData ) { initSrcSearchUi(entityData);
        } else { console.log("Error loading source data from storage."); }
    }
    
    /**
     * If the source-domain combobox isn't displayed, build it @buildSrcDomainHtml.
     * If no domain selected, set the default domain value. Start grid build @buildSrcTree.
     */
    function initSrcSearchUi(srcData) {                                         //console.log("init source search ui");
        addSrcDataToFocusStorage(srcData);
        if (!$("#sel-domain").length) { buildSrcDomainHtml(); }  
        setSrcDomain();  
        buildSrcTree();
    }
    /** Add source data to focusStorage to be available while in a source focus. */
    function addSrcDataToFocusStorage(srcData) {
        focusStorage.rcrdsById = srcData.source;
        focusStorage.author = srcData.author;
        focusStorage.publication = srcData.publication;
    }
    /** Builds the combobox for the source domain types. */
    function buildSrcDomainHtml() {                                             
        var browseElems = _util.buildElem('span', { id:"sort-srcs-by", text: "Source Type: " });
        var domainOpts = getDomainOpts();                                       
        $(browseElems).append(_util.buildSelectElem(domainOpts, { class: 'opts-box', id: 'sel-domain' }));
        $('#sort-opts').append(browseElems);
        //initComboboxes
        $('#sel-domain').change(onSrcDomainChange);
        $('#sort-opts').fadeTo(0, 1);
        function getDomainOpts() {
            return [{ value: "auths", text: "Authors" },
                    { value: "pubs", text: "Publications" }];
        }
    } /* End buildSrcDomainHtml */
    /** Restores stored domain from previous session or sets the default 'Publications'. */
    function setSrcDomain() {
        var storedDomain = localStorage.getItem('curDomain');                   //console.log("storedDomain = ", storedDomain)
        var srcDomain = storedDomain || "pubs";
        if ($('#sel-domain').val() === null) { $('#sel-domain').val(srcDomain); }
    }
    /** Event fired when the source domain select box has been changed. */
    function onSrcDomainChange(e) {  
        clearPreviousGrid();
        resetCurTreeState();
        resetToggleTreeBttn(false);
        buildSrcTree();
    }
    /** (Re)builds source tree for the selected source domain. */
    function buildSrcTree() {
        var domainRcrds = storeAndReturnCurDomainRcrds();                       //console.log("---Search Change. domainRcrds = %O", domainRcrds);
        initSrcTree(focusStorage.curDomain, domainRcrds);
        getInteractionsAndFillTree();
    }
    /** Returns the records for the source domain currently selected. */
    function storeAndReturnCurDomainRcrds() {
        var valMap = { "auths": "authSources", "pubs": "pubSources" };
        var domainVal = $('#sel-domain').val();                                 //console.log("domainVal = ", domainVal)                     
        focusStorage.curDomain = domainVal;
        _util.populateStorage('curDomain', domainVal);
        return getTreeRcrdAry(valMap[domainVal]);
    }
    /** Returns an array with all records from the stored record object. */
    function getTreeRcrdAry(domain) {
        var rcrdIdAry = _util.getDataFromStorage(domain);
        return rcrdIdAry.map(function(id) { return getDetachedRcrd(id); });
    }
    /**
     * Builds a family tree of source data of the selected source domain: authors 
     * @buildAuthSrcTree and publications @buildPubSrcTree, and adds it to 
     * the global focusStorage obj as 'curTree', 
     * NOTE: Sources have two domains, or types of tree data: 
     * Authors->Publications->Interactions, and Publications->Citations->Interactions. 
     */
    function initSrcTree(focus, rcrds) {                                        //console.log("initSrcTree domainRcrds = %O", domainRcrds);
        var tree = focus === "pubs" ? buildPubTree(rcrds) : buildAuthTree(rcrds);
        focusStorage.curTree = sortDataTree(tree);
    }  
/*-------------- Publication Source Tree -------------------------------------------*/
    /**
     * Returns a heirarchical tree with Publications as top nodes of the data tree. 
     * Each interaction is attributed directly to a citation source, which currently 
     * always has a 'parent' publication source.
     * Publication Source Tree:
     * ->Publication Title
     * ->->Citation Title
     * ->->->Interactions Records
     */
    function buildPubTree(pubSrcRcrds) {                                        //console.log("buildPubSrcTree. Tree = %O", pubRcrds);
        var tree = {};
        pubSrcRcrds.forEach(function(pub) { 
            tree[pub.displayName] = getPubData(pub); 
        });
        return tree;
    }
    function getPubData(rcrd) {                                                 //console.log("getPubData. rcrd = %O", rcrd);
        rcrd.children = getPubChildren(rcrd);
        if (rcrd.publication) {                                                 //console.log("rcrd with pub = %O", rcrd)
            rcrd.publication = getDetachedRcrd(rcrd.publication, focusStorage.publication);
        }
        return rcrd;
    }
    function getPubChildren(rcrd) {                                             //console.log("getPubChildren rcrd = %O", rcrd)
        if (rcrd.children.length === 0) { return []; }
        return rcrd.children.map(function(id) {
            return getPubData(getDetachedRcrd(id));
        });
    }
/*-------------- Author Source Tree -------------------------------------------*/
    /**
     * Returns a heirarchical tree with Authors as top nodes of the data tree, 
     * with their contributibuted works and the interactions they contain nested 
     * within. Authors with no contributions are not added to the tree.
     * Author Source Tree:
     * ->Author
     * ->->Citation Title (Publication Title)
     * ->->->Interactions Records
     */
    function buildAuthTree(authSrcRcrds) {                                      //console.log("----buildAuthSrcTree");
        var tree = {};
        for (var id in authSrcRcrds) { 
            getAuthData(getDetachedRcrd(id, authSrcRcrds)); 
        }  
        return tree;  

        function getAuthData(authSrc) {                                         //console.log("rcrd = %O", authSrc);
            if (authSrc.contributions.length > 0) {
                authSrc.author = getDetachedRcrd(authSrc.author, focusStorage.author);
                authSrc.children = getAuthChildren(authSrc.contributions); 
                tree[authSrc.displayName] = authSrc;
            }
        }
    } /* End buildAuthTree */
    /** For each source work contribution, gets any additional publication children
     * @getPubData and return's the source record.
     */
    function getAuthChildren(contribs) {                                        //console.log("getAuthChildren contribs = %O", contribs);
        return contribs.map(function(workSrcId){
            return getPubData(getDetachedRcrd(workSrcId));
        });
    }
    /**
     * Will build the select elems for the source search options. Clears previous 
     * grid. Calls @transformSrcDataAndLoadGrid to transform tree data into grid 
     * format and load the data grid.
     * NOTE: This is the entry point for source grid rebuilds as filters alter data
     * contained in the data tree.
     */
    function buildSrcSearchUiAndGrid(srcTree) {                                 //console.log("buildSrcSearchUiAndGrid called. tree = %O", srcTree);
        clearPreviousGrid();
        if (focusStorage.curDomain === "pubs") { loadPubSearchHtml(srcTree); 
        } else { loadAuthSearchHtml(); }
        transformSrcDataAndLoadGrid(srcTree);
    } 
    function loadPubSearchHtml(srcTree) {
        var pubTypeOpts = buildPubSelectOpts();
        var pubSelElem = buildPubSelects(pubTypeOpts);
        clearCol2();        
        $('#opts-col2').append(pubSelElem);
        //initComboboxes
    }
    function buildPubSelectOpts() {
        var pubTypes = _util.getDataFromStorage("publicationType");
        var opts = [{value: 'all', text: '- All -'}];                           //console.log("pubTypes = %O", pubTypes);
        for (var t in pubTypes) {
            opts.push({ value: pubTypes[t].id, text: pubTypes[t].displayName });
        }
        return opts.sort(alphaOptionObjs);  
    }
    /** Builds the publication type dropdown */
    function buildPubSelects(pubTypeOpts) {                                     //console.log("buildPubSelects pubTypeOpts = %O", pubTypeOpts)
        var labelElem = _util.buildElem('label', { class: "lbl-sel-opts flex-row" });
        var spanElem = _util.buildElem('span', { text: 'Publication Type:', class: 'opts-span'});
        var selectElem = _util.buildSelectElem(
            pubTypeOpts, { class: "opts-box", id: 'selPubTypes' }, updatePubSearch
        );
        $(labelElem).css('width', '255px');
        $(selectElem).css('width', '115px');
        $(spanElem).css('width', '124px');
        $(labelElem).append([spanElem, selectElem]);
        return labelElem;
    }
    /** Builds a text input for searching author names. */
    function loadAuthSearchHtml() {
        var labelElem = _util.buildElem('label', { class: "lbl-sel-opts flex-row" });
        var inputElem = _util.buildElem('input', { name: 'authNameSrch', type: 'text', placeholder: "Author Name"  });
        var bttn = _util.buildElem('button', { text: 'Search', name: 'authSrchBttn', class: "ag-fresh grid-bttn" });
        $(inputElem).onEnter(updateAuthSearch);
        $(bttn).css('margin-left', '5px');
        $(bttn).click(updateAuthSearch);
        $(labelElem).append([inputElem, bttn]);
        clearCol2();        
        $('#opts-col2').append(labelElem);
        //initComboboxes
    }
    /*--------- Source Data Formatting ---------------------------------------*/
    /**
     * Transforms the tree's source record data into grid row format and set as 
     * 'rowData' in the global focusStorage object as 'rowData'. Calls @loadGrid.
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
    function getSrcRowData(src, treeLvl) {                                      //console.log("getSrcRowData. source = %O", src);
        var detailId = focusStorage.curDomain === "pubs" && src.publication ? 
            src.publication.id : null;  
        return {
            id: src.id,
            pubId: detailId,
            name: src.displayName,
            isParent: true,      
            parentSource: src.parent,
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
        if (curSrc.isDirect) { return getIntRowData(curSrc.interactions, treeLvl); }
        return curSrc.children === null ? [] : getChildSrcData(curSrc, treeLvl);
    }
    function getChildSrcData(src, treeLvl) {
        return src.children.map(function(childSrc) {                         //console.log("childSrc = %O", childSrc);
            return getSrcRowData(childSrc, treeLvl + 1);
        });
    }
/*================== Filter Functions ========================================*/
    /*------------------ Taxon Filter Updates ---------------------------------*/
    /**
     * When a taxon is selected from one of the taxon-level comboboxes, the grid 
     * is updated with the taxon as the top of the new tree. The remaining level 
     * comboboxes are populated with realted taxa, with ancestors selected.
     */
    function updateTaxonSearch() {                                              //console.log("updateTaxonSearch val = ", $(this).val())
        var selectedTaxonId = $(this).val();                                    //console.log("selectedTaxonId = %O", selectedTaxonId);
        var selTaxonRcrd = getDetachedRcrd(selectedTaxonId);  
        focusStorage.selectedVals = getRelatedTaxaToSelect(selTaxonRcrd);       //console.log("selectedVals = %O", focusStorage.selectedVals);
        updateFilterStatus();
        rebuildTaxonTree(selTaxonRcrd);

        function updateFilterStatus() {
            var curLevel = selTaxonRcrd.level.displayName;
            var taxonName = selTaxonRcrd.displayName;
            var status = "Filtering on: " + curLevel + " " + taxonName; 
            clearGridStatus();
            setExternalFilterStatus(status);
        }
    } /* End updateTaxonSearch */
    /** The selected taxon's ancestors will be selected in their levels combobox. */
    function getRelatedTaxaToSelect(selTaxonObj) {                              //console.log("getRelatedTaxaToSelect called for %O", selTaxonObj);
        var topTaxaIds = [1, 2, 3, 4]; //animalia, chiroptera, plantae, arthropoda 
        var selected = {};                                                      //console.log("selected = %O", selected)
        selectAncestorTaxa(selTaxonObj);
        return selected;
        /** Adds parent taxa to selected object, until the domain parent. */
        function selectAncestorTaxa(taxon) {                                    //console.log("selectedTaxonid = %s, obj = %O", taxon.id, taxon)
            if ( topTaxaIds.indexOf(taxon.id) === -1 ) {
                selected[taxon.level.displayName] = taxon.id;                   //console.log("setting lvl = ", taxon.level)
                selectAncestorTaxa(getDetachedRcrd(taxon.parent))
            }
        }
    } /* End getRelatedTaxaToSelect */
    /*------------------ Location Filter Updates -----------------------------*/
    /**
     * When a location dropdown is changed, the column for that dropdown is filtered 
     * and the grid is updated with the filtered data tree. Selected values are 
     * derived and stored @getSelectedVals.      
     * */
    function updateLocSearch() {                                                //console.log("\n\n\n\n-----updateLocSearch 'this' = ", $(this));
        var selElemId = $(this).attr("id");
        var selVal = $(this).val();
        var selTypeMap = { selCountry: "country", selRegion: "region" };
        var selType = selTypeMap[selElemId];

        focusStorage.selectedOpts = getSelectedVals(selVal, selType);
        filterGridOnLocCol(selVal, selType);
        /** Retuns the vals to select. If 'country' was selected, add it's region. */
        function getSelectedVals(val, type) {                                   //console.log("getSelectedVals. val = %s, selType = ", val, type)
            var selected = {};
            if (type === "country") { selectRegion(val); }
            if (val !== 'none' && val !== 'all') { selected[type] = val; }
            return selected;  

            function selectRegion(val) {
                var loc = getDetachedRcrd(val);
                selected["region"] = loc.region.id;
            }
        } /* End getSelectedVals */
    } /* End updateLocSearch */
    /**
     * Uses column filter to rebuild the grid. Rebuilds tree and the location
     * search option dropdowns from the displayed tree data in the grid after filter.
     * Note: There are no records with "Asia" as the region, thus the unique values grid filter
     * is only aware of Asia's sub-regions
     */
    function filterGridOnLocCol(selVal, colName) {                              //console.log("filterGridOnLocCol selected = %s for %s", selVal, colName);
        var filterVal = focusStorage.rcrdsById[selVal].displayName;
        var colModel = filterVal === "Asia" ? 
            ["East Asia", "South & Southeast Asia", "West & Central Asia"] : [filterVal];
        gridOptions.api.getFilterApi(colName).setModel(colModel);
        buildFilteredLocTree(selVal, colName);
        loadLocComboboxes(focusStorage.curTree);
        gridOptions.api.onGroupExpandedOrCollapsed();
    }
    /**
     * Builds new tree out of displayed rows after filter. When a location has been 
     * selected, each parent row is added to the openRows collection so that the 
     * grid is displayed opened to the selected row.
     */
    function buildFilteredLocTree(selVal, colName) {
        var gridModel = gridOptions.api.getModel();                             //console.log("gridModel = %O", gridModel);
        var tree = {};
        var selectedOpened = isNaN(selVal);

        gridModel.rowsToDisplay.forEach(function(topNode) {                     //console.log("rowToDisplay = %O", topNode)
            tree[topNode.data.name] = getFilteredChildData(topNode);
        });
        focusStorage.curTree = tree;
        /** Recurses through displayed children until finding the leaf interaction records. */
        function getFilteredChildData(treeNode) {                               //console.log("getHabTreeData. node = %O", treeNode);
            if (treeNode.data.hasOwnProperty("note")) { return treeNode.data; }
            if (!selectedOpened) { addParentOpenRows(treeNode); }
            var locNode = getDetachedRcrd(treeNode.data.id); 
            var locNodeChildren = treeNode.childrenAfterFilter;
            if (locNodeChildren) { locNode.children = locNodeChildren.map(getFilteredChildData); }
            return locNode; 
        }
        /** Expands the parent rows of a selected location. */
        function addParentOpenRows(node) {
            node.expanded = true;
            node.data.open = true;
            if (node.data.id == selVal) { selectedOpened = true; }
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
        var newRows = selVal === "all" ? focusStorage.rowData : getPubTypeRows(selVal);
        gridOptions.api.setRowData(newRows);
        updateSrcFilterStatus(selVal, selText+'s');
    } 
    /** Returns the rows for publications with their id in the selected type's array */
    function getPubTypeRows(selVal) {
        var pubTypes = _util.getDataFromStorage('publicationType'); 
        var pubIds = pubTypes[selVal].publications;         
        var rows = [];
        focusStorage.rowData.forEach(function(row) { 
            if (pubIds.indexOf(row.pubId) !== -1) { rows.push(row); }
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
/*================ Grid Build Methods ==============================================*/
    /**
     * Fills additional columns with flattened taxon-tree parent chain data for csv exports.
     */
    function fillHiddenTaxonColumns(curTaxonTree) {  
        var curTaxonHeirarchy = {};
        getNextLvlTaxonData(curTaxonTree);

        function getNextLvlTaxonData(treeObj) {
            for(var topTaxon in treeObj) {  
                syncTaxonHeir( treeObj[topTaxon].displayName, treeObj[topTaxon].level, treeObj[topTaxon].parent);
                fillInteractionRcrdsWithTaxonTreeData( treeObj[topTaxon].interactions );
                if (treeObj[topTaxon].children) { 
                    getNextLvlTaxonData( treeObj[topTaxon].children ); }             
            }
        }
        /**
         * The top taxon for the domain triggers the taxon-heirarchy init @fillInAvailableLevels. 
         * For each subsequent taxon, each level more specific that the parent 
         * lvl is cleared from the taxon-heirarchy @clearLowerLvls.  
         */
        function syncTaxonHeir(taxonName, lvl, parent) {                        //console.log("syncTaxonHeir parent = ", parent);
            var lvls = _util.getDataFromStorage('levelNames');  //refactor. levels may not need to be stored at all
            if (parent === null || parent === 1) { fillInAvailableLevels(lvl, lvls);
            } else { clearLowerLvls(focusStorage.rcrdsById[parent].level) }

            curTaxonHeirarchy[lvl] = taxonName;
        }
        /**
         * Inits the taxon-heirarchy object that will be used to track of the current
         * parent chain of each taxon being processed. 
         */
        function fillInAvailableLevels(topLvl, lvls) { 
            var topIdx = lvls.indexOf(topLvl);
            for (var i = topIdx; i < lvls.length; i++) { 
                curTaxonHeirarchy[lvls[i]] = null;
            }  
        }
        function clearLowerLvls(parentLvl, lvls) {
            var topIdx = lvls.indexOf(parentLvl);
            for (var i = ++topIdx; i < lvls.length; i++) { curTaxonHeirarchy[lvls[i]] = null; }
        }
        function fillInteractionRcrdsWithTaxonTreeData(intObj) {
            for (var role in intObj) {
                if (intObj[role] !== null) { intObj[role].forEach(addTaxonTreeFields) }
            }
        } 
        function addTaxonTreeFields(intRcrdObj) {
            for (var lvl in curTaxonHeirarchy) { 
                colName = 'tree' + lvl; 
                intRcrdObj[colName] = lvl === 'Species' ? 
                    getSpeciesName(curTaxonHeirarchy[lvl]) : curTaxonHeirarchy[lvl];
            }
        }
        function getSpeciesName(speciesName) {
            return speciesName === null ? null : _util.ucfirst(curTaxonHeirarchy['Species'].split(' ')[1]);
        }
    } /* End fillHiddenColumns */
    function getDefaultGridOptions() {
        return {
            columnDefs: getColumnDefs(),
            rowSelection: 'multiple',   //Used for csv export
            getHeaderCellTemplate: getHeaderCellTemplate, 
            getNodeChildDetails: getNodeChildDetails,
            getRowClass: getRowStyleClass,
            onRowGroupOpened: softRefresh,
            onBeforeFilterChanged: beforeFilterChange, 
            onAfterFilterChanged: afterFilterChanged,
            onModelUpdated: onModelUpdated,
            onBeforeSortChanged: onBeforeSortChanged,
            enableColResize: true,
            enableSorting: true,
            unSortIcon: true,
            enableFilter: true,
            rowHeight: 26
        };
    }
    /**
     * Builds the grid options object and passes everyting into agGrid, which 
     * creates and shows the grid.
     */
    function loadGrid(treeColTitle, gridOpts) {  //console.log("loading grid. rowdata = %s", JSON.stringify(rowData, null, 2));
        var gridDiv = document.querySelector('#search-grid');
        var gridOptObj = gridOpts || gridOptions;
        gridOptObj.rowData = focusStorage.rowData;
        gridOptObj.columnDefs = getColumnDefs(treeColTitle);
        new agGrid.Grid(gridDiv, gridOptObj);
        sortTreeColumnIfTaxonFocused();
    }
    /** If the grid is Taxon focused, sort the tree column by taxon-rank and name. */
    function sortTreeColumnIfTaxonFocused() {
        if (focusStorage.curFocus === 'taxa') {
            gridOptions.api.setSortModel([{colId: "name", sort: "asc"}]);
        }
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
            '  <div id="agHeaderCellLabel" class="ag-header-cell-label">' +                                 //which breaks the grid. The provided 'supressFilter' option doesn't work.
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
     * Tree columns are hidden until taxon export and are used for the flattened 
     * taxon-tree data. The role is set to subject for 'bats' exports, object for 
     * plants and arthropods.
     */
    function getColumnDefs(mainCol) { 
        var domain = focusStorage.curDomain || false;  
        var taxonLvlPrefix = domain ? (domain == 2 ? "Subject" : "Object") : "Tree"; 

        return [{headerName: mainCol, field: "name", width: getTreeWidth(), cellRenderer: 'group', suppressFilter: true,
                    cellRendererParams: { innerRenderer: innerCellRenderer, padding: 20 }, 
                    cellClass: getCellStyleClass, comparator: sortByRankThenName },     //cellClassRules: getCellStyleClass
                {headerName: taxonLvlPrefix + " Kingdom", field: "treeKingdom", width: 150, hide: true },
                {headerName: taxonLvlPrefix + " Phylum", field: "treePhylum", width: 150, hide: true },
                {headerName: taxonLvlPrefix + " Class", field: "treeClass", width: 150, hide: true },
                {headerName: taxonLvlPrefix + " Order", field: "treeOrder", width: 150, hide: true },
                {headerName: taxonLvlPrefix + " Family", field: "treeFamily", width: 150, hide: true },
                {headerName: taxonLvlPrefix + " Genus", field: "treeGenus", width: 150, hide: true },
                {headerName: taxonLvlPrefix + " Species", field: "treeSpecies", width: 150, hide: true },
                {headerName: "Edit", field: "edit", width: 50, headerTooltip: "Edit", hide: isNotEditor(), cellRenderer: addEditPencil },
                {headerName: "Cnt", field: "intCnt", width: 47, headerTooltip: "Interaction Count", volatile: true },
                {headerName: "Subject Taxon", field: "subject", width: 133, cellRenderer: addToolTipToCells, comparator: sortByRankThenName },
                {headerName: "Object Taxon", field: "object", width: 133, cellRenderer: addToolTipToCells, comparator: sortByRankThenName },
                {headerName: "Interaction Type", field: "interactionType", width: 146, cellRenderer: addToolTipToCells, filter: UniqueValuesFilter },
                {headerName: "Habitat", field: "habitat", width: 90, cellRenderer: addToolTipToCells, filter: UniqueValuesFilter },
                {headerName: "Tags", field: "tags", width: 75, filter: UniqueValuesFilter},
                {headerName: "Citation", field: "citation", width: 122, cellRenderer: addToolTipToCells},
                {headerName: "Location", field: "location", width: 122, cellRenderer: addToolTipToCells },
                {headerName: "Country", field: "country", width: 100, cellRenderer: addToolTipToCells, filter: UniqueValuesFilter },
                {headerName: "Region", field: "region", width: 88, cellRenderer: addToolTipToCells, filter: UniqueValuesFilter },
                // {headerName: "Elevation", field: "elev", width: 150, hide: true },
                // {headerName: "Elev Max", field: "elevMax", width: 150, hide: true },
                // {headerName: "Latitude", field: "lat", width: 150, hide: true },
                // {headerName: "Longitude", field: "long", width: 150, hide: true },
                // {headerName: "GPS Data", field: "gps", width: 150, hide: true }, //No data currently in the db
                {headerName: "Note", field: "note", width: 100, cellRenderer: addToolTipToCells} ];
    }
    /** Returns the initial width of the tree column according to role and screen size. */
    function getTreeWidth() { 
        var offset = ['admin', 'super', 'editor'].indexOf(userRole) === -1 ? 0 : 50;
        return ($(window).width() > 1500 ? 340 : 273) - offset;
    }
    /** This method ensures that the Taxon tree column stays sorted by Rank and Name. */
    function onBeforeSortChanged() {                                            
        if (focusStorage.curFocus !== "taxa") { return; }                       
        var sortModel = gridOptions.api.getSortModel();                         //console.log("model obj = %O", sortModel)
        if (!sortModel.length) { return gridOptions.api.setSortModel([{colId: "name", sort: "asc"}]); }
        ifNameUnsorted(sortModel);        
    }
    /** Sorts the tree column if it is not sorted. */
    function ifNameUnsorted(model) {
        var nameSorted = model.some(function(colModel){
            return colModel.colId === "name";
        });
        if (!nameSorted) { 
            model.push({colId: "name", sort: "asc"}); 
            gridOptions.api.setSortModel(model);
        }
    }
    /**
     * Sorts the tree column alphabetically for all views. If in Taxon view, the 
     * rows are sorted first by rank and then alphabetized by name @sortTaxonRows. 
     */
    function sortByRankThenName(a, b, nodeA, nodeB, isInverted) {               //console.log("sortByRankThenName a-[%s] = %O b-[%s] = %O (inverted? %s)", a, nodeA, b, nodeB, isInverted);
        if (!a) { return 0; } //Interaction rows are returned unsorted
        if (focusStorage.curFocus !== "taxa") { return alphaSortVals(a, b); }
        return sortTaxonRows(a, b);
    } 
    /** Sorts each row by taxonomic rank and then alphabetizes by name. */
    function sortTaxonRows(a, b) {
        var lvls = ["Kingdom", "Phylum", "Class", "Order", "Family", "Genus", "Species"];
        var aParts = a.split(" ");
        var aLvl = aParts[0];
        var aName = aParts[1];
        var bParts = b.split(" ");
        var bLvl = bParts[0];
        var bName = bParts[1];
        return  aLvl === "Unspecified" ? -1 : compareRankThenName();  

        function compareRankThenName() {
            return sortByRank() || sortByName();
        }
        function sortByRank() {
            if (lvls.indexOf(aLvl) === -1 || lvls.indexOf(bLvl) === -1) { return alphaSpecies(); }
            return lvls.indexOf(aLvl) === lvls.indexOf(bLvl) ? false :
                lvls.indexOf(aLvl) > lvls.indexOf(bLvl) ? 1 : -1; 
        }
        function sortByName() {
            return aName.toLowerCase() > bName.toLowerCase() ? 1 : -1;
        }
        function alphaSpecies() {                                             
            return lvls.indexOf(aLvl) !== -1 ? 1 :
                lvls.indexOf(bLvl) !== -1 ? -1 :
                a.toLowerCase() > b.toLowerCase() ? 1 : -1;
        }
    }  /* End sortTaxonRows */
    function isNotEditor() {  
        return ['admin', 'editor', 'super'].indexOf(userRole) === -1;
    }
    /** Adds tooltip to Tree cells */
    function innerCellRenderer(params) {      
        var name = params.data.name || null;                                    //console.log("params in cell renderer = %O", params)         
        return name === null ? null : '<span title="'+name+'">'+name+'</span>';
    }
    /** Adds tooltip to Interaction row cells */
    function addToolTipToCells(params) {
        var value = params.value || null;
        return value === null ? null : '<span title="'+value+'">'+value+'</span>';
    }
    /** Adds an edit pencil for all interaction rows bound to an edit method. */
    function addEditPencil(params) {                                            
        var name = params.data.name || null; 
        var id = params.data.id;
        var editPencil = `<img src="../bundles/app/images/eif.pencil.svg" id="edit`+id+`"
            class="grid-edit" title="Edit Interaction `+id+`" alt="Edit Interaction">`;
        $('#search-grid').off('click', '#edit'+id);
        $('#search-grid').on('click', '#edit'+id, eif.crud.editInt.bind(null, id));
        return name === null ? editPencil : null;
    }
    /*================== Row Styling =========================================*/
    /**
     * Adds a css background-color class to interaction record rows. Source-focused 
     * interaction rows are not colored, their name rows are colored instead. 
     */
    function getRowStyleClass(params) {                                         //console.log("getRowStyleClass params = %O... lvl = ", params, params.data.treeLvl);
        if (focusStorage.curFocus === "srcs") { return sourceRowStyleClass(params); }
        if (params.data.name === "") { 
            return getRowColorClass(params.data.treeLvl);
        } 
    }
    /** Adds coloring to source tree-name rows to separate interaction rows visually. */
    function sourceRowStyleClass(params) {  
        if (params.node.expanded === true && params.data.name !== "" && 
            params.data.interactions) { 
            return getRowColorClass(params.data.treeLvl);
        } 
    }
    /**
     * Adds a background-color to cells with open child interaction rows, or cells 
     * with their grouped interactions row displayed - eg, Expanding the tree cell 
     * for Africa will be highlighted, as well as the 'Unspecified Africa Interactions'
     * cell Africa's interaction record rows are still grouped within. 
     */
    function getCellStyleClass(params) {                                        //console.log("getCellStyleClass for row [%s] = %O", params.data.name, params);
        if ((params.node.expanded === true && isOpenRowWithChildInts(params)) || 
            isNameRowforClosedGroupedInts(params)) {                            //console.log("setting style class")
            return getRowColorClass(params.data.treeLvl);
        } 
    }
    function isOpenRowWithChildInts(params) {
        if (params.data.locGroupedInts) { return hasIntsAfterFilters(params); } //console.log('params.data.interactions === true && params.data.name !== ""', params.data.interactions === true && params.data.name !== "")
        return params.data.interactions === true && params.data.name !== "";
    }
    /**
     * Returns true if the location row's child interactions are present in 
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
        var rowColorArray = ['purple', 'green', 'orange', 'blue', 'red', 'turquoise', 'yellow'];
        var styleClass = 'row-' + rowColorArray[treeLvl];                       //console.log("styleClass = ", styleClass);
        return styleClass;
    }
    function getNodeChildDetails(rcrd) {                                        //console.log("rcrd = %O", rcrd)  
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
    function getActiveDefaultGridFilters() {                                    //console.log("getActiveDefaultGridFilters called.")
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
    /*-------------------- Filter By Time Updated ----------------------------*/
    /**
     * The updatedAt filter is enabled when the filter option in opts-col3 is checked. 
     * When checked, the radio options, 'Today' and 'Custom', are enabled. 
     * Note: 'Today' is the default selection. 
     */
    function toggleUpdatedAtFilterRadios() { 
        var filtering = $('#shw-chngd')[0].checked;
        var opac = filtering ? 1 : .3;
        $('input[name=shw-chngd]').attr({'disabled': !filtering});  
        $('#fltr-tdy')[0].checked = true;
        $('label[for=fltr-tdy], label[for=fltr-cstm]').css({'opacity': opac});
        if (!filtering) { disableCalendar(); }
    }
    /** 
     * Filters the interactions in the grid to show only those modified since the 
     * user selected time - either 'Today' or a 'Custom' datetime selected using 
     * the flatpickr calendar.
     */
    function filterInteractionsByTimeUpdated(e) {                               
        var elem = e.currentTarget;  
        if (elem.id === 'fltr-cstm') { showFlatpickrCal(elem); 
        } else { disableCalendar(); }
        filterUpdatedSince('today');        
    }
    /** 
     * Instantiates the flatpickr calendar or shows/opens the existing cal. The 
     * label for the 'Custom' radio is erased and the input enabled.
     */
    function showFlatpickrCal(elem) {  
        cal = cal || initCal(elem); 
        $('.flatpickr-input').show();    
        $('label[for=fltr-cstm]')[0].innerText = ''; 
        $('.flatpickr-input').attr({'disabled': false});
        cal.open();                                                             
        $('#fltr-cal').click(cal.open);
        $('.today').focus();                                                   
    }    
    /**
     * Instantiates the flatpickr calendar, clears the label for the 'Custom' radio,
     * appends the calendar after the radio and returns the flatpickr instance. 
     * An onEnter listener is added that will close the calendar, after date selection.
     */
    function initCal(elem) {
        var calOpts = {
            altInput: true,     maxDate: "today",
            enableTime: true,   plugins: [new confirmDatePlugin({})],
            onReady: function() { this.amPM.textContent = "AM"; }
        };                                                                      
        var input = document.createElement('input');
        input.id = 'fltr-cal';
        $('label[for=fltr-cstm]')[0].innerText = ''; 
        $(elem).after(input);
        return $(input).flatpickr(calOpts);
    }
    /**
     * If there is no value selected, the flatpickr input is hidden and the 'Custom'
     * label readded to the radio option. Otherwise, the input is disabled.
     */
    function disableCalendar() { 
        if (!$('.flatpickr-input').val()) {
            $('.flatpickr-input').hide();    
            $('label[for=fltr-cstm]')[0].innerText = 'Custom';
        } else {
            $('.flatpickr-input').attr({'disabled': true});
        }
    }
    function filterUpdatedSince(since) {
        
    }
    /*-------------------- Unique Values Column Filter -----------------------*/
    /**
     * Class function: 
     * This filter presents all unique values of column to potentially filter on.
     */
    function UniqueValuesFilter() {}
    UniqueValuesFilter.prototype.init = function (params) {                     //console.log("UniqueValuesFilter.prototype.init. params = %O", params)
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
        var colFilterIconName = col + 'ColFilterIcon';                          //console.log("colFilterIconName = %O", colFilterIconName)
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
        this.colDef = colDef;           //console.log("colDef = %O", this.colDef);
        this.rowModel = rowModel;       //console.log("rowModel = %O", this.rowModel);
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
     * tree rows and flattening tree data where possible: currently only taxon.
     * For taxon csv export: The relevant tree columns are shown and also exported. 
     */
    function exportCsvData() {
        var fileName = focusStorage.curFocus === "taxa" ? 
            "Bat Eco-Interaction Records by Taxon.csv" : "Bat Eco-Interaction Records by Location.csv";
        var params = {
            onlySelected: true,
            fileName: fileName,
            // customHeader: "This is a custom header.\n\n",
            // customFooter: "This is a custom footer."
        };
        if (focusStorage.curFocus === "taxa") { showOverlayAndTaxonCols(); }
        gridOptions.columnApi.setColumnsVisible(["name", "intCnt"], false)
        selectRowsForExport();
        gridOptions.api.exportDataAsCsv(params);
        returnGridState();
    }
    function returnGridState() {
        // if (focusStorage.curFocus === "taxa") { hideOverlayAndTaxonCols(); }
        gridOptions.columnApi.setColumnsVisible(["name", "intCnt"], true);
        gridOptions.api.deselectAll();
        hidePopUpMsg();
    }
    function showOverlayAndTaxonCols() {
        showPopUpMsg("Exporting...");
        gridOptions.columnApi.setColumnsVisible(getCurTaxonLvlCols(), true)

    }
    function getCurTaxonLvlCols() { //console.log("taxaByLvl = %O", focusStorage.taxaByLvl)
        var lvls = Object.keys(focusStorage.taxaByLvl);
        return lvls.map(function(lvl){ return 'tree' + lvl; });
    }
    function hideOverlayAndTaxonCols() {
        gridOptions.columnApi.setColumnsVisible(getCurTaxonLvlCols(), false)
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
        //console.log("selected rows = %O", gridOptions.api.getSelectedNodes())   
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
    function showIntroWalkthrough() {
        window.setTimeout(startIntroWalkthrough, 250); 
    }
    function startIntroWalkthrough(startStep){
        if (intro) {                                                            //console.log("intro = %O", intro)
            intro.exit() 
        } else { 
            buildIntro();
        }
        setGridState();
        intro.start();

        function buildIntro() {                                                 //console.log("buildIntro called")
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
                            "creative searches to filter your results that you can explore once the tutorial ends.<br><br>" +
                            "You can exit the tutorial by clicking 'Exit', or anywhere on the greyed background." +
                            "<br><br><center><h2>Use your right arrow key or click 'Next' to start the tutorial.</h2></center>",
                        position: "left",
                    },
                    {
                        /*element: document.querySelector("#filter-opts"),*/
                        element: "#filter-opts",
                        intro: "<h3><center>The interaction records are displayed by either <br>Location, Source, or Taxon.<center></h3> <br> " + 
                            "<b>The serach results will be grouped under the outline tree in the first column of the grid.</b><br><br>" +
                            "The Location view has a Region-Country-Location outline. <br>The Source view groups by either publication or author."+
                            "<br>The Taxon view groups by realm (bat, plant, or arthropod) and taxonomic rank.",
                    },
                    {
                        element:"#sort-opts",
                        intro: "<br><center>This tutorial will continue in the Taxon view with the Plant realm selected.</center><br>",
                        position: "right"
                    },
                    {
                        element: "#search-grid",
                        intro: "<h3><center>The resulting interaction data is displayed here.</center></h3><br><b><center>When first displayed " +
                            "all interactions in the database are available for further filtering or sorting.</center></b>" +
                            "<br>The <b>'Count'</b> column shows the number of interactions attributed to each node in the outline tree." +
                            "<br><br>The <b>'Subject Taxon'</b> column shows the bat taxon that each interaction is attributed to." +
                            "<br><br>The <b>'Object Taxon'</b> column shows the plant or arthropod interacted <i>with</i>." +
                            "<br><br> Columns can be resized by dragging the column header dividers and rearranged by dragging the header iteself." +
                            "<br><br>Note on Taxon names: Species names include the genus in the species name and names at all other levels have the" +
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
                        intro: "<h3><center>There are taxon-specific search filters available.</center></h3><br>" + 
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
                            "<br>The columns are exported in the order they are displayed in the grid.<br><br>For Taxon exports, " +
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
            var focus = focusStorage.curFocus || "taxa";
            $('#search-grid').css("height", "888px");
            $('#show-tips').click(showTips);
            $('#search-focus').change(selectSearchFocus);
            $('#search-focus').val(focus);
        }
    }   /* End startIntroWalkthrough */
    function initSearchTips() { 
        $('#b-overlay-popup').html(searchTips());
        bindEscEvents();
    }
    function showTips() {  //console.log("show tips called.")
        if (!$('#tips-close-bttn').length) { initSearchTips(); }
        // addPopUpStyles();
        $('#b-overlay-popup').addClass("tips-popup");
        $('#b-overlay, #b-overlay-popup').fadeIn(500);
        $('#show-tips').html("Hide Tips");
        $('#show-tips').off("click");
        $('#show-tips').click(hideTips);
    }
    function hideTips() {
        $('#b-overlay').fadeOut(500, removeTips);
        $('#show-tips').html("Search Tips");
        $('#show-tips').off("click");
        $('#show-tips').click(showTips);
        $('#b-overlay-popup').removeClass("tips-popup");
        $('#b-overlay-popup').empty();
    }
    function removeTips() {  //console.log("removeTips called.")
        $('#b-overlay, #b-overlay-popup').css("display", "none");
        $('#b-overlay-popup').removeClass("tips-popup");
    }
    function bindEscEvents() {
        addCloseButton();
        $(document).on('keyup',function(evt) {
            if (evt.keyCode == 27) { hideTips(); }
        });
        $("#b-overlay").click(hideTips);
        $('#show-tips').off("click");
        $('#show-tips').click(hideTips);
        $("#b-overlay-popup").click(function(e) { e.stopPropagation(); });
    }
    function addCloseButton() {
        $("#b-overlay-popup").append(`
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
        `;
    }
/*================= Utility ==================================================*/
    function clearCol2() {
        $('#opts-col2').empty();
    }
    /** 
     * Returns a record detached from the original. If no records are passed, the 
     * focus' records are used.
     */
    function getDetachedRcrd(rcrdKey, rcrds) {                                  
        var orgnlRcrds = rcrds || focusStorage.rcrdsById;                       //console.log("getDetachedRcrd. key = %s, rcrds = %O", rcrdKey, orgnlRcrds);
        try {
           return JSON.parse(JSON.stringify(orgnlRcrds[rcrdKey]));
        }
        catch (e) { 
           console.log("#########-ERROR- getting record [%s] from %O", rcrdKey, rcrds);
        }
    }
    function showPopUpMsg(msg) {                                                //console.log("showPopUpMsg. msg = ", msg)
        var popUpMsg = msg || "Loading...";
        $("#grid-popup").text(popUpMsg);
        $('#grid-popup, #grid-overlay').show();
        fadeGrid();
    }
    function hidePopUpMsg() {
        $('#grid-popup, #grid-overlay').hide();
        showGrid();
    }
    function fadeGrid() {
        $('#borderLayout_eRootPanel, #grid-tools, #grid-opts').fadeTo(100, .3);
    }
    function showGrid() {
        $('#borderLayout_eRootPanel, #grid-tools, #grid-opts').fadeTo(100, 1);
    }
    function finishGridAndUiLoad() {
        hidePopUpMsg();
        hideUnusedColFilterMenus();
    } 
    /**
     * Hides the "tree" column's filter button. Filtering on the group 
     * column only filters the leaf nodes, by design. It is not useful here.
     * Also hides the filter button on the 'edit' and 'count' columns.
     */
    function hideUnusedColFilterMenus() {
        $('.ag-header-cell-menu-button.name').hide();
        $('.ag-header-cell-menu-button.edit').hide();
        $('.ag-header-cell-menu-button.intCnt').hide();
    }
    /** Sorts the all levels of the data tree alphabetically. */
    function sortDataTree(tree) {
        var sortedTree = {};
        var keys = Object.keys(tree).sort();    

        for (var i=0; i<keys.length; i++){ 
            sortedTree[keys[i]] = sortNodeChildren(tree[keys[i]]);
        }
        return sortedTree;
    
        function sortNodeChildren(node) { 
            if (node.children) {  
                node.children = node.children.sort(alphaEntityNames);
                node.children.forEach(sortNodeChildren);
            }
            return node;
        } 
    } /* End sortDataTree */
    /** Alphabetizes array via sort method. */
    function alphaEntityNames(a, b) {                                           //console.log("alphaSrcNames a = %O b = %O", a, b);
        var x = a.displayName.toLowerCase();
        var y = b.displayName.toLowerCase();
        return x<y ? -1 : x>y ? 1 : 0;
    }
    /** Sorts an array of options via sort method. */
    function alphaOptionObjs(a, b) {
        var x = a.text.toLowerCase();
        var y = b.text.toLowerCase();
        return x<y ? -1 : x>y ? 1 : 0;
    }
    /** Sorts an array of options via sort method. */
    function alphaSortVals(a, b) {
        var x = a.toLowerCase();
        var y = b.toLowerCase();
        return x<y ? -1 : x>y ? 1 : 0;
    }
    /** Returns an array with grid-row objects for each interaction record.  */
    function getIntRowData(intRcrdAry, treeLvl) {
        if (intRcrdAry) {
            return intRcrdAry.map(function(intRcrd){                            //console.log("intRcrd = %O", intRcrd);
                return buildIntRowData(intRcrd, treeLvl);
            });
        }
        return [];
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
    function clearPreviousGrid() {                                              //console.log("clearing grid");
        if (gridOptions.api) { gridOptions.api.destroy(); }     
    }
    /**
     * Resets grid state to top focus options: Taxon and source are reset at current
     * domain; locations are reset to the top regions.
     */
    function resetDataGrid() {                                                  //console.log("---reseting grid---")
        var resetMap = { taxa: onTaxonDomainChange, locs: rebuildLocTree, srcs: onSrcDomainChange };
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
        var props = ['curTree', 'selectedVals'];
        props.forEach(function(prop){ delete focusStorage[prop]; });
        focusStorage.selectedOpts = {};
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
    /*-------------AJAX ------------------------------------------------------*/
    function sendAjaxQuery(dataPkg, url, successCb) {                           console.log("Sending Ajax data =%O arguments = %O", dataPkg, arguments)
        $.ajax({
            method: "POST",
            url: url,
            success: successCb || dataSubmitSucess,
            error: ajaxError,
            data: JSON.stringify(dataPkg)
        });
    }
    function dataSubmitSucess(data, textStatus, jqXHR) { 
        console.log("Ajax Success! data = %O, textStatus = %s, jqXHR = %O", data, textStatus, jqXHR);
    }
    function ajaxError(jqXHR, textStatus, errorThrown) {
        console.log("ajaxError = %s - jqXHR:%O", errorThrown, jqXHR);
    }
}());