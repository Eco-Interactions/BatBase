/**
 * Filters the table rowData by any active external filters: name text, date/time
 * a record was published/updated, and Object Groups in Taxon->Bat view.
 *
 * 	Exports:
 * 		filterRowData
 *
 * 	TOC
 * 		GET ACTIVE FILTERS
 *  	TREE FILTERS
 *  	INTERACTION FILTERS
 *  	FILTERS
 *  		NAME TEXT
 *  		PUBLICATION TYPE
 *  		DATE/TIME
 *  		OBJECT GROUP
 *  		USER INTERACTION-LIST
 */
import { _u } from '~util';
let filters, rows;
/**
 * These filters directly modify the rowData after the table is built based on
 * the tree root row, all tree rows, or on interactions.
 */
const filterFuncs = {
	root: {
		combo: 	{
			'Publication Type': ifRowFromPubType
		}
	},
	tree: {
		name: 	ifRowNameContainsText
	},
	int: {
		combo: 	{ 'Object Group': ifIntWithGroup },
		date: 	ifRowAfterDate,
		list: 	ifIntInUserList
	}
};

/**
 * These are handled before table rebuild starts:
 *   Rank combos, Region and Country combos
 */
export function getFilteredRowData(f, rowData) {					/*dbug-log*///console.log('getFilteredRowData filters = %O, rowData = %O', f, rowData);
	if (!Object.keys(f).length) { return rowData; }
	filters = _u('snapshot', [f]);
    rows = _u('snapshot', [rowData]);
    handleTreeFilters();
    handleInteractionFilters();										/*dbug-log*///console.log('filteredRowData = %O', rows)
    return rows;
}
/* ---------------------- GET ACTIVE FILTERS -------------------------------- */
function getFuncsForActiveFiltersInGroup(group, filterObj = filters) {
	const funcObj = typeof group === 'string' ? filterFuncs[group] : group;
	const active = {};
	Object.keys(funcObj).forEach(addActiveFilters);
	return Object.keys(active).length ? active : false;

	function addActiveFilters(type) {  											//console.log('addActiveFilters type = [%s] funcs = %O filters = %O', type, funcObj, filterObj);
		if (type !== 'combo') { return addFilterFuncIfActive(type, filterObj[type]); }
		const comboFilters = getFuncsForActiveFiltersInGroup(funcObj.combo, filters.combo);
		if (!comboFilters) { return }
		active.combo = comboFilters;
	}
	function addFilterFuncIfActive(type, fData) {   							//console.log('addFilterFuncIfActive [%s] [%O]', type, fData);
		if (!fData) { return; }
		active[type] = funcObj[type];
	}
}
/* ------------------------- TREE FILTERS ----------------------------------- */
function handleTreeFilters() {
	filterOnRootLevel();
	filterOnAllTreeLevels();
}
function filterOnRootLevel() {
	const funcs = getFuncsForActiveFiltersInGroup('root');  					//console.log('root funcs = %O', funcs)
	if (!funcs) { return; }
	rows = filterTreeRows(funcs);
}
function filterOnAllTreeLevels() {
	const funcs = getFuncsForActiveFiltersInGroup('tree');						//console.log('tree funcs = %O', funcs)
	if (!funcs) { return; }
	rows = filterTreeRows(funcs);
}
function filterTreeRows(funcs) {
	return 	rows.map(row => getRowsThatPassAllTreeFilters(row, funcs))
		.filter(r=>r);
}
function getRowsThatPassAllTreeFilters(row, funcs) {
	return getRowIfAllFiltersPass(row);
	/** @return row */
	function getRowIfAllFiltersPass(row) {
		if (!row.name) { return row; }
		let rowPasses = ifRowPassesFilters(row, funcs);             /*dbug-log*///console.log('getRowIfAllFiltersPass. rowPasses %s, row = %O', rowPasses, row)
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
	const funcs = getFuncsForActiveFiltersInGroup('int');  						//console.log('int funcs = %O', funcs)
	if (!funcs) { return; }
	if (funcs.date) { handlePersistedDateFilterObj(); }
	rows = rows.map(getRowsThatPassInteractionFilters).filter(r=>r);

	function getRowsThatPassInteractionFilters(row) {
		if (!row.name) { return ifPassesReturnRow(row); } //interaction row
		row.children = filterRowChildren(row);
		return row.children.length ? row : null;
	}
	function filterRowChildren(row) {
		return row.children.map(getRowsThatPassInteractionFilters).filter(r=>r);
	}
	function ifPassesReturnRow(row) {
		return ifRowPassesFilters(row, funcs) ? row : false;
	}
}
function handlePersistedDateFilterObj() {
	if (!filters.date) { return; }
	filters.date.time = new Date(filters.date.time).getTime();
}
/* =========================== FILTERS ====================================== */
/** @return bool */
function ifRowPassesFilters(row, funcs) {						    /*dbug-log*///console.log('ifRowPassesFilters row = %O, filters = %O', row, funcs);
 	return Object.keys(filters).every(ifRowPassesFilter);

	function ifRowPassesFilter(type) {
		return funcs[type] ? applyFilter(type) : true;
	}
	function applyFilter(type) {
		if (type === 'combo') { return ifRowContainsComboValue(row, funcs[type]); }
		return funcs[type](row, filters[type]);
	}
}
/* ------------- COMBO FILTERS ------------------ */
function ifRowContainsComboValue(row, comboFuncs) {
	return Object.keys(comboFuncs).every(type => {  							//console.log('type [%s] funcs = %O row = %O filters = %O', type, comboFuncs, row, filters);
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
/* ------------------------ OBJECT GROUP ------------------------------------ */
function ifIntWithGroup(row, groupIds) {  							/*dbug-log*///console.log('ifIntWithGroups = %O, row = %O', groupIds, row);
	return groupIds.indexOf(row.objGroupId) !== -1;
}
/* --------------------- USER INTERACTION-LIST ------------------------------ */
function ifIntInUserList(row, intIds) {
	return intIds.indexOf(row.id) !== -1;
}