<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

use AppBundle\Entity\Level;
use AppBundle\Entity\Realm;
use AppBundle\Entity\Taxon;


/**
 * Creates realms:
 *     Amphibian - Class
 *     Bacteria - Domain
 *     Bird - Class
 *     Fungi - Kingdon
 *     Reptile - Class
 *     Virus - Domain
 */
class Version20191207NewRealmData extends AbstractMigration implements ContainerAwareInterface
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
    public function up(Schema $schema)
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->getEntity('User', 'id', 6);

        $this->addDomainLevel();
        $this->updateCurrentRealms();
        $this->createNewRealms();
        $this->em->flush();
    }

    private function getEntity($className, $prop, $val)
    {
        return $this->em->getRepository('AppBundle:'.$className)
            ->findOneBy([$prop => $val]);
    }

    private function persistEntity(&$entity, $creating = false)
    {
        if ($creating) {
            $entity->setCreatedBy($this->admin);       
        }
        $entity->setUpdatedBy($this->admin);
        $this->em->persist($entity);
    }

    private function addDomainLevel()
    {
        $level = new Level();  
        $level->setDisplayName('Domain');
        $level->setOrdinal(5);
        $level->setPluralName('Domains');

        $this->persistEntity($level, true);
        $this->em->flush();
    }

    private function updateCurrentRealms()
    {
        $realms = $this->getCurrentRealmsData();

        foreach ($realms as $name => $data) {                                   print('name = ['.$name."]\n");
            $this->updateCurrentRealm($name, $data);
        }
    }

    private function updateCurrentRealm($name, $data)
    {                                                                       
        $realm = $this->getEntity('Realm', 'displayName', $name);
        $realm->setUiLevelsShown($data['UiLevelsShown']);
        $this->updateRealmTaxon($realm);
        $this->persistEntity($realm);
    }

    private function createNewRealms()
    {
        $realms = $this->getNewRealmsData();

        foreach ($realms as $name => $data) {                                   print('name = ['.$name."]\n");
            $this->createNewRealm($name, $data); 
        }
    }

    private function createNewRealm($name, $data)
    {
        $realm = new Realm();
        $taxon = $this->createTaxon($realm, $name, $data['Taxon']);
        $this->setRealmData($realm, $taxon, $name, $data['Realm']);
        $this->persistEntity($taxon, true);
        $this->persistEntity($realm, true);
    }

    private function createTaxon(&$realm, $name, $data)
    {
        $taxon = new Taxon();
        $taxon->setRealm($realm);
        $taxon->setIsRealm(true);
        $this->setTaxonParent($taxon, $data);
        $this->setTaxonDisplayName($taxon, $name, $data);
        $this->setTaxonLevel($taxon, $name, $data);
        return $taxon;
    }

    private function setTaxonParent(&$taxon, $data)
    {
        if (!array_key_exists('Parent', $data)) { return; }
        $parent = $this->getEntity('taxon', 'displayName', $data['Parent']);
        $taxon->setParentTaxon($parent);
    }

    private function setTaxonDisplayName(&$taxon, $name, $data)
    {
        $displayName = array_key_exists('Name', $data) ? $data['Name'] : $name;
        $taxon->setDisplayName($displayName);
    }

    private function setTaxonLevel(&$taxon, $name, $data)
    {
        $level = $this->getEntity('Level', 'displayName', $data['Level']);
        $taxon->setLevel($level);
    }

    private function setRealmData(&$realm, &$taxon, $name, $data)
    {
        $realm->setDisplayName($name);
        $realm->setPluralName($data['PluralName']);
        $realm->setUiLevelsShown($data['UiLevelsShown']);
        $realm->setTaxon($taxon);
    }

    private function updateRealmTaxon(&$realm)
    {
        $taxon = $realm->getTaxon();
        $taxon->setIsRealm(true);        
        $this->persistEntity($taxon);
    }

    private function getCurrentRealmsData()
    {
        return [
            'Bat' => [
                'UiLevelsShown' => '[7, 6, 5]'
            ],
            'Arthropod' => [
                'UiLevelsShown' => '[7, 6, 5, 4, 3]'
            ],
            'Plant' => [
                'UiLevelsShown' => '[7, 6, 5]'
            ],
        ];
    }

    private function getNewRealmsData()
    {
        return [
            'Bacteria' => [
                'Realm' => [
                    'PluralName' => 'Bacteria',
                    'UiLevelsShown' => '[7, 6, 5, 4, 3]'
                ],
                'Taxon' => [
                    'Level' => 'Domain'
                ]
            ],
            'Fungi' => [
                'Realm' => [
                    'PluralName' => 'Fungi',
                    'UiLevelsShown' => '[7, 6, 5]'
                ],
                'Taxon' => [
                    'Level' => 'Kingdom'

                ]

            ],
            'Virus' => [
                'Realm' => [
                    'PluralName' => 'Viruses',
                    'UiLevelsShown' => '[7, 6, 5]'
                ],
                'Taxon' => [
                    'Level' => 'Domain'
                ]

            ],
            'Bird' => [
                'Realm' => [
                    'PluralName' => 'Birds',
                    'UiLevelsShown' => '[7, 6, 5]'
                ],
                'Taxon' => [
                    'Level' => 'Class',
                    'Name' => 'Aves',
                    'Parent' => 'Animalia'
                ]

            ],
            'Reptile' => [
                'Realm' => [
                    'PluralName' => 'Reptiles',
                    'UiLevelsShown' => '[7, 6, 5]'
                ],
                'Taxon' => [
                    'Level' => 'Class',
                    'Name' => 'Reptilia',
                    'Parent' => 'Animalia'
                ]

            ],
            'Amphibian' => [
                'Realm' => [
                    'PluralName' => 'Amphibians',
                    'UiLevelsShown' => '[7, 6, 5]'
                ],
                'Taxon' => [
                    'Level' => 'Class',
                    'Name' => 'Amphibia',
                    'Parent' => 'Animalia'
                ]

            ]
        ];
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
