<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

use App\Entity\RealmRoot;


/**
 * Replaces all consumption->arthropod tags with the predation interaction type.
 * Removes the seed tag from seed-dispersal interaction types.
 * Deletes taxa created by mistake.
 * Fixes a couple geojson display points
 * Note: The 'updatedBy' admin is hardcoded to 6, Sarah.
 */
class Version20200427DataChanges extends AbstractMigration implements ContainerAwareInterface
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
        return $this->em->getRepository('App:'.$className)
            ->findOneBy([$prop => $val]);
    }

    public function getEntities($className)
    {
        return $this->em->getRepository('App:'.$className)->findAll();
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

        $this->updatePredationInteractions();
        $this->removeSeedTags();
        $this->deleteMistakeTaxa();
        $this->geoJsonDisplayPoints();
    }
    /* --------------------- PREDATION UPDATES ------------------------------ */
    private function updatePredationInteractions()
    {
        $predationType = $this->getEntity('InteractionType', 'Predation', 'displayName');

        $this->updateInteractionsWithTag($predationType);
        $this->em->flush();
        $this->updateInteractionsUnintentionallyEdited($predationType);
        $this->em->flush();
    }
    private function updateInteractionsWithTag($predationType)
    {                                                                           print("\nupdateInteractionsWithTag\n");
        $ints = $this->getEntities('Interaction');
        $count = 0;

        foreach ($ints as $int) {
            $tags = $int->getTags();
            foreach ($tags as $tag) {
                if ($tag->getDisplayName() !== 'Arthropod') { continue; }
                if ($this->ifPlantObject($int->getObject())) { print("           !!! PLANT OBJ [".$int->getId()."]\n"); continue; }
                $int->removeTag($tag);
                $this->updateInteractionType($int, $predationType);
                ++$count;
            }
        }                                                   print("\n       ++ ".$count."\n");
    }
    private function updateInteractionsUnintentionallyEdited($predationType)
    {                                                                           print("\nupdateInteractionsUnintentionallyEdited\n");
        $cnsmptn = $this->getEntity('InteractionType', 'Consumption', 'displayName');
        $ints = $cnsmptn->getInteractions();
        $time = new \DateTime('2020-02-14');
        $count = 0;

        foreach ($ints as $int) {
            if ($int->getUpdated() < $time) { continue; }
            if (count($int->getTags())) { continue; }                           
            if ($this->ifPlantObject($int->getObject())) { print("           !!! PLANT OBJ [".$int->getId()."]\n"); }
            $this->updateInteractionType($int, $predationType);
            ++$count;
        }                                                   print("\n       ++ ".$count."\n");
    }
    private function ifPlantObject($taxon)
    {
        return $taxon->getTaxonRealm()->getDisplayName() === 'Plant';
    }
    private function updateInteractionType($int, $predation)
    {
        $int->setInteractionType($predation);
        $this->persistEntity($int);
    }
    /* --------------------- SEED UPDATES ----------------------------------- */
    private function removeSeedTags()
    {                                                                           print("\removeSeedTags\n");
        $seedDispersal = $this->getEntity('InteractionType', 'Seed Dispersal', 'displayName');
        $seedTag = $this->getEntity('Tag', 'Seed', 'displayName');
        $count = 0;

        $ints = $seedDispersal->getInteractions();

        foreach ($ints as $int) {
            $int->removeTag($seedTag);
            $this->persistEntity($int);
            ++$count;
        }                                                   print("\n       ++ ".$count."\n");
    }
    /* ------------------- DELETE MISTAKE TAXA ------------------------------ */
    private function deleteMistakeTaxa()
    {                                                                           print("\deleteMistakeTaxa\n");
        $delete = [3313, 3309, 2977, 2964, 3279, 3187, 3188, 3183, 3050, 3283, 3218, 3258]; //12
        $this->deleteDuplicateInteraction();

        foreach ($delete as $id) {
            $taxon = $this->getEntity('Taxon', $id);
            $this->em->remove($taxon);
        }
        $this->em->flush();
    }
    private function deleteDuplicateInteraction()
    {
        $int = $this->getEntity('Interaction', 9418);
        $this->em->remove($int);
        $this->em->flush();
    }

    private function geoJsonDisplayPoints()
    {   
        $locs = [
            'Ashmore and Cartier Islands' => '[ 123.586396, -12.43259 ]',
            'United States Minor Outlying Islands [includes the Howland-Baker, Johnston, Midway, US Line and Wake island groups]' => '[-166.6470, 19.2823]'
        ];

        foreach ($locs as $name => $coords) {
            $loc = $this->getEntity('Location', $name, 'displayName');
            $geoJson = $loc->getGeoJson();
            $geoJson->setDisplayPoint($coords);
            $this->persistEntity($geoJson);
        }
        $this->em->flush();
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
