<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

use AppBundle\Entity\InteractionType;


/**
 * Deletes reference to parent taxon for deleted taxa records.
 * Note: The 'created/updatedBy' admin is hardcoded to 6, Sarah.
 */
class Version20200613DeleteDeleted extends AbstractMigration implements ContainerAwareInterface
{
    private $container;
    private $em;
    private $admin;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    private function getEntity($className, $val, $prop = 'id')
    {
        return $this->em->getRepository('AppBundle:'.$className)
            ->findOneBy([$prop => $val]);
    }

    public function getEntities($className)
    {
        return $this->em->getRepository('AppBundle:'.$className)->findAll();
    }

    public function persistEntity($entity, $creating = false)
    {
        if ($creating) {
            $entity->setCreatedBy($this->admin);
        }
        $entity->setUpdatedBy($this->admin);
        $this->em->persist($entity);
    }
/* ========================== up ============================================ */

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->getEntity('User', 6);
        $this->em->getFilters()->disable('softdeleteable');

        $this->fullyDeleteDeletedLocs($this->getEntities('Location'));
        $this->fullyDeleteDeletedTaxa($this->getEntities('Taxon'));

        $this->em->flush();

        $this->em->getFilters()->enable('softdeleteable');
    }
    private function fullyDeleteDeletedLocs($locs)
    {
        foreach ($locs as $loc) {
            if (!$loc->getDeletedAt()) { continue; }
            $this->handleLocFinalDelete($loc);
        }
    }
    private function handleLocFinalDelete($loc)
    {
        $loc->setParentLoc(null);
        if ($loc->getChildLocs()) {
            $this->handleDeletedLocChildren($loc->getChildLocs());
        }                                                                       print("\n Deleting location ".$loc->getId());
        $this->em->remove($loc);
        $this->em->flush();
    }
    private function handleDeletedLocChildren($childLocs)
    {
        foreach ($childLocs as $loc) {
            if (!$loc->getInteractionIds()) { $this->handleLocFinalDelete($loc); continue; }
                                                                                print("\n     Interactions = "); print_r($loc->getInteractionIds());
        }
    }
    private function fullyDeleteDeletedTaxa($taxa)
    {
        foreach ($taxa as $taxon) {
            if (!$taxon->getDeletedAt()) { continue; }
            $this->handleTaxonFinalDelete($taxon);
        }
    }
    private function handleTaxonFinalDelete($taxon)
    {
        $taxon->setParentTaxon(null);
        if ($taxon->getChildTaxa()) {
            $this->handleDeletedChildren($taxon->getChildTaxa());
        }                                                                       print("\n Deleting ".$taxon->getId());
        $this->em->remove($taxon);
        $this->em->flush();
        $this->em->remove($taxon);
        $this->em->flush();
    }
    private function handleDeletedChildren($childTaxa)
    {
        foreach ($childTaxa as $taxon) {
            if (!$taxon->getDeletedAt()) { $this->handleUndeletedChild($taxon); continue; }
            $this->handleTaxonFinalDelete($taxon);
        }
    }
    private function handleUndeletedChild($taxon)
    {                                                                           print("\nUndeleted child = ".$taxon->getId());
        $interactions = $taxon->getAllInteractionIds(); 
        if (!count($interactions)) { return $this->handleTaxonFinalDelete($taxon); }
                                                                                print("\n     Interactions = "); print_r($taxon->getAllInteractionIds());
        foreach ($interactions as $id) {
            $int = $this->getEntity('Interaction', $id);
            if (!$int->getDeletedAt()) { print("\n--- UNDELETED INTERACTION = ". $int->getId()); }
            $this->em->remove($int);
            $this->em->flush();
        }
        $this->handleTaxonFinalDelete($taxon);
    }
/* ======================== down ============================================ */
    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
