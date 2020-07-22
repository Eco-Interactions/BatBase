<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\DBAL\Connection;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
// use Doctrine\ORM\EntityManagerInterface;


/**
 * Moves all interactions and data from one entity to another and removes the first.
 NOTE: WAS NOT RAN WITH SYMFONY 4.4... CONTAINER AWARE INTERFACES NEED A LOT MORE CONNECTION NOW
 */
class Version20200718Delete extends AbstractMigration implements ContainerAwareInterface
{
    protected $admin;
    protected $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    private function getEntity($className, $val, $prop = 'id')
    {
        //return $conn->fetchOne('SELECT $prop FROM $className WHERE $prop = $val', array(1), 0);
        return $this->em->getRepository('AppBundle:'.$className)->findOneBy([$prop => $val]);
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
        // $this->qb = $this->connection->createQueryBuilder();
        // $users = $this->connection->fetchAll('SELECT * FROM user');  print(count($users));
        // $this->qb->
        //     ->select('id', 'name')
        //     ->from('users');
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->getEntity('User', 6);
        //$ents = [[ rmvFrom, addTo ]];
        $ents = $this->getEntityIds();
        $this->mergeEntities($ents, 'Taxon', null);

        $this->em->flush();

        $this->deleteBuggedInteractions();
    }
    private function getEntityIds()
    {
        return [
            [3426, 1956], [1972, 2059], [3060, 3059], [3061, 3059], [3062, 3059],
            [360, 1368], [1784, 1808], [2734, 2675], [2480, 2348], [1558, 2869],
            [3115, 2546], [2361, 2758], [2362, 2758], [2973, 2836], [1150, 2366],
            [1149, 2365], [1594, 3051], [3145, 3144], [3146, 3144], [3362, 869],
            [3117, null]
        ];
    }

    protected function mergeEntities($ents, $coreClass, $detail)
    {
        foreach ($ents as $ids) {
            $this->mergeData($ids[0], $ids[1], $coreClass, $detail);
        }

    }
    protected function mergeData($rmvId, $addId, $coreClass, $detail)
    {
        $rmv = $this->getEntity($coreClass, $rmvId);                            print("\n Remove entity id  = ".$rmvId);

        if ($addId) { $this->transferData($coreClass, $addId, $rmv); }
        if ($detail) { $this->removeDetailEntityData($detail, $rmv); }

        $this->persistEntity($rmv);
        $this->em->remove($rmv);
    }

    private function transferData($coreClass, $addId, $rmv)
    {
        $add = $this->getEntity($coreClass, $addId);
        $this->transferChildren($rmv, $add, $coreClass);
        $this->transferInts($rmv, $add, $coreClass);
        $this->persistEntity($add, true);
    }

    private function removeDetailEntityData($type, $coreEntity)
    {
        $getDetail = 'get'.$detail;
        $detailEntity = $coreEntity->$getDetail();
        $this->em->remove($detailEntity);
    }
    private function transferChildren($oldPrnt, $newPrnt, $type)
    {
        $map = [
            'Location' => [ 'ChildLocs', 'ParentLoc' ],
            'Source' =>   [ 'ChildSources', 'ParentSource' ],
            'Taxon' =>    [ 'ChildTaxa', 'ParentTaxon' ]
        ];
        $getFunc = 'get'.$map[$type][0];
        $setFunc = 'set'.$map[$type][1];
        $children = $oldPrnt->$getFunc();
        if (!count($children)) { return; }                                      print("\nCHILDREN FOUND = ".count($children));

        foreach ($children as $child) {
            $child->$setFunc($newPrnt);
            $this->persistEntity($child);
        }
    }
    private function transferInts($rmv, $add, $coreClass)
    {
        $prop = $this->getInteractionProp($add, $coreClass);

        foreach ($rmv->getAllInteractionIds() as $intId) {
            $setFunc = 'set'.$prop;
            $int = $this->getEntity('Interaction', $intId);
            $int->$setFunc($add);
            $this->persistEntity($int);
        }
    }

    private function getInteractionProp($add, $coreClass)
    {
        return $coreClass === 'Taxon' ? $this->getRoleProp($add) : $coreClass;
    }

    private function getRoleProp($taxon)
    {
        return $this->getRealm($taxon) === 'Bat' ? 'Subject' : 'Object';
    }
    private function getRealm($taxon)
    {
        return $taxon->getRealm() ?
            $taxon->getRealm()->getDisplayName() :
            $this->getRealm($taxon->getParentTaxon());
    }

    private function deleteBuggedInteractions()
    {
        $ids = [10355, 10356];

        foreach ($ids as $id) {
            $int = $this->getEntity('Interaction', $id);
            $this->em->remove($int);
            $this->em->persist($int);
            $this->em->remove($int); //removed from database fully
            $this->em->persist($int);
        }
    }

    private function removeSimpleRelations(&$int)
    {
        $entities = []
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
