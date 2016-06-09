<?php

namespace AppBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class AuthorControllerTest extends WebTestCase
{
    public function testIndex()
    {
        $client = static::createClient();
        $crawler = $client->request('GET', '/author');
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
        $crawler = $client->request('GET', '/author');

        $link = $crawler
            ->filter('div#detail-block a') // find all links with the text "Greet"
            ->link()
        ;
        $crawler = $client->click($link);

        $this->assertGreaterThan(
            0,
            $crawler->filter('div#detail-block table')->count(),
            'Missing element div#detail-block table');
    }

    public function testExport()
    {
        $client = static::createClient();
        $client->followRedirects();
        $crawler = $client->request('GET', '/author/export');

        $this->assertGreaterThan(
            0,
            $crawler->filter('div#exprtContnt table')->count(),
            'Missing element div#exprtContnt table');
    }
}
