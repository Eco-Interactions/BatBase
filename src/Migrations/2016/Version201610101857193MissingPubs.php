<?php

namespace Application\Migrations;

use App\Entity\Contribution;
use App\Entity\Publication;
use App\Entity\Source;
use Doctrine\Migrations\AbstractMigration;

use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
// use App\Entity\SourceType;
use Symfony\Component\DependencyInjection\ContainerInterface;

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
    public function up(Schema $schema):void
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
        $newEntities = [ 25 => ["source" => [ "publisher" => [null, null, null, null, "Kluwer Academic Publishers"]]
            ], 31 => [ "source" => [ "publisher" => [null, null, null, null, "University of Paris VI", "University of Paris VI (Pierre and Marie Curie University)"]]
            ], 33 => [  
                    "publication" => [ "Ciência e Cultura", "Ciencia e Cultura", "Journal"],   
                    "source" => [   "publication" => [ null, "10.18316/2236-6377.15.0", null, "http://cienciaecultura.bvs.br/scielo.php?script=sci_serial&pid=0009-6725&lng=pt&nrm=iso", null]]
            ], 49 => [ 
                    "publication" => [ "Revista de la Facultad de Agronomía de la Universidad del Zulia", null, "Journal"],  
                    "source" => ["publication" => [ null, null, "Universidad del Zulia"],
                                    "publisher" => [null, null, null, null, "Universidad del Zulia"]]
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
            ], 98 => [ 
                    "publication" => [ "Brittonia", null, "Journal"],  
                    "source" => ["publication" => [null, null, "New York Botanical Garden Press", "http://link.springer.com/journal/12228"],
                                    "publisher" => [null,null,null,null,"New York Botanical Garden Press"]]
            ], 105 => [ 
                    "publication" => [ "American Naturalist", null, "Journal"],  
                    "source" => ["publication" => [null, null, "The University of Chicago Press"]]
            ], 106 => [ 
                    "publication" => [ "Boletim do Museu Paraense Para Emilio Goeldi de História Natural e Ethnographia", "Boletin de Museu Goeldi", "Journal"],  
                    "source" => ["publication" => [null]]
            ], 114 => [ 
                    "publication" => [ "Atas do Simposio sobre a Biota Amazonica", null, "Journal"],  
                    "source" => ["publication" => [null, null, "Sociedade Brasileira de Zoologia", "http://www.sbzoologia.org.br/revista-zoologia.html"],
                                    "publisher" => [null,null,null,"http://www.sbzoologia.org.br/", "Sociedade Brasileira de Zoologia"]]
            ], 116 => [ 
                    "publication" => [ "Journal of Biogeography", null, "Journal"],  
                    "source" => ["publication" => [null, null, null, "http://onlinelibrary.wiley.com/journal/10.1111/(ISSN)1365-2699"]]
            ], 135 => [ 
                    "publication" => [ "Mammalian Biology", null, "Journal"],  
                    "source" => ["publication" => [null, null, null, "http://www.journals.elsevier.com/mammalian-biology"],
                                 "publisher" => [null,null,null,null,"Urban & Fischerr"]] //name, url, parent
            ], 172 => [ 
                    "publication" => [ "Turrialba", null, "Journal"],  
                    "source" => ["publication" => [null]]
            ], 180 => [ 
                    "publication" => [ "Boletim do Museu de Biologia Mello Leitão", "Boletim do Museu de Biologia 'Prof. Mello-Leitao'", "Journal"],  
                    "source" => ["publication" => [null, null, "Sociedade Brasileira de Zoologia"]]
            ], 191 => [ 
                    "publication" => [ "Revista Brasileira de Biologia", "Zoologia, Journal of the Sociedade Brasileira de Zoologia", "Journal"],  
                    "source" => ["publication" => [null, null, "Instituto Internacional de Ecologia"],
                                    "publisher" => [null,null,null,null,"Instituto Internacional de Ecologia"]]
            ], 198 => [ 
                    "publication" => [ "Biological Reviews", null, "Journal"],  
                    "source" => ["publication" => [null, null, "Cambridge Philosophical Society, Wiley"],
                                    "publisher" => [null,null,null,null,"Cambridge Philosophical Society, Wiley"]]
            ], 202 => [ "source" => ["publisher" => [null,null,null,null,"The University of Arizona Press"]]
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
            ], 227 => [ 
                    "publication" => [ "Acta Botanica Neerlandica", null, "Journal"],  
                    "source" => ["publication" => [null]]
            ], 233 => [ 
                    "publication" => [ "Österreichische Botanische Zeitschrift", "Osterreichische Botanische Zeitschrift", "Journal"],  
                    "source" => ["publication" => [null, null, "Springer", "https://www.jstor.org/journal/ostebotazeit"],
                                    "publisher" => [null,null,null,"http://www.springer.com/us/","Springer"]]
            ], 238 => [ 
                    "publication" => [ "The American Midland Naturalist", null, "Journal"],  
                    "source" => ["publication" => [null, null, "University of Notre Dame", "https://www3.nd.edu/~ammidnat/"],
                                    "publisher" => [null,null,null,null,"University of Notre Dame"]]
            ], 256 => [ "source" => ["publisher" => [null,null,null,null,"Plenum Press"]]]
        ];

        foreach ($newEntities as $citId => $newEntData) {
            $pubEntity = null;
            $srcEntities = [];
            
            foreach ($newEntData as $entityName => $subAry) {  
                if ($entityName === "publication") {                            print("\nNew Publication ->". $entityName);
                    $pubEntity = $this->addPub($subAry, $em);
                    continue;
                } 
                if (array_key_exists("publisher", $subAry)) {                   print("\nNew Source Publisher");
                    $this->addSrcEntity("publisher", $subAry["publisher"], $pubEntity, $em);
                } 
                if (array_key_exists("publication", $subAry)) {                 print("\nNew Source publication");
                    $this->addSrcEntity("publication", $subAry["publication"], $pubEntity, $em);
                }               
            }
        }
    }
    private function addPub($pubVals, &$em) {                                   print("\n    add pub ->". $pubVals[0]);
        $pubEntity = new Publication();
        $pubEntity->setCreatedBy($em->getRepository('App:User')
            ->findOneBy(array('id' => '6'))); 

        $pubEntity->setDisplayName($pubVals[0]);
        $pubEntity->setDescription($pubVals[1]);
        $pubEntity->setPublicationType($em->getRepository("App:PublicationType")
            ->findOneBy(array("displayName" => $pubVals[2])));

        $em->persist($pubEntity);
        return $pubEntity;
    }
    private function addParentSource($parentName, &$srcEntity, $em) {           print("\n    addParentSource ->". $parentName);
        if ($parentName !== null) {  
            $parentSrc = $em->getRepository("App:Source")
                ->findOneBy(array('displayName' => $parentName));
            $srcEntity->setParentSource($parentSrc);
        }
    }
    private function addContributor($authors, &$srcEntity, &$em) {              print("    addContributor ->");
        foreach ($authors as $authId) {
            $contribEntity = new Contribution();
            $author = $em->getRepository('App:Author')
                ->findOneBy(array('id' => $authId));

            $contribEntity->setAuthorSource($author->getSource());
            $contribEntity->setWorkSource($srcEntity);
            $contribEntity->setCreatedBy($em->getRepository('App:User')
                ->findOneBy(array('id' => '6'))); 

            $em->persist($contribEntity);
        }
    }
    private function addSrcEntity($sourceType, $valAry, &$pubEntity, &$em) {       
        $srcFields = ["Year", "Doi", "ParentSource", "LinkUrl", "DisplayName","Description", "Author"];

        $srcEntity = new Source();
        $srcEntity->setCreatedBy($em->getRepository('App:User')
            ->findOneBy(array('id' => '6')));         
        /** Adds values from the pubEntity that I didn't want to copy into the pub's source array. */
        if ($sourceType === "publication") {
            $srcEntity->setDisplayName($pubEntity->getDisplayName());
            $srcEntity->setDescription($pubEntity->getDescription());
            $srcEntity->setSourceType($em->getRepository("App:SourceType")
                ->findOneBy(array('id' => 2)));
            $pubEntity->setSource($srcEntity);
            $em->persist($pubEntity);
        } else { //Publisher
            $srcEntity->setSourceType($em->getRepository("App:SourceType")
                ->findOneBy(array('id' => 1)));
        }
        for ($i=0; $i < count($valAry); $i++) {                                 print("\n  field = ".$srcFields[$i]." val = ". $valAry[$i]);
            if ($i === 2 && $valAry[$i] !== null) { $this->addParentSource($valAry[$i], $srcEntity, $em); 
            } else if ($i === 6) { $this->addContributor($valAry[$i], $srcEntity, $em); 
            } else if ($valAry[$i] !== null) {                                  print("\n    setting->". $srcFields[$i]);
                $setField = "set". $srcFields[$i];
                $srcEntity->$setField($valAry[$i]);
            }
        }
        $em->persist($srcEntity);
        $em->persist($pubEntity);
        $em->flush();
    }
        /**
     * @param Schema $schema
     */
    public function down(Schema $schema):void
    {

    }
}
