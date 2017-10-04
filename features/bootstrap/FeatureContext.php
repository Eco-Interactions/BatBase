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

    /**
     * @Given the database has loaded
     */
    public function theDatabaseHasLoaded()
    {
        $this->getSession()->wait( 5000, "$('.ag-row').length" );
        $row = $this->getSession()->getPage()->find('css', '.ag-row');
        assertNotNull($row, "Can not find .ag-row");
    }

    /**
     * @Given I exit the tutorial
     */
    public function iExitTheTutorial()
    {
        $this->getSession()->executeScript("$('.introjs-overlay').click();");
        sleep(1);
    }

    /**
     * @When I group taxa by :realm
     */
    public function iGroupTaxaBy($realm)
    {
        $vals = ['Bat' => 2, 'Plant' => 3, 'Arthropod' => 4];
        $this->getSession()->executeScript("$('#sel-domain').val($vals[$realm]).change();");
        $selected = $this->getSession()->evaluateScript("$('#sel-domain option:selected').text();");

        assertEquals($selected, $realm, 'Taxa grouped by $selected; Expected $realm');
    }


}
