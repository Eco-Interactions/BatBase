<?php

namespace Tests\AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ContentBlockControllerTest extends WebTestCase
{
    public function testHome()
    {
        $client = static::createClient();
        $client->followRedirects();
        $crawler = $client->request('GET', '/');
        $this->assertGreaterThan(
            0,
            $crawler->filter('div#detail-block p')->count(),
            'Missing element div#detail-block p');
    }

    public function testAbout()
    {
        $client = static::createClient();
        $client->followRedirects();
        $crawler = $client->request('GET', '/about');
        $this->assertGreaterThan(
            0,
            $crawler->filter('div#detail-block p')->count(),
            'Missing element div#detail-block p');
    }

    public function testDbTop()
    {
        $client = static::createClient();
        $client->followRedirects();
        $crawler = $client->request('GET', '/db');
        $this->assertGreaterThan(
            0,
            $crawler->filter('div#detail-block p')->count(),
            'Missing element div#detail-block p');
    }

    public function testDefinitions()
    {
        $client = static::createClient();
        $client->followRedirects();
        $crawler = $client->request('GET', '/definitions');
        $this->assertGreaterThan(
            0,
            $crawler->filter('div#detail-block p')->count(),
            'Missing element div#detail-block p');
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
