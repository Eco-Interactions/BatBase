/**
 * The intro.js walkthrough contains the tutorial for the database search page. 
 * It is loaded on the first visit to the page and prompts the user to go through
 * the entire tutorial. The tutorial can later be accessed by clicking on the 
 * tutorial button and selecting the a smaller focus of the tutorial or the entire
 * set. 
 * The search tips available by clicking on "Show Tips".
 */
import * as db_page from './db-page.js';
import * as _u from './util.js';

let intro, focus;

init();

function init() {  
    $("#strt-tut").click(startIntroWalkthrough);
    $("#show-tips").click(showTips);
    require('../../css/lib/introjs.min.css');
}
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
    const lib = require('../libs/intro.js');  
    intro = lib.introJs();
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
            element: '#opts-col4', 
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
            element: '#filter-opts',
            intro: `<h3><center>The interaction records are displayed by either 
                <br>Location, Source, or Taxon.<center></h3><br><b>Location</b> 
                - Where the interaction(s) were observed. Can be displayed in a 
                Region-Country-Location structure or on a map. You can select a 
                Region and/or a Country to narrow your search to a particular 
                part of the world. <br><br><b>Source</b> - Where the data were 
                obtained. You can select Publications, which will list journals,
                books, etc or Authors, which will provide a list of authors.
                <br><br><b>Taxon</b> - The Bat/Plant/Arthropod in the interaction. 
                Taxon is the default mode and where we will begin.`,
            position: 'right'
        },
        {
            element:'#sort-opts',
            intro: `<h3><center>Select the Taxon Tree grouping.<center></h3>
                <br>Once Taxon has been selected in the “Group Interactions by” 
                box, select one of the following: Bat, Plant, or Arthropod.<br><br>
                We have selected “Plant” for this tutorial.`,
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
                exploring the filter menus a bit now.</b></center>`,
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
                consumption, pollination, seed dispersal, and transport. For a 
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
            element: 'button[name="reset-tbl"]',
            intro: `<b>Click here at any point to clear all filters and reset 
                the results.</b>`,
            position: 'right'
        },
        {
            element: '#opts-col2',
            intro: `<h3><center>Dynamic filtering options are in this panel.
                </center></h3><br><b>In Taxon mode, these dropdowns show all 
                taxon levels that are used in the Taxon Tree.</b> When first 
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
            position: 'right'
        },
        {
            element: '#shw-chngd-ints',
            intro: `<h3><center>Check this box to filter interaction records by 
                time updated/created.</center></h3><br><b></b>The time defaults 
                to the current date. Clicking on 'Custom' allows the selection 
                of any date/time.<br><br>Only interactions created/updated after 
                the selected time will be displayed.`,
            position: 'left'
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
                interactions.</b><br><br>The summary shows details from 4 
                interaction sets at the location. Details include the name of the 
                Taxon/Location/Source filtered to, the count of their interactions, 
                and the top 3 most reported bats in the set of interactions.<br>
                <br><b>Click on a marker to keep its popup open.<b><br><br>`,
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
            element: '#opts-col1',
            intro: `<h3><center>The map is also available in Location mode.
                </center></h3><br>Group interactions by "Location" and then select 
                "Map Data" from the "View all as:" box.<br><br><b>Every 
                interaction with GPS data is loaded in the map.</b>`,
            position: 'right',
            setUpFunc: loadLocView.bind(null, 'map')
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
                typing your search criteria.</b><br><br>The map will refocus and 
                show interactions nearby.<br><br><center>You can try this after 
                exiting the tutorial.`,
            position: 'top',
            setUpFunc: loadLocView.bind(null, 'map')
        },
        {
            element: '#db-view',
            intro: `<center><h3>Location mode also has an additional "map" column.
                </h3></center><br>All locations with GPS data have a map pin in 
                this column. Click one to load the Map View centered on that 
                location with its popup opened.<br><br><center>You can try it 
                now.</center>` ,
            position: 'top',
            setUpFunc: loadLocView.bind(null, 'tree')
        },
        {
            element: '#opts-col4',
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
    $('#search-focus')[0].selectize.addItem('taxa');
    if ($('#sel-realm').length) {
        window.setTimeout(() => {$('#sel-realm')[0].selectize.addItem('3')}, 100);
    }
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
    window.setTimeout(loadLocRealm(view), 400);  
}
function loadLocRealm(view) {
    if ($('#sel-realm')[0].selectize.getValue() !== view) {
        $('#sel-realm')[0].selectize.addItem(view);
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
    if (tutKey === 'map') { intro.goToStep(12); }
}
function checkForDbLoad() {
    if ($('#sel-realm').length) { return; }  
    window.setTimeout(addDbLoadNotice, 400);
}
function addDbLoadNotice() {
    $('.introjs-tooltiptext').append(`
        <br><br><center><b>Please wait for database to finish downloading before 
        continuing.`);
}
/* ------------------ Search Tips ------------------------------------------- */
function initSearchTips() { 
    $('#b-overlay-popup').html(getSearchTipsHtml());
    bindEscEvents();
}
function showTips() {                                                           //console.log("show tips called.")
    if (!$('#tips-close-bttn').length) { initSearchTips(); }
    $('#b-overlay-popup').addClass("tips-popup");
    $('#b-overlay, #b-overlay-popup').fadeIn(500);
    $('#show-tips').html("Hide Tips");
    $('#show-tips').off("click");
    $('#show-tips').click(hideTips);
}
function hideTips() {
    $('#b-overlay').fadeOut(500, removeTips);
    $('#show-tips').html("Search Tips");
    $('#show-tips').off("click");
    $('#show-tips').click(showTips);
    $('#b-overlay-popup').removeClass("tips-popup");
    $('#b-overlay-popup').empty();
}
function removeTips() {                                                         //console.log("removeTips called.")
    $('#b-overlay, #b-overlay-popup').css("display", "none");
    $('#b-overlay-popup').removeClass("tips-popup");
}
function bindEscEvents() {
    addCloseButton();
    $(document).on('keyup',function(evt) {
        if (evt.keyCode == 27) { hideTips(); }
    });
    $("#b-overlay").click(hideTips);
    $('#show-tips').off("click");
    $('#show-tips').click(hideTips);
    $("#b-overlay-popup").click(function(e) { e.stopPropagation(); });
}
function addCloseButton() {
    $("#b-overlay-popup").append(`
        <button id="tips-close-bttn" class="tos-bttn">Close</button>`);
    $('#tips-close-bttn').click(hideTips)
}
function getSearchTipsHtml() {
    return `
        <h3>Tips for searching</h3>
        <ul> 
            <br><li><strong>To search by specific interaction or habitat types</strong>, click on the 
            filter menu of the Type or Habitat columns and select which ones to include in your search.  
            (<a href="definitions">Click here to see definitions</a> 
            for each interaction and habitat type.)</li>
            <br><li><strong>Interested in knowing all the fruit species known from a bat species’ 
            diet?</strong> Search for the bat species by selecting "Taxon" in the "Group Interactions by"
            field, then select "Bat" below in the "Group Taxon by" field, and then select only “Fruit” and “Seed” in the filter 
            menu for the Tags column on the table. This will provide you with a list of all plant species known to have their 
            fruit consumed, seeds consumed, and seeds dispersed by that particular bat species.</li>
            <br><li><strong>Or all of the flower species known from a bat species’ diet?</strong> 
            Search for the bat species as described above, then select only “Flower” in the filter menu for the Tags column
            on the table. This will provide you with a list of all plant species known to have their flowers visited, consumed, 
            or pollinated by that particular bat species.</li>
            <br><li><strong>Interested in knowing all of the bat species known to visit or 
            pollinate a particular plant species/genus/family?</strong> Select "Taxon" for "Group Interactions by" 
            and then "Plant" for “Group Taxa by” in the field below. You can narrow the search by selecting
            family, genus, or species in the menu to the right. Next, select only “Flower” in the filter menu for the 
            Tags column on the table. This will provide information on the bats that visited 
            the flower as well as those that have been confirmed pollinating it.</li><br>
            <li><strong>Want to see all interactions for a particular bat species/genus/family on a map?</strong> 
            Search for the bat as described above, filtering as desired, and then click “Show Interactions on Map”. 
            All interactions with GPS data will be displayed on the map.</li>
            <br><li><b>Follow along with the tutorial for a guided tour 
            of the search functionality.</b></li><br>
        </ul>
        <p> Note: "csv" stands for comma separated values. The interaction 
        data in the table can be downloaded in this format, as a plain-text file containing tabular 
        data, and can be imported into spreadsheet programs like Excel, Numbers, and Google Sheets.</p>
    `.replace(/\n\s+/g, '');
}