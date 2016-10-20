<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

use AppBundle\Entity\Author;
use AppBundle\Entity\Contribution;
use AppBundle\Entity\Publication;
use AppBundle\Entity\SourceType;
use AppBundle\Entity\Source;

/**
 * @up Creates a new "Source" entity for every publication or publisher found while 
 * filling in a publication for each citation in the original db. 
 */
class Version201610101857193MissingPubs extends AbstractMigration implements ContainerAwareInterface
{

    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }


    /**
     * NOTE: There is awkwardness through the code because I built the object as I went through the 
     * data and restructuring it into the best format would've been too much effort.
     * 
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

     
        /* Object with missing pub/publisher data in the citations without publication. The format is:
         *     citId ==> [ publication => ["displayName", "description", pubType],
         *                 source => [  
         *                     publication => [Year, doi, parentSourceDisplayName, url, displayName, description, authorAry],
         *                     publisher => [^same^]
         *                     ]
         *                ]
         */
        $newEntities = [ 25 => ["publication" => [ "Nouragues",  "Nouragues. Dynamics and plant-animal interactions in a Neotropical rainforest", "Book"],                                               //year, doi, parentSrc, linkUrl  
                                "source" => [   "publication" => ["2001", "10.1007/978-94-015-9821-7", "Kluwer Academic Publishers"],
                                                "publisher" => [null, null, null, null, "Kluwer Academic Publishers"]]
            ], 33 => [  
                    "publication" => [ "Ciência e Cultura", null, "Journal"],   
                    "source" => [   "publication" => [ null, "10.18316/2236-6377.15.0", null, "http://cienciaecultura.bvs.br/scielo.php?script=sci_serial&pid=0009-6725&lng=pt&nrm=iso", null]]
            ], 35 => [ 
                    "publication" => ["Mammals of the Mexican state of San Luis Potosi", null, "Book"],
                    "source" => [ "publication" => [1953, null, "Louisiana State University Press", "https://babel.hathitrust.org/cgi/pt?id=uc1.31822011936077;view=1up;seq=10", null, null, 
                                                    [79]],
                                  "publisher" => [null, null, null, "http://lsupress.org/", "Louisiana State University Press"]]
            ], 42 => [  
                    "publication" => [ "Blüten und fledermäuse. Blutenbestäubung durch fledermäuse und flughunde (chiropterophilie)", null, "Book"],  
                    "source" => [ "publication" => [ 1985, null, "Waldemar Kramer", null, null],
                                        "publisher" => [null, null, null, null,"Waldemar Kramer"]]              
            ], 40 => [  
                    "publication" => [ "Impacts des perturbations d'origine anthropique sur les peuplements de chauves-souris en Guyane Française", null, "Ph.D. Dissertation"],  
                    "source" => [  "publication" => [2004, null, "University of Paris VI", null, null],
                                    "publisher" => [null, null, null, null, "University of Paris VI", "University of Paris VI (Pierre and Marie Curie University)"]]
            ], 31 => [ 
                    "publication" => [ "Modalités de dissemination et d'etablissement de lianes (Cyclanthaceae) et Philodendron) en forêt Guyanaise", null, "Ph.D. Dissertation"],  
                    "source" => ["publication" => [ 1997, null, "University of Paris VI"]]
            ], 49 => [ 
                    "publication" => [ "Revista de la Facultad de Agronomía de la Universidad del Zulia", null, "Journal"],  
                    "source" => ["publication" => [ null, null, "Universidad del Zulia"],
                                    "publisher" => [null, null, null, null, "Universidad del Zulia"]]
            ], 63 => [ 
                    "publication" => [ "The short-tailed fruit bat", null, "Book"],  
                    "source" => ["publication" => [ 1988, null, null, "The University of Chicago Press"]]            
            ], 65 => [ 
                    "publication" => [ "American Scientist", null, "Journal"],  
                    "source" => ["publication" => [ null, null, null, "http://www.americanscientist.org/"]]            
            ], 70 => [ 
                    "publication" => [ "Annals of the Missouri Botanical Garden", null, "Journal"],  
                    "source" => ["publication" => [ null, null, "Missouri Botanical Garden Press"],
                                        "publisher" => [null,null,null,null,"Missouri Botanical Garden Press"]]
            ], 92 => [ 
                    "publication" => [ "Comparative Biochemistry and Physiology", null, "Journal"],  
                    "source" => ["publication" => [null]]
            ], 96 => [ 
                    "publication" => [ "Bats. A natural history", null, "Book"],  
                    "source" => ["publication" => [null, null, "British Museum (Natural History)"],
                                        "publisher" => [null,null,null,null,"British Museum (Natural History)"]]
            ], 98 => [ 
                    "publication" => [ "Brittonia", null, "Journal"],  
                    "source" => ["publication" => [null, null, "New York Botanical Garden Press", "http://link.springer.com/journal/12228"],
                                    "publisher" => [null,null,null,null,"New York Botanical Garden Press"]]
            ], 105 => [ 
                    "publication" => [ "American Naturalist", null, "Journal"],  
                    "source" => ["publication" => [null, null, "The University of Chicago Press"]]
            ], 106 => [ 
                    "publication" => [ "Boletin de Museu Goeldi", null, "Journal"],  
                    "source" => ["publication" => [null]]
            ], 114 => [ 
                    "publication" => [ "Zoologia", null, "Journal"],  
                    "source" => ["publication" => [null, null, "Sociedade Brasileira de Zoologia", "http://www.sbzoologia.org.br/revista-zoologia.html"],
                                    "publisher" => [null,null,null,"http://www.sbzoologia.org.br/", "Sociedade Brasileira de Zoologia"]]
            ], 116 => [ 
                    "publication" => [ "Journal of Biogeography", null, "Journal"],  
                    "source" => ["publication" => [null, null, null, "http://onlinelibrary.wiley.com/journal/10.1111/(ISSN)1365-2699"]]
            ], 135 => [ 
                    "publication" => [ "Mammalian Biology", null, "Journal"],  
                    "source" => ["publication" => [null, null, null, "http://www.journals.elsevier.com/mammalian-biology"],
                                 "publisher" => [null,null,null,null,"Urban & Fischerr"]] //name, url, parent
            ], 164 => [ 
                    "publication" => [ "Investigaciones sobre la regeneración de selvas altas en Veracruz, México", null, "Book"],  
                    "source" => ["publication" => [1985, null, "Instituto Nacional de Investigaciones Sobre Recursos Bióticos", "https://www.researchgate.net/publication/44443198_Investigaciones_sobre_la_regeneracion_de_selvas_altas_en_Veracruz_Mexico_por_A_Gomez-Pompa_C_Vazquez_Yanes_A_Butanda_Cervera_y_otros", null, null, 
                                                    [["Arturo Gómez-Pompa", "Gómez-Pompa"], ["Silvia del Amo R.", "del Amo R."]]],
                                "publisher" => [null,null,null,null,"Instituto Nacional de Investigaciones Sobre Recursos Bióticos"]]
            ], 172 => [ 
                    "publication" => [ "Turrialba", null, "Journal"],  
                    "source" => ["publication" => [null ]]
            ], 191 => [ 
                    "publication" => [ "Revista Brasileira de Biologia", null, "Journal"],  
                    "source" => ["publication" => [null, null, "Instituto Internacional de Ecologia"],
                                    "publisher" => [null,null,null,null,"Instituto Internacional de Ecologia"]]
            ], 198 => [ 
                    "publication" => [ "Biological Reviews", null, "Journal"],  
                    "source" => ["publication" => [null, null, "Cambridge Philosophical Society, Wiley"],
                                    "publisher" => [null,null,null,null,"Cambridge Philosophical Society, Wiley"]]
            ], 201 => [ 
                    "publication" => [ "Los murciélagos de Cuba", null, "Book"],  
                    "source" => ["publication" => [null, null, "Editorial Academia", "https://www.scribd.com/doc/131312963/Los-Murcielagos-de-Cuba"],
                                    "publisher" => [null,null,null,null,"Editorial Academia"]]
            ], 202 => [ 
                    "publication" => [ "Columnar Cacti and Their Mutualists", "Columnar Cacti and Their Mutualists. Evolution, Ecology, and Conservation.", "Book"],  
                    "source" => ["publication" => [ 2002, null, "The University of Arizona Press", null, null, null, [ 111, 357 ]],
                                    "publisher" => [null,null,null,null,"The University of Arizona Press"]]
            ], 207 => [ 
                    "publication" => [ "Contributions in Science", null, "Journal"],  
                    "source" => ["publication" => [null, null, "Los Angeles County Museum", "http://www.nhm.org/site/research-collections/research-tools/publications"],
                                    "publisher" => [null,null,null,null,"Los Angeles County Museum"]]
            ], 209 => [ 
                    "publication" => [ "Systematic Botany", null, "Journal"],  
                    "source" => ["publication" => [null, null, "American Society of Plant Taxonomists"],
                                    "publisher" => [null,null,null,null,"American Society of Plant Taxonomists"]]
            ], 211 => [ 
                    "publication" => [ "Revista Mexicana de Mastozoologia", null, "Journal"],  
                    "source" => ["publication" => [null]]
            ], 225 => [ 
                    "publication" => [ "Journal of Arid Environments", null, "Journal"],  
                    "source" => ["publication" => [null, null, "Elsevier", "http://www.journals.elsevier.com/journal-of-arid-environments"],
                                    "publisher" => [null,null,null,"https://www.elsevier.com/","Elsevier"]]
            ], 230 => ["source" => ["publisher" => [null,null,null,null,"University of Kansas Natural History Museum"]]
            ], 233 => [ 
                    "publication" => [ "Österreichische Botanische Zeitschrift", null, "Journal"],  
                    "source" => ["publication" => [null, null, "Springer", "https://www.jstor.org/journal/ostebotazeit"],
                                    "publisher" => [null,null,null,"http://www.springer.com/us/","Springer"]]
            ], 238 => [ 
                    "publication" => [ "The American Midland Naturalist", null, "Journal"],  
                    "source" => ["publication" => [null, null, "University of Notre Dame", "https://www3.nd.edu/~ammidnat/"],
                                    "publisher" => [null,null,null,null,"University of Notre Dame"]]
            ], 243 => [ 
                    "publication" => [ "Manu. The biodiversity of southeastern Peru.", null, "Book"],  
                    "source" => ["publication" => [null, null, "Editorial Horizonte"],
                                    "publisher" => [null,null,null,null,"Editorial Horizonte"]]
            ], 256 => [ 
                    "publication" => [ "Ecology of Bats", null, "Book"],  
                    "source" => ["publication" => [null, null, "Plenum Press", null, null, null, [197]],
                                    "publisher" => [null,null,null,null,"Plenum Press"]]                    
            ]
        ];

        foreach ($newEntities as $citId => $newEntData) {
            $pubEntity = null;
            $srcEntities = [];
            
            foreach ($newEntData as $entityName => $subAry) {  
                if ($entityName === "publication") {                           //print("\nNew Publication ->". $entityName);
                    $pubEntity = $this->addPub($subAry, $em);
                    continue;
                } 
                if (array_key_exists("publisher", $subAry)) {                  //print("\nNew Source Publisher");
                    $this->addSrcEntity("publisher", $subAry["publisher"], $pubEntity, $em);
                } 
                if (array_key_exists("publication", $subAry)) {                //print("\nNew Source publication");
                    $this->addSrcEntity("publication", $subAry["publication"], $pubEntity, $em);
                }               
            }
        }
    }
    private function addPub($pubVals, &$em) {                                  //print("\n    add pub ->". $pubVals[0]);
        $pubEntity = new Publication();
        $pubEntity->setCreatedBy($em->getRepository('AppBundle:User')
            ->findOneBy(array('id' => '6'))); 

        $pubEntity->setDisplayName($pubVals[0]);
        $pubEntity->setDescription($pubVals[1]);
        $pubEntity->setPublicationType($em->getRepository("AppBundle:PublicationType")
            ->findOneBy(array("displayName" => $pubVals[2])));

        $em->persist($pubEntity);
        return $pubEntity;
    }
    private function addParentSource($parentName, &$srcEntity, $em) {          //print("\n    addParentSource ->". $parentName);
        if ($parentName !== null) {  
            $parentSrc = $em->getRepository("AppBundle:Source")
                ->findOneBy(array('displayName' => $parentName));
            $srcEntity->setParentSource($parentSrc);
        }
    }
    private function addContributor($authors, &$srcEntity, &$em) {             //print("    addContributor ->");
        foreach ($authors as $authId) {
            if (is_int($authId)) {
                $contribEntity = new Contribution();
                $author = $em->getRepository('AppBundle:Author')
                    ->findOneBy(array('id' => $authId));

                $contribEntity->setAuthorSource($author->getSource());
                $contribEntity->setWorkSource($srcEntity);
                $contribEntity->setCreatedBy($em->getRepository('AppBundle:User')
                    ->findOneBy(array('id' => '6'))); 

                $em->persist($contribEntity);
            } else {
                $this->createAuthor($authId, $srcEntity, $em);
            }
        }
    }
    private function createAuthor($authAry, &$wrkSrcEntity, &$em)              
    {                                                                           //print("    --Adding new author---\n");
        $authSrc = new Source();
        $authSrc->setDisplayName($authAry[1]);
        $authSrc->setDescription($authAry[0]);
        $authSrc->setSourceType($em->getRepository('AppBundle:SourceType')
            ->findOneBy(array('id'=> 4)));  

        $authEntity = new Author();
        $authEntity->setFullName($authAry[0]);
        $authEntity->setDisplayName($authAry[1]);
        $authEntity->setLastName($authAry[1]);
        $authEntity->setSource($authSrc);
        $authEntity->setCreatedBy($em->getRepository('AppBundle:User')
            ->findOneBy(array('id' => '6'))); 

        $contribEntity = new Contribution();
        $contribEntity->setAuthorSource($authSrc);
        $contribEntity->setWorkSource($wrkSrcEntity);
        $contribEntity->setCreatedBy($em->getRepository('AppBundle:User')
            ->findOneBy(array('id' => '6'))); 

        $em->persist($authSrc);
        $em->persist($authEntity);
        $em->persist($contribEntity);
    }
    private function addSrcEntity($sourceType, $valAry, &$pubEntity, &$em) {       
        $srcFields = ["Year", "Doi", "ParentSource", "LinkUrl", "DisplayName","Description", "Author"];

        $srcEntity = new Source();
        $srcEntity->setCreatedBy($em->getRepository('AppBundle:User')
            ->findOneBy(array('id' => '6')));         
        /** Adds values from the pubEntity that I didn't want to copy into the pub's source array. */
        if ($sourceType === "publication") {
            $srcEntity->setDisplayName($pubEntity->getDisplayName());
            $srcEntity->setDescription($pubEntity->getDescription());
            $srcEntity->setSourceType($em->getRepository("AppBundle:SourceType")
                ->findOneBy(array('id' => 3)));
            $pubEntity->setSource($srcEntity);
            $em->persist($pubEntity);
        } else { //Publisher
            $srcEntity->setSourceType($em->getRepository("AppBundle:SourceType")
                ->findOneBy(array('id' => 1)));
        }
        for ($i=0; $i < count($valAry); $i++) {                                 //print("\n  field = ".$srcFields[$i]." val = ". $valAry[$i]);
            if ($i === 2 && $valAry[$i] !== null) { $this->addParentSource($valAry[$i], $srcEntity, $em); 
            } else if ($i === 6) { $this->addContributor($valAry[$i], $srcEntity, $em); 
            } else if ($valAry[$i] !== null) {                                  //print("\n    setting->". $srcFields[$i]);
                $setField = "set". $srcFields[$i];
                $srcEntity->$setField($valAry[$i]);
            }
        }
        $em->persist($srcEntity);
        $em->flush();
    }
        /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {

    }
}
