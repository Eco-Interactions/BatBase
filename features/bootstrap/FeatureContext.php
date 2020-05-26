<?php

use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;
use Behat\MinkExtension\Context\RawMinkContext;

// require_once(__DIR__.'/../../vendor/bin/.phpunit/phpunit-5.7/vendor/autoload.php');
// require_once(__DIR__.'/../../vendor/bin/.phpunit/phpunit-5.7/src/Framework/Assert/Functions.php');

/**
 * All application feature methods.
 *
 * Organization:
 *     Events:
 *         beforeSuite
 *         afterFeature
 *     Public Steps:
 *         Database Methods 
 *         Search Page Interactions
 *         Table Interactions
 *         Map Methods
 *         Form Functions
 *         Assertion Steps
 *         Helper Steps
 *         Error Handling
 *     Private Helpers:
 *         Page Interactions
 *         Get from Page
 *         Table Interactions
 *         Misc Util
 *    Data Sync Feature Methods
 */
class FeatureContext extends RawMinkContext implements Context
{    
    private static $dbChanges;
    private $curUser;
    /** Used for mutli-editor testing. */
    private $editor1; 
    private $editor2;

    /**
     * Initializes context.
     *
     * Every scenario gets its own context instance.
     * You can also pass arbitrary arguments to the
     * context constructor through behat.yml.
     */
    public function __construct(){}
/** ---------------- Events ------------------------------------------------- */
    /**
     * @BeforeSuite
     *
     * Creates/Resets test database with fixture data.
     */
    public static function beforeSuite()
    {   
        exec('echo -n \'\' > var/logs/test.log');
        fwrite(STDOUT, "\n\n\n\n\n\n\nLoading database.\n\n\n\n");
        exec('php bin/console doctrine:database:drop --force --env=test');
        exec('php bin/console doctrine:database:create --env=test');
        exec('php bin/console doctrine:schema:create --env=test');
        exec('php bin/console hautelook_alice:fixtures:load --no-interaction --env=test');
    }

    /**
     * @AfterSuite
     *
     * Deletes test database.
     */
    public static function afterSuite()
    {        
        fwrite(STDOUT, "\n\n\nDeleting database.\n\n\n");
        exec('php bin/console doctrine:database:drop --force --env=test');
    }
    /**
     * @AfterFeature
     *
     * Resets back to fixture data.
     */
    public static function afterFeature()
    {
        fwrite(STDOUT, "\n\n\nReloading fixtures.\n\n");
        exec('php bin/console hautelook:fixtures:load --no-interaction --purge-with-truncate --env=test');        
        self::$dbChanges = false;
    }
/** ------------------------- Database Methods -------------------------------*/
    /**
     * @Given the fixtures have been reloaded 
     */
    public function theFixturesHaveBeenReloaded()
    {
        if (!self::$dbChanges) { return; }
        fwrite(STDOUT, "\n\n\nReloading fixtures.\n\n");
        exec('php bin/console hautelook:fixtures:load --no-interaction --purge-with-truncate --env=test');        
        self::$dbChanges = false;
    }

    /**
     * @Given the database has loaded
     */
    public function theDatabaseHasLoaded()
    {
        $this->spin(function(){
            return $this->getUserSession()->evaluateScript("$('#filter-status').text() === 'No Active Filters.';");
        }, 'The database did not load as expected', 10);
    }

/** -------------------------- Search Page Interactions --------------------- */
    /**
     * @Given I exit the tutorial
     */
    public function iExitTheTutorial()
    {   
        $this->spin(function(){
            $this->getUserSession()->executeScript("$('.introjs-overlay').click();");
            return $this->getUserSession()->evaluateScript("!$('.introjs-overlay').length");
        }, 'Tutorial not closed.');
    }

    /**
     * @Given the database table is in :entity view
     */
    public function theDatabaseTableIsInFocus($entity)
    {
        $vals = ['Taxon' => 'taxa', 'Location' => 'locs', 'Source' => 'srcs'];
        $newElems = ['Taxon' => '#selSpecies', 'Location' => '#selRegion', 'Source' => '#selPubType'];
        $this->changeTableSort('#search-focus', $vals[$entity], $newElems[$entity]);
    }
    /**
     * @Given I display locations in :loc View
     */
    public function iDisplayLocationsInView($loc)
    {        
        $vals = ['Map' => 'map', 'Table' => 'tbl'];
        $newElems = ['Map' => '#map', 'Table' => '#search-tbl'];
        $this->changeTableSort('#sel-view', $vals[$loc], $newElems[$loc]);
    }

    /**
     * @Given I group interactions by :type
     */
    public function iGroupInteractionsBy($type)
    {
        $vals = ['Authors' => 'auths', 'Publications' => 'pubs', 'Bats' => 1, 
            'Arthropoda' => 3, 'Plants' => 2, 'Publishers' => 'publ'];
        $newElems = ['Authors' => 'input[name="selAuthor"]', 'Publications' => '#selPubType', 
            'Bats' => '#selSpecies', 'Arthropoda' => '#selOrder', 'Plants' => '#selSpecies',
            'Publishers' => 'input[name="selPublisher"]'];
        $this->changeTableSort('#sel-view', $vals[$type], $newElems[$type]);
    }

    /**
     * @When I select the Location view :view
     */
    public function iSelectTheLocationView($view)
    {
        $this->changeTableSort('#sel-view', 'map', '#map');
    }


    /**
     * @When I select :modType :selType from the list modification panel
     */
    public function iSelectFromTheListModificationPanel($modType, $selType)
    {
        $vals = [ 'All Shown' => 'all', 'Select Rows' => 'some'];
        $val = $vals[$selType];
        $radio = $this->getUserSession()->getPage()->find('css', "#mod-".$val."-list");  
        $this->handleNullAssert($radio, false, 'No [$selType] radio found.');
        $radio->click();
        $this->spin(function() use ($val, $selType) {
            return $this->getUserSession()->evaluateScript("$('input#mod-".$val."-list:checked').val() == 'on'");
            }, "The [$selType] radio is not checked.");
    }

    /**
     * @Given I toggle :state the data lists panel
     * Refactor combin with filter panel
     */
    public function iToggleTheDataListsPanel($state)
    {
        $isClosed = $this->getUserSession()->evaluateScript("$('#list-pnl').hasClass('closed');");
        if ($isClosed && $state == 'close' || !$isClosed && $state == 'open') { return; }
        $dataListsPanel = $this->getUserSession()->getPage()->find('css', '#lists');  
        if (!$dataListsPanel) { $this->iPutABreakpoint('"Lists" button not found.'); }
        $dataListsPanel->click();
        /* -- Spin until finished -- */      
        $this->spin(function() use ($state){
            $closed = $this->getUserSession()->evaluateScript("$('#list-pnl').hasClass('closed');"); 
            if ($closed && $state == 'close' || !$closed && $state == 'open') { return true; }
        }, 'Data Lists panel not ' . ($state == 'open' ? "expanded" : "collapsed"));
    }

    /**
     * @Given I toggle :state the filter panel
     */
    public function iToggleTheFilterPanel($state)
    {
        $isClosed = $this->getUserSession()->evaluateScript("$('#filter-pnl').hasClass('closed');"); 
        if ($isClosed && $state == 'close' || !$isClosed && $state == 'open') { return; }
        $toggleBttn = $this->getUserSession()->getPage()->find('css', '#filter');  
        if (!$toggleBttn) { $this->iPutABreakpoint('"Filters" button not found.'); }
        $toggleBttn->click();

        $this->spin(function() use ($state, $toggleBttn) {
            sleep(1);
            $closed = $this->getUserSession()->evaluateScript("$('#filter-pnl').hasClass('closed');"); 
            if ($closed && $state == 'close' || !$closed && $state == 'open') { return true; }
        }, 'Filter panel not ' . ($state == 'open' ? "expanded" : "collapsed"));
    }

