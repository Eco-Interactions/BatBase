<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Sets the ord property of all existing contributors, which will, after they've 
 *     all been gone through manually and set intentionally, store the order of the 
 *     author/editors for a citation/publication.
 * Updates the display names of citations that have '-citation', appended to 
 *     distinguish them from their publication parent's name, with '(citation)'.
 */
class Version20180225004259Srcs extends AbstractMigration implements ContainerAwareInterface
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
    public function up(Schema $schema):void
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->em->getRepository('App:User')->findOneBy(['id' => 6]);
        
        $srcs = $this->em->getRepository('App:Source')->findAll();

        $this->addOrdToContributors($srcs);
        $this->updateCitationDisplayNames($srcs);
        $this->em->flush();
    }

    private function addOrdToContributors($srcs)
    {
        foreach ($srcs as $src) {
            $contribs = $src->getContributors(); 
            if (!count($contribs)) { continue; }
            $this->addOrdToContribs($src, $contribs);
            $this->em->persist($src);
        }
    }
    /**
     * Sets the ord of the contributor. This prop will eventually store the 
     * correct order of the author/editors.
     */
    private function addOrdToContribs(&$src, $contribs)
    {
        $auth = 0;
        $ed = 0;

        foreach ($contribs as $contrib) {
            $isEd = $contrib->getIsEditor();
            $ord = $isEd ? ++$ed : ++$auth; 
            $contrib->setIsEditor(false);
            $contrib->setOrd($ord);
            $contrib->setUpdatedBy($this->admin);
            $this->em->persist($contrib);
        }
    }

    private function updateCitationDisplayNames($srcs)
    { 
        foreach ($srcs as $src) {
            $displayName = $src->getDisplayName(); //print("strpos = ".strpos($displayName, '-citation')."\n");
            if (!strpos($displayName, '-citation')) { continue; } print('updating displayName');
            $this->updateDisplayName($src, $displayName);
        }
    }

    private function updateDisplayName(&$src, $name)
    {
        $displayName = str_replace("-citation","(citation)",$name); print("\n New display name = ".$displayName);
        
        $src->setDisplayName($displayName);
        $src->setUpdatedBy($this->admin);
        $this->em->persist($src);
        
        $cit = $src->getCitation();
        $cit->setTitle(str_replace("-citation","",$name));
        $cit->setUpdatedBy($this->admin);
        $this->em->persist($cit);
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema):void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
