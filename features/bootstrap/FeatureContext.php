<?php

use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;
// use Behat\MinkExtension\Context\MinkContext;
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
        sleep(1);
    }
    /**
     * @Given the database grid is in :view view
     */
    public function theDatabaseGridIsInSelectedView($view)
    {
        $vals = ['Taxon' => 'taxa', 'Location' => 'locs', 'Source' => 'srcs'];
        $newElems = ['Taxon' => '#selSpecies', 'Location' => '#selRegion', 'Source' => '#selPubTypes'];
        $this->changeGridSort('#search-focus', $vals[$view], $newElems[$view]);
        sleep(1);
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
     */
    public function iSelectFromTheDropdown($text, $label)
    {
        $vals = ['Artibeus lituratus' => 13, 'Costa Rica' => 24, 'Journal' => 1 ];
        $selId = '#sel'.str_replace(' ','',$label);
        $this->getSession()->executeScript("$('$selId').val('$vals[$text]').change();");
    }

    /**
     * @Then I should see :text in the :label dropdown
     */
    public function iShouldSeeInTheDropdown($text, $label)
    {
        $selId = '#sel'.str_replace(' ','',$label);
        $selector = $selId.' option:selected';  
        $sel = $this->getSession()->getPage()->find('css', $selId); 
        $selected = $this->getSession()->evaluateScript("$('$selector').text();");  
        assertEquals($text, $selected); //, "Expected [$text]; Found [$selected]"
    }

    /**
     * @When I type :text in the :type text box and press enter
     */
    public function iTypeInTheTextBoxAndPressEnter($text, $type)
    {
        $input = 'sel'.$type;  var_dump($input);
        $bttn = $input.'_submit';
        $this->getSession()->executeScript("$('[name=\"$input\"]')[0].value = '$text';");
        $this->getSession()->getPage()->pressButton($bttn);
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
     * @When I type :text in the :prop field :type
     */
    public function iTypeInTheField($text, $prop, $type)
    {
        $field = '#'.str_replace(' ','',$prop).'_row '.$type;
        $curForm = $this->getOpenFormId(); var_dump($curForm);
        $selector = $curForm.' '.$field;
        $this->getSession()->executeScript("$('$selector')[0].value = '$text';");        
        $this->getSession()->executeScript("$('$selector').change();");        
    }

    /**
     * @When I select :text from the :prop field dropdown
     */
    public function iSelectFromTheFieldDropdown($text, $prop)
    {
        $selId = '#'.str_replace(' ','',$prop).'-sel';
        $val = $this->getValueToSelect($selId, $text);
        $this->getSession()->executeScript("$('$selId')[0].selectize.addItem('$val');");
    }

    private function getValueToSelect($selId, $text)
    {
        $opts = $this->getSession()->evaluateScript("$('$selId')[0].selectize.options;");
        foreach ($opts as $key => $optAry) {
            if ($optAry['text'] === $text) { return $optAry['value']; }
        } 
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
        $count = $this->getCurrentFieldCount($prop)-1;
        $selId = '#'.str_replace(' ','',$prop).'-sel'.$count;
        $this->getSession()->wait(5000, "$('$selId+div>div>div')[0].innerText == '$text';");
        $selected = $this->getSession()->evaluateScript("$('$selId+div>div>div')[0].innerText;"); 
        assertEquals($text, $selected); 
    }

    private function getCurrentFieldCount($prop)
    {
        $selCntnrId = '#'.str_replace(' ','',$prop).'_sel-cntnr';
        return $this->getSession()->evaluateScript("$('$selCntnrId').data('cnt');");
    }
    /**
     * @Then I should see :text in the :prop field
     */
    public function iShouldSeeInTheField($text, $prop)
    {
        $selId = '#'.str_replace(' ','',$prop).'-sel';
        $this->getSession()->wait( 5000, "$('$selId+div>div>div')[0].innerText == '$text';");
        $selected = $this->getSession()->evaluateScript("$('$selId+div>div>div')[0].innerText;"); 
        assertEquals($text, $selected);  //, "Expected [$text]; Found [$selected]"
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
     * @Given I focus on the :role taxon field
     */
    public function iFocusOnTheTaxonField($role)
    {
        $selId = '#'.$role.'-sel';
        $this->getSession()->executeScript("$('$selId')[0].selectize.focus();");
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

    /**------------------ Grid Funcs -----------------------------------------*/
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
     * @Then I (should) see :count rows in the grid data tree
     */
    public function iShouldSeeRowsInTheGridDataTree($count)
    {
        $rows = $this->getSession()->getPage()->findAll('css', '.ag-body-container>div'); 
        assertCount(intval($count), $rows, "Expected [$count] rows; Found [".count($rows)."]");
    }

    /**
     * @Then I should see :text in the tree
     */
    public function iShouldSeeInTheTree($text)
    {   
        $treeNodes = $this->getSession()->getPage()->findAll('css', '[colid="name"] span.ag-group-value span'); 
        assertNotNull($treeNodes);  
        $found = false;
        for ($i=0; $i < count($treeNodes); $i++) { 
            if ($treeNodes[$i]->getText() === $text) { $found = true; break;}
        }
        assertTrue($found, '"'.$text.'" is not displayed in grid data-tree.');
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
    /** ------------------ Generic Helpers -----------------------------------*/
    /**
     * @When I press :bttnText :count times
     */
    public function iPressTimes($bttnText, $count)
    {
        for ($i=0; $i < $count; $i++) { 
            $this->getSession()->getPage()->pressButton($bttnText);
        }
    }
    /**
     * @Given I see :text
     */
    public function iSee($text)
    {
        $this->assertSession()->pageTextContains($text);
    }






}
