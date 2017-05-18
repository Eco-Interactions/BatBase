<?php

namespace Application\Migrations;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use AppBundle\Entity\SystemDate;

/**
 * @up- Removes test entities created after a certain datetime for specified entites.
 */
class Version000EraseTests extends AbstractMigration implements ContainerAwareInterface
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
        $this->removeAllTestEntities($em);
    }
    /** Removes test entities created after a certain datetime for specified entites. */
    private function removeAllTestEntities(&$em)
    {
        $classes = ['Author', 'Citation', 'Contribution', 'Interaction', 'Location',
            'Publication', 'Source', 'Taxon'];
        $date = '2017-05-17 16:27:49'; //When habitats were added as locations

        foreach ($classes as $className) {                                      print("className = ". $className."\n");
            $repo = $em->getRepository('AppBundle:'.$className);
            $this->getAndRemoveTestEntities($repo, $date, $em);
        }
    }
    private function getAndRemoveTestEntities($repo, $date, &$em)
    {
        $query = $repo->createQueryBuilder('e')
            ->where('e.created > :date')
            ->setParameter('date', $date)
            ->getQuery();
        $entities = $query->getResult();
        $this->removeTestEntities($entities, $em);
    }
    private function removeTestEntities($entities, &$em)
    {   
        foreach ($entities as $entity) {                                        print("\nRemoving entity.");
            $em->remove($entity);
            $em->flush(); 
        }                                                                       print("\n\n\n");
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
