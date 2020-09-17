<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Adds active and passive verb forms to each Interaction Type entity.
 */
final class Version20200809IntTypeForms extends AbstractMigration implements ContainerAwareInterface
{

    private $em;
    protected $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function getDescription() : string
    {
        return "Adds active and passive verb forms to each Interaction Type entity.";
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

        $this->addInteractionTypeForms();

        $this->em->flush();
    }
/* ------------------ INTERACTION TYPE  ------------------------------------- */
private function addInteractionTypeForms()
{
    $names = $this->getInteractionTypeNameForms();
    $types = $this->getEntities('InteractionType');

    foreach ($types as $type) {                                                 print("\n type [".$type->getDisplayName()."]\n");
        $forms = $names[$type->getDisplayName()];
        $type->setActiveForm($forms['active']);
        $type->setPassiveForm($forms['passive']);
        if ($type->getDisplayName() == 'Visitation') { $type->getDisplayName('Flower Visitation'); }
        $this->persistEntity($type);
    }
}

private function getInteractionTypeNameForms()
{
    return [
        'Visitation' => [
            'active' => 'visited',
            'passive' => 'visited by'
        ],
        'Pollination' => [
            'active' => 'pollinated flowers of',
            'passive' => 'pollinated by'
        ],
        'Seed Dispersal' => [
            'active' => 'dispersed seeds of',
            'passive' => 'seeds dispersed by'
        ],
        'Consumption' => [
            'active' => 'consumed',
            'passive' => 'consumed by'
        ],
        'Transport' => [
            'active' => 'transported',
            'passive' => 'transported by'
        ],
        'Roost' => [
            'active' => 'roosted in',
            'passive' => 'roosted in by'
        ],
        'Predation' => [
            'active' => 'preyed upon',
            'passive' => 'preyed upon by`'
        ],
        'Prey' => [
            'active' => 'preyed upon by',
            'passive' => 'preyed upon'
        ],
        'Host' => [
            'active' => 'host of',
            'passive' => 'hosted by'
        ],
        'Cohabitation' => [
            'active' => 'cohabitated with',
            'passive' => 'cohabitated with'
        ],
        'Hematophagy' => [
            'active' => 'fed on the blood of',
            'passive' => 'blood was fed upon by'
        ]
    ];
}

/* ============================ DOWN ======================================== */
    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
