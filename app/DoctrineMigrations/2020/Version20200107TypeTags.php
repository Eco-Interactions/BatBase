<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

use AppBundle\Entity\InteractionType;
use AppBundle\Entity\Tag;

/**
 * Restricts Tags to specific Interaction Types, also adds new and updates tags and types.
 * Note: The 'updatedBy' admin is hardcoded to 6, Sarah.
 */
class Version20200107TypeTags extends AbstractMigration implements ContainerAwareInterface
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

        $this->createTags();
        $this->createTypes();
        $this->em->flush();

        $this->restrictTagsToTypes();
        $this->em->flush();
    }

    private function createTags()
    {
        $tags = ['Bryophyte Fragment', 'Wood'];

        foreach ($tags as $name) {
            $tag = new Tag();
            $tag->setDisplayName($name);
            $tag->setConstrainedToEntity('Interaction');
            $this->persistEntity($tag, true);
        }
    }

    private function createTypes()
    {
        $types = ['Cohabitation', 'Prey', 'Hematophagy', 'Predation'];

        foreach ($types as $name) {
            $type = new InteractionType();
            $type->setDisplayName($name);
            $this->persistEntity($type, true);
        }
    }

    private function restrictTagsToTypes()
    {
        $restrictions = $this->getTypeTagRestrictions();

        foreach ($restrictions as $typeName => $tags) { print($typeName);print("\n");
            if (!$tags) { continue; } 
            $type = $this->getEntity('InteractionType', 'displayName', $typeName);

            foreach ($tags as $tagName) {  print('    '.$tagName);print("\n");
                $tag = $this->getEntity('Tag', 'displayName', $tagName);
                $type->addValidTag($tag);
                $tag->addIntTypeConstraint($type);
                $tag->setDescription(null); //Replaces empty strings with null
                $this->persistEntity($tag);
            }
            $this->persistEntity($type);
        }

    }

    private function getTypeTagRestrictions()
    {
        return [
            'Seed Dispersal' => ['Secondary'],
            'Consumption' => ['Flower', 'Leaf', 'Seed', 'Fruit', 'Secondary'],
            'Predation' => ['Secondary'],
            'Pollination' => ['Flower', 'Secondary'],
            'Visitation' => ['Flower', 'Secondary'], 
            'Roost' => ['Leaf', 'Wood', 'Secondary'],
            'Host' => ['Secondary'], 
            'Transport' => ['Arthropod', 'Bryophyte Fragment', 'Secondary'],
            'Cohabitation' => ['Secondary'], 
            'Prey' => ['Secondary'],
            'Hematophagy' => ['Secondary']
        ];
    }

    private function getEntity($className, $prop, $val)
    {
        return $this->em->getRepository('AppBundle:'.$className)
            ->findOneBy([$prop => $val]);
    }

    private function persistEntity($entity, $creating = false)
    {
        if ($creating) {
            $entity->setCreatedBy($this->admin);
        }
        $entity->setUpdatedBy($this->admin);
        $this->em->persist($entity);
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
