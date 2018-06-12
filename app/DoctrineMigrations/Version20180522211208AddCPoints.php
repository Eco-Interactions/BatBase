<?php

namespace Application\Migrations;

use AppBundle\Entity\GeoJson;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Fills in the center_point property of country geoJson objects. 
 */
class Version20180522211208AddCPoints extends AbstractMigration implements ContainerAwareInterface
{

    private $container;
    private $em;
    private $admin;

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

        $cntrys = $this->getCenterPoints();

        foreach ($cntrys as $cntry => $point) {
            $this->addPointToGeoJson($cntry, $this->flipPointAryReturnString($point));
        }
        $this->em->flush();
    }
    /**
     * Leaflet uses lat, long format and geoJson uses long, lat.
     * I got most of these points using methods via leaflet and the geojson objects
     */
    private function flipPointAryReturnString($point)
    {
        return json_encode([$point[1], $point[0]]);
    }

    private function addPointToGeoJson($name, $point)
    {
        $loc = $this->em->getRepository('AppBundle:Location')
            ->findOneBy(['displayName' => $name]); 
        $geoJson = $loc->getGeoJson();
        if (!$geoJson) { return $this->createGeoJson($loc, $point); }
        $geoJson->setCenterPoint($point);
        $this->em->persist($geoJson);
    }
    private function createGeoJson($loc, $point)
    {
        $geoJson = new GeoJson();
        $geoJson->setCenterPoint($point);
        $geoJson->setCoordinates($point);
        $geoJson->setType('point');
        $geoJson->setLocation($loc);
        $geoJson->setCreatedBy($this->admin);

        $loc->setGeoJson($geoJson);

        $this->em->persist($geoJson);        
        $this->em->persist($loc); 
        $this->em->flush();       
    }

    private function getCenterPoints()
    {
        return [
            "Africa" => [ 10.965031679524095, 19.599609375000004 ],
            "Central & South America-Forest" => [ 6.857472618910672, -79.13452148437501 ],
            "Central & South America" => [ 6.857472618910672, -79.13452148437501 ],
            "South America" => [ -6.35693973013903, -60.38085937500001 ],
            "Asia" => [ 34.0479, 100.6197 ],
            "Europe" => [ 15.2551, 54.5260 ], 
            "North America" => [ 39.5260, -105.2551 ],
            "Central America" => [ 12.7690, -85.6024 ],
            "Oceania" => [ 140.0188, -22.7359 ],
            "Caribbean Islands" => [ -68.6569, 20.4691 ],
            "China" => [ 34.672410587, 104.187417847 ],
            "French Antilles" =>[16.4167, -62.1441],
            "Borneo" =>[0.9619, 114.5548],
            "Malaysia" => [ 4.103575341000091, 109.4616574225 ],
            "Thailand" => [ 13.037448222000052, 101.5011993815 ],
            "Honduras" => [ 15.199211938, -86.24711656049999 ],
            "Panama" => [ 8.4175038580002, -80.1082580165 ],
            "Jamaica" => [ 18.114142157, -77.28132076700001 ],
            "Mauritius" => [ -20.348404, 57.552152 ],
            "Australia" => [ -25.73310674458969, 135.08789062500003 ],
            "Sri Lanka" => [ 7.87665436450015, 80.77304121200001 ],
            "India" => [ 21.12047821350005, 82.75282779599999 ],
            "Venezuela" => [ 8.176131900000035, -66.603371745 ],
            "Peru" => [ -9.183419459468933, -75.010905006 ],
            "Puerto Rico" => [ 18.22284577, -66.59121660049999 ],
            "Guyana" => [ 4.8719151845001, -58.93926591 ],
            "El Salvador" => [ 13.802004703000001, -88.90398626199999 ],
            "Cuba" => [ 21.5466983095, -79.5412491525 ],
            "Argentina" => [ -38.419476823500005, -63.62479386449999 ],
            "Ivory Coast" => [ 7.53526988050005, -5.5625239664999 ],
            "Uganda" => [ 1.3722429405001502, 32.277466064 ],
            "Japan" => [ 34.8662580425, 138.4618839855 ],
            "Lebanon" => [ 33.8715641275, 35.851860592 ],
            "Israel" => [ 31.4482065865, 35.0682117035 ],
            "Fiji" => [ -17.7134, 178.0650 ],
            "Nigeria" => [ 9.076226504500049, 8.67050907350005 ],
            "Seychelles [includes the island of Aldabra]" => [ -6.7733293594999, 51.2474064465 ],
            "Brazil" => [ -14.23752777099995, -51.4477696365 ],
            "Costa Rica" => [ 8.36250956500005, -84.840251021 ],
            "Mexico" => [ 23.629559664682, -102.53469791500001 ],
            "Colombia" => [ 4.6709353665001, -74.299382084 ],
            "Trinidad and Tobago" => [ 10.696559962999999, -61.2253922195 ],
            "Uruguay" => [ -32.535136207, -55.775098637 ],
            "United States" => [ 39.8333333, -98.585522 ],
            "Ghana" => [ 7.950032657000051, -1.0372704670000001 ],
            "Indonesia" => [ -2.50625986099995, 117.9951664595 ],
            "Niue" => [ -19.053399347, -169.8666682605 ],
            "Suriname" => [ 3.9225402705001002, -56.027024328500005 ],
            "Ecuador" => [ -1.2257403848445083, -78.3160400390625 ],
            "Virgin Islands, British" => [ 18.5404523785, -64.5223689445 ],
            "Bolivia" => [ -16.28853953, -63.566076518500005 ],
            "Tanzania, United Republic of" => [ -6.3585513309999095, 34.885211829 ],
            "Northern Mariana Islands" => [ 17.3330345725, 145.3855086595 ],
            "Micronesia, Federated States of" => [ 5.346869207500125, 150.555186394 ],
            "Virgin Islands, U.S." => [ 18.034682316, -64.8004451905 ],
            "Curacao" => [ 12.216416734, -68.955738899 ],
            "Dominica" => [ 15.417832748999999, -61.369089322 ],
            "Benin" => [ 9.3065717573982, 2.298649942500055 ],
            "Cameroon" => [ 4.777626403447634, 11.909179687500002 ],
            "Madagascar" => [ -18.771091404499998, 46.8634139335 ],
            "South Africa [includes Marion and Prince Edward Islands]" => [ -28.40408478754051, 23.796386718750004 ],
            "Zambia" => [ -13.13167795749995, 27.827040038999996 ],
            "Zimbabwe" => [ -19.006073913999998, 29.13106897 ],
            "Algeria" => [ 28.034750369, 1.6432377520000498 ],
            "Egypt" => [ 26.825424706, 30.793761633499997 ],
            "Libya" => [ 26.338674536864,  17.22140221800005 ],
            "Afghanistan" =>  [33.930139364, 67.689542277],
            "Armenia" =>  [40.0770768235, 45.019453166000005],
            "Azerbaijan" =>  [40.1415431725, 47.700150793999995],
            "Bahrain" =>  [26.016058661000002, 50.547281827591],
            "Cyprus" =>  [34.9060507801275, 33.185435418],
            "Georgia" =>  [42.309976705, 43.3403897282115],
            "Iran, Islamic Republic of" =>  [32.415467581499996, 53.6672457275],
            "Iraq" =>  [33.2193171185, 43.6668833785],
            "Jordan" =>  [31.280817871500002, 37.120692130840496],
            "Kazakhstan" =>  [48.0096029665, 66.901037435],
            "Kuwait" =>  [29.315860290499998, 47.482608488561],
            "Kyrgyzstan" =>  [41.2254692585, 74.7419283445],
            "Oman" =>  [21.5141892141405, 55.911594682499995],
            "Pakistan" =>  [30.374504499500002, 68.9466748455],
            "Palestine, State of" =>  [31.877044516999998, 34.886402848071],
            "Qatar" =>  [25.359986575500002, 51.183767122999996],
            "Saudi Arabia" =>  [24.246146323033003, 45.105164628500006],
            "Syrian Arab Republic" =>  [34.818973999, 39.050292395499994],
            "Tajikistan" =>  [38.859308776999995, 71.25340743000001],
            "Turkey" =>  [38.959280094, 35.23512607],
            "Turkmenistan" =>  [38.965917257, 59.541726157671995],
            "United Arab Emirates" =>  [24.347868957499998, 53.976491732499994],
            "Uzbekistan" =>  [41.371933186999996, 64.5622396235],
            "Yemen [includes the island of Socotra]" =>  [15.5535405925, 48.543020053],
            "Belarus" =>  [53.6959871425, 27.9425885415],
            "Moldova" =>  [46.9739039105, 28.3747327065],
            "Russian Federation" =>  [61.525695295000006, 0],
            "Ukraine" =>  [48.3749990875, 31.146191447],
            "Hong Kong" =>  [22.3705077175, 114.119313998],
            "Korea, Democratic People's Republic of" =>  [40.3429372185, 127.45563888699999],
            "Korea, Republic of" =>  [35.9109539874875, 128.238069635],
            "Macau" =>  [22.1630720075, 113.5536808605],
            "Mongolia" =>  [46.857864482, 103.821367839],
            "Taiwan, Province of China" =>  [23.596014716, 120.142466668],
            "Bangladesh" =>  [23.681129458999997, 90.3323203945],
            "Bhutan" =>  [27.527274162393, 90.40942163049999],
            "British Indian Ocean Territory [includes the Chagos Archipelago]" =>  [-6.3296037739999, 71.87781823],
            "Brunei" =>  [4.53693868300015, 114.67976545900001],
            "Cambodia" =>  [12.560177612499999, 104.96197005249999],
            "Lao People's Democratic Republic" =>  [18.205750326, 103.880718221],
            "Maldives" =>  [3.2093366555001, 73.2190047535],
            "Myanmar" =>  [19.16459137250005, 96.67441389999999],
            "Nepal" =>  [28.3803359985, 84.099677572],
            "Philippines" =>  [12.88904450050005, 121.7863061855],
            "Singapore" =>  [1.35647207200005, 103.821910027],
            "Timor-Leste" =>  [-8.818125708999851, 125.6716414725],
            "Vietnam" =>  [15.965926822500101, 105.7955389775],
            "Aland Islands" =>  [60.192633368, 20.304942253500002],
            "Albania" =>  [41.1459133915, 20.154355916],
            "Andorra" =>  [42.539019572, 1.5857735595001499],
            "Austria" =>  [47.694208781, 13.33474633750005],
            "Belgium" =>  [50.495730286, 4.4481625573453005],
            "Bosnia and Herzegovina" =>  [43.9218679815, 17.6674792885],
            "Bulgaria" =>  [42.733269343, 25.474274735999998],
            "Croatia" =>  [44.4816531405, 16.454656816],
            "Czech Republic" =>  [49.7989640305, 15.456787353500001],
            "Denmark" =>  [56.159877834, 11.622691277000051],
            "Estonia" =>  [58.593351545, 25.009421424000003],
            "Faroe Islands" =>  [61.896511135, -6.959970669499899],
            "Finland" =>  [64.9432675205, 26.096344645],
            "France" =>  [14.85837936224, -2.971669075000001],
            "Germany" =>  [51.168227644, 10.43727461750005],
            "Gibraltar" =>  [36.125810032506, -5.34858012094175],
            "Greece" =>  [38.2827424145, 23.933116082],
            "Greenland" =>  [71.71336497600001, -42.217030402999995],
            "Guernsey" =>  [49.5714785825, -2.4218847319999],
            "Holy See (Vatican City State)" =>  [41.903333339499994, 12.453374762],
            "Hungary" =>  [47.155288188, 19.485817912],
            "Iceland" =>  [64.9804344745, -19.021412727],
            "Ireland" =>  [53.416042385, -8.23584957599995],
            "Isle of Man" =>  [54.237982489000004, -4.5510351229999],
            "Italy" =>  [41.2872294135, 12.560077144500049],
            "Latvia" =>  [56.8710646575, 24.5929362345],
            "Liechtenstein" =>  [47.1576007085, 9.5458044840001],
            "Lithuania" =>  [55.1647217815, 23.862644478281],
            "Luxembourg" =>  [49.8081495165, 6.10875329600005],
            "Macedonia, Republic of" =>  [41.609864400999996, 21.726869751000002],
            "Malta" =>  [35.938401597, 14.375376824],
            "Monaco" =>  [43.7407373155, 7.4016021195316],
            "Montenegro" =>  [42.700124006500005, 19.3943506265],
            "Netherlands" =>  [32.790065822500004, -30.609441288],
            "Norway" =>  [13.153794663500001, 12.261485222000049],
            "Poland" =>  [51.916168725000006, 19.1335396725],
            "Portugal [includes the Azores, Madeira and the Selvagens islands]" =>  [36.091435957499996, -18.74542436049995],
            "Romania" =>  [45.962441102, 24.9711904265],
            "San Marino" =>  [43.9373111505, 12.4390104995],
            "Serbia" =>  [44.204408874500004, 20.9147746175],
            "Slovakia" =>  [48.6758930465, 19.692058553000003],
            "Slovenia" =>  [46.1437995405, 14.9402814125],
            "Spain [includes the Belearic and Canary islands and the Spanish North African Territories]" =>  [35.7178408875, -6.91506913949995],
            "Sweden" =>  [62.18951691, 17.635789222],
            "Switzerland" =>  [46.8109422815, 8.21071801750005],
            "United Kingdom" =>  [55.378749904, -5.960072395],
            "French Southern Territories [includes the Amsterdam-St Paul, Crozet, Kerguelen and Mozambique Channel island groups]" =>  [-30.636122329, 58.656748894],
            "Heard Island and McDonald Islands" =>  [-53.0770809875, 73.5240991545],
            "South Georgia and the South Sandwich Islands" =>  [-56.7225888, -32.16317705],
            "Anguilla" =>  [18.385178941, -63.200734016],
            "Antigua and Barbuda" =>  [17.3584658875, -61.780873176],
            "Aruba" =>  [12.5249087585, -69.96961422449999],
            "Bahamas" =>  [23.920405543, -76.170257128],
            "Barbados" =>  [13.1978620465, -59.540557421],
            "Bermuda" =>  [32.318367663298, -64.7668123473055],
            "Cayman Islands" =>  [19.510747226, -80.57159235649999],
            "Dominican Republic" =>  [18.741624252999998, -70.169220137],
            "Grenada" =>  [12.2662824565, -61.6060684885],
            "Haiti" =>  [19.057867743, -73.06413835],
            "Montserrat" =>  [16.747341213, -62.185332811500004],
            "Saint Kitts and Nevis" =>  [17.2581851255, -62.698923306],
            "Saint Lucia" =>  [13.9132754575, -60.980742968],
            "Saint Martin (French Part)" =>  [18.077764617068, -63.078785773999996],
            "Saint Vincent and the Grenadines" =>  [12.9829572615, -61.291879849],
            "Sint Maarten (Dutch Part)" =>  [18.0406098455, -63.0682272280265],
            "Turks and Caicos Islands" =>  [21.624660548500003, -71.805104133],
            "Belize" =>  [17.185205384, -88.509791325],
            "Guatemala" =>  [15.772461320447, -90.23357798360149],
            "Nicaragua" =>  [12.8722257485, -85.205759244],
            "Canada" =>  [62.39280406, -96.81107793155499],
            "Saint Pierre and Miquelon" =>  [46.947007554, -56.270680305],
            "Angola" =>  [-11.2113042195, 17.865554229],
            "Botswana" =>  [-22.336800842000002, 24.6642098385],
            "Burkina Faso" =>  [12.23589508050005, -1.5662045904998998],
            "Burundi" =>  [-3.3832032269999, 29.910427083000002],
            "Cape Verde" =>  [16.0002709005, -24.013498501999997],
            "Central African Republic" =>  [6.618641052500051, 20.914283691],
            "Chad" =>  [15.45014333100005, 18.7167950845],
            "Comoros" =>  [-11.8707821595, 43.871145053],
            "Congo, Republic of the" =>  [-0.6556773869999, 14.8782115820315],
            "Djibouti" =>  [11.818868716499999, 42.5839109665],
            "Equatorial Guinea [includes the islands of Annobón and Bioko]" =>  [1.1483625345001, 8.47416548350005],
            "Eritrea" =>  [15.182425031500001, 39.773759192499995],
            "Ethiopia" =>  [9.14143280050005, 40.484484497],
            "Gabon" =>  [-0.8071805869514501, 11.59727888650005],
            "Gambia" =>  [13.442496646, -15.324206913000001],
            "Guinea" =>  [9.93179799450005, -11.371786462500001],
            "Guinea-Bissau" =>  [11.8035364825, -15.19457430507],
            "Kenya" =>  [0.17643582880389985, 37.8877437745],
            "Lesotho" =>  [-29.614780375000002, 28.2190316165],
            "Liberia" =>  [6.4563155140000505, -9.4301519405],
            "Malawi" =>  [-13.2582852174999, 34.2838035485],
            "Mali" =>  [17.5675593065, -4.01424637849995],
            "Mauritania" =>  [21.0099073285, -10.95139400199995],
            "Mozambique" =>  [-18.6646397875, 35.5309188195],
            "Namibia" =>  [-22.9552127075, 18.488701005499998],
            "Niger" =>  [17.606562093, 8.061631510000055],
            "Rwanda" =>  [-1.9427743529999, 29.87252242],
            "Saint Helena, Ascension and Tristan da Cunha" =>  [-24.1378720034999, -10.03404700399995],
            "Sao Tomé and Principe" =>  [0.861944891500135, 6.9622095060001],
            "Senegal" =>  [14.4984959925, -14.456908532],
            "Sierra Leone" =>  [8.4577128125001, -11.791666019],
            "Somalia" =>  [5.1464177405111995, 46.1912115935],
            "South Sudan" =>  [7.85317810100005, 30.021195516],
            "Sudan" =>  [15.45430328350005, 30.206650224500002],
            "Swaziland" =>  [-26.526131693499998, 31.450152222],
            "Togo" =>  [8.6177356076435, 0.80812076850007],
            "Morocco" =>  [28.673245123291, -9.02287139817245],
            "Tunisia" =>  [33.787053124500005, 9.52198164900005],
            "Western Sahara" =>  [24.2141892465, -12.89272670849995],
            "Chile [includes Easter Island]" =>  [-36.7125462105, -87.9372655915],
            "Falkland Islands (Malvinas)" =>  [-51.7171436535, -59.526234504499996],
            "Paraguay" =>  [-23.43678538, -58.447823039],
            "American Samoa" =>  [-12.792128188, -169.6235041985],
            "Cook Islands" =>  [-15.442803643999952, -161.568674283],
            "French Polynesia [includes the island groups of the Marquesas, Society, Tuamotu and Tubai]" =>  [-17.795668227499903, -144.7399796215],
            "Guam" =>  [13.4475772155, 144.7881779305],
            "Kiribati [includes the Gilbert, Kiribati Line and Phoenix island groups]" =>  [-3.36901213999995, 1.1537581715000016],
            "Marshall Islands" =>  [9.5921491560001, 168.656016472],
            "Nauru" =>  [-0.52113209449991, 166.9326278005],
            "New Caledonia" =>  [-21.147190037, 167.47974927799999],
            "New Zealand [includes the Antipodean, Chatham and Kermadec island groups]" =>  [-30.571770045999948, 0.4429630865000007],
            "Norfolk Island" =>  [-29.038750909500003, 167.954234246],
            "Palau" =>  [5.52282994381575, 132.9292285599],
            "Papua New Guinea [includes the Bismarck Archipelago and the North Solomons]" =>  [-6.49134693799995, 148.408375485],
            "Samoa" =>  [-13.757826430000001, -172.1101374995],
            "Solomon Islands" =>  [-9.445245049999901, 162.16692142],
            "Tonga" =>  [-18.9491513005, -175.0667821935],
            "Tuvalu" =>  [-7.54908619599985, 178.016001824],
            "United States Minor Outlying Islands [includes the Howland-Baker, Johnston, Midway, US Line and Wake island groups]" =>  [13.913275458000056, -5.368621385500006],
            "Vanuatu" =>  [-16.658990167, 168.2097274095],
            "Wallis and Futuna" =>  [-13.7641740865, -177.15566972599999],
            "Congo, Democratic Republic of the" =>  [-4.0415351354999505, 21.745500843676503],
            "Kosovo" =>  [42.55354065, 20.898754923],
            "Pitcairn Islands" =>  [-24.500746352500002, -127.765573697],
        ];
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
