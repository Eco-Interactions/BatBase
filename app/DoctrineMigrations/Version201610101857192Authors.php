<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use AppBundle\Entity\SourceType;
use AppBundle\Entity\Source;

/**
 * @up Creates a new "Source" entity for each author.
 */
class Version201610101857192Authors extends AbstractMigration implements ContainerAwareInterface
{

    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * Creates a new "Source" entity for each author. 
     * 
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');
        $authors = $em->getRepository('AppBundle:Author')->findAll();

        foreach ($authors as $authEntity) { 
            $this->buildSourceEntity($authEntity, $em); 
        }                                               print("All author sources added \n");
    }
    private function buildSourceEntity(&$authEntity, &$em)
    {
        $srcEntity = new Source();                                 
        $srcEntity->setDisplayName($authEntity->getFullName());  
        $srcEntity->setSourceType($em->getRepository('AppBundle:SourceType')
            ->findOneBy(array('id'=> 3)));  
        $srcEntity->setCreatedBy($em->getRepository('AppBundle:User')
            ->findOneBy(array('id' => '6'))); 

        $authEntity->setSource($srcEntity);
        $authEntity->setUpdatedBy($em->getRepository('AppBundle:User')
            ->findOneBy(array('id' => '6'))); 

        $em->persist($srcEntity); 
        $em->persist($authEntity); 
        $em->flush();    
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {

    }
}
