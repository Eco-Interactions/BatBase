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
    /** Used for mutli-editor testing. */
    private $curUser;
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
    /** --------------------------- Database Funcs ---------------------------*/
    /**
     * @BeforeSuite
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
     */
    public static function afterFeature()
    {
        fwrite(STDOUT, "\n\n\nReloading fixtures.\n\n");
        exec('php bin/console hautelook:fixtures:load --no-interaction --purge-with-truncate --env=test');        
        self::$dbChanges = false;
    }
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
        $this->handleNullAssert($row, false, 'There are no rows in the database grid.');
    }

    /** -------------------------- Search Page Interactions ------------------*/
    /**
     * @Given I exit the tutorial
     */
    public function iExitTheTutorial()
    {
        $tutorial = $this->getUserSession()->getPage()->find('css', '.intro-tips');
        $this->handleNullAssert($tutorial, false, 'Tutorial is not displayed.');
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
        $this->handleEqualAssert($text, $selected, true, 
            "Found [$selected] in the [$label] ($selId) field. Expected [$text].");
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
     * @Given I enter :text in the :prop dropdown field 
     */
    public function iEnterInTheDropdownField($text, $prop)
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
            'Country-Region' => 'Costa Rica', 'Location' => 'Test Location'];
        $this->fillSrcAndLocFields($srcLocData);
        $taxaData = ['Genus' => 'Subject Genus', 'Species' => 'Object Species'];
        $this->fillTaxaFields($taxaData);
        $miscData = [ 'Interaction Type' => 'Consumption', 
            'Interaction Tags' => 'Arthropod', 'Note' => 'Detailed interaction notes.'];
        $this->fillMiscIntFields($miscData);
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
    public function iSelectFromTheDropdownField($text, $prop)
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
     */
    public function iUncheckTheTimeUpdatedFilter()
    {
        usleep(1000000); //refactor to  [wait(test)]
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
        $this->assertFieldValueIs($text, $selector);        
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
        $this->assertFieldValueIs($text, $selId.'+div>div>div');
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
     * @Then I should see :text in the :prop dropdown field 
     */
    public function iShouldSeeInTheDropdownField($text, $prop)
    {
        $selId = '#'.str_replace(' ','',$prop).'-sel';
        $this->getUserSession()->wait(10000, "$('$selId+div>div>div')[0].innerText == '$text';");
        $this->assertFieldValueIs($text, $selId.'+div>div>div');
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
     * @Then I should see the grid displayed in :entity view
     */
    public function iShouldSeeTheGridDisplayedInView($entity)
    {
        $map = [ 'Location' => 'locs', 'Taxon' => 'taxa', 'Source' => 'srcs' ];
        $view = $this->getUserSession()->evaluateScript("$('#search-focus').val();");
        $this->handleEqualAssert($view, $map[$entity], true, 
            "DB in [$view] view. Expected [$map[$entity]]");
    }

    /**
     * @Then the grid should be filtered to interactions created since :time
     */
    public function theGridShouldBeFilteredToInteractionsCreatedSince($time)
    {
        usleep(500000);
        $checked = $this->getUserSession()->evaluateScript("$('#shw-chngd').prop('checked');");
        $this->handleEqualAssert($checked, true, true, "Updates-since filter is not checked.");
        $filter = $this->getUserSession()->evaluateScript("$('input[name=shw-chngd]:checked').val();");
        $this->handleEqualAssert(lcfirst($time), $filter, true, 
            "Showing updates-since [$filter]. Expected since [$time]");
    }

    /**------------------ Grid Interaction Steps -----------------------------*/
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
        $row->doubleClick();
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
     * Note: Data is checked in the Subject Taxon column only.
     */
    public function dataInTheInteractionRows()
    {   
        $data = $this->getUserSession()->getPage()->find('css', '[colid="subject"] span');
        $this->handleNullAssert($data->getText(), false, 
            'No data found in the interaction rows.');
    }

    /**
     * @Then I (should) see :count row(s) in the grid data tree
     */
    public function iShouldSeeRowsInTheGridDataTree($count)
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
        $this->handleEqualAssert($inTree, true, true, "[$text] is not displayed in grid data-tree.");
    }    

    /**
     * @Then I should not see :text in the tree
     */
    public function iShouldNotSeeInTheTree($text)
    {   
        usleep(500000);
        $inTree = $this->isInDataTree($text);
        $this->handleEqualAssert($inTree, false, true, 
            "[$text] should not be displayed in grid data-tree.");
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
        $row = $this->getGridRow($text);
        $this->handleNullAssert($row, false, "Couldn't find row for = [$text]");
        $this->collapseDataTreeNode($parentNode);
    }

    /**
     * @Then I should not see :text under :parentNode in the tree
     */
    public function iShouldNotSeeUnderInTheTree($text, $parentNode)
    {
        $this->iExpandInTheDataTree($parentNode);
        $row = $this->getGridRow($text);
        $this->handleNullAssert($row, true, "Shouldn't have found $text under $parentNode.");
    }
    /** ------------------ Data Sync Feature -----------------------------------*/
    /**
     * @Given two editors are logged into the website
     */
    public function twoEditorsAreLoggedIntoTheWebsite()
    {
        $this->editor1 = $this->getEditorSession();
        $this->editorLogIn($this->editor1, 'testeditor');

        $this->editor2 = $this->getEditorSession();
        $this->editorLogIn($this->editor2, 'testAdmin');
    }

    /**
     * @When each user creates two interactions
     */
    public function eachUserCreatesTwoInteractions()
    {
        $this->userCreatesInteractions($this->editor1, [1, 2]);
        $this->userCreatesInteractions($this->editor2, [3, 4]);
    }

    /**
     * @When each edits some sub-entity data
     */
    public function eachEditsSomeSubEntityData()
    {   // move interaction from one taxa, location, and source to another
    }

    /**
     * @When each reloads the search page
     */
    public function eachReloadsTheSearchPage()
    {
        $this->editorVisitsSearchPage($this->editor1);
        $this->editorVisitsSearchPage($this->editor2);
    }

    /**
     * @Then the new data should sync between the editors
     */
    public function theNewDataShouldSyncBetweenTheEditors()
    {
        $this->editorGridLoads($this->editor1);
        $this->editorGridLoads($this->editor2);
    }

    /**
     * @Then they should see the expected changes in the data grid
     */
    public function theyShouldSeeTheExpectedChangesInTheDataGrid()
    {
        $this->editorSeesExpectedInteractions($this->editor1);
        $this->editorSeesExpectedInteractions($this->editor2);
    }
    /** ------------------ Helper Steps --------------------------------------*/
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
    /**
     * @When I press the :bttnText button
     */
    public function iPressTheButton($bttnText)
    {
        if (stripos($bttnText, "Update") !== false || 
            stripos($bttnText, "Create") !== false) { self::$dbChanges = true; }
        $this->getUserSession()->getPage()->pressButton($bttnText);
        usleep(500000);
    }
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
    /** -------------------- Asserts ---------------------------------------- */
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
    /** ------------------ Get From Page -------------------------------------*/
    private function getAllGridRows()
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
    /** ------------------ Interactions --------------------------------------*/
    /**
     * Updates a select elem and checks the page updated by finding a 'new' elem.
     */
    private function changeGridSort($elemId, $newVal, $newElemId)
    {  
        $this->getUserSession()->executeScript("$('$elemId').val('$newVal').change();");
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
        $pencil = $row->find('css', '.grid-edit');
        $this->handleNullAssert($pencil, false, "Couldn't find the edit pencil for row.");
        $pencil->click();
    }
    /** -------------------- Error Handling --------------------------------- */        
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

    /** -------- Asserts ----------- */
    private function handleContainsAssert($ndl, $hystk, $isIn, $msg)
    {                                                                           //print('fieldVal = '.$hystk.', needle = '.$ndl);
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
    /** -------- Page Interactions ----------- */
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
    {                                                                           //print('selId = '.$selId);
        $msg = 'Error while selecting ['.$text.'] in ['.$selId.'].';
        $val = $this->getValueToSelect($selId, $text); 
        $this->getUserSession()->executeScript("$('$selId').length ? $('$selId')[0].selectize.addItem('$val') : null;");
        usleep(500000);
        $this->assertFieldValueIs($text, $selId);
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
    {
        $this->curUser = $editor;
        $this->editorVisitsSearchPage($this->curUser);
        $this->iExitTheTutorial();
        $this->curUser->getPage()->pressButton('New');
        foreach ($cntAry as $cnt) {
            $this->iSubmitTheNewInteractionFormWithTheFixtureEntities($cnt);
        }
        $this->iExitTheFormWindow();
    }

    private function editorVisitsSearchPage($editor)
    {
        $editor->visit('http://localhost/batplant/web/app_test.php/search');
        usleep(500000);
    }
    /**
     * @Given I create an interaction 
     */
    public function iSubmitTheNewInteractionFormWithTheFixtureEntities($count = 1)
    {
        $srcLocData = [ 'Publication' => 'Revista de Biologia Tropical', 
            'Citation Title' => 'Two cases of bat pollination in Central America', 
            'Country-Region' => 'Central America', 'Location' => 'Panama'];
        $this->fillSrcAndLocFields($srcLocData);
        $taxaData = ['Genus' => 'Artibeus', 'Family' => 'Fabaceae'];
        $this->fillTaxaFields($taxaData);
        $miscData = [ 'Interaction Type' => 'Consumption', 
            'Interaction Tags' => 'Flower', 'Note' => 'Interaction '.$count];
        $this->fillMiscIntFields($miscData);
        $this->curUser->getPage()->pressButton('Create Interaction');
        usleep(500000);
    }
    private function fillSrcAndLocFields($data)
    {   fwrite(STDOUT, "\nFilling Source and Location fields.\n");
        foreach ($data as $field => $value) { //print_r('$field = '.$field.' $val = '.$value);
            $this->iSelectFromTheDropdownField($value, $field); 
        }
    }
    private function fillTaxaFields($data) 
    {   fwrite(STDOUT, "\nFilling Taxa fields.\n");  
        $lvls = array_keys($data);
        $this->iFocusOnTheTaxonField('Subject');
        $this->iSelectFromTheDropdownField($data[$lvls[0]], $lvls[0]);
        $this->getUserSession()->getPage()->pressButton('Confirm');
        $this->iFocusOnTheTaxonField('Object');
        $this->iSelectFromTheDropdownField('Arthropod', 'Realm');
        $this->iSelectFromTheDropdownField($data[$lvls[1]], $lvls[1]);
        $this->getUserSession()->getPage()->pressButton('Confirm');
    }
    private function fillMiscIntFields($data)
    {   fwrite(STDOUT, "\nFilling remaining fields.\n");
        $fields = array_keys($data);  //print_r($fields);
        $this->iSelectFromTheDropdownField($data[$fields[0]], $fields[0]);
        $this->iSelectFromTheDropdownField($data[$fields[1]], $fields[1]);
        $this->iTypeInTheField($data[$fields[2]], $fields[2], 'textarea');
    }

    private function editorGridLoads($editor)
    {
        $editor->wait( 5000, "$('.ag-row').length" );
        $gridRows = $editor->evaluateScript("$('.ag-row').length > 0");
        assertTrue($gridRows);
    }

    private function editorSeesExpectedInteractions($editor)
    {
        $this->curUser = $editor;
        $this->iExpandInTheDataTree('Revista de Biologia Tropical');
        $this->iExpandInTheDataTree('Two cases of bat pollination in Central America');
        $this->iShouldSeeInteractionsAttributed(6);
    }    
    /** ---------- Misc ----------- */
    private function getUserSession()
    {
        return isset($this->curUser) ? $this->curUser : $this->getSession();
    }
}
