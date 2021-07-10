<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use App\Entity\Location;
use App\Entity\GeoJson;
use App\Service\DataManager;
/**
 * TODO
 * Misc data cleanup.
 */
final class Version20210518DataCleanup extends AbstractMigration implements ContainerAwareInterface
{

    private $em;
    protected $container;
    protected $dataManager;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }
    public function setDataManager(DataManager $manager)
    {
        $this->dataManager = $manager;
    }

    public function getDescription() : string
    {
        return '
            Fixes Arthropod interactions (consumption->predation)
            Updates various Location territories.
            Misc data cleanup.';
    }

    private function getEntity($className, $val, $prop = 'id')
    {                                                                           print("\ngetEntity [$className] [$val]");
        return $this->em->getRepository('App:'.$className)
            ->findOneBy([$prop => $val]);
    }

    private function getEntities($className)
    {
        return $this->em->getRepository('App:'.$className)->findAll();
    }

    private function persistEntity($entity, $creating = false)
    {
        if ($creating) {
            $entity->setCreatedBy($this->admin);
        }
        if (method_exists($entity, 'setUpdatedBy')) {
            $entity->setUpdatedBy($this->admin);
        }
        $this->em->persist($entity);
    }
    private function create($cName, $data)
    {
        $entityData = $this->dataManager->new($cName, $data);
        $entity = $entityData->coreEntity;
        $this->persistEntity($entity, true);
        return $entity;
    }
    private function edit($cName, $data)
    {
        return $this->dataManager->editEntity($cName, $data);
    }

    private function removeEntity($entity, $erase = false)
    {
        $this->persistEntity($entity);
        $this->em->remove($entity);
        if (!$erase) { return; }
        $this->em->flush();
        $this->em->remove($entity);
    }
    protected function mergeData($rmvId, $addId, $coreClass, $detail = null)
    {
        $rmv = $this->getEntity($coreClass, $rmvId);                            print("\n Remove entity id  = ".$rmvId);

        if ($addId) { $this->transferData($coreClass, $addId, $rmv); }
        $this->removeEntity($rmv, true);
    }

    private function transferData($coreClass, $addId, $rmv)
    {
        $add = $this->getEntity($coreClass, $addId);
        $this->transferChildren($rmv, $add, $coreClass);
        $this->transferInts($rmv, $add, $coreClass);
        $this->persistEntity($add);
    }
    private function transferChildren($oldPrnt, $newPrnt, $type)
    {
        $map = [
            'Location' => [ 'ChildLocs', 'ParentLocation' ],
            'Source' =>   [ 'ChildSources', 'ParentSource' ],
            'Taxon' =>    [ 'ChildTaxa', 'ParentTaxon' ]
        ];
        $getFunc = 'get'.$map[$type][0];
        $setFunc = 'set'.$map[$type][1];
        $children = $oldPrnt->$getFunc();
        if (!count($children)) { return; }                                      //print("\nCHILDREN FOUND = ".count($children));

        foreach ($children as $child) {
            $child->$setFunc($newPrnt);
            $this->persistEntity($child);
        }
        $remaining = $oldPrnt->$getFunc();
        if (!count($remaining)) { return; }                                      print("\nCHILDREN FOUND = ".count($remaining));
    }
    private function transferInts($rmv, $add, $coreClass)
    {
        $prop = $this->getInteractionProp($add, $coreClass);

        foreach ($rmv->getAllInteractionIds() as $id) {
            $int = $this->getEntity('Interaction', $id);
            $setFunc = 'set'.$prop;
            $int->$setFunc($add);
            $this->persistEntity($int);
        }
    }

    private function getInteractionProp($add, $coreClass)
    {
        return $coreClass === 'Taxon' ? $this->getRoleProp($add) : $coreClass;
    }

    private function getRoleProp($taxon)
    {
        return $taxon->getTaxonGroup()->getSlug() === 'bat' ? 'Subject' : 'Object';
    }


