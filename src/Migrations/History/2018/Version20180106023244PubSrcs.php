<?php

namespace Application\Migrations;

use App\Entity\Publisher;
use App\Entity\PublisherType;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @up - Creates a new "Publisher" entity for each Source publisher.
 */
class Version20180106023244PubSrcs extends AbstractMigration implements ContainerAwareInterface
{

    private $container;
    
    private $em;

    private $admin;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * Creates a new "Source" entity for each author. 
     * 
     * @param Schema $schema
     */
    public function up(Schema $schema):void
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->em->getRepository('App:User')
            ->findOneBy(array('id' => '6'));

        // $this->createPublisherTypes();
        $this->createPublisherSources();

    }
    private function createPublisherSources()
    {
        $sources = $this->em->getRepository('App:Source')
            ->findBy([ 'sourceType' => 1 ]);                                    //print(count($sources)); print(" publishers\n");

        foreach ($sources as $pSrc) { 
            $this->buildPublisherEntity($pSrc); 
        }                                               
    }
    private function buildPublisherEntity(&$pSrc)
    {
        $publ = new Publisher();                                 
        $publ->setDisplayName($pSrc->getDisplayName());  
        $publ->setCreatedBy($this->admin); 
        $publ->setSource($pSrc);
        // $this->setPublisherType($publ, $pSrc);

        $pSrc->setPublisher($publ);
        $pSrc->setUpdatedBy($this->admin); 

        $this->em->persist($publ);
        $this->em->persist($pSrc); 
        $this->em->flush();    
    }
    // private function setPublisherType(&$publ, $pSrc)
    // {
    //     $isUniversity = $this->isLikelyUniversity($pSrc);
    //     $pubTypeName = $isUniversity ? 'University' : 'Other';
    //     $pubType = $this->em->getRepository('App:PublisherType')
    //         ->findOneBy([ 'displayName' => $pubTypeName ]);
    //     $publ->setPublisherType($pubType);
    // }
    // private function isLikelyUniversity($pSrc)
    // {
    //     $pubs = $pSrc->getChildSources();
    //     $isLikely = false;

    //     foreach ($pubs as $pub) {
    //         $pubType = $pub->getPublication()->getPublicationType()->getDisplayName();
    //         if ($pubType === "Thesis/Ph.D. Dissertation") {
    //             $isLikely = true;
    //             break;
    //         }
    //     }
    //     return $isLikely;
    // }

    // private function createPublisherTypes()
    // {
    //     $types = ['University', 'Other'];

    //     foreach ($types as $type) {
    //         $pType = new PublisherType();                                 
    //         $pType->setDisplayName($type);
    //         $this->em->persist($pType);
    //     }
    //     $this->em->flush();
    // }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema):void
    {

    }
}
