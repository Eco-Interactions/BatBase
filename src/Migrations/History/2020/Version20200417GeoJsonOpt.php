<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

use App\Entity\RealmRoot;


/**
 * Creates a new Realm Taxon entity for each taxon in each realm. This will allow 
 * easier handling of realm taxa collections.
 * Note: The 'updatedBy' admin is hardcoded to 6, Sarah.
 */
class Version20200417GeoJsonOpt extends AbstractMigration implements ContainerAwareInterface
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

        $geoJson = $this->getEntities('GeoJson');

        foreach ($geoJson as $g) {
            $loc = $g->getLocation(); 
            $loc->setGeoJson($g);
            $this->persistEntity($loc);
        }
        $this->em->flush();
        
        $this->addSql('ALTER TABLE geo_json DROP FOREIGN KEY FK_6F200A456505CAD1');
        $this->addSql('DROP INDEX UNIQ_6F200A456505CAD1 ON geo_json');
        $this->addSql('ALTER TABLE geo_json DROP loc_id');
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
