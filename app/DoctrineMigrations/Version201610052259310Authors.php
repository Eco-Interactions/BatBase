<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use AppBundle\Entity\SourceType;
use AppBundle\Entity\Source;

/**
 * @up Creates a new "Source" entity for each author.
 */
class Version201610052259310Authors extends AbstractMigration implements ContainerAwareInterface
{

    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * Creates a new "Source" entity for each author. 
     * 
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');
        $authors = $em->getRepository('AppBundle:Author')->findAll();

        foreach ($authors as $authEntity) { 
            $this->buildSourceEntity($authEntity, $em); 
        }
    }
    private function buildSourceEntity($authEntity, $em)
    {
        $srcEntity = new Source();                                 
        $srcEntity->setDisplayName($authEntity->getShortName());  
        $srcEntity->setDescription($authEntity->getFullName());
        $srcEntity->setSourceType($em->getRepository('AppBundle:SourceType')
            ->findOneBy(array('id'=> 4)));  
        $srcEntity->setCreatedBy($em->getRepository('AppBundle:User')
            ->findOneBy(array('id' => '6'))); 

        $authEntity->setSource($srcEntity);
        $authEntity->setUpdatedBy($em->getRepository('AppBundle:User')
            ->findOneBy(array('id' => '6'))); 

        $em->persist($srcEntity); 
        $em->persist($authEntity); 

        $em->flush();    
    }


    // Use an index 'for' loop to get at the source field lists.
    // NewEntities = [ publication => ["displayName", "fullName", pubType],
    //                 source => [  
    //                      publication => [Year, doi, parentSource, url, displayName, description, authors],
    //                      publisher => [""],
    //                      author => [""]
    //                 ]
    // ]

