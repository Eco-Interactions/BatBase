<?php

namespace Application\Migrations;

use App\Entity\Source;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;

use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Adds a citation source for publications that were functioning as both citation
 * and publication source before we added back Citation as a source-type. 
 */
class Version20161218175055FixCitations extends AbstractMigration implements ContainerAwareInterface
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
        $moveCit = [740, 747, 801, 869, 906, 935, 948];

        foreach ($moveCit as $srcId) {
            $this->fixCitationEntity($srcId, $em);
        }
        $em->flush();
    }
    private function fixCitationEntity($srcId, &$em)
    {
        $pubSrc = $em->getRepository("App:Source")
            ->findOneBy(array('id' => $srcId));                                 //print("\nSource for citation ".$citPair[0]);
        $newCitSrc = new Source();
        $newCitSrc->setSourceType($em->getRepository("App:SourceType")
            ->findOneBy(array('id' => 4)));  //Citation
        $newCitSrc->setDisplayName($pubSrc->getDisplayName()."-citation"); //What should this be??
        $newCitSrc->setDescription($pubSrc->getDescription()); 
        $newCitSrc->setYear($pubSrc->getYear()); 
        $newCitSrc->setIsDirect($pubSrc->getIsDirect()); 
        $newCitSrc->setParentSource($pubSrc);

        $this->transferInteractions($pubSrc, $newCitSrc, $em);

        $citEntity = $pubSrc->getCitation();
        $citEntity->setSource($newCitSrc);
        
        $pubSrc->setDescription(null);
        $pubSrc->setIsDirect(false);

        $em->persist($pubSrc);
        $em->persist($newCitSrc);
        $em->persist($citEntity);
    }
    /** Moves each interaction for passed publication to it's citation entity.  */
    private function transferInteractions(&$pubEntity, &$citEntity, &$em)
    {                                                                           //print("\n  -Before Source Count = ". count($srcEntity->getInteractions()));
        $interactions = $pubEntity->getInteractions();                          //print("\n      Adding ". count($interactions));
        foreach ($interactions as $interaction) {
            $interaction->setSource($citEntity);
            $citEntity->addInteraction($interaction);
            $pubEntity->removeInteraction($interaction);
            $em->persist($interaction);
        }                                                                       //print("\n   AFter Source count = ". count($srcEntity->getInteractions()));
    }
    /**
     * @param Schema $schema
     */
    public function down(Schema $schema):void
    {

    }
}
