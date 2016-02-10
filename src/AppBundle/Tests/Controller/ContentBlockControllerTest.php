<?php

namespace AppBundle\Tests\Controller;

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

    public function testTeam()
    {
        $client = static::createClient();
        $client->followRedirects();
        $crawler = $client->request('GET', '/team');
        $this->assertGreaterThan(
            0,
            $crawler->filter('div#detail-block p')->count(),
            'Missing element div#detail-block p');
    }
}
