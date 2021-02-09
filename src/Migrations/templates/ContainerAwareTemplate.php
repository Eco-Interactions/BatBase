<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

use App\Entity\InteractionType;


/**
 * Template for doctrine migrations where the entity manager is necessary.
 * Note: The 'created/updatedBy' admin is hardcoded to 6, Sarah.
 */
class ContainerAwareTemplate extends AbstractMigration implements ContainerAwareInterface
{
    private $container;
    private $em;
    private $admin;
    private $dataManager;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function setDataManager(DataManager $manager)
    {
        $this->dataManager = $manager;
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
    public function up(Schema $schema):void
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->getEntity('User', 6);

    }

/* ======================== down ============================================ */
    /**
     * @param Schema $schema
     */
    public function down(Schema $schema):void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
