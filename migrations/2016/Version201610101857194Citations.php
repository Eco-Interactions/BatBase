<?php

namespace Application\Migrations;

use App\Entity\Contribution;
use App\Entity\Publication;
use App\Entity\Source;
use Doctrine\DBAL\Migrations\AbstractMigration;

use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @up Creates a new "Source" entity for each citation.
 */
class Version201610101857194Citations extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * Creates a new "Source" entity for each citation that doesn't need special handling.
     * Updates citation Entity by setting displayName. 
     * 
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');
        $citations = $em->getRepository('App:Citation')->findAll();
        $duplicateCit = [248, 249, 251, 252, 253, 254, 255, 258, 259, 260, 261, 262, 263];

        foreach ($citations as $citEntity) {  
            $citId = $citEntity->getID();                                       
            if (!in_array($citId, $duplicateCit)) {              print("\nNew Source CitationID = ".$citId);
                $this->buildRelatedEntities($citEntity, $em); 
            }
        }
    }
    private function buildRelatedEntities(&$citEntity, &$em)
    {
        $pubEntity = $this->buildPubEntity($citEntity, $em);
        $srcEntity = $this->buildSrcEntity($citEntity, $em);

        $this->setSrcParentAndMissingData($citEntity, $srcEntity, $pubEntity, $em);
        $this->updateCitEntity($citEntity, $srcEntity, $em);

        $em->persist($pubEntity);  
        $em->persist($srcEntity);  
        $em->flush();      
    }
    private function updateCitEntity(&$citEntity, &$srcEntity, &$em)
    {
        $citEntity->setDisplayName($citEntity->getTitle());
        $citEntity->setSource($srcEntity);
        $citEntity->setUpdatedBy($em->getRepository('App:User')
            ->findOneBy(array('id' => '6')));  
        $em->persist($citEntity);  
    }
    private function buildPubEntity($citEntity, &$em)
    {
        $pubEntity = new Publication();
        $pubEntity->setCreatedBy($em->getRepository('App:User')
            ->findOneBy(array('id' => '6'))); 
        $pubEntity->setDisplayName($citEntity->getTitle());
        $pubEntity->setPublicationType($em->getRepository("App:PublicationType")
            ->findOneBy(array("displayName" => "Article")));
        $em->persist($pubEntity);
        return $pubEntity;
    }
    private function buildSrcEntity(&$citEntity, &$em)
    {
        $srcEntity = new Source();                                     

        $srcEntity->setDisplayName($citEntity->getTitle());   
        $srcEntity->setDescription($citEntity->getFullText());   
        $srcEntity->setYear($citEntity->getYear());
        $srcEntity->setIsCitation(true);
        $srcEntity->setSourceType($em->getRepository('App:SourceType')
            ->findOneBy(array('id'=> 2)));  
        $srcEntity->setCreatedBy($em->getRepository('App:User')
            ->findOneBy(array('id' => '6'))); 

        $this->transferInteractions($citEntity, $srcEntity, $em);              //print("\n    Interaction-- records transfered to new Source citation.");
        $this->transferAuthors($citEntity, $srcEntity, $em);                   //print("\n    Authors-- contributed to the new Source citation.");
        $em->persist($srcEntity);  
        return $srcEntity; 
    }
    /** Moves each interaction for this citation to it's new source entity.  */
    private function transferInteractions(&$citEntity, &$srcEntity, &$em)
    {
        $interactions = $citEntity->getInteractions();
        if (count($interactions) > 0) { $srcEntity->setIsDirect(true); }

        foreach ($interactions as $interaction) {
            $interaction->setSource($srcEntity);
            $srcEntity->addInteraction($interaction);
            $citEntity->removeInteraction($interaction);
            $em->persist($citEntity);
            $em->persist($interaction);
        }
    }
    /** Moves each author for this citation to it's new source entity.  */
    private function transferAuthors(&$citEntity, &$srcEntity, &$em)
    {
        $attributions = $citEntity->getAttributions();
    
        foreach ($attributions as $attribution) {
            $contribEntity = new Contribution();

            $contribEntity->setAuthorSource($attribution->getAuthor()->getSource());
            $contribEntity->setWorkSource($srcEntity);
            $contribEntity->setCreatedBy($em->getRepository('App:User')
                ->findOneBy(array('id' => '6'))); 

            $em->persist($contribEntity);
        }
    }
    private function setSrcParentAndMissingData(&$citEntity, &$srcEntity, &$pubEntity, &$em)
    {
        if ($citEntity->getPublication() === null || $citEntity->getId() === 31){ // 31 has a parent update.
            $this->getMissingData($citEntity, $srcEntity, $pubEntity, $em);
        } else {
            $srcEntity->setParentSource($citEntity->getPublication()->getSource());
        }                                                                      //print("\n    --ParentSource Added--");
    }
    private function getMissingData(&$citEntity, &$srcEntity, &$pubEntity, &$em)
    {
        /**
         * Format: citID => [ entity => fields ]
         */
        $citData = [ 25 => [ "cit" => [ "PublicationPages" => "206-215"],
                             "pub" => [ "PublicationType" => "Book"],
                             "src" => [ "Doi" => "10.1007/978-94-015-9821-7_19", 
                                        "ParentSource" => "Kluwer Academic Publishers"]],
                    31 => [ "pub" => [  "PublicationType" => "Ph.D. Dissertation"],
                            "src" => [ "ParentSource" => "University of Paris VI"]],                                        
                    33 => [ "src" => [  "ParentSource" => "Ciência e Cultura"]],
                    35 => [ "pub" => [ "PublicationType" => "Book"],
                            "src" => [  "Doi" => "10.1086/400668",
                                        "LinkUrl" => "https://hdl.handle.net/2027/uc1.31822011936077"]],
                    36 => [ "src" => [  "Doi" => "10.1590/S0101-81752005000200030",
                                        "LinkUrl" => "http://www.scielo.br/scielo.php?script=sci_arttext&pid=S0101-81752005000200030",
                                        "ParentSource" => 19]],
                    37 => [ "src" => [  "LinkUrl" => "http://hdl.handle.net/2042/55177",
                                        "ParentSource" => 26 ]],
                    39 => [ "src" => [  "ParentSource" => 26 ]],
                    40 => [ "pub" => [ "PublicationType" => "Ph.D. Dissertation"],
                             "src" => [  "ParentSource" => "University of Paris VI" ]],
                    42 => [ "pub" => [ "PublicationType" => "Book"]],
                    44 => [ "src" => [  "ParentSource" => 30 ]],
                    49 => [ "cit" => [  "PublicationIssue" => "12"],
                            "src" => [  "ParentSource" => "Revista de la Facultad de Agronomía de la Universidad del Zulia" ]],
                    63 => [ "pub" => [ "PublicationType" => "Book"],
                            "src" => [  "ParentSource" => 33]],  
                    65 => [ "src" => [  "ParentSource" => "American Scientist"]],  
                    68 => [ "src" => [  "ParentSource" => 30 ]],
                    70 => [ "src" => [  "Doi" => "10.2307/2395026",
                                        "ParentSource" => "Annals of the Missouri Botanical Garden" ]],
                    91 => [ "src" => [  "ParentSource" => 18 ]],
                    92 => [ "src" => [  "ParentSource" => "Comparative Biochemistry and Physiology" ]],
                    96 => ["pub" => [ "PublicationType" => "Book"]],
                    97 => [ "src" => [  "ParentSource" => "Annals of the Missouri Botanical Garden" ]],
                    98 => [ "src" => [  "ParentSource" => "Brittonia" ]],
                    100 => [ "src" => [  "Doi" => "10.1111/j.1469-7998.1998.tb00062.x",
                                        "ParentSource" => 61 ]],
                    101 => [ "src" => [  "ParentSource" => 11 ]],
                    103 => [ "cit" => [  "PublicationIssue" => "48A"],
                            "src" => [  "ParentSource" => "Comparative Biochemistry and Physiology" ]],
                    105 => [ "src" => [  "ParentSource" => "American Naturalist" ]],
                    106 => [ "src" => [  "ParentSource" => "Boletim do Museu Paraense Para Emilio Goeldi de História Natural e Ethnographia" ]],
                    107 => [ "src" => [  "ParentSource" => 4 ]],
                    111 => [ "src" => [  "ParentSource" => 29 ]],
                    114 => [ "src" => [  "ParentSource" => "Atas do Simposio sobre a Biota Amazonica" ]],
                    116 => [ "src" => [  "Doi" => "10.1111/j.1365-2699.1996.tb00018.x",
                                        "ParentSource" => "Journal of Biogeography" ]],
                    118 => [ "src" => [  "ParentSource" => "Brittonia" ]],
                    131 => [ "src" => [  "ParentSource" => 18 ]],
                    135 => [ "src" => [  "ParentSource" => "Mammalian Biology" ]],
                    138 => [ "src" => [  "ParentSource" => 6 ]],
                    143 => [ "src" => [  "ParentSource" => 19 ]],
                    145 => [ "src" => [  "ParentSource" => 57 ]],
                    146 => [ "src" => [  "ParentSource" => "Brittonia" ]],
                    149 => [ "src" => [  "ParentSource" => 13 ]],
                    150 => [ "src" => [  "ParentSource" => 32 ]],
                    157 => [ "src" => [  "ParentSource" => 19 ]],
                    164 => [ "cit" => [ "PublicationPages" => "365-377"],
                            "pub" => [ "PublicationType" => "Book"]],
                    166 => [ "src" => [  "ParentSource" => 19 ]],
                    168 => [ "src" => [  "ParentSource" => 19 ]],
                    169 => [ "src" => [  "ParentSource" => 19 ]],
                    172 => [ "src" => [ "LinkUrl" => "http://horizon.documentation.ird.fr/exl-doc/pleins_textes/pleins_textes_6/b_fdi_45-46/010006814.pdf",
                                        "ParentSource" => "Turrialba"]],
                    175 => [ "src" => [  "ParentSource" => 26 ]],
                    176 => [ "src" => [  "LinkUrl" => "http://r1.ufrrj.br/labmasto/publicacoes/27.pdf",
                                        "ParentSource" => "Boletim do Museu Paraense Para Emilio Goeldi de História Natural e Ethnographia" ]],
                    180 => [ "src" => [  "ParentSource" => "Boletim do Museu de Biologia Mello Leitão" ]],
                    181 => [ "src" => [  "ParentSource" => "Boletim do Museu de Biologia Mello Leitão" ]],
                    182 => [ "src" => [  "ParentSource" => "Boletim do Museu de Biologia Mello Leitão" ]],
                    183 => [ "src" => [  "ParentSource" => "Boletim do Museu de Biologia Mello Leitão" ]],
                    184 => [ "src" => [  "ParentSource" => 4 ]],
                    185 => [ "src" => [  "ParentSource" => 45 ]],
                    186 => [ "src" => [  "ParentSource" => "Ciência e Cultura" ]],
                    190 => [ "src" => [  "ParentSource" => "Ciência e Cultura" ]],
                    191 => [ "src" => [  "ParentSource" => "Revista Brasileira de Biologia" ]],
                    198 => [ "src" => [  "LinkUrl" => "https://www.researchgate.net/publication/11594298_Fig-eating_by_vertebrate_frugivores_A_global_review",
                                         "ParentSource" => "Biological Reviews" ]],
                    199 => [ "src" => [  "ParentSource" => 19 ]],
                    201 => [ "pub" => [  "PublicationType" => "Book"]],
                    202 => [ "pub" => [ "PublicationType" => "Book"],
                             "src" => [  "ParentSource" => "The University of Arizona Press" ]],
                    203 => [ "src" => [  "ParentSource" => 4 ]],
                    205 => [ "src" => [  "ParentSource" => 11 ]],
                    206 => [ "src" => [  "ParentSource" => 11 ]],
                    207 => [ "src" => [ "LinkUrl" => "http://www.nhm.org/site/sites/default/files/pdf/contrib_science/CS157.pdf", 
                                        "ParentSource" => "Contributions in Science" ]],
                    209 => [ "src" => [ "Doi" => "10.2307/2418687",
                                        "ParentSource" => "Systematic Botany" ]],
                    211 => [ "src" => [ "LinkUrl" => "http://revistamexicanademastozoologia.com.mx/ojs/index.php/rmm/article/download/114/108",
                                        "ParentSource" => "Revista Mexicana de Mastozoologia" ]],
                    212 => [ "src" => [  "ParentSource" => 35 ]],
                    213 => [ "src" => [  "ParentSource" => 51 ]],
                    225 => [ "src" => [  "Doi" => "10.1006/jare.1997.0267",
                                         "ParentSource" => "Journal of Arid Environments" ]],
                    227 => [ "src" => [  "Doi" => "10.1111/j.1438-8677.1957.tb00577.x",
                                         "ParentSource" => "Acta Botanica Neerlandica" ]],
                    228 => [ "src" => [  "Doi" => "10.1111/j.1095-8339.2001.tb00563.x",
                                         "ParentSource" => 60 ]],
                    230 => [ "pub" => [  "PublicationType" => "Book" ]],
                    232 => [ "src" => [  "ParentSource" => 62 ]],
                    233 => [ "src" => [  "ParentSource" => "Österreichische Botanische Zeitschrift" ]],
                    238 => [ "src" => [ "Doi" => "10.2307/2424624",
                                         "ParentSource" => "The American Midland Naturalist" ]],
                    240 => [ "pub" => [ "PublicationType" => "Book"],
                             "src" => [ "ParentSource" => 33 ]],
                    242 => [ "src" => [  "ParentSource" => "The American Midland Naturalist" ]],
                    243 => [ "pub" => [  "PublicationType" => "Book" ]],
                    244 => [ "src" => [  "ParentSource" => 6 ]],
                    246 => [ "src" => [ "LinkUrl" => "http://www.srcosmos.gr/srcosmos/showpub.aspx?aa=4753",
                                         "ParentSource" => 38 ]],
                    256 => [ "pub" => [ "PublicationType" => "Book"],
                             "src" => [ "ParentSource" => "Plenum Press" ]],
        ];
        $citAry = $citData[$citEntity->getId()];
        $pubTypeSet = false;

        foreach ($citAry as $ent => $dataAry) {  print("\nent = ". $ent);
            $entity = $ent === 'cit' ? $citEntity : ($ent === 'src' ? $srcEntity : $pubEntity); 
            foreach ($dataAry as $field => $value) { print("\n    field = ". $field);
                if ($ent === 'pub' && $field === "PublicationType") { 
                    $this->addPubType($pubEntity, $value, $em);
                    $pubTypeSet = true; 
                    continue;
                }
                if ($ent === 'src' && $field === "ParentSource") { 
                    $this->setParentSource($value, $citEntity, $srcEntity, $em); 
                    continue;
                }
                $setField = 'set'.$field;
                $entity->$setField($value);
            } 
        }         

        if (!$pubTypeSet) { $this->addPubType($pubEntity, 'Article', $em); }
    }
    private function addPubType(&$pubEntity, $value, &$em)
    {
        $pubType = $pubEntity->setPublicationType(
            $em->getRepository('App:PublicationType')
                ->findOneBy(array('displayName'=> $value)));
        $em->persist($pubEntity);  
    }
    private function setParentSource($prntSrcName, &$citEntity, &$srcEntity, &$em) {  print("\n    prntSrcName = ".$prntSrcName);
        $parent = null;
        if (is_int($prntSrcName)) {
            $parent = $em->getRepository("App:Publication")
                ->findOneBy(array('id' => $prntSrcName))
                ->getSource();
        } else {
            $parent = $em->getRepository("App:Source")
                ->findOneBy(array('displayName' => $prntSrcName));
        }
        $srcEntity->setParentSource($parent);
    }
    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {

    }
}
