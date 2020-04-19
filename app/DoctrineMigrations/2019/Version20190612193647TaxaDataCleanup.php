<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Cleans up duplicate taxa created unintentionally. 
 * Note: The 'updatedBy' admin is hardcoded to 6, Sarah.
 */
class Version20190612193647TaxaDataCleanup extends AbstractMigration implements ContainerAwareInterface
{
    private $container;
    private $em;
    private $admin;

    private $delete_count = 0;

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
        
        $this->identifyAndRemoveDuplicates();                                   print('deleted - '.$this->delete_count."\n");
        $this->em->flush();

        $this->getRemainingDuplicates();
        //remove appended numbers from remaining taxa
    }
    /** 
     * Most duplicate Taxa were created when a parent taxon was changed due to 
     * the UI design , only children of a selected taxa were loaded in the levels below. 
     * Others from a lack of intelligence behind ensuring the name didn't already exist.
     */
    private function identifyAndRemoveDuplicates()
    {
        // $dups = $this->getAllTaxaWithDuplicatedDisplayNames();                  print('dups = '.count($dups)); print("\n");
        // $hasInts = $this->removeDupsWithNoInteractions($dups);                  print("\nafter blanks are removed = ".count($hasInts)); print("\n");
        
        // $this->mergeDupsWithParentChanges($this->getTaxaToMerge('prntChngs'));
        $this->mergeSimpleDups($this->getTaxaToMerge('simple'));
    }
    private function mergeDupsWithParentChanges($taxa)
    {
        foreach ($taxa as $stay => $remove) {                                   //print("\nNew Merge\n");
            $sty = $this->getEntity('Taxon', $stay);  
            $rmv = $this->getEntity('Taxon', $remove);  if($rmv == null){ print('null taxon = '.$remove."\n"); continue; }

            $this->moveChildrenAndInteractions($sty, $rmv);
            $this->updateParent($sty, $rmv);

            $this->persistEntity($sty);
            $this->removeTaxon($rmv, 'parent changes');
        }
    }
    private function updateParent($sty, $rmv)
    {  
        $parent = $rmv->getParentTaxon();
        $sty->setParentTaxon($parent);
        $rmv->setParentTaxon(null);
        $this->persistEntity($sty);
        $this->persistEntity($parent);
        $this->em->flush();
        if ($rmv->getParentTaxon() != null) { print("     taxon still has parent"); }
        // } else { print("----------------------------------------------------\n"); }
    }
    private function mergeSimpleDups($taxa)
    {
        foreach ($taxa as $stay => $remove) {                                   //print("\nNew Merge\n");
            $sty = $this->getEntity('Taxon', $stay);

            if (gettype($remove) === 'array') {
                $this->moveInteractionsFromSet($sty, $remove);
            } else {
                $rmv = $this->getEntity('Taxon', $remove);
                $rmv->setParentTaxon(null);
                $this->moveChildrenAndInteractions($sty, $rmv);
                $this->removeTaxon($rmv, 'single simple dup');
            }
            $this->persistEntity($sty);
        }
    }
    private function moveInteractionsFromSet($sty, $remove)
    {
        foreach ($remove as $rmvId) {
            $rmv = $this->getEntity('Taxon', $rmvId);      
            $rmv->setParentTaxon(null);
            $this->moveChildrenAndInteractions($sty, $rmv);
            $this->removeTaxon($rmv, 'single from simple set');
        }
    }
    /** ------------ SHARED ------------------------- */
    /** 
     * Used for the initial cleanup.
     * $map = [
            'prntChngs' => [ 918 => 1738, 797 => 1776, 1092 => 1777, 814 => 1781, 
                1370 => 1791, 314 => 1796, 881 => 1809, 943 => 1843 ],
            'simple' => [ 948 => 1797,  1821 => 1823, 1825 => 1827,  1867 => [1868, 1869, 1870], 
                905 => 1907, 1930 => 1928, 1946 => 1951, 1986 => 1988, 953 => 2000, 965 => 2001, 
                919 => 2007, 1694 => [2008, 2662, 2666], 885 => 2017, 961 => 2025, 2024 => 2027, 
                882 => 2035, 979 => 2056, 1956 => [2058, 2057], 969 => 2068, 1753 => 2071, 
                2093 => 2091, 1965 => 1963, 1741 => 2113, 1735 => [2114, 2315], 2149 => 2146, 
                2150 => 2147, 972 => [2157, 2055], 2223 => 2221, 2247 => 2245, 476 => 2249, 
                477 => 2250, 2260 => 2258, 83 => [2265, 1771], 2211 => 2285, 2294 => 2292, 978 => 2304, 
                945 => 2309, 1685 => 2311, 2337 => [2339, 2338], 1767 => 1765, 314 => 1806,
                1826 => 1824, 1845 => 1844, 918 => 1847, 1851 => 1848, 1852 => 1849, 
                175 => [1853, 1854], 1871 => 1877, 1872 => [1879, 1878], 1880 => 1881, 
                1835 => [1904, 1906], 1987 => 1985, 1992 => 1991, 2047 => 2046, 
                1969 => 2066, 1466 => 2099, 98 => 2122, 485 => [2208, 2206], 2225 => 1146, 
                2298 => 2299, 2252 => 2405, 2227 => 2414, 2446 => 2444, 1580 => [2462, 2466, 2467], 
                1696 => 2471, 2211 => 2475, 916 => 2478, 2486 => 2484, 2209 => 2207, 499 => 2172, 82 => 1770, 88 => 1762]
        ];
     */
    private function getTaxaToMerge($type)
    {               // taxon to keep => to merge and remove
        $map = [
            'prntChngs' => [ ],
            'simple' => [ 870 => 2274, 869 => 2273, 2211 => [ 2510, 2285 ], 964 => 2532, 
                2572 => 2006, 2583 => 2584, 99 => 2601, 1001 => 2660, 2587 => 2674,
                1872 => 2686, 2669 => [ 2728, 2724 ], 2670 => [ 2729, 2725 ], 467 => 2602,
                316 => 2568, 871 => 2275
            ]
        ];
        return $map[$type];
    }
    private function getEntity($type, $id)
    {
        return $this->em->getRepository('AppBundle:'.$type)->findOneBy(['id' => $id ]);

    }
    private function moveChildrenAndInteractions($sty, $rmv)
    {
        if ($rmv === null) { print("\n----skipping\n");return; } //Simple duplicates could have been removed in a previous stage.
        $this->moveInteractions($sty, $rmv);
        $this->moveChildren($sty, $rmv);
    }
    private function moveInteractions($stay, $move)
    {
        $subj = $move->getSubjectRoles(); 
        $obj = $move->getObjectRoles();  
        $setFunc = count($subj) > 0 ? 'setSubject' : 'setObject';  
        $unsetFunc = count($subj) > 0 ? 'removeSubjectRole' : 'removeObjectRole'; 
        $ints = count($subj) > 0 ? $subj : (count($obj) > 0 ? $obj : null);  
        if (!$ints) { return; }

        foreach ($ints as $int) {
            $int->$setFunc($stay);
            $this->persistEntity($int);  
            $move->$unsetFunc($int);  
            $this->persistEntity($move);
        }
        $this->em->flush();
        if (count($move->getInteractions())) { print("        ##  taxon [".$move->getId()."] still has interactions\n"); }
        // } else { print("----------------------------------------------------\n"); }
    }

    private function moveChildren($stay, $move)
    {
        $children = $move->getChildTaxa();
        if (!count($children)) { return; }

        foreach ($children as $child) {
            $child->setParentTaxon($stay);
            $move->removeChildTaxa($child);
            $this->persistEntity($child);
            $this->persistEntity($move);
        }
        $this->em->flush();
        if (count($move->getChildTaxa())) { print("##  taxon still has children\n"); }
        // } else { print("----------------------------------------------------\n"); }
    }

    private function persistEntity($entity)
    {
        $entity->setUpdatedBy($this->admin);   
        $this->em->persist($entity);
    }

    private function removeTaxon($taxon, $stage)
    {
        $rmvId = $taxon->getId();
        $taxon->setUpdatedBy($this->admin);
        $this->em->remove($taxon);
        $this->em->flush();
        if ($this->getEntity('Taxon', $rmvId)) { print("    #####  taxon not deleted after ".$stage."\n"); } 
        // } else { print("        ----------------------------------------------------\n"); }
        ++$this->delete_count;
    }






    private function getRemainingDuplicates()
    {
        $dups = $this->getAllTaxaWithDuplicatedDisplayNames();
        $this->removeSingledDups($dups);  print('dups remaining = '.count($dups)."\n"); 
    }


    private function getAllTaxaWithDuplicatedDisplayNames()
    {
        $taxa = $this->em->getRepository('AppBundle:Taxon')->findAll();
        $dups = [];

        foreach ($taxa as $taxon) {
            $slug = $taxon->getSlug();
            if (preg_match('/\\d/', $slug) > 0) {
                array_push($dups, $taxon);
            }
        }

        return $dups;
    }
    // private function removeDupsWithNoInteractions($taxa)
    // {
    //     $remove = $this->getTaxaToRemove($taxa);

    //     foreach ($remove as $taxon) {
    //         $this->em->remove($taxon);
    //     }                                                   print("\n--- removing ".count($remove));

    //     $this->em->flush();
    //     return array_values($taxa);
    // }

    // private function getTaxaToRemove(&$taxa)
    // {
    //     $remove = [];

    //     for ($i=0; $i < count($taxa); $i++) { 
    //         $ints = $taxa[$i]->getInteractions(); 

    //         if (count($ints) == 0) {
    //             array_push($remove, $taxa[$i]);
    //             unset($taxa[$i]);
    //         }
    //     } 
    //     return $remove;
    // }

    private function removeSingledDups(&$taxa)
    {    //print(count($taxa)." to check for duplicates\n");
        $done = 0;
        $cnt = count($taxa);
        for ($i=0; $i < $cnt; $i++) {  //print("\n$i");
            $cleared = $this->clearIfNoLongerDupped($taxa[$i]);
            if ($cleared) {
                unset($taxa[$i]);
                ++$done;
            }
        }                                                                       //print("  Taxa no longer duplicated = ".$done."\n");
    }

    private function clearIfNoLongerDupped($taxon)
    { 
        $taxa = $this->em->getRepository('AppBundle:Taxon')->findBy(
            [ 'displayName' => $taxon->getDisplayName() ]);                     
        if (count($taxa) === 1) { return true; }                                //print("\n   Matching taxa to merge = ".count($taxa));

        print("\n".$taxon->getId().', ');

        foreach ($taxa as $dup) {  
            if ($dup->getId() == $taxon->getId()) { return; }
            print($dup->getId().' ');
        }
    }


    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
