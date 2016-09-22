<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use AppBundle\Entity\Location;

/**
 * Migration updates all locations with its parentLoc, and relevent location types
 * for "areas" and "points". ->remove($Entity)
 */
class Version20160922Locations extends AbstractMigration implements ContainerAwareInterface
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
        $locations = $em->getRepository('AppBundle:Location')->findAll();

        foreach ($locations as $entity) {   
            if ($entity->getDescription() === "Captivity") {  
                    $entity->setLocationType($em->getRepository('AppBundle:LocationType')
                        ->findOneBy(array('id' => 1)));
                continue;
            }
            if ($entity->getLocationType() === null) { 
                if ($entity->getGpsData() === null && $entity->getLatitude() === null 
                        && $entity->getLongitude() === null) {   
                    $entity->setLocationType($em->getRepository('AppBundle:LocationType')
                        ->findOneBy(array('id' => 3)));
                } else {   print("point identified");
                    $entity->setLocationType($em->getRepository('AppBundle:LocationType')
                        ->findOneBy(array('id' => 4)));
                }
                if ($entity->getCountry() !== null) {
                    $parentDesc = $entity->getCountry()->getName();
                    $parent = $em->getRepository('AppBundle:Location')
                        ->findOneBy(array('description' => $parentDesc));
                    $entity->setParentLoc($parent);
                }
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
