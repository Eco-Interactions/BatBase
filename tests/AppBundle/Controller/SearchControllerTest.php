<?php

namespace Tests\AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class SearchControllerTest extends WebTestCase
{
    public function testSearchLoad()
    {
        $client = static::createClient();
        $client->followRedirects();
        $crawler = $client->request('GET', '/search');
        $this->assertGreaterThan(
            0,
            $crawler->filter('div#detail-block div')->count(),
            'Missing element div#detail-block div');
    }
    public function testSearchData()
    {
        $client = static::createClient();
        $client->followRedirects();
        $crawler = $client->request('GET', '/search');
        $this->assertGreaterThan(
            0,
            $crawler->filter('div.ag-cell-value')->count(),
            'Missing element div.ag-cell-value');
    }

}