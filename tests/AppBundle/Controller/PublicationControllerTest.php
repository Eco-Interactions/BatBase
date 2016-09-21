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
}
