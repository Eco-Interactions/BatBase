<?php

namespace Tests\App\Controller;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Tests\App\DatabasePrimer;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\Console\Application;
use Symfony\Component\Console\Input\StringInput;

class ContentBlockTest extends WebTestCase
{   
    public function testHome()
    {
        $client = static::createClient();
        $client->followRedirects();
        $crawler = $client->request('GET', '/');
        $this->assertGreaterThan(
            0,
            $crawler->filter('html:contains("Bat Eco-Interactions")')->count(),
            'Missing text "Bat Eco-Interactions"');
    }

    public function testAboutProject()
    {
        $client = static::createClient();
        $client->followRedirects();
        $crawler = $client->request('GET', '/about');
        $this->assertGreaterThan(
            0,
            $crawler->filter('html:contains("Contact us")')->count(),
            'Missing text "Contact us"');
    }

    public function testDbTop()
    {
        $client = static::createClient();
        $client->followRedirects();
        $crawler = $client->request('GET', '/db');
        $this->assertGreaterThan(
            0,
            $crawler->filter('html:contains("How to Use")')->count(),
            'Missing text "How to Use"');
    }

    public function testDefinitions()
    {
        $client = static::createClient();
        $client->followRedirects();
        $crawler = $client->request('GET', '/definitions');
        $this->assertGreaterThan(
            0,
            $crawler->filter('html:contains("Habitat Types")')->count(),
            'Missing text "Habitat Types"');
    }

    public function testComingSoon()
    {
        $client = static::createClient();
        $client->followRedirects();
        $crawler = $client->request('GET', '/future-developments');
        $this->assertGreaterThan(
            0,
            $crawler->filter('html:contains("Coming Soon")')->count(),
            'Missing text "Coming Soon"');
    }

    public function testSearchLoad()
    {
        $client = static::createClient();
        $client->followRedirects();
        $crawler = $client->request('GET', '/search');
        $this->assertGreaterThan(
            0,
            $crawler->filter('div#detail-block div' )->count(),
            'Missing element div#detail-block div');
    }

    // public function testEdit()               //Tackle functional testing a different way.
    // {
    //     $client = static::createClient();
    //     $client->followRedirects();
 
    //     $crawler = $client->request('GET', '/login');
    //     $form = $crawler->selectButton('_submit')->form(array(
    //       '_username'  => 'testAdmin',
    //       '_password'  => 'pw4testAdmin',
    //     ));

    //     $client->submit($form);
        
    //     $crawler = $client->request('GET', '/home');

    //     $crawler = $client->click("editContentBttn");

    //     $showEditPencilLink = $crawler
    //         ->filter('button#editContentBttn')        
    //         // ->link()
    //     ;

    //     $editPencilLink = $crawler
    //         ->filter('img.wysiwygEdit')        
    //         // ->link()
    //     ;
        
    //     $crawler = $client->click($editPencilLink);

    //     $this->assertGreaterThan(
    //         0,
    //         $crawler->filter('div.trumbowyg')->count(),
    //         'Missing element div.trumbowyg');
    // }


}