/* ============================== UP ======================================== */
    public function up(Schema $schema) : void
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->getEntity('User', 6, 'id');

        $this->fixConsumptionData();
        $this->handleTerritories();
        $this->cleanUpData();
    }
/* +++++++++++++++++++++ PREDATION UPDATES ++++++++++++++++++++++++++++++++++ */
    private function fixConsumptionData()
    {
        $cnsmptn = $this->getEntity('InteractionType', 'Consumption', 'displayName');
        $ints = $cnsmptn->getInteractions();
        $this->fixArthropodConsumptionInteractions($ints);
        $this->fixConsumptionTags($ints);
    }

    private function fixArthropodConsumptionInteractions($ints)
    {                                                                           print("\nfixArthropodConsumptionInteractions\n");
        $predationType = $this->getEntity('InteractionType', 'Predation', 'displayName');
        $count = 0;

        foreach ($ints as $int) {
            if ($this->ifPlantObject($int->getObject())) { continue; }
            $this->updateInteractionType($int, $predationType);
            ++$count;
        }                                                                       print("\n       ++ ".$count."\n");
    }
    private function ifPlantObject($taxon)
    {
        return $taxon->getTaxonGroup()->getDisplayName() === 'Plant';
    }
    private function updateInteractionType($int, $predation)
    {
        $int->setInteractionType($predation);
        $this->persistEntity($int);
    }
    private function fixConsumptionTags($ints)
    {                                                                           print("\fixConsumptionTags\n");
        $internal = $this->getEntity('Tag', 'Internal', 'displayName');
        $iName = $internal->getDisplayName();   print("[$iName]");
        $leaf = $this->getEntity('Tag', 'Leaf', 'displayName');
        $count = 0;

        foreach ($ints as $int) {
            if (!$this->ifPlantObject($int->getObject())) { continue; }
            $tData = $int->getTagData();

            foreach ($tData as $tag) {
                if ($tag['displayName'] !== $iName) { continue; }
                $int->removeTag($internal);
                $int->addTag($leaf);
                $this->persistEntity($int);
                ++$count;
            }
        }                                                                       print("\n       ++ ".$count."\n");

    }
/* +++++++++++++++++++ TERRITORY LOCATIONS ++++++++++++++++++++++++++++++++++ */
/**
 * @return [type] [description]
 */
    private function handleTerritories()
    {
        $this->createMissingTerritory();
        $this->splitNorwayTerritories();
        $this->updateUsIslandTerritory();
    }
/* ------------------------ MISSING ----------------------------------------- */
    /**
     * Creates French Southern and Antarctic Lands territory.
     * Create Souther Ocean region parent
     */
    private function createMissingTerritory()
    {                                                                           print("\n createMissingTerritory");
        $data = [
            'flat' => [
                'DisplayName' => 'French Southern and Antarctic Lands'
            ],
            'rel' => [
                'LocationType' => 2, //Country
                'ParentLocation' => $this->createSouthernOceanRegion()->getId()
            ]
        ];
        return $this->create('Location', $data);
    }
    private function createSouthernOceanRegion()
    {                                                                           print("\n createSouthernOceanRegion");
        $data = [
            'flat' => [
                'DisplayName' => 'Southern Ocean'
            ],
            'rel' => [
                'LocationType' => 1, //Region
            ]
        ];
        return $this->create('Location', $data);
    }
