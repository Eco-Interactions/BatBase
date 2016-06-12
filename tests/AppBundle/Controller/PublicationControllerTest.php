<?php

namespace Tests\AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class PublicationControllerTest extends WebTestCase
{
    public function testIndex()
    {
        $client = static::createClient();
        $crawler = $client->request('GET', '/publication');
        $crawler = $client->followRedirect();

        $this->assertGreaterThan(
            0,
            $crawler->filter('div#detail-block a')->count(),
            'Missing element- div#detail-block a');
    }

    public function testShow()
    {
        $client = static::createClient();
        $client->followRedirects();
        $crawler = $client->request('GET', '/publication');

        $link = $crawler
            ->filter('div#detail-block a') // find the first link inside data table
            ->link()
        ;
        $crawler = $client->click($link);

        $this->assertGreaterThan(
            0,
            $crawler->filter('div#detail-block table')->count(),
            'Missing element div#detail-block table');
    }

    public function testEdit()
    {
        $client = static::createClient();
        $client->followRedirects();
 
        $crawler = $client->request('GET', '/login');
        $form = $crawler->selectButton('_submit')->form(array(
          '_username'  => 'testAdmin',
          '_password'  => 'pw4testAdmin',
        ));

        $client->submit($form);
        
        $crawler = $client->request('GET', '/publication');
        $showLink = $crawler
            ->filter('div#detail-block a') // find the first link inside data table
            ->link()
        ;
        $crawler = $client->click($showLink);

        $editLink = $crawler
            ->selectLink('Edit Publication')
            ->link();
        
        $crawler = $client->click($editLink);

        $this->assertGreaterThan(
            0,
            $crawler->filter('div#detail-block form')->count(),
            'Missing element div#detail-block form');
    }}
