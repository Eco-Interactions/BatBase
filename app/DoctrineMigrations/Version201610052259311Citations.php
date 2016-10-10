<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

use AppBundle\Entity\Author;
use AppBundle\Entity\Publication;
use AppBundle\Entity\Source;

/**
 * @up Creates a new "Source" entity for each citation and sets the parent source for .
 */
class Version201610052259311Citations extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * Creates a new "Source" entity for each citation. 
     * Updates citation Entity by setting displayName. 
     * 
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');
        $citations = $em->getRepository('AppBundle:Citation')->findAll();
        $edgeCases = [31, 40, 42, 96, 201, 254, 262];

        foreach ($citations as $citEntity) {  
            $citId = $citEntity->getID();   print("\ncitID = ".$citId);
            if (in_array($citId, $edgeCases)) {
                $this->handleEdgeCase($citId, $citEntity, $em);
            } else {
                $this->buildSourceEntity($citEntity, $em); 
            }
        }
    }
    private function handleEdgeCase($citId, &$citEntity, &$em)
    {
        //move all tags from these citations to their new source 
            //cit42 , cit254 ->pub  Blüten und fledermäuse.
            //cit 96-> Bats. A natural history
            //cit201 -> Los murciélagos de Cuba
            //handle dissertaions citId 40 & 31
        $createPhDPub = function() use (&$citEntity, &$em) {

        };
        $createPhDPub = [31, 40];
        $moveToPub = [42, 96, 201, 254, 262];
        $edgeCases = [31 => $createPhDPub, 40 => $createPhDPub, 42, 96, 201, 254, 262];
    }
    private function buildSourceEntity(&$citEntity, &$em)
    {
        $srcEntity = new Source();                                     print("\nNew Source");

        $srcEntity->setDisplayName($citEntity->getDisplayText());   print("\n setDisplayName");
        $srcEntity->setDescription($citEntity->getDescription());
        $srcEntity->setYear($citEntity->getYear());
        $srcEntity->setSourceType($em->getRepository('AppBundle:SourceType')
            ->findOneBy(array('id'=> 2)));  print("\n setting sourceType");
        $srcEntity->setCreatedBy($em->getRepository('AppBundle:User')
            ->findOneBy(array('id' => '6'))); 
        $this->transferInteractions($citEntity, $srcEntity, $em);
        $this->transferAuthors($citEntity, $srcEntity, $em);
        $parentSource = $citEntity->getPublication() === null ? 
            $this->findAndFillMissingData($citEntity, $srcEntity, $em) : 
            $citEntity->getPublication()->getSource();
        $srcEntity->setParentSource($parentSource);

        $citEntity->setDisplayName($citEntity->getDescription());
        $citEntity->setSource($srcEntity);
        $citEntity->setUpdatedBy($em->getRepository('AppBundle:User')
            ->findOneBy(array('id' => '6')));  print("\n Updated cit entity");

        $em->persist($srcEntity);  print("\n Persisted source");
        $em->persist($citEntity);  print("\n Persisted cit");
        $em->flush();      print("\n--------------------- Flushed");
    }
    /** Moves each interaction for this citation to it's new source entity.  */
    private function transferInteractions(&$citEntity, &$srcEntity, &$em)
    {
        $interactions = $citEntity->getInteractions();
        foreach ($interactions as $interaction) {
            $srcEntity->addInteraction($interaction);
            $citEntity->removeInteraction($interaction);
        }
    }
    /** Moves each author for this citation to it's new source entity.  */
    private function transferAuthors(&$citEntity, &$srcEntity, &$em)
    {
        $authors = $citEntity->getAuthors();
        foreach ($authors as $author) {
            $srcEntity->addAuthor($author);
            $citEntity->removeAuthor($author);
        }
    }
    private function findAndFillMissingData(&$citEntity, &$srcEntity, &$em)
    {
        //move all tags from these citations to their new source 
            //cit42 , cit254 ->pub  Blüten und fledermäuse.
            //cit 96-> Bats. A natural history
            //cit201 -> Los murciélagos de Cuba
            //handle dissertaions citId 40 & 31
            // 
        $citMap = [ 25 => [ "cit" => [  "pubPgs" => "206-215"],
                            "src" => [  "doi" => "10.1007/978-94-015-9821-7_19", 
                                        "prnt" => "Nouragues"]],
                    33 => [ "src" => [  "prnt" => "Ciência e Cultura"]],
                    35 => [ "src" => [  "doi" => "10.1086/400668",
                                        "url" => "https://hdl.handle.net/2027/uc1.31822011936077",
                                        "prnt" => "Louisiana State University Press" ]],
                    36 => [ "src" => [  "doi" => "10.1590/S0101-81752005000200030",
                                        "url" => "http://www.scielo.br/scielo.php?script=sci_arttext&pid=S0101-81752005000200030",
                                        "prnt" => 19]],
                    37 => [ "src" => [  "url" => "http://hdl.handle.net/2042/55177",
                                        "prnt" => 26 ]],
                    39 => [ "src" => [  "prnt" => 26 ]],
                    44 => [ "src" => [  "prnt" => 30 ]],
                    49 => [ "cit" => [  "pubIssue" => "12"],
                            "src" => [  "prnt" => "Revista de la Facultad de Agronomía de la Universidad del Zulia" ]],
                    65 => [ "src" => [  "prnt" => "American Scientist"]],  
                    68 => [ "src" => [  "prnt" => 30 ]],

                    70 => [ "src" => [  "doi" => "10.2307/2395026",
                                        "prnt" => "Annals of the Missouri Botanical Garden" ]],
                    91 => [ "src" => [  "prnt" => 18 ]],
                    92 => [ "src" => [  "prnt" => "Comparative Biochemistry and Physiology" ]],
                    97 => [ "src" => [  "prnt" => "Annals of the Missouri Botanical Garden" ]],
                    98 => [ "src" => [  "prnt" => "Brittonia" ]],
                    100 => [ "src" => [  "doi" => "10.1111/j.1469-7998.1998.tb00062.x",
                                        "prnt" => 61 ]],
                    101 => [ "src" => [  "prnt" => 11 ]],
                    103 => [ "cit" => [  "pubIssue" => "48A"],
                            "src" => [  "prnt" => "Comparative Biochemistry and Physiology" ]],
                    105 => [ "src" => [  "prnt" => "American Naturalist" ]],
                    107 => [ "src" => [  "prnt" => "4" ]],
                    111 => [ "src" => [  "prnt" => "29" ]],
                    114 => [ "src" => [  "prnt" => "Zoologia" ]],
                    116 => [ "src" => [  "doi" => "10.1111/j.1365-2699.1996.tb00018.x",
                                        "prnt" => "Journal of Biogeography" ]],
                    118 => [ "src" => [  "prnt" => "Brittonia" ]],
                    131 => [ "src" => [  "prnt" => 18 ]],
                    135 => [ "src" => [  "prnt" => "Mammalian Biology" ]],
                    138 => [ "src" => [  "prnt" => "6" ]],
                    143 => [ "src" => [  "prnt" => 19 ]],
                    145 => [ "src" => [  "prnt" => 57 ]],
                    146 => [ "src" => [  "prnt" => "Brittonia" ]],
                    149 => [ "src" => [  "prnt" => 13 ]],
                    150 => [ "src" => [  "prnt" => 32 ]],
                    157 => [ "src" => [  "prnt" => 19 ]],
                    166 => [ "src" => [  "prnt" => 19 ]],
                    168 => [ "src" => [  "prnt" => 19 ]],
                    169 => [ "src" => [  "prnt" => 19 ]],
                    172 => [ "src" => [ "url" => "http://horizon.documentation.ird.fr/exl-doc/pleins_textes/pleins_textes_6/b_fdi_45-46/010006814.pdf", 
                                        "prnt" => null ]],
                    175 => [ "src" => [  "prnt" => 26 ]],
                    176 => [ "src" => [  "url" => "http://r1.ufrrj.br/labmasto/publicacoes/27.pdf",
                                        "prnt" => "Zoologia" ]],
                    180 => [ "src" => [  "prnt" => "Zoologia" ]],
                    181 => [ "src" => [  "prnt" => "Zoologia" ]],
                    182 => [ "src" => [  "prnt" => "Zoologia" ]],
                    183 => [ "src" => [  "prnt" => "Zoologia" ]],
                    184 => [ "src" => [  "prnt" => 4 ]],
                    185 => [ "src" => [  "prnt" => 45 ]],
                    186 => [ "src" => [  "prnt" => "Ciência e Cultura" ]],
                    190 => [ "src" => [  "prnt" => "Ciência e Cultura" ]],
                    191 => [ "src" => [  "prnt" => "Revista Brasileira de Biologia" ]],
                    198 => [ "src" => [  "url" => "https://www.researchgate.net/publication/11594298_Fig-eating_by_vertebrate_frugivores_A_global_review",
                                         "prnt" => "Biological Reviews" ]],
                    199 => [ "src" => [  "prnt" => 19 ]],
                    202 => [ "src" => [  "prnt" => "Columnar Cacti and Their Mutualists" ]],
                    203 => [ "src" => [  "prnt" => 4 ]],
                    205 => [ "src" => [  "prnt" => 11 ]],
                    206 => [ "src" => [  "prnt" => 11 ]],

                    207 => [ "src" => [ "url" => "http://www.nhm.org/site/sites/default/files/pdf/contrib_science/CS157.pdf", 
                                        "prnt" => "Contributions in Science" ]],
                    209 => [ "src" => [ "doi" => "10.2307/2418687",
                                        "prnt" => "Systematic Botany" ]],
                    211 => [ "src" => [ "url" => "http://revistamexicanademastozoologia.com.mx/ojs/index.php/rmm/article/download/114/108",
                                        "prnt" => "Revista Mexicana de Mastozoologia" ]],
                    212 => [ "src" => [  "prnt" => 35 ]],
                    213 => [ "src" => [  "prnt" => 51 ]],
                    225 => [ "src" => [  "doi" => "doi:10.1006/jare.1997.0267",
                                         "prnt" => "Journal of Arid Environments" ]],
                    227 => [ "src" => [  "doi" => "10.1111/j.1438-8677.1957.tb00577.x",
                                         "prnt" => 59 ]],
                    228 => [ "src" => [  "doi" => "10.1111/j.1095-8339.2001.tb00563.x",
                                         "prnt" => 60 ]],
                    230 => [ "src" => [  "prnt" => "University of Kansas Natural History Museum" ]],
                    232 => [ "src" => [  "prnt" => 62 ]],
                    233 => [ "src" => [  "prnt" => "Österreichische Botanische Zeitschrift" ]],
                    238 => [ "src" => [ "doi" => "10.2307/2424624",
                                         "prnt" => "The American Midland Naturalist" ]],
                    240 => [ "src" => [  "prnt" => 33 ]],
                    242 => [ "src" => [  "prnt" => 6 ]],
                    243 => [ "src" => [  "prnt" => "Manu. The biodiversity of southeastern Peru." ]],
                    244 => [ "src" => [  "prnt" => 6 ]],
                    246 => [ "src" => [ "url" => "http://www.srcosmos.gr/srcosmos/showpub.aspx?aa=4753",
                                         "prnt" => 38 ]],
                    256 => [ "src" => [  "prnt" => "Ecology of Bats" ]],
                    258 => [ "src" => [  "prnt" => 11 ]],
                    263 => [ "src" => [  "prnt" => 6 ]]
        ];
                     // displayName            Name,       
        $newPubSources = [ "Nourages" => [ "Nourages. Dynamics and plant-animal interactions in a Neotropical rainforest."

        ]];
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
