<?php

namespace Application\Migrations;

use AppBundle\Entity\Location;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;

use Symfony\Component\DependencyInjection\ContainerInterface;
/**
 * @up Creates a Location entity for each country that does not already exist.
 */
class Version20170405200118Countries extends AbstractMigration implements ContainerAwareInterface
{

    private $container;
    private $em;
    private $admin;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
        $this->em = $container->get('doctrine.orm.entity_manager');
        $this->admin = $this->em->getRepository('AppBundle:User')
            ->findOneBy(['id' => 6]);
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $regions = $this->getRegions(); print("regions = ". print_r($regions, TRUE)."\n");
        $this->addCountriesFromRegions(null, $this->getRegions());
        $this->em->flush();
    }

    private function addCountriesFromRegions($pRegion, $regions)
    {                                                                           //print("collection of sub-regions for ".print_r($regions)."\n");
        foreach ($regions as $rName => $regionColl) {
            $regionEntity = $this->getEntity($rName, $pRegion, 1);
            if (is_array($regionColl)) { 
                $this->addCountries($regionEntity, $regionColl);
            } else { 
                $this->addCountriesFromRegions($regionEntity, $regionColl); 
            }
        }
    }
    private function addCountries($region, $countries)
    {                                                                           print("collection of countries for ".$region."\n"); 
        foreach ($countries as $country) {
            $entity = $this->getEntity($country, $region, 2);  if (!$entity) {print("\n####There should be a country entity here.###\n");}
        }
    }

    private function getEntity($eName, $pRegion, $locTypeId)  
    {
        $entityName = str_replace("_", " ", $eName);
        $entity = $this->em->getRepository('AppBundle:Location')
            ->findOneBy(['displayName' => $entityName]);
        return $entity ?: $this->createEntity($entityName, $pRegion, $locTypeId);
    }
    private function createEntity($entityName, $pRegion, $locTypeId)       
    {                                                                           print("creating new location. [".$entityName."] with parent [".$pRegion."]\n"); 
        $entity = new Location();
        $entity->setDisplayName($entityName);
        $entity->setCreatedBy($this->admin);
        $entity->setLocationType(
            $this->em->getRepository('AppBundle:LocationType')
                ->findOneBy(['id' => $locTypeId]));
        if ($pRegion) { $entity->setParentLoc($pRegion); }
        $this->em->persist($entity);
        return $entity;
    }

    private function getRegions()
    {
        return json_decode(
        '{
          "Asia": {
            "West_&_Central_Asia": [
              "Afghanistan",
              "Armenia",
              "Azerbaijan",
              "Bahrain",
              "Cyprus",
              "Georgia",
              "Iran, Islamic Republic of",
              "Iraq",
              "Israel",
              "Jordan",
              "Kazakhstan",
              "Kuwait",
              "Kyrgyzstan",
              "Lebanon",
              "Oman",
              "Pakistan",
              "Palestine, State of",
              "Qatar",
              "Saudi Arabia",
              "Syrian Arab Republic",
              "Tajikistan",
              "Turkey",
              "Turkmenistan",
              "United Arab Emirates",
              "Uzbekistan",
              "Yemen [includes the island of Socotra]"
            ],
            "North_Asia": [
              "Belarus",
              "Moldova",
              "Russian Federation",
              "Ukraine"
            ],
            "East_Asia": [
              "China",
              "Hong Kong",
              "Japan",
              "Korea, Democratic People\'s Republic of",
              "Korea, Republic of",
              "Macao",
              "Mongolia",
              "Taiwan, Province of China"
            ],
            "South_&_Southeast_Asia": [
              "Bangladesh",
              "Bhutan",
              "British Indian Ocean Territory [includes the Chagos Archipelago]",
              "Brunei Darussalam",
              "Cambodia",
              "Disputed Territory [includes the Paracel Islands and Spratly Islands]",
              "India [includes the Andaman, Laccadive and Nicobar island groups]",
              "Indonesia",
              "Lao People\'s Democratic Republic",
              "Malaysia",
              "Maldives",
              "Myanmar",
              "Nepal",
              "Philippines",
              "Singapore",
              "Sri Lanka",
              "Thailand",
              "Timor-Leste",
              "Viet Nam"
            ]
          },
          "Europe": [
            "Aland Islands",
            "Albania",
            "Andorra",
            "Austria",
            "Belgium",
            "Bosnia and Herzegovina",
            "Bulgaria",
            "Croatia",
            "Czech Republic",
            "Denmark",
            "Estonia",
            "Faroe Islands",
            "Finland [excludes the \u00c5land Islands]",
            "France [includes Clipperton Island in the eastern Pacific Ocean]",
            "Germany",
            "Gibraltar",
            "Greece",
            "Greenland",
            "Guernsey",
            "Holy See (Vatican City State)",
            "Hungary",
            "Iceland",
            "Ireland",
            "Isle of Man",
            "Italy",
            "Latvia",
            "Liechtenstein",
            "Lithuania",
            "Luxembourg",
            "Macedonia, the former Yugoslav Republic of",
            "Malta",
            "Monaco",
            "Montenegro",
            "Netherlands",
            "Norway",
            "Poland",
            "Portugal [includes the Azores, Madeira and the Selvagens islands]",
            "Romania",
            "San Marino",
            "Serbia",
            "Slovakia",
            "Slovenia",
            "Spain [includes the Belearic and Canary islands and the Spanish North African Territories]",
            "Svalbard and Jan Mayen",
            "Sweden",
            "Switzerland",
            "United Kingdom [excludes Guernsey, Jersey and Isle of Man]"
          ],
          "Antarctic": [
            "Bouvet Island",
            "French Southern Territories [includes the Amsterdam-St Paul, Crozet, Kerguelen and Mozambique Channel island groups]",
            "Heard Island and McDonald Islands",
            "South Georgia and the South Sandwich Islands"
          ],
          "Caribbean_Islands": [
            "Anguilla",
            "Antigua and Barbuda",
            "Aruba",
            "Bahamas",
            "Barbados",
            "Bermuda",
            "Cayman Islands",
            "Bonaire, Sint Eustatius and Saba",
            "Cuba",
            "Dominica",
            "Cura\u00e7ao",
            "Dominican Republic",
            "Grenada",
            "Guadeloupe",
            "Haiti",
            "Jamaica",
            "Martinique",
            "Montserrat",
            "Puerto Rico",
            "Saint Bath\u00e9lemy",
            "Saint Kitts and Nevis",
            "Saint Lucia",
            "Saint Martin (French Part)",
            "Saint Vincent and the Grenadines",
            "Sint Maarten (Dutch Part)",
            "Trinidad and Tobago",
            "Turks and Caicos Islands",
            "Virgin Islands, British",
            "Virgin Islands, U.S."
          ],
          "Central_America": [
            "Belize",
            "Costa Rica",
            "El Salvador",
            "Guatemala",
            "Honduras",
            "Mexico",
            "Nicaragua",
            "Panama"
          ],
          "North_America": [
            "Canada",
            "Saint Pierre and Miquelon",
            "United States"
          ],
          "Africa": {
            "Sub-Saharan_Africa": [
              "Angola",
              "Benin",
              "Botswana",
              "Burkina Faso",
              "Burundi",
              "Cameroon",
              "Cape Verde",
              "Central African Republic",
              "Chad",
              "Comoros",
              "Congo",
              "Congo, The Democratic Republic of the",
              "C\u00f4te d\'Ivoire",
              "Djibouti",
              "Equatorial Guinea [includes the islands of Annob\u00f3n and Bioko]",
              "Eritrea",
              "Ethiopia",
              "Gabon",
              "Gambia",
              "Ghana",
              "Guinea",
              "Guinea-Bissau",
              "Kenya",
              "Lesotho",
              "Liberia",
              "Madagascar",
              "Malawi",
              "Mali",
              "Mauritania",
              "Mauritius [includes Rodrigues]",
              "Mayotte",
              "Mozambique",
              "Namibia",
              "Niger",
              "Nigeria",
              "R\u00e9union",
              "Rwanda",
              "Saint Helena, Ascension and Tristan da Cunha",
              "Sao Tom\u00e9 and Principe",
              "Senegal",
              "Seychelles [includes the island of Aldabra]",
              "Sierra Leone",
              "Somalia",
              "South Africa [includes Marion and Prince Edward Islands]",
              "South Sudan",
              "Sudan",
              "Swaziland",
              "Tanzania, United Republic of",
              "Togo",
              "Uganda",
              "Zambia",
              "Zimbabwe"
            ],
            "North_Africa": [
              "Algeria",
              "Egypt",
              "Libya",
              "Morocco",
              "Tunisia",
              "Western Sahara"
            ]
          },
          "South_America": [
            "Argentina",
            "Bolivia, Plurinational State of",
            "Brazil",
            "Chile [includes Easter Island]",
            "Colombia",
            "Ecuador [includes the Gal\u00e1pagos islands]",
            "Falkland Islands (Malvinas)",
            "French Guiana",
            "Guyana",
            "Paraguay",
            "Peru",
            "Suriname",
            "Uruguay",
            "Venezuela, Bolivarian Republic of"
          ],
          "Oceania": [
            "American Samoa",
            "Australia [includes the island groups of Ashmore-Cartier, Lord Howe and Macquarie]",
            "Christmas Island",
            "Cocos (Keeling) Islands",
            "Cook Islands",
            "Fiji",
            "French Polynesia [includes the island groups of the Marquesas, Society, Tuamotu and Tubai]",
            "Guam",
            "Kiribati [includes the Gilbert, Kiribati Line and Phoenix island groups]",
            "Marshall Islands",
            "Micronesia, Federated States of",
            "Nauru",
            "New Caledonia",
            "New Zealand [includes the Antipodean, Chatham and Kermadec island groups]",
            "Niue",
            "Norfolk Island",
            "Northern Mariana Islands",
            "Palau",
            "Papua New Guinea [includes the Bismarck Archipelago and the North Solomons]",
            "Pitcairn",
            "Samoa",
            "Solomon Islands",
            "Tokelau",
            "Tonga",
            "Tuvalu",
            "United States Minor Outlying Islands [includes the Howland-Baker, Johnston, Midway, US Line and Wake island groups]",
            "Vanuatu",
            "Wallis and Futuna"
          ]
        }');
    }



    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {

    }
}