    /**
     * @When I select :text from the :label dropdown
     * Search page elems.
     */
    public function iSelectFromTheDropdown($text, $label)
    {                                                                           //fwrite(STDOUT, "\niSelectFromTheDropdown\n");
        $vals = [ 'Artibeus lituratus' => 13, 'Costa Rica' => 24, 'Journal' => 1, 
            'Book' => 2, 'Article' => 3, 'Map Data' => 'map', 'Test Filter Set' => 1,
            'Test Interaction List' => 1, 'Panama' => 12 ];
        $val = array_key_exists($text, $vals) ? $vals[$text] : $text;
        $selId = '#sel'.str_replace(' ','',$label);
        $this->spin(function() use ($selId, $val)
        {
            $elem = $this->getUserSession()->getPage()->find('css', $selId);
            if (!$elem) { return false; }
            $this->getUserSession()->
                executeScript("$('$selId')[0].selectize.addItem('$val');");
            return true;
        }, "Couldn't select [$val] from the [$selId] elem.");
    }

    /**
     * @When I type :text in the :type text box and press enter
     */
    public function iTypeInTheTextBoxAndPressEnter($text, $type)
    {
        $input = $this->getUserSession()->getPage()->find('css', 'input[name="sel'.$type.'"]');
        $input->setValue($text);
        $input->keypress('13');
    }

    /**
     * @When I enter :text in the :label dropdown
     */
    public function iEnterInTheDropdown($text, $label)
    {
        $selId = '#sel'.str_replace(' ','',$label);
        try {
            $this->getUserSession()->executeScript("$('$selId')[0].selectize.createItem('$text');");
        } catch (Exception $e) {
            $this->iPutABreakpoint("Couldn't find dropdown [$selId]");
        }
    }

    /**
     * @When I click on the map pin for :text
     */
    public function iClickOnTheMapPinFor($text)
    {
        $this->spin(function() use ($text){
            $row = $this->getTableRow($text);
            if (!$row) { return false; }
            $pin = $row->find('css', '[alt="Map Icon"]');
            if (!$pin) { return false; }
            $pin->click();
            return true;
        }, "Couldn't click [$text] row map pin.");
    }
/**---------------------- Table Interactions ---------------------------------*/
    /**
     * @Given I filter the table to interactions created today
     */
    public function iFilterTheTableToInteractionsCreatedToday()
    {
        $this->iToggleTheFilterPanel('open');
        $this->iSetTheDateFilterTo('updated', 'today');
        $this->iToggleTheFilterPanel('close');
        
        $this->spin(function() {
            $checked = $this->getUserSession()->evaluateScript("$('#shw-chngd').prop('checked');");
            return $checked;
        }, 'Date filter checkbox not checked.');
    }

    /**
     * @Given I click on the edit pencil for the :text row
     */
    public function iClickOnTheEditPencilForTheRow($text)
    {
        $this->spin(function() use ($text){
            $row = $this->getTableRow($text);
            if (!$row) { return false; }
            $this->clickRowEditPencil($row, $text);
            return true;
        }, "Couldn't find [$text] row edit pencil. ");
    }

    /**
     * @When I change the :prop field :type to :text
     */
    public function iChangeTheFieldTo($prop, $type, $text)
    { 
        $map = [ "taxon name" => "#txn-name", 'Edition' => '#Volume_row input' ];
        $curForm = $this->getOpenFormId();
        $field = array_key_exists($prop, $map) ? $map[$prop] :
            '#'.str_replace(' ','',$prop).'_row '.$type; 
        $selector = $curForm.' '.$field;
        $this->addValueToFormInput($selector, $text);
        $this->assertFieldValueIs($text, $selector);
    }

    /**
     * @When I expand :text in the data tree
     */
    public function iExpandInTheDataTree($text)
    {
        $this->spin(function() use ($text) {
            $treeNode = $this->getRowTreeNode($text);  
            if (!$treeNode) { return false; }  
            $treeNode->doubleClick();
            if (!$this->isRowExpanded($treeNode)) { $treeNode->click(); } //needed for one weird instance of this step "OGenus Species" epxnasion
            return $this->isRowExpanded($treeNode);
        }, "Couldn't expand [$text] row.");  
    }

    /**
     * @When I collapse :text in the data tree
     */
    public function iCollapseInTheDataTree($text)
    {
        $this->spin(function() use ($text) {
            $treeNode = $this->getRowTreeNode($text);  
            if (!$treeNode) { return false; }
            $treeNode->doubleClick();
            return $this->isRowExpanded($treeNode) == false;
        }, "Could not collapse [$text] row.");
    }
    /**
     * @When I expand :txt in level :num of the data tree
     */
    public function iExpandInLevelOfTheDataTree($txt, $num)
    {
        $row = null;
        $this->spin(function() use(&$row, $txt, $num){
            $treeNodes = $this->getUserSession()->getPage()->findAll('css', 'div.ag-row-level-'.--$num.' [colid="name"]');  
            if (!$treeNodes) { return false; }
            for ($i=0; $i < count($treeNodes); $i++) { 
                if ($treeNodes[$i]->getText() === $txt) { $row = $treeNodes[$i]; break;}
            }
            return $row;
        }, "Didn't find the [$txt] tree node.");
        $row->doubleClick();
    }

    /**
     * @Then the count column should show :count interactions
     */
    public function theCountColumnShouldShowInteractions($count)
    {
        $this->spin(function() use ($count){
            $colCnt = $this->getUserSession()->evaluateScript('$("[row=0] [colId=\"intCnt\"]").text()');
            return $this->ifContainsText($colCnt, $count);
        }, "Count coulmn does not show [$count] interactions.");
    }
    /**
     * @Then data in the interaction rows
     * @Then I should see data in the interaction rows
     * Note: Data is checked in the Subject Taxon column only.
     */
    public function dataInTheInteractionRows()
    {   
        $this->spin(function(){
            $subj = $this->getUserSession()->evaluateScript('$("[colid=\"subject\"] span").text()');
            return $subj;
        }, 'No data found in the interaction rows.');
    }

    /**
     * @Then I (should) see :count row(s) in the table data tree
     */
    public function iShouldSeeRowsInTheTableDataTree($count)
    {
        $this->spin(function() use ($count) {
            $rowCnt = $this->getUserSession()->evaluateScript('$(".ag-body-container>div").length');
            return !$rowCnt ? false : ($count == $rowCnt);
        }, "Didn't find the expected [$count] rows in the table data tree.");
    }

    /**
     * @Then I should see :text in the tree
     */
    public function iShouldSeeInTheTree($text)
    {   
        $this->spin(function() use ($text){
            return $this->isInDataTree($text);            
        }, "[$text] is not displayed in table data-tree.");
    }    

    /**
     * @Then I should not see :text in the tree
     */
    public function iShouldNotSeeInTheTree($text)
    {   
        $this->spin(function() use ($text){
            return !$this->isInDataTree($text);            
        }, "[$text] should not be displayed in table data-tree.");
    }    

    /**
     * @Then I should see :count interaction(s) under :nodeTxt
     */
    public function iShouldSeeInteractionsUnder($count, $nodeTxt)
    {
        $this->iExpandInTheDataTree($nodeTxt);
        $rows = $this->getInteractionsRows($nodeTxt); 
        $this->handleEqualAssert(count($rows), $count, true, 
            "Found [". count($rows)."] rows under $nodeTxt. Expected $count");
    } 

    /**
     * @Then I should see :count interactions attributed
     */
    public function iShouldSeeInteractionsAttributed($count)
    {
        $rows = $this->getInteractionsRows(); 
        $this->handleEqualAssert(count($rows), $count, true, 
            "Found [". count($rows)."] interaction rows. Expected [$count]");
    }

    /**
     * @Then the expected data in the interaction row
     * @Then the expected data in the :focus interaction row
     */
    public function theExpectedDataInTheInteractionRow($focus = null)
    {
        // $cols = [ 'subject', 'object', 'interactionType', 'tags', 'citation', 
        //     'habitat', 'location', 'country', 'region', 'note' ];
        // if ($focus) { unset($cols[array_search($focus ,$cols)]); }
        // $this->spin(function() {
        //     $intRows = $this->getInteractionsRows();

        //     foreach ($intRows as $row) {
        //         foreach ($cols as $colId) {            
        //             $selector = '[colid="'.$colId.'"]';
        //             $data = $row->find('css', $selector); 
        //             return $data->getText();
        //         }
        //     }
        // }, "No data found in at least one interaction column.");
    }

