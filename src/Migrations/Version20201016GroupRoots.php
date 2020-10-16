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
 * Creates realms with multiple taxon roots.
 */
final class Version20201016GroupRoots extends AbstractMigration implements ContainerAwareInterface
{

    private $em;
    protected $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function getDescription() : string
    {
        return "Creates realms with multiple taxon roots.";
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

        $this->createMutliRootGroups();

        $this->em->flush();
    }

    private function createMutliRootGroups()
    {
        $groups = $this->getMultiRootGroups();

        foreach ($groups as $name => $data) {                                   print("\n group [".$name."]\n");
            $group = new Group();
            $group->setDisplayName($name);
            $group->setPluralname($data['plural']);
            $group->setUiRanksShown($data['ranks']);
            $this->createGroupRoots($data['taxa'], $group);
            $this->persistEntity($group, true);
        }
    }

    private function createGroupRoots($taxa, &$group)
    {
        foreach ($taxa as $displayName => $data) {                              print("\n      taxon [".$displayName."]\n");
            $taxon = new Taxon();
            $taxon->setDisplayName($displayName);
            $taxon->setName($data['name']);
            $taxon->setIsRoot(true);
            $this->setParent($data['parent'], $taxon);
            $this->setRank($data['rank'], $taxon);
            $this->setGroupRoot($taxon, $group);
            $this->persistEntity($taxon, true);
        }
    }

    private function setGroupRoot(&$taxon, &$group)
    {
        $root = new GroupRoot();
        $root->setGroup($group);
        $root->setTaxon($taxon);
        $this->persistEntity($root, true);
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

    private function getMultiRootGroups()
    {
        return [
            'Other Parasite' => [
                'plural' => 'Other Parasites',
                'ranks' => '[7, 6, 5]',
                'taxa' => [
                    'Phylum Acanthocephala' => [
                        'name' => 'Acanthocephala',
                        'rank' => 'Phylum',
                        'parent' => 'Kingdom Animalia'
                    ],
                    'Phylum Nematoda' => [
                        'name' => 'Nematoda',
                        'rank' => 'Phylum',
                        'parent' => 'Kingdom Animalia'
                    ],
                    'Phylum Platyhelminthes' => [
                        'name' => 'Platyhelminthes',
                        'rank' => 'Phylum',
                        'parent' => 'Kingdom Animalia'
                    ],
                    'Kingdom Protozoa' => [
                        'name' => 'Protozoa',
                        'rank' => 'Kingdom',
                        'parent' => false
                    ],
                    'Kingdom Chromista' => [
                        'name' => 'Chromista',
                        'rank' => 'Kingdom',
                        'parent' => false
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