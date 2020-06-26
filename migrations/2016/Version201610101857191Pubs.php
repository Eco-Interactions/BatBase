<?php

namespace Application\Migrations;

use App\Entity\PublicationType;
use App\Entity\Source;
use App\Entity\SourceType;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @preUp creates all sourceType entities: Publisher, Publication, Citation, Author. 
 * @preUp creates all publicationType entities: Book, Journal, Ph. D. Dissertation. 
 * @up Creates a new "Source" entity for each publication and rearranges related data.
 */
class Version201610101857191Pubs extends AbstractMigration implements ContainerAwareInterface
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
        $em->flush();                                                           print("\n Src & Pub Types created\n");
    }
    private function createNewSrcTypes(&$em)
    {
        $srcTypes = ['Publisher' => '10', 'Publication' => '20', 'Author' => '30'];
        foreach ($srcTypes as $srcType => $ordinal) {   
            $entity = new SourceType();
            $entity->setDisplayName($srcType);
            $entity->setOrdinal($ordinal);
            $entity->setCreatedBy($em->getRepository('App:User')
                ->findOneBy(array('id' => '6'))); 
            $em->persist($entity);
        }
    }
    private function createNewPubTypes(&$em)
    {
        $pubTypes = ['Article', 'Book', 'Journal', 'Ph.D. Dissertation'];

        foreach ($pubTypes as $pubType) {   
            $entity = new PublicationType();
            $entity->setDisplayName($pubType);
            $entity->setCreatedBy($em->getRepository('App:User')
                ->findOneBy(array('id' => '6'))); 
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
        $publications = $em->getRepository('App:Publication')->findAll();

        foreach ($publications as $pubEntity) { 
            $this->buildSourceEntity($pubEntity, $em); 
        }

    }
    private function buildSourceEntity(&$pubEntity, &$em)
    {
        $pubName = $pubEntity->getDisplayName();
        $srcEntity = new Source();                                    

        $srcEntity->setDisplayName($pubName);
        $srcEntity->setSourceType($em->getRepository('App:SourceType')
            ->findOneBy(array('id'=> 3))); 
        $srcEntity->setCreatedBy($em->getRepository('App:User')
            ->findOneBy(array('id' => '6'))); 

        $pubEntity->setSource($srcEntity);
        $pubEntity->setUpdatedBy($em->getRepository('App:User')
            ->findOneBy(array('id' => '6')));  

        $em->persist($srcEntity); 
        $em->persist($pubEntity); 
        $em->flush();     
    }
    private function updateSourceType($pubEntity, &$em)
    {
        $src = $pubEntity->getSource();  print("\npub = ". $pubEntity. " src = ". $src);
        $src->setSourceType($em->getRepository('App:SourceType')
            ->findOneBy(array('id'=> 2))); 

        $em->persist($src); 
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {

    }
}
