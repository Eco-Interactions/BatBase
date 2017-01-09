<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use AppBundle\Entity\HabitatType;

/**
 * @up Creates the missing habitat types.
 */
class Version20170109113942HabTypes extends AbstractMigration implements ContainerAwareInterface
{

    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * Creates the habitat types listed on the 'definitions' page yet missing from the db. 
     * 
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');
        $habTypes = ["Grassland", "Wetlands", "Rocky Areas", "Caves and Subterranean"];
        foreach ($habTypes as $habitat) { 
            $hab = new HabitatType();
            $hab->setDisplayName($habitat);
            $em->persist($hab);
        }                      
        $em->flush();
    }
    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {

    }
}
