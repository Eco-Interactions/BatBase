<?php

namespace Application\Migrations;

use AppBundle\Entity\Location;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @up - Moves the 'secondary' tag from the citations to all interactions attributed
 * to the citations.
 */
class Version20171118002328SecondaryTags extends AbstractMigration implements ContainerAwareInterface
{

    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $tag = $em->getRepository('AppBundle:Tag')-> 
            findOneBy(['displayName' => 'Secondary']);
        $tag->setConstrainedToEntity('Interaction');
        $this->moveTagToInteractions($tag->getSources(), $tag, $em);
        $em->flush();
    }

    private function moveTagToInteractions($citations, $tag, &$em)
    {
        foreach ($citations as $srcEntity) {
            $this->transferTagToInteractions($srcEntity, $tag, $em);
        }
    }

    private function transferTagToInteractions($srcEntity, $tag, &$em)
    {
        $ints = $srcEntity->getInteractions();
        $srcEntity->removeTag($tag);
        $em->persist($srcEntity);

        foreach ($ints as $interaction) {
            $interaction->addTag($tag);
            $em->persist($interaction);
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
