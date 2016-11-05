<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

use AppBundle\Entity\Contribution;
use AppBundle\Entity\Source;

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
        $citations = $em->getRepository('AppBundle:Citation')->findAll();
        $duplicateCit = [248, 249, 251, 252, 253, 254, 255, 258, 259, 260, 261, 262, 263];

        foreach ($citations as $citEntity) {  
            $citId = $citEntity->getID();                                       
            if (!in_array($citId, $duplicateCit)) {                               //print("\nNew Source CitationID = ".$citId);
                $this->buildSourceEntity($citEntity, $em); 
            }
        }
    }
    private function buildSourceEntity(&$citEntity, &$em)
    {
        $srcEntity = new Source();                                     

        $srcEntity->setDisplayName($citEntity->getDescription());   
        $srcEntity->setDescription($citEntity->getFullText());   
        $srcEntity->setYear($citEntity->getYear());
        $srcEntity->setSourceType($em->getRepository('AppBundle:SourceType')
            ->findOneBy(array('id'=> 2)));  
        $srcEntity->setCreatedBy($em->getRepository('AppBundle:User')
            ->findOneBy(array('id' => '6'))); 

        $this->transferInteractions($citEntity, $srcEntity, $em);              //print("\n    Interaction-- records transfered to new Source citation.");
        $this->transferAuthors($citEntity, $srcEntity, $em);                   //print("\n    Authors-- contributed to the new Source citation.");

        if ($citEntity->getPublication() === null || $citEntity->getId() === 31){ // 31 has a parent update.
            $this->findAndFillMissingData($citEntity, $srcEntity, $em);
        } else {
            $srcEntity->setParentSource($citEntity->getPublication()->getSource());
        }                                                                      //print("\n    --ParentSource Added--");
        $citEntity->setDisplayName($citEntity->getDescription());
        $citEntity->setSource($srcEntity);
        $citEntity->setUpdatedBy($em->getRepository('AppBundle:User')
            ->findOneBy(array('id' => '6')));  

        $em->persist($srcEntity);  
        $em->persist($citEntity);  
        $em->flush();      
    }
    /** Moves each interaction for this citation to it's new source entity.  */
    private function transferInteractions(&$citEntity, &$srcEntity, &$em)
    {
        $interactions = $citEntity->getInteractions();
        foreach ($interactions as $interaction) {
            $interaction->setSource($srcEntity);
            $srcEntity->addInteraction($interaction);
            $citEntity->removeInteraction($interaction);
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
            $contribEntity->setCreatedBy($em->getRepository('AppBundle:User')
                ->findOneBy(array('id' => '6'))); 

            $em->persist($contribEntity);
        }
    }
    private function findAndFillMissingData(&$citEntity, &$srcEntity, &$em)
    {
        /**
         * Format: citID => [ entity => fields ]
         */
        $citData = [ 25 => [ "cit" => [  "PublicationPages" => "206-215"],
                            "src" => [  "Doi" => "10.1007/978-94-015-9821-7_19", 
                                        "ParentSource" => "Nouragues. Dynamics and plant-animal interactions in a Neotropical rainforest"]],
                     31 => [ "src" => [  "ParentSource" => "Modalités de dissemination et d'etablissement de lianes (Cyclanthaceae et Philodendron) en forêt Guyanaise"]],                                        
                    33 => [ "src" => [  "ParentSource" => "Ciência e Cultura"]],
                    35 => [ "src" => [  "Doi" => "10.1086/400668",
                                        "LinkUrl" => "https://hdl.handle.net/2027/uc1.31822011936077",
                                        "ParentSource" => 68 ]],
                    36 => [ "src" => [  "Doi" => "10.1590/S0101-81752005000200030",
                                        "LinkUrl" => "http://www.scielo.br/scielo.php?script=sci_arttext&pid=S0101-81752005000200030",
                                        "ParentSource" => 19]],
                    37 => [ "src" => [  "LinkUrl" => "http://hdl.handle.net/2042/55177",
                                        "ParentSource" => 26 ]],
                    39 => [ "src" => [  "ParentSource" => 26 ]],
                    40 => [ "src" => [  "ParentSource" => "Impacts des perturbations d'origine anthropique sur les peuplements de chauves-souris en Guyane Française."]],
                    42 => [ "src" => [ "ParentSource" => "Blüten und fledermäuse"]],
                    44 => [ "src" => [  "ParentSource" => 30 ]],
                    49 => [ "cit" => [  "PublicationIssue" => "12"],
                            "src" => [  "ParentSource" => "Revista de la Facultad de Agronomía de la Universidad del Zulia" ]],
                    63 => [ "src" => [  "ParentSource" => "The short-tailed fruit bat"]],  
                    65 => [ "src" => [  "ParentSource" => "American Scientist"]],  
                    68 => [ "src" => [  "ParentSource" => 30 ]],
                    70 => [ "src" => [  "Doi" => "10.2307/2395026",
                                        "ParentSource" => "Annals of the Missouri Botanical Garden" ]],
                    91 => [ "src" => [  "ParentSource" => 18 ]],
                    92 => [ "src" => [  "ParentSource" => "Comparative Biochemistry and Physiology" ]],
                    96 => [ "src" => [  "ParentSource" => "Bats. A natural history" ]],
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
                             "src" => [ "ParentSource" => "Investigaciones sobre la regeneración de selvas altas en Veracruz, México"]],
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
                    201 => [ "src" => [  "ParentSource" => "Los murciélagos de Cuba" ]],
                    202 => [ "src" => [  "ParentSource" => "Columnar Cacti and Their Mutualists: Evolution, Ecology, and Conservation" ]],
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
                    230 => [ "src" => [  "ParentSource" => "Algunos murcielagos del norte de Argentina" ]],
                    232 => [ "src" => [  "ParentSource" => 62 ]],
                    233 => [ "src" => [  "ParentSource" => "Österreichische Botanische Zeitschrift" ]],
                    238 => [ "src" => [ "Doi" => "10.2307/2424624",
                                         "ParentSource" => "The American Midland Naturalist" ]],
                    240 => [ "src" => [  "ParentSource" => "The food web of a tropical rain forest" ]],
                    242 => [ "src" => [  "ParentSource" => "The American Midland Naturalist" ]],
                    243 => [ "src" => [  "ParentSource" => "Manu. The biodiversity of southeastern Peru." ]],
                    244 => [ "src" => [  "ParentSource" => 6 ]],
                    246 => [ "src" => [ "LinkUrl" => "http://www.srcosmos.gr/srcosmos/showpub.aspx?aa=4753",
                                         "ParentSource" => 38 ]],
                    256 => [ "src" => [  "ParentSource" => "Ecology of Bats" ]],
        ];
        $citAry = $citData[$citEntity->getId()];

        foreach ($citAry as $ent => $dataAry) {
            $entity = $ent === 'cit' ? $citEntity : $srcEntity; 
            foreach ($dataAry as $field => $value) {
                if ($field === "ParentSource") { 
                    $this->setParentSource($value, $citEntity, $srcEntity, $em); 
                    continue;
                }
                $setField = 'set'.$field;
                $entity->$setField($value);
            }
        }         
    }
    private function setParentSource($prntSrcName, &$citEntity, &$srcEntity, &$em) {  print("\n    prntSrcName = ".$prntSrcName);
        $parent = null;
        if (is_int($prntSrcName)) {
            $parent = $em->getRepository("AppBundle:Publication")
                ->findOneBy(array('id' => $prntSrcName))
                ->getSource();
        } else {
            $parent = $em->getRepository("AppBundle:Source")
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
