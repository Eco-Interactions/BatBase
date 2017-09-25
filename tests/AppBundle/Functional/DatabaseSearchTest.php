<?php
 
namespace Tests\AppBundle\Mink;
 
use PHPUnit\Framework\TestCase;
 
class DatabaseSearchTest extends CoreMink
{
 
    public function testSubmitPage(){
        $this->login('testeditor', 'pw4test'); // Login first.
        // $this->setupSessionStorage();
 
        $this->visit('/search'); // Go to submit search

        $page = $this->getCurrentPage(); // Get the page.
        $content = $this->getCurrentPageContent();   // Get page content.
        $this->assertContains('Group Interactions by', $content);
    }

    /** Redirects all localStorage calls to sessionStorage for testing. */
    private function setupSessionStorage()
    {
        $this->minkSession->wait(
            5000,
            "ECO_INT_FMWK !== undefined"
        );
        try {
            $storage = $this->minkSession->evaluateScript('$("body").data("env", "test");');
            // $page->fillField($field, $value);
        } catch (ElementNotFoundException $ex) {
            // $this->screenShot();
            throw($ex);
        }
        // $storage = $this->minkSession->evaluateScript('ECO_INT_FMWK.testing = true;');
    }

    // public function testSearchPage(){
    //     // $this->login('testeditor', 'pw4test'); // Login first.
    //     // $this->setupSessionStorage();
 
    //     $this->visit('/search'); // Go to submit search

    //     $page = $this->getCurrentPage(); // Get the page.
    //     $content = $this->getCurrentPageContent();   // Get page content.
    //     $this->assertContains('Group Interactions by', $content);
    // }

}