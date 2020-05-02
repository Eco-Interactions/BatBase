/*
 * Displays a popup with various search tips. 
 */
export default function showTips() {                                                    //console.log("show tips called.")
    if (!$('#tips-close-bttn').length) { initSearchTips(); }
    $('#b-overlay-popup').addClass("tips-popup");
    $('#b-overlay, #b-overlay-popup').fadeIn(500);
    $('#show-tips').html("Tips");
    $('#show-tips').off("click");
    $('#show-tips').click(hideTips);
}
function initSearchTips() { 
    $('#b-overlay-popup').html(getSearchTipsHtml());
    bindEscEvents();
}
function hideTips() {
    $('#b-overlay').fadeOut(500, removeTips);
    $('#show-tips').html("Tips");
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