<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Moves all interactions and data from one entity to another and removes the first. 
 *
 * 
 * Move mexico from central to north america!
 */
class Version20170725183034MoveData extends AbstractMigration implements ContainerAwareInterface
{

    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');
        $admin = $em->getRepository('App:User')->findOneBy(['id' => 6]);

        $this->handleLocations($admin, $em);
        $em->flush();

    }
    private function handleLocations(&$admin, &$em)
    {       //[ rmvFrom, addTo ]
        $locs = [ [72, 136], [64, 164], [159, 181], [150, 17], 
            [23, 149], [147, 144] ];
        foreach ($locs as $ids) {                                               print_r($ids);
            $rmvLoc = $this->getEntity($ids[0], 'Location', $em);
            $addLoc = $this->getEntity($ids[1], 'Location', $em);
            $this->transferInts($rmvLoc, $addLoc, 'Location', $em);
            $this->transferChildren($rmvLoc, $addLoc, 'childLocs', 'parentLoc', $em);
            //add check for all other data
            $rmvLoc->setUpdatedBy($admin);
            $addLoc->setUpdatedBy($admin);
            $em->remove($rmvLoc);
            $em->persist($addLoc);
        }
    }
    private function getEntity($id, $entity, $em)
    {
        return $em->getRepository('App:'.$entity)->findOneBy(['id' => $id]);
    }
    private function transferInts($rmv, $add, $prop, &$em)
    {
        foreach ($rmv->getInteractions() as $int) {
            $setFunc = 'set'.$prop;
            $int->$setFunc($add);
            $em->persist($int);
        }
    }
    private function transferChildren($old, $new, $childProp, $prntProp, &$em)
    {
        $getFunc = 'get'.$childProp;
        $setFunc = 'set'.$prntProp;
        $children = $old->$getFunc();
        if (!count($children)) { return; } print("\nCHILDREN FOUND = ".count($children));
        foreach ($children as $child) {
            $child->$setFunc($new);
            $em->persist($child);
        }
    }
    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
