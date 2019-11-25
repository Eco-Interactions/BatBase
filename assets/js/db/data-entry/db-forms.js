/*
 * When logged in as an 'admin' or 'super': 
 * >> On the database search page, multiple admin-ui elements are added that open 
 * a popup interface allowing the creating, updating and, soon, deleting of data.   
 * >> All Content Blocks will have an edit icon attached to the top left of their 
 * container. When clicked, a wysiwyg interface will encapsulate that block and 
 * allow editing and saving of the content within using the trumbowyg library.
 * 
 * Exports:             Imported by:
 */
import * as _u from '../util.js';
// import * as _elems from './forms/ui/form-elems.js';
import * as _forms from './forms/forms-main.js';
import * as db_sync from '../db-sync.js';
import * as db_page from '../db-page.js';
import * as db_map from '../db-map/map-main.js';
import * as idb from 'idb-keyval'; //set, get, del, clear
import * as _cmbx from './forms/ui/combobox-util.js';
import * as _fCnfg from './forms/etc/form-config.js';
import { showEntityEditForm } from './forms/edit/edit-forms.js';

let fP = {};

const _elems = _forms.uiElems;

export function loadDataTable(focus) {
    db_page.initDataTable(focus);
}
export function create(entity) {
    _forms.create(entity);
}
/* ================== FORM "STATE" ========================================= */
export function clearFormMemory() {
    fP = {};
}
export function getFormParams() {
    return fP;
}
/*------------------- Form Functions -------------------------------------------------------------*/
// /*--------------------------- Edit Form --------------------------------------*/
// /** Shows the entity's edit form in a pop-up window on the search page. */
export function editEntity(id, entity) {                                        console.log("   //editEntity [%s] [%s]", entity, id);  
    _forms.initFormMemory("edit", entity, id)
    .then(() => showEntityEditForm(id, entity, fP));
}   
/*--------------------------- Create Form --------------------------------------------------------*/
/*------------------- Interaction Form Methods (Shared) ----------------------*/ 

/*-------------- Form Builders -------------------------------------------------------------------*/

/*-------------- Country/Region ------------------------------------------*/

/*-------------- Location ------------------------------------------------*/
/** ----------------------- Params ------------------------------------- */

/*-------------- Sub Form Helpers ----------------------------------------------------------*/
/*-------------- Publisher -----------------------------------------------*/
/*------------------- Shared Form Builders ---------------------------------------------------*/
/*--------------- Shared Form Methods -------------------------------*/

/** map-main */
export function locCoordErr() {
    return _forms.locCoordErr(...arguments);
}