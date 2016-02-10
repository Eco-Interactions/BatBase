<?php

namespace AppBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class LocationControllerTest extends WebTestCase
{
    public function testIndex()
    {
        $client = static::createClient();
        $crawler = $client->request('GET', '/location');
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
        $crawler = $client->request('GET', '/location');

        $link = $crawler
            ->filter('div#detail-block a') // find all links with the text "Greet"
            ->link()
        ;
        $crawler = $client->click($link);

        $this->assertGreaterThan(
            0,
            $crawler->filter('div#detail-block a')->count(),
            'Missing element div#detail-block a');
    }
}
