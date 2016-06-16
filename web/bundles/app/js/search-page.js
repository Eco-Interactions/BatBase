(function(){
	console.log("search scripts running fine. You are beautiful. ag = %O", ag)

	document.addEventListener('DOMContentLoaded', function() {
	    // var gridDiv = document.querySelector('#myGrid');
	    new agGridGlobalFunc('#search-grid', gridOptions);
	});

	var columnDefs = [];

	var rowData = [];

	var gridOptions = {
	    columnDefs: columnDefs,
	    rowData: rowData
	};













}());