    /**
     * @Then I should see :text under :parentTxt in the tree
     */
    public function iShouldSeeUnderInTheTree($text, $parentTxt)
    {
        $this->spin(function () use ($text, $parentTxt) {
            $this->iExpandInTheDataTree($parentTxt);
            $row = $this->getTableRow($text);
            if (!$row) { return false; }
            $this->iCollapseInTheDataTree($parentTxt);
            return true;
        }, "\nDid not find [$text] under [$parentTxt]");  
    }

    /**
     * @Then I should not see :text under :parentNode in the tree
     */
    public function iShouldNotSeeUnderInTheTree($text, $parentNode)
    {
        $this->iExpandInTheDataTree($parentNode);
        $row = $this->getTableRow($text);
        $this->handleNullAssert($row, true, "Shouldn't have found $text under $parentNode.");
    }

    /**
     * @Then I should see :cnt interactions in the list
     */
    public function iShouldSeeInteractionsInTheList($cnt)
    {
        $this->spin(function() use ($cnt) {
                $curCnt = $this->getUserSession()->evaluateScript("$('#int-list-cnt').text().match(/\d+/)[0];");
                return $curCnt == $cnt;
            }, "Didn't find [$cnt] interactions in the list."
        );
    }

    /**
     * @Given I should see :cnt interactions in the table
     */
    public function iShouldSeeInteractionsInTheTable($cnt)
    {
        $this->spin(function() use ($cnt) {
                $curCnt = $this->getUserSession()->evaluateScript("$('#tbl-cnt').text().match(/\d+/)[0];");
                return $curCnt == $cnt;
            }, "Didn't find [$cnt] interactions in the table."
        );
    }
/** ------------------ Map Methods -------------------------------------------*/
    /**
     * @When I click on a map marker
     */
    public function iClickOnAMapMarker()
    {
        $marker = $this->getUserSession()->getPage()->find('css', '.leaflet-marker-icon');
        $this->handleNullAssert($marker, false, "Couldn't find marker on the map.");
        try {
            $marker->doubleClick();    
        } catch (Exception $e) {
            $this->iPutABreakpoint("Couldn't click elem.");
        }
    }
    /**
     * @When I click on the map
     */
    public function iClickOnTheMap()
    {
        $this->getUserSession()->executeScript("$('#loc-map').click();");
    }
    /**
     * @Given I press the :type button in the map
     */
    public function iPressTheButtonInTheMap($type)
    {
        $selector = [
            'New Location' => '.leaflet-control-create-icon',
            'Click to select position' => '.leaflet-control-click-create-icon'
        ][$type];
        $this->spin(function() use ($type, $selector) {
            $bttn = $this->getUserSession()->getPage()->find('css', $selector);
            if (!$bttn) { return false; }
            $bttn->click();
            return true;
        }, "Could not press the [$type] button.");
    }

    /**
     * @When I see the country's polygon drawn on the map
     */
    public function iSeeTheCountrysPolygonDrawnOnTheMap()
    {
        // usleep(5000000);
        // $poly = $this->getUserSession()->getPage()->find('css', 'path.leaflet-interactive');
        // $this->handleNullAssert($poly, false, 'No polygon found on map');
    }

    /**
     * @When I press :bttnText in the added green pin's popup
     */
    public function iPressInTheAddedGreenPinsPopup($bttnText)
    {
        $this->clickOnPageElement('.leaflet-marker-icon.new-loc');
        $this->clickOnPageElement("input[value='$bttnText']");
    }

    /**
     * @Then I should see the map loaded
     */
    public function iShouldSeeTheMapLoaded()
    {
        $mapTile = $this->getUserSession()->getPage()->find('css', '.leaflet-tile-pane');
        $this->handleNullAssert($mapTile, false, 'No map tiles found.');
    }

    /**
     * @Then I should see :mCount location markers
     * @Then I should see :mCount location markers and :cCount location clusters
     * Note: Cluster count returns one extra for some reason I have yet to identify
     */
    public function iShouldSeeLocationMarkers($mCount, $cCount)
    {
        $markers = $this->getUserSession()->getPage()->findAll('css', 'img.leaflet-marker-icon');
        if ($cCount) {
            $clusters = $this->getUserSession()->getPage()->findAll('css', 
                'div.leaflet-marker-icon');  
            $this->handleEqualAssert(count($clusters), $cCount+1, true, 'Found ['.count($clusters)."] clusters. Expected [$cCount].");
        }
        $this->handleEqualAssert(count($markers), $mCount, true, 'Found ['.count($markers)."] markers. Expected [$mCount].");
    }

    /**
     * @Then I click on an existing location marker
     */
    public function iClickOnAnExistingLocationMarker()
    {
        $markers = $this->getUserSession()->getPage()->findAll('css', 'img.leaflet-marker-icon');
        $this->handleNullAssert($markers, false, 'No markers found on map.');
        $markers[0]->click();
    }

    /**
     * @Then the map should close
     */
    public function theMapShouldClose()
    {
        $map = $this->getUserSession()->getPage()->find('css', '#loc-map');
        $this->handleNullAssert($map, true, 'Map should not be displayed, and yet...');
    }

    /**
     * @Then the coordinate fields should be filled
     */
    public function theCoordinateFieldsShouldBeFilled()
    {
        $this->iPutABreakpoint("theCoordinateFieldsShouldBeFilled");
    }

    /**
     * @Then the marker's popup should have a description of the position 
     * Note: The description is derived from the reverse geocode results.
     */
    public function theMarkersPopupShouldHaveADescriptionOfThePosition()
    {
        $this->iPutABreakpoint("theMarkersPopupShouldHaveADescriptionOfThePosition");
    }
/* ---------------- Assertion Steps ----------------------------------------- */
    /**
     * @When I should see :text in the save modal
     */
    public function iShouldSeeInTheSaveModal($text)
    {
        $this->spin(function() use ($text) {
                $modalText = $this->getUserSession()->evaluateScript("$('.introjs-tooltiptext').text();");  
                return strpos($modalText, $text) !== false;
            }, "Did not find [$text] in the modal."
        );
    }

    /**
     * @Then I should see :text in the filter status bar
     */
    public function iShouldSeeInTheFilterStatusBar($text)
    {
        $this->spin(function() use ($text) {
                $filterMsg = $this->getUserSession()->evaluateScript("$('#filter-status').text();");  
                return strpos(strtolower($filterMsg), strtolower($text)) !== false;
            }, "Did not find [$text] in the filter status bar."
        );
    }
    /**
     * @Then I should see the map with the location summary popup
     */
    public function iShouldSeeTheMapWithTheLocationSummaryPopup()
    {
        $popup = $this->getUserSession()
            ->evaluateScript("$('.leaflet-popup-content-wrapper').length > 0;");
        $this->handleEqualAssert($popup, true, true, "Location summary popup not displayed.");
    }

    /**
     * @Then I should see :text in the :label dropdown
     */
    public function iShouldSeeInTheDropdown($text, $label)
    {
        $selId = '#sel'.str_replace(' ','',$label);
        $this->spin(function() use ($text, $selId) {
            $selector = $selId.' option:selected';  
            $selected = $this->getUserSession()->evaluateScript("$('$selector').text();");  
            return $text == $selected;
        }, "Did not find [$text] in the [$selId] field.");
    }
    /**
     * @Then I should see the map with markers 
     * @Then I should see markers on the map
     */
    public function iShouldSeeTheMapWithMarkers()
    {
        $markers = $this->getUserSession()->evaluateScript("$('.leaflet-marker-icon').length > 0;");
        $this->handleNullAssert($markers, false, "Map did not update as expected. No markers found.");
    }

    /**
     * @Then I should see :count interactions shown on the map
     */
    public function iShouldSeeInteractionsShownOnTheMap($count)
    {
        $this->spin(function() use ($count) {
            $legendTxt = $this->getUserSession()->evaluateScript("$('#int-legend').text()");
            return strpos($legendTxt, $count . ' shown');
        }, "Did not find [$count] in the map interaction count legend.");
    }

