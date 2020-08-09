<?php

namespace Application\Migrations;

use App\Entity\Contribution;
use App\Entity\Publication;
use App\Entity\Source;
use Doctrine\Migrations\AbstractMigration;

use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Handles duplicate citations.
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
    public function up(Schema $schema):void
    {
        $em = $this->container->get('doctrine.orm.entity_manager');
        $citDelete = [];   //24 -> removed bcuz I can't remember why it was going to be deleted...

        $this->handleDups($citDelete, $em);

        foreach ($citDelete as $citId) {
            $citEntity = $em->getRepository('App:Citation')
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
            $srcEntity = $em->getRepository("App:Citation")
                ->findOneBy(array('id' => $citPair[0]))->getSource();           //print("\nSource for citation ".$citPair[0]);
            $dupCitEntity =  $em->getRepository("App:Citation")
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
    /**
     * Adds any new attributions from the citation entity as new contributions of 
     * the source entity.
     */
    private function transferAuthors(&$citEntity, &$srcEntity, &$em)
    {                                                     
        $attribs = $citEntity->getAttributions();
        $contribs = $srcEntity->getContributors();  print("\n   --existing contributions for source ".$srcEntity->getId()." = ".count($contribs));
        
        foreach ($attribs as $attribution) {
            $attribAuthSrc = $attribution->getAuthor()->getSource();
            $attribAuthSrcId = $attribAuthSrc->getAuthor()->getId();  print("\n    attribAuthSrcId = ".$attribAuthSrcId);
            /* All authors source's have been created. These can thus be checked for redundancy. */
            foreach ($contribs as $contrib) {
                $contribAuthSrcId = $contrib->getAuthorSource()->getAuthor()->getId();  print("\n        contribAuthSrcId = ".$contribAuthSrcId);
                /* Returns if this author has already been added as a contributor. */
                if ($contribAuthSrcId === $attribAuthSrcId) { print("\n---skipping\n"); break 2; }
            }
         
            $contribEntity = new Contribution();
            $contribEntity->setAuthorSource($attribAuthSrc);
            $contribEntity->setWorkSource($srcEntity);
            $contribEntity->setCreatedBy($em->getRepository('App:User')
                ->findOneBy(array('id' => '6'))); 

            $em->persist($contribEntity);
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema):void
    {

    }
}
