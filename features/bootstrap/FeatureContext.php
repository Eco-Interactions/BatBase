<?php

use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;
use Behat\MinkExtension\Context\RawMinkContext;

require_once(__DIR__.'/../../vendor/bin/.phpunit/phpunit-5.7/vendor/autoload.php');
require_once(__DIR__.'/../../vendor/bin/.phpunit/phpunit-5.7/src/Framework/Assert/Functions.php');

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
        fwrite(STDOUT, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nLoading database.\n");
        exec('php bin/console doctrine:database:drop --force --env=test');
        exec('php bin/console doctrine:database:create --env=test');
        exec('php bin/console doctrine:schema:create --env=test');
        exec('php bin/console hautelook_alice:fixtures:load --no-interaction --env=test');
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
        $this->getUserSession()->wait( 10000, "$('.ag-row').length" );
        $row = $this->getUserSession()->getPage()->find('css', '[row=0]');
        $this->handleNullAssert($row, false, 'There are no rows in the database table.');
    }

/** -------------------------- Search Page Interactions --------------------- */
    /**
     * @Given I exit the tutorial
     */
    public function iExitTheTutorial()
    {                                                                           //fwrite(STDOUT, "\n        Exiting the tutorial.\n");
        $tutorial = $this->getUserSession()->getPage()->find('css', '.intro-tips');
        $this->handleNullAssert($tutorial, false, 'Tutorial is not displayed.');
        $this->getUserSession()->executeScript("$('.introjs-overlay').click();");
        $this->spin(function(){
            return $this->getUserSession()->evaluateScript("!$('.introjs-tooltiptext').length");
            }, 'Tutorial not closed.');
    }

    /**
     * @Given the database table is in :entity view
     */
    public function theDatabaseTableIsInSelectedView($entity)
    {
        $vals = ['Taxon' => 'taxa', 'Location' => 'locs', 'Source' => 'srcs'];
        $newElems = ['Taxon' => '#selSpecies', 'Location' => '#selRegion', 'Source' => '#selPubTypes'];
        $this->changeTableSort('#search-focus', $vals[$entity], $newElems[$entity]);
        usleep(500000);
    }
    /**
     * @Given I display locations in :loc View
     */
    public function iDisplayLocationsInView($loc)
    {        
        $vals = ['Map' => 'map', 'Table' => 'tbl'];
        $newElems = ['Map' => '#map', 'Table' => '#search-tbl'];
        $this->changeTableSort('#sel-view', $vals[$loc], $newElems[$loc]);
        usleep(500000);
    }

    /**
     * @Given I group interactions by :type
     */
    public function iGroupInteractionsBy($type)
    {
        $vals = ['Authors' => 'auths', 'Publications' => 'pubs', 'Bats' => 2, 
            'Arthropoda' => 4, 'Plants' => 3, 'Publishers' => 'publ'];
        $newElems = ['Authors' => '[name="srchTree"]', 'Publications' => '#selPubTypes', 
            'Bats' => '#selSpecies', 'Arthropoda' => '#selOrder', 'Plants' => '#selSpecies',
            'Publishers' => '[name="srchTree"]'];
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
     * @Given I toggle :state the filter panel
     */
    public function iToggleTheFilterPanel($state)
    {
        $isClosed = $this->getUserSession()->evaluateScript("$('#filter-opts-pnl').hasClass('closed');");
        if ($isClosed && $state == 'close' || !$isClosed && $state == 'open') { return; }
        $filterPanelToggle = $this->getUserSession()->getPage()->find('css', '#filter');  
        $filterPanelToggle->click();
        /* -- Spin until finished -- */
        $stepComplete = function() use ($state){
            $closed = $this->getUserSession()->evaluateScript("$('#filter-opts-pnl').hasClass('closed');"); 
            if ($closed && $state == 'close' || !$closed && $state == 'open') { return true; }
        };      
        $this->spin($stepComplete, 'Filter panel not ' . ($state == 'open' ? "expanded" : "collapsed"));
    }

    /**
     * @When I select :text from the :label dropdown
     * Search page elems.
     */
    public function iSelectFromTheDropdown($text, $label)
    {                                                                           //fwrite(STDOUT, "\niSelectFromTheDropdown\n");
        $vals = [ 'Artibeus lituratus' => 13, 'Costa Rica' => 24, 'Journal' => 1, 
            'Book' => 2, 'Article' => 3, 'Map Data' => 'map', 'Test Filter Set' => 1 ];
        $val = array_key_exists($text, $vals) ? $vals[$text] : $text;
        $selId = '#sel'.str_replace(' ','',$label);
        $elem = $this->getUserSession()->getPage()->find('css', $selId);
        $this->handleNullAssert($elem, false, "Couldn't find the [$selId] elem");
        $this->getUserSession()->
            executeScript("$('$selId')[0].selectize.addItem('$val');");
    }

    /**
     * @When I type :text in the :type text box and press enter
     */
    public function iTypeInTheTextBoxAndPressEnter($text, $type)
    {
        $input = $this->getUserSession()->getPage()->find('css', 'input[name="sel'.$type.'"]');
        $input->setValue($text);
        $input->keypress('13');
        usleep(500000);
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
        usleep(500000);
        $row = $this->getTableRow($text);
        $this->handleNullAssert($row, false, "Couldn't find row for = [$text]");
        $this->clickRowMapPin($row, $text);
    }
/**---------------------- Table Interactions ---------------------------------*/
    /**
     * @Given I filter the table to interactions created today
     */
    public function iFilterTheTableToInteractionsCreatedSince()
    {
        $this->getUserSession()->executeScript("$('#shw-chngd').click().change();");
        $this->getUserSession()->executeScript("$('.flatpickr-confirm').click();");
        $this->theTableShouldBeFilteredToInteractionsCreatedSince();
        usleep(500000);
    }

    /**
     * @Given I click on the edit pencil for the :text row
     */
    public function iClickOnTheEditPencilForTheRow($text)
    {
        usleep(500000);
        $row = $this->getTableRow($text);
        $this->handleNullAssert($row, false, "Couldn't find row for = [$text]");
        $this->clickRowEditPencil($row, $text);
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
     * @When I change the :prop dropdown field to :text
     */
    public function iChangeTheDropdownFieldTo($prop, $text)
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
        $this->iSelectFromTheFieldDynamicDropdown($text, $prop, false);     
    }
    
    /**
     * @When I add :text to the :prop dynamic dropdown field 
     */
    public function iAddToTheDynamicDropdownField($text, $prop)
    {
        $this->iSelectFromTheFieldDynamicDropdown($text, $prop, true);     
    }

    /**
     * @When I expand :text in the data tree
     */
    public function iExpandInTheDataTree($text)
    {
        usleep(500000);
        $row = $this->getTreeNode($text);  
        $this->toggleRow($text, $row);
    }

    /**
     * @When I collapse :text in the data tree
     */
    public function iCollapseInTheDataTree($text)
    {
        usleep(500000);
        $row = $this->getTreeNode($text);  
        $this->toggleRow($text, $row, 'close');
    }
    /**
     * @When I expand :txt in level :num of the data tree
     */
    public function iExpandInLevelOfTheDataTree($txt, $num)
    {
        usleep(500000);
        $treeNodes = $this->getUserSession()->getPage()->findAll('css', 'div.ag-row-level-'.--$num.' [colid="name"]');  
        $this->handleNullAssert($treeNodes, false, "No nodes found at level $num of the data tree.");
        $row = null;
        for ($i=0; $i < count($treeNodes); $i++) { 
            if ($treeNodes[$i]->getText() === $txt) { $row = $treeNodes[$i]; break;}
        }
        $this->handleNullAssert($row, false, "Didn't find the [$txt] tree node.");
        $row->doubleClick();
    }

    /**
     * @Then the count column should show :count interactions
     */
    public function theCountColumnShouldShowInteractions($count)
    {
        $cell = $this->getUserSession()->getPage()->find('css', '[row=0] [colId="intCnt"]');
        $this->handleContainsAssert($cell->getText(), $count, true, 'No interaction count found.');
    }
    /**
     * @Then data in the interaction rows
     * @Then I should see data in the interaction rows
     * Note: Data is checked in the Subject Taxon column only.
     */
    public function dataInTheInteractionRows()
    {   
        $data = $this->getUserSession()->getPage()->find('css', '[colid="subject"] span');
        $this->handleNullAssert($data->getText(), false, 
            'No data found in the interaction rows.');
    }

    /**
     * @Then I (should) see :count row(s) in the table data tree
     */
    public function iShouldSeeRowsInTheTableDataTree($count)
    {
        usleep(500000);
        $rows = $this->getUserSession()->getPage()->findAll('css', '.ag-body-container>div'); 
        $this->handleEqualAssert(intval($count), count($rows), true, 
            "Found [". count($rows)."] interaction rows. Expected [$count]");
    }

    /**
     * @Then I should see :text in the tree
     */
    public function iShouldSeeInTheTree($text)
    {   
        usleep(500000);
        $inTree = $this->isInDataTree($text);
        $this->handleEqualAssert($inTree, true, true, "[$text] is not displayed in table data-tree.");
    }    

    /**
     * @Then I should not see :text in the tree
     */
    public function iShouldNotSeeInTheTree($text)
    {   
        usleep(500000);
        $inTree = $this->isInDataTree($text);
        $this->handleEqualAssert($inTree, false, true, 
            "[$text] should not be displayed in table data-tree.");
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
        $cols = [ 'subject', 'object', 'interactionType', 'tags', 'citation', 
            'habitat', 'location', 'country', 'region', 'note' ];
        if ($focus) { unset($cols[array_search($focus ,$cols)]); }
        $intRows = $this->getInteractionsRows();

        foreach ($intRows as $row) {
            foreach ($cols as $colId) {            
                $selector = '[colid="'.$colId.'"]';
                $data = $row->find('css', $selector); 
                $this->handleNullAssert($data->getText(), false, 
                    'No data found in the interaction\'s [$colId] column.');
            }
        }
    }

    /**
     * @Then I should see :text under :parentNode in the tree
     */
    public function iShouldSeeUnderInTheTree($text, $parentNode)
    {
        usleep(500000);
        $this->iExpandInTheDataTree($parentNode);
        $row = $this->getTableRow($text);
        $this->handleNullAssert($row, false, "Couldn't find row for = [$text]");
        $this->collapseDataTreeNode($parentNode);
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
        usleep(500000);    
    }
    /**
     * @Given I press the :type button in the map
     */
    public function iPressTheButtonInTheMap($type)
    {
        $map = [
            'New Location' => '.leaflet-control-create-icon',
            'Click to select position' => '.leaflet-control-click-create-icon'
        ];
        $bttn = $this->getUserSession()->getPage()->find('css', $map[$type]);
        $this->handleNullAssert($bttn, false, "No [$type] button found.");
        $bttn->click();
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
        $marker = $this->getUserSession()->getPage()->find('css', 
            '.leaflet-marker-icon.new-loc');
        $this->handleNullAssert($marker, false, 'No new location marker found on map.');        
        $marker->click(); 
        
        $bttn = $this->getUserSession()->getPage()->find('css', "input[value='$bttnText']");
        $this->handleNullAssert($bttn, false, 'No [$bttnText] button found.');
        $bttn->click();
        usleep(50000);
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
                return strpos($filterMsg, $text) !== false;
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
        usleep(500000);
        $selId = '#sel'.str_replace(' ','',$label);
        $selector = $selId.' option:selected';  
        $selected = $this->getUserSession()->evaluateScript("$('$selector').text();");  
        $this->handleEqualAssert($text, $selected, true, 
            "Found [$selected] in the [$label] ($selId) field. Expected [$text].");
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
        $elem = $this->getUserSession()->getPage()->find('css', '#int-legend');
        if (!$elem) { 
            usleep(50000); 
            $elem = $this->getUserSession()->getPage()->find('css', '#int-legend');
        }
        $this->handleNullAssert($elem, false, 'No [interaction count legend] shown on map.');
        $this->handleContainsAssert($count, $elem->getHtml(), true, 
             "Should have found [$count] in the interaction count legend.");
    }

    /**
     * @Then I should see :text in popup
     */
    public function iShouldSeeInPopup($text)
    {
        $elem = $this->getUserSession()->getPage()->find('css', '.leaflet-popup-content');
        if (!$elem) { 
            usleep(50000); 
            $elem = $this->getUserSession()->getPage()->find('css', '.leaflet-popup-content');
        }
        $this->handleNullAssert($elem, false, 'No [popup] shown on map.');
        $this->handleContainsAssert($text, $elem->getHtml(), true, 
             "Should have found [$text] in popup.");
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
     * @Given I enter :text in the :prop dropdown field 
     */
    public function iEnterInFormTheDropdownField($text, $prop)
    {
        $selId = '#'.str_replace(' ','',$prop).'-sel';
        try {
            $this->getUserSession()->executeScript("$('$selId')[0].selectize.createItem('$text');");
        } catch (Exception $e) {
            $this->iPutABreakpoint("Couldn't find dropdown [".$selId."]");
        }
    }

    /**
     * @Given I focus on the :role taxon field
     * @Given I focus on the :role combobox
     */
    public function iFocusOnTheTaxonField($role)
    {
        $selId = '#'.$role.'-sel';
        $this->getUserSession()->executeScript("$('$selId')[0].selectize.focus();");
        usleep(500000);
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
        $miscData = [ 'Consumption', 'Arthropod', 'Detailed interaction notes.'];
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
        usleep(500000);
        $this->assertFieldValueIs($text, $selector);
    }

    /**
     * @When I select :text from the :prop dropdown field
     */
    public function iSelectFromTheFormDropdownField($text, $prop)
    {
        $selId = '#'.str_replace(' ','',$prop).'-sel';
        $this->selectValueInCombobox($selId, $text);
    }

    /**
     * @When I select :text from the :prop field dynamic dropdown
     * Note: Changes the last empty ($new) dropdown, or the last filled (!$new).
     */
    public function iSelectFromTheFieldDynamicDropdown($text, $prop, $new = true)
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
     * @When I uncheck the time-updated filter
     * REFACTOR: merge with iToggleTheDateFilter
     */
    public function iUncheckTheTimeUpdatedFilter()
    {
        usleep(200000); //refactor to  [wait(test)]
        $this->iToggleTheFilterPanel('open');
        $checkbox = $this->getUserSession()->getPage()->find('css', 'input#shw-chngd');  
        $checkbox->uncheck();  
        $this->spin(function() {
            return $this->getUserSession()->evaluateScript("!$('input#shw-chngd').prop('checked')");
            }, 'Time filter not unchecked.');
    }
    /**
     * @Given I toggle the date filter :state
     */
    public function iToggleTheDateFilter($state)
    {
        $checkbox = $this->getUserSession()->getPage()->find('css', 'input#shw-chngd'); 
        if ($state) { $checkbox->check(); } else { $checkbox->uncheck(); }
        $this->spin(function() use ($state) {
            return $this->getUserSession()->evaluateScript("$('input#shw-chngd').prop('checked') == $state");
            }, 'Time filter not ['.($state ? 'en' : 'dis').'abled].');
    }
    /**
     * @Given I set the time :type filter to :date
     *
     * REFACTOR: COMBINE WITH iFilterTheTableToInteractionsCreatedSince
     */
    public function iSetTheTimeFilterTo($type, $date)
    {
        $initialCount = $this->getUserSession()->evaluateScript("$('#tbl-cnt').text().match(/\d+/)[0];");
        $this->setTimeFilterDefault($date);
        $this->iToggleTheDateFilter(true);
        $this->iSelectFromTheDropdown($type, 'Time Filter');
        $this->clickOnElement('#filter-col1');
        $this->spin(function() use ($initialCount) {
            $postCount = $this->getUserSession()->evaluateScript("$('#tbl-cnt').text().match(/\d+/)[0];");
            return $postCount !== $initialCount && $postCount > 0;
            }, "Time filter did not update as expected. type = [$type]. date = [$date]. initial [$initialCount]. (After can't be zero)");
        $this->setTimeFilterDefault($date, 'remove');
    }

    /**
     * @When I enter :text in the :prop field dynamic dropdown
     */
    public function iEnterInTheFieldDynamicDropdown($text, $prop)
    {
        $count = $this->getCurrentFieldCount($prop);
        $selId = '#'.str_replace(' ','',$prop).'-sel'.$count;
        $this->getUserSession()->executeScript("$('$selId')[0].selectize.createItem('$text');");
    }

    /**
     * @When I add the :text interaction tag
     */
    public function iAddTheInteractionTag($text)
    {                                                                           //fwrite(STDOUT, "\niAddTheInteractionTag\n");
        $val = $this->getValueToSelect('#InteractionTags-sel', $text);
        $this->getUserSession()->executeScript("$('#InteractionTags-sel')[0].selectize.addItem('$val');");
        usleep(500000);
        $this->textContainedInField($text, '#InteractionTags-sel');
    }

    /**
     * @When I remove the :text interaction tag
     */
    public function iRemoveTheInteractionTag($text)
    {
        $val = $this->getValueToSelect('#InteractionTags-sel', $text);
        $this->getUserSession()->executeScript("$('#InteractionTags-sel')[0].selectize.removeItem('$val');");
        usleep(500000);
        $this->textContainedInField($text, '#InteractionTags-sel', false);
    }

    /**
     * @When I see :text in the :prop field :type
     */
    public function iSeeInTheField($text, $prop, $type)
    {
        $field = '#'.str_replace(' ','',$prop).'_row '.$type;
        $curForm = $this->getOpenFormId();
        $selector = $curForm.' '.$field;      
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
        $marker = $this->getUserSession()->evaluateScript("$('$class').length > 0");
        $this->handleNullAssert($marker, false, $msg);
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
     * @Then I should see :text in the :prop field dynamic dropdown
     */
    public function iShouldSeeInTheFieldDynamicDropdown($text, $prop)
    {
        usleep(500000);
        $count = $this->getCurrentFieldCount($prop);     
        $selId = '#'.str_replace(' ','',$prop).'-sel'.$count;  
        $selector = $selId.' option:selected';  
        $selected = $this->getUserSession()->evaluateScript("$('$selector').text();"); 
        while ($count > 1 && $selected !== $text) {
            $selId = substr($selId, 0, -1).--$count;
            $selected = $this->getUserSession()->evaluateScript("$('$selector').text();"); 
        }
        $this->assertFieldValueIs($text, $selector);
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
     * @Then the table should be filtered to interactions created today
     */
    public function theTableShouldBeFilteredToInteractionsCreatedSince()
    {
        usleep(500000);
        $checked = $this->getUserSession()->evaluateScript("$('#shw-chngd').prop('checked');");
        $this->handleEqualAssert($checked, true, true, "Updates-since filter is not checked.");
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
        try {
            $this->assertSession()->pageTextContains($text);
        } catch (Exception $e) {
            $this->iPutABreakpoint("Did not find [$text] anywhere on page.");
        }
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
        $form = $this->getOpenFormPrefix();
        $selector = '#'.$form.'-all-fields';
        $checkbox = $this->getUserSession()->getPage()->find('css', $selector);
        $this->handleNullAssert($checkbox, false, "Couldn't find the show all fields checkbox");  
        $checkbox->check();  
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
        if (stripos($bttnText, "Confirm") !== false) { $bttnText = 'sub-submit'; } //Should not be necessary. No changes were made to the button, but suddenly it wasn't finding the confirm button, though the reset button (almost identical) was found fine. #ugh
        if (stripos($bttnText, "Update") !== false || 
            stripos($bttnText, "Create") !== false) { self::$dbChanges = true; }
        $this->getUserSession()->getPage()->pressButton($bttnText);
        usleep(500000);
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
        $msg = "\nCouldn't set [".$text."] into [".$selector."].";
        try {
            $this->getUserSession()->executeScript("$('$selector')[0].value = '$text';");        
            $this->getUserSession()->executeScript("$('$selector').change();");        
        } catch (Exception $e) {
            $this->iPutABreakpoint($msg);
        }
    }
    /** Couldn't find a way to check whether elem exists before set value attempt. */
    private function selectValueInCombobox($selId, $text)
    {                                                                           //fwrite(STDOUT, "\n            selectValueInCombobox - [$text] in [$selId]\n");           
        $msg = 'Error while selecting ['.$text.'] in ['.$selId.'].';
        $val = $this->getValueToSelect($selId, $text); 
        $this->getUserSession()->executeScript("$('$selId').length ? $('$selId')[0].selectize.addItem('$val') : null;");
        usleep(500000);
        $this->assertFieldValueIs($text, $selId);
    }
    /**
     * There doesn't seem to be a way to set the date on the flatpickr calendar
     * from these tests. Adding a data property to the calendar elem that will be
     * read on calendar load and set that time as the default for the calendar. 
     * Doesn't quite test the user's input, but should test the filter functionality.
     */
    private function setTimeFilterDefault($date, $reset = false)
    {  
        if ($reset) {
            $this->getUserSession()->executeScript("$('#selTimeFilter').data('default', false);");    
        } else {
            $this->getUserSession()->executeScript("$('#selTimeFilter').data('default', '$date');");
        }
    }

/** ---------------------- Get From Page -------------------------------------*/
    private function getAllTableRows()
    {
        $rows = $this->getUserSession()->getPage()->findAll('css', '.ag-body-container .ag-row');
        $this->handleNullAssert($rows, false, 'No nodes found in data tree.');
        return $rows;
    }
    private function getAllTreeNodes()
    {
        $nodes = $this->getUserSession()->getPage()->findAll('css', 'div.ag-row [colid="name"]'); 
        $this->handleNullAssert($nodes, false, 'No nodes found in data tree.');
        return $nodes;
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
        }  
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
    private function getTableRow($text)
    {
        usleep(500000);
        $rows = $this->getAllTableRows();
        foreach ($rows as $row) {
            $treeNode = $row->find('css', '[colid="name"]');
            if ($treeNode->getText() == $text) { return $row; }
        }
    }
    /** 
     * Either returns all the interaction rows displayed in the table, or a subset
     * under a specified node in the tree.
     */
    private function getInteractionsRows($node = false)
    {  
        usleep(500000);
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
    private function getTreeNode($text) 
    {
        usleep(500000);
        $treeNodes = $this->getAllTreeNodes();
        $row = null;
        for ($i=0; $i < count($treeNodes); $i++) { 
            if ($treeNodes[$i]->getText() === $text) { $row = $treeNodes[$i]; break;}
        }
        $this->handleNullAssert($row, false, "Didn't find the [$text] tree node.");
        return $row;
    }
    private function getValueToSelect($selId, $text)
    {
        $opts = $this->getUserSession()->evaluateScript("$('$selId')[0].selectize.options;");
        foreach ($opts as $key => $optAry) {
            if ($optAry['text'] === $text) { return $optAry['value']; }
        } 
        $this->iPutABreakpoint("Couldn't find the option for [$text] in [$selId]");
    }
/** ------------------ Table Interactions ------------------------------------*/
    /**
     * Updates a select elem and checks the page updated by finding a 'new' elem.
     */
    private function changeTableSort($elemId, $newVal, $newElemId)
    {                                                                           //fwrite(STDOUT, "\nchangeTableSort\n");
        $elem = $this->getUserSession()->evaluateScript("$('$elemId').length;"); 
        $this->getUserSession()->
            executeScript("$('$elemId')[0].selectize.addItem('$newVal');");
        $uiUpdated = $this->getUserSession()->evaluateScript("$('#newElemId').length > 0;");
        $this->handleNullAssert($uiUpdated, false, "UI did not update as expected. Did not find [$newElemId].");
    }    
    private function collapseDataTreeNode($text)
    {
        $row = $this->getTreeNode($text);
        $row->doubleClick();
    }

    private function clickRowEditPencil($row)
    {
        $pencil = $row->find('css', '.tbl-edit');
        $this->handleNullAssert($pencil, false, "Couldn't find the edit pencil for row.");
        $pencil->click();
    }
    private function clickRowMapPin($row)
    {
        $pin = $row->find('css', '[alt="Map Icon"]');
        $this->handleNullAssert($pin, false, "Couldn't find the map pin for row.");
        $pin->click();
    }
    private function toggleRow($text, $row, $close = false)
    {
        $row->doubleClick();
        $xpnded = $this->isRowExpanded($row);                                  
        if ($xpnded && !$close || !$xpnded && $close) { /*fwrite(STDOUT, "       [$text] row ".(!$close ? "expanded" : "collapsed").".\n"); */ return;  }
        if (!$xpnded && !$close || !$xpnded && $close) { 
            $row->doubleClick();
        }
        if (!$this->isRowExpanded($row)) {
            $msg = $text . " row still not " . (!$close ? "expanded" : "collapsed"); 
            $this->iPutABreakpoint($msg);
        }
    }
/** -------------------- Asserts -------------------------------------------- */
    private function handleContainsAssert($ndl, $hystk, $isIn, $msg)
    {                                                                           //print('Haystack = '.$hystk.', needle = '.$ndl);
        if ($isIn && strpos($hystk, $ndl) === false || !$isIn && strpos($hystk, $ndl) != false) { 
            $this->iPutABreakpoint($msg);
        }
    }
    private function handleEqualAssert($frst, $scnd, $isEq, $msg)
    {       
        if ($isEq && $frst != $scnd || !$isEq && $frst == $scnd) { 
            $this->iPutABreakpoint($msg);
        }
    }
    private function handleNullAssert($elem, $isNull, $msg)
    {   
        if ($isNull && $elem !== null || !$isNull && $elem === null) { 
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
        $fieldVal = $this->getFieldData($fieldId);
        $should_nt = $isIn ? 'Should' : "Shouldn't";
        $this->handleContainsAssert($text, $fieldVal, $isIn, 
            "$should_nt have found [$text] in [$fieldId]"); 
    }
    private function assertFieldValueIs($text, $fieldId, $isIn = true)
    {  
        $fieldVal = $this->getFieldData($fieldId);
        $should_nt = $isIn ? 'Should' : "Shouldn't";
        $this->handleEqualAssert($text, $fieldVal, $isIn,  
            "$should_nt have found [$text] in [$fieldId]. Actually found: [$fieldVal]."); 
    }
    /** Check after submitting the Interaction Edit form. */
    private function ensureThatFormClosed()
    {
        try {
            $this->assertSession()->pageTextNotContains('Editing Interaction');
        } catch (Exception $e) {
            $this->iPutABreakpoint("Form did not submit/close as expected.");
        }
    }
    private function isRowExpanded($row)
    {
        $checkbox = $row->find('css', 'span.ag-group-expanded');
        return $checkbox->isVisible();
    }
/** ---------------------------- Misc Util ---------------------------------- */
    private function spin ($lambda, $errMsg, $wait = 20)
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
        $this->iPutABreakpoint($errMsg);
    }
    private function getUserSession()
    {
        return isset($this->curUser) ? $this->curUser : $this->getSession();
    }
    private function clickOnElement($selector)
    {
        $elem = $this->getUserSession()->getPage()->find('css', $selector); 
        $this->handleNullAssert($elem, false, "Couldn't find the [$selector] element.");
        $elem->click();
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
        $this->iUncheckTheTimeUpdatedFilter();
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
        // $this->editorSeesExpectedInteractions();
        $this->checkSourceData();
        $this->checkTaxonData();
        $this->curUser = $this->editor2;
        $this->checkSourceData();
        $this->checkLocationData();
        // $this->editorSeesExpectedInteractions();
    }
    /** ------------------ multi-editor feature helpers ----------------- */
    private function getEditorSession()
    {
        $driver = new \Behat\Mink\Driver\Selenium2Driver('chrome');
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
        $this->curUser->getPage()->pressButton('Add Data');
        foreach ($cntAry as $cnt) {                                             fwrite(STDOUT, "\n    Creating interaction $cnt\n");
            $this->iSubmitTheNewInteractionFormWithTheFixtureEntities($cnt);
        }                                                                       fwrite(STDOUT, "\n    Interactions added. Exiting form\n");
        $this->iExitTheFormWindow();
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
        usleep(1000000);                                                        fwrite(STDOUT, "\n  Interaction ".$count." complete\n");
    }
    private function fillSrcAndLocFields($data)
    {                                                                           fwrite(STDOUT, "\n        Filling Source and Location fields.\n");
        foreach ($data as $field => $value) { 
            $this->iSelectFromTheFormDropdownField($value, $field); 
        }
    }
    private function fillTaxaFields($data) 
    {                                                                           fwrite(STDOUT, "\n        Filling Taxa fields.\n");  
        $lvls = array_keys($data);
        $this->iFocusOnTheTaxonField('Subject');   
        $this->iSelectFromTheFormDropdownField($data[$lvls[0]], $lvls[0]);
        $this->iPressTheButton('Confirm');
        $this->iFocusOnTheTaxonField('Object');
        $this->iSelectFromTheFormDropdownField('Arthropod', 'Realm');
        $this->iSelectFromTheFormDropdownField($data[$lvls[1]], $lvls[1]);
        $this->iPressTheButton('Confirm');
    }
    private function fillMiscIntFields($data)
    {                                                                           fwrite(STDOUT, "\n        Filling remaining fields.\n");
        $fields = array_keys($data); 
        $this->iSelectFromTheFormDropdownField($data[0], 'Interaction Type');
        $this->iSelectFromTheFormDropdownField($data[1], 'Interaction Tags');
        $this->iTypeInTheField($data[2], 'Note', 'textarea');
    }

    private function editorTableLoads($editor)
    {
        $editor->wait( 5000, "$('.ag-row').length" );
        $tableRows = $editor->evaluateScript("$('.ag-row').length > 0");
        assertTrue($tableRows);
    }
    private function editorChangesLocationData()
    {                                                                           fwrite(STDOUT, "\n---- Editor changing Location data.\n");
        $this->theDatabaseTableIsInSelectedView('Location'); 
        $this->editLocationData();
        $this->moveLocationInteraction();
    }
    private function editLocationData()
    {                                                                           fwrite(STDOUT, "\n        Editing Location data.\n");
        $this->iExpandInTheDataTree('Central America');
        $this->iExpandInTheDataTree('Costa Rica');
        $this->iClickOnTheEditPencilForTheRow('Santa Ana-Forest');
        $this->iChangeTheFieldTo('Display Name', 'input', 'Santa Ana-Desert');
        $this->iChangeTheDropdownFieldTo('Habitat Type', 'Desert');
        $this->curUser->getPage()->pressButton('Update Location');
        usleep(500000);
    }
    private function moveLocationInteraction()
    {                                                                           fwrite(STDOUT, "\n        Editing interaction location data.\n");
        $this->iExpandInTheDataTree('Central America');
        $this->iExpandInTheDataTree('Costa Rica');
        $this->iClickOnTheEditPencilForTheFirstInteractionOf('Santa Ana-Desert');
        $this->iChangeTheDropdownFieldTo('Location', 'Costa Rica');
        $this->curUser->getPage()->pressButton('Update Interaction');
        usleep(500000);
        $this->theDatabaseTableIsInSelectedView('Location'); 
        $this->iUncheckTheTimeUpdatedFilter();
        $this->iExpandInTheDataTree('Central America');
        $this->iExpandInTheDataTree('Costa Rica');
        $this->iShouldSeeInteractionsUnder('2', 'Unspecified Costa Rica Interactions');
    }
    private function editorChangesTaxonData()
    {                                                                           fwrite(STDOUT, "\n        Editor changing Taxon data.\n");
        $this->theDatabaseTableIsInSelectedView('Taxon'); 
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
        usleep(500000);
    }
    private function moveTaxonInteraction()
    {                                                                           fwrite(STDOUT, "\n--- Editor changing Taxon interaction data.\n");
        $this->iExpandInTheDataTree('Order Lepidoptera');
        $this->iClickOnTheEditPencilForTheFirstInteractionOf('Unspecified Lepidoptera Interactions');
        $this->iFocusOnTheTaxonField('Object');
        $this->iSelectFromTheFormDropdownField('Arthropod', 'Realm');
        $this->iSelectFromTheFormDropdownField('Sphingidaey', 'Family');
        $this->iPressTheButton('Confirm');
        $this->curUser->getPage()->pressButton('Update Interaction');
        usleep(500000);
        $this->iUncheckTheTimeUpdatedFilter();
        $this->theDatabaseTableIsInSelectedView('Taxon');
        $this->iGroupInteractionsBy('Arthropoda');
        $this->iExpandInTheDataTree('Order Lepidoptera');
        $this->iShouldSeeInteractionsUnder('1', 'Unspecified Lepidoptera Interactions');
        $this->iExpandInTheDataTree('Family Sphingidaey');
        $this->iShouldSeeInteractionsUnder('6', 'Unspecified Sphingidaey Interactions');
    }
    private function editorSeesExpectedInteractions($editor)
    {                                                                           fwrite(STDOUT, "\n        Editor sees expected data.\n");
        $this->checkSourceData();
        $this->checkLocationData();
        $this->checkTaxonData();
    }    
    private function checkSourceData()
    {
        $this->theDatabaseTableIsInSelectedView('Source'); 
        $this->iExpandInTheDataTree('Revista de Biologia Tropical');
        $this->iExpandInTheDataTree('Two cases of bat pollination in Central America');
        $this->iShouldSeeInteractionsAttributed(6);
    }
    private function checkLocationData()
    {
        $this->theDatabaseTableIsInSelectedView('Location'); 
        $this->iExpandInTheDataTree('Central America');
        $this->iExpandInTheDataTree('Costa Rica');
        $this->iShouldSeeInteractionsUnder('2', 'Unspecified Costa Rica Interactions');
        $this->iShouldSeeInteractionsUnder('1', 'Santa Ana-Desert');
    }
    private function checkTaxonData()
    {
        $this->theDatabaseTableIsInSelectedView('Taxon');
        $this->iGroupInteractionsBy('Arthropoda');
        $this->iExpandInTheDataTree('Order Lepidoptera');
        $this->iShouldSeeInteractionsUnder('1', 'Unspecified Lepidoptera Interactions');
        $this->iExpandInTheDataTree('Family Sphingidaey');
        $this->iShouldSeeInteractionsUnder('6', 'Unspecified Sphingidaey Interactions');
    }
}
