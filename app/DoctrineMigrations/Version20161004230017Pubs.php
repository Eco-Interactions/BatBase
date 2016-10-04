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
class Version20161004230017Pubs extends AbstractMigration implements ContainerAwareInterface
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

        foreach ($srcTypes as $srcType => $ordinal) {    print("\nsrcType = ".$srcType);
            $entity = new SourceType();
            $entity->setName($srcType);
            $entity->setOrdinal($ordinal);
            $em->persist($entity);
        }
        $em->flush();    
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

        foreach ($publications as $pubEntity) {  print("\npubName = ".$pubEntity->getName());
            $this->buildSourceEntity($pubEntity, $em); 
        }
    }
    private function buildSourceEntity($pubEntity, $em)
    {
        $pubName = $pubEntity->getName();
        $srcEntity = new Source(); print("\nNew Source");

        $srcType = $em->getRepository('AppBundle:SourceType')
            ->findOneBy(array('id'=> 3));  print("\n Got sourceType -> publication");
        $srcEntity->setSourceType($srcType);  print("\n setting sourceType");
        $srcEntity->setDisplayName($pubName);   print("\n setDisplayName");

        $pubEntity->setDisplayName($pubName);
        $pubEntity->setUpdatedBy($em->getRepository('AppBundle:User')
            ->findOneBy(array('id' => '6')));  print("\n Updated pub entity");
        $em->persist($srcEntity);  print("\n Persisted source");
        
        $srcEntity->setPublication($pubEntity);  

        $em->persist($srcEntity);  print("\n Persisted source");
        $em->persist($pubEntity);  print("\n Persisted publication");

        $em->flush();      print("\n--------------------- Flushed");
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
