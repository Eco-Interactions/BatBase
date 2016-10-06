<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use AppBundle\Entity\SourceType;
use AppBundle\Entity\Source;

/**
 * @up Creates a new "Source" entity for each citation and sets the parent source for .
 */
class Version201610052259311Citations extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * Creates a new "Source" entity for each citation. 
     * Updates citation Entity by setting displayName. 
     * 
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');
        $citations = $em->getRepository('AppBundle:Citation')->findAll();

        foreach ($citations as $citEntity) { // print("\nauthName = ".$citEntity->getDescription());
            $this->buildSourceEntity($citEntity, $em); 
        }
    }
    private function buildSourceEntity($citEntity, $em)
    {
        $authName = $citEntity->getShortName();
        $srcEntity = new Source();                                     print("\nNew Source");

        $srcEntity->setSourceType($em->getRepository('AppBundle:SourceType')
            ->findOneBy(array('id'=> 4)));  print("\n setting sourceType");
        $srcEntity->setDisplayName($authName);   print("\n setDisplayName");
        $srcEntity->setCreatedBy($em->getRepository('AppBundle:User')
            ->findOneBy(array('id' => '6')));  print("\n Created src entity");

        $em->persist($srcEntity);  print("\n Persisted source");
        
        $citEntity->setSource($srcEntity);
        $citEntity->setUpdatedBy($em->getRepository('AppBundle:User')
            ->findOneBy(array('id' => '6')));  print("\n Updated pub entity");

        $em->persist($citEntity);  print("\n Persisted publication");

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
