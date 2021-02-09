<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use App\Entity\Group;
use App\Entity\GroupRoot;
use App\Entity\Taxon;
use App\Entity\Tag;
use App\Entity\ValidInteraction;
use App\Service\DataManager;

/**
 * Adds a ValidInteraction entity for each valid Subject -> Object -> IntType -> Tags combination.
 * Adds a new "Worm" group and breaks up "Parasite" group.
 * Adds descriptions to group-roots.
 * Misc data cleanup.
 */
final class Version20210205ValidInteractions extends AbstractMigration implements ContainerAwareInterface
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
        return 'Adds a ValidInteraction entity for each valid Subject -> Object -> IntType -> Tags combination.
            Adds a new "Worm" group and breaks up "Parasite" group.
            Adds descriptions to group-roots.
            Misc data cleanup.';
    }

    private function getEntity($className, $val, $prop = 'id')
    {
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
        $entity->setUpdatedBy($this->admin);
        $this->em->persist($entity);
    }

    private function create($cName, $data)
    {
        $entityData = $this->dataManager->createEntity($cName, $data);
        return $entityData->coreEntity;
    }

    private function edit($cName, $data)
    {
        return $this->dataManager->editEntity($cName, $data);
    }

/* ============================== UP ======================================== */
    public function up(Schema $schema) : void
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->getEntity('User', 6, 'id');

        $this->createTags();
        $this->renameInteractionTypes();
        $this->updateTaxonGroups();
        $this->createAllValidInteractions();
        $this->cleanUpData();
    }
/* +++++++++++++++++++++++++ NEW TAGS +++++++++++++++++++++++++++++++++++++++ */
    private function createTags()
    {
        $names = ['Leaf', 'Coroost'];

        foreach ($names as $name) {
            $tag = new Tag();
            $tag->setDisplayName($name);
            $tag->setConstrainedToEntity('Interaction');
            $this->persistEntity($tag, true);
            $this->em->flush();
        }
    }
/* +++++++++++++++++++++++++ RENAME YPES ++++++++++++++++++++++++++++++++++++ */
    private function renameInteractionTypes()
    {
        $type = $this->getEntity('InteractionType', 3);
        $type->setActiveForm('Pollinated');
        $this->persistEntity($type);
    }
/* +++++++++++++++++++++++++ TAXON GROUP ++++++++++++++++++++++++++++++++++++ */
    private function updateTaxonGroups()
    {
        $this->createWormGroup();
        $this->createChromistaGroup();
        $this->createProtozoaGroup();
        $this->addDescriptionsToRoots();
        $this->em->flush();
    }
/* ------------------------- WORM GROUP ------------------------------------- */
    private function createWormGroup()
    {
        $group = $this->create('group', $this->getTaxonData('Worm'));
        $root = $this->createWormRoot($group, $this->getTaxonData('Annelida Taxon'));
        $this->moveWormRoots($group);
    }
    private function createWormRoot($group, $data)
    {
        // $data->taxon->rel->group = $group->getId();
        $taxon = $this->create('taxon', $data);
        $rootData = $this->getTaxonData('Annelida Root');
        $rootData->groupRoot->rel->group = $group->getId();
        $rootData->groupRoot->rel->taxon = $taxon->getId();
        return $this->create('groupRoot', $rootData);
    }
    private function moveWormRoots($group)
    {
        $roots = [
            'Phylum Acanthocephala' => 'Thorny-headed worms',
            'Phylum Nematoda' => 'Nematodes',
            'Phylum Platyhelminthes' => 'Flatworms'
        ];

        foreach ($roots as $name => $desc) {
            $taxon = $this->getEntity('Taxon', $name, 'displayName');
            $root = $taxon->getGroup();
            $root->setGroup($group);
            $root->setDescription($desc);
            $this->persistEntity($taxon);
        }
    }
/* --------------------- CHROMISTA GROUP ------------------------------------ */
    private function createChromistaGroup()
    {
        $group = $this->create('group', $this->getTaxonData('Chromista Group'));
        $root = $this->getEntity('Taxon', 'Chromista', 'name')->getGroup();
        $root->setGroup($group);
        $root->setDescription('Contains protists & plasmodium (ie. malaria)');;
        $this->persistEntity($root);
    }
