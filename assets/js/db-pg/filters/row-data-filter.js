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


/**
 * Text, date, realm,
 *
 * These are handled before table rebuild starts:
 *   Level combos
 */
export function getFilteredRowData(filters, rowData) {							console.log('filterRowData filters = %O, rowData = %O', filters, rowData);
	return rowData;
}