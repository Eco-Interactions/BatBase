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
        $entityData = $this->dataManager->new($cName, $data);
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
        $this->em->flush();
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
        $type->setActiveForm('pollinated');
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
        $taxon = $this->create('taxon', $data);
        $rootData = $this->getTaxonData('Annelida Root');
        $rootData['rel']['group'] = $group->getId();
        $rootData['rel']['taxon'] = $taxon->getId();
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
                    'flat' => [
                        'DisplayName' => 'Worm',
                        'PluralName' => 'Worms',
                    ],
                    'rel' => []
            ],
            'Annelida Taxon' => [
                // 'taxon' => [
                    'flat' => [
                        'DisplayName' => 'Phylum Annelida',
                        'Name' => 'Annelida',
                        'IsRoot' => true
                    ],
                    'rel' => [
                        'ParentTaxon' => 1,
                        'Rank' => 2
                    ]
                // ]
            ],
            'Annelida Root' => [
                // 'groupRoot' => [
                    'flat' => [
                        'SubRanks' => '[7, 6, 5, 4, 3]',
                        'Description' => 'Earthworms'
                    ],
                    'rel' => [
                        'Group' => null
                    ]
                // ]
            ],
            'Chromista Group' => [
                // 'group' => [
                    'flat' => [
                        'DisplayName' => 'Chromista',
                        'PluralName' => 'Chromista',
                    ],
                    'rel' => []
                // ]
            ]
        ];
        return $data[$key];
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
        $bat = $this->getGroupRoots('Bat');
        $this->createPredationInteractions($bat);
        $this->createValidInteractionsWithBatSubject($bat);
    }
/* --------------------------- PREDATION ------------------------------------ */
    private function createPredationInteractions($bat)
    {
        $groups = ['Arthropod', 'Bird', 'Reptile', 'Mammal', 'Amphibian', 'Fish'];

        foreach ($groups as $subjectSubGroup) {
            $this->handleCreate($subjectSubGroup, $bat, 'Predation', [], false);
        }

    }
/* ----------------------- BAT SUBJECT -------------------------------------- */
    private function createValidInteractionsWithBatSubject($bat)
    {
        $data = $this->getValidInteractionData('Bat');

        foreach ($data as $intData) {
            $tags = $this->getTags($intData);

            foreach ($intData['object'] as $oGroup) {
                $this->handleCreate($bat, $oGroup, $intData['type'], $tags, $intData['tagRequired']);
            }
        }
    }
/* ----------------------- CREATE ENTITIES ---------------------------------- */
    private function handleCreate($subj, $obj, $type, $tags, $tRequired)
    {
        $subj = $this->getGroupRoots($subj);
        $type = $this->getEntity('InteractionType', $type, 'displayName');
        $objs = $this->getGroupRoots($obj);

        foreach ($objs as $obj) {
            $this->createValidInteraction($subj, $obj, $type, $tags, $tRequired);
        }

    }
    private function getGroupRoots($gName)
    {
        if (!is_string($gName)) { return $gName; }                          print("\n".$gName);
        $group = $this->getEntity('Group', $gName, 'displayName');
        return $group->getTaxaEntities();
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
    private function createValidInteraction($subj, $obj, $type, $tags, $tRequired)
    {
        $entity = new ValidInteraction();
        $entity->setSubjectSubGroup($subj);
        $entity->setObjectSubGroup($obj);
        $entity->setInteractionType($type);
        $entity->setTagRequired($tRequired);

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
                    'tagRequired' => true,
                    'tags' => ['Flower']
                ],[
                    'object' => ['Plant'],
                    'type' => 'Visitation',
                    'tagRequired' => true,
                    'tags' => ['Flower']
                ],[
                    'object' => ['Plant'],
                    'type' => 'Seed Dispersal',
                    'tagRequired' => true,
                    'tags' => ['Seed']
                ],[
                    'object' => ['Plant'],
                    'type' => 'Consumption',
                    'tagRequired' => true,
                    'tags' => ['Flower', 'Fruit', 'Seed', 'Leaf']
                ],[
                    'object' => ['Fungi'],
                    'type' => 'Consumption',
                    'tagRequired' => false,
                    'tags' => []
                ],[
                    'object' => ['Plant'],
                    'type' => 'Roost',
                    'tagRequired' => true,
                    'tags' => ['Internal', 'External']
                ],[
                    'object' => ['Plant'],
                    'type' => 'Transport',
                    'tagRequired' => true,
                    'tags' => ['Bryophyte fragment']
                ],[
                    'object' => ['Arthropod'],
                    'type' => 'Transport',
                    'tagRequired' => true,
                    'tags' => ['Arthropod']
                ],[
                    'object' => ['Bat'],
                    'type' => 'Cohabitation',
                    'tagRequired' => false,
                    'tags' => ['Coroost']
                ],[
                    'object' => ['Arthropod', 'Bird', 'Reptile', 'Mammal', 'Amphibian'],
                    'type' => 'Cohabitation',
                    'tagRequired' => false,
                    'tags' => []
                ],[
                    'object' => ['Arthropod', 'Bird', 'Reptile', 'Mammal', 'Amphibian', 'Fish', 'Worm'],
                    'type' => 'Predation',
                    'tagRequired' => false,
                    'tags' => []
                ],[
                    'object' => ['Arthropod', 'Bird', 'Reptile', 'Mammal', 'Amphibian', 'Fish'],
                    'type' => 'Prey',
                    'tagRequired' => false,
                    'tags' => []
                ],[
                    'object' => ['Fungi', 'Arthropod', 'Virus', 'Worm', 'Chromista', 'Protozoa', 'Bacteria'],
                    'tagRequired' => false,
                    'tags' => [],
                    'type' => 'Host',
                ],[
                    'object' => ['Mammal', 'Bird'],
                    'tagRequired' => false,
                    'type' => 'Hematophagy',
                    'tags' => []
                ]]
        ];
        return $data[$key];
    }
/* ============================ DOWN ======================================== */
    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}