<?php

namespace Tests\AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class TaxonControllerTest extends WebTestCase
{
    public function testShow()
    {
        $client = static::createClient();
        $client->followRedirects();
        $crawler = $client->request('GET', '/domain');

        $link = $crawler
            ->filter('div#detail-block a')   // find the first link inside data table
            ->link()
        ;
        $crawler = $client->click($link);

        $link = $crawler
            ->filter('div#detail-block a') 
            ->link()
        ;
        $crawler = $client->click($link);

        $this->assertGreaterThan(
            0,
            $crawler->filter('div#detail-block a')->count(),
            'Missing element div#detail-block a');
    }

    // public function testEdit()
    // {
    //     $client = static::createClient();
    //     $client->followRedirects();
 
    //     $crawler = $client->request('GET', '/login');
    //     $form = $crawler->selectButton('_submit')->form(array(
    //       '_username'  => 'testAdmin',
    //       '_password'  => 'pw4testAdmin',
    //     ));

    //     $client->submit($form);
        
    //     $crawler = $client->request('GET', '/domain');

    //     $link = $crawler
    //         ->filter('div#detail-block a')   // Select first domain, 'bats' 
    //         ->link()
    //     ;
    //     $crawler = $client->click($link);

    //     $batsShow = $crawler
    //         ->filter('div#detail-block a')   // Select first taxa
    //         ->link()
    //     ;
    //     $crawler = $client->click($batsShow);

    //     $editLink = $crawler
    //         ->selectLink('Edit Taxon')
    //         ->link();
        
    //     $crawler = $client->click($editLink);

    //     $this->assertGreaterThan(
    //         0,
    //         $crawler->filter('div#detail-block form')->count(),
    //         'Missing element div#detail-block form');
    // }}
