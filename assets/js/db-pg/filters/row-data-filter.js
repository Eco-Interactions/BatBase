/**
 * Filters the table rowData by any active external filters: name text, date/time
 * a record was published/updated, and object realms in Taxon->Bat view.
 *
 * 	Exports:
 * 		filterRowData
 *
 * 	TOC
 *  	TREE FILTERS
 *  	INTERACTION FILTERS
 *  	FILTERS
 *  		NAME TEXT
 *  		PUBLICATION TYPE
 *  		DATE/TIME
 */
import { _u } from '../db-main.js';
let filters, rows;
/**
 * These are handled before table rebuild starts:
 *   Level combos, Region and Country combos
 */
export function getFilteredRowData(f, rowData) {					/*dbug-log*///console.log('getFilteredRowData filters = %O, rowData = %O', f, rowData);
	if (!Object.keys(f).length) { return rowData; }
	filters = _u('snapshot', [f]);
    rows = _u('snapshot', [rowData]);
    handleTreeFilters();
    handleInteractionFilters();										/*dbug-log*///console.log('filteredRowData = %O', rows)
    return rows;
}
function ifActiveFiltersInGroup(filterFuncs, filterObj = filters) {
	return !!Object.keys(filterFuncs).find(ifFilterTypeActive);

	function ifFilterTypeActive(type) {
		if (type !== 'combo') { return filterObj[type]; }
		return ifActiveFiltersInGroup(filterFuncs.combo, filters.combo);
	}
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
	if (!ifActiveFiltersInGroup(filterFuncs)) { return; }
	rows = filterTreeRows(filterFuncs, 1);  									//console.log('rows = %O', rows)
}
function filterOnAllTreeLevels() {
	const filterFuncs = {
		name: ifRowNameContainsText
	};
	if (!ifActiveFiltersInGroup(filterFuncs)) { return; }
	rows = filterTreeRows(filterFuncs);  										//console.log('rows = %O', rows)
}
function filterTreeRows(filterFuncs) {
	return 	rows.map(row => getRowsThatPassAllTreeFilters(row, filterFuncs))
		.filter(r=>r);
}
function getRowsThatPassAllTreeFilters(row, filterFuncs) {
	return getRowIfAllFiltersPass(row);
	/** @return row */
	function getRowIfAllFiltersPass(row) {
		if (!row.name) { return row; }
		let rowPasses = ifRowPassesFilters(row, filterFuncs);       /*dbug-log*///console.log('getRowIfAllFiltersPass. rowPasses %s, row = %O', rowPasses, row)
		if (rowPasses) { return row; }
		row.children = filterRowChildren(row);
		return row.children.length ? row : null;
	}
	function filterRowChildren(row) {								/*dbug-log*///console.log('filterRowChildren row = %O', row)
		return !row.children.length || !row.children[0].name ? [] :
			removeDirectIntsAndFilterChildren(row);
	}
	function removeDirectIntsAndFilterChildren(row) {				/*dbug-log*///console.log('removeDirectIntsAndFilterChildren row = %O', row)
		if (row.children[0].name.includes('Unspecified')) { row.children.shift(); }
		return row.children.map(getRowIfAllFiltersPass).filter(r=>r);
	}
}
/* --------------------- INTERACTION FILTERS -------------------------------- */
function handleInteractionFilters() {
	const filterFuncs = {
		date: 		ifRowAfterDate,
		combo: { 'Object Realm': ifIntWithRealm }
	};
	if (!ifActiveFiltersInGroup(filterFuncs)) { return; }
	handlePersistedDateFilterObj();
	rows = rows.map(getRowsThatPassInteractionFilters).filter(r=>r);

	function getRowsThatPassInteractionFilters(row) {
		if (!row.name) { return ifPassesReturnRow(row); }
		row.children = filterRowChildren(row);
		return row.children.length ? row : null;
	}
	function filterRowChildren(row) {
		return row.children.map(getRowsThatPassInteractionFilters).filter(r=>r);
	}
	function ifPassesReturnRow(row) {
		return ifRowPassesFilters(row, filterFuncs) ? row : false;
	}
}
function handlePersistedDateFilterObj() {
	if (!filters.date) { return; }
	filters.date.time = new Date(filters.date.time).getTime();
}
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
	return Object.keys(comboFuncs).every(type => {  							//console.log('type [%s] funcs = %O row = %O', type, comboFuncs, row);
		const filterVal = filters.combo[type].value || filters.combo[type];
		return comboFuncs[type] ? comboFuncs[type](row, filterVal) : true;
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
/* --------------------------- DATE/TIME ------------------------------------ */
function ifRowAfterDate(row, dateObj) {
    const date = dateObj.type === 'cited' ? row.year + '-12-31' : row.updatedAt;
    const rowTime = getRowTime(date); 								/*dbug-log*///console.log("row [%O] rowTime = %O >= since = %O [%s]", row, rowTime, dateObj.time, rowTime >= dateObj.time);
    return rowTime >= dateObj.time;

    function getRowTime(date) {
        const rowTime = new Date(date)
        rowTime.setHours(rowTime.getHours()+8);     //Resets from PCT to GMT
        return rowTime.getTime();
    }
}
/* ------------------------ OBJECT REALM ------------------------------------ */
function ifIntWithRealm(row, realmIds) {  							/*dbug-log*///console.log('ifIntWithRealms = %O, row = %O', realmIds, row);
	return realmIds.indexOf(row.objRealm) !== -1;
}
