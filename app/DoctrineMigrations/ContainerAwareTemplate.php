<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

use AppBundle\Entity\InteractionType;


/**
 * Template for doctrine migrations where the entity manager is necessary.
 * Note: The 'updatedBy' admin is hardcoded to 6, Sarah.
 */
class Version20170725183034MoveInts extends AbstractMigration implements ContainerAwareInterface
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
