<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use AppBundle\Entity\Location;

/**
 * @up - Ensures that each country and region in the database has a child location for
 * each of the habitat types. 
 */
class Version20170713015904LocHabs extends AbstractMigration implements ContainerAwareInterface
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
        $em = $this->container->get('doctrine.orm.entity_manager');
        $habitats =  $this->getHabitatNames($em);  // print('habitats = '); print_r($habitats);
        $regions = $em->getRepository('AppBundle:Location')
            ->findBy(array('locationType' => 1));
        $countries = $em->getRepository('AppBundle:Location')
            ->findBy(array('locationType' => 2));

        $this->addAllNewHabitatLocs($regions, $habitats, $em);
        $this->addAllNewHabitatLocs($countries, $habitats, $em);

        $em->flush();
    }
    /** Returns an array of all habitat type displayNames */
    private function getHabitatNames($em)
    {
        $habs = $em->getRepository('AppBundle:HabitatType')->findAll(); 
        $names = [];
        foreach ($habs as $hab) {
            array_push($names, [ 
                'entity' => $hab, 'name' => $hab->getDisplayName()
            ]);
        }
        return $names;
    }
    /** Loops through all passed locs and sends each to @addHabitatChildren */
    private function addAllNewHabitatLocs($locs, $habs, &$em)
    {
        foreach ($locs as $loc) {
            $this->addHabitatChildren($loc, $habs, $em);
        }
    }
    /**  */
    private function addHabitatChildren($loc, $habs, &$em)
    {
        $children = $loc->getChildLocs(); 
        $missingHabs = $this->getMissingHabTypes($children, $habs);             //print('missing Habs = '); print_r($missingHabs);
        $this->createNewHabLocs($loc, $missingHabs, $em);
    }
    private function getMissingHabTypes($children, $habs)
    {
        foreach ($children as $child) {
            $nameAry = explode('-', $child->getDisplayName());
            $endOfName = array_pop($nameAry);                                   //print('endOfName = '. $endOfName . "\n");            
            $habIdx = array_search($endOfName, array_column($habs, 'name'));    //print('habIdx = '. $habIdx . "\n");
            if ($habIdx !== false) { array_splice($habs, $habIdx, 1); }
        }   
        return $habs;
    }
    private function createNewHabLocs($loc, $newHabs, &$em)
    {
        $admin = $em->getRepository('AppBundle:User')->findOneBy(array('id' => 6));
        $locType = $em->getRepository('AppBundle:LocationType')
            ->findOneBy(array('displayName' => 'Habitat'));
        foreach ($newHabs as $habAry) {                                         print('    creating - '. $loc->getDisplayName() . '-' . $habAry['name'] . "\n");
            $newLoc = new Location();
            $newLoc->setDisplayName($loc->getDisplayName() . '-' . $habAry['name']);
            $newLoc->setHabitatType($habAry['entity']);
            $newLoc->setLocationType($locType);
            $newLoc->setCreatedBy($admin);
            $newLoc->setUpdatedBy($admin);
            $newLoc->setParentLoc($loc);
            $em->persist($newLoc);
        }
    }
    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
