<?php

namespace AppBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class FeedbackControllerTest extends WebTestCase
{
    public function testIndex()
    {
        $client = static::createClient();
        $crawler = $client->request('GET', '/feedback');
        $crawler = $client->followRedirect();

        $this->assertGreaterThan(
            0,
            $crawler->filter('div#detail-block a')->count(),
            'Missing element- div#detail-block a');
    }
}
