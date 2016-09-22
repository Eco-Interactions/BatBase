<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use AppBundle\Entity\Location;

/**
 * Migration adds a new location for each region with the location type 'region'. 
 */
class Version20160922Regions extends AbstractMigration implements ContainerAwareInterface
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
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');
       
        $em = $this->container->get('doctrine.orm.entity_manager');
        $regions = $em->getRepository('AppBundle:Region')->findAll();

        foreach ($regions as $region) {    
            $entity = new Location();
            $entity->setDescription($region->getDescription());
            $entity->setLocationType($em->getRepository('AppBundle:LocationType')
                ->findOneBy(array('id' => 1)));

            $childLocs = $region->getLocations();

            foreach ($childLocs as $loc) {
                $entity->addChildLocs($loc);
            }
            $em->persist($entity);
        }
        $em->flush();
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');      
    }

    // /**
    //  * @param Schema $schema
    //  */
    // public function postUp(Schema $schema)
    // {
    //     $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

 
    // }

}
