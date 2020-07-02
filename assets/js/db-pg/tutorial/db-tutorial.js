/**
 * The intro.js walkthrough contains the tutorial for the database search page.
 * It is loaded on the first visit to the page and prompts the user to go through
 * the entire tutorial. The tutorial can later be accessed by clicking on the
 * tutorial button and selecting the a smaller focus of the tutorial or the entire
 * set.
 * The search tips available by clicking on "Show Tips".
 *
 * Exports:
 *     startWalkthrough
 *     getFilterPanelSteps
 *     getSavedFilterSteps
 *     getSavedListSteps
 *
 * TOC:
 *     INIT
 *     SET UP
 *     STEP SET UP
 *     TEAR DOWN
 *     TUTORIAL STEP CONFIG
 *         HELP MODAL STEPS
 */
import * as _u from '../util/util.js';
import { resetDataTable, accessTableState as tState } from '../db-main.js';
import { showTips } from '../pg-ui/ui-main.js';

let intro, focus;

addWalkthroughEventListener();
/* ============================== INIT ====================================== */
function addWalkthroughEventListener() {
    $("#strt-tut").click(startWalkthrough.bind(null, null));
}
export function startWalkthrough(curFocus){
    if (intro) { return; }
    if (curFocus) { focus = curFocus; }
    setTableState();
    buildIntro();
    intro.start();
}
function buildIntro() {
    intro = require('../../libs/intro.js').introJs();
    intro.onexit(resetTableState);
    intro.oncomplete(resetTableState);
    intro.onafterchange(onAfterStepChange);
    intro.setOptions(getIntroOptions());
}
function getIntroOptions() {
    return {
        showStepNumbers: true,
        showBullets: true,
        skipLabel: 'Exit',
        doneLabel: "I'm done.",
        tooltipClass: 'intro-tips',
        steps: getSteps()
    };
}
/* ==================== SET UP ============================================== */
function setTableState() {
    $('#show-tips').off("click");
    $('#db-view').css("height", "444px");
    $('#search-focus')[0].selectize.disable();
    $('#sel-view')[0].selectize.disable();
    setDbLoadDependentState();
}
function setDbLoadDependentState() {
    if (!$('#search-focus').val()) {
        return window.setTimeout(setDbLoadDependentState, 200);
    }
    $('#search-focus')[0].selectize.addItem('taxa');
    $('#sel-view')[0].selectize.addItem('3');
}
/* ----------------- STEP SET UP -------------------------------------------- */
function onAfterStepChange(stepElem) {                                          //console.log('onAfterStepChange elem = %O. curStep = %s, intro = %O', stepElem, intro._currentStep, intro);
    const stepConfg = intro._introItems[intro._currentStep];
    if (!$('#sel-view').val() && intro._currentStep > 2) { return waitForDbLoad(); }
    if (intro._currentStep >= 14 && !isAllDataAvailable()) { return waitForDbLoad(); }
    if (!stepConfg.setUpFunc) { return; }
    stepConfg.setUpFunc();
}
function waitForDbLoad() {
    window.setTimeout(addDbLoadNotice, 500);
    if (intro._currentStep == 14) { return intro._currentStep = 13; }
    intro.goToStep(3);
}
function addDbLoadNotice() {
    $('.introjs-tooltiptext').html(`
        <br><center><b>Please wait for the table to load before continuing.`);
}
function isAllDataAvailable() {
    const flags = tState().get('flags');
    return flags ? flags.allDataAvailable : false;
}
function loadIntsOnMap() {                                                      //console.log('loadMapView. display = ', $('#map')[0].style.display)
    if ($('#map')[0].style.display === 'none') { $('#shw-map').click(); }
}
function loadLocView(view) {
    if ($('#search-focus')[0].selectize.getValue() !== 'locs') {
        $('#search-focus')[0].selectize.addItem('locs');
    }
    window.setTimeout(setLocView(view), 400);
}
function setLocView(view) {
    if ($('#sel-view')[0].selectize.getValue() !== view) {
        $('#sel-view')[0].selectize.addItem(view);
    }
}
function addBttnEvents() {
    const map = {
        'Full Tutorial': 'full', 'Table View': 'tbl',
        'Map View': 'map', 'Data Entry': 'data'
    };
    window.setTimeout(function() { // Needed so events are bound when this step is revisted. afterChange event fires before fully loaded.
        $('.intro-bttn').each((i, elem) => {
            const key = map[elem.innerText];
            if (key === 'map') { enableMapTutorialIfDataAvailable(elem); }
            $(elem).click(showTutorial.bind(null, key));
        });
    }, 400);
}
function enableMapTutorialIfDataAvailable(elem) {
    $(elem).attr('disabled', !isAllDataAvailable())
        .css({'opacity': .3, 'cursor': 'wait'});
}
function showTutorial(tutKey) {
    if (tutKey === 'full' || tutKey === 'tbl') { intro.nextStep(); }
    if (tutKey === 'map') { intro.goToStep(15); }
}
function toggleFilterPanelInTutorial(close) {
    const closed = $('#filter-pnl').hasClass('closed');
    if ((close && closed) || !close && !closed) { return; }
    $('#filter').click();
}
function clearFilters() {
    $('button[name="reset-tbl"]').click();
    toggleFilterPanelInTutorial(true);
}
function toggleListPanelInTutorial(close) {
    const role = $('body').data('user-role');
    const closed = $('#list-pnl').hasClass('closed');
    if ((close && closed) || !close && !closed) {
        if (close && role == 'visitor') { $('#lists').attr({disabled: true}); }
        return;
    }
    if (!close) {
        $('#lists').attr({disabled: false}).click();
    } else {
        $('#lists').attr({disabled: role !== 'visitor'}).click();
    }
}
/* ==================== TEAR DOWN =========================================== */
function resetTableState() {
    resetUi();
    if ($('#sel-view').val() && isAllDataAvailable()) { resetDataTable(focus); }
}
function resetUi() {                                                            //console.log('resetUiAndReloadTable')
    focus = focus || "taxa";
    intro = null;
    $('#db-view').css("height", "888px");
    $('#show-tips').click(showTips);
    $('#search-focus')[0].selectize.addItem(focus, 'silent');
    $('#search-focus')[0].selectize.enable();
    $('#sel-view')[0].selectize.enable();
}
/* =================== TUTORIAL STEP CONFIG ================================= */
function getSteps() {
    return [
        {
            element: '#help-opts',
            intro: `<h3><center>Welcome to the Bat Eco-Interactions <br> Database
                Search Page!</center></h3><br><b>This tutorial demonstrates the
                various database features and search tools available.</b> There
                are also "Search tips" to help you refine your search in various
                ways.<br><br><b>Use the right arrow key or click 'Next' to move
                through the slides.</b> You can exit the tutorial by clicking
                'Exit', or anywhere on the greyed background.<br><br><b><center>
                Move to the next slide or select an area to begin.<br></center>
                </b><br><button class="intro-bttn" style="margin: 0 25px
                5px 45px !important">Full Tutorial</button><button class="intro-bttn">
                Table View</button><button class="intro-bttn" style="
                margin: 0 25px 5px 45px !important">Map View</button><button class="intro-bttn"
                disabled="disabled" title="Coming soon" style="opacity:
                0.3; cursor: not-allowed;">Data Entry</button>`,
            position: 'right',
            setUpFunc: addBttnEvents
        },
        {
            element: '#focus-opts',
            intro: `<h3><center>The interaction records are displayed by
                <br>Location, Source, or Taxon.<center></h3><br><b>Location</b>
                - View by region/country or view all on a map.
                <br><br><b>Source</b> - View by publication, publisher, or author.
                <br><br><b>Taxon</b> - View by the taxa of the selected realm.
                <br><br><center>This tutorial will begin with the default Taxon table.`,
            position: 'top'
        },
        {
            element:'#focus-opts',
            intro: `<h3><center>Select the Table Tree view.<center></h3>
                <br>Once "Taxon" has been selected in the “Group Interactions by”
                box, select a 'realm' of taxa to view.<br><br>
                <center>We have selected the "Plant" view for this tutorial.</center>`,
            position: 'right'
        },
        {
            element: '#search-tbl',
            intro: `<h4><center>All interactions with plants are displayed
                and available for further sorting and filtering.</center></h4>
                <br>Columns can be resized by dragging the column header dividers
                and rearranged by dragging the header itself.<br><br>Hovering
                over a column header reveals the filter menu for that column.<br><br>
                Some columns can be filtered by text, others by selecting or
                deselecting values in that column.<br>`,
            position: 'top'
        },
        {
            element: '#search-tbl',
            intro: `<h3><center>Column definitions</h3></center><br>
                <b>"Subject Taxon"</b> shows the bat taxon that each interaction is
                attributed to.<br><br>
                <b>"Object Taxon"</b> shows the taxon interacted with.
                <br><br>Note on Taxon names: Aside from genus species binomials,
                names at all other taxonomic levels begin with the level (e.g.,
                Family Acanthaceae for the plant family Acanthaceae).`,
            position: 'top'
        },
        {
            element: '#search-tbl',
            intro: `<b>"Cnt"</b> (count) shows the number of interactions attributed
                to each Taxon, Location, or Source.<br><br>
                <b>“Type”</b> refers to the type of interaction. For a
                list of definitions, see the <a href="definitions" target="_blank">Definitions</a>
                page.<br><br>
                <b>“Tags”</b> refer to the part of the Object Taxon being
                interacted with. The “Secondary” tag refers to an interaction that the author did
                not witness directly, but instead is citing from another publication.`,
            position: 'top'
        },
        {
            element: '#xpand-tree',
            intro: `<center><b>The table can be expanded or collapsed by a single
                level or all at once.</b><br><br>You can try it now.</center>`,
            position: 'right'
        },
        {
            element: '#filter',
            intro: `<center><b>Click here to toggle the filter panel open or closed.</b></center>`,
            position: 'bottom',
            setUpFunc: toggleFilterPanelInTutorial
        },
        {
            element: '#filter-col1',
            intro: `<h3><center>Taxon specific filters</center></h3><br>These dropdowns
                show all taxa in the selected realm present in the table.</b><br><br>
                 - Select a specific taxon from the dropdown menu and the table will
                update to show it at the top of the data tree. The other dropdowns will
                populate with related taxa.`,
            position: 'top',
            setUpFunc: toggleFilterPanelInTutorial
        },
        {
            element: '#filter-col1',
            intro: `<h3><center>Other view-specific filters</center></h3><br>
                <b>Locations</b> can be filtered by region, country, and display name.<br><br>
                <b>Sources</b> can be filtered by author, publisher, and by the type of publication.`,
            position: 'top',
            setUpFunc: toggleFilterPanelInTutorial
        },
        {
            element: '#shw-chngd-ints',
            intro: `<center><b>Check this box to filter interaction records by
                time published/updated.</b></center><br>Only interactions
                published/updated after the selected time will be displayed.`,
            position: 'top',
            setUpFunc: toggleFilterPanelInTutorial
        },
        {
            element: '#stored-filters',
            intro: `<h4><center>Filters can be saved and reapplied later as a set.</center></h4><br>
                After filtering data using the Filter menu and table columns, save the set to
                run the same search later.<br><br>For example, a set could show all journal
                articles tagged with "flower" in a "forest" habitat or all African "consumption" interactions in
                a "desert" habitat.<br><br><center><b>Register and log in to use these features.</b></center>`,
            position: 'left',
            setUpFunc: toggleFilterPanelInTutorial
        },
        {
            element: 'button[name="reset-tbl"]',
            intro: `<b>Click here to clear all filters and reset the interactions in the table.</b>`,
            position: 'right',
            setUpFunc: clearFilters
        },
        {
            element: 'button[name="csv"]',
            intro: `<center><b>As a member of batbase.org, data displayed in
                the table can be exported in csv format.</b></center><br>The
                columns are exported in the order they are displayed in the table
                below.<br><br>For an explanation of the csv format and how to
                use the file, see the note at the bottom of the "Search Tips"`,
            position: 'left',
            setUpFunc: toggleFilterPanelInTutorial.bind(null, 'close')
        },
        {
            element: '#shw-map',
            intro: `<center><b>Interactions in the table can be displayed on a
                map.</b><br><br>After filtering the interactions, click here to
                display them geographically.<br>`,
            position: 'left'
        },
        {
            element: '#db-view',
            intro: `<center><h3>There is a marker for each location with interactions
                from the filtered data.</h3></center><br>
                <b>Mouse over or click on a marker to see a popup summary of the
                interactions.</b><br><br>The summary shows details from up to 4
                interaction sets at the location. Details include the name of the
                Taxon/Location/Source filtered to, the count of their interactions,
                and the top 3 most reported bats in the set of interactions.<br>
                <br><center><b>Click on a marker to keep its popup open.</b><br><br>
                Hover over truncated(...) text to show full text. Only the first 4
                interactions at a location are `,
            position: 'top',
            setUpFunc: loadIntsOnMap
        },
        {
            element: '#shw-map',
            intro: `<center><b>Click here to return to the interaction table
                data or to filter the interactions further.</b></center>`,
            position: 'top'
        },
        {
            element: '#focus-opts',
            intro: `<h4><center>The map is also available in Location mode.
                </center></h4><br>Group interactions by "Location" and then select
                "Map Data" from the "View" box.<br><br><b>Every interaction with
                GPS data is loaded in the map with popup data specific to the location.</b>`,
            position: 'right',
            setUpFunc: loadLocView.bind(null, 'tree')
        },
        {
            element: '#db-view',
            intro: `<b>Mouse over
                or click on a marker to see a popup summary of the location</b>,
                including the top three most frequent bat taxa and habitat types
                recorded at the location.<br><br><b>Clicking on 'Show Interactions
                In Data-Table' will open the table on the selected location</b>
                and show every interaction recorded there.` ,
            position: 'top',
            setUpFunc: loadLocView.bind(null, 'map')
        },
        {
            element: '#db-view',
            intro: `<b>Search by clicking on the magnifying glass on the left side
                of the map and typing your search criteria.</b><br><br><center>The
                map will refocus and show interactions nearby.<br><br>You can try
                this after exiting the tutorial.`,
            position: 'top',
            setUpFunc: loadLocView.bind(null, 'map')
        },
        {
            element: '#db-view',
            intro: `<center><b>The Location table also has a "map" column.
                </b></center><br>All locations with GPS data have a map pin in
                this column. Click one to load the Map View centered on that
                location with its popup opened.<br><br><center>You can try it
                now.</center>` ,
            position: 'top',
            setUpFunc: loadLocView.bind(null, 'tree')
        },
        {
            element: '#list-opts',
            intro: `<h3><center>Create and manage custom lists of interactions.</center></h3><br>
                Studying specific countries in Africa, data from specific publishers or authors,
                or a perhaps few habitats in particular? <br><br>As a member of batbase.org,
                you can save interactions as a list and use the filters and features
                to explore them as a group.<br><br>`,
            position: 'right',
        },
        {
            element: '#help-opts',
            intro: `<b><center>Thank you for taking the time to learn about the
                <br>Bat Eco-Interactions Database Search Page!</b></center><br>
                You can start this tutorial again at anytime. There are also
                "Search tips" to help you refine your search in various ways.<br>
                <br><b><center>Register and log in to leave us feedback.<br>
                We'd love to hear from you!</b></center>` ,
            position: 'right'
        },
    ];
}
/* ---------------------- HELP MODAL STEPS --------------------------------- */
export function getFilterPanelSteps() {
    return [{
        element: '#filter-col1',
        intro: `<h3><center>Dynamic filters</center></h3><br><b>Location:</b> Region, country,
            and name filters.<br><br><b>Source:</b> Author, publication, and publisher filters.
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
export function getSavedFilterSteps() {
    return [{
        element: '#stored-filters',
        intro: `<h4><center>Filters can be saved and reapplied later as a set.</center></h4><br>
            After filtering data using the Filter menu and table columns, save the set to
            run the same search later.<br><br>For example, a set could show all journal
            articles tagged with "flower" in a "forest" habitat or all African "consumption" interactions in
            a "desert" habitat.<br><br><center><b>Register and log in to use these features.</b></center>`,
        position: 'left'
    }];
}
export function getSavedListSteps() {
    return [
        {
            element: '#list-pnl',
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