    /**
     * @Then I should see :text in popup
     */
    public function iShouldSeeInPopup($text)
    {
        $this->spin(function() use ($text) {
            $elem = $this->getUserSession()->getPage()->find('css', '.leaflet-popup-content');
            if (!$elem) { return false; }
            return strpos($elem->getHtml(), $text) !== false;
        }, "Did not find [$text] in the map popup.");
    }
/**------------------- Form Functions ----------------------------------------*/
    /**
     * @Given I open the new Interaction form
     */
    public function iOpenTheNewInteractionForm()
    {
        $this->getUserSession()->getPage()->pressButton('New');
    }

    /**
     * @Given I enter :text in the :prop form dropdown 
     */
    public function iEnterInTheFormDropdown($text, $prop)
    {
        $selId = '#'.str_replace(' ','',$prop).'-sel';
        try {
            $this->getUserSession()->executeScript("$('$selId')[0].selectize.createItem('$text');");
        } catch (Exception $e) {
            $this->iPutABreakpoint("Couldn't find dropdown [".$selId."]");
        }
    }

    /**
     * @When I change the :prop form dropdown to :text
     */
    public function iChangeTheFormDropdownTo($prop, $text)
    {
        $map = [ "taxon level" => "#txn-lvl" ];
        $selId = array_key_exists($prop, $map) ? $map[$prop] :
            '#'.str_replace(' ','',$prop).'-sel';  
        $this->selectValueInCombobox($selId, $text);
    }

    /**
     * @When I change the :prop dynamic dropdown field to :text
     */
    public function iChangeTheDynamicDropdownFieldTo($prop, $text)
    {
        $this->iSelectFromTheDynamicDropdown($text, $prop, false);     
    }
    
    /**
     * @When I add :text to the :prop dynamic dropdown 
     */
    public function iAddToTheDynamicDropdown($text, $prop)
    {
        $this->iSelectFromTheDynamicDropdown($text, $prop, true);     
    }


    /**
     * @Given I focus on the :role taxon field
     * @Given I focus on the :role combobox
     */
    public function iFocusOnTheTaxonField($role)
    {
        $selId = '#'.$role.'-sel';

        $this->spin(function() use ($selId) {
            $this->getUserSession()->executeScript("$('$selId')[0].selectize.focus();");
            return $this->getUserSession()->getPage()->find('css', "#sub-form");
        }, "[$role] select form not opened.");
    }

    /**
     * @Given I pin the :prop field
     */
    public function iPinTheField($prop)
    {
        $selector = '#'.str_replace(' ','',$prop).'_pin';
        $this->getUserSession()->executeScript("$('$selector').click();");
        $checked = $this->getUserSession()->evaluateScript("$('$selector').prop('checked');");
        $this->handleEqualAssert($checked, true, true, "The [$prop] field is not checked.");
    }
    
    /**
     * @Given I fill the new interaction form with the test values
     */
    public function iFillTheNewInteractionFormWithTheTestValues()
    {
        $srcLocData = [ 'Publication' => 'Test Book with Editors', 
            'Citation Title' => 'Test Title for Chapter', 
            'Country-Region' => 'Costa Rica', 'Location' => 'Test Location With GPS'];
        $this->fillSrcAndLocFields($srcLocData);
        $taxaData = ['Genus' => 'SGenus', 'Species' => 'OGenus Species'];
        $this->fillTaxaFields($taxaData);
        $miscData = [ 'Consumption', 'Leaf', 'Detailed interaction notes.'];
        $this->fillMiscIntFields($miscData);
    }

    /**
     * @Given I click on the edit pencil for the first interaction of :nodeTxt
     */
    public function iClickOnTheEditPencilForTheFirstInteractionOf($nodeTxt)
    {
        $this->iExpandInTheDataTree($nodeTxt);
        $intRows = $this->getInteractionsRows();  
        $this->clickRowEditPencil(reset($intRows));
    }

    /**
     * @When I exit the form window
     */
    public function iExitTheFormWindow()
    {
        try {
            $this->getUserSession()->executeScript("$('#exit-form').click();");
        } catch (Exception $e) {
            $this->iPutABreakpoint('Error while exiting form.');
            // print($e);
        }
    }

    /**
     * @When I wait for form to submit successfully
     */
    public function iWaitForFormToSubmitSuccessfully()
    {
        $this->getUserSession()->wait( 5000, "!$('#c-overlay').length");
    }

    /**
     * @When I type :text in the :prop field :type
     */
    public function iTypeInTheField($text, $prop, $type)
    {
        $map = [ 'Edition' => 'Volume', 'Chapter Title' => 'Title' ];
        $name = array_key_exists($prop, $map) ? $map[$prop] : $prop;
        $field = '#'.str_replace(' ','',$name).'_row '.$type;
        $curForm = $this->getOpenFormId();
        $selector = $curForm.' '.$field;
        $this->addValueToFormInput($selector, $text);
    }

    /**
     * @When I select :text from the :prop form dropdown
     */
    public function iSelectFromTheFormDropdown($text, $prop)
    {
        $selId = '#'.str_replace(' ','',$prop).'-sel';
        $this->selectValueInCombobox($selId, $text);
    }

    /**
     * @When I select :text from the :prop dynamic dropdown
     * Note: Changes the last empty ($new) dropdown, or the last filled (!$new).
     */
    public function iSelectFromTheDynamicDropdown($text, $prop, $new = true)
    {
        $count = $this->getCurrentFieldCount($prop); 
        $cnt = $new ? $count : --$count;
        $selId = '#'.str_replace(' ','',$prop).'-sel'.$cnt;                     
        $this->selectValueInCombobox($selId, $text);
        $this->blurNextDynamicDropdown($selId, $count);
    }

    private function blurNextDynamicDropdown($prevId, $count)
    {
        $selId = substr($prevId, 0, -1).$count;
        $this->getUserSession()->executeScript("$('$selId')[0].selectize.blur();");
    }

    /**
     * @When I uncheck the date-updated filter
     */
    public function iUncheckTheDateUpdatedFilter()
    {
        $this->iToggleTheFilterPanel('open');
        $this->toggleTheDateFilter(false);
        $this->iToggleTheFilterPanel('close');
    }
    /**
     * @Given I set the date :type filter to :date
     */
    public function iSetTheDateFilterTo($type, $date)
    {
        $initialCount = $this->getUserSession()->evaluateScript("$('#tbl-cnt').text().match(/\d+/)[0];");
        $this->setDateFilterDefault($date);
        $this->toggleTheDateFilter(true);
        $this->iSelectFromTheDropdown($type, 'Date Filter');
        $this->clickOnPageElement('#filter-col1');
        $this->spin(function() use ($initialCount) {
            $postCount = $this->getUserSession()->evaluateScript("$('#tbl-cnt').text().match(/\d+/)[0];");
            return $postCount !== $initialCount && $postCount > 0;
            }, "Date did not update as expected. type = [$type]. date = [$date]. initial [$initialCount]. (After can't be zero)");
        $this->setDateFilterDefault($date, 'remove');
    }

    /**
     * @When I enter :text in the :prop dynamic dropdown
     */
    public function iEnterInTheDynamicDropdown($text, $prop)
    {
        $count = $this->getCurrentFieldCount($prop);
        $selId = '#'.str_replace(' ','',$prop).'-sel'.$count; 

        $this->spin(function() use ($selId, $text) {  
            $this->getUserSession()->executeScript("$('$selId')[0].selectize.createItem('$text');");
            return $this->getUserSession()->getPage()->find('css', '#sub2-hdr');
        }, "New $prop form malfunctioning.");
    }

    /**
     * @When I add the :text interaction tag
     */
    public function iAddTheInteractionTag($text)
    {                                                                           //fwrite(STDOUT, "\niAddTheInteractionTag\n");
        $val = $this->getValueToSelect('#InteractionTags-sel', $text);
        $this->spin(function() use ($val, $text) { 
            $this->getUserSession()->executeScript(
                "$('#InteractionTags-sel')[0].selectize.addItem('$val');");
            return $this->textContainedInField($text, '#InteractionTags-sel');
        }, "[$text] tag wasn't added as expected.");        
    }

