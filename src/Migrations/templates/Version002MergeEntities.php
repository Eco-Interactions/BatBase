<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Moves all interactions and data from one entity to another and removes the first. 
 */
class Version002MergeEntities extends AbstractMigration implements ContainerAwareInterface
{
    protected $admin;
    protected $container;
    protected $em;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    } 

    private function getEntity($className, $val, $prop = 'id')
    {
        return $this->em->getRepository('App:'.$className)->findOneBy([$prop => $val]);
    }

    private function persistEntity($entity, $creating = false)
    {
        if ($creating) { $entity->setCreatedBy($this->admin); }
        $entity->setUpdatedBy($this->admin);
        $this->em->persist($entity);
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema):void
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->em->getRepository('App:User')->findOneBy(['id' => 6]);
        //$ents = [[ rmvFrom, addTo ]];
        //
        // $this->mergeEntities($ents, 'Source', 'Publication');

        $this->em->flush();
    }

    protected function mergeEntities($ents, $coreClass, $detail)
    {
        foreach ($ents as $ids) {
            $this->mergeData($ids[0], $ids[1], $coreClass, $detail);
        }

    }
    protected function mergeData($rmvId, $addId, $coreClass, $detail)
    {
        $rmv = $this->getEntity($coreClass, $rmvId);                              //print("\n Remove entity id  = ".$rmvId);

        if ($addId) { $this->transferData($coreClass, $addId, $rmv); }
        if ($detail) { $this->removeDetailEntityData($detail, $rmv); }
        
        $this->persistEntity($rmv);
        $this->em->remove($rmv);
    }

    private function transferData($coreClass, $addId, $rmv)
    {
        $add = $this->getEntity($coreClass, $addId);
        // $this->mergeMiscData($rmv, $add); 
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
    private function mergeMiscData(&$rmv, &$add)
    {
        //
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

        foreach ($rmv->getInteractions() as $int) {
            $setFunc = 'set'.$prop;
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
        return $taxon->getRealm()->getSlug() === 'bat' ? 'Subject' : 'Object';
    }


    /**
     * @param Schema $schema
     */
    public function down(Schema $schema):void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
