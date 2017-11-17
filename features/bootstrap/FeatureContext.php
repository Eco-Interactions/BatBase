<?php

use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;
use Behat\MinkExtension\Context\RawMinkContext;

require_once(__DIR__.'/../../vendor/symfony/phpunit-bridge/bin/.phpunit/phpunit-5.7/vendor/autoload.php');
require_once __DIR__.'/../../vendor/symfony/phpunit-bridge/bin/.phpunit/phpunit-5.7/src/Framework/Assert/Functions.php';

/**
 * Defines application features from the specific context.
 */
class FeatureContext extends RawMinkContext implements Context
{

    private $editor1; 

    private $editor2;

    private $curUser;

    /**
     * Initializes context.
     *
     * Every scenario gets its own context instance.
     * You can also pass arbitrary arguments to the
     * context constructor through behat.yml.
     */
    public function __construct()
    {

    }

    /**
     * @Given I resize browser window
     */
    public function iResizeBrowserWindow()
    {
        $this->getUserSession()->resizeWindow(1440, 900, 'current');
    }

    /**
     * Pauses the scenario until the user presses a key. Useful when debugging a scenario.
     *
     * @Then (I )break
     */
    public function iPutABreakpoint()
    {
        fwrite(STDOUT, "\033[s    \033[93m[Breakpoint] Press \033[1;93m[RETURN]\033[0;93m to continue...\033[0m");
        while (fgets(STDIN, 1024) == '') {}
        fwrite(STDOUT, "\033[u");
        return;
    }
    /** --------------------------- Database Funcs ---------------------------*/
    /**
     * @Given the database has loaded
     */
    public function theDatabaseHasLoaded()
    {
        $this->getUserSession()->wait( 5000, "$('.ag-row').length" );
        $row = $this->getUserSession()->getPage()->find('css', '[row=0]');
        assertNotNull($row, "There are no rows in the database grid.");
    }

