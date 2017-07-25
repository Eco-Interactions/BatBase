<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @up -> Adds all missing author name data from the original 'Data Upload' spreadsheet.
 */
class Version20170724232513AuthNames extends AbstractMigration implements ContainerAwareInterface
{

    private $container;

    private $missingAuths;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $nulls = [];
        $em = $this->container->get('doctrine.orm.entity_manager');
        $admin = $em->getRepository('AppBundle:User')->findOneBy(['id' => 6]);
        $this->addAuthorNameData($nulls, $admin, $em);
        $em->flush();
    }
    private function addAuthorNameData(&$nulls, $admin, &$em)
    {
        $auths = $this->getAuthNameAry();

        foreach ($auths as $athrData) {
            $this->addMissingAuthData($athrData, $nulls, $admin, $em);
        }                                                                       print("\nmissingAuths = "); print_r($nulls);
    }
    private function addMissingAuthData($athrData, &$nulls, $admin, &$em)
    {
        $athr = $em->getRepository('AppBundle:Author')
            ->findOneBy(['displayName' => $athrData['shortName']]); 
        if (!$athr) { array_push($nulls, $athrData['shortName']); return; }

        $newFullName = $this->getFullName($athrData);                           print("Processing Author = ". $newFullName."\n");
        $athr->setFirstName($athrData['first']);
        $athr->setMiddleName($athrData['middle']);
        $athr->setLastName($athrData['last']);
        $athr->setSuffix($athrData['suffix']);
        $athr->setFullName($newFullName);
        $athr->setUpdatedBy($admin);
        $em->persist($athr);
    }
    private function getFullName($data)
    {
        $name = [];
        $nameParts = ['first', 'middle', 'last', 'suffix'];
        foreach ($nameParts as $part) {
            if ($data[$part]) { array_push($name, $data[$part]); }
        }
        return join(' ', $name);
    }
    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
    }

    private function getAuthNameAry()
    {
        return [
            [
              "shortName" =>  "Acosta y Lara",
              "last" =>  "Acosta y Lara",
              "first" =>  "Eduardo",
              "middle" =>  "F",
              "suffix" =>  null,
              "tempId" =>  2
            ],
            [
              "shortName" =>  "Albuja",
              "last" =>  "Albuja",
              "first" =>  "L",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  3
            ],
            [
              "shortName" =>  "Alcorn",
              "last" =>  "Alcorn",
              "first" =>  "Stanley",
              "middle" =>  "M",
              "suffix" =>  null,
              "tempId" =>  4
            ],
            [
              "shortName" =>  "Alonso-Mejía",
              "last" =>  "Alonso-Mejía",
              "first" =>  "Alfonso",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  5
            ],
            [
              "shortName" =>  "Altringham",
              "last" =>  "Altringham",
              "first" =>  "John",
              "middle" =>  "D",
              "suffix" =>  null,
              "tempId" =>  6
            ],
            [
              "shortName" =>  "Alvarez",
              "last" =>  "Alvarez",
              "first" =>  "Javier",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  7
            ],
            [
              "shortName" =>  "Alverson",
              "last" =>  "Alverson",
              "first" =>  "William",
              "middle" =>  "S",
              "suffix" =>  null,
              "tempId" =>  8
            ],
            [
              "shortName" =>  "Anderson",
              "last" =>  "Anderson",
              "first" =>  "Pamela",
              "middle" =>  "K",
              "suffix" =>  null,
              "tempId" =>  9
            ],
            [
              "shortName" =>  "Aranguren",
              "last" =>  "Aranguren",
              "first" =>  "Jaime",
              "middle" =>  "O",
              "suffix" =>  null,
              "tempId" =>  10
            ],
            [
              "shortName" =>  "Arce",
              "last" =>  "Arce",
              "first" =>  "J",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  11
            ],
            [
              "shortName" =>  "Arends",
              "last" =>  "Arends",
              "first" =>  "Alexis",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  12
            ],
            [
              "shortName" =>  "Arias-Cóyotl",
              "last" =>  "Arias-Cóyotl",
              "first" =>  "Ethel",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  13
            ],
            [
              "shortName" =>  "Arita",
              "last" =>  "Arita",
              "first" =>  "Hector",
              "middle" =>  "T",
              "suffix" =>  null,
              "tempId" =>  14
            ],
            [
              "shortName" =>  "Arizaga",
              "last" =>  "Arizaga",
              "first" =>  "Santiago",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  15
            ],
            [
              "shortName" =>  "Arizmendi-del-Coro",
              "last" =>  "Arizmendi-del-Coro",
              "first" =>  "Maria",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  16
            ],
            [
              "shortName" =>  "Armella",
              "last" =>  "Armella",
              "first" =>  "M",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  17
            ],
            [
              "shortName" =>  "Arroyo-Cabrales",
              "last" =>  "Arroyo-Cabrales",
              "first" =>  "Joaquin",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  18
            ],
            [
              "shortName" =>  "Ascorra",
              "last" =>  "Ascorra",
              "first" =>  "Cesar",
              "middle" =>  "F",
              "suffix" =>  null,
              "tempId" =>  19
            ],
            [
              "shortName" =>  "August",
              "last" =>  "August",
              "first" =>  "Peter",
              "middle" =>  "V",
              "suffix" =>  null,
              "tempId" =>  20
            ],
            [
              "shortName" =>  "Baker(H)",
              "last" =>  "Baker",
              "first" =>  "Herbert",
              "middle" =>  "G",
              "suffix" =>  null,
              "tempId" =>  21
            ],
            [
              "shortName" =>  "Baker(I)",
              "last" =>  "Baker",
              "first" =>  "I",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  22
            ],
            [
              "shortName" =>  "Baker(R)",
              "last" =>  "Baker",
              "first" =>  "Robert",
              "middle" =>  "J",
              "suffix" =>  null,
              "tempId" =>  23
            ],
            [
              "shortName" =>  "Balseiro",
              "last" =>  "Balseiro",
              "first" =>  "F",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  24
            ],
            [
              "shortName" =>  "Banack",
              "last" =>  "Banack",
              "first" =>  "Sandra",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  25
            ],
            [
              "shortName" =>  "Bandou",
              "last" =>  "Bandou",
              "first" =>  "E",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  26
            ],
            [
              "shortName" =>  "Barquez",
              "last" =>  "Barquez",
              "first" =>  "R",
              "middle" =>  "M",
              "suffix" =>  null,
              "tempId" =>  27
            ],
            [
              "shortName" =>  "Barthlott",
              "last" =>  "Barthlott",
              "first" =>  "W",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  28
            ],
            [
              "shortName" =>  "Beck",
              "last" =>  "Beck",
              "first" =>  "Harald",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  29
            ],
            [
              "shortName" =>  "Becvar",
              "last" =>  "Becvar",
              "first" =>  "J",
              "middle" =>  "E",
              "suffix" =>  null,
              "tempId" =>  30
            ],
            [
              "shortName" =>  "Bergallo",
              "last" =>  "Bergallo",
              "first" =>  "H",
              "middle" =>  "G",
              "suffix" =>  null,
              "tempId" =>  31
            ],
            [
              "shortName" =>  "Bernard",
              "last" =>  "Bernard",
              "first" =>  "Enrico",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  32
            ],
            [
              "shortName" =>  "Bianchi",
              "last" =>  "Bianchi",
              "first" =>  "M",
              "middle" =>  "B",
              "suffix" =>  null,
              "tempId" =>  33
            ],
            [
              "shortName" =>  "Bianconi",
              "last" =>  "Bianconi",
              "first" =>  "Greg",
              "middle" =>  "V",
              "suffix" =>  null,
              "tempId" =>  34
            ],
            [
              "shortName" =>  "Bizerril",
              "last" =>  "Bizerril",
              "first" =>  "Marcelo",
              "middle" =>  "X",
              "suffix" =>  null,
              "tempId" =>  35
            ],
            [
              "shortName" =>  "Blanchard",
              "last" =>  "Blanchard",
              "first" =>  "F",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  36
            ],
            [
              "shortName" =>  "Bloedel",
              "last" =>  "Bloedel",
              "first" =>  "P",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  37
            ],
            [
              "shortName" =>  "Bolten",
              "last" =>  "Bolten",
              "first" =>  "A",
              "middle" =>  "B",
              "suffix" =>  null,
              "tempId" =>  38
            ],
            [
              "shortName" =>  "Bonaccorso",
              "last" =>  "Bonaccorso",
              "first" =>  "Frank",
              "middle" =>  "J",
              "suffix" =>  null,
              "tempId" =>  39
            ],
            [
              "shortName" =>  "Bonin",
              "last" =>  "Bonin",
              "first" =>  "M",
              "middle" =>  "R",
              "suffix" =>  null,
              "tempId" =>  40
            ],
            [
              "shortName" =>  "Borchov",
              "last" =>  "Borchov",
              "first" =>  "D",
              "middle" =>  "L",
              "suffix" =>  null,
              "tempId" =>  41
            ],
            [
              "shortName" =>  "Bradbury",
              "last" =>  "Bradbury",
              "first" =>  "Jack",
              "middle" =>  "W",
              "suffix" =>  null,
              "tempId" =>  42
            ],
            [
              "shortName" =>  "Breuil(A)",
              "last" =>  "Breuil(A)",
              "first" =>  "A",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  43
            ],
            [
              "shortName" =>  "Breuil(M)",
              "last" =>  "Breuil(M)",
              "first" =>  "M",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  44
            ],
            [
              "shortName" =>  "Brosset",
              "last" =>  "Brosset",
              "first" =>  "A",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  45
            ],
            [
              "shortName" =>  "Buchmann",
              "last" =>  "Buchmann",
              "first" =>  "S",
              "middle" =>  "L",
              "suffix" =>  null,
              "tempId" =>  46
            ],
            [
              "shortName" =>  "Burch",
              "last" =>  "Burch",
              "first" =>  "D",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  47
            ],
            [
              "shortName" =>  "Búrquez",
              "last" =>  "Búrquez",
              "first" =>  "Alberto",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  48
            ],
            [
              "shortName" =>  "Butanda-Cervera",
              "last" =>  "Butanda-Cervera",
              "first" =>  "A",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  49
            ],
            [
              "shortName" =>  "Buzato",
              "last" =>  "Buzato",
              "first" =>  "Silvana",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  50
            ],
            [
              "shortName" =>  "Cáceres",
              "last" =>  "Cáceres",
              "first" =>  "N",
              "middle" =>  "C",
              "suffix" =>  null,
              "tempId" =>  51
            ],
            [
              "shortName" =>  "Cadena",
              "last" =>  "Cadena",
              "first" =>  "A",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  52
            ],
            [
              "shortName" =>  "Camilo",
              "last" =>  "Camilo",
              "first" =>  "Greg",
              "middle" =>  "R",
              "suffix" =>  null,
              "tempId" =>  53
            ],
            [
              "shortName" =>  "Caron",
              "last" =>  "Caron",
              "first" =>  "H",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  54
            ],
            [
              "shortName" =>  "Casas",
              "last" =>  "Casas",
              "first" =>  "Alejandro",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  55
            ],
            [
              "shortName" =>  "Cavelier",
              "last" =>  "Cavelier",
              "first" =>  "J",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  56
            ],
            [
              "shortName" =>  "Charles-Dominique",
              "last" =>  "Charles-Dominique",
              "first" =>  "Pierre",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  57
            ],
            [
              "shortName" =>  "Chautems",
              "last" =>  "Chautems",
              "first" =>  "A",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  58
            ],
            [
              "shortName" =>  "Chevallier",
              "last" =>  "Chevallier",
              "first" =>  "M",
              "middle" =>  "H",
              "suffix" =>  null,
              "tempId" =>  59
            ],
            [
              "shortName" =>  "Chiarello",
              "last" =>  "Chiarello",
              "first" =>  "A",
              "middle" =>  "G",
              "suffix" =>  null,
              "tempId" =>  60
            ],
            [
              "shortName" =>  "Clark(H)",
              "last" =>  "Clark(H)",
              "first" =>  "Howard",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  61
            ],
            [
              "shortName" =>  "Clark(K)",
              "last" =>  "Clark(K)",
              "first" =>  "Kathleen",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  62
            ],
            [
              "shortName" =>  "Cloutier",
              "last" =>  "Cloutier",
              "first" =>  "Danielle",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  63
            ],
            [
              "shortName" =>  "Coates-Estrada",
              "last" =>  "Coates-Estrada",
              "first" =>  "Rosamond",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  64
            ],
            [
              "shortName" =>  "Cockle",
              "last" =>  "Cockle",
              "first" =>  "Anya",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  65
            ],
            [
              "shortName" =>  "Cockrum",
              "last" =>  "Cockrum",
              "first" =>  "E",
              "middle" =>  "Lendell",
              "suffix" =>  null,
              "tempId" =>  66
            ],
            [
              "shortName" =>  "Coelho",
              "last" =>  "Coelho",
              "first" =>  "D",
              "middle" =>  "C",
              "suffix" =>  null,
              "tempId" =>  67
            ],
            [
              "shortName" =>  "Compton",
              "last" =>  "Compton",
              "first" =>  "Stephen",
              "middle" =>  "G",
              "suffix" =>  null,
              "tempId" =>  68
            ],
            [
              "shortName" =>  "Conceição",
              "last" =>  "Conceição",
              "first" =>  "P",
              "middle" =>  "N da",
              "suffix" =>  null,
              "tempId" =>  69
            ],
            [
              "shortName" =>  "Condon",
              "last" =>  "Condon",
              "first" =>  "M",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  70
            ],
            [
              "shortName" =>  "Cooper",
              "last" =>  "Cooper",
              "first" =>  "Howard",
              "middle" =>  "M",
              "suffix" =>  null,
              "tempId" =>  71
            ],
            [
              "shortName" =>  "Corlett",
              "last" =>  "Corlett",
              "first" =>  "Richard",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  72
            ],
            [
              "shortName" =>  "Cornejo",
              "last" =>  "Cornejo",
              "first" =>  "F",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  73
            ],
            [
              "shortName" =>  "Correa",
              "last" =>  "Correa",
              "first" =>  "N",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  74
            ],
            [
              "shortName" =>  "Cort",
              "last" =>  "Cort",
              "first" =>  "R",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  75
            ],
            [
              "shortName" =>  "Cruden",
              "last" =>  "Cruden",
              "first" =>  "R",
              "middle" =>  "W",
              "suffix" =>  null,
              "tempId" =>  76
            ],
            [
              "shortName" =>  "Cuatrecasas",
              "last" =>  "Cuatrecasas",
              "first" =>  "Jose",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  77
            ],
            [
              "shortName" =>  "Cunningham",
              "last" =>  "Cunningham",
              "first" =>  "Saul",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  78
            ],
            [
              "shortName" =>  "da Silva",
              "last" =>  "da Silva",
              "first" =>  "Shirley S",
              "middle" =>  "P",
              "suffix" =>  null,
              "tempId" =>  79
            ],
            [
              "shortName" =>  "Dalquest",
              "last" =>  "Dalquest",
              "first" =>  "W",
              "middle" =>  "W",
              "suffix" =>  null,
              "tempId" =>  80
            ],
            [
              "shortName" =>  "Davila",
              "last" =>  "Davila",
              "first" =>  "Patricia",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  81
            ],
            [
              "shortName" =>  "de Aguiar",
              "last" =>  "de Aguiar",
              "first" =>  "Ludmilla",
              "middle" =>  "M S",
              "suffix" =>  null,
              "tempId" =>  82
            ],
            [
              "shortName" =>  "de Albuquerque",
              "last" =>  "de Albuquerque",
              "first" =>  "S",
              "middle" =>  "T",
              "suffix" =>  null,
              "tempId" =>  83
            ],
            [
              "shortName" =>  "de Arellano",
              "last" =>  "de Arellano",
              "first" =>  "F",
              "middle" =>  "R",
              "suffix" =>  null,
              "tempId" =>  84
            ],
            [
              "shortName" =>  "de Carvalho",
              "last" =>  "de Carvalho",
              "first" =>  "C",
              "middle" =>  "T",
              "suffix" =>  null,
              "tempId" =>  85
            ],
            [
              "shortName" =>  "de Enrech",
              "last" =>  "de Enrech",
              "first" =>  "Nereida",
              "middle" =>  "X",
              "suffix" =>  null,
              "tempId" =>  86
            ],
            [
              "shortName" =>  "de Figueiredo",
              "last" =>  "de Figueiredo",
              "first" =>  "R",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  87
            ],
            [
              "shortName" =>  "de Foresta",
              "last" =>  "de Foresta",
              "first" =>  "H",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  88
            ],
            [
              "shortName" =>  "de Nevers",
              "last" =>  "de Nevers",
              "first" =>  "Greg",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  89
            ],
            [
              "shortName" =>  "DeFillips",
              "last" =>  "DeFillips",
              "first" =>  "Robert",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  90
            ],
            [
              "shortName" =>  "Degen",
              "last" =>  "Degen",
              "first" =>  "Bernd",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  91
            ],
            [
              "shortName" =>  "Delaval",
              "last" =>  "Delaval",
              "first" =>  "Marguerite",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  92
            ],
            [
              "shortName" =>  "Diaz",
              "last" =>  "Diaz",
              "first" =>  "C",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  93
            ],
            [
              "shortName" =>  "Dinerstein",
              "last" =>  "Dinerstein",
              "first" =>  "Eric",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  94
            ],
            [
              "shortName" =>  "Dobat",
              "last" =>  "Dobat",
              "first" =>  "K",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  95
            ],
            [
              "shortName" =>  "Dominguez-Canseco",
              "last" =>  "Dominguez-Canseco",
              "first" =>  "L",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  96
            ],
            [
              "shortName" =>  "Dressler",
              "last" =>  "Dressler",
              "first" =>  "Stefan",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  97
            ],
            [
              "shortName" =>  "Dunphy",
              "last" =>  "Dunphy",
              "first" =>  "Brian",
              "middle" =>  "K",
              "suffix" =>  null,
              "tempId" =>  98
            ],
            [
              "shortName" =>  "Eguiarte",
              "last" =>  "Eguiarte",
              "first" =>  "Luis",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  99
            ],
            [
              "shortName" =>  "Ehle",
              "last" =>  "Ehle",
              "first" =>  "C",
              "middle" =>  "P",
              "suffix" =>  null,
              "tempId" =>  100
            ],
            [
              "shortName" =>  "Engriser",
              "last" =>  "Engriser",
              "first" =>  "Elizabeth",
              "middle" =>  "M",
              "suffix" =>  null,
              "tempId" =>  101
            ],
            [
              "shortName" =>  "Erard",
              "last" =>  "Erard",
              "first" =>  "C",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  102
            ],
            [
              "shortName" =>  "Estrada",
              "last" =>  "Estrada",
              "first" =>  "Alejandro",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  103
            ],
            [
              "shortName" =>  "Estrada-B",
              "last" =>  "Estrada-B",
              "first" =>  "D",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  104
            ],
            [
              "shortName" =>  "Ezcurra",
              "last" =>  "Ezcurra",
              "first" =>  "E",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  105
            ],
            [
              "shortName" =>  "Fabian",
              "last" =>  "Fabian",
              "first" =>  "M",
              "middle" =>  "E",
              "suffix" =>  null,
              "tempId" =>  106
            ],
            [
              "shortName" =>  "Fernandez",
              "last" =>  "Fernandez",
              "first" =>  "A",
              "middle" =>  "B",
              "suffix" =>  null,
              "tempId" =>  107
            ],
            [
              "shortName" =>  "Ferrell",
              "last" =>  "Ferrell",
              "first" =>  "Carolyn",
              "middle" =>  "S",
              "suffix" =>  null,
              "tempId" =>  108
            ],
            [
              "shortName" =>  "Fischer(E)",
              "last" =>  "Fischer(E)",
              "first" =>  "Erich",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  109
            ],
            [
              "shortName" =>  "Fischer(W)",
              "last" =>  "Fischer(W)",
              "first" =>  "Wagner",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  110
            ],
            [
              "shortName" =>  "Fisher",
              "last" =>  "Fisher",
              "first" =>  "Martha",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  111
            ],
            [
              "shortName" =>  "Fleming",
              "last" =>  "Fleming",
              "first" =>  "Theodore",
              "middle" =>  "H",
              "suffix" =>  null,
              "tempId" =>  112
            ],
            [
              "shortName" =>  "Folina-Freaner",
              "last" =>  "Folina-Freaner",
              "first" =>  "M",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  113
            ],
            [
              "shortName" =>  "Franco",
              "last" =>  "Franco",
              "first" =>  "A",
              "middle" =>  "L M",
              "suffix" =>  null,
              "tempId" =>  114
            ],
            [
              "shortName" =>  "Francois",
              "last" =>  "Francois",
              "first" =>  "Genevieve",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  115
            ],
            [
              "shortName" =>  "Freeman",
              "last" =>  "Freeman",
              "first" =>  "C",
              "middle" =>  "E",
              "suffix" =>  null,
              "tempId" =>  116
            ],
            [
              "shortName" =>  "Fuchs",
              "last" =>  "Fuchs",
              "first" =>  "E",
              "middle" =>  "J",
              "suffix" =>  null,
              "tempId" =>  117
            ],
            [
              "shortName" =>  "Galetti",
              "last" =>  "Galetti",
              "first" =>  "M",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  118
            ],
            [
              "shortName" =>  "Galindo-González",
              "last" =>  "Galindo-González",
              "first" =>  "Jorge",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  119
            ],
            [
              "shortName" =>  "Gannon",
              "last" =>  "Gannon",
              "first" =>  "Michael",
              "middle" =>  "R",
              "suffix" =>  null,
              "tempId" =>  120
            ],
            [
              "shortName" =>  "Gaona",
              "last" =>  "Gaona",
              "first" =>  "R",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  121
            ],
            [
              "shortName" =>  "Garcia",
              "last" =>  "Garcia",
              "first" =>  "Queila",
              "middle" =>  "S",
              "suffix" =>  null,
              "tempId" =>  122
            ],
            [
              "shortName" =>  "Gardner",
              "last" =>  "Gardner",
              "first" =>  "Alfred",
              "middle" =>  "L",
              "suffix" =>  null,
              "tempId" =>  123
            ],
            [
              "shortName" =>  "Gawlicka",
              "last" =>  "Gawlicka",
              "first" =>  "A",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  124
            ],
            [
              "shortName" =>  "Gentry",
              "last" =>  "Gentry",
              "first" =>  "Alwyn",
              "middle" =>  "H",
              "suffix" =>  null,
              "tempId" =>  125
            ],
            [
              "shortName" =>  "Giannini",
              "last" =>  "Giannini",
              "first" =>  "Norberto",
              "middle" =>  "P",
              "suffix" =>  null,
              "tempId" =>  126
            ],
            [
              "shortName" =>  "Gibbs",
              "last" =>  "Gibbs",
              "first" =>  "Peter",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  127
            ],
            [
              "shortName" =>  "Gillaumet",
              "last" =>  "Gillaumet",
              "first" =>  "J",
              "middle" =>  "L",
              "suffix" =>  null,
              "tempId" =>  128
            ],
            [
              "shortName" =>  "Godínez-Alvarez",
              "last" =>  "Godínez-Alvarez",
              "first" =>  "Hector",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  129
            ],
            [
              "shortName" =>  "Gomez",
              "last" =>  "Gomez",
              "first" =>  "M",
              "middle" =>  "E",
              "suffix" =>  null,
              "tempId" =>  130
            ],
            [
              "shortName" =>  "Goodwin(G)",
              "last" =>  "Goodwin(G)",
              "first" =>  "George",
              "middle" =>  "G",
              "suffix" =>  null,
              "tempId" =>  131
            ],
            [
              "shortName" =>  "Goodwin(R)",
              "last" =>  "Goodwin(R)",
              "first" =>  "Robert",
              "middle" =>  "E",
              "suffix" =>  null,
              "tempId" =>  132
            ],
            [
              "shortName" =>  "Gorchov",
              "last" =>  "Gorchov",
              "first" =>  "David",
              "middle" =>  "L",
              "suffix" =>  null,
              "tempId" =>  133
            ],
            [
              "shortName" =>  "Greenhall",
              "last" =>  "Greenhall",
              "first" =>  "Arthur",
              "middle" =>  "M",
              "suffix" =>  null,
              "tempId" =>  134
            ],
            [
              "shortName" =>  "Gribel",
              "last" =>  "Gribel",
              "first" =>  "Rogerio",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  135
            ],
            [
              "shortName" =>  "Guevara",
              "last" =>  "Guevara",
              "first" =>  "J",
              "middle" =>  "S",
              "suffix" =>  null,
              "tempId" =>  136
            ],
            [
              "shortName" =>  "Guimaraes",
              "last" =>  "Guimaraes",
              "first" =>  "Peter",
              "middle" =>  "R",
              "suffix" =>  null,
              "tempId" =>  137
            ],
            [
              "shortName" =>  "Gush",
              "last" =>  "Gush",
              "first" =>  "T",
              "middle" =>  "J",
              "suffix" =>  null,
              "tempId" =>  138
            ],
            [
              "shortName" =>  "Gutiérrez",
              "last" =>  "Gutiérrez",
              "first" =>  "J",
              "middle" =>  "E",
              "suffix" =>  null,
              "tempId" =>  139
            ],
            [
              "shortName" =>  "Hackforth-Jones",
              "last" =>  "Hackforth-Jones",
              "first" =>  "J",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  140
            ],
            [
              "shortName" =>  "Hamas",
              "last" =>  "Hamas",
              "first" =>  "M",
              "middle" =>  "J",
              "suffix" =>  null,
              "tempId" =>  141
            ],
            [
              "shortName" =>  "Hamrick",
              "last" =>  "Hamrick",
              "first" =>  "J",
              "middle" =>  "L",
              "suffix" =>  null,
              "tempId" =>  142
            ],
            [
              "shortName" =>  "Handley",
              "last" =>  "Handley",
              "first" =>  "C",
              "middle" =>  "O",
              "suffix" =>  "Jr",
              "tempId" =>  143
            ],
            [
              "shortName" =>  "Harris",
              "last" =>  "Harris",
              "first" =>  "B",
              "middle" =>  "J",
              "suffix" =>  null,
              "tempId" =>  144
            ],
            [
              "shortName" =>  "Hay",
              "last" =>  "Hay",
              "first" =>  "John",
              "middle" =>  "D",
              "suffix" =>  null,
              "tempId" =>  145
            ],
            [
              "shortName" =>  "Heithaus",
              "last" =>  "Heithaus",
              "first" =>  "E",
              "middle" =>  "Raymond",
              "suffix" =>  null,
              "tempId" =>  146
            ],
            [
              "shortName" =>  "Helena",
              "last" =>  "Helena",
              "first" =>  "B",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  147
            ],
            [
              "shortName" =>  "Henderson",
              "last" =>  "Henderson",
              "first" =>  "Andrew",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  148
            ],
            [
              "shortName" =>  "Henry",
              "last" =>  "Henry",
              "first" =>  "M",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  149
            ],
            [
              "shortName" =>  "Herbst",
              "last" =>  "Herbst",
              "first" =>  "Lawrence",
              "middle" =>  "H",
              "suffix" =>  null,
              "tempId" =>  150
            ],
            [
              "shortName" =>  "Hernandez",
              "last" =>  "Hernandez",
              "first" =>  "A",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  151
            ],
            [
              "shortName" =>  "Hernández-Conrique",
              "last" =>  "Hernández-Conrique",
              "first" =>  "David",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  152
            ],
            [
              "shortName" =>  "Herre",
              "last" =>  "Herre",
              "first" =>  "Edward",
              "middle" =>  "Allen",
              "suffix" =>  null,
              "tempId" =>  153
            ],
            [
              "shortName" =>  "Herrera",
              "last" =>  "Herrera",
              "first" =>  "L",
              "middle" =>  "Gerardo",
              "suffix" =>  null,
              "tempId" =>  154
            ],
            [
              "shortName" =>  "Herrera-M",
              "last" =>  "Herrera-M",
              "first" =>  "G",
              "middle" =>  "L",
              "suffix" =>  null,
              "tempId" =>  155
            ],
            [
              "shortName" =>  "Herrerías-Diego",
              "last" =>  "Herrerías-Diego",
              "first" =>  "Y",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  156
            ],
            [
              "shortName" =>  "Herzog",
              "last" =>  "Herzog",
              "first" =>  "S",
              "middle" =>  "K",
              "suffix" =>  null,
              "tempId" =>  157
            ],
            [
              "shortName" =>  "Hill",
              "last" =>  "Hill",
              "first" =>  "John",
              "middle" =>  "E",
              "suffix" =>  null,
              "tempId" =>  158
            ],
            [
              "shortName" =>  "Hobson",
              "last" =>  "Hobson",
              "first" =>  "K",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  159
            ],
            [
              "shortName" =>  "Hodges",
              "last" =>  "Hodges",
              "first" =>  "S",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  160
            ],
            [
              "shortName" =>  "Hokche",
              "last" =>  "Hokche",
              "first" =>  "Omaira",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  161
            ],
            [
              "shortName" =>  "Holland",
              "last" =>  "Holland",
              "first" =>  "J",
              "middle" =>  "N",
              "suffix" =>  null,
              "tempId" =>  162
            ],
            [
              "shortName" =>  "Hollander",
              "last" =>  "Hollander",
              "first" =>  "R",
              "middle" =>  "R",
              "suffix" =>  null,
              "tempId" =>  163
            ],
            [
              "shortName" =>  "Homan",
              "last" =>  "Homan",
              "first" =>  "J",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  164
            ],
            [
              "shortName" =>  "Hooper",
              "last" =>  "Hooper",
              "first" =>  "K",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  165
            ],
            [
              "shortName" =>  "Hopkins(H)",
              "last" =>  "Hopkins(H)",
              "first" =>  "Helen",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  166
            ],
            [
              "shortName" =>  "Hopkins(M)",
              "last" =>  "Hopkins(M)",
              "first" =>  "M",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  167
            ],
            [
              "shortName" =>  "Horn",
              "last" =>  "Horn",
              "first" =>  "M",
              "middle" =>  "H",
              "suffix" =>  null,
              "tempId" =>  168
            ],
            [
              "shortName" =>  "Horner",
              "last" =>  "Horner",
              "first" =>  "M",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  169
            ],
            [
              "shortName" =>  "Howell",
              "last" =>  "Howell",
              "first" =>  "D",
              "middle" =>  "J",
              "suffix" =>  null,
              "tempId" =>  170
            ],
            [
              "shortName" =>  "Huber",
              "last" =>  "Huber",
              "first" =>  "J",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  171
            ],
            [
              "shortName" =>  "Humphrey",
              "last" =>  "Humphrey",
              "first" =>  "Stephen",
              "middle" =>  "R",
              "suffix" =>  null,
              "tempId" =>  172
            ],
            [
              "shortName" =>  "Ibarra-Cerdeña",
              "last" =>  "Ibarra-Cerdeña",
              "first" =>  "Carlos",
              "middle" =>  "N",
              "suffix" =>  null,
              "tempId" =>  173
            ],
            [
              "shortName" =>  "Iñiguez-Dávalos",
              "last" =>  "Iñiguez-Dávalos",
              "first" =>  "L",
              "middle" =>  "I",
              "suffix" =>  null,
              "tempId" =>  174
            ],
            [
              "shortName" =>  "Inouye",
              "last" =>  "Inouye",
              "first" =>  "R",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  175
            ],
            [
              "shortName" =>  "Ippolito",
              "last" =>  "Ippolito",
              "first" =>  "Anthony",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  176
            ],
            [
              "shortName" =>  "Iudica",
              "last" =>  "Iudica",
              "first" =>  "Carlos",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  177
            ],
            [
              "shortName" =>  "Jakob",
              "last" =>  "Jakob",
              "first" =>  "E",
              "middle" =>  "M",
              "suffix" =>  null,
              "tempId" =>  178
            ],
            [
              "shortName" =>  "Janos",
              "last" =>  "Janos",
              "first" =>  "D",
              "middle" =>  "P",
              "suffix" =>  null,
              "tempId" =>  179
            ],
            [
              "shortName" =>  "Janzen",
              "last" =>  "Janzen",
              "first" =>  "D",
              "middle" =>  "H",
              "suffix" =>  null,
              "tempId" =>  180
            ],
            [
              "shortName" =>  "Jaramillo",
              "last" =>  "Jaramillo",
              "first" =>  "M",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  181
            ],
            [
              "shortName" =>  "Jarrín-V",
              "last" =>  "Jarrín-V",
              "first" =>  "Pablo",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  182
            ],
            [
              "shortName" =>  "Jimbo",
              "last" =>  "Jimbo",
              "first" =>  "S",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  183
            ],
            [
              "shortName" =>  "Jones",
              "last" =>  "Jones",
              "first" =>  "J",
              "middle" =>  "Knox",
              "suffix" =>  "Jr",
              "tempId" =>  184
            ],
            [
              "shortName" =>  "Jordano",
              "last" =>  "Jordano",
              "first" =>  "P",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  185
            ],
            [
              "shortName" =>  "Jouard",
              "last" =>  "Jouard",
              "first" =>  "S",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  186
            ],
            [
              "shortName" =>  "Kalko",
              "last" =>  "Kalko",
              "first" =>  "Elisabeth",
              "middle" =>  "K",
              "suffix" =>  null,
              "tempId" =>  187
            ],
            [
              "shortName" =>  "Kay",
              "last" =>  "Kay",
              "first" =>  "Elma",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  188
            ],
            [
              "shortName" =>  "Kessler",
              "last" =>  "Kessler",
              "first" =>  "M",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  189
            ],
            [
              "shortName" =>  "Kite",
              "last" =>  "Kite",
              "first" =>  "G",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  190
            ],
            [
              "shortName" =>  "Klitgaard",
              "last" =>  "Klitgaard",
              "first" =>  "B",
              "middle" =>  "B",
              "suffix" =>  null,
              "tempId" =>  191
            ],
            [
              "shortName" =>  "Knudsen",
              "last" =>  "Knudsen",
              "first" =>  "Jette",
              "middle" =>  "T",
              "suffix" =>  null,
              "tempId" =>  192
            ],
            [
              "shortName" =>  "Koch",
              "last" =>  "Koch",
              "first" =>  "Corinna",
              "middle" =>  "U",
              "suffix" =>  null,
              "tempId" =>  193
            ],
            [
              "shortName" =>  "Korine",
              "last" =>  "Korine",
              "first" =>  "Carmi",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  194
            ],
            [
              "shortName" =>  "Kremer",
              "last" =>  "Kremer",
              "first" =>  "A",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  195
            ],
            [
              "shortName" =>  "Kress",
              "last" =>  "Kress",
              "first" =>  "W",
              "middle" =>  "John",
              "suffix" =>  null,
              "tempId" =>  196
            ],
            [
              "shortName" =>  "Krömer",
              "last" =>  "Krömer",
              "first" =>  "Thorsten",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  197
            ],
            [
              "shortName" =>  "Kunz",
              "last" =>  "Kunz",
              "first" =>  "Thomas",
              "middle" =>  "H",
              "suffix" =>  null,
              "tempId" =>  198
            ],
            [
              "shortName" =>  "Leigh",
              "last" =>  "Leigh",
              "first" =>  "E",
              "middle" =>  "J",
              "suffix" =>  "Jr",
              "tempId" =>  199
            ],
            [
              "shortName" =>  "Leiner",
              "last" =>  "Leiner",
              "first" =>  "N",
              "middle" =>  "O",
              "suffix" =>  null,
              "tempId" =>  200
            ],
            [
              "shortName" =>  "Lemke",
              "last" =>  "Lemke",
              "first" =>  "Thomas",
              "middle" =>  "O",
              "suffix" =>  null,
              "tempId" =>  201
            ],
            [
              "shortName" =>  "Lescure",
              "last" =>  "Lescure",
              "first" =>  "Jean-Paul",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  202
            ],
            [
              "shortName" =>  "Leveau",
              "last" =>  "Leveau",
              "first" =>  "A",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  203
            ],
            [
              "shortName" =>  "Lewis",
              "last" =>  "Lewis",
              "first" =>  "Susan",
              "middle" =>  "E",
              "suffix" =>  null,
              "tempId" =>  204
            ],
            [
              "shortName" =>  "Linares",
              "last" =>  "Linares",
              "first" =>  "O",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  205
            ],
            [
              "shortName" =>  "Lobo",
              "last" =>  "Lobo",
              "first" =>  "Jorge",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  206
            ],
            [
              "shortName" =>  "Lobova",
              "last" =>  "Lobova",
              "first" =>  "Tatyana",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  207
            ],
            [
              "shortName" =>  "Locatelli",
              "last" =>  "Locatelli",
              "first" =>  "E",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  208
            ],
            [
              "shortName" =>  "Loiselle",
              "last" =>  "Loiselle",
              "first" =>  "B",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  209
            ],
            [
              "shortName" =>  "Lopes",
              "last" =>  "Lopes",
              "first" =>  "A",
              "middle" =>  "V",
              "suffix" =>  null,
              "tempId" =>  210
            ],
            [
              "shortName" =>  "Maas",
              "last" =>  "Maas",
              "first" =>  "Paul",
              "middle" =>  "J",
              "suffix" =>  null,
              "tempId" =>  211
            ],
            [
              "shortName" =>  "Machado",
              "last" =>  "Machado",
              "first" =>  "Isabel",
              "middle" =>  "Cristina",
              "suffix" =>  null,
              "tempId" =>  212
            ],
            [
              "shortName" =>  "Maggia",
              "last" =>  "Maggia",
              "first" =>  "L",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  213
            ],
            [
              "shortName" =>  "Maia",
              "last" =>  "Maia",
              "first" =>  "Nathan",
              "middle" =>  "S",
              "suffix" =>  null,
              "tempId" =>  214
            ],
            [
              "shortName" =>  "Mancina",
              "last" =>  "Mancina",
              "first" =>  "C",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  215
            ],
            [
              "shortName" =>  "Manzo-A",
              "last" =>  "Manzo-A",
              "first" =>  "A",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  216
            ],
            [
              "shortName" =>  "Marinho-Filho",
              "last" =>  "Marinho-Filho",
              "first" =>  "Jader",
              "middle" =>  "S",
              "suffix" =>  null,
              "tempId" =>  217
            ],
            [
              "shortName" =>  "Martínez del Rio",
              "last" =>  "Martínez del Rio",
              "first" =>  "Carlos",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  218
            ],
            [
              "shortName" =>  "Martino",
              "last" =>  "Martino",
              "first" =>  "Angela",
              "middle" =>  "M G",
              "suffix" =>  null,
              "tempId" =>  219
            ],
            [
              "shortName" =>  "Masson",
              "last" =>  "Masson",
              "first" =>  "D",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  220
            ],
            [
              "shortName" =>  "Maurice",
              "last" =>  "Maurice",
              "first" =>  "Sandrine",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  221
            ],
            [
              "shortName" =>  "McCracken",
              "last" =>  "McCracken",
              "first" =>  "Gary",
              "middle" =>  "F",
              "suffix" =>  null,
              "tempId" =>  222
            ],
            [
              "shortName" =>  "McGregor",
              "last" =>  "McGregor",
              "first" =>  "S",
              "middle" =>  "E",
              "suffix" =>  null,
              "tempId" =>  223
            ],
            [
              "shortName" =>  "Medeiros",
              "last" =>  "Medeiros",
              "first" =>  "P",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  224
            ],
            [
              "shortName" =>  "Medellín",
              "last" =>  "Medellín",
              "first" =>  "Rodrigo",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  225
            ],
            [
              "shortName" =>  "Mello",
              "last" =>  "Mello",
              "first" =>  "Marco",
              "middle" =>  "Aurelio R",
              "suffix" =>  null,
              "tempId" =>  226
            ],
            [
              "shortName" =>  "Mena",
              "last" =>  "Mena",
              "first" =>  "P",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  227
            ],
            [
              "shortName" =>  "Méndez-C",
              "last" =>  "Méndez-C",
              "first" =>  "G",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  228
            ],
            [
              "shortName" =>  "Mikich",
              "last" =>  "Mikich",
              "first" =>  "Sandra",
              "middle" =>  "Bos",
              "suffix" =>  null,
              "tempId" =>  229
            ],
            [
              "shortName" =>  "Miller",
              "last" =>  "Miller",
              "first" =>  "G",
              "middle" =>  "H",
              "suffix" =>  null,
              "tempId" =>  230
            ],
            [
              "shortName" =>  "Mirón-M",
              "last" =>  "Mirón-M",
              "first" =>  "L",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  231
            ],
            [
              "shortName" =>  "Molina-Freaner",
              "last" =>  "Molina-Freaner",
              "first" =>  "Francisco",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  232
            ],
            [
              "shortName" =>  "Molinari",
              "last" =>  "Molinari",
              "first" =>  "Jesus",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  233
            ],
            [
              "shortName" =>  "Morellato",
              "last" =>  "Morellato",
              "first" =>  "L",
              "middle" =>  "P C",
              "suffix" =>  null,
              "tempId" =>  234
            ],
            [
              "shortName" =>  "Mori",
              "last" =>  "Mori",
              "first" =>  "Scott",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  235
            ],
            [
              "shortName" =>  "Morrison",
              "last" =>  "Morrison",
              "first" =>  "Douglas",
              "middle" =>  "W",
              "suffix" =>  null,
              "tempId" =>  236
            ],
            [
              "shortName" =>  "Moura",
              "last" =>  "Moura",
              "first" =>  "M",
              "middle" =>  "O",
              "suffix" =>  null,
              "tempId" =>  237
            ],
            [
              "shortName" =>  "Muchhala",
              "last" =>  "Muchhala",
              "first" =>  "Nathan",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  238
            ],
            [
              "shortName" =>  "Muller",
              "last" =>  "Muller",
              "first" =>  "Marilia",
              "middle" =>  "Feleciano",
              "suffix" =>  null,
              "tempId" =>  239
            ],
            [
              "shortName" =>  "Mungía-Rosas",
              "last" =>  "Mungía-Rosas",
              "first" =>  "M",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  240
            ],
            [
              "shortName" =>  "Murgueitio",
              "last" =>  "Murgueitio",
              "first" =>  "E",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  241
            ],
            [
              "shortName" =>  "Murphy",
              "last" =>  "Murphy",
              "first" =>  "Peter",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  242
            ],
            [
              "shortName" =>  "Nagorsen",
              "last" =>  "Nagorsen",
              "first" =>  "D",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  243
            ],
            [
              "shortName" =>  "Naranjo",
              "last" =>  "Naranjo",
              "first" =>  "Maria",
              "middle" =>  "Elena",
              "suffix" =>  null,
              "tempId" =>  244
            ],
            [
              "shortName" =>  "Nason",
              "last" =>  "Nason",
              "first" =>  "J",
              "middle" =>  "D",
              "suffix" =>  null,
              "tempId" =>  245
            ],
            [
              "shortName" =>  "Nassar",
              "last" =>  "Nassar",
              "first" =>  "Jafet",
              "middle" =>  "M",
              "suffix" =>  null,
              "tempId" =>  246
            ],
            [
              "shortName" =>  "Navarro",
              "last" =>  "Navarro",
              "first" =>  "L",
              "middle" =>  "D",
              "suffix" =>  null,
              "tempId" =>  247
            ],
            [
              "shortName" =>  "Nellis",
              "last" =>  "Nellis",
              "first" =>  "D",
              "middle" =>  "W",
              "suffix" =>  null,
              "tempId" =>  248
            ],
            [
              "shortName" =>  "Noble",
              "last" =>  "Noble",
              "first" =>  "S",
              "middle" =>  "J",
              "suffix" =>  null,
              "tempId" =>  249
            ],
            [
              "shortName" =>  "Nogueira",
              "last" =>  "Nogueira",
              "first" =>  "Marcelo",
              "middle" =>  "R",
              "suffix" =>  null,
              "tempId" =>  250
            ],
            [
              "shortName" =>  "Nuñez",
              "last" =>  "Nuñez",
              "first" =>  "R",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  251
            ],
            [
              "shortName" =>  "Olin",
              "last" =>  "Olin",
              "first" =>  "G",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  252
            ],
            [
              "shortName" =>  "Oliviera",
              "last" =>  "Oliviera",
              "first" =>  "P",
              "middle" =>  "E",
              "suffix" =>  null,
              "tempId" =>  253
            ],
            [
              "shortName" =>  "Opler",
              "last" =>  "Opler",
              "first" =>  "P",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  254
            ],
            [
              "shortName" =>  "Orozco",
              "last" =>  "Orozco",
              "first" =>  "Alma",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  255
            ],
            [
              "shortName" =>  "Orozco-Segovia",
              "last" =>  "Orozco-Segovia",
              "first" =>  "A",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  256
            ],
            [
              "shortName" =>  "Ortega",
              "last" =>  "Ortega",
              "first" =>  "Jorge",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  257
            ],
            [
              "shortName" =>  "Owen(J)",
              "last" =>  "Owen(J)",
              "first" =>  "James",
              "middle" =>  "G",
              "suffix" =>  null,
              "tempId" =>  258
            ],
            [
              "shortName" =>  "Owen(R )",
              "last" =>  "Owen(R )",
              "first" =>  "Robert",
              "middle" =>  "D",
              "suffix" =>  null,
              "tempId" =>  259
            ],
            [
              "shortName" =>  "Palacios-Guevara",
              "last" =>  "Palacios-Guevara",
              "first" =>  "C",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  260
            ],
            [
              "shortName" =>  "Palmeirim",
              "last" =>  "Palmeirim",
              "first" =>  "J",
              "middle" =>  "M",
              "suffix" =>  null,
              "tempId" =>  261
            ],
            [
              "shortName" =>  "Passos",
              "last" =>  "Passos",
              "first" =>  "Fernando",
              "middle" =>  "C",
              "suffix" =>  null,
              "tempId" =>  262
            ],
            [
              "shortName" =>  "Peckham",
              "last" =>  "Peckham",
              "first" =>  "H",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  263
            ],
            [
              "shortName" =>  "Pedro",
              "last" =>  "Pedro",
              "first" =>  "W",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  264
            ],
            [
              "shortName" =>  "Peikert-Holle",
              "last" =>  "Peikert-Holle",
              "first" =>  "T",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  265
            ],
            [
              "shortName" =>  "Peixoto",
              "last" =>  "Peixoto",
              "first" =>  "M",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  266
            ],
            [
              "shortName" =>  "Pennington",
              "last" =>  "Pennington",
              "first" =>  "R",
              "middle" =>  "Toby",
              "suffix" =>  null,
              "tempId" =>  267
            ],
            [
              "shortName" =>  "Peracchi",
              "last" =>  "Peracchi",
              "first" =>  "Adriano",
              "middle" =>  "L",
              "suffix" =>  null,
              "tempId" =>  268
            ],
            [
              "shortName" =>  "Perret",
              "last" =>  "Perret",
              "first" =>  "Mathieu",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  269
            ],
            [
              "shortName" =>  "Peters",
              "last" =>  "Peters",
              "first" =>  "E",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  270
            ],
            [
              "shortName" =>  "Petit",
              "last" =>  "Petit",
              "first" =>  "Sophie",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  271
            ],
            [
              "shortName" =>  "Pine",
              "last" =>  "Pine",
              "first" =>  "R",
              "middle" =>  "H",
              "suffix" =>  null,
              "tempId" =>  272
            ],
            [
              "shortName" =>  "Pizo",
              "last" =>  "Pizo",
              "first" =>  "Marco",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  273
            ],
            [
              "shortName" =>  "Pond",
              "last" =>  "Pond",
              "first" =>  "C",
              "middle" =>  "M",
              "suffix" =>  null,
              "tempId" =>  274
            ],
            [
              "shortName" =>  "Potts",
              "last" =>  "Potts",
              "first" =>  "M",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  275
            ],
            [
              "shortName" =>  "Prance",
              "last" =>  "Prance",
              "first" =>  "Ghillean",
              "middle" =>  "T",
              "suffix" =>  null,
              "tempId" =>  276
            ],
            [
              "shortName" =>  "Prather",
              "last" =>  "Prather",
              "first" =>  "L",
              "middle" =>  "Alan",
              "suffix" =>  null,
              "tempId" =>  277
            ],
            [
              "shortName" =>  "Prévost",
              "last" =>  "Prévost",
              "first" =>  "Marie-Françoise",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  278
            ],
            [
              "shortName" =>  "Puig",
              "last" =>  "Puig",
              "first" =>  "H",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  279
            ],
            [
              "shortName" =>  "Queiróz",
              "last" =>  "Queiróz",
              "first" =>  "A",
              "middle" =>  "L",
              "suffix" =>  null,
              "tempId" =>  280
            ],
            [
              "shortName" =>  "Quesada",
              "last" =>  "Quesada",
              "first" =>  "Mauricio",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  281
            ],
            [
              "shortName" =>  "Ramírez-P",
              "last" =>  "Ramírez-P",
              "first" =>  "Nicte",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  282
            ],
            [
              "shortName" =>  "Ramírez",
              "last" =>  "Ramírez",
              "first" =>  "Nelson",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  283
            ],
            [
              "shortName" =>  "Raw",
              "last" =>  "Raw",
              "first" =>  "A",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  284
            ],
            [
              "shortName" =>  "Reid",
              "last" =>  "Reid",
              "first" =>  "William",
              "middle" =>  "H",
              "suffix" =>  null,
              "tempId" =>  285
            ],
            [
              "shortName" =>  "Reis",
              "last" =>  "Reis",
              "first" =>  "Nelio",
              "middle" =>  "Roberto dos",
              "suffix" =>  null,
              "tempId" =>  286
            ],
            [
              "shortName" =>  "Rengifo",
              "last" =>  "Rengifo",
              "first" =>  "Carlos",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  287
            ],
            [
              "shortName" =>  "Reyer",
              "last" =>  "Reyer",
              "first" =>  "H",
              "middle" =>  "U",
              "suffix" =>  null,
              "tempId" =>  288
            ],
            [
              "shortName" =>  "Rezende",
              "last" =>  "Rezende",
              "first" =>  "J",
              "middle" =>  "L P",
              "suffix" =>  null,
              "tempId" =>  289
            ],
            [
              "shortName" =>  "Rieger",
              "last" =>  "Rieger",
              "first" =>  "James",
              "middle" =>  "F",
              "suffix" =>  null,
              "tempId" =>  290
            ],
            [
              "shortName" =>  "Rodríguez",
              "last" =>  "Rodríguez",
              "first" =>  "A",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  291
            ],
            [
              "shortName" =>  "Rojas",
              "last" =>  "Rojas",
              "first" =>  "J",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  292
            ],
            [
              "shortName" =>  "Rojas-Martínez",
              "last" =>  "Rojas-Martínez",
              "first" =>  "Alberto",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  293
            ],
            [
              "shortName" =>  "Romo",
              "last" =>  "Romo",
              "first" =>  "Monica",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  294
            ],
            [
              "shortName" =>  "Rosas-Guerrero",
              "last" =>  "Rosas-Guerrero",
              "first" =>  "Victor",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  295
            ],
            [
              "shortName" =>  "Rossell",
              "last" =>  "Rossell",
              "first" =>  "O",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  296
            ],
            [
              "shortName" =>  "Roth",
              "last" =>  "Roth",
              "first" =>  "B",
              "middle" =>  "S",
              "suffix" =>  null,
              "tempId" =>  297
            ],
            [
              "shortName" =>  "Ruiz",
              "last" =>  "Ruiz",
              "first" =>  "Adriana",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  298
            ],
            [
              "shortName" =>  "Ruiz-Zapata",
              "last" =>  "Ruiz-Zapata",
              "first" =>  "Thirza",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  299
            ],
            [
              "shortName" =>  "Runkle",
              "last" =>  "Runkle",
              "first" =>  "James",
              "middle" =>  "R",
              "suffix" =>  null,
              "tempId" =>  300
            ],
            [
              "shortName" =>  "Ruschi",
              "last" =>  "Ruschi",
              "first" =>  "A",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  301
            ],
            [
              "shortName" =>  "Sabatier",
              "last" =>  "Sabatier",
              "first" =>  "Daniel",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  302
            ],
            [
              "shortName" =>  "Saborío",
              "last" =>  "Saborío",
              "first" =>  "G",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  303
            ],
            [
              "shortName" =>  "Sahley",
              "last" =>  "Sahley",
              "first" =>  "Catherine",
              "middle" =>  "T",
              "suffix" =>  null,
              "tempId" =>  304
            ],
            [
              "shortName" =>  "Salas",
              "last" =>  "Salas",
              "first" =>  "D",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  305
            ],
            [
              "shortName" =>  "Salazar",
              "last" =>  "Salazar",
              "first" =>  "K",
              "middle" =>  "A O",
              "suffix" =>  null,
              "tempId" =>  306
            ],
            [
              "shortName" =>  "Sanchez-Casas",
              "last" =>  "Sanchez-Casas",
              "first" =>  "N",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  307
            ],
            [
              "shortName" =>  "Sánchez-Cordero",
              "last" =>  "Sánchez-Cordero",
              "first" =>  "V",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  308
            ],
            [
              "shortName" =>  "Santos",
              "last" =>  "Santos",
              "first" =>  "M",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  309
            ],
            [
              "shortName" =>  "Savolainens",
              "last" =>  "Savolainens",
              "first" =>  "V",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  310
            ],
            [
              "shortName" =>  "Sawyer",
              "last" =>  "Sawyer",
              "first" =>  "W",
              "middle" =>  "B",
              "suffix" =>  null,
              "tempId" =>  311
            ],
            [
              "shortName" =>  "Sazima(I)",
              "last" =>  "Sazima(I)",
              "first" =>  "Ivan",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  312
            ],
            [
              "shortName" =>  "Sazima(M)",
              "last" =>  "Sazima(M)",
              "first" =>  "Marlies",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  313
            ],
            [
              "shortName" =>  "Schittini",
              "last" =>  "Schittini",
              "first" =>  "G",
              "middle" =>  "M",
              "suffix" =>  null,
              "tempId" =>  314
            ],
            [
              "shortName" =>  "Schnitzler",
              "last" =>  "Schnitzler",
              "first" =>  "H",
              "middle" =>  "U",
              "suffix" =>  null,
              "tempId" =>  315
            ],
            [
              "shortName" =>  "Schwager",
              "last" =>  "Schwager",
              "first" =>  "J",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  316
            ],
            [
              "shortName" =>  "Schwassmann",
              "last" =>  "Schwassmann",
              "first" =>  "H",
              "middle" =>  "O",
              "suffix" =>  null,
              "tempId" =>  317
            ],
            [
              "shortName" =>  "Scogin",
              "last" =>  "Scogin",
              "first" =>  "Ron",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  318
            ],
            [
              "shortName" =>  "Shanahan",
              "last" =>  "Shanahan",
              "first" =>  "Mike",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  319
            ],
            [
              "shortName" =>  "Silva",
              "last" =>  "Silva",
              "first" =>  "W",
              "middle" =>  "R",
              "suffix" =>  null,
              "tempId" =>  320
            ],
            [
              "shortName" =>  "Silva-Taboada",
              "last" =>  "Silva-Taboada",
              "first" =>  "Gilberto",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  321
            ],
            [
              "shortName" =>  "Simmons",
              "last" =>  "Simmons",
              "first" =>  "Nancy",
              "middle" =>  "B",
              "suffix" =>  null,
              "tempId" =>  322
            ],
            [
              "shortName" =>  "Slauson",
              "last" =>  "Slauson",
              "first" =>  "Liz",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  323
            ],
            [
              "shortName" =>  "Smith(J)",
              "last" =>  "Smith(J)",
              "first" =>  "J",
              "middle" =>  "D",
              "suffix" =>  null,
              "tempId" =>  324
            ],
            [
              "shortName" =>  "Smith(R )",
              "last" =>  "Smith(R )",
              "first" =>  "Robert",
              "middle" =>  "L",
              "suffix" =>  null,
              "tempId" =>  325
            ],
            [
              "shortName" =>  "Snow",
              "last" =>  "Snow",
              "first" =>  "Jennifer L",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  326
            ],
            [
              "shortName" =>  "So",
              "last" =>  "So",
              "first" =>  "Samson",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  327
            ],
            [
              "shortName" =>  "Sobrevila",
              "last" =>  "Sobrevila",
              "first" =>  "Claudia",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  328
            ],
            [
              "shortName" =>  "Solari-T",
              "last" =>  "Solari-T",
              "first" =>  "Sergio",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  329
            ],
            [
              "shortName" =>  "Soriano",
              "last" =>  "Soriano",
              "first" =>  "Pascual",
              "middle" =>  "J",
              "suffix" =>  null,
              "tempId" =>  330
            ],
            [
              "shortName" =>  "Sosa",
              "last" =>  "Sosa",
              "first" =>  "M",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  331
            ],
            [
              "shortName" =>  "Spichiger",
              "last" =>  "Spichiger",
              "first" =>  "R",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  332
            ],
            [
              "shortName" =>  "Starrett",
              "last" =>  "Starrett",
              "first" =>  "Andrew",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  333
            ],
            [
              "shortName" =>  "Stashko",
              "last" =>  "Stashko",
              "first" =>  "E",
              "middle" =>  "R",
              "suffix" =>  null,
              "tempId" =>  334
            ],
            [
              "shortName" =>  "Steiner",
              "last" =>  "Steiner",
              "first" =>  "Kim",
              "middle" =>  "E",
              "suffix" =>  null,
              "tempId" =>  335
            ],
            [
              "shortName" =>  "Sternberg",
              "last" =>  "Sternberg",
              "first" =>  "Leonel",
              "middle" =>  "da S L",
              "suffix" =>  null,
              "tempId" =>  336
            ],
            [
              "shortName" =>  "Stoleson",
              "last" =>  "Stoleson",
              "first" =>  "S",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  337
            ],
            [
              "shortName" =>  "Stone",
              "last" =>  "Stone",
              "first" =>  "Donald",
              "middle" =>  "E",
              "suffix" =>  null,
              "tempId" =>  338
            ],
            [
              "shortName" =>  "Stoner",
              "last" =>  "Stoner",
              "first" =>  "Kathryn",
              "middle" =>  "E",
              "suffix" =>  null,
              "tempId" =>  339
            ],
            [
              "shortName" =>  "Storz",
              "last" =>  "Storz",
              "first" =>  "J",
              "middle" =>  "F",
              "suffix" =>  null,
              "tempId" =>  340
            ],
            [
              "shortName" =>  "Stroo",
              "last" =>  "Stroo",
              "first" =>  "A",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  341
            ],
            [
              "shortName" =>  "Suarez",
              "last" =>  "Suarez",
              "first" =>  "Andrew",
              "middle" =>  "V",
              "suffix" =>  null,
              "tempId" =>  342
            ],
            [
              "shortName" =>  "Taddei",
              "last" =>  "Taddei",
              "first" =>  "v",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  343
            ],
            [
              "shortName" =>  "Tamsitt",
              "last" =>  "Tamsitt",
              "first" =>  "J",
              "middle" =>  "R",
              "suffix" =>  null,
              "tempId" =>  344
            ],
            [
              "shortName" =>  "Teixeira",
              "last" =>  "Teixeira",
              "first" =>  "S",
              "middle" =>  "D",
              "suffix" =>  null,
              "tempId" =>  345
            ],
            [
              "shortName" =>  "Tellez",
              "last" =>  "Tellez",
              "first" =>  "Guillermo",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  346
            ],
            [
              "shortName" =>  "Thies",
              "last" =>  "Thies",
              "first" =>  "Wibke",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  347
            ],
            [
              "shortName" =>  "Thomas",
              "last" =>  "Thomas",
              "first" =>  "Donald",
              "middle" =>  "W",
              "suffix" =>  null,
              "tempId" =>  348
            ],
            [
              "shortName" =>  "Torres",
              "last" =>  "Torres",
              "first" =>  "A",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  349
            ],
            [
              "shortName" =>  "Trejo",
              "last" =>  "Trejo",
              "first" =>  "Lourdes",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  350
            ],
            [
              "shortName" =>  "Trigo",
              "last" =>  "Trigo",
              "first" =>  "Jose",
              "middle" =>  "Roberto",
              "suffix" =>  null,
              "tempId" =>  351
            ],
            [
              "shortName" =>  "Tschapka",
              "last" =>  "Tschapka",
              "first" =>  "Marco",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  352
            ],
            [
              "shortName" =>  "Tuomisto",
              "last" =>  "Tuomisto",
              "first" =>  "H",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  353
            ],
            [
              "shortName" =>  "Turner",
              "last" =>  "Turner",
              "first" =>  "M",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  354
            ],
            [
              "shortName" =>  "Tuttle",
              "last" =>  "Tuttle",
              "first" =>  "M",
              "middle" =>  "D",
              "suffix" =>  null,
              "tempId" =>  355
            ],
            [
              "shortName" =>  "Uhl",
              "last" =>  "Uhl",
              "first" =>  "Christopher",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  356
            ],
            [
              "shortName" =>  "Uieda",
              "last" =>  "Uieda",
              "first" =>  "Wilson",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  357
            ],
            [
              "shortName" =>  "Valiente-Banuet",
              "last" =>  "Valiente-Banuet",
              "first" =>  "Alfonso",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  358
            ],
            [
              "shortName" =>  "van Bradshaw",
              "last" =>  "van Bradshaw",
              "first" =>  "Paul",
              "middle" =>  "A",
              "suffix" =>  null,
              "tempId" =>  359
            ],
            [
              "shortName" =>  "van der Pijl",
              "last" =>  "van der Pijl",
              "first" =>  "L",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  360
            ],
            [
              "shortName" =>  "Varassin",
              "last" =>  "Varassin",
              "first" =>  "Isabela",
              "middle" =>  "G",
              "suffix" =>  null,
              "tempId" =>  361
            ],
            [
              "shortName" =>  "Vasconcellos-Neto",
              "last" =>  "Vasconcellos-Neto",
              "first" =>  "Joao",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  362
            ],
            [
              "shortName" =>  "Vázquez-Yanes",
              "last" =>  "Vázquez-Yanes",
              "first" =>  "Carlos",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  363
            ],
            [
              "shortName" =>  "Vega",
              "last" =>  "Vega",
              "first" =>  "E",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  364
            ],
            [
              "shortName" =>  "Villa Cornejo",
              "last" =>  "Villa Cornejo",
              "first" =>  "M",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  365
            ],
            [
              "shortName" =>  "Villa-R",
              "last" =>  "Villa-R",
              "first" =>  "B",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  366
            ],
            [
              "shortName" =>  "Vogel",
              "last" =>  "Vogel",
              "first" =>  "Stefan",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  367
            ],
            [
              "shortName" =>  "Voigt",
              "last" =>  "Voigt",
              "first" =>  "C",
              "middle" =>  "C",
              "suffix" =>  null,
              "tempId" =>  368
            ],
            [
              "shortName" =>  "von Helversen(D)",
              "last" =>  "von Helversen(D)",
              "first" =>  "Dagmar",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  369
            ],
            [
              "shortName" =>  "von Helversen(O)",
              "last" =>  "von Helversen(O)",
              "first" =>  "Otto",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  370
            ],
            [
              "shortName" =>  "Voss",
              "last" =>  "Voss",
              "first" =>  "Robert",
              "middle" =>  "S",
              "suffix" =>  null,
              "tempId" =>  371
            ],
            [
              "shortName" =>  "Waring",
              "last" =>  "Waring",
              "first" =>  "Gwendolyn",
              "middle" =>  "L",
              "suffix" =>  null,
              "tempId" =>  372
            ],
            [
              "shortName" =>  "Webster",
              "last" =>  "Webster",
              "first" =>  "W",
              "middle" =>  "David",
              "suffix" =>  null,
              "tempId" =>  373
            ],
            [
              "shortName" =>  "Wendeln",
              "last" =>  "Wendeln",
              "first" =>  "Marcia",
              "middle" =>  "C",
              "suffix" =>  null,
              "tempId" =>  374
            ],
            [
              "shortName" =>  "Westra",
              "last" =>  "Westra",
              "first" =>  "L",
              "middle" =>  "Y T",
              "suffix" =>  null,
              "tempId" =>  375
            ],
            [
              "shortName" =>  "Wetterer",
              "last" =>  "Wetterer",
              "first" =>  "Andrea",
              "middle" =>  "L",
              "suffix" =>  null,
              "tempId" =>  376
            ],
            [
              "shortName" =>  "Williams",
              "last" =>  "Williams",
              "first" =>  "C",
              "middle" =>  "F",
              "suffix" =>  null,
              "tempId" =>  377
            ],
            [
              "shortName" =>  "Willig",
              "last" =>  "Willig",
              "first" =>  "Michael",
              "middle" =>  "R",
              "suffix" =>  null,
              "tempId" =>  378
            ],
            [
              "shortName" =>  "Willis",
              "last" =>  "Willis",
              "first" =>  "K",
              "middle" =>  "B",
              "suffix" =>  null,
              "tempId" =>  379
            ],
            [
              "shortName" =>  "Wilson",
              "last" =>  "Wilson",
              "first" =>  "Don",
              "middle" =>  "E",
              "suffix" =>  null,
              "tempId" =>  380
            ],
            [
              "shortName" =>  "Zortéa",
              "last" =>  "Zortéa",
              "first" =>  "M",
              "middle" =>  null,
              "suffix" =>  null,
              "tempId" =>  381
            ],
            [
              "shortName" =>  "Zusi",
              "last" =>  "Zusi",
              "first" =>  "Richard",
              "middle" =>  "L",
              "suffix" =>  null,
              "tempId" =>  382
            ]
        ];
    }
}
