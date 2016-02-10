<?php

namespace AppBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class TaxonControllerTest extends WebTestCase
{
    public function testShow()
    {
        $client = static::createClient();
        $client->followRedirects();
        $crawler = $client->request('GET', '/domain');

        $link = $crawler
            ->filter('div#detail-block a') // find all links with the text "Greet"
            ->link()
        ;
        $crawler = $client->click($link);

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