    /** -------------------------- Page Interactions -------------------------*/

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
            'Arthropoda' => 4, 'Plants' => 3];
        $newElems = ['Authors' => '[name="authNameSrch"]', 'Publications' => '#selPubTypes', 
            'Bats' => '#selSpecies', 'Arthropoda' => '#selOrder', 'Plants' => '#selSpecies'];
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
        $this->iSelectFromTheFieldDropdown('Test Citation', 'Citation Title');
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
        $this->clickRowEditPencil(reset($intRows));
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
        $this->getUserSession()->executeScript("$('$selector')[0].value = '$text';");        
        $this->getUserSession()->executeScript("$('$selector').change();");    
        usleep(500000);
        $this->textSelectedInField($text, $selector);
    }

    /**
     * @When I select :text from the :prop field dropdown
     */
    public function iSelectFromTheFieldDropdown($text, $prop)
    {
        $selId = '#'.str_replace(' ','',$prop).'-sel';
        $val = $this->getValueToSelect($selId, $text);
        $this->getUserSession()->executeScript("$('$selId')[0].selectize.addItem('$val');");
        usleep(500000);
        $this->textSelectedInField($text, $selId);
    }

    /**
     * @When I select :text from the :prop field dynamic dropdown
     */
    public function iSelectFromTheFieldDynamicDropdown($text, $prop)
    {
        $count = $this->getCurrentFieldCount($prop);
        $selId = '#'.str_replace(' ','',$prop).'-sel'.$count;  
        $val = $this->getValueToSelect($selId, $text); 
        $this->getUserSession()->executeScript("$('$selId')[0].selectize.addItem('$val');");
        usleep(500000);
        $this->textSelectedInField($text, $selId);
    }

    /**
     * @When I uncheck the time-updated filter
     */
    public function iUncheckTheTimeUpdatedFilter()
    {
        usleep(500000);
        $checkbox = $this->getUserSession()->getPage()->find('css', '#shw-chngd');  
        $checkbox->uncheck();  
        usleep(1000000);
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
        $this->textContainedInField($text, '#InteractionTags-sel', true);
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
        $this->textContainedInField($text, '#InteractionTags-sel', true);
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

    /** ------------------ Helpers ----------------- */
    private function getOpenFormId()
    {
        $forms = ['sub2', 'sub', 'top'];
        foreach ($forms as $prefix) {
            $selector = '#'.$prefix.'-form';
            $elem = $this->getUserSession()->getPage()->find('css', $selector);
            if ($elem !== null) { return $selector; }
        }
    }

    private function getValueToSelect($selId, $text)
    {
        $opts = $this->getUserSession()->evaluateScript("$('$selId')[0].selectize.options;");
        foreach ($opts as $key => $optAry) {
            if ($optAry['text'] === $text) { return $optAry['value']; }
        } 
    }

    private function getCurrentFieldCount($prop)
    {
        $selCntnrId = '#'.str_replace(' ','',$prop).'_sel-cntnr';
        return $this->getUserSession()->evaluateScript("$('$selCntnrId').data('cnt');");
    }

    /** 
     * If $isNot passed, text should not be equal to the field value.
     */
    private function textSelectedInField($text, $fieldId, $isNot = false)
    {  
        $selected = $this->getUserSession()->evaluateScript("$('$fieldId')[0].innerText;"); 
        if ($selected === null || $selected === "") {
            $selected = $this->getUserSession()->evaluateScript("$('$fieldId')[0].value;"); 
        }
        if ($isNot) { assertNotEquals($text, $selected); 
        } else {
            assertEquals($text, $selected); 
        }
    }

    /** 
     * If $isNot passed, text should not be found in field.
     */
    private function textContainedInField($text, $fieldId, $isNot = false)
    {  
        $selected = $this->getUserSession()->evaluateScript("$('$fieldId')[0].innerText;"); 
        if ($selected === null || $selected === "") {
            $selected = $this->getUserSession()->evaluateScript("$('$fieldId')[0].value;"); 
        }
        if ($isNot) { assertNotContains($text, $selected); 
        } else {
            assertContains($text, $selected); 
        }
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
        assertNotNull($row);
        $this->clickRowEditPencil($row);
    }

    /**
     * @When I change the :prop field :type to :text
     */
    public function iChangeTheFieldTo($prop, $type, $text)
    { 
        $map = [ "taxon name" => "#txn-name" ];
        $curForm = $this->getOpenFormId();
        $field = array_key_exists($prop, $map) ? $map[$prop] :
            '#'.str_replace(' ','',$prop).'_row '.$type; 
        $selector = $curForm.' '.$field;
        $this->getUserSession()->executeScript("$('$selector')[0].value = '$text';");        
        $this->getUserSession()->executeScript("$('$selector').change();");        
        $this->textSelectedInField($text, $selector);
    }

    /**
     * @When I change the :prop dropdown field to :text
     */
    public function iChangeTheDropdownFieldTo($prop, $text)
    {
        $map = [ "taxon level" => "#txn-lvl" ];
        $field = array_key_exists($prop, $map) ? $map[$prop] :
            '#'.str_replace(' ','',$prop).'-sel';     
        $val = $this->getValueToSelect($field, $text);
        $this->getUserSession()->executeScript("$('$field')[0].selectize.addItem('$val');");
        usleep(500000);
        $this->textSelectedInField($text, $field);
    }

    /**
     * @When I change the :prop dynamic dropdown field to :text
     */
    public function iChangeTheDynamicDropdownFieldTo($prop, $text)
    {
        $this->iSelectFromTheFieldDynamicDropdown($text, $prop);     
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
        assertNotNull($treeNodes, 'No nodes found at level $num of the data tree.');  
        $row = null;
        for ($i=0; $i < count($treeNodes); $i++) { 
            if ($treeNodes[$i]->getText() === $txt) { $row = $treeNodes[$i]; break;}
        }
        assertNotNull($row, "Didn't find the specified tree node.");
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
        if ($count != count($rows)) { $this->printErrorAndBreak("Found ". count($rows)." rows under $nodeTxt. Expected $count"); }
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
        if ($row === null) { $this->printErrorAndBreak("Couldn't find $text in the tree"); }
        assertNotNull($row);
        $this->collapseDataTreeNode($parentNode);
    }

    /**
     * @Then I should not see :text under :parentNode in the tree
     */
    public function iShouldNotSeeUnderInTheTree($text, $parentNode)
    {
        $this->iExpandInTheDataTree($parentNode);
        $row = $this->getGridRow($text);
        assertNull($row);
    }

    /** ------------------ Helpers -------------------------------------------*/
    /**
     * Updates a select elem and checks the page updated by finding a 'new' elem.
     */
    private function changeGridSort($elemId, $newVal, $newElemId)
    {  
        $this->getUserSession()->executeScript("$('$elemId').val('$newVal').change();");
        $uiUpdated = $this->getUserSession()->evaluateScript("$('#newElemId').length > 0;");
        assertNotNull($uiUpdated, 'UI did not update as expected. Did not find "'.$newElemId.'"');
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
        $rows = $this->getUserSession()->getPage()->findAll('css', '.ag-body-container .ag-row');
        assertNotNull($rows, 'No nodes found in data tree.');  
        foreach ($rows as $row) { 
            $nodeText = $row->find('css', '[colid="name"]')->getText(); 
            if ($node && $nodeText === $node) { $subSet = true; continue; }
            if ($subSet && $nodeText === '') { array_push($intRows, $row); }
            if ($subSet && $node && $nodeText !== '') { break; } 
        } 
        return $intRows;
    }
    private function getGridRow($text)
    {
        usleep(500000);
        $rows = $this->getUserSession()->getPage()->findAll('css', '.ag-body-container .ag-row');
        assertNotNull($rows, 'No nodes found in data tree.');  
        foreach ($rows as $row) {
            $treeNode = $row->find('css', '[colid="name"]');
            if ($treeNode->getText() == $text) { return $row; }
        }
    }

    private function isInDataTree($text)
    {
        $treeNodes = $this->getUserSession()->getPage()->findAll('css', 'div.ag-row [colid="name"]'); 
        assertNotNull($treeNodes);  
        for ($i=0; $i < count($treeNodes); $i++) { 
            if ($treeNodes[$i]->getText() === $text) { return true; }
        }
        return false;
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
        assertNotNull($row, "Didn't find the specified tree node.");
        return $row;
    }

    private function collapseDataTreeNode($text)
    {
        $row = $this->getTreeNode($text);
        $row->doubleClick();
    }

    private function clickRowEditPencil($row)
    {
        $pencil = $row->find('css', '.grid-edit');
        assertNotNull($pencil);
        $pencil->click();
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

    /** ------------------ Helpers ----------------- */
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

    private function iSubmitTheNewInteractionFormWithTheFixtureEntities($count)
    {
        $this->iSelectFromTheFieldDropdown('Revista de Biologia Tropical', 'Publication'); 
        $this->iSelectFromTheFieldDropdown('Two cases of bat pollination in Central America', 'Citation Title');
        $this->iSelectFromTheFieldDropdown('Central America', 'Country-Region');
        $this->iSelectFromTheFieldDropdown('Panama', 'Location');
        $this->iFocusOnTheTaxonField('Subject');
        $this->iSelectFromTheFieldDropdown('Phyllostomidae', 'Family');
        $this->getUserSession()->getPage()->pressButton('Confirm');
        $this->iFocusOnTheTaxonField('Object');
        $this->iSelectFromTheFieldDropdown('Plant', 'Realm');
        $this->iSelectFromTheFieldDropdown('Fabaceae', 'Family');
        $this->getUserSession()->getPage()->pressButton('Confirm');
        $this->iSelectFromTheFieldDropdown('Consumption', 'Interaction Type');
        $this->iSelectFromTheFieldDropdown('Arthropod', 'Interaction Tags');
        $this->iTypeInTheField('Interaction '.$count, 'Note', 'textarea');
        $this->curUser->getPage()->pressButton('Create Interaction');
        usleep(500000);
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


    /** ------------------ Generic Helpers -----------------------------------*/
    /**
     * @Given I see :text
     */
    public function iSee($text)
    {
        $this->assertSession()->pageTextContains($text);
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

    private function getUserSession()
    {
        return isset($this->curUser) ? $this->curUser : $this->getSession();
    }

    private function printErrorAndBreak($errMsg)
    {
        print("\n".$errMsg."\n");
        usleep(200000);
        $this->iPutABreakpoint();
    }

}
