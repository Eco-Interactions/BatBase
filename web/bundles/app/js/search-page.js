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
    	if ( $('#sel-domain').val() == 'bats' ) { console.log("bats is selected") }  //showBatLevels();
	}
	function showBatLevels() {
		$('#focus-top-opts').html(batLevelsHtml());
	}
	function batLevelsHtml() {
		return '';
	}
	function taxonFocusHtml() {
		return `<label>
                <input type="radio" name="searchMethod" value="textSearch" checked>
                Text Search 
                <input type="text" name="textEntry" class="opts-box" placeholder="Enter Taxon Name">
            </label>
            <label>
                <input type="radio" name="searchMethod" value="browseSearch">
                Browse Taxa Names
                <select id="sel-domain" class="opts-box" disabled>
                    <option value="bats" selected>Bats</option>
                    <option value="plants">Plants</option>
                    <option value="bugs">Arthropods</option>
                </select>
            </label>`;
	}

}());