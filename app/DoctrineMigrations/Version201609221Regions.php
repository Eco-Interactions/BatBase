<?php

namespace Application\Migrations;

use AppBundle\Entity\Location;
use AppBundle\Entity\Region;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Migration updates existing region (-Unspecified) locations or adds a new location
 * for any not currently in the database. 
 */
class Version201609221Regions extends AbstractMigration implements ContainerAwareInterface
{

    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * For each region, either update current location entity by dropping '-Unspecified' 
     * and adding a "REgion" location type or create new location. 
     * Subregions must be created last to be able to reference their parent location/region.
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');
       
        $em = $this->container->get('doctrine.orm.entity_manager');

        $this->addMissingParentRegions($em);
        $this->addRegionsToLocs($em);
    }
    private function addMissingParentRegions($em)
    {
        $entity = new Region();
        $entity->setDescription("Asia");
        $em->persist($entity);
        $em->flush();
    }
    private function addRegionsToLocs($em)
    {
        $regions = $em->getRepository('AppBundle:Region')->findAll();
        $regionWithSubRegions = ['Mariana Islands' => ['Oceania']];

        foreach ($regions as $region) {
            $regionName = $region->getDescription();
            $altName = $regionName === "Central America, South America" ? 
                "Central & South America" : null;
            // Sub-regions must be handled after all top-regions.
            $parentRegion = $this->isSubRegion($region, $regionName);
            if ($parentRegion !== false) {  
                if (!array_key_exists($parentRegion, $regionWithSubRegions)) {
                    $regionWithSubRegions[$parentRegion] = [];    
                }
                array_push($regionWithSubRegions[$parentRegion], $region->getDescription()); 
                continue;
            }
            // Update existing location entity for this region, or create new.
            $curLoc = $em->getRepository('AppBundle:Location')
                ->findOneBy(array('description' => $regionName.'-Unspecified'));
            if ($curLoc === null) {                                         
                $this->buildLocEntity($region, $altName, null, $em);
            } else {
                $this->updateLocEntity($curLoc, $regionName, $em);    
            }
        }  
        $this->addSubRegions($regionWithSubRegions, $em);
    }
    private function updateLocEntity($locEntity, $regionName, $em)
    {
        $locEntity->setDescription($regionName);
        $locEntity->setLocationType($em->getRepository('AppBundle:LocationType')
            ->findOneBy(array('id' => 1)));
        $locEntity->setUpdatedBy($em->getRepository('AppBundle:User')
            ->findOneBy(array('id' => '6')));

        $em->persist($locEntity);
        $em->flush();
    }
    private function buildLocEntity($region, $regionName, $parent, $em)
    {
        $entity = new Location();
        $regionName = $regionName ?: $region->getDescription();
        $entity->setDescription($regionName);
        $entity->setCreatedBy($em->getRepository('AppBundle:User')
            ->findOneBy(array('id' => '6')));
        $entity->setLocationType($em->getRepository('AppBundle:LocationType')
            ->findOneBy(array('id' => 1)));

        $childLocs = $region->getLocations();

        foreach ($childLocs as $loc) { $entity->addChildLocs($loc); }

        if ($parent !== null) { $entity->setParentLoc($parent); }

        $em->persist($entity);
        $em->flush();
    }
    private function addSubRegions($regionWithSubRegions, $em)
    {
        foreach ($regionWithSubRegions as $parentRegion => $regions) {  
            $parentLoc = $em->getRepository('AppBundle:Location')
                ->findOneBy(array('description' => $parentRegion));

            foreach ($regions as $subRegion) { 
                // If there is a current location entity for this region, update it.
                $curLoc = $em->getRepository('AppBundle:Location')
                    ->findOneBy(array('description' => $subRegion.'-Unspecified'));
                if ($curLoc === null) {                         //print("location for --SUBREGION--".$subRegion." Not found. \n");
                    $region = $em->getRepository('AppBundle:Region')
                        ->findOneBy(array('description' => $subRegion));
                    $this->buildLocEntity($region, null, $parentLoc, $em);
                } else {
                    $this->updateLocEntity($subRegion, $regionName, null, $em);    
                }
            }
        }
    }
    /**
     * Africa is the parent region for North Africa and Sub-Saharan Africa.
     * Asia is the parent region for East Asia, North Asia, South & Southeast Asia, and West & Central Asia. 
     */
    private function isSubRegion($region, $regionName) {
        $parentRegion = false;
        $parentRegions = ["Africa", "Asia"];
        $splitName = explode(" ", $regionName);
        
        if (count($splitName) > 1) {
            $lastWord = array_pop($splitName);
            if ( in_array($lastWord, $parentRegions) ) {
                $parentRegion = $lastWord;
            }
        } 
        return $parentRegion;
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');      
    }

}