    /**
     * @When I remove the :text interaction tag
     */
    public function iRemoveTheInteractionTag($text)
    {                           
        $val = $this->getValueToSelect('#InteractionTags-sel', $text);
        $this->spin(function() use ($val, $text) { 
            $this->getUserSession()->executeScript(
                "$('#InteractionTags-sel')[0].selectize.removeItem('$val');");
            return $this->textContainedInField($text, '#InteractionTags-sel', false);
        }, "[$text] tag wasn't removed as expected.");  
    }

    /**
     * @When I see :text in the :prop field :type
     */
    public function iSeeInTheField($text, $prop, $type)
    {
        $field = '#'.str_replace(' ','',$prop).'_row '.$type;
        $selector = $this->getOpenFormId().' '.$field;   
        $this->assertFieldValueIs($text, $selector);
    }
    
    /**
     * @When I see the location's pin on the map
     * @When I see the :type location's pin on the map
     */
    public function iSeeTheLocationsPinOnTheMap($type = null)
    {
        $class = '.leaflet-marker-icon';
        $msg = 'Marker not found on map';
        if ($type === 'new') { 
            $class = $class.'.new-loc';
            $msg = 'New Location marker not found on map';
        }
        $this->spin(function() use ($class, $msg) {
            $marker = $this->getUserSession()->evaluateScript("$('$class').length > 0");
            return $marker !== null;
        }, $msg);
    }


    /**
     * @Then I should see the :text interaction tag
     */
    public function iShouldSeeTheInteractionTag($text)
    {
        $this->textContainedInField($text, '#InteractionTags-sel');
    }

    /**
     * @Then I should not see the :text interaction tag
     */
    public function iShouldNotSeeTheInteractionTag($text)
    {
        $this->textContainedInField($text, '#InteractionTags-sel', false);
    }

    /**
     * @Then I should see :text in the :prop dynamic dropdown
     */
    public function iShouldSeeInTheDynamicDropdown($text, $prop)
    {
        $count = $this->getCurrentFieldCount($prop);     
        $selId = '#'.str_replace(' ','',$prop).'-sel#';  

        $this->spin(function() use ($text, $count, $selId) {
            while ($count > 0) {
                $selId = substr($selId, 0, -1).$count;
                $selector = $selId.' option:selected';  
                $selected = $this->getUserSession()->evaluateScript("$('$selector').text();"); 
                if ($text == $selected) { return true; }
                --$count;
            }
        }, "Did not find [$text] in [$selId].");
    }

    /**
     * @Then I should see :text in the :entity detail panel
     */
    public function iShouldSeeInTheDetailPanel($text, $entity)
    {
        $elemId = '#'.strtolower(substr($entity , 0, 3)).'-det'; 
        $elem = $this->getUserSession()->getPage()->find('css', $elemId);
        $this->handleContainsAssert($text, $elem->getHtml(), true, 
             "Should have found [$text] in [$entity] details");
    }

    /**
     * @Then I should see :text in the :prop field :type
     */
    public function iShouldSeeInTheField($text, $prop, $type)
    {
        $map = [ 'Edition' => 'Volume' ];
        $name = array_key_exists($prop, $map) ? $map[$prop] : $prop;
        $field = '#'.str_replace(' ','',$name).'_row '.$type;
        $curForm = $this->getOpenFormId();
        $selector = $curForm.' '.$field;      
        $this->assertFieldValueIs($text, $selector);        
    }

    /**
     * @Then I should see :text in the :prop form dropdown 
     */
    public function iShouldSeeInTheFormDropdown($text, $prop)
    {
        $selId = '#'.str_replace(' ','',$prop).'-sel';
        $selector = $selId.' option:selected';  
        $this->getUserSession()->wait(10000, "$('$selector').text() == '$text';");
        $this->assertFieldValueIs($text, $selector);
    }
    /**
     * @Then I (should) see :text in the form header
     */
    public function iShouldSeeInTheFormHeader($text)
    {
        $this->getUserSession()->wait( 10000, "$('#form-main p').length;");
        $elem = $this->getUserSession()->getPage()->find('css', '#form-main p');
        $html = $elem->getHtml();
        $this->handleNullAssert($html, false, 'Nothing found in header. Expected ['.$text.']');
        $this->handleContainsAssert($text, $html, true, 
             "Should have found [$text] in the form header.");
    }

    /**
     * @Then the :prop field should be empty
     */
    public function theFieldShouldBeEmpty($prop)
    {
        $map = [ 'Note' => '#Note_row textarea' ];
        $selector = $map[str_replace(' ','',$prop)];
        $val = $this->getUserSession()->evaluateScript("$('$selector')[0].innerText"); 
        $this->handleEqualAssert($val, '', true, "The [$prop] should be empty.");
    }

    /**
     * @Then the :prop select field should be empty
     */
    public function theSelectFieldShouldBeEmpty($prop)
    {
        $selector = '#'.str_replace(' ','',$prop).'-sel';
        $val = $this->getUserSession()->evaluateScript("$('$selector')[0].selectize.getValue();"); 
        if (is_array($val)) {
            foreach ($val as $value) { if ($value) { $val = false; } }
            if ($val !== false) { $val = ''; }
        }
        $this->handleEqualAssert($val, '', true, "The [$prop] should be empty.");
    }

    /**
     * @Then I should see the table displayed in :entity view
     */
    public function iShouldSeeTheTableDisplayedInView($entity)
    {
        $map = [ 'Location' => 'locs', 'Taxon' => 'taxa', 'Source' => 'srcs' ];
        $view = $this->getUserSession()->
            evaluateScript("$('#search-focus')[0].selectize.getValue();");
        $this->handleEqualAssert($view, $map[$entity], true, 
            "DB in [$view] view. Expected [$map[$entity]]");
    }

    /**
     * @Then I add the data from all from previous scenarios in this feature
     */
    public function iAddTheDataFromAllFromPreviousScenariosInThisFeature()
    {
        throw new PendingException();
    }
/** ---------------------- Helper Steps --------------------------------------*/
    /**
     * @Given I see :text
     */
    public function iSee($text)
    {
        $this->spin(function() use ($text) {
            try {
                $this->assertSession()->pageTextContains($text);
            } catch (Exception $e) { return false; 
            } finally { return true; }
        }, "Did not find [$text] anywhere on page.");
    }
    /**
     * @Given I click on :text link
     */
    public function iClickOnLink($text)
    {
        $map = ['use the map interface' => '.map-link'];
        $link = $this->getUserSession()->getPage()->find('css', $map[$text]);
        $link->click();
    }
    /**
     * @When I check the :text box
     */
    public function iCheckTheBox($text)
    {
        $this->spin(function() {
            $form = $this->getOpenFormPrefix();
            $selector = '#'.$form.'-all-fields';
            $checkbox = $this->getUserSession()->getPage()->find('css', $selector);
            if (!$checkbox) { return false; }
            $checkbox->check();  
            return $checkbox->isSelected();
        }, 'Could not check "Show all fields".');
    }

    /**
     * @When I wait for the :level form to close
     */
    public function iWaitForTheFormToClose($level)
    {
        $this->spin(function() use ($level) {
            $form = $this->getUserSession()->getPage()->find('css', "#$level-form");
            return !$form;
        }, "Form [$level] did not close.");
    }
    
