<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

use AppBundle\Entity\GeoJson;


/**
 * A bug caused GeoJson entities to not be created with their Locations.
 * Note: The 'updatedBy' admin is hardcoded to 6, Sarah.
 */
class Version20200208DataRepair extends AbstractMigration implements ContainerAwareInterface
{
    private $container;
    private $em;
    private $admin;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    private function getEntity($className, $val, $prop = 'id')
    {
        return $this->em->getRepository('AppBundle:'.$className)
            ->findOneBy([$prop => $val]);
    }

    private function persistEntity($entity, $creating = false)
    {
        if ($creating) {
            $entity->setCreatedBy($this->admin);
        }
        $entity->setUpdatedBy($this->admin);
        $this->em->persist($entity);
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->getEntity('User', 6, 'id');

        $this->findAndCreateMisingGeoJson();
        $this->em->flush();
    }

    private function findAndCreateMisingGeoJson()
    {
        $all = $this->em->getRepository('AppBundle:Location')->findAll();

        foreach ($all as $loc) {                        
            if (!$loc->getLatitude()) { continue; }
            $hasGeoJson = $this->checkIfLocHasGeoJson($loc);
            if ($hasGeoJson) { continue; }
            $this->createMissingGeoJson($loc);
        }
    }

    private function checkIfLocHasGeoJson($loc)
    {
        $geoJson = $this->em->getRepository('AppBundle:GeoJson')
            ->findByLocation($loc->getId());    
        return !!$geoJson;
    }

    private function createMissingGeoJson($loc)
    {                                                                           print("\n -- ".$loc->getId());
        $coords = '['.$loc->getLongitude().', '.$loc->getLatitude().']';        //print("\n       coords = ".$coords);
        $geoJson = new GeoJson();
        $geoJson->setType('Point');
        $geoJson->setCoordinates($coords);
        $geoJson->setDisplayPoint($coords);
        $geoJson->setLocation($loc);
        $this->persistEntity($geoJson, true);
        $this->persistEntity($loc);
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
