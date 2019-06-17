/**
 * The intro.js walkthrough contains the tutorial for the database search page. 
 * It is loaded on the first visit to the page and prompts the user to go through
 * the entire tutorial. The tutorial can later be accessed by clicking on the 
 * tutorial button and selecting the a smaller focus of the tutorial or the entire
 * set. 
 * The search tips available by clicking on "Show Tips".
 *
 * Exports:             Imported by:
 *     startWalkthrough         db-page
 *     showSaveModal            save-fltrs
 *     
 */
import * as db_page from './db-page.js';
import * as _u from './util.js';
import { showTips } from './db-table/db-ui.js';

let intro, focus;

init();

function init() {  
    $("#strt-tut").click(startIntroWalkthrough);
    $("#show-tips").click(showTips);
    require('../../css/lib/introjs.min.css');
}
/* ======================= TUTORIAL ========================================= */
export function startWalkthrough(curFocus) {
    focus = curFocus;
    window.setTimeout(startIntroWalkthrough, 250); 
}
function startIntroWalkthrough(){
    if (intro) { return; }                                                      //console.log("intro = %O", intro)
    buildIntro();
    setTableState();
    intro.start();
} 
function buildIntro() {                                                         //console.log("buildIntro called")
    const intro = require('../libs/intro.js').introJs();
    intro.onexit(function() { resetTableState(); });
    intro.oncomplete(function() { resetTableState(); });
    intro.onafterchange(onAfterStepChange.bind(null));
    intro.setOptions(getIntroOptions());
} 
function getIntroOptions() {
    return {
        showStepNumbers: false,
        showBullets: true,
        skipLabel: 'Exit',
        doneLabel: "I'm done.",
        tooltipClass: 'intro-tips',
        steps: getSteps()
    };
}
function getSteps(step) {
    return [ 
        {
            element: '#db-opts-col6', 
            intro: `<b><center>Welcome to the Bat Eco-Interactions <br> Database 
                Search Page!</center></b><br><b>This tutorial demonstrates the 
                various database features and search tools available.</b> There 
                are also "Search tips" to help you refine your search in various 
                ways.<br><br><b>Use the right arrow key or click 'Next' to move 
                through the slides.</b> You can exit the tutorial by clicking 
                'Exit', or anywhere on the greyed background.<br><br><b><center>
                Move to the next slide or select an area to begin.<br></center>
                </b><br><button class="intro-bttn tbl-bttn" style="margin: 0 25px 
                5px 45px">Full Tutorial</button><button class="intro-bttn tbl-bttn">
                Table View</button><button class="intro-bttn tbl-bttn" style="
                margin: 0 25px 5px 45px">Map View</button><button class="intro-bttn 
                tbl-bttn" disabled="disabled" title="Coming soon" style="opacity: 
                0.3; cursor: default;">Data Entry</button>`,
            position: 'left',
            setUpFunc: addBttnEvents
        },
        {
            element: '#db-opts',
            intro: `<h3><center>The interaction records are displayed by either 
                <br>Location, Source, or Taxon.<center></h3><br><b>Location</b> 
                - Where the interaction(s) were observed. Can be displayed in a 
                Region-Country-Location structure or on a map. You can select a 
                Region and/or a Country to narrow your search to a particular 
                part of the world. <br><br><b>Source</b> - Where the data were 
                obtained. You can select Publications, which will list journals,
                books, etc or Authors, which will provide a list of authors.
                <br><br><b>Taxon</b> - The Bat/Plant/Arthropod in the interaction. 
                <br><br>Taxon is the default mode and where we will begin.`,
            position: 'top',
            setUpFunc: checkForDbLoad
        },
        {
            element:'#db-opts-col1',
            intro: `<h3><center>Select the Taxon Tree view.<center></h3>
                <br>Once Taxon has been selected in the “Group Interactions by” 
                box, select one of the following: Bat, Plant, or Arthropod.<br><br>
                We have selected the “Plant” view for this tutorial.`,
            position: 'right',
            setUpFunc: checkForDbLoad
        },
        {
            element: '#search-tbl',
            intro: `<b><center>All interactions that involve plants are displayed 
                and are available for further sorting and filtering.</center></b>
                <br>Columns can be resized by dragging the column header dividers 
                and rearranged by dragging the header iteself.<br><br>Hovering 
                over a column header reveals the filter menu for that column.<br><br>
                Some columns can be filtered by text, others by selecting or 
                deselecting values in that column.<br><br><center><b>Try 
                exploring the column filter menus a bit now.</b></center>`,
            position: 'top'
        },
        {
            element: '.ag-header-viewport',
            intro: `<b><center>Column definitions</b></center><br>
                <b>"Subject Taxon"</b> shows the bat taxon that each interaction is 
                attributed to.<br><br>
                <b>"Object Taxon"</b>, shows the plant or arthropod interacted with.
                <br><br>Note on Taxon names: Aside from genus species binomials, 
                names at all other taxonomic levels begin with the level (e.g., 
                Family Acanthaceae for the plant family Acanthaceae).`,
            position: 'top'
        },
        {
            element: '.ag-header-viewport',
            intro: `<b><center>Column definitions</b></center><br>
                <b>"Cnt"</b> (count) shows the number of interactions attributed 
                to each Taxon, Location, or Source.<br><br>
                <b>“Type”</b> refers to the type of interaction, including visitation, 
                consumption, pollination, seed dispersal, host, roost, and transport. For a 
                list of definitions, see the <a href="definitions">Definitions</a> 
                page.<br><br>
                <b>“Tags”</b> refer to the part of the Object Taxon being 
                interacted with, including flower, fruit, seed, leaf, and arthropod. 
                The “Secondary” tag refers to an interaction that the author did 
                not witness directly, but instead is citing from another publication.`,
            position: 'top'
        },
        {
            element: '#xpand-tree',   
            intro: `<center>The table can be expanded or collapsed by a single 
                level or all at once.<br><br>You can try it now.</center>`,
            position: 'right'
        },
        {
            element: '#filter',
            intro: `<h3><center>Click here to toggle the filter options panel open 
                or closed.</center></h3>`, 
            position: 'bottom',
            setUpFunc: toggleFilterPanelInTutorial
        },
        {
            element: '#focus-filters',
            intro: `<h3><center>Taxon specific filters</center></h3><br>These dropdowns 
                show all taxon levels that present in the Taxon Tree.</b> When first 
                displayed, all taxa for each level will be available in the 
                dropdown selection lists.<br><br><b>You can focus on any part of 
                the taxon tree by selecting a specific taxon from a dropdown.</b> 
                The Taxon Tree will change to show the selected taxon as the top 
                of the tree.<br><br><b>When a dropdown is used to filter the data, 
                the other dropdowns will also change to reflect the data shown.
                </b><br><br>- Higher level rankings will be fixed and only lower 
                ones associated with the selected taxon will be shown.<br>- Any 
                levels that are not recorded in the Taxon's ancestry chain will 
                have 'None' selected.`, 
            position: 'bottom',
        },
        {
            element: '#focus-filters',
            intro: `<h3><center>Other view-specific filters</center></h3><br>
                Locations can be filtered by region, country, and display name.<br><br>
                Sources can be filtered by name, or by type (depending on the type
                of source displayed in the table.)`, 
            position: 'bottom',
        },
        {
            element: '#shw-chngd-ints',
            intro: `<h3><center>Check this box to filter interaction records by 
                time updated/created.</center></h3><br><b></b>The time defaults 
                to the current date. Use the calendar to select any date. That date 
                will be saved and reapplied if the filter is turned reset when switching
                between data views.<br><br>Only interactions created/updated after 
                the selected time will be displayed.`,
            position: 'left'
        },
        {
            element: 'button[name="reset-tbl"]',
            intro: `<b>Click here at any point to clear all filters and reset 
                the results.</b>`,
            position: 'right',
            setUpFunc: clearFilters
        },
        {
            element: 'button[name="csv"]',
            intro: `<h3><center>As a member of batplant.org, data displayed in 
                the table can be exported in csv format.</center></h3><br>The 
                columns are exported in the order they are displayed in the table 
                below.<br><br>For an explanation of the csv format and how to 
                use the file, see a note at the bottom of the "Search Tips"`,
            position: 'left'
        },
        {
            element: '#shw-map',
            intro: `<h3><center>Interactions in the table can be displayed on a 
                map.</h3><br>After filtering the interactions, click here to 
                display them geographically.<br><br><center>You can try it now.
                </center>`,
            position: 'left',
            setUpFunc: checkForDbLoad
        },
        {
            element: '#db-view',
            intro: `<h3><center>On the map, a marker identifies each location 
                with interactions from the filtered data.</h3></center><br>
                <b>Mouse over or click on a marker to see a popup summary of the 
                interactions.</b><br><br>The summary shows details from up to 4 
                interaction sets at the location. Details include the name of the 
                Taxon/Location/Source filtered to, the count of their interactions, 
                and the top 3 most reported bats in the set of interactions.<br>
                <br><center><b>Click on a marker to keep its popup open.</b><br><br>
                Hover over truncated(...) text to show full text.`,
            position: 'top',
            setUpFunc: loadIntsOnMap
        },
        {
            element: '#shw-map',
            intro: `<h3><center>Click here to return to the interaction table 
                data or to filter the interactions further.</center></h3>`,
            position: 'top'
        },
        {
            element: '#db-opts-col1',
            intro: `<h3><center>The map is also available in Location mode.
                </center></h3><br>Group interactions by "Location" and then select 
                "Map Data" from the "View" box.<br><br><b>Every interaction with 
                GPS data is loaded in the map.</b>`,
            position: 'right',
            setUpFunc: loadLocView.bind(null, 'tree')
        },
        {
            element: '#db-view',
            intro: `<h3>There is a marker for each region, country, and sub-
                location with interactions in the database.</h3><br><b>Mouse over 
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
            intro: `<h3><center>Searching the map.</center></h3><br><b>Search by 
                clicking on the magnifying glass on the left side of the map and 
                typing your search criteria.</b><br><br><center>The map will 
                refocus and show interactions nearby.<br><br>You can try this after 
                exiting the tutorial.`,
            position: 'top',
            setUpFunc: loadLocView.bind(null, 'map')
        },
        {
            element: '#db-view',
            intro: `<center><h3>The Location table also has an additional "map" column.
                </h3></center><br>All locations with GPS data have a map pin in 
                this column. Click one to load the Map View centered on that 
                location with its popup opened.<br><br><center>You can try it 
                now.</center>` ,
            position: 'top',
            setUpFunc: loadLocView.bind(null, 'tree')
        },
        {
            element: '#db-opts-col6',
            intro: `<b><center>Thank you for taking the time to learn about the 
                <br>Bat Eco-Interactions Database Search Page!</b></center><br>
                You can start this tutorial again at anytime. There are also 
                "Search tips" to help you refine your search in various ways.<br>
                <br><b><center>Register and log in to leave us feedback.<br> 
                We'd love to hear from you!</b></center>` ,
            position: 'left'
        },
    ];
}
function setTableState() { 
    $('#show-tips').off("click");
    $('#db-view').css("height", "444px");
    setDbLoadDependentState();
}
function setDbLoadDependentState() {
    if (!$('#search-focus').val()) {
        return window.setTimeout(setDbLoadDependentState, 200);
    }
    $('#search-focus')[0].selectize.addItem('taxa');
    $('#sel-view')[0].selectize.addItem('3');
}
function resetTableState() {
    focus = focus || "taxa";
    $('#db-view').css("height", "888px");
    $('#show-tips').click(showTips);
    $('#search-focus')[0].selectize.addItem(focus, 'silent');
    db_page.initDataTable(focus);
    intro = null;
}
/* ---------- Set Up Functions --------------------*/
function onAfterStepChange(stepElem) {                                          //console.log('onAfterStepChange elem = %O. curStep = %s, intro = %O', stepElem, intro._currentStep, intro);
    const stepConfg = intro._introItems[intro._currentStep];
    if (!stepConfg.setUpFunc) { return; }
    stepConfg.setUpFunc();
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
    window.setTimeout(function() { // Needed so events are bound when this step is revisted. afterChange event seems to fire before it is fully loaded. No idea why.
        $('.intro-bttn').each((i, elem) => {  
            const key = map[elem.innerText]; 
            $(elem).click(showTutorial.bind(null, key));
        });
    }, 400);
}
function showTutorial(tutKey) {  
    if (tutKey === 'full' || tutKey === 'tbl') { intro.nextStep(); }
    if (tutKey === 'map') { intro.goToStep(14); }
}
function checkForDbLoad() {
    if ($('#sel-view').val()) { return; }  
    window.setTimeout(addDbLoadNotice, 400);
}
function addDbLoadNotice() {
    $('.introjs-tooltiptext').append(`
        <br><br><center><b>Please wait for database to finish downloading before 
        continuing.`);
}
function toggleFilterPanelInTutorial(close) {
    const closed = $('#filter-opts').hasClass('closed');
    if ((close && closed) || !close && !closed) { return; }
    $('#filter').click();
}
function clearFilters() {
    $('button[name="reset-tbl"]').click();
    toggleFilterPanelInTutorial(true);
}
/* ===================== MODALS/TIPS ======================================== */
export function showSaveModal(text, elem, dir, submitCb, cancelCb) {
    const intro = require('../libs/intro.js').introJs();   
    intro.oncomplete(submitCb);
    intro.onexit(cancelCb);
    intro.setOptions(getModalOptions(text, elem, dir));
    intro.start();
}
function getModalOptions(text, elem, direction) {                                   
    return {
        showStepNumbers: false,
        showBullets: false,
        skipLabel: 'Cancel',
        doneLabel: "Submit",
        tooltipClass: 'intro-tips',
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
/* ==================== SHARED HELPERS ====================================== */









