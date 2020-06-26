<?php

namespace Application\Migrations;

use AppBundle\Entity\Citation;
use AppBundle\Entity\CitationType;
use AppBundle\Entity\SourceType;
use Doctrine\DBAL\Migrations\AbstractMigration;

use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @preUp - Adds 'Citation' back as a Source Type and creates all Citation Types.
 * @up - For each existing article Source (source publications with type 'article'):
 * >>The source type is updated from 'publication' to 'citation'.
 * >>Type 'Article' is set on the citation already associated with the source.
 * >>The Publication-article entity is deleted.
 * @postUp - Drops the now redundant isCitation column.
 */
class Version20161216175055CitTypes extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;  
    }

    /**
     * @param Schema $schema
     */
    public function preUp(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $this->addCitationSourceType($em);
        $this->addCitationTypes($em);

        $em->flush();
    }
    private function addCitationSourceType(&$em)
    {
        $entity = new SourceType();   
        $entity->setDisplayName("Citation");
        $em->persist($entity);  print("\nCitation SourceType added.");
    }
    private function addCitationTypes(&$em)
    {
        $citTypes = ["Article", "Chapter", "Page Range"];
        foreach ($citTypes as $citType) {
            $entity = new CitationType();
            $entity->setDisplayName($citType);
            $em->persist($entity);
        }  print("\nCitationTypes added.");
    }

    /**
     * 
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->transArticlePubsToCits();
        $this->addSql('ALTER TABLE source DROP is_citation');
    }
    /**
     */
    private function transArticlePubsToCits()
    {
        $em = $this->container->get('doctrine.orm.entity_manager');
        $articles = $em->getRepository('AppBundle:Publication')
            ->findBy(array('publicationType' => 1));                            //print("total articles = ".count($articles));
        $citSourceType = $em->getRepository('AppBundle:SourceType')
            ->findOneBy(array('id' => 4));
        $articleCitType = $em->getRepository('AppBundle:CitationType')
            ->findOneBy(array('id' => 1));

        foreach ($articles as $article) {
            $src = $article->getSource();
            $src->setSourceType($citSourceType); //Citation
            $src->removePublication();

            $cit = $src->getCitation();
            $cit->setCitationType($articleCitType); //Article

            $em->persist($src);
            $em->persist($cit);
            $em->remove($article);
        }
        $em->flush();
    }

    /**
     * @param Schema $schema
     */
    public function postUp(Schema $schema)
    {
        $this->addSql('ALTER TABLE source DROP is_citation');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {

    }
}
