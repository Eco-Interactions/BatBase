<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
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
     * Creates all SourceType entities.
     * 
     * @param Schema $schema
     */
    public function preUp(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $em = $this->container->get('doctrine.orm.entity_manager');
        $srcTypes = ['Publisher' => '10', 'Citation' => '30', 'Publication' => '20', 'Author' => '25'];

        foreach ($srcTypes as $srcType => $ordinal) {   
            $entity = new SourceType();
            $entity->setName($srcType);
            $entity->setOrdinal($ordinal);
            $em->persist($entity);
        }
        $em->flush();     print("\n Src Types created");
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
