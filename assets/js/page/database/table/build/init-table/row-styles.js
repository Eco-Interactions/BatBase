/**
 * Handles logic related to syling the rows and cells in the agGrid table.
 *
 * Export
 *     getCellStyleClass
 *     getRowStyleClass
 */
let curFocus;
/*================== Row Styling =========================================*/
/**
 * Adds a css background-color class to interaction record rows. Source-focused
 * interaction rows are not colored, their name rows are colored instead.
 */
export function getRowStyleClass(focus, params) {                               //console.log("[%s] getRowStyleClass params = %O... lvl = ", focus, params, params.data.treeLvl);
    if (params.data.name !== "") { return; }
    return focus === "srcs" ?
        getSrcRowColorClass(params.data) : getRowColorClass(params.data.treeLvl);
}
/**
 * Adds a background-color to cells with open child interaction rows, or cells
 * with their grouped interactions row displayed - eg, Expanding the tree cell
 * for Africa will be highlighted, as well as the 'Unspecified Africa Interactions'
 * cell Africa's interaction record rows are still grouped within.
 */
export function getCellStyleClass(focus, params) {                              //console.log("[%s] getCellStyleClass for row [%s] = %O", focus, params.data.name, params);
    curFocus = focus;
    if ((params.node.expanded === true && isOpenRowWithChildInts(params)) ||
        isNameRowforClosedGroupedInts(params)) {                                //console.log("setting style class")
        return curFocus === "srcs" ?
        getSrcRowColorClass(params.data) : getRowColorClass(params.data.treeLvl);
    }
}
function isOpenRowWithChildInts(params) {
    if (params.data.locGroupedInts) { return locHasIntsAfterFilters(params); }  //console.log('params.data.interactions === true && params.data.name !== ""', params.data.interactions === true && params.data.name !== "")
    if (params.data.interactions === true && params.data.name !== "") {
        return curFocus === "taxa" ? txnHasIntsAfterFilters(params) : true;
    };
}
function txnHasIntsAfterFilters(params) {
    if (params.data.taxonRank === 'Species') { return true; }
    return params.node.childrenAfterFilter.some(childRow => {
        return childRow.data.name.split(" ")[0] === "Unspecified";
    });
}
/**
 * Returns true if the location row's child interactions are present in
 * data tree after filtering.
 */
function locHasIntsAfterFilters(params) {
    return params.node.childrenAfterFilter.some(childRow => {
        return childRow.data.name.split(" ")[0] === "Unspecified";
    });
}
function isNameRowforClosedGroupedInts(params) {
    return params.data.groupedInts === true;
}
/** Returns a color based on the tree level of the row. */
function getRowColorClass(treeLvl) {
    var rowColorArray = ['purple', 'green', 'orange', 'blue', 'red', 'turquoise', 'yellow'];
    var styleClass = 'row-' + rowColorArray[treeLvl];                           //console.log("styleClass = ", styleClass);
    return styleClass;
}
/** Alternates the row coloring. rowColorIdx added when row data built. */
function getSrcRowColorClass(params) {
    const rowColorArray = ['purple', 'green', 'orange', 'blue', 'red', 'turquoise', 'yellow'];
    const styleClass = 'row-' + rowColorArray[params.rowColorIdx];              //console.log("styleClass = ", styleClass);
    return styleClass;
}