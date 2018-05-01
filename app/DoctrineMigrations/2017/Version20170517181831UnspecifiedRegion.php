<?php

namespace Application\Migrations;

use AppBundle\Entity\Location;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Creates an Unspecified region and assigns it as the location for all 
 * interactions without a location.
 * Creates locations for each habitat type under the 'unspecified' region.
 */
class Version20170517181831UnspecifiedRegion extends AbstractMigration implements ContainerAwareInterface
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

        $region = $this->createUnspecifiedRegion($em);
        $this->createHabitatLocations($region, $em);
        $this->addToUnspecifiedInteractions($region, $em);
    
        $em->flush();
     
    }
    private function createUnspecifiedRegion(&$em)
    {
        $region = new Location();
        $region->setLocationType($em->getRepository('AppBundle:LocationType')->
            findOneBy(['displayName' => 'Region']));
        $region->setDisplayName('Unspecified');
        $em->persist($region);
        return $region;
    }
    private function createHabitatLocations($region, &$em)
    {
        $habitatLT = $em->getRepository('AppBundle:LocationType')->
            findOneBy(['displayName' => 'Habitat']);
        $habitats = $em->getRepository('AppBundle:HabitatType')->findAll(); 

        foreach ($habitats as $habEnt) {
            $this->createHabitatLocation($habEnt, $habitatLT, $region, $em);
        }
    }

    private function createHabitatLocation($habEnt, $habitatLT, $region, &$em)
    {
            $habitatLoc = new Location();
            $habitatLoc->setHabitatType($habEnt);
            $habitatLoc->setLocationType($habitatLT);
            $habitatLoc->setParentLoc($region);
            $habitatLoc->setDisplayName($habEnt->getDisplayName());
            $em->persist($habitatLoc);
    }

    private function addToUnspecifiedInteractions($region, $em)
    {
        $ints = $em->getRepository('AppBundle:Interaction')->
            findBy(['location' => null]);        print('total ints = '.count($ints)."\n");

        foreach ($ints as $int) {
            $int->setLocation($region);
            $em->persist($int);
        }

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
