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

/**
 * Moves sub-rank data from Group to SubGroup.
 * Creates the taxon Groups with SubGroups.
 */
final class Version202011132GroupRoots extends AbstractMigration implements ContainerAwareInterface
{

    private $em;
    protected $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function getDescription() : string
    {
        return "Creates the taxon Groups with SubGroups. Moves sub-rank data from Group to SubGroup.";
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

/* ============================== UP ======================================== */
    public function up(Schema $schema) : void
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->getEntity('User', 6, 'id');

        $this->moveSubRankDataToSubGroup();
        $this->createMutliRootGroups();

        $this->em->flush();
    }
/* --------------------- MOVE RANK-DATA ------------------------------------- */
    private function moveSubRankDataToSubGroup()
    {
        $groups = $this->getEntities('Group');

        foreach ($groups as $group) {
            $roots = $group->getTaxa();  print("\n[".$group->getDisplayName()."]");
            foreach ($roots as $root) {
                $ranks = $group->getDisplayName() === 'Fish' ? '[7, 6, 5, 4]' : $group->getUiRanksShown();
                $root->setSubRanks($ranks);     print("\n[".$group->getDisplayName()."] = [$ranks]");
                $this->persistEntity($root);
            }
        }
    }
/* --------------------- CREATE SUB-GROUPS ---------------------------------- */
    private function createMutliRootGroups()
    {
        $groups = $this->getMultiRootGroups();
        $this->createMissingMammalTaxonomy();

        foreach ($groups as $name => $data) {                                   print("\n group [$name]\n");
            $group = new Group();
            $group->setDisplayName($name);
            $group->setUiRanksShown('[]');
            $group->setPluralname($data['plural']);
            $this->createGroupRoots($data['taxa'], $group);
            $this->persistEntity($group, true);
        }
    }

    private function createMissingMammalTaxonomy($value='')
    {
        $this->createAndPersistMammalTaxonomy();
        $this->em->flush();
    }
    private function createAndPersistMammalTaxonomy()
    {
        $taxa = $this->getMammalTaxaData();
        foreach ($taxa as $displayName => $taxon) {
            $taxon = $this->createTaxon($displayName, $taxon);
            if ($displayName === 'Class Mammalia') { $this->updateBatParent($taxon); }
            $this->persistEntity($taxon, true);
            $this->em->flush();
        }
    }

    private function updateBatParent(&$taxon)
    {
        $bat = $this->getEntity('Taxon', 'Order Chiroptera', 'displayName');
        $bat->setParentTaxon($taxon);
        $this->persistEntity($bat);
    }

    private function getMammalTaxaData()
    {
        return [
            'Phylum Chordata' => [
                'parent' => 'Kingdom Animalia'
            ],
            'Class Mammalia' => [
                'parent' => 'Phylum Chordata'
            ]
        ];
    }
/* ---------------------- CREATE TAXON -------------------------------------- */
    private function createTaxon($displayName, $data)
    {                                                                           print("\n      Creating taxon [".$displayName."]\n");
            $taxon = new Taxon();
            $taxon->setDisplayName($displayName);
            $taxon->setName(explode(' ', $displayName)[1], $taxon);
            $this->setRank(explode(' ', $displayName)[0], $taxon);
            $this->setParent($data['parent'], $taxon);
            return $taxon;
    }

    private function setParent($parentName, &$taxon)
    {
        if (!$parentName) { return; }
        $parent = $this->getEntity('Taxon', $parentName, 'displayName');
        $taxon->setParentTaxon($parent);
    }

    private function setRank($rankName, &$taxon)
    {
        $rank = $this->getEntity('Rank', $rankName, 'displayName');
        $taxon->setRank($rank);
    }

/* ---------------------- CREATE GROUP-ROOT --------------------------------- */
    private function createGroupRoots($taxa, &$group)
    {
        foreach ($taxa as $displayName => $data) {                              print("\n      taxon [".$displayName."]\n");
            $taxon = $this->createTaxon($displayName, $data);
            $taxon->setIsRoot(true);
            $this->setGroupRoot($taxon, $group, $data['subRanks']);
            $this->persistEntity($taxon, true);
        }
    }

    private function setGroupRoot(&$taxon, &$group, $ranks)
    {
        $root = new GroupRoot();
        $root->setSubRanks($ranks);
        $root->setGroup($group);
        $root->setTaxon($taxon);
        $this->persistEntity($root, true);
    }

    private function getMultiRootGroups()
    {
        return [
            'Parasite' => [
                'plural' => 'Parasites',
                'taxa' => [
                    'Phylum Acanthocephala' => [
                        'parent' => 'Kingdom Animalia',
                        'subRanks' => '[7, 6, 5, 4, 3]',
                    ],
                    'Phylum Nematoda' => [
                        'parent' => 'Kingdom Animalia',
                        'subRanks' => '[7, 6, 5, 4, 3]',
                    ],
                    'Phylum Platyhelminthes' => [
                        'parent' => 'Kingdom Animalia',
                        'subRanks' => '[7, 6, 5, 4, 3]',
                    ],
                    'Kingdom Protozoa' => [
                        'parent' => false,
                        'subRanks' => '[7, 6, 5]',
                    ],
                    'Kingdom Chromista' => [
                        'parent' => false,
                        'subRanks' => '[7, 6, 5]',
                    ],
                ]
            ],
            'Mammal' => [
                'plural' => 'Mammals',
                'taxa' => [
                    'Order Rodentia' => [
                        'parent' => 'Class Mammalia',
                        'subRanks' => '[7, 6, 5]',
                    ],
                    'Order Artiodactyla' => [
                        'parent' => 'Class Mammalia',
                        'subRanks' => '[7, 6, 5]',
                    ],
                    'Order Carnivora' => [
                        'parent' => 'Class Mammalia',
                        'subRanks' => '[7, 6, 5]',
                    ],
                    'Order Perissodactyla' => [
                        'parent' => 'Class Mammalia',
                        'subRanks' => '[7, 6, 5]',
                    ],
                    'Order Pholidota' => [
                        'parent' => 'Class Mammalia',
                        'subRanks' => '[7, 6, 5]',
                    ],
                ]
            ]
        ];
    }
/* ============================ DOWN ======================================== */
    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}