    /**
     * @When I press :bttnText :count times
     */
    public function iPressTimes($bttnText, $count)
    {
        for ($i=0; $i < $count; $i++) { 
            $this->getUserSession()->getPage()->pressButton($bttnText);
        }
    }
    // /**
    //  * @When /^(?:|I )click (?:on |)(?:|the )"([^"]*)"(?:|.*)$/
    //  * @Then /^(?:|I )click (?:on |)(?:|the )"([^"]*)"(?:|.*)$/
    //  */
    // public function iClickOn($arg1)
    // {
    //     $findName = $this->getSession()->getPage()->find("css", $arg1);
    //     if (!$findName) {
    //         throw new Exception($arg1 . " could not be found");
    //     } else {
    //         $findName->click();
    //     }
    // }
    /**
     * @When I press the :bttnText button
     */
    public function iPressTheButton($bttnText)
    {
        if (stripos($bttnText, "Update") !== false || 
            stripos($bttnText, "Create") !== false) { self::$dbChanges = true; }

        $this->spin(function() use ($bttnText) {  //fwrite(STDOUT, "bttnText = [$bttnText]");
            try {
                $this->getUserSession()->getPage()->pressButton($bttnText);
            } catch(Exception $e) { return false; 
            } finally { return true; }
        }, "Couldn't interact with button [$bttnText]");

        if ($bttnText === 'Update Interaction') { 
            $this->ensureThatFormClosed(); 
        }
        if ($bttnText === 'Map View') {
            $this->getUserSession()->getPage()->pressButton($bttnText);
        }
    }

/** -------------------- Error Handling ------------------------------------- */        
    /**
     * Pauses the scenario until the user presses a key. Useful when debugging a scenario.
     *
     * @Then (I )break :msg
     * @Then (I )break 
     */
    public function iPutABreakpoint($msg = null)
    {
        if ($msg !== null) { fwrite(STDOUT, "\n".$msg."\n"); } 
        fwrite(STDOUT, "\033[s    \033[93m[Breakpoint] Press \033[1;93m[RETURN]\033[0;93m to continue...\033[0m");
        while (fgets(STDIN, 1024) == '') {}
        fwrite(STDOUT, "\033[u");
        return;
    }
/** ================== PRIVATE HELPER METHODS ======================================================================= */
/** ------------ Page Interactions ------------------------------------------ */
    private function addValueToFormInput($selector, $text)
    {
        $this->spin(function() use ($selector, $text) {
            $input = $this->getUserSession()->getPage()->find('css', $selector);
            if (!$input) { return false; }
            $input->setValue($text);
            $this->getUserSession()->executeScript("$('$selector').change();");        
            return $input->getValue() == $text;
        }, "Could set [$text] in [$selector]");
    }
    private function selectValueInCombobox($selId, $text)
    {                                                                           //fwrite(STDOUT, "\n            selectValueInCombobox - [$text] in [$selId]\n");           
        $val = $this->getValueToSelect($selId, $text); 

        $this->spin(function() use ($selId, $text, $val) {
            $this->getUserSession()->executeScript("$('$selId')[0].selectize.addItem('$val');");
            return $this->getFieldData($selId) == $text;
        }, "Could not select [$text] in [$selId]");
    }
    /**
     * There doesn't seem to be a way to set the date on the flatpickr calendar
     * from these tests. Adding a data property to the calendar elem that will be
     * read on calendar load and set that date as the default for the calendar. 
     * Doesn't quite test the user's input, but should test the filter functionality.
     */
    private function setDateFilterDefault($date, $reset = false)
    {  
        if ($reset) {
            $this->getUserSession()->executeScript("$('#selDateFilter').data('default', false);");    
        } else {
            $this->getUserSession()->executeScript("$('#selDateFilter').data('default', '$date');");
        }
    }

    private function toggleTheDateFilter($state)
    {
        $this->spin(function() use ($state) {
            try {
                $checkbox = $this->getUserSession()->getPage()->find('css', 'input#shw-chngd'); 
                if ($state) { $checkbox->check(); } else { $checkbox->uncheck(); }
                return $checkbox->isSelected() == $state;
            } catch (Exception $e) { return; }            
        }, 'Date filter not ['.($state ? 'en' : 'dis').'abled].');
    }
/** ---------------------- Get From Page -------------------------------------*/
    private function getTableRow($text)
    {
        $row = null;

        $this->spin(function() use ($text, &$row){
            $rows = $this->getAllTableRows();  
            foreach ($rows as $r) {
                $treeNode = $r->find('css', '[colid="name"]');                  //fwrite(STDOUT, "\nrowText = [".$treeNode->getText()."] text = [$text]");
                if ($treeNode->getText() !== $text) { continue; }
                $row = $r; 
                return true;
            }
        }, null);

        return $row;
    }
    private function getAllTableRows()
    {
        $rows = $this->getUserSession()->getPage()->findAll('css', '.ag-body-container .ag-row');
        $this->handleNullAssert($rows, false, 'No nodes found in data tree.');
        return $rows;
    }
    private function getRowTreeNode($text)
    {
        $row = null;

        $this->spin(function() use ($text, &$row){
            $rows = $this->getAllTreeNodes();  
            foreach ($rows as $r) {
                if ($r->getText() !== $text) { continue; }
                $row = $r; 
                return true;
            }
        }, "$text node not found in tree;");

        return $row;                           //fwrite(STDOUT, "\nrowText = [".$treeNode->getText()."] text = [$text]");
    }
    private function getAllTreeNodes()
    {
        $nodes = $this->getUserSession()->getPage()->findAll('css', 'div.ag-row [colid="name"]'); 
        return count($nodes) ? $nodes : [];
    }
    private function getCurrentFieldCount($prop)
    {
        $selCntnrId = '#'.str_replace(' ','',$prop).'-sel-cntnr';
        return $this->getUserSession()->evaluateScript("$('$selCntnrId').data('cnt');");
    }
    private function getFieldData($fieldId)
    {
        $val = $this->getFieldInnerText($fieldId);  
        if ($val === null || $val === "") {
            $val = $this->getFieldValue($fieldId);   
        }                                           //fwrite(STDOUT, "\n".$fieldId." - ".$val."\n");
        return $val;
    }
    private function getFieldInnerText($fieldId)
    {
        return $this->getUserSession()->evaluateScript("$('$fieldId')[0].innerText;"); 
    }
    private function getFieldValue($fieldId)
    {
        return  $this->getUserSession()->evaluateScript("$('$fieldId')[0].value;"); 
    }
    /** 
     * Either returns all the interaction rows displayed in the table, or a subset
     * under a specified node in the tree.
     */
    private function getInteractionsRows($node = false)
    {  
        $intRows = [];
        $subSet = $node === false; 
        $rows = $this->getAllTableRows();
        foreach ($rows as $row) { 
            $nodeText = $row->find('css', '[colid="name"]')->getText(); 
            if ($node && $nodeText === $node) { $subSet = true; continue; }
            if ($subSet && $nodeText === '') { array_push($intRows, $row); }
            if ($subSet && $node && $nodeText !== '') { break; } 
        } 
        $this->handleNullAssert($intRows, false, 'No interaction rows found.');
        return $intRows;
    }
    /** Returns the id for the deepest open form.  */
    private function getOpenFormId()
    {
        $prefix = $this->getOpenFormPrefix();
        return '#'.$prefix.'-form';
    }
    private function getOpenFormPrefix()
    {
        $forms = ['sub2', 'sub', 'top'];
        foreach ($forms as $prefix) {
            $selector = '#'.$prefix.'-form';
            $elem = $this->getUserSession()->getPage()->find('css', $selector);
            if ($elem !== null) { return $prefix; }
        }
    }
    private function getValueToSelect($selId, $text)
    {
        $opts = $this->getComboboxOptions($selId);
        foreach ($opts as $key => $optAry) {
            if ($optAry['text'] === $text) { return $optAry['value']; }
        } 
        $this->iPutABreakpoint("Couldn't find the option for [$text] in [$selId]");
    }
    private function getComboboxOptions($selId)
    {
        $opts = [];
        $this->spin(function() use (&$opts, $selId) {
            $opts = $this->getUserSession()->evaluateScript(
                "$('$selId').length ? $('$selId')[0].selectize.options : false;");
            return $opts;
        }, "Could not find options for [$selId]");
        return $opts;
    }
/** ------------------ Table Interactions ------------------------------------*/
    /**
     * Updates a select elem and checks the page updated by finding a 'new' elem.
     */
    private function changeTableSort($elemId, $newVal, $newElemSel)
    {                                                                           //fwrite(STDOUT, "\nchangeTableSort\n");
        $elem = $this->getUserSession()->evaluateScript("$('$elemId').length;"); 
        $this->spin(function() use ($elemId, $newVal, $newElemSel){
            $this->getUserSession()->
                executeScript("$('$elemId')[0].selectize.addItem('$newVal');");

            return $this->getUserSession()->evaluateScript("$('$newElemSel').length;");
        }, "UI did not update as expected. Did not find [$newElemSel].");
    }    
    private function clickRowEditPencil($row)
    {
        $this->spin(function() use ($row){
            $pencil = $row->find('css', '.tbl-edit');
            if (!$pencil) { return false; }
            $pencil->click();
            return true;
        }, null);
    }
/** -------------------- Asserts -------------------------------------------- */
    /**
     * Replace with spin and @ifContainsText
     */
    private function handleContainsAssert($ndl, $hystk, $isIn, $msg)
    {                                                                           //print('Haystack = '.$hystk.', needle = '.$ndl);
        if ($isIn && strpos($hystk, $ndl) === false || !$isIn && strpos($hystk, $ndl) != false) { 
            $this->iPutABreakpoint($msg);
        }
    }
    private function ifContainsText($hystk, $ndl)
    {        
        return strpos($hystk, $ndl) !== false;
    }    
    private function handleEqualAssert($frst, $scnd, $isEq, $msg)
    {       
        if ($isEq && $frst != $scnd || !$isEq && $frst == $scnd) { 
            $this->iPutABreakpoint($msg);
        }
    }
    private function handleNullAssert($elem, $isNull, $msg)
    {   
        if ($isNull && $elem != null || !$isNull && $elem == null) { 
            $this->iPutABreakpoint($msg);
        }
    }
    private function isInDataTree($text)
    {
        $treeNodes = $this->getAllTreeNodes();
        $inTree = false;
        for ($i=0; $i < count($treeNodes); $i++) { 
            if ($treeNodes[$i]->getText() === $text) { $inTree = true; }
        }
        return $inTree;
    }
    private function textContainedInField($text, $fieldId, $isIn = true)
    {  
        $should_nt = $isIn ? 'Should' : "Shouldn't";
        $fieldVal = $this->getFieldData($fieldId);          
        return !$isIn && strpos($fieldVal, $text) === false || 
            $isIn && (strpos($fieldVal, $text) != false || $fieldVal == $text); //strpos fails on exact match
    }
    private function assertFieldValueIs($text, $fieldId, $isIn = true)
    {   
        $should_nt = $isIn ? 'Should' : "Shouldn't";
        $this->spin(function () use ($text, $fieldId, $isIn)
        {
            $fieldVal = $this->getFieldData($fieldId); 
            return $isIn ? $fieldVal == $text : $fieldVal != $text;       
        }, "$should_nt  have found [$text] in [$fieldId].");
    }
    /** Check after submitting the Interaction Edit form. */
    private function ensureThatFormClosed()
    {
        $this->spin(function() {
            try {
                $this->assertSession()->pageTextNotContains('Editing Interaction');
            } catch (Exception $e) { return false; 
            } finally { return true; }
        }, "Form did not submit/close as expected.");
    }
    private function isRowExpanded($row)
    {
        $checkbox = $row->find('css', 'span.ag-group-expanded');  
        return $checkbox == null ? false : $checkbox->isVisible();
    }
/** ---------------------------- Misc Util ---------------------------------- */
    private function spin ($lambda, $errMsg, $wait = 5)
    {
        for ($i = 0; $i < $wait; $i++)
        {
            try {
                if ($lambda()) {
                    return true;
                } else { }
            } catch (Exception $e) {
                // do nothing
            }
            sleep(1);
        }
        if (!$errMsg) { return; }
        $this->iPutABreakpoint($errMsg);
    }
    private function getUserSession()
    {
        return isset($this->curUser) ? $this->curUser : $this->getSession();
    }
    private function clickOnPageElement($selector)
    {
        $this->spin(function() use ($selector) {
            $elem = $this->getUserSession()->getPage()->find('css', $selector); 
            if (!$elem) { return false; }
            $elem->click(); 
            return true;
        }, "Couldn't click on the [$selector] element.");
    }
/** ================== Data Sync Feature Methods ===================================================================== */
    /**
     * @Given an editor logs into the website
     */
    public function anEditorLogsIntoTheWebsite()
    {                                                                           fwrite(STDOUT, "\n---- Editor 1 logging in.\n");
        $this->editor1 = $this->getEditorSession();
        $this->editorLogIn($this->editor1, 'testeditor');
    }

