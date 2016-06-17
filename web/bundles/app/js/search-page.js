(function(){
	console.log("search scripts running fine. You are beautiful. ag = %O", ag)

	document.addEventListener('DOMContentLoaded', onDOMContentLoaded); 

	var columnDefs = [];

	var rowData = [];

	var gridOptions = {
	    columnDefs: columnDefs,
	    rowData: rowData
	};

	function onDOMContentLoaded () {
		$("select[name='search-focus']").change(selectSearchFocus);

	    // var gridDiv = document.querySelector('#myGrid');
	    new agGridGlobalFunc('#search-grid', gridOptions);

		selectSearchFocus();
	}

	function selectSearchFocus(e) {
	    if ( $('#search-focus').val() == 'taxa' ) { showTaxonSearchMethods(); }
	}
	function showTaxonSearchMethods() {
		$('#focus-top-opts').html(taxonFocusHtml());
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
    	if ( $('#sel-domain').val() == 'bats' ) { showBatLevels(); console.log("bats is selected") }  //showBatLevels();
	}
	function showBatLevels() {
		var searchParams = {
			focus: 'Taxon',
			query: {
				domain: 'bats'
			}
		};
		$('#opts-row2').html(batLevelsHtml());

		sendAjaxQuery(searchParams, 'ajax/search/taxa');
	}
	// function getResults(searchParams) {
	// 	return sendAjaxQuery(searchParams);
	// }
	function sendAjaxQuery(dataPkg, url) {  console.log("Sending Ajax data =%O", dataPkg)
		$.ajax({
			method: "POST",
			url: url || 'ajax/search',
			success: dataSubmitSucess,
			error: ajaxError,
			data: JSON.stringify(dataPkg)
		});
	}
	function batLevelsHtml() {
		return `<span>Family: </span>
				<select id="family" class="opts-box"></select>
				<span>Genus: </span>
				<select id="genus" class="opts-box"></select>
				<span>Species: </span>
				<select id="species" class="opts-box"></select>`;
	}
	function taxonFocusHtml() {
		return `<label>
                <input type="radio" name="searchMethod" value="textSearch">
                Text Search 
                <input type="text" name="textEntry" class="opts-box" placeholder="Enter Taxon Name">
            </label>
            <label>
                <input type="radio" name="searchMethod" value="browseSearch" checked>
                Browse Taxa Names
                <select id="sel-domain" class="opts-box" disabled>
                    <option value="bats" selected>Bats</option>
                    <option value="plants">Plants</option>
                    <option value="bugs">Arthropods</option>
                </select>
            </label>`;
	}
/*-----------------AJAX Callbacks---------------------------------------------*/
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