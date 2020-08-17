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

let filters;
/**
 * Text, date, realm, intSet?
 *
 * These are handled before table rebuild starts:
 *   Level combos
 */
export function getFilteredRowData(filters, rowData) {							console.log('filterRowData filters = %O, rowData = %O', filters, rowData);
	if (!Object.keys(filters).length) { return rowData; }
    const rows = rowData.map(r => Object.assign({}, r));
	return rows.map(getRowsThatPassAllFilters).filter(r=>r);

	function getRowsThatPassAllFilters(row) {
		if (!row.name) { return ifInteractionFiltersPass(row, filters); }
		const passesTreeFilter = ifTreeFiltersPass(row, filters);  				console.log('passesTreeFilter %s, row = %O', passesTreeFilter, row)
		row.children = filterRowChildren(row, passesTreeFilter);
		return passesTreeFilter || row.children.length ? row : false;
	}
	function filterRowChildren(row, passesTreeFilter) {
		if (passesTreeFilter) { return row.children.map(getRowsThatPassAllFilters); }
		return !row.children[0].name ? [] : removeDirectIntsAndFilterChildren(row);
	}
	function removeDirectIntsAndFilterChildren(row) {  							console.log('removeDirectIntsAndFilterChildren row = %O', row)
		if (row.children[0].name.includes('Unspecified')) { row.children.shift(); }
		return row.children.map(getRowsThatPassAllFilters).filter(r=>r);
	}
}
/* ---------------------- INTERACTION FILTERS ------------------------------- */
function ifInteractionFiltersPass(row, filters) {
	const rowPasses = Object.keys(filters).every(ifRowPassesFilter);
	return rowPasses ? row : null;

	function ifRowPassesFilter(filterType) {
		const map = {
			// 'date':
			// 'pubType':
			// 'objRealm':
			// 'intList':
		};
		return map[filterType] ? map[filterType](row, filters[filterType]) : true;
	}

}
/* ------------------------- TREE FILTERS ----------------------------------- */
function ifTreeFiltersPass(row, filters) {
	return Object.keys(filters).every(ifRowPassesFilter);

	function ifRowPassesFilter(filterType) {
		const map = {
			'name': ifRowNameContainsText
		};
		return map[filterType] ? map[filterType](row, filters[filterType]) : true;
	}
}
/* If row fails, all direct interaction rows are removed. */
function ifRowNameContainsText(row, text) {                         /*dbug-log*/console.log('ifRowName[%s]ContainsText [%s]', row.name, text);
    return row.name.toLowerCase().includes(text.replace(/"/g,""));
}


/* --------------------------- NAME TEXT ------------------------------------ */
/* --------------------------- NAME TEXT ------------------------------------ */
/* --------------------------- NAME TEXT ------------------------------------ */
/* --------------------------- NAME TEXT ------------------------------------ */
/* ----------------------------- SHARED ------------------------------------- */