    /**
     * @Given a second editor logs into the website
     */
    public function aSecondEditorLogsIntoTheWebsite()
    {                                                                           fwrite(STDOUT, "\n---- Editor 2 logging in.\n");
        $this->editor2 = $this->getEditorSession();
        $this->editorLogIn($this->editor2, 'testAdmin');
    }

    /**
     * @Given editor :cnt creates two interactions
     */
    public function editorCreatesTwoInteractions($cnt)
    {
        $map = [[1,2], [3,4]];
        $editor = 'editor' . $cnt;
        $this->curUser = $this->$editor;
        $this->editorVisitsSearchPage($this->curUser);                          fwrite(STDOUT, "\n        Visits search page.\n");   
        $this->userCreatesInteractions($this->curUser, $map[$cnt - 1]);
    }

    /**
     * @Given editor :cnt edits some sub-entity data
     */
    public function editorEditsSomeSubEntityData($cnt)
    {   
        $editor = 'editor' . $cnt;
        $this->curUser = $this->$editor; 
        $this->iUncheckTheDateUpdatedFilter();
        $this->iToggleTheFilterPanel('close');
        if ($cnt == 1) {
            $this->editorChangesLocationData();
        } else {
            $this->editorChangesTaxonData();
        }
    }

    /**
     * @When each reloads the search page
     */
    public function eachReloadsTheSearchPage()
    {
        $this->curUser = $this->editor1;
        $this->editorVisitsSearchPage($this->curUser);
        $this->curUser = $this->editor2;
        $this->editorVisitsSearchPage($this->curUser);
    }

    /**
     * @Then the new data should sync between the editors
     */
    public function theNewDataShouldSyncBetweenTheEditors()
    {
        $this->editorTableLoads($this->editor1);
        $this->editorTableLoads($this->editor2);
    }

    /**
     * @Then they should see the expected changes in the data table
     */
    public function theyShouldSeeTheExpectedChangesInTheDataTable()
    {
        $this->curUser = $this->editor1;
        $this->checkSourceData();
        $this->checkTaxonData();

        $this->curUser = $this->editor2;
        $this->checkSourceData();
        $this->checkLocationData();
    }
    /** ------------------ multi-editor feature helpers ----------------- */
    private function getEditorSession()
    {
        $opts = [
            'browser' => 'chrome',
            'chrome' => [
                /*'binary' => '/Applications/Chromium.app/Contents/MacOS/Chromium',*/
                'args' => ['--disable-gpu', '--window-size=1220,800']], 
            'marionette' => true,
        ];
        $driver = new \Behat\Mink\Driver\Selenium2Driver('chrome', $opts);
        $session = new \Behat\Mink\Session($driver);
        $session->start();
        return $session;
    }

    private function editorLogIn($editor, $name)
    {
        $editor->visit('http://localhost/batplant/web/app_test.php/login');
        $editor->getPage()->fillField('_username', $name);
        $editor->getPage()->fillField('_password', 'passwordhere');
        $editor->getPage()->pressButton('_submit');
    }

    private function userCreatesInteractions($editor, $cntAry)
    {                                                                           fwrite(STDOUT, "\---- userCreatesInteractions.\n");
        $this->pressTheNewButton();
        foreach ($cntAry as $cnt) {                                             fwrite(STDOUT, "\n    Creating interaction $cnt\n");
            $this->iSubmitTheNewInteractionFormWithTheFixtureEntities($cnt);
        }                                                                       fwrite(STDOUT, "\n    Interactions added. Exiting form\n");
        $this->iExitTheFormWindow();
    }