/* -------------------------- SPLIT ----------------------------------------- */
    private function splitNorwayTerritories()
    {                                                                           print("\n splitNorwayTerritories");
        $curLoc = $this->getEntity('Location', 317);  //Svalbard and Jan Mayen
        $this->updateCurrentTerritory($curLoc);
        $this->buildNewTerritory($curLoc->getParentLocation());
    }
    private function updateCurrentTerritory($loc)
    {                                                                           print("\n updateCurrentTerritory");
        $loc->setDisplayName('Svalbard');
        $this->renameHabitats($loc, 'Svalbard');
    }
    private function buildNewTerritory($parent)
    {                                                                           print("\n buildNewTerritory");
        $data = [
            'flat' => [
                'DisplayName' => 'Jan Mayen Island'
            ],
            'rel' => [
                'LocationType' => 2, //Country
                'ParentLocation' => $parent->getId(),
                'geoJson' => $this->createGeoJsonEntity()->getId()
            ]
        ];
        $loc = $this->create('Location', $data);
        $this->createHabitats($loc, 'Jan Mayen Island');
    }
    private function createGeoJsonEntity()
    {                                                                           print("\n createGeoJsonEntity");
        $data = [
            "flat" => [
                'Type' => 'Point',
                'Coordinates' => '[8.2920,71.0318]',
                'DisplayPoint' => '[8.2920,71.0318]',
            ]
        ];
       return $this->create('GeoJson', $data);
    }
    private function createHabitats($loc, $name)
    {                                                                           print("\n createHabitats");
        $habs = $this->getEntities('HabitatType');
        foreach ($habs as $hab) {
            $this->createHabLoc($hab->getId(), $hab->getDisplayName(), $loc, $name);
        }
    }
    private function createHabLoc($habId, $habName, $parent, $name)
    {                                                                           print("\n createHabLoc [$name-$habName]");

        $data = [
            'flat' => [
                'DisplayName' => $name.'-'.$habName
            ],
            'rel' => [
                'HabitatType' => $habId ? $habId : $this->getEntity('HabitatType', $habName, 'displayName'),
                'LocationType' => 3, //Habitat
                'ParentLocation' => $parent->getId()
            ]
        ];
        return $this->create('Location', $data);
    }
/* ------------------------- UPDATE ----------------------------------------- */
        //change United States Minor Outlying Islands [includes the Howland-Baker, Johnston, Midway, US Line and Wake island groups]
            //U.S. Minor Outlying Islands [includes the Howland-Baker, Johnston, Midway, Navassa, Line and Wake island groups, etc.]
            //(in the doc: "United States Minor Outlying Islands (Johnston Atoll, Midway, Wake Islands, Navassa Island, etc.)",)
    private function updateUsIslandTerritory()
    {                                                                           print("\n updateUsIslandTerritory");
        $loc = $this->getEntity('Location', 436);
        $newName = "U.S. Minor Outlying Islands [includes the Howland-Baker, Johnston, Midway, Navassa, Line and Wake island groups, etc.]";
        $loc->setDisplayName($newName);
        $this->renameHabitats($loc, $newName);
    }
    private function renameHabitats($loc, $name)
    {                                                                           print("\n renameHabitats");
        foreach ($loc->getChildLocs() as $childLoc) {
            if ($childLoc->getLocationType()->getId() !== 3) { continue; }
            $namePieces = explode('-', $childLoc->getDisplayName());
            $habName = end($namePieces);
            $childLoc->setDisplayName($name.'-'.$habName);
            $this->persistEntity($childLoc);
        }
    }
/* +++++++++++++++++++++++ DATA CLEANUP +++++++++++++++++++++++++++++++++++++ */
    private function cleanUpData()
    {                                                                           print("\n cleanUpData");
        $this->updatePollination();
        $this->cleanUpTaxaData();
        $this->deleteInteraction();
        $this->cleanUpSrcData();
        $this->deleteSpamUser();
        $this->reformatUserNamedJsonDetails();
        $this->em->flush();
    }
/* ------------------------- POLLINATION ------------------------------------ */
    private function updatePollination()
    {                                                                           print("\n updatePollination");
        $type = $this->getEntity('InteractionType', 'Pollination', 'displayName');
        $active = $type->getActiveForm();
        $type->setActiveForm(lcfirst($active));
        $this->persistEntity($type);
    }
