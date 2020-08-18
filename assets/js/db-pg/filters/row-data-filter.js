/**
 * Filters the table rowData by any active external filters: name text, date/time
 * a record was published/updated, and object realms in Taxon->Bat view.
 *
 * 	Exports:
 * 		filterRowData
 *
 * 	TOC
 *
 */

let filters, rows;
/**
 * These are handled before table rebuild starts:
 *   Level combos, Region and Country combos
 */
export function getFilteredRowData(f, rowData) {					/*dbug-log*/console.log('filterRowData filters = %O, rowData = %O', f, rowData);
	if (!Object.keys(f).length) { return rowData; }
	filters = f,
    rows = rowData.map(r => Object.assign({}, r));
    handleTreeFilters();
    handleInteractionFilters();
    return rows;
}
/* ------------------------- TREE FILTERS ----------------------------------- */
function handleTreeFilters() {
	filterOnTopTreeLevel();
	filterOnAllTreeLevels();
}
function filterOnTopTreeLevel() {
	const filterFuncs = {
		combo: { 'Publication Type': ifRowFromPubType }
	};
	rows = filterTreeRows(filterFuncs, 1);  									//console.log('rows = %O', rows)
}
function filterOnAllTreeLevels() {
	const filterFuncs = {
		name: ifRowNameContainsText
	};
	rows = filterTreeRows(filterFuncs);  										//console.log('rows = %O', rows)
}
function filterTreeRows(filterFuncs, depth = null) {
	return 	rows.map(row => getRowsThatPassAllTreeFilters(row, filterFuncs, depth))
		.filter(r=>r);
}
function getRowsThatPassAllTreeFilters(row, filterFuncs, depth) {
	return getRowIfAllFiltersPass(row);
	/** @return row */
	function getRowIfAllFiltersPass(row) {
		if (!row.name) { return row; }
		const passesTreeFilter = ifRowPassesFilters(row, filterFuncs);  		//console.log('getRowIfAllFiltersPass. passesTreeFilter %s, row = %O', passesTreeFilter, row)
		if (depth === 1) { return passesTreeFilter ? row : null; }
		row.children = filterRowChildren(row, passesTreeFilter);
		return passesTreeFilter || row.children.length ? row : null;
	}
	function filterRowChildren(row, passesTreeFilter) {
		if (passesTreeFilter) { return row.children.map(getRowIfAllFiltersPass).filter(r=>r); }
		return !row.children.length || !row.children[0].name ? [] :
			removeDirectIntsAndFilterChildren(row);
	}
	function removeDirectIntsAndFilterChildren(row) {  						    //console.log('removeDirectIntsAndFilterChildren row = %O', row)
		if (row.children[0].name.includes('Unspecified')) { row.children.shift(); }
		return row.children.map(getRowIfAllFiltersPass).filter(r=>r);
	}
}
/* --------------------- INTERACTION FILTERS -------------------------------- */
function handleInteractionFilters() {
	// body...
}

	// return rows.map(getRowsThatPassAllFilters).filter(r=>r);

// }
// function ifInteractionFiltersPass(row, filters) {
// 	const rowPasses = Object.keys(filters).every(ifRowPassesFilter);
// 	return rowPasses ? row : null;

// 	function ifRowPassesFilter(filterType) {
// 		const map = {
// 			// 'date':
// 			// 'objRealm':
// 			// 'intList':
// 		};
// 		return map[filterType] ? map[filterType](row, filters[filterType]) : true;
// 	}
// }
/* =========================== FILTERS ====================================== */
/** @return bool */
function ifRowPassesFilters(row, filterFuncs) {						/*dbug-log*///console.log('ifRowPassesFilters row = %O, filters = %O', row, filterFuncs);
 	return Object.keys(filters).every(ifRowPassesFilter);

	function ifRowPassesFilter(type) {
		return filterFuncs[type] ? applyFilter(type) : true;
	}
	function applyFilter(type) {
		if (type === 'combo') { return ifRowContainsComboValue(row, filterFuncs[type]); }
		return filterFuncs[type](row, filters[type]);
	}
}
/* ------------- COMBO FILTERS ------------------ */
function ifRowContainsComboValue(row, comboFuncs) {
	return Object.keys(comboFuncs).every(type => {
		return comboFuncs[type] ? comboFuncs[type](row, filters.combo[type].value) : true;
	});
}
/* --------------------------- NAME TEXT ------------------------------------ */
/* If row fails, all direct interaction rows are removed. */
function ifRowNameContainsText(row, text) {                         /*dbug-log*///console.log('ifRowName[%s]ContainsText [%s]', row.name, text);
    return row.name.toLowerCase().includes(text.replace(/"/g,""));
}
/* ------------------------- PUBLICATION TYPE ------------------------------- */
function ifRowFromPubType(row, pubTypeId) {  						/*dbug-log*///console.log('ifRowFromPubType [%s] %O', pubTypeId, row);
	return row.type == pubTypeId;
}
/* --------------------------- NAME TEXT ------------------------------------ */
/* --------------------------- NAME TEXT ------------------------------------ */
/* ----------------------------- SHARED ------------------------------------- */