    private function pressTheNewButton()
    {                                       
        $this->spin(function() { 
            try {
                $this->curUser->getPage()->pressButton('New');
                return true;
            } catch (Exception $e) {}
        }, "Cant press the 'New' Button.");
    }

    private function editorVisitsSearchPage($editor)
    {   
        $editor->visit('http://localhost/batplant/web/app_test.php/search');
        usleep(400000);
        $this->iExitTheTutorial();
    }
    /**
     * @Given I create an interaction 
     */
    public function iSubmitTheNewInteractionFormWithTheFixtureEntities($count = 1)
    {                                                                           fwrite(STDOUT, "\n        Filling form with fixture data\n");
        $srcLocData = [ 'Publication' => 'Revista de Biologia Tropical', 
            'Citation Title' => 'Two cases of bat pollination in Central America', 
            'Country-Region' => 'Central America', 'Location' => 'Panama'];
        $this->fillSrcAndLocFields($srcLocData);
        $taxaData = ['Genus' => 'Artibeus', 'Family' => 'Sphingidae'];
        $this->fillTaxaFields($taxaData);
        $miscData = [ 'Consumption', 'Flower', 'Interaction '.$count];
        $this->fillMiscIntFields($miscData);
        $this->curUser->getPage()->pressButton('Create Interaction');
        $this->waitForInteractionFormToReset();
    }
    private function waitForInteractionFormToReset()
    {
        $this->spin(function()
        {
            return $this->curUser->evaluateScript("$('#success').length > 0");
        }, 'Interaction form did not reset.');
    }
    private function fillSrcAndLocFields($data)
    {                                                                           fwrite(STDOUT, "\n        Filling Source and Location fields.\n");
        foreach ($data as $field => $value) { 
            $this->iSelectFromTheFormDropdown($value, $field); 
        }
    }
    private function fillTaxaFields($data) 
    {                                                                           fwrite(STDOUT, "\n        Filling Taxa fields.\n");  
        $lvls = array_keys($data);
        $this->iFocusOnTheTaxonField('Subject');   
        $this->iSelectFromTheFormDropdown($data[$lvls[0]], $lvls[0]);
        $this->iPressTheButton('Select Taxon');
        $this->iWaitForTheFormToClose('sub');
        $this->iFocusOnTheTaxonField('Object');
        $this->iSelectFromTheFormDropdown('Arthropod', 'Realm');
        $this->iSelectFromTheFormDropdown($data[$lvls[1]], $lvls[1]);
        $this->iPressTheButton('Select Taxon');
        $this->iWaitForTheFormToClose('sub');
    }
    private function fillMiscIntFields($data)
    {                                                                           fwrite(STDOUT, "\n        Filling remaining fields.\n");
        $fields = array_keys($data); 
        $this->iSelectFromTheFormDropdown($data[0], 'Interaction Type');
        $this->iSelectFromTheFormDropdown($data[1], 'Interaction Tags');
        $this->iTypeInTheField($data[2], 'Note', 'textarea');
    }

    private function editorTableLoads($editor)
    {
        $this->spin(function() use ($editor)
        {
            return $editor->evaluateScript("$('.ag-row').length > 0");
        }, 'Rows not loaded in table.');
    }
    private function editorChangesLocationData()
    {                                                                           fwrite(STDOUT, "\n---- Editor changing Location data.\n");
        $this->theDatabaseTableIsInFocus('Location'); 
        $this->editLocationData();
        $this->moveLocationInteraction();
    }
    private function editLocationData()
    {                                                                           fwrite(STDOUT, "\n        Editing Location data.\n");
        $this->iExpandInTheDataTree('Central America');
        $this->iExpandInTheDataTree('Costa Rica');
        $this->iClickOnTheEditPencilForTheRow('Santa Ana-Forest');
        $this->iChangeTheFieldTo('Display Name', 'input', 'Santa Ana-Desert');
        $this->iChangeTheFormDropdownTo('Habitat Type', 'Desert');
        $this->curUser->getPage()->pressButton('Update Location');
        $this->iWaitForTheFormToClose('top');
    }
    private function moveLocationInteraction()
    {                                                                           fwrite(STDOUT, "\n        Editing interaction location data.\n");
        $this->iExpandInTheDataTree('Central America');
        $this->iExpandInTheDataTree('Costa Rica');
        $this->iClickOnTheEditPencilForTheFirstInteractionOf('Santa Ana-Desert');
        $this->iChangeTheFormDropdownTo('Location', 'Costa Rica');
        $this->curUser->getPage()->pressButton('Update Interaction');
        $this->iWaitForTheFormToClose('top');
        $this->theDatabaseTableIsInFocus('Location'); 
        $this->iUncheckTheDateUpdatedFilter();
        $this->iExpandInTheDataTree('Central America');
        $this->iExpandInTheDataTree('Costa Rica');
        $this->iShouldSeeInteractionsUnder('2', 'Unspecified Costa Rica Interactions');
    }
    private function editorChangesTaxonData()
    {                                                                           fwrite(STDOUT, "\n        Editor changing Taxon data.\n");
        $this->theDatabaseTableIsInFocus('Taxon'); 
        $this->iGroupInteractionsBy('Arthropoda');
        $this->editTaxonData();
        $this->moveTaxonInteraction();
    }
    private function editTaxonData()
    {
        $this->iExpandInTheDataTree('Order Lepidoptera');
        $this->iClickOnTheEditPencilForTheRow('Family Sphingidae');
        $this->iChangeTheFieldTo('taxon name', 'input', 'Sphingidaey');
        $this->curUser->getPage()->pressButton('Update Taxon');
        $this->iWaitForTheFormToClose('top');
    }
    private function moveTaxonInteraction()
    {                                                                           fwrite(STDOUT, "\n--- Editor changing Taxon interaction data.\n");
        $this->iExpandInTheDataTree('Order Lepidoptera');
        $this->iClickOnTheEditPencilForTheFirstInteractionOf('Unspecified Lepidoptera Interactions');
        $this->iFocusOnTheTaxonField('Object');
        $this->iSelectFromTheFormDropdown('Arthropod', 'Realm');
        $this->iSelectFromTheFormDropdown('Sphingidaey', 'Family');
        $this->iPressTheButton('Select Taxon');
        $this->iWaitForTheFormToClose('sub');
        $this->curUser->getPage()->pressButton('Update Interaction');
        $this->iWaitForTheFormToClose('top');
        $this->iUncheckTheDateUpdatedFilter();
        $this->theDatabaseTableIsInFocus('Taxon');
        $this->iGroupInteractionsBy('Arthropoda');
        $this->iExpandInTheDataTree('Order Lepidoptera');
        $this->iShouldSeeInteractionsUnder('1', 'Unspecified Lepidoptera Interactions');
        $this->iExpandInTheDataTree('Family Sphingidaey');
        $this->iShouldSeeInteractionsUnder('6', 'Unspecified Sphingidaey Interactions');
    }
    private function checkSourceData()
    {
        $this->theDatabaseTableIsInFocus('Source'); 
        $this->iExpandInTheDataTree('Revista de Biologia Tropical');
        $this->iExpandInTheDataTree('Two cases of bat pollination in Central America');
        $this->iShouldSeeInteractionsAttributed(6);
    }
    private function checkLocationData()
    {
        $this->theDatabaseTableIsInFocus('Location'); 
        $this->iExpandInTheDataTree('Central America');
        $this->iExpandInTheDataTree('Costa Rica');
        $this->iShouldSeeInteractionsUnder('2', 'Unspecified Costa Rica Interactions');
        $this->iShouldSeeInteractionsUnder('1', 'Santa Ana-Desert');
    }
    private function checkTaxonData()
    {
        $this->theDatabaseTableIsInFocus('Taxon');
        $this->iGroupInteractionsBy('Arthropoda');
        $this->iExpandInTheDataTree('Order Lepidoptera');
        $this->iShouldSeeInteractionsUnder('1', 'Unspecified Lepidoptera Interactions');
        $this->iExpandInTheDataTree('Family Sphingidaey');
        $this->iShouldSeeInteractionsUnder('6', 'Unspecified Sphingidaey Interactions');
    }
}
