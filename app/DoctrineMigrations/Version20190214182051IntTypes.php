<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use AppBundle\Entity\InteractionType;


/**
 * Adds the "roost" and "host" interaction types.
 * Note: The 'createdBy' admin is hardcoded to 6, Sarah.
 */
class Version20190214182051IntTypes extends AbstractMigration implements ContainerAwareInterface
{

    private $container;
    private $em;
    private $admin;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->em->getRepository('AppBundle:User')->findOneBy(['id' => 6]);
        $this->addInteractionTypes();
        $this->em->flush();
    }

    private function addInteractionTypes()
    {
        $types = ['roost' => 'leaf', 'host' => 'arthropod'
    ];
        foreach ($types as $type => $tagName) {
            $IntType = new InteractionType();
            $IntType->setDisplayName(ucfirst($type)); 
            $IntType->setCreatedBy($this->admin);

            $Tag = $this->em->getRepository('AppBundle:Tag')->findOneBy(['displayName' => $tagName]);
            $IntType->addValidTag($Tag);

            $this->em->persist($IntType);
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