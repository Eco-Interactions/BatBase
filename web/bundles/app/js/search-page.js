(function(){  console.log("Anything you can do, you can do awesome...");
	/**
	 * openRow = The identifier for the row in datagrid to be expanded on grid-load
	 */
	var gridDiv, openRow, recievedData, dataSet, rowData = [], columnDefs = [];
    var levels = ['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'];
	var gridOptions = {
	    columnDefs: getColumnDefs(),
	    getNodeChildDetails: getNodeChildDetails,
	    getRowClass: getStyleClass,
	    onRowGroupOpened: softRefresh,
        enableColResize: true,
        enableSorting: true,
        unSortIcon: true,
        enableFilter: true,
        rowHeight: 26,
		isExternalFilterPresent: isExternalFilterPresent, 
		doesExternalFilterPass: doesExternalFilterPass,
	    // debug: true,
	};

	document.addEventListener('DOMContentLoaded', onDOMContentLoaded); 

	function onDOMContentLoaded () {
		$("select[name='search-focus']").change(selectSearchFocus);

		selectSearchFocus();
	}
	function loadGrid(gridOpts) {   console.log("final rows = %O", rowData);
		var gridOptObj = gridOpts || gridOptions;
		gridOptObj.rowData = rowData;

	    gridDiv = document.querySelector('#search-grid');
	    new agGrid.Grid(gridDiv, gridOptObj);
	}

	function selectSearchFocus(e) {
	    if ( $('#search-focus').val() == 'taxa' ) { getDomains();  }
	}
/*------------------Taxa Search Methods---------------------------------------*/
	function getDomains() {
		var dataPkg = {
			repo: 'domain',
			repoQ: 'findAll',
			props: ['slug', 'name']		//Idx0 = findOneBy
		};
		sendAjaxQuery(dataPkg, 'ajax/search', showTaxonSearchMethods);
	}
	function showTaxonSearchMethods(data) {  console.log("domain data recieved. %O", data);
		buildTaxaSearchHtml(data);
		$("input[name='searchMethod']").change(onTaxaSearchMethodChange);
		getAllTaxaRcrds();

		initSearchState();
	}
	function initSearchState() {
		$('input[name="searchMethod"][value=browseSearch]').prop('checked', true);
		$('#sel-domain').val('arthropod');
		onTaxaSearchMethodChange();
	}
		/** Ajax to get all interaction rcrds for passed domain. */
	function getAllTaxaRcrds() {
		var params = {
			props: ['displayName', 'slug' ],
			roles: ['ObjectRoles', 'SubjectRoles']
		};
		// openRow = slug;		//Row in datagrid will be expanded on load
		sendAjaxQuery(params, 'ajax/search/taxa', storeTaxaRcrds);
	}
	function storeTaxaRcrds(data) {  console.log("taxaRcrds recieved. %O", data);
		recievedData = data.results;
	}
	/**
	 * Builds the HTML for the search methods available for the taxa-focused search,
	 * both text search and browsing through the taxa names by level.
	 */
	function buildTaxaSearchHtml(data) {  console.log("buildTaxaSearchHtml called. ");
		var txtSearchElems = buildTxtSearchElems();
		var browseElems = buildBrowseElems();
		var domainOpts = getDomainOpts(data.results); 		//console.log("domainOpts = %O", domainOpts);
		$(browseElems).append(buildSelectElem(domainOpts, { class: 'opts-box', id: 'sel-domain' }));

		$('#focus-top-opts').append([txtSearchElems, browseElems]);
		
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
	function onTaxaSearchMethodChange(e) { // console.log("change fired");
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
    	// if ( $('#sel-domain').val() === 'bat' ) { getInteractions('chiroptera', 'bat', ['SubjectRoles']); console.log("bats are selected") }  //showBatLevels();
    	// if ( $('#sel-domain').val() === 'plant' ) { getInteractions('plantae', 'plant', ['ObjectRoles']); console.log("plants are selected") }  //showBatLevels();
    	// if ( $('#sel-domain').val() === 'arthropod' ) { getInteractions('arthropoda', 'arthropod', ['ObjectRoles']); console.log("bugs are selected") }  //showBatLevels();
	}
	/** Ajax to get all interaction rcrds for passed domain. */
	function getInteractions(slug, domainId, roles) {
		var params = {
			repo: 'domain',
			id: domainId,
			props: ['displayName', 'slug' ],
			roles: roles
		};
		openRow = slug;		//Row in datagrid will be expanded on load
		sendAjaxQuery(params, 'ajax/search/taxa', buildSearchOptsAndGrid);
	}
	/**
	 * Separates interaction records by level @separateByLevel(); builds select dropdowns
	 * for each level populated with the taxonymns at that level @buildSelects(); 
	 * clears any previous search data @clearPreviousSearch(); appends selects; 
	 * builds taxonomic heirarchy of taxa @buildTaxaTree(); 
	 * transforms data into grid format and loads data grid @loadTaxaGrid().
	 */
	function buildSearchOptsAndGrid(data) {  	console.log("Here are your interactions Grand Master... Data = %O", data);
		var domain = data.domain; 
		recievedData = data.results;
		dataSet = separateByLevel(data.results);   console.log("dataSet = %O", dataSet);
		var levels = Object.keys(dataSet);
		var domainLvl = levels.shift();
		var lvlOptsObj = buildLvlOptions(dataSet);

		clearPreviousGrid();
		addClearlevelSelectsBttn();
		setLevelSelects();
		loadTaxaGrid( buildTaxaTree(dataSet[domainLvl], data['results']), domain );

		function setLevelSelects() { console.log("-----Clearing Level Filters-------")
			loadLevelSelectElems(lvlOptsObj, levels);
		}
		function addClearlevelSelectsBttn() {
			var button = createElem('input', {type: 'button', value: 'Clear Level Filters'});
			$('#opts-row1').append(button);
			$(button).click(setLevelSelects);
		}
	}
	function loadLevelSelectElems(levelOptsObj, lvls, selected) {
		var elems = buildSelects(levelOptsObj, lvls);
		$('#opts-row2').html('');		// Clear previous search's options
		$('#opts-row2').append(elems);
		setSelectedVals(selected);
	}
	function setSelectedVals(selected) {
		for (var lvl in selected) {
			var selId = '#sel' + lvl;
			$(selId).val(selected[lvl]);
		}
	}
	function clearPreviousGrid() {
		if (gridOptions.api) { gridOptions.api.destroy(); }		// Clear previous grid
	}
	/**
	 * Returns an object with taxa records keyed by their display name and organized 
	 * under their respective levels.
	 */
	function separateByLevel(rcrds) {
		var separated = {};
		for (var taxon in rcrds){
			if (separated[rcrds[taxon].level] === undefined) { separated[rcrds[taxon].level] = {}; }
			separated[rcrds[taxon].level][rcrds[taxon].displayName] = rcrds[taxon];
		}
		return separated;
	} /* End separateByLevel */
	function buildLvlOptions(rcrds) {  console.log("lvlOptsBuild rcrds = %O", rcrds);
		var optsObj = {};
		for (var lvl in rcrds) {
			var taxaNames = Object.keys(rcrds[lvl]).sort(); //console.log("taxaNames = %O", taxaNames);
			optsObj[lvl] = buildTaxaOptions(taxaNames);
			if (taxaNames.length === 0 || taxaNames.length === 1) { 
				optsObj[lvl].push({value: 'empty', text: ' '});
			} else if (taxaNames.length > 1) {
				optsObj[lvl].unshift({value: 'all', text: '- All -'});
			}
		}
		return optsObj;
	}
	function buildTaxaOptions(taxaNames) {
		return taxaNames.map(function(taxaKey){
			return {
				value: taxaKey,
				text: taxaKey
			};
		});
	}
	function buildSelects(lvlOpts, levelAry) {
		var selElems = [];
		levelAry.forEach(function(level){
			var text = level + ': ';
			var id = 'sel' + level;
			selElems.push(createElem('span', { text: text }));
			selElems.push(buildSelectElem(lvlOpts[level], { class: "opts-box", id: id }));
		});

		return selElems;
	}
	/**
	 * Returns a taxonomic hierarchy of the interaction data.
	 * @param  {object} toplvltaxa Taxonomic hierarchy starting with the domain taxa.
	 * @param  {object} taxaObj    Interaction records returned from the server.
	 */
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
	} /* End buildTaxaTree */
/*------------------AG Grid Methods-------------------------------------------*/
	function softRefresh() { gridOptions.api.refreshView(); }
	function getColumnDefs() {  
		return [{headerName: "Taxa Tree", field: "name", width: 300, cellRenderer: 'group', 
					cellRendererParams: { innerRenderer: innerCellRenderer, padding: 20 } },		//cellClassRules: getStyleClass
			    {headerName: "Subject Taxon", field: "subject", width: 175,},
			    {headerName: "Object Taxon", field: "object", width: 150 },
			    {headerName: "Interaction Type", field: "interactionType", width: 125,},
			    {headerName: "Tags", field: "tags", width: 100,},
			    {headerName: "Habitat Type", field: "habitatType", width: 125,},
			    {headerName: "Country", field: "country", width: 100,},
			    {headerName: "Location Description", field: "location", width: 300,},
			    {headerName: "Citation", field: "citation", width: 300,},
			    {headerName: "Note", field: "note", width: 300,} ];
	}
	function innerCellRenderer(params) { // console.log("params in cell renderer = %O", params)
		return params.data.name || null;
	}
	function getStyleClass(params) { // console.log("row params = %O", params);
		var lvlClassMap = {
			'Kingdom': 'row-kingdom',	'Phylum': 'row-phylum',
			'Class': 'row-class',		'Order': 'row-order',
			'Family': 'row-family',		'Genus': 'row-genus',
			'Species': 'row-species'
		};
		if (params.node.data.isParent === false || 
		  ( params.node.expanded === true && params.data.interactions === true ) ||
			params.node.data.domainInts === true ) {
			return lvlClassMap[params.data.taxaLvl];
		} 
	}
	function getNodeChildDetails(rcrd) {	//	console.log("rcrd = %O", rcrd)	
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
	function isExternalFilterPresent() { //console.log("isExternalFilterPresent called")
		console.log("isTaxonymSelected('filter')", isTaxonymSelected('filter'))
		return isTaxonymSelected('filter');
		// return true;
	}
	function doesExternalFilterPass(node) {	// console.log("externally filtering. node = %O", node);  
        // var filterSelections = {};
        // levels.forEach(function(lvl){
        // 	var selId = '#sel' + lvl;
        // 	if ($(selId).val() !== 'all' || $(selId).val() !== undefined) { 
        // 		filterSelections[lvl] = $(selId).val();
        // 	} 
        // });
        // populateSelects(filterSelections);
	 	return true; 
	}
	function isTaxonymSelected(filterCheck) {
        var filterSelections = {};  console.log("filterSelections = %O", filterSelections)
        var selected = false;

        levels.forEach(function(lvl){
        	var selId = '#sel' + lvl;
        	if ($(selId).val() !== undefined && $(selId).val() !== 'all' && $(selId).val() !== 'empty') { 
        		filterSelections[lvl] = $(selId).val();
        		selected = true;
        	} 
        });
        return filterCheck ? (selected === false ? false : true) : (selected === false ? false : filterSelections); 
	}
	/*------------------Level Select Methods----------------------------------*/
	function syncLevelSelects() {
		var selected = isTaxonymSelected();
		if (selected) {
			for (var lvl in selected) {  console.log("lvl = ", lvl);
				var taxonym = selected[lvl];		console.log("taxonym = ", taxonym); 
				selected[lvl] = dataSet[lvl][taxonym];
			}
			repopulateDropDowns(selected);
		}
	}
	function repopulateDropDowns(selected) {
		var revLevels = levels.map(function(lvl){return lvl}).reverse(); //console.log("revLevels = %O", revLevels);
		var relatedTaxaOpts = {};
		var selectedVals = {}; console.log("selectedVals = %O", selectedVals)
		var lvls = Object.keys(dataSet);
		lvls.shift();
		
		buildRelatedTaxaOptsObj();
		
		var lvlOptsObj = buildLvlOptions(relatedTaxaOpts);
		loadLevelSelectElems(lvlOptsObj, lvls, selectedVals)

		function buildRelatedTaxaOptsObj() {
			revLevels.some(function(lvl, idx) {
				if (selected[lvl]) {
					buildTaxaOptsObj(selected[lvl], lvl, idx);
					return true;
				}
			});  console.log("relatedTaxaOpts = %O", relatedTaxaOpts);

		}
		function buildTaxaOptsObj(selected, lvl, idx) {
			relatedTaxaOpts[lvl] = {};
			relatedTaxaOpts[lvl][selected.displayName] = selected;
			selectedVals[lvl] = selected.displayName;

			if (selected.children) { getChildren(selected.children); }
			getParents(selected.parentTaxon);
			addEmptyLvlOpts();
		}
		function getChildren(directChildren) {
			directChildren.forEach(function(grandChild){
				if (directChildren.length === 1) { selectedVals[grandChild.level] = grandChild.displayName; }				
				if (relatedTaxaOpts[grandChild.level] === undefined) { relatedTaxaOpts[grandChild.level] = {}; }
				relatedTaxaOpts[grandChild.level][grandChild.displayName] = grandChild;
				if (grandChild.children) { getChildren(grandChild.children); }
			});
		}
		function getParents(parentId) {
			if (parentId === 1 || parentId === null) {return} 
			if (parentId == Object.keys(recievedData)[0]) {return}  //console.log("first key ")
			var parent = recievedData[parentId];
			if (relatedTaxaOpts[parent.level] === undefined) { relatedTaxaOpts[parent.level] = {}; }
			relatedTaxaOpts[parent.level][parent.displayName] = parent;
			selectedVals[parent.level] = parent.displayName;
			if (parent.parentTaxon) { getParents(parent.parentTaxon); }
		}
		function addEmptyLvlOpts() {  console.log("dataSet = %O", dataSet)
			lvls.forEach(function(lvl) {
				if (relatedTaxaOpts[lvl] === undefined) { relatedTaxaOpts[lvl] = {}; }
			});
		}
	} /* End repopulateDropDowns */
	/*---------Data Conversion------------------------------*/
	function loadTaxaGrid(taxaTree, domain) {
		var topTaxaRows = [];
		var finalRowData = [];
		for (var taxon in taxaTree) {
			topTaxaRows.push( getRowData(taxaTree[taxon], domain) );
		}
		topTaxaRows.forEach(function(taxaRowAry){ $.merge(finalRowData, taxaRowAry);	}); 

		rowData = finalRowData; // console.log("rowData = %O", rowData);

		loadGrid();
	}
	function getRowData(taxon, domain) { 
		var isParent = taxon.children !== null; 
		var rows = [];
		rows.push({
			name: taxon.displayName,
			isParent: taxon.interactions !== null || taxon.children !== null,
			open: taxon.slug === openRow,
			children: getRowDataForChildren(taxon, domain),
			taxaLvl: taxon.level,
			interactions: taxon.interactions[Object.keys(taxon.interactions)[0]].length > 0 ,          
		});
		
		return rows;
		
	} /* End getRowData */
	function getRowDataForChildren(parent, domain) {
		var chldData = [];
		var tempChldArys = [];
		var domainMap = {
			Bat: 'chiroptera',
			Plant: 'plantae',
			Arthropod: 'arthropoda'
		};  

		if ( parent.slug === domainMap[domain] ) { getDomainInteractions(parent, domain);   
		} else { tempChldArys.push(getTaxaInteractions(parent)); }

		for (var childKey in parent.children) {
			if (parent.children !== null) { tempChldArys.push( getRowData(parent.children[childKey]) )}
		}

		tempChldArys.forEach(function(ary){	$.merge(chldData, ary);	});		

		return chldData;
		/** Groups interactions attributed directly to a domain. */
		function getDomainInteractions(taxon, domain) {
			var intAry = taxon.interactions[Object.keys(taxon.interactions)[0]]; console.log("intAry = %O", intAry) 
			if (intAry.length > 0) { 
				chldData.push({
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
			if ( taxon.interactions[role].length >= 1 ) {
				taxon.interactions[role].forEach(function(intRcrd){
					ints.push( getIntData(intRcrd, taxaLvl) );
				});
			}
		}
		return ints;
	}
	function getIntData(intRcrd, taxaLvl) {
		var intRowData = { isParent: false,
						taxaLvl: taxaLvl };

		for (var field in intRcrd) {
			if ( field === 'id' ) { continue; }
			if ( field === 'tags' ) { intRowData[field] = getTags(intRcrd[[field]]); }
			if ( field === "subject" || field === "object" ) {
				intRowData[field] = getTaxonName(intRcrd[field]);	
			} else {
				intRowData[field] = intRcrd[field];
			}
		}   // console.log("getIntData called. intRowData = %O", intRowData);
		return intRowData;
	}
	function getTags(tagAry) {
		var tagStrAry = [];
		tagAry.forEach(function(tagStr) {
			tagStrAry.push(tagStr);
		});
		return tagStrAry.join(', ');
	}
	function getTaxonName(taxaData) { // console.log("taxaData = %O", taxaData)
		return taxaData.level == "Species" ? 
				taxaData.name : 
				taxaData.level + ' ' + taxaData.name;
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
	/* --------------------- General Helpers ------------------------------*/
	function ucfirst(string) { 
		return string.charAt(0).toUpperCase() + string.slice(1); 
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