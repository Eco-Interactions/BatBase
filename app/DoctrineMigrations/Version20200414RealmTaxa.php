<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

use AppBundle\Entity\RealmRoot;


/**
 * Creates a new Realm Taxon entity for each taxon in each realm. This will allow 
 * easier handling of realm taxa collections.
 * Note: The 'updatedBy' admin is hardcoded to 6, Sarah.
 */
class Version20200414RealmTaxa extends AbstractMigration implements ContainerAwareInterface
{
    private $container;
    private $em;
    private $admin;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    private function getEntity($className, $val, $prop = 'id')
    {
        return $this->em->getRepository('AppBundle:'.$className)
            ->findOneBy([$prop => $val]);
    }

    public function getEntities($className)
    {
        return $this->em->getRepository('AppBundle:'.$className)->findAll();
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
    public function up(Schema $schema)
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->getEntity('User', 6);

        $this->createRealmRoots();
        $this->em->flush();

        $this->addSql('ALTER TABLE realm DROP FOREIGN KEY FK_A7A91E0BDE13F470');
        $this->addSql('DROP INDEX UNIQ_FA96DBDADE13F470 ON realm');
        $this->addSql('ALTER TABLE realm DROP taxon_id');
    }

    private function createRealmRoots()
    {
        $realms = $this->getEntities('Realm');
        foreach ($realms as $realm) {                                           //print("\n".$realm->getDisplayName());
            $root = $this->createRealmRoot($realm);
            $this->persistEntity($root, true);
            // $this->persistEntity($realm);
        }
    }

    private function createRealmRoot($realm)
    {
        $root = new RealmRoot();
        $root->setTaxon($realm->getTaxon());
        $root->setRealm($realm);
        return $root;
    }


/* ======================== down ============================================ */
    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