/* --------------------- PROTOZOA GROUP ------------------------------------- */
    private function createProtozoaGroup()
    {
        $group = $this->getEntity('Group', 'Parasite', 'displayName');
        $group->setDisplayName('Protozoa');

        $root = $this->getEntity('Taxon', 'Protozoa', 'name')->getGroup();
        $root->setGroup($group);
        $root->setDescription('Fungi-like, taxonomy unclear');

        $this->persistEntity($root);
        $this->persistEntity($group);
    }

    private function getTaxonData($key)
    {
        $data = [
            'Worm' => [
                'group' => [
                    'flat' => [
                        'displayName' => 'Worm',
                        'pluralName' => 'Worms',
                    ],
                    'rel' => []
                ]
            ],
            'Annelida Taxon' => [
                'taxon' => [
                    'flat' => [
                        'displayName' => 'Phylum Annelida',
                        'name' => 'Annelida',
                        'isRoot' => true
                    ],
                    'rel' => [
                        'parentTaxon' => 1,
                        'rank' => 2
                    ]
                ]
            ],
            'Annelida Root' => [
                'groupRoot' => [
                    'flat' => [
                        'subRanks' => '[7, 6, 5, 4, 3]',
                        'description' => 'Earthworms'
                    ],
                    'rel' => [
                        'group' => null
                    ]
                ]
            ],
            'Chromista Group' => [
                'group' => [
                    'flat' => [
                        'displayName' => 'Chromista',
                        'pluralName' => 'Chromista',
                    ],
                    'rel' => []
                ]
            ],
            'Worm' => [
                'group' => [
                    'flat' => [
                        'displayName' => 'Worm',
                        'pluralName' => 'Worms',
                    ],
                    'rel' => []
                ]
            ],
            'Worm' => [
                'group' => [
                    'flat' => [
                        'displayName' => 'Worm',
                        'pluralName' => 'Worms',
                    ],
                    'rel' => []
                ]
            ],
        ];
        return json_decode(json_encode($data[$key]), FALSE);
    }
/* --------------------  ROOT DESCRIPTIONS ---------------------------------- */
    private function addDescriptionsToRoots()
    {
        $desc = [
            'Artiodactyla' => 'Even-toed ungulates; hoofed animals- sheep, pigs, cows',
            'Carnivora' => 'Civets, weasels, dogs',
            'Perissodactyla' => 'Odd-toed ungulates; hoofed animals- horses, tapirs',
            'Pholidota' => 'Pangolins',
            'Rodentia' => 'Rodents',
            'Actinopterygii' => 'Ray-finned fish'
        ];

        foreach ($desc as $name => $d) {
            $root = $this->getEntity('Taxon', $name, 'name')->getGroup();
            $root->setDescription($d);
            $this->persistEntity($root);
        }
    }
/* +++++++++++++++++++ VALID INTERACTIONS +++++++++++++++++++++++++++++++++++ */
    private function createAllValidInteractions()
    {
        $bat = $this->getGroupRoot('Bat');
        $this->createPredationInteractions($bat);
        $this->createValidInteractionsWithBatSubject($bat);
    }
/* --------------------------- PREDATION ------------------------------------ */
    private function createPredationInteractions($bat)
    {
        $groups = ['Arthropod', 'Bird', 'Reptile', 'Mammal', 'Amphibian', 'Fish'];

        foreach ($groups as $subjectSubGroup) {
            $this->handleCreate($subjectSubGroup, $bat, 'Predation', []);
        }

    }
/* ----------------------- BAT SUBJECT -------------------------------------- */
    private function createValidInteractionsWithBatSubject($bat)
    {
        $data = $this->getValidInteractionData('Bat');

        foreach ($data as $intData) {
            $tags = $this->getTags($intData);

            foreach ($intData['object'] as $oGroup) {
                $this->handleCreate($bat, $oGroup, $intData['type'], $tags);
            }
        }
    }
/* ----------------------- CREATE ENTITIES ---------------------------------- */
    private function handleCreate($subj, $obj, $type, $tags)
    {
        $subj = $this->getGroupRoot($subj);
        $obj = $this->getGroupRoot($obj);
        $type = $this->getEntity('InteractionType', $type, 'displayName');
        $this->createValidInteraction($subj, $obj, $type, $tags);
    }
    private function getGroupRoot($gName)
    {
        if (!is_string($gName)) { return $gName; } print($gName);
        $group = $this->getEntity('Group', $gName, 'displayName');
        return $group->getTaxa()[0];
    }
    private function getTags($data)
    {
        $tags = [];
        foreach ($data['tags'] as $tagName) {
            $tag = $this->getEntity('Tag', $tagName, 'displayName');
            array_push($tags, $tag);
        }
        return $tags;
    }
    private function createValidInteraction($subj, $obj, $type, $tags)
    {
        $entity = new ValidInteraction();
        $entity->setSubjectSubGroup($subj);
        $entity->setObjectSubGroup($obj);
        $entity->setInteractionType($type);
        foreach ($tags as $tag) {
            $entity->addTag($tag);
        }
        $this->persistEntity($entity, true);
    }
