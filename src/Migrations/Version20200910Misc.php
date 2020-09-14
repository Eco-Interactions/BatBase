<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Changes the Tags for Roost type: leaf -> external, wood -> internal. 
 * Deletes complete invalid Source URLs, prints a report of broken URLs. 
 */
final class Version20200910Misc extends AbstractMigration implements ContainerAwareInterface
{

    private $em;
    protected $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function getDescription() : string
    {
        return "Changes the Tags for Roost type: leaf -> external, wood -> internal.
            Deletes complete invalid Source URLs, prints a report of broken URLs.
            Deletes error GeoJson entities.";
    }

    private function getEntity($className, $val, $prop = 'id')
    {
        return $this->em->getRepository('App:'.$className)
            ->findOneBy([$prop => $val]);
    }

    public function getEntities($className)
    {
        return $this->em->getRepository('App:'.$className)->findAll();
    }

    public function persistEntity($entity, $creating = false)
    {
        if ($creating) {
            $entity->setCreatedBy($this->admin);
        }
        $entity->setUpdatedBy($this->admin);
        $this->em->persist($entity);
    }

/* ============================== UP ======================================== */
    public function up(Schema $schema) : void
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->getEntity('User', 6, 'id');

        // $this->deleteGeoJsonErrs();
        $this->updateRoostTags();
        $this->validateSourceUrls();

        $this->em->flush();
    }
    private function deleteGeoJsonErrs()
    {
        $ids = [3570, 3583];

        foreach ($ids as $id) {
            $entity = $this->getEntity('Location', $id);
            $entity->setGeoJson(null);
            $this->persistEntity($entity); 
        }
    }
/* -------------------- ROOST TAG UPDATE ------------------------------------ */
    private function updateRoostTags()
    {
        $names = ['Leaf' => 'Internal', 'Wood' => 'External'];

        foreach ($names as $cur => $new) {
            $tag = $this->getEntity('Tag', $cur, 'displayName');
            $tag->setDisplayName($new);
            $this->persistEntity($tag);
        }
    }
/* -------------------- URL VALIDATION  ------------------------------------- */
    private function validateSourceUrls()
    {  print("\n\n\n\n\n\n\n\n\n\n\n");
        $srcs = $this->getEntities('Source');
        $invalidUrls = [];

        foreach ($srcs as $src) {
            $this->handleLinkUrl($src, $invalidUrls);
            $this->handleDoi($src, $invalidUrls);
        }

        // ksort($invalidUrls);  //print('reporting...');
        // foreach ($invalidUrls as $name => $responses) {
        //     ksort($responses);

        //     foreach ($responses as $response => $urls) {
        //         ksort($urls);
        //         $invalidUrls[$name][$response] = $urls;
        //     }
        //     $invalidUrls[$name] = $responses;
        // }                                            //print("\n\Report = "); print_r($invalidUrls);
    }
    private function handleDoi($src, &$invalidUrls)
    {
        $url = $src->getDoi() ? trim($src->getDoi()) : null;
        if (!$url) { return; }

        if (!preg_match('-http(s?)://doi.org/.+-', $url)) {
            $url = 'https://doi.org/' . $url;
            $src->setDoi($url);
            $this->persistEntity($src);
        }

        $invalidUrl = $this->ifInvalidGetLinkData($url);
        if (!$invalidUrl) { return; };
        if ($invalidUrl === 'failed') { 
            $src->setLinkUrl(null); 
            $src->setLinkDisplay(null); 
            $this->persistEntity($src);
            return;
        }
        // $editor = $src->getUpdatedBy() || $src->getCreatedBy();
        // $editor = $editor->getFullName();

        // if (!array_key_exists($invalidUrl[$editor]['response'], $invalidUrls)) {
        //     $invalidUrls[$invalidUrl[$editor]['response']] = [];
        // }
        // $invalidUrls[$invalidUrl[$editor]['response']] += [
        //     $src->getDisplayName().' ['.$src->getId().' - DOI]' => $invalidUrl['url']
        // ];
    }
    private function handleLinkUrl($src, &$invalidUrls)
    {
        if ($src->getId() === 1408) { $src->setLinkUrl(null); return; }

        $url = $src->getLinkUrl() ? trim($src->getLinkUrl()) : null;
        if (!$url) { return; }

        if (!preg_match('-http(s?)://.+-', $url)) {
            $url = 'https://' . $url;
            $src->setLinkUrl($url);
            $this->persistEntity($src);
        }
        $invalidUrl = $this->ifInvalidGetLinkData($url);
        if (!$invalidUrl) { return; };
        if ($invalidUrl === 'failed') { 
            $src->setLinkUrl(null); 
            $src->setLinkDisplay(null); 
            $this->persistEntity($src);
            return;
        }
        // $editor = $src->getUpdatedBy() || $src->getCreatedBy();
        // $editor = $editor->getFullName();

        // if (!array_key_exists($invalidUrl[$editor]['response'], $invalidUrls)) {
        //     $invalidUrls[$invalidUrl['response']] = [];
        // }
        // $invalidUrls[$invalidUrl['response']] += [
        //     $src->getDisplayName().' ['.$src->getId().' - WEBSITE]' => $invalidUrl['url']
        // ];
    }

    private function ifInvalidGetLinkData($url)
    {
        $headers = @get_headers($url);    
        if (!$headers) { return 'failed'; }                                          //print("\n    headers = ".$headers[0]);
        $valid = $headers && strpos($headers[0],'200') !== false;                   //print("\n         valid = ".$valid);
        return $valid ? false : $this->returnInvalidUrl($url, $headers[0]);
    }
    private function returnInvalidUrl($url, $header)
    {
        // if (!array_key_exists($invalidUrl[$editor], $invalidUrls)) {
        //     $invalidUrls[$invalidUrl[$editor]] = [];
        // }

        return [
            'response' => $header,
            'url' => $url
         ];
    }
/* ============================ DOWN ======================================== */
    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
