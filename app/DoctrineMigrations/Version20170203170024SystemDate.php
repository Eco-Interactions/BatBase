<?php

namespace Application\Migrations;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use AppBundle\Entity\SystemDate;

/**
 * @up- Creates a systemDate for each entity expected to be modified during data
 *      entry/edit.
 */
class Version20170203170024SystemDate extends AbstractMigration implements ContainerAwareInterface
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
        $admin = $em->getRepository('AppBundle:User')->findOneBy(['id' => '6']);
        $entities = ["System", "Author", "Authority", "Citation", "CitationType", "ContentBlock",
            "Contribution", "Domain", "Feedback", "HabitatType", "ImageUpload", 
            "Interaction", "InteractionType", "Level", "Location", "LocationType", 
            "Naming", "NamingType", "Publication", "PublicationType", "Source", 
            "SourceType", "Tag", "Taxon", "Taxonym"];

        $this->removeTestEntities($em);

        foreach ($entities as $entityName) {
            $entity = new SystemDate();
            $entity->setDescription($entityName);
            $date = new \DateTime();
            $entity->setDateVal($date);
            $entity->setUpdatedBy($admin);
            $em->persist($entity);
        }
        $em->flush();
    }
    /** Removes any entities created in previous testing rounds.  */
    private function removeTestEntities($em)
    {
        $entities = $em->getRepository('AppBundle:SystemDate')->findAll();

        foreach ($entities as $entity) {
            $em->remove($entity);
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

    }
}
