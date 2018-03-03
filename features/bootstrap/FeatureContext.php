<?php

use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;
use Behat\MinkExtension\Context\RawMinkContext;

require_once(__DIR__.'/../../vendor/bin/.phpunit/phpunit-5.7/vendor/autoload.php');
require_once(__DIR__.'/../../vendor/bin/.phpunit/phpunit-5.7/src/Framework/Assert/Functions.php');

/**
 * Defines application features from the specific context.
 */
class FeatureContext extends RawMinkContext implements Context
{
    private static $dbChanges;
    
    /**
     * Initializes context.
     *
     * Every scenario gets its own context instance.
     * You can also pass arbitrary arguments to the
     * context constructor through behat.yml.
     */
    public function __construct(){
        self::$dbChanges = false;
    }
    /** --------------------------- Database Funcs ---------------------------*/
    /**
     * @BeforeSuite
     */
    public static function beforeSuite()
    {   
        fwrite(STDOUT, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nLoading database.\n");
        exec('php bin/console doctrine:database:drop --force --env=test');
        exec('php bin/console doctrine:database:create --env=test');
        exec('php bin/console doctrine:schema:create --env=test');
        exec('php bin/console hautelook_alice:fixtures:load --no-interaction --env=test');
    }

    /**
     * @AfterScenario
     */
    public static function afterScenario()
    {
        if (!self::$dbChanges) { return; }
        fwrite(STDOUT, "\n\n\nReloading fixtures.\n\n");
        exec('php bin/console hautelook:fixtures:load --no-interaction --purge-with-truncate --env=test');        
        self::$dbChanges = false;
    }

    /**
     * @AfterFeature
     */
    public static function afterFeature()
    {
        self::$dbChanges = false;
        print("Closed Feature.");
        // exec('php bin/console hautelook:fixtures:load --no-interaction --purge-with-truncate --env=test');        
    }

    /**
     * @Given the database has loaded
     */
    public function theDatabaseHasLoaded()
    {
        $this->getUserSession()->wait( 10000, "$('.ag-row').length" );
        $row = $this->getUserSession()->getPage()->find('css', '[row=0]');
        assertNotNull($row, "There are no rows in the database grid.");
    }

    /** -------------------------- Search Page Interactions ------------------*/
    /**
     * @Given I exit the tutorial
     */
    public function iExitTheTutorial()
    {
        $tutorial = $this->getUserSession()->getPage()->find('css', '.intro-tips');
        assertNotNull($tutorial, 'Tutorial is not displayed.');
        $this->getUserSession()->executeScript("$('.introjs-overlay').click();");
        usleep(500000);
    }
    /**
     * @Given the database grid is in :view view
     */
    public function theDatabaseGridIsInSelectedView($view)
    {
        $vals = ['Taxon' => 'taxa', 'Location' => 'locs', 'Source' => 'srcs'];
        $newElems = ['Taxon' => '#selSpecies', 'Location' => '#selRegion', 'Source' => '#selPubTypes'];
        $this->changeGridSort('#search-focus', $vals[$view], $newElems[$view]);
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
        $this->changeGridSort('#sel-realm', $vals[$type], $newElems[$type]);
    }

    /**
     * @When I select :text from the :label dropdown
     * Search page elems.
     */
    public function iSelectFromTheDropdown($text, $label)
    {
        $vals = [ 'Artibeus lituratus' => 13, 'Costa Rica' => 24, 'Journal' => 1, 
            'Book' => 2, 'Article' => 3 ];
        $selId = '#sel'.str_replace(' ','',$label);
        $this->getUserSession()->executeScript("$('$selId').val('$vals[$text]').change();");
    }

    /**
     * @When I type :text in the :type text box and press enter
     */
    public function iTypeInTheTextBoxAndPressEnter($text, $type)
    {
        $input = 'sel'.$type;
        $bttn = $input.'_submit';
        $this->getUserSession()->executeScript("$('[name=\"$input\"]')[0].value = '$text';");
        $this->getUserSession()->getPage()->pressButton($bttn);
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
        assertEquals($text, $selected); 
    }

    /**------------------- Form Functions ------------------------------------*/
    /**
     * @Given I open the new Interaction form
     */
    public function iOpenTheNewInteractionForm()
    {
        $this->getUserSession()->getPage()->pressButton('New');
    }

    /**
     * @Given I enter :text in the :prop field dropdown 
     */
    public function iEnterInTheFieldDropdown($text, $prop)
    {
        $selId = '#'.str_replace(' ','',$prop).'-sel';
        $this->getUserSession()->executeScript("$('$selId')[0].selectize.createItem('$text');");
    }

    /**
     * @Given I focus on the :role taxon field
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
        assertTrue($checked, $prop.' field is not checked.');
    }
    
    /**
     * @Given I fill the new interaction form with the test values
     */
    public function iFillTheNewInteractionFormWithTheTestValues()
    {
        $this->iSelectFromTheFieldDropdown('Test Publication', 'Publication');
        $this->iSelectFromTheFieldDropdown('Test Citation Title', 'Citation Title');
        $this->iSelectFromTheFieldDropdown('Costa Rica', 'Country-Region');
        $this->iSelectFromTheFieldDropdown('Test Location', 'Location');
        $this->iFocusOnTheTaxonField('Subject');
        $this->iSelectFromTheFieldDropdown('Subject Species', 'Species');
        $this->getUserSession()->getPage()->pressButton('Confirm');
        $this->iFocusOnTheTaxonField('Object');
        $this->iSelectFromTheFieldDropdown('Arthropod', 'Realm');
        $this->iSelectFromTheFieldDropdown('Object Species', 'Species');
        $this->getUserSession()->getPage()->pressButton('Confirm');
        $this->iSelectFromTheFieldDropdown('Consumption', 'Interaction Type');
        $this->iSelectFromTheFieldDropdown('Arthropod', 'Interaction Tags');
        $this->iTypeInTheField('Detailed interaction notes.', 'Note', 'textarea');
    }

    /**
     * @Given I click on the edit pencil for the first interaction of :nodeTxt
     */
    public function iClickOnTheEditPencilForTheFirstInteractionOf($nodeTxt)
    {
        $this->iExpandInTheDataTree($nodeTxt);
        $intRows = $this->getInteractionsRows();
        $this->clickRowEditPencil(reset($intRows), $nodeTxt);
    }

    /**
     * @When I exit the form window
     */
    public function iExitTheFormWindow()
    {
        $this->getUserSession()->executeScript("$('#exit-form').click();");
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
        $field = '#'.str_replace(' ','',$prop).'_row '.$type;
        $curForm = $this->getOpenFormId();
        $selector = $curForm.' '.$field;
        $this->handleAddValueToFormInput($selector, $text);
        // $this->getUserSession()->executeScript("$('$selector')[0].value = '$text';");        
        // $this->getUserSession()->executeScript("$('$selector').change();");    
        usleep(500000);
        $this->textSelectedInField($text, $selector);
    }

    /**
     * @When I select :text from the :prop field dropdown
     */
    public function iSelectFromTheFieldDropdown($text, $prop)
    {
        $selId = '#'.str_replace(' ','',$prop).'-sel';
        $this->selectValueInCombobox($selId, $text);
        // $val = $this->getValueToSelect($selId, $text);
        // $this->getUserSession()->executeScript("$('$selId')[0].selectize.addItem('$val');");
        // usleep(500000);
        // $this->textSelectedInField($text, $selId);
    }

    /**
     * @When I select :text from the :prop field dynamic dropdown
     * Note: Changes the last filled dropdown (!$new), or the last empty ($new).
     */
    public function iSelectFromTheFieldDynamicDropdown($text, $prop, $new)
    {
        $count = $this->getCurrentFieldCount($prop);
        $cnt = $new ? $count : --$count;
        $selId = '#'.str_replace(' ','',$prop).'-sel'.--$cnt;  
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
     */
    public function iUncheckTheTimeUpdatedFilter()
    {
        usleep(1000000);
        $checkbox = $this->getUserSession()->getPage()->find('css', 'input#shw-chngd');  
        $checkbox->uncheck();  
        usleep(500000);
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
    {
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
        $this->textSelectedInField($text, $selector);        
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
        $selected = $this->getUserSession()->evaluateScript("$('$selId+div>div>div')[0].innerText;"); 
        while ($count > 1 && $selected !== $text) {
            $selId = substr($selId, 0, -1).--$count;
            $selected = $this->getUserSession()->evaluateScript("$('$selId+div>div>div')[0].innerText;"); 
        }
        $this->textSelectedInField($text, $selId.'+div>div>div');
    }

    /**
     * @Then I should see :text in the :prop field
     * Works with interaction form select elems
     */
    public function iShouldSeeInTheField($text, $prop)
    {
        usleep(500000);
        $selId = '#'.str_replace(' ','',$prop).'-sel';
        $this->textSelectedInField($text, $selId.'+div>div>div');
    }

    /**
     * @Then I should see :text in the :entity detail panel
     */
    public function iShouldSeeInTheDetailPanel($text, $entity)
    {
        $elemId = '#'.strtolower(substr($entity , 0, 3)).'-det'; 
        $elem = $this->getUserSession()->getPage()->find('css', $elemId);
        assertContains($text, $elem->getHtml()); 
    }

    /**
     * @Then I should see :text in the :prop field :type
     */
    public function iShouldSeeInTheField2($text, $prop, $type)
    {
        $field = '#'.str_replace(' ','',$prop).'_row '.$type;
        $curForm = $this->getOpenFormId();
        $selector = $curForm.' '.$field;      
        $this->textSelectedInField($text, $selector);        
    }

    /**
     * @Then I should see :text in the :prop dropdown field 
     */
    public function iShouldSeeInTheDropdownField($text, $prop)
    {
        $selId = '#'.str_replace(' ','',$prop).'-sel';
        $this->getUserSession()->wait(10000, "$('$selId+div>div>div')[0].innerText == '$text';");
        $this->textSelectedInField($text, $selId.'+div>div>div');
    }
    /**
     * @Then I (should) see :text in the form header
     */
    public function iShouldSeeInTheFormHeader($text)
    {
        $this->getUserSession()->wait( 10000, "$('#form-main p').length;");
        $elem = $this->getUserSession()->getPage()->find('css', '#form-main p');
        assertContains($text, $elem->getHtml()); 
    }

    /**
     * @Then the :prop field should be empty
     */
    public function theFieldShouldBeEmpty($prop)
    {
        $map = [ 'Note' => '#Note_row textarea' ];
        $selector = $map[str_replace(' ','',$prop)];
        $val = $this->getUserSession()->evaluateScript("$('$selector')[0].innerText"); 
        assertEquals($val, '');
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
        assertEquals($val, '');
    }

    /**
     * @Then I should see the grid displayed in :entity view
     */
    public function iShouldSeeTheGridDisplayedInView($entity)
    {
        $map = [ 'Location' => 'locs', 'Taxon' => 'taxa', 'Source' => 'srcs' ];
        $view = $this->getUserSession()->evaluateScript("$('#search-focus').val();");
        assertEquals($view, $map[$entity]);
    }

    /**
     * @Then the grid should be filtered to interactions created since :time
     */
    public function theGridShouldBeFilteredToInteractionsCreatedSince($time)
    {
        usleep(500000);
        $checked = $this->getUserSession()->evaluateScript("$('#shw-chngd').prop('checked');");
        assertTrue($checked, 'Filter is not checked.');
        $filter = $this->getUserSession()->evaluateScript("$('input[name=shw-chngd]:checked').val();");
        assertEquals(lcfirst($time), $filter);
    }

    /**------------------ Grid Funcs -----------------------------------------*/
    /**
     * @Given I filter the grid to interactions created since :time
     */
    public function iFilterTheGridToInteractionsCreatedSince($time)
    {
        $this->getUserSession()->executeScript("$('#shw-chngd').click().change();");
        $this->theGridShouldBeFilteredToInteractionsCreatedSince($time);
        usleep(500000);
    }

    /**
     * @Given I click on the edit pencil for the :text row
     */
    public function iClickOnTheEditPencilForTheRow($text)
    {
        usleep(500000);
        $row = $this->getGridRow($text);
        // assertNotNull($row, );
        $this->handleNullAssert($row, false, 'Couldn\'t find row for = '.$text);
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
        $this->handleAddValueToFormInput($selector, $text);
        $this->textSelectedInField($text, $selector);
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
        // $val = $this->getValueToSelect($field, $text); print("Value to select in CitTypeTags = ".$val);
        // $this->getUserSession()->executeScript("$('$field')[0].selectize.addItem('$val');");
        // usleep(500000);
        // $this->textSelectedInField($text, $field);
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
        $this->handleNullAssert($row, false, 'Couldn\'t find row for = '.$text);
        // if (!$row) { $this->iPutABreakpoint('Couldn\'t find row = '.$text); }
        $row->doubleClick();
    }

    /**
     * @When I expand :txt in level :num of the data tree
     */
    public function iExpandInLevelOfTheDataTree($txt, $num)
    {
        usleep(500000);
        $treeNodes = $this->getUserSession()->getPage()->findAll('css', 'div.ag-row-level-'.--$num.' [colid="name"]');  
        assertNotNull($treeNodes, 'No nodes found at level $num of the data tree.');  
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
        assertContains($cell->getText(), $count, 'No interaction count found.');
    }
    /**
     * @Then data in the interaction rows
     */
    public function dataInTheInteractionRows()
    {   /** Data pulled from the Subject Taxon column. */
        $data = $this->getUserSession()->getPage()->find('css', '[colid="subject"] span');
        assertNotNull($data->getText(), 'No data found in the interaction rows.');
    }

    /**
     * @Then I (should) see :count row(s) in the grid data tree
     */
    public function iShouldSeeRowsInTheGridDataTree($count)
    {
        usleep(500000);
        $rows = $this->getUserSession()->getPage()->findAll('css', '.ag-body-container>div'); 
        assertCount(intval($count), $rows, "Expected [$count] rows; Found [".count($rows)."]");
    }

    /**
     * @Then I should see :text in the tree
     */
    public function iShouldSeeInTheTree($text)
    {   
        usleep(500000);
        $treeNode = $this->isInDataTree($text);
        assertTrue($treeNode, '"'.$text.'" is not displayed in grid data-tree.');
    }    

    /**
     * @Then the database grid should be in :entity view
     */
    public function theDatabaseGridShouldBeInView($entity)
    {
        $vals = ['Taxon' => 'taxa', 'Location' => 'locs', 'Source' => 'srcs'];
        $view = $this->getUserSession()->evaluateScript("$('#search-focus').val();");
        assertEquals($vals[$entity], $view);
    }

    /**
     * @Then I should see :count interaction(s) under :nodeTxt
     */
    public function iShouldSeeInteractionsUnder($count, $nodeTxt)
    {
        $this->iExpandInTheDataTree($nodeTxt);
        $rows = $this->getInteractionsRows($nodeTxt); 
        assertNotNull($rows, "Didn't find any interaction rows.");
        if ($count != count($rows)) { $this->iPutABreakpoint("Found ". count($rows)." rows under $nodeTxt. Expected $count"); }
        assertEquals($count, count($rows));
    } 

    /**
     * @Then I should see :count interactions attributed
     */
    public function iShouldSeeInteractionsAttributed($count)
    {
        $rows = $this->getInteractionsRows(); 
        assertNotNull($rows, "Didn't find any interaction rows.");
        assertEquals($count, count($rows));
    }

    /**
     * @Then the expected data in the interaction row
     */
    public function theExpectedDataInTheInteractionRow()
    {
        $cols = [ 'subject', 'object', 'interactionType', 'tags', 'citation', 
            'habitat', 'location', 'country', 'region', 'note' ];
        $intRows = $this->getInteractionsRows();

        foreach ($intRows as $row) {
            foreach ($cols as $colId) {            
                $selector = '[colid="'.$colId.'"]';
                $data = $row->find('css', $selector); 
                assertNotNull($data->getText(), 'No data found in the interaction\'s "$colId" column.');
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
        $row = $this->getGridRow($text);
        $this->handleNullAssert($row, false, "Couldn't find $text in the tree");
        $this->collapseDataTreeNode($parentNode);
    }

    /**
     * @Then I should not see :text under :parentNode in the tree
     */
    public function iShouldNotSeeUnderInTheTree($text, $parentNode)
    {
        $this->iExpandInTheDataTree($parentNode);
        $row = $this->getGridRow($text);
        $this->handleNullAssert($row, true, 'Shouldn\'t have found $text under $parentNode.');
    }

    private function getOpenFormId()
    {
        $forms = ['sub2', 'sub', 'top'];
        foreach ($forms as $prefix) {
            $selector = '#'.$prefix.'-form';
            $elem = $this->getUserSession()->getPage()->find('css', $selector);
            if ($elem !== null) { return $selector; }
        }
    }
    /** ------------------ Helper Steps --------------------------------------*/
    /**
     * @Given I see :text
     */
    public function iSee($text)
    {
        try {
            $this->assertSession()->pageTextContains($text);
        } catch (Exception $e) {
            $this->iPutABreakpoint('Did not find ['.$text.'] anywhere on page.');
        }
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
    /**
     * @When I press the :bttnText button
     */
    public function iPressTheButton($bttnText)
    {
        if (stripos($bttnText, "Update") !== false) { self::$dbChanges = true; }
        $this->getUserSession()->getPage()->pressButton($bttnText);
        usleep(500000);
    }
    /** -------------------- Asserts ---------------------------------------- */
    private function isInDataTree($text)
    {
        $treeNodes = $this->getUserSession()->getPage()->findAll('css', 'div.ag-row [colid="name"]'); 
        $this->handleNullAssert($treeNodes, false, "Didn't find the [$text] column.");
        for ($i=0; $i < count($treeNodes); $i++) { 
            if ($treeNodes[$i]->getText() === $text) { return true; }
        }
        return false;
    }
    private function textContainedInField($text, $fieldId, $isIn = true)
    {  
        $selected = $this->getUserSession()->evaluateScript("$('$fieldId')[0].innerText;"); 
        if ($selected === null || $selected === "") {
            $selected = $this->getUserSession()->evaluateScript("$('$fieldId')[0].value;"); 
        }
        $should_nt = $isIn ? 'Should' : "Shouldn't";
        $this->handleContainsAssert($text, $selected, $isIn, 
            "$should_nt have found [$text] in [$fieldId]"); 
    }
    private function textSelectedInField($text, $fieldId, $isIn = true)
    {  
        $selected = $this->getUserSession()->evaluateScript("$('$fieldId')[0].innerText;"); 
        if ($selected === null || $selected === "") {
            $selected = $this->getUserSession()->evaluateScript("$('$fieldId')[0].value;"); 
        }
        $msg = 'Found ['.$selected."] \nExpected [".$text.'] in ['.$fieldId.']';
        $should_nt = $isIn ? 'Should' : "Shouldn't";
        $this->handleEqualAssert($text, $selected, $isIn,  
            "$should_nt have found [$text] in [$fieldId]. Actually found: [$selected]."); 
    }
    /** ------------------ Get From Page -------------------------------------*/
    private function getAllGridRows()
    {
        $rows = $this->getUserSession()->getPage()->findAll('css', '.ag-body-container .ag-row');
        $this->handleNullAssert($rows, false, 'No nodes found in data tree.');
        return $rows;
    }
    private function getCurrentFieldCount($prop)
    {
        $selCntnrId = '#'.str_replace(' ','',$prop).'-sel-cntnr';
        return $this->getUserSession()->evaluateScript("$('$selCntnrId').data('cnt');");
    }
    private function getGridRow($text)
    {
        usleep(500000);
        $rows = $this->getAllGridRows();
        foreach ($rows as $row) {
            $treeNode = $row->find('css', '[colid="name"]');
            if ($treeNode->getText() == $text) { return $row; }
        }
    }
    /** 
     * Either returns all the interaction rows displayed in the grid, or a subset
     * under a specified node in the tree.
     */
    private function getInteractionsRows($node = false)
    {  
        usleep(500000);
        $intRows = [];
        $subSet = $node === false; 
        $rows = $this->getAllGridRows();
        foreach ($rows as $row) { 
            $nodeText = $row->find('css', '[colid="name"]')->getText(); 
            if ($node && $nodeText === $node) { $subSet = true; continue; }
            if ($subSet && $nodeText === '') { array_push($intRows, $row); }
            if ($subSet && $node && $nodeText !== '') { break; } 
        } 
        return $intRows;
    }
    private function getTreeNode($text)
    {
        usleep(500000);
        $treeNodes = $this->getUserSession()->getPage()->findAll('css', 'div.ag-row [colid="name"]');  
        assertNotNull($treeNodes, 'No nodes found in data tree.');  
        $row = null;
        for ($i=0; $i < count($treeNodes); $i++) { 
            if ($treeNodes[$i]->getText() === $text) { $row = $treeNodes[$i]; break;}
        }
        $this->handleNullAssert($row, false, "Didn't find the [$text] tree node.");
        // assertNotNull($row, );
        return $row;
    }
    private function getValueToSelect($selId, $text)
    {
        $opts = $this->getUserSession()->evaluateScript("$('$selId')[0].selectize.options;");
        foreach ($opts as $key => $optAry) {
            if ($optAry['text'] === $text) { print_r($optAry); return $optAry['value']; }
        } 
        $this->iPutABreakpoint("Couldn't find the option for [".$text.'] in ['.$selId.']');
    }
    /** ------------------ Interactions --------------------------------------*/
    /**
     * Updates a select elem and checks the page updated by finding a 'new' elem.
     */
    private function changeGridSort($elemId, $newVal, $newElemId)
    {  
        $this->getUserSession()->executeScript("$('$elemId').val('$newVal').change();");
        $uiUpdated = $this->getUserSession()->evaluateScript("$('#newElemId').length > 0;");
        $this->handleNullAssert($uiUpdated, false, 'UI did not update as expected. Did not find [$newElemId].');
    }
    private function collapseDataTreeNode($text)
    {
        $row = $this->getTreeNode($text);
        $row->doubleClick();
    }

    private function clickRowEditPencil($row)
    {
        $pencil = $row->find('css', '.grid-edit');
        $this->handleNullAssert($pencil, false, 'Couldn\'t find the edit pencil for row.');
        $pencil->click();
    }
    /** -------------------- Error Handling --------------------------------- */        
    /**
     * Pauses the scenario until the user presses a key. Useful when debugging a scenario.
     *
     * @Then (I )break
     */
    public function iPutABreakpoint($errMsg = null)
    {
        if ($errMsg !== null) { fwrite(STDOUT, "\n".$errMsg."\n"); } 
        fwrite(STDOUT, "\033[s    \033[93m[Breakpoint] Press \033[1;93m[RETURN]\033[0;93m to continue...\033[0m");
        while (fgets(STDIN, 1024) == '') {}
        fwrite(STDOUT, "\033[u");
        return;
    }

    /** -------- Asserts ----------- */
    private function handleContainsAssert($ndl, $hystk, $isIn, $msg)
    {
        if (strpos($hystk, $ndl) !== $isIn) { 
            $this->iPutABreakpoint($msg);
        }
    }
    private function handleEqualAssert($frst, $scnd, $isEq, $msg)
    {       print("handleEqualAssert. [$frst] ($isEq)== [$scnd]");
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
    /** -------- Page Interactions ----------- */
    private function handleAddValueToFormInput($selector, $text)
    {
        $msg = "\nCouldn't set [".$text."] into [".$selector."].";
        try {
            $this->getUserSession()->executeScript("$('$selector')[0].value = '$text';");        
            $this->getUserSession()->executeScript("$('$selector').change();");        
        } catch (Exception $e) {
            $this->iPutABreakpoint($msg);
        }
    }
    private function selectValueInCombobox($selId, $text)
    {        
        $msg = 'Error while selecting ['.$text.'] in ['.$selId.'].';
        $val = $this->getValueToSelect($selId, $text); 
        $elem = $this->getUserSession()->evaluateScript("$('$selId').length"); 
        if ($elem > 0) {  
            $this->getUserSession()->executeScript("$('$selId')[0].selectize.addItem('$val');");             }
        } else { $this->iPutABreakpoint($msg); }
        usleep(500000);
        $this->textSelectedInField($text, $selId);
    }
    /** ---------- Misc ----------- */
    private function getUserSession()
    {
        return isset($this->curUser) ? $this->curUser : $this->getSession();
    }
    // /**
    //  * @When I press the edit pencil for the :section
    //  */
    // public function iPressTheEditPencilForThe($section)
    // {
    //     $map = [ 'home page second column' => '#home-pg-second-col-edit'];
    //     $this->getUserSession()->executeScript("$('$map[$section]').click();");
    //     usleep(500000);
    // }

    // /**
    //  * @When I change the header to :text
    //  */
    // public function iChangeTheHeaderTo($text)
    // {
    //     $this->getUserSession()->executeScript("$('.trumbowyg-editor h3').val('$text');");
    //     // $this->getUserSession()->executeScript("$('.trumbowyg-editor').change();");
    // }

    // /**
    //  * @When I wait for the wysiwyg editor to update and close successfully
    //  */
    // public function iWaitForTheWysiwygEditorToUpdateAndCloseSuccessfully()
    // {
    // }
    // /**
    //  * @When I save and close the wysiwyg editor
    //  */
    // public function iSaveAndCloseTheWysiwygEditor()
    // {
    //     $this->getUserSession()->getPage()->pressButton('Save');
    //     $this->getUserSession()->wait( 5000, "!$('.wysiwyg').length" );
    // }
}
