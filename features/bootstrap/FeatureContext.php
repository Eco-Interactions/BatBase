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
        $this->getSession()->resizeWindow(1440, 900, 'current');
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
        $this->getSession()->wait( 5000, "$('.ag-row').length" );
        $row = $this->getSession()->getPage()->find('css', '[row=0]');
        assertNotNull($row, "There are no rows in the database grid.");
    }

    /** -------------------------- Page Interactions --------------------------*/
    /**
     * @Given I exit the tutorial
     */
    public function iExitTheTutorial()
    {
        $tutorial = $this->getSession()->getPage()->find('css', '.intro-tips');
        assertNotNull($tutorial, 'Tutorial is not displayed.');
        $this->getSession()->executeScript("$('.introjs-overlay').click();");
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
        $this->changeGridSort('#sel-domain', $vals[$type], $newElems[$type]);
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
        $this->getSession()->executeScript("$('$selId').val('$vals[$text]').change();");
    }

    /**
     * @When I type :text in the :type text box and press enter
     */
    public function iTypeInTheTextBoxAndPressEnter($text, $type)
    {
        $input = 'sel'.$type;
        $bttn = $input.'_submit';
        $this->getSession()->executeScript("$('[name=\"$input\"]')[0].value = '$text';");
        $this->getSession()->getPage()->pressButton($bttn);
    }

    /**
     * @Then I should see :text in the :label dropdown
     */
    public function iShouldSeeInTheDropdown($text, $label)
    {
        usleep(500000);
        $selId = '#sel'.str_replace(' ','',$label);
        $selector = $selId.' option:selected';  
        $selected = $this->getSession()->evaluateScript("$('$selector').text();");  
        assertEquals($text, $selected); 
    }

    /**------------------- Form Interactions ---------------------------------*/
    /**
     * @Given I open the new Interaction form
     */
    public function iOpenTheNewInteractionForm()
    {
        $this->getSession()->getPage()->pressButton('New');
    }

    /**
     * @Given I enter :text in the :prop field dropdown 
     */
    public function iEnterInTheFieldDropdown($text, $prop)
    {
        $selId = '#'.str_replace(' ','',$prop).'-sel';
        $this->getSession()->executeScript("$('$selId')[0].selectize.createItem('$text');");
    }

    /**
     * @Given I focus on the :role taxon field
     */
    public function iFocusOnTheTaxonField($role)
    {
        $selId = '#'.$role.'-sel';
        $this->getSession()->executeScript("$('$selId')[0].selectize.focus();");
        usleep(500000);
    }

    /**
     * @Given I pin the :prop field
     */
    public function iPinTheField($prop)
    {
        $selector = '#'.str_replace(' ','',$prop).'_pin';
        $this->getSession()->executeScript("$('$selector').click();");
        $checked = $this->getSession()->evaluateScript("$('$selector').prop('checked');");
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
        $this->getSession()->getPage()->pressButton('Confirm');
        $this->iFocusOnTheTaxonField('Object');
        $this->iSelectFromTheFieldDropdown('Arthropod', 'Realm');
        $this->iSelectFromTheFieldDropdown('Object Species', 'Species');
        $this->getSession()->getPage()->pressButton('Confirm');
        $this->iSelectFromTheFieldDropdown('Consumption', 'Interaction Type');
        $this->iSelectFromTheFieldDropdown('Arthropod', 'Interaction Tags');
        $this->iTypeInTheField('Detailed interaction notes.', 'Note', 'textarea');
    }

    /**
     * @When I exit the form window
     */
    public function iExitTheFormWindow()
    {
        $this->getSession()->executeScript("$('#exit-form').click();");
    }

    /**
     * @When I type :text in the :prop field :type
     */
    public function iTypeInTheField($text, $prop, $type)
    {
        $field = '#'.str_replace(' ','',$prop).'_row '.$type;
        $curForm = $this->getOpenFormId();
        $selector = $curForm.' '.$field;
        $this->getSession()->executeScript("$('$selector')[0].value = '$text';");        
        $this->getSession()->executeScript("$('$selector').change();");    
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
        $this->getSession()->executeScript("$('$selId')[0].selectize.addItem('$val');");
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
        $this->getSession()->executeScript("$('$selId')[0].selectize.addItem('$val');");
        usleep(500000);
        $this->textSelectedInField($text, $selId);
    }

    /**
     * @When I enter :text in the :prop field dynamic dropdown
     */
    public function iEnterInTheFieldDynamicDropdown($text, $prop)
    {
        $count = $this->getCurrentFieldCount($prop);
        $selId = '#'.str_replace(' ','',$prop).'-sel'.$count;
        $this->getSession()->executeScript("$('$selId')[0].selectize.createItem('$text');");
    }

    /**
     * @Then I should see :text in the :prop field dynamic dropdown
     */
    public function iShouldSeeInTheFieldDynamicDropdown($text, $prop)
    {
        $count = $this->getCurrentFieldCount($prop);     
        $selId = '#'.str_replace(' ','',$prop).'-sel'.$count;
        $this->getSession()->wait(1000, "$('$selId+div>div>div')[0].innerText == '$text';");
        $selected = $this->getSession()->evaluateScript("$('$selId+div>div>div')[0].innerText;"); 
        while ($count > 0 && !$selected) {
            $selId = substr($selId, 0, -1).--$count;
            $selected = $this->getSession()->evaluateScript("$('$selId+div>div>div')[0].innerText;"); 
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
        $elem = $this->getSession()->getPage()->find('css', $elemId);
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
        $this->getSession()->wait(10000, "$('$selId+div>div>div')[0].innerText == '$text';");
        $this->textSelectedInField($text, $selId.'+div>div>div');
    }
    /**
     * @Then I (should) see :text in the form header
     */
    public function iShouldSeeInTheFormHeader($text)
    {
        $this->getSession()->wait( 10000, "$('#form-main p').length;");
        $elem = $this->getSession()->getPage()->find('css', '#form-main p');
        assertContains($text, $elem->getHtml()); 
    }

    /**
     * @Then the :prop field should be empty
     */
    public function theFieldShouldBeEmpty($prop)
    {
        $map = [ 'Note' => '#Note_row textarea' ];
        $selector = $map[str_replace(' ','',$prop)];
        $val = $this->getSession()->evaluateScript("$('$selector')[0].innerText"); 
        assertEquals($val, '');
    }

    /**
     * @Then the :prop select field should be empty
     */
    public function theSelectFieldShouldBeEmpty($prop)
    {
        $selector = '#'.str_replace(' ','',$prop).'-sel';
        $val = $this->getSession()->evaluateScript("$('$selector')[0].selectize.getValue();"); 
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
        $view = $this->getSession()->evaluateScript("$('#search-focus').val();");
        assertEquals($view, $map[$entity]);
    }

    /**
     * @Then the grid should be filtered to interactions created since :time
     */
    public function theGridShouldBeFilteredToInteractionsCreatedSince($time)
    {
        usleep(500000);
        $checked = $this->getSession()->evaluateScript("$('#shw-chngd').prop('checked');");
        assertTrue($checked, 'Filter is not checked.');
        $filter = $this->getSession()->evaluateScript("$('input[name=shw-chngd]:checked').val();");
        assertEquals(lcfirst($time), $filter);
    }

    /** ------------------ Helpers ----------------- */
    private function getOpenFormId()
    {
        $forms = ['sub2', 'sub', 'top'];
        foreach ($forms as $prefix) {
            $selector = '#'.$prefix.'-form';
            $elem = $this->getSession()->getPage()->find('css', $selector);
            if ($elem !== null) { return $selector; }
        }
    }

    private function getValueToSelect($selId, $text)
    {
        $opts = $this->getSession()->evaluateScript("$('$selId')[0].selectize.options;");
        foreach ($opts as $key => $optAry) {
            if ($optAry['text'] === $text) { return $optAry['value']; }
        } 
    }

    private function getCurrentFieldCount($prop)
    {
        $selCntnrId = '#'.str_replace(' ','',$prop).'_sel-cntnr';
        return $this->getSession()->evaluateScript("$('$selCntnrId').data('cnt');");
    }

    private function textSelectedInField($text, $fieldId)
    {  
        $selected = $this->getSession()->evaluateScript("$('$fieldId')[0].innerText;"); 
        if ($selected === null || $selected === "") {
            $selected = $this->getSession()->evaluateScript("$('$fieldId')[0].value;"); 
        }
        assertEquals($text, $selected); 
    }

    /**------------------ Grid Funcs -----------------------------------------*/
    /**
     * @Given I filter the grid to interactions created since :time
     */
    public function iFilterTheGridToInteractionsCreatedSince($time)
    {
        $this->getSession()->executeScript("$('#shw-chngd').click().change();");
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
        $pencil = $row->find('css', '.grid-edit');
        assertNotNull($pencil);
        $pencil->click();
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
        $this->getSession()->executeScript("$('$selector')[0].value = '$text';");        
        $this->getSession()->executeScript("$('$selector').change();");        
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
        $this->getSession()->executeScript("$('$field')[0].selectize.addItem('$val');");
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
        $row = $this->getTreeNode($text);
        $row->doubleClick();
    }

    /**
     * @When I expand :txt in level :num of the data tree
     */
    public function iExpandInLevelOfTheDataTree($txt, $num)
    {
        usleep(500000);
        $treeNodes = $this->getSession()->getPage()->findAll('css', 'div.ag-row-level-'.--$num.' [colid="name"]');  
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
        $cell = $this->getSession()->getPage()->find('css', '[row=0] [colId="intCnt"]');
        assertContains($cell->getText(), $count, 'No interaction count found.');
    }
    /**
     * @Then data in the interaction rows
     */
    public function dataInTheInteractionRows()
    {   /** Data pulled from the Subject Taxon column. */
        $data = $this->getSession()->getPage()->find('css', '[colid="subject"] span');
        assertNotNull($data->getText(), 'No data found in the interaction rows.');
    }

    /**
     * @Then I (should) see :count row(s) in the grid data tree
     */
    public function iShouldSeeRowsInTheGridDataTree($count)
    {
        usleep(500000);
        $rows = $this->getSession()->getPage()->findAll('css', '.ag-body-container>div'); 
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
        $view = $this->getSession()->evaluateScript("$('#search-focus').val();");
        assertEquals($vals[$entity], $view);
    }

    /**
     * @Then I should see :count interaction(s) attributed
     */
    public function iShouldSeeInteractionsAttributed($count)
    {
        $treeNodes = $this->getSession()->getPage()->findAll('css', 'div.ag-row [colid="name"]'); 
        assertNotNull($treeNodes, 'No nodes found in data tree.');  
        $rows = 0;
        for ($i=0; $i < count($treeNodes); $i++) { 
            if ($treeNodes[$i]->getText() === '') { $rows += 1; }
        }
        assertNotNull($rows, "Didn't find any interaction rows.");
        assertEquals($count, $rows);
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
        $this->iExpandInTheDataTree($parentNode);
        $row = $this->getGridRow($text);
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
        $this->getSession()->executeScript("$('$elemId').val('$newVal').change();");
        $uiUpdated = $this->getSession()->evaluateScript("$('#newElemId').length > 0;");
        assertNotNull($uiUpdated, 'UI did not update as expected. Did not find "'.$newElemId.'"');
    }

    private function getInteractionsRows()
    {
        $intRows = [];
        $rows = $this->getSession()->getPage()->findAll('css', '.ag-body-container .ag-row');
        assertNotNull($rows, 'No nodes found in data tree.');  
        foreach ($rows as $row) {
            $treeNode = $row->find('css', '[colid="name"]');
            if ($treeNode->getText() !== '') { array_push($intRows, $row); }
        }
        return $intRows;
    }

    private function getGridRow($text)
    {
        $rows = $this->getSession()->getPage()->findAll('css', '.ag-body-container .ag-row');
        assertNotNull($rows, 'No nodes found in data tree.');  
        foreach ($rows as $row) {
            $treeNode = $row->find('css', '[colid="name"]');
            if ($treeNode->getText() == $text) { return $row; }
        }
    }

    private function isInDataTree($text)
    {
        $treeNodes = $this->getSession()->getPage()->findAll('css', 'div.ag-row [colid="name"]'); 
        assertNotNull($treeNodes);  
        for ($i=0; $i < count($treeNodes); $i++) { 
            if ($treeNodes[$i]->getText() === $text) { return true; }
        }
        return false;
    }

    private function getTreeNode($text)
    {
        usleep(500000);
        $treeNodes = $this->getSession()->getPage()->findAll('css', 'div.ag-row [colid="name"]');  
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
            $this->getSession()->getPage()->pressButton($bttnText);
        }
    }






}