/* --------------------------- DATA ----------------------------------------- */
    private function getValidInteractionData($key)
    {
        $data = [
            'Bat' => [
                [   'object' => ['Plant'],
                    'type' => 'Pollination',
                    'tags' => ['Flower']  //required
                ],[
                    'object' => ['Plant'],
                    'type' => 'Visitation',
                    'tags' => ['Flower']
                ],[
                    'object' => ['Plant'],
                    'type' => 'Seed Dispersal',
                    'tags' => ['Seed']
                ],[
                    'object' => ['Plant'],
                    'type' => 'Consumption',
                    'tags' => ['Flower', 'Fruit', 'Seed', 'Leaf']   //one required
                ],[
                    'object' => ['Fungi'],
                    'type' => 'Consumption',
                    'tags' => []
                ],[
                    'object' => ['Plant'],
                    'type' => 'Roost',
                    'tags' => ['Internal', 'External'] //one required
                ],[
                    'object' => ['Plant'],
                    'type' => 'Transport',
                    'tags' => ['Bryophyte fragment']
                ],[
                    'object' => ['Arthropod'],
                    'type' => 'Transport',
                    'tags' => ['Arthropod']
                ],[
                    'object' => ['Bat'],
                    'type' => 'Cohabitation',
                    'tags' => ['Coroost']
                ],[
                    'object' => ['Arthropod', 'Bird', 'Reptile', 'Mammal', 'Amphibian'],
                    'type' => 'Cohabitation',
                    'tags' => []
                ],[
                    'object' => ['Arthropod', 'Bird', 'Reptile', 'Mammal', 'Amphibian', 'Fish', 'Worm'],
                    'type' => 'Predation',
                    'tags' => []
                ],[
                    'object' => ['Fungi', 'Arthropod', 'Virus', 'Worm', 'Chromista', 'Protozoa', 'Bacteria'],
                    'tags' => [],
                    'type' => 'Host',
                ],[
                    'object' => ['Mammal', 'Bird'],
                    'type' => 'Hematophagy',
                    'tags' => []
                ]]
        ];
        return $data[$key];
    }
/* +++++++++++++++++++++++ DATA CLEANUP +++++++++++++++++++++++++++++++++++++ */
    private function cleanUpData()
    {
        $this->deleteTaxa();
        $this->moveTaxa();
        $this->deleteInteraction();
        $this->clearSourceWhitespace();
        $this->em->flush();
    }
    private function deleteTaxa()
    {
        $ids = [4625, 4624, 4636, 3783, 3480, 3622, 3435, 4066, 3644, 3494, 3507, 3552, 4166, 3437, 2034, 3110, 4623, 4577, 1659];
        foreach ($ids as $id) {
            $taxon = $this->getEntity('Taxon', $id);
            $this->em->remove($taxon);
            $this->em->flush();
            $this->em->remove($taxon);
        }
    }
    private function moveTaxa()
    {
        $taxa = [4543 => 'Class Actinobacteria', 4585 => 'Family Corvidae'];
        foreach ($taxa as $id => $parentName) {
            $taxon = $this->getEntity('Taxon', $id);
            $parent = $this->getEntity('Taxon', $parentName, 'displayName');
            $taxon->setParentTaxon($parent);
            $this->persistEntity($taxon);
        }
    }
    private function deleteInteraction()
    {
        $int = $this->getEntity('Interaction', 12618);
        $this->em->remove($int);
        $this->em->flush();
        $this->em->remove($int);
    }
    private function clearSourceWhitespace()
    {
        $srcs = $this->getEntities('Source');
        $fields = [ 'Doi', 'LinkUrl', 'Year' ];
        foreach ($srcs as $src) {
            foreach ($fields as $field) {
                $getField = 'get'.$field;
                $setField = 'set'.$field;
                $data = $src->$getField();
                if (!$data) { continue; }
                $src->$setField(trim($data));
                $this->persistEntity($src);
            }
        }
    }
/* ============================ DOWN ======================================== */
    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}