<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

use AppBundle\Entity\Contribution;
use AppBundle\Entity\Publication;
use AppBundle\Entity\Source;

/**
 * @up Handles duplicate citations, and citations that are now publication sources.
 */
class Version201610101857195EdgeCases extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * 
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');
        $citDelete = [];   //24 -> removed bcuz I can't remember why it was going to be deleted...

        $this->handleDups($citDelete, $em);

        foreach ($citDelete as $citId) {
            $citEntity = $em->getRepository('AppBundle:Citation')
                ->findOneBy(array('id' => $citId));
            $em->remove($citEntity);
        }
        $em->flush();
    }
    private function handleDups(&$citDelete, &$em)
    {
        $dupCits = [[10,248], [11,249], [12,251], [42, 254], [242,263], [209,262], [165,261], 
            [151,260], [122,259], [101,258], [45,255], [29,253], [21,252]];
        foreach ($dupCits as $citPair) {
            $srcEntity = $em->getRepository("AppBundle:Citation")
                ->findOneBy(array('id' => $citPair[0]))->getSource();           //print("\nSource for citation ".$citPair[0]);
            $dupCitEntity =  $em->getRepository("AppBundle:Citation")
                ->findOneBy(array('id' => $citPair[1]));                        
            $this->transferInteractions($dupCitEntity, $srcEntity, $em);
            $this->transferAuthors($dupCitEntity, $srcEntity, $em);
            array_push($citDelete, $citPair[1]);

            $em->persist($srcEntity);
        }
    }
    /** Moves each interaction for passed citation to it's source entity.  */
    private function transferInteractions(&$citEntity, &$srcEntity, &$em)
    {                                                                           //print("\n  -Before Source Count = ". count($srcEntity->getInteractions()));
        $interactions = $citEntity->getInteractions();                          //print("\n      Adding ". count($interactions));
        foreach ($interactions as $interaction) {
            $interaction->setSource($srcEntity);
            $srcEntity->addInteraction($interaction);
            $citEntity->removeInteraction($interaction);
            $em->persist($interaction);
            $em->persist($citEntity);
        }                                                                       //print("\n   AFter Source count = ". count($srcEntity->getInteractions()));
    }
    /** Moves each author for passed citation to it's source entity.  */
    private function transferAuthors(&$citEntity, &$srcEntity, &$em)
    {                                                     
        $attributions = $citEntity->getAttributions();
    
        foreach ($attributions as $attribution) {
            $contribEntity = new Contribution();

            $contribEntity->setAuthorSource($attribution->getAuthor()->getSource());
            $contribEntity->setWorkSource($srcEntity);
            $contribEntity->setCreatedBy($em->getRepository('AppBundle:User')
                ->findOneBy(array('id' => '6'))); 

            $em->persist($contribEntity);
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {

    }
}
