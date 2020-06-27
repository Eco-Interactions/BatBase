<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @up Updates all Author Source's display name to match the Author's display name.
 */
class Version20170120233642Author extends AbstractMigration implements ContainerAwareInterface
{

    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema):void
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $authors = $em->getRepository('App:Author')->findAll();
        foreach ($authors as $author) {
            $source = $author->getSource();  
            $source->setDisplayName($author->getDisplayName());            
            $em->persist($source);   
        }
        $em->flush();
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema):void
    {

    }
}
