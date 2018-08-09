<?php

namespace Application\Migrations;

use AppBundle\Entity\GeoJson;
use AppBundle\Entity\SystemDate;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Creates a geoJson entity for all locations with gps (lat, long) data
 * Creates GeoJson entry in SystemDate table to track updates.
 * Note: The 'updatedBy' admin is hardcoded to 6, Sarah.
 */
class Version20180522233145AddLocPoints extends AbstractMigration implements ContainerAwareInterface
{

    private $container;
    private $em;
    private $admin;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->em->getRepository('AppBundle:User')->findOneBy(['id' => 6]);

        $this->addGeoJsonToSystemDate();
        $this->createGeoJsonEntities();
    }

    private function addGeoJsonToSystemDate()
    {
        $GeoJsonDate = new SystemDate();
        $GeoJsonDate->setDateVal(new \DateTime());
        $GeoJsonDate->setDescription('GeoJson');    
        $GeoJsonDate->setUpdatedBy($this->admin);
        $this->em->persist($GeoJsonDate);
    }

    private function createGeoJsonEntities()
    {
        $locs = $this->em->getRepository('AppBundle:Location')->findAll();

        foreach ($locs as $loc) {
            if (!$loc->getLatitude()) { continue; }
            $this->createGeoJson($loc);
        }
        $this->em->flush();
    }

    private function createGeoJson($loc)
    {
        $lat = $loc->getLatitude();
        $lng = $loc->getLongitude();

        $geoJson = new GeoJson();
        $geoJson->setCenterPoint("[$lng, $lat]");
        $geoJson->setCoordinates("[$lng, $lat]");
        $geoJson->setType('Point');
        $geoJson->setLocation($loc);
        $geoJson->setCreatedBy($this->admin);

        $loc->setGeoJson($geoJson);

        $this->em->persist($geoJson);        
        $this->em->persist($loc); 
        $this->em->flush();       
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
