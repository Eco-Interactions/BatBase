<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

// use App\Entity\HabitatType;

/**
 * @up Moves all citation tags to their source entity's tags collection.
 */
class Version20170117171242SourceTags extends AbstractMigration implements ContainerAwareInterface
{

    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * Creates the habitat types listed on the 'definitions' page yet missing from the db. 
     * 
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $citations = $em->getRepository('App:Citation')->findAll();

        foreach ($citations as $citation) {
            $tags = $citation->getTags();

            if (count($tags) >= 1) { print(count($tags));
                $src = $citation->getSource();
                foreach ($tags as $tag) {
                    $src->addTag($tag);
                }
                $em->persist($src);
            }
        }
        $em->flush();

        $this->addSql('DROP TABLE citation_tag');
    }
    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {

    }
}
