<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use App\Entity\Contribution;

/**
 * Deletes duplicate and mistake taxa.
 * Reformats saved filter-set details.
 */
final class Version20201202Cleanup extends AbstractMigration implements ContainerAwareInterface
{

    private $em;
    protected $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function getDescription() : string
    {
        return "Deletes duplicate and mistake taxa. Fixes minor citation bugs";
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

        $this->deleteTaxa();
        $this->fixCitationBugs();

        $this->em->flush();
    }
/* --------------------- MOVE RANK-DATA ------------------------------------- */

    private function deleteTaxa()
    {
        $ids = [ 1784, 2652, 3783, 3480, 3622, 3435, 4066, 3644, 3494, 3507, 3552,
            4166, 1722, 4449, 1149, 1594, 3362, 1807 ];

        foreach ($ids as $id) {
            $taxon = $this->getEntity('Taxon', $id);
            $this->em->remove($taxon);
        }
    }


    private function fixCitationBugs()
    {
        $this->addContribs();
        $cit = $this->getEntity('Citation', 563);
        $src = $this->getEntity('Source', 2171);

        $this->em->remove($cit);
        $this->em->remove($src);
    }
    private function addContribs()
    {
        $citSrc = $this->getEntity('Source', 1769);
        $auths = [1766 => 1, 1768 => 2];

        foreach ($auths as $id => $ord) {
            $contrib = new Contribution();
            $contrib->setWorkSource($citSrc);
            $contrib->setAuthorSource($this->getEntity('Source', $id));
            $contrib->setOrd($ord);
            $citSrc->addContributor($contrib);
            $this->persistEntity($contrib, true);
        }
        $this->persistEntity($citSrc);
    }
/* ============================ DOWN ======================================== */
    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}