<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Adds a 'name' property to Source and Taxon entities and backfills existing data.
 */
class Version20200213Names extends AbstractMigration implements ContainerAwareInterface
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
/* ========================== up ============================================ */
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema):void
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->getEntity('User', 6, 'id');

        $this->copySourceNames();
        $this->setTaxonNames();
        $this->em->flush();
    }
/* ---------------------- SOURCE -------------------------------------------- */
    private function copySourceNames()
    {
        $srcs = $this->getEntities('Source');
        foreach ($srcs as $src) {
            $displayName = $src->getDisplayName();
            if (!strpos($displayName, '(citation)')) { continue; }
            $src->setName(explode('(citation)', $displayName)[0]);
            $this->persistEntity($src);
        }
    }

/* ----------------------- TAXON -------------------------------------------- */

    private function setTaxonNames()
    {
        $taxa = $this->getEntities('Taxon');
        foreach ($taxa as $txn) {
            $curName = $txn->getDisplayName();
            $txn->setName($curName);
            $lvl = $txn->getLevel()->getDisplayName();
            if ($lvl !== 'Species') {
                $txn->setDisplayName($lvl.' '.$curName);
            }
            $this->persistEntity($txn);
        }
    }

/* ======================== down ============================================ */
    public function down(Schema $schema):void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE source DROP name');
        $this->addSql('ALTER TABLE taxon DROP name');
    }
}
