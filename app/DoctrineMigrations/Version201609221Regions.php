<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use AppBundle\Entity\Location;
use AppBundle\Entity\Region;

/**
 * Migration adds a new location for each region with the location type 'region'. 
 */
class Version201609221Regions extends AbstractMigration implements ContainerAwareInterface
{

    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');
       
        $em = $this->container->get('doctrine.orm.entity_manager');

        $this->AddAsiaToRegions($em);
        $this->AddRegionsToLocs($em);
    }
    private function AddAsiaToRegions($em)
    {
        $entity = new Region();
        $entity->setDescription("Asia");
        $em->persist($entity);
        $em->flush();
    }
    /**
     * For each region, creates a new Location entity with type "Region". 
     * Subregions must be created last to be able to reference their parent location/region.
     */
    private function AddRegionsToLocs($em)
    {
        $regions = $em->getRepository('AppBundle:Region')->findAll();
        $regionWithSubRegions = array();

        foreach ($regions as $region) {
            $regionName = $region->getDescription();
            $parentRegion = $this->IsSubRegion($region, $regionName);
            if ($parentRegion !== false) {  
                if (!array_key_exists($parentRegion, $regionWithSubRegions)) {
                    $regionWithSubRegions[$parentRegion] = [];    
                }
                array_push($regionWithSubRegions[$parentRegion], $region->getDescription()); //Can't pass full entity obj around reliably.
                continue;
            }
            $this->BuildLocEntity($region, null, $em);    
        }  
        $this->AddSubRegions($regionWithSubRegions, $em);
    }
    private function BuildLocEntity($region, $parent, $em)
    {
        $entity = new Location();
        $regionName = $region->getDescription();
        $entity->setDescription($regionName);
        $entity->setLocationType($em->getRepository('AppBundle:LocationType')
            ->findOneBy(array('id' => 1)));

        $childLocs = $region->getLocations();

        foreach ($childLocs as $loc) { $entity->addChildLocs($loc); }

        if ($parent !== null) { $entity->setParentLoc($parent); }

        $em->persist($entity);
        $em->flush();
    }
    private function AddSubRegions($regionWithSubRegions	, $em)
    {
        foreach ($regionWithSubRegions as $parentRegion => $regions) {  
            $parentLoc = $em->getRepository('AppBundle:Location')
                ->findOneBy(array('description' => $parentRegion));
                
            foreach ($regions as $subRegion) {
                $region = $em->getRepository('AppBundle:Region')
                ->findOneBy(array('description' => $subRegion));

                $this->BuildLocEntity($region, $parentLoc, $em);
            }
        }
    }
        
    /**
     * Africa is the parent region for North Africa and Sub-Saharan Africa.
     * Asia is the parent region for East Asia, North Asia, South & Southeast Asia, and West & Central Asia. 
     */
    private function IsSubRegion($region, $regionName) {
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
