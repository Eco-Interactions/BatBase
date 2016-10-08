<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use AppBundle\Entity\PublicationType;
use AppBundle\Entity\SourceType;
use AppBundle\Entity\Source;

/**
 * @preUp creates all sourceType entities: Publisher, Publication, Citation, Author. 
 * @up Creates a new "Source" entity for each publication and rearranges related data.
 */
class Version201610052158481Pubs extends AbstractMigration implements ContainerAwareInterface
{

    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * Creates all SourceType and PublicationType entities.
     * 
     * @param Schema $schema
     */
    public function preUp(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $em = $this->container->get('doctrine.orm.entity_manager');

        $this->createNewSrcTypes($em);
        $this->createNewPubTypes($em);

        $em->flush();     print("\n Src & Pub Types created");
    }
    private function createNewSrcTypes($entityProps, $entity)
    {
        $srcTypes = ['Publisher' => '10', 'Citation' => '30', 'Publication' => '20', 'Author' => '25'];
        foreach ($srcTypes as $srcType => $ordinal) {   
            $entity = new SourceType();
            $entity->setName($srcType);
            $entity->setOrdinal($ordinal);
            $em->persist($entity);
        }
    }
    private function createNewPubTypes($entityProps, $entity)
    {
        $pubTypes = ['Book', 'Journal', 'Ph.D Dissertation'];

        foreach ($pubTypes as $pubType) {   
            $entity = new PublicationType();
            $entity->setName($pubType);
            $em->persist($entity);
        }
    }

    /**
     * Creates a new "Source" entity for each publication. 
     * Updates publication Entity by setting displayName. 
     * 
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');
        $publications = $em->getRepository('AppBundle:Publication')->findAll();

        foreach ($publications as $pubEntity) { 
            $this->buildSourceEntity($pubEntity, $em); 
        }

    }
    private function buildSourceEntity($pubEntity, $em)
    {
        $pubName = $pubEntity->getName();
        $srcEntity = new Source();                                    

        $srcEntity->setDisplayName($pubName);
        $srcEntity->setSourceType($em->getRepository('AppBundle:SourceType')
            ->findOneBy(array('id'=> 3))); 
        $srcEntity->setCreatedBy($em->getRepository('AppBundle:User')
            ->findOneBy(array('id' => '6'))); 

        $pubEntity->setDisplayName($pubName);
        $pubEntity->setSource($srcEntity);
        $pubEntity->setUpdatedBy($em->getRepository('AppBundle:User')
            ->findOneBy(array('id' => '6')));  

        $em->persist($srcEntity); 
        $em->persist($pubEntity); 

        $em->flush();     
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {

    }
}
