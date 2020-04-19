<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Merges duplicate taxa, deletes specified taxa and sources, fixes french guiana's
 * center point, drops location name from geojson, changes taxon's display name
 * default to NOT NULL.
 */
class Version20200114DataCleanup extends AbstractMigration implements ContainerAwareInterface
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
        return $this->em->getRepository('AppBundle:'.$className)->findOneBy([$prop => $val]);
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
    public function up(Schema $schema)
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->em->getRepository('AppBundle:User')->findOneBy(['id' => 6]);
    
        $this->cleanupTaxaData();
        $this->cleanupSrcData();
        $this->fixLocationGeoJson();

        $this->em->flush();
        
        $this->addSql('ALTER TABLE geo_json DROP loc_name');
        $this->addSql('ALTER TABLE taxon CHANGE display_name display_name VARCHAR(255) NOT NULL');
    }

    private function cleanupTaxaData()
    {
        $ents = $this->getTaxonData();
        $this->mergeEntities($ents, 'Taxon');
        $this->addParentToArthropod();
    }

    private function addParentToArthropod()
    {
        $arth = $this->getEntity('Taxon', 4);
        $animalia = $this->getEntity('Taxon', 1);

        $arth->setParentTaxon($animalia);
        $this->persistEntity($arth);
    }

    private function cleanupSrcData()
    {
        $ents = $this->getSourceData();

        foreach ($ents as $type => $ids) {
            $this->mergeEntities($ids, 'Source');
        }

    }

    protected function mergeEntities($ents, $coreClass)
    {
        foreach ($ents as $rmvId => $addId) {
            $this->mergeData($rmvId, $addId, $coreClass);
        }

    }
    protected function mergeData($rmvId, $addId, $coreClass)
    {                                                                           print("\n mergeData remove = ".$rmvId." addDataTo = ".$addId);
        $rmv = $this->getEntity($coreClass, $rmvId);                            

        if ($addId) { $this->transferData($coreClass, $addId, $rmv); }
        
        $this->persistEntity($rmv);
        $this->em->remove($rmv);
    }

    private function transferData($coreClass, $addId, $rmv)
    {
        $add = $this->getEntity($coreClass, $addId);
        // $this->mergeMiscData($rmv, $add); 
        $this->transferChildren($rmv, $add, $coreClass);
        $this->transferInts($rmv, $add, $coreClass);
        $this->persistEntity($add);
    }

    private function mergeMiscData(&$rmv, &$add)
    {
    }

    private function transferChildren($oldPrnt, $newPrnt, $entity)
    {
        $map = [
            'Location' => [ 'ChildLocs', 'ParentLoc' ],
            'Source' =>   [ 'ChildSources', 'ParentSource' ],
            'Taxon' =>    [ 'ChildTaxa', 'ParentTaxon' ]
        ];
        $getFunc = 'get'.$map[$entity][0];
        $setFunc = 'set'.$map[$entity][1];
        $children = $oldPrnt->$getFunc();
        if (!count($children)) { return; }                                      print("\nCHILDREN FOUND = ".count($children));
        
        foreach ($children as $child) {
            $child->$setFunc($newPrnt);
            $this->persistEntity($child);
        }
    }

    private function transferInts($rmv, $add, $coreClass)
    {
        if (!$add) { return; }

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
        return $taxon->serializeRealm()['displayName'] === 'Bat' ? 'Subject' : 'Object';
    }

    private function getTaxonData()
    {
        return [ // remove => stay
            2846 => 49, 2848 => 246, 2821 => null, 2842 => null, 315 => null, 
            1798 => null, 1885 => null, 2866 => null, 2949 => null, 2927 => null, 
            2936 => null, 2333 => null, 2332 => null, 1750 => null, 2842 => null, 
            2843 => null, 2721 => null, 2505 => null, 2937 => null, 2822 => null
        ];
    }

    private function getSourceData()
    {
        return [
            'Author' => [ 1767 => null, 1766 => null, 1768 => null ],
            'Citation' => [ 1769 => null, 1779 => null ]
        ];
    }
    private function fixLocationGeoJson()
    {
        $frenchGuiana = $this->getEntity('GeoJson', 1);
        $frenchGuiana->setDisplayPoint('[-53.1258,3.9339]');
        $frenchGuiana->setCoordinates($this->getFrenchGuianaGeoJson());
        $frenchGuiana->setType('Polygon');
        $this->persistEntity($frenchGuiana);
    }

    private function getFrenchGuianaGeoJson()
    {
        return preg_replace('/\s*/m', '', '[
           [
            [
             -52.556425,
             2.504705
            ],
            [
             -52.939657,
             2.124858
            ],
            [
             -53.418465,
             2.053389
            ],
            [
             -53.554839,
             2.334897
            ],
            [
             -53.778521,
             2.376703
            ],
            [
             -54.088063,
             2.105557
            ],
            [
             -54.524754,
             2.311849
            ],
            [
             -54.27123,
             2.738748
            ],
            [
             -54.184284,
             3.194172
            ],
            [
             -54.011504,
             3.62257
            ],
            [
             -54.399542,
             4.212611
            ],
            [
             -54.478633,
             4.896756
            ],
            [
             -53.958045,
             5.756548
            ],
            [
             -53.618453,
             5.646529
            ],
            [
             -52.882141,
             5.409851
            ],
            [
             -51.823343,
             4.565768
            ],
            [
             -51.657797,
             4.156232
            ],
            [
             -52.249338,
             3.241094
            ],
            [
             -52.556425,
             2.504705
            ]
           ]
          ]');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