//List of publications already added that are actually publishers:: [33, ]

    /**
     * Creates new entities for every publication found while filling in the publication
     * for each citation in the original db. 
     * 
     * @param Schema $schema
     */
    public function postUp(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $newEntities = [ 25 => ["publication" => [ "Nouragues",  "Nouragues. Dynamics and plant-animal interactions in a Neotropical rainforest", "Book"],                                               //year, doi, parentSrc, linkUrl  
                                "source" => [   "publication" => ["2001", "10.1007/978-94-015-9821-7", "Kluwer Academic Publishers"],
                                                "publisher" => [null, null, null, null, "Kluwer Academic Publishers"]]
            ], 33 => [  
                    "publication" => [ "Ciência e Cultura", null, "Journal"],   
                    "source" => [   "publication" => [ null, "10.18316/2236-6377.15.0", null, "http://cienciaecultura.bvs.br/scielo.php?script=sci_serial&pid=0009-6725&lng=pt&nrm=iso", null]]
            ], 35 => [ "source" => [ "publisher" => [null, null, null, "http://lsupress.org/", "Louisiana State University Press"]]
            ], 42 => [  
                    "publication" => [ "Blüten und fledermäuse. Blutenbestäubung durch fledermäuse und flughunde (chiropterophilie)", null, "Book"],  
                    "source" => [ "publication" => [ 1985, null, "Waldemar Kramer", null, null],
                                        "publisher" => [null, null, null, "http://www.verlagshaus-roemerweg.de/Waldemar_Kramer.html", "Waldemar Kramer"]]              
            ], 40 => [  
                    "publication" => [ "Impacts des perturbations d'origine anthropique sur les peuplements de chauves-souris en Guyane Française.", null, "Ph.D. Dissertation"],  
                    "source" => [  "publication" => [2004, null, "University of Paris VI", null, null],
                                    "publisher" => [null, null, null, null, "University of Paris IV", "University of Paris VI (Pierre and Marie Curie University)"]]
            ], 31 => [ 
                    "publication" => [ "Modalités de dissemination et d'etablissement de lianes (Cyclanthaceae) et Philodendron) en forêt Guyanaise", null, "Ph.D. Dissertation"],  
                    "source" => ["publication" => [ 1997, null, "University of Paris VI"]]
            ], 49 => [ 
                    "publication" => [ "Revista de la Facultad de Agronomía de la Universidad del Zulia", null, "Journal"],  
                    "source" => ["publication" => [ null, null, "Universidad del Zulia"],
                                    "publisher" => [null, null, null, null, "Universidad del Zulia"]]
            ], 65 => [ 
                    "publication" => [ "American Scientist", null, "Journal"],  
                    "source" => ["publication" => [ null, null, null, "http://www.americanscientist.org/"]]            
            ], 70 => [ 
                    "publication" => [ "Annals of the Missouri Botanical Garden", null, "Journal"],  
                    "source" => ["publication" => [ null, null, null, "Missouri Botanical Garden Press"],
                                        "publisher" => [null,null,null,null,"Missouri Botanical Garden Press"]]
            ], 92 => [ 
                    "publication" => [ "Comparative Biochemistry and Physiology", null, "Journal"],  
                    "source" => ["publication" => [null]]
            ], 96 => [ 
                    "publication" => [ "Bats. A natural history.", null, "Book"],  
                    "source" => ["publication" => [null, null, "British Museum (Natural History)"],
                                        "publisher" => [null,null,null,null,"British Museum (Natural History)"]]
            ], 98 => [ 
                    "publication" => [ "Brittonia", null, "Journal"],  
                    "source" => ["publication" => [null, null, "New York Botanical Garden Press", "http://link.springer.com/journal/12228"],
                                    "publisher" => [null,null,null,null,"New York Botanical Garden Press"]]
            ], 105 => [ 
                    "publication" => [ "American Naturalist", null, "Journal"],  
                    "source" => ["publication" => [null, null, 33]]
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
                    "source" => ["publication" => [ 2002, null, "The University of Arizona Press", null, "auth" => [ 111, 357 ]],
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
            ], 227 => [ 
                    "publication" => [ "Plant Biology", "Plant Biology (Acta Botanica Neerlandica)", "Journal"],  
                    "source" => ["publication" => [null, null, null, "http://onlinelibrary.wiley.com/journal/10.1111/(ISSN)1438-8677"]]
            ], 230 => ["source" => ["publisher" => [null,null,null,null,"University of Kansas Natural History Museum"]]
            ], 233 => [ 
                    "publication" => [ "Österreichische Botanische Zeitschrift", null, "Journal"],  
                    "source" => ["publication" => [null, null, "Springer", "https://www.jstor.org/journal/ostebotazeit"],
                                    "publisher" => ["Springer", "http://www.springer.com/us/"]]
            ], 238 => [ 
                    "publication" => [ "The American Midland Naturalist", null, "Journal"],  
                    "source" => ["publication" => [null, null, "University of Notre Dame", "https://www3.nd.edu/~ammidnat/"],
                                    "publisher" => ["University of Notre Dame"]]
            ], 243 => [ 
                    "publication" => [ "Manu. The biodiversity of southeastern Peru.", null, "Book"],  
                    "source" => ["publication" => [null, null, "Editorial Horizonte"],
                                    "publisher" => [null,null,null,null,"Editorial Horizonte"]]
            ], 256 => [ 
                    "publication" => [ "Ecology of Bats", null, "Book"],  
                    "source" => ["publication" => [null, null, "Plenum Press", null, "auth" => [197]],
                                    "publisher" => [null,null,null,null,"Plenum Press"]]                    
                ]
            ];
    /*-------------- Methods ---------------------------------------------*/
        $addPub = function($pubVals) use (&$em) {
            $pubFields = ["DisplayName", "FullName", "PubType"];    //-------------------------PUbtype rewrite
            $pubEntity = new Publication();

            $pubEntity->setDisplayName($pubVals[0]);
            $pubEntity->setFullName($pubVals[1]);
            $pubEntity->setPublicationType($em->getRepository("AppBundle:PublicationType")
                ->findOneBy(array("displayName" => $pubVals[2])));

            $em->persist($pubEntity);
            return $pubEntity;
        };
        $addParentSource = function($parentName, &$srcEntity) {
            $parentSrc = $em->getRepository("AppBundle:Source")
                ->findOneBy(array('displayName' => $parentName));
            $srcEntity->setParentSource($parentSrc);

        };
        $addContributor = function($authors, &$srcEntity) {
            foreach ($authors as $authId) {
                $author = $em->getRepository('AppBundle:Author')
                    ->findOneBy(array('id' => $authId));
                $srcEntity->addAuthor($author->getSource());
            }
        };
        $addSrcEntity = function($sourceType, $valAry, &$pubEntity) use (&$em) {
            $srcFields = ["Year", "Doi", "ParentSource", "DisplayName", "FullName", "Author"];
            $classPrefix = 'AppBundle/Entity';
            $srcEntity = new Source();
            /** Adds values from the pubEntity that I didn't want to copy into the source array. */
            if ($sourceType === "publication") {
                $srcEntity->$setDisplayName($pubEntity->getDisplayName());
                $srcEntity->$setDescription($pubEntity->getFullName());
                $srcEntity->$setPublication($pubEntity);
                $srcEntity->setSourceType($em->getRepository("AppBundle:Source")
                    ->findOneBy(array('id' => 3)));
            } else { //Publisher
                $srcEntity->setSourceType($em->getRepository("AppBundle:Source")
                    ->findOneBy(array('id' => 1)));
            }
            for ($i=0; $i < count($valAry) ; $i++) { 
                if ($i === 2 && $valAry[$i] !== null) { $addParentSource($valAry[$i], $srcEntity); 
                } else if ($i === 5) { $addContributor($valAry[$i], $srcEntity); 
                } else {
                    $setField = "set". $srcFields[$i];
                    $srcEntity->$setField($fieldAry[$i]);
                }
            }
            return $srcEntity;
        };
        /** ============================================================ */
        foreach ($newEntities as $citId => $newEntData) {
            $pubEntity = null;
            $srcEntities = [];
            
            foreach ($newEntData as $entityName => $subAry) {
                if ($entityName === "publication") { 
                    $pubEntity = $addPub($subAry);
                    continue;
                } 
                foreach ($subAry as $sourceType => $valAry) {
                    array_push($srcEntities, $addSrcEntity($sourceType, $valAry, $pubEntity));
                }
            }
            /** Add referenced entities must be persisted before the owning side entity. */
            for ($i=count($srcEntities); $i <=0 ; $i--) { 
                $em->persist($srcEntities[$i]);
            }
            $em->flush();
        }
    }
    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {

    }
}