/* --------------------------- TAXA ----------------------------------------- */
    private function cleanUpTaxaData()
    {                                                                           print("\n cleanUpTaxaData");
        $this->deleteTaxa();
        $this->moveTaxa();
        $this->mergeTaxa();
    }
    private function deleteTaxa()
    {                                                                           //print("\n deleteTaxa");
        $ids = [4625, 4624, 4636, 3783, 3480, 3622, 3435, 4066, 3644, 3494, 3507,
            3552, 4166, 3437, 2034, 3110, 4623, 4577, 1659];
        foreach ($ids as $id) {
            $taxon = $this->getEntity('Taxon', $id);   print("\nid [$id]");
            $this->removeEntity($taxon, true);
        }
    }
    private function moveTaxa()
    {                                                                           //print("\n moveTaxa");
        $taxa = [4543 => 'Class Actinobacteria', 4585 => 'Family Corvidae'];
        foreach ($taxa as $id => $parentName) {
            $taxon = $this->getEntity('Taxon', $id);
            $parent = $this->getEntity('Taxon', $parentName, 'displayName');
            $taxon->setParentTaxon($parent);
            $this->persistEntity($taxon);
        }
    }
    private function mergeTaxa()
    {                                                                           //print("\n mergeTaxa");
        $this->mergeData(4538, 4092, 'Taxon'); //Genus Alcaligenes
        $this->mergeData(4232, 4537, 'Taxon'); //Family Alcaligenaceae
    }
/* ------------------------- INTERACTION ------------------------------------ */
    private function deleteInteraction()
    {                                                                           //print("\n deleteInteraction");
        $int = $this->getEntity('Interaction', 12618);
        $this->removeEntity($int, true);
    }
/* ------------------------- SOURCE ----------------------------------------- */
    private function cleanUpSrcData()
    {                                                                           //print("\n cleanUpSrcData");
        $srcs = $this->getEntities('Source');
        foreach ($srcs as $src) {
            $this->clearSourceWhitespace($src);
            if ($src->getSourceTypeName() === 'Author') { $this->removePunc($src); }
            if ($src->getSourceTypeName() === 'Citation') { $src->setDescription(null); }
            if ($src->getSourceTypeName() === 'Publication') { $src->setDescription(null); }
            $this->persistEntity($src);
        }
    }
    private function clearSourceWhitespace($src)
    {                                                                           //print("\n clearSourceWhitespace");
        $fields = [ 'Doi', 'LinkUrl', 'Year' ];
        foreach ($fields as $field) {
            $getField = 'get'.$field;
            $setField = 'set'.$field;
            $data = $src->$getField();
            if (!$data) { continue; }
            $src->$setField(trim($data));
        }
    }
    private function removePunc($src)
    {                                                                           //print("\n removePunc");
        $newName = rtrim(str_replace('.', '', $src->getDisplayName()), ',');
        if ($newName === $src->getDisplayName()) { return; }
        $src->setDisplayName($newName);
        $ath = $src->getAuthor();
        $first = str_replace('.', '', $ath->getFirstName());
        $middle = str_replace('.', '', $ath->getMiddleName());
        $ath->setDisplayName($newName);
        $ath->setFirstName($first);
        $ath->setMiddleName($middle);
        $this->persistEntity($ath);
    }

    private function deleteSpamUser()
    {
        $this->deleteLists();                                                   print("\n deleteSpamUser");
        $this->deleteUsers();
    }
    private function deleteLists()
    {
        $ids = [ 2484, 2485, 2486, 2487, 2488 ];
        foreach ($ids as $id) {
            $list = $this->getEntity('UserNamed', $id);
            $this->removeEntity($list, true);
        }
    }
    private function deleteUsers()
    {
        $usrs = [ 478, 500 ];

        foreach ($usrs as $id) {
            $usr =  $this->getEntity('User', $id);
            $this->removeEntity($usr, true);
        }
    }

    private function reformatUserNamedJsonDetails()
    {
        // code...
    }
/* ============================ DOWN ======================================== */
    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}