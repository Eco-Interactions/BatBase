/**
 * The intro.js walkthrough contains the tutorial for the database search page. 
 * It is loaded on the first visit to the page and prompts the user to go through
 * the entire tutorial. The tutorial can later be accessed by clicking on the 
 * tutorial button and selecting the a smaller focus of the tutorial or the entire
 * set. 
 * The search tips available by clicking on "Show Tips".
 *
 * Exports:             Imported by:
 *     exitModal                save-fltrs
 *     showHelpModal            save-fltrs, save-ints
 *     showSaveModal            save-fltrs, view-pdfs
 */

let intro;

/* ===================== MODALS/TIPS ======================================== */
/* ------------ HELP MODALS ------------ */
export function showHelpModal(key) {
    if (intro) { return; }
    intro = require('../libs/intro.js').introJs();
    intro.onexit(() => intro = null);
    intro.oncomplete(() => intro = null);
    intro.setOptions({
        showBullets: false, 
        showStepNumbers: false, 
        steps: getHelpSteps(key), 
        tooltipClass: 'intro-tips'});
    intro.start();
}
function getHelpSteps(key) {
    const getSteps = {
        'filter-panel': getFilterPanelSteps,
        'selSavedFilters': getSavedFilterSteps,
        'saved-lists': getSavedListSteps
    };
    return getSteps[key]();
}
function getFilterPanelSteps() {
    return [{
        element: '#filter-col1',
        intro: `<h3><center>Dynamic filters</center></h3><br><b>Location:</b> Region, country,
            and name filters.<br><br><b>Source:</b> Name and publication type filters.
            <br><br><b>Taxon:</b> Name and taxonomic rank filters.<br>
             - The dropdowns show all taxa in the Taxon Tree<br>
             - Select a specific taxon and the Tree will update to show interactions
             for the taxon and lower related taxa. The other dropdowns 
            will populate with the related taxa in the Tree.`, 
        position: 'top',
    },
    {
        element: '#shw-chngd-ints',
        intro: `<h3><center>Check this box to filter interaction records by 
            time updated/created.</center></h3><br><b></b>The time defaults 
            to the current date. Use the calendar to select any date. That date 
            will be saved and reapplied if the filter is turned reset when switching
            between data views.<br><br>Only interactions created/updated after 
            the selected time will be displayed.`,
        position: 'top',
        setUpFunc: toggleFilterPanelInTutorial
    },
    {
        element: '.ag-header-viewport',
        intro: `<h3><center>Table column filters</center></h3><br>Hovering 
            over a column header reveals the filter menu for that column.<br><br>
            Some columns can be filtered by text, others by selecting or 
            deselecting values in that column.`,
        position: 'top'
    },
    {
        element: 'button[name="reset-tbl"]',
        intro: `<b>Click here to clear all filters and reset the interactions in the table.</b>`,
        position: 'right',
        setUpFunc: clearFilters
    }];
}
function getSavedFilterSteps() {
    return [{
        element: '#stored-filters',
        intro: `<h3><center>Multiple filters can be saved and applied as a set.</center></h3><br>
            Saved sets include the grouping and view of the data and all applied filters from
            the panel and the table columns.<br><br>For example, a set could show all journal articles tagged with "arthropod" 
            in a "forest" habitat or all African "consumption" interactions in a "desert" habitat.<br><br>
            New users have preloaded examples to help demonstrate this feature.`,
        position: 'left'
    }];
}
function getSavedListSteps() {
    return [
        {
            element: '#int-opts',
            intro: `<h3><center>Create and manage custom lists of interactions.</center></h3><br>
                Studying specific countries in Africa, data from specific publishers or authors, 
                or a perhaps few habitats in particular? <br><br>Save interactions as a list and 
                use the filters and features to explore them as a group.<br><br>`,
            position: 'top'
        },
        {
            element: '#list-sel-cntnr',
            intro: `<h3><center>Select a list to manage or enter a new name to create.</center></h3><br>
                New users have preloaded examples to help demonstrate this feature.`,
            position: 'right',
        },
        {
            element: '#load-list',
            intro: `After selecting an existing list with interactions, show the 
                interactions in the table by clicking 
                "Load Interaction List in Table".<br><br>Once loaded, sort and view
                the interactions using the various filters and features of the page.<br><br>`,
            position: 'right',
        },
        {
            element: '#mod-list-pnl',
            intro: `<h3><center>Add/remove list interactions.</center></h3><br>
                <b>Add:</b> Select/create a list. Select interaction rows in the table, 
                or the "All Shown" option, and click "Save List" to update the list.<br><br>
                <b>Remove:</b> Select a list and click "Load Interaction List in Table". Select 
                interaction rows in the table or the "All Shown" option and click
                "Save List" to remove the selected interactions from the list.`,
            position: 'top',
        },
        {
            element: 'button[name="clear-list"]',
            intro: `<h3><center>Click here to reset table to all database interactions.</center></h3>`,
            position: 'bottom',
        }
    ];
}
/* ------------ SAVE MODALS ------------ */
export function showSaveModal(text, elem, dir, submitCb, cancelCb, bttnText) {  //console.log('showing modal')
    if (intro) { return; }
    const subFunc = !submitCb ? exitModal.bind(null, cancelCb) : submitCb;
    intro = require('../libs/intro.js').introJs();   
    intro.oncomplete(subFunc);
    intro.onexit(exitModal.bind(null, cancelCb));
    intro.setOptions(getModalOptions(text, elem, dir, bttnText));
    intro.start();
}
export function exitModal(cancelCb) {
    intro = null;
    if (cancelCb) { cancelCb(); }
}
function getModalOptions(text, elem, direction, bttnText) {                                   
    return {
        showStepNumbers: false,
        showBullets: false,
        skipLabel: 'Cancel',
        doneLabel: bttnText,
        tooltipClass: 'modal-msg',
        steps: getSlideConfg(text, elem, direction)
    }; 
}
function getSlideConfg(text, elem, dir) {
    return [{
        element: elem,
        intro: text,
        position: dir
    }];
}
