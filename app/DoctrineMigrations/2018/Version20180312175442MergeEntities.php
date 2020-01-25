<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Authors:
 * > 'D. Taylor' into 'D. A. R. Taylor'
 * > 'A. Radosoa Andrianaivoarivelo' into 'Radosoa Andrianaivoarivelo'
 * > 'Donald W. Thomas' into 'Donald W Thomas'
 * > 'Petr Benda' into 'P. benda' (added the full first name back to author via UI)
 * > 'Stefan Petterson' into 'Stefan Pettersson'
 * Citations:
 * > Removed: 952 (no interactions)
 * Publications:
 * > Removed: 25, 56, 1029 (no citations)
 */
class Version20180312175442MergeEntities extends AbstractMigration implements ContainerAwareInterface
{
    protected $admin;
    protected $container;
    protected $em;

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
        $this->admin = $this->em->getRepository('AppBundle:User')->findOneBy(['id' => 6]);
        //[ rmvFrom, addTo ]
        $pubs = [[56, null], [25, null]];
        // $cits = [[952, null]];
        // $auths = [[1021, 1018], [1165, 1161], [1016, 412], [1141, 1142], [1028, null]];
        $this->mergeSrcEntities($pubs, 'Source', 'Publication');
        // $this->mergeSrcEntities($cits, 'Source', 'Citation');
        // $this->mergeSrcEntities($auths, 'Source', 'Author');

        $this->em->flush();
    }

    protected function mergeSrcEntities($ents, $coreEnt, $detail)
    {
        foreach ($ents as $ids) {
            $this->mergeData($ids[0], $ids[1], $coreEnt, $detail);
        }

    }
    protected function mergeData($rmvId, $addId, $coreEnt, $detail)
    {
        $rmv = $this->getEntity($rmvId, $coreEnt);                              //print("\n Remove entity id  = ".$rmvId);
        $getDetail = 'get'.$detail;
        $rmvDet = $rmv->$getDetail();

        if ($addId) {
            $add = $this->getEntity($addId, $coreEnt);
            // $this->mergeMiscData($rmv, $add, $type); 
            $this->transferChildren($rmv, $add, $coreEnt);
            // $this->transferInts($rmv, $add, $type);
            $this->setUpdatedBy($rmv, $add);
            $this->em->persist($add);
        }
        $this->em->persist($rmv);
        $this->em->remove($rmv);
        $this->em->remove($rmvDet);
    }
    private function getEntity($id, $type)
    {
        return $this->em->getRepository('AppBundle:'.$type)->findOneBy(['id' => $id]);
    }
    private function mergeMiscData(&$rmv, &$add, $type)
    {
        //TODO
        //Author/Publication/Citation contributions
    }
    private function transferChildren($oldPrnt, $newPrnt, $type)
    {
        $map = [
            'Location' => [ 'ChildLocs', 'ParentLoc' ],
            'Source' => [ 'ChildSources', 'ParentSource' ]
        ];
        $childProp = $map[$type][0];
        $prntProp = $map[$type][1];
        $getFunc = 'get'.$childProp;
        $setFunc = 'set'.$prntProp;

        $children = $oldPrnt->$getFunc();
        if (!count($children)) { return; }                                      print("\nCHILDREN FOUND = ".count($children));
        foreach ($children as $child) {
            $child->$setFunc($newPrnt);
            $this->em->persist($child);
        }
    }
    private function transferInts($rmv, $add, $prop, &$em)
    {

        foreach ($rmv->getInteractions() as $int) {
            $setFunc = 'set'.$prop;
            $int->$setFunc($add);
            $em->persist($int);
        }
    }
    private function setUpdatedBy(&$rmv, &$add)
    {
        $rmv->setUpdatedBy($this->admin);
        $add->setUpdatedBy($this->admin);
    }
    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}