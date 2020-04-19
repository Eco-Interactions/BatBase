<?php

namespace AppBundle\EventListener;

use AppBundle\Entity\User;
use AppBundle\Entity\UserNamed;

use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Event\FilterUserResponseEvent;
use FOS\UserBundle\FOSUserEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * addExampleDataToUser
 * addDataOnRegistration
 */
class AddExampleDataAfterRegistration implements EventSubscriberInterface
{
    protected $container;
    protected $user;
    protected $createdBy;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->em = $entityManager;
    }

    public function addExampleDataToUser(User $user)
    {
        $this->user = $user;
        $this->addExampleData();
    }

    public function addDataOnRegistration(FilterUserResponseEvent $event)
    {
        $this->user = $event->getUser();
        $this->addExampleData();
    }

    private function addExampleData()
    {
        $this->addFilterSets();
        $this->addInteractionLists();
        $this->em->flush();
    }
    /**
     * Brazil - Arthropod, consumption
     * Journals - Arthropod, consumption, >=1990
     * Taxon - Hipposideridae >= 1988
     */
    public function addFilterSets()
    {
        $keys = ['brazil', 'journal', 'taxon'];

        foreach ($keys as $key) {
            $data = $this->getNamedData('set', $key);
            $this->createUserNamedEntity('filter', $data);
        }   
    }

    /**
     * Phyllostomidae & Pteropodidae - Arthropod
     * Biotropica, Journal of Mammalogy, & Acta Chiropterologica - Arthropod
     */
    public function addInteractionLists()
    {
        $keys = ['bats', 'source'];

        foreach ($keys as $key) {
            $data = $this->getNamedData('list', $key);
            $this->createUserNamedEntity('interaction', $data);
        }
    }

    private function getNamedData($type, $key)
    {
        $map = [
            'list' => [
                'bats' => [
                    'details' => '[6529,6530,6531,6532,6533,6534,6535,6536,6761,6762,6763,6764,6765,6766,6767,6768,6821,6943,6496,1965,4101,4102,4103,4104,6038,998,2502,1472,999,1961,2475,2476,4105,4106,4107,4108,5077,5078,5079,5080,5081,5082,5083,5084,5085,997,1197,1198,1199,1978,1979,2613,5030,5031,5032,5033,5034,5035,5036,5037,5038,5072,5073,5074,5075,5076,2616,4086,4312,4313,5039,5040,5041,5042,5043,1012,2739,6146,6147,24,475,2796,2797,2798,2799,4314,4315,4316,4318,5045,5046,5047,5048,5049,1016,2884,954,1027,1960,2885,2886,2887,2888,6148,1029,2902,15,16,1065,1066,1112,1113,2944,2945,3430,3431,1032,2963,1033,1034,1035,2964,2965,2966,1771,17,1069,1752,18,19,20,1748,2972,2973,2974,2975,2976,2977,2978,2979,2980,2981,2982,2983,2984,2985,2986,2987,2970,1,2,3,1067,2994,2995,2996,2997,2998,2999,3000,4060,4061,4062,4063,4064,4065,4066,4067,4068,4069,1747,1932,14,1068,22,1753,1754,5050,5051,5052,5053,5054,5055,5056,86,131,4317,38,39,40,41,1045,1046,1047,1048,1759,1760,4001,4002,4003,4004,4005,4006,5086,5087,5088,5089,5090,5091,5092,5093,1766,80,81,82,83,84,1051,1052,1053,1054,1055,1367,1368,1369,1763,1764,1953,4007,4008,4009,4010,4011,4012,4013,4014,4015,4016,4017,4018,4019,4020,4021,4022,4023,4024,4025,4026,4027,4028,4029,4030,4031,4032,4033,4034,4035,4036,4037,4038,127,1107,128,1986,1987,5057,5058,5059,5060,1417,1418,1419,106,1096,6065,1749,1750,1751,3200,87,88,1070,1767,1768,1769]',
                    'name' => '(Exmpl) Phyllostomidae & Pteropodidae - Arthropod'
                ], 
                'source' => [
                    'details' => '[7796,7797,7798,7799,7800,7801,7802,7803,7804,7805,7806,7807,7808,7809,7810,7811,7812,7813,7814,7815,7816,7817,7818,7819,7820,7821,7822,7823,7824,7825,7826,7827,7828,7829,7830,7831,7832,7833,7834,7835,7836,7837,7838,7839,6723,6724,6725,6726,6727,6728,6357,6358,6359,6360,6361,6362,6363,6364,6365,6366,6367,6368,6369,6370,6371,6372,6373,6374,6375,6376,6377,6378,6379,6380,6381,6382,6383,6384,6385,6386,6387,6388,6389,6390,6391,6392,6393,6394,6395,6396,6397,6398,6399,6400,6401,6402,6403,6404,6405,6406,6407,6408,6409,6410,6411,6412,6413,6414,6415,6416,6417,6418,6419,6420,6421,6422,6423,6424,6425,6426,6427,6428,6429,6430,6431,6432,6433,6434,6435,6436,6437,6821,6586,6587,6588,6589,6590,6591,5276,5277,5278,5279,5280,5281,5282,5283,5284,5285,6015,6016,6017,6018,6019,6020,6021,6022,6023,6024,6025,6026,7677,7678,7679,7680,7681,7682,7683,7684,7685,7686,7687,7688,7689,7690,7691,7692,7693,7694,7695,7696,7697,7698,7699,7700,7701,7702,7703,7704,7705,7706,7707,7708,7709,7710,7711,7712,7713,7714,7715,7716,7717,7718,7719,7720,7721,7722,7723,7724,7725,7726,7727,7728,7729,7730,7731,7732,7733,7734,7735,7736,7737,7738,7739,7740,7741,7742,7743,7744,7745,7746,7747,7748,7749,7750,7751,7752,7753,7754,7755,7756,7757,7758,7759,7760,7761,7762,7763,7764,7765,7766,7767,7768,7769,7770,7771,7772,7773,7774,7775,7776,7777,7778,7779,7780,7781,7782,5533,5534,5535,5536,7672,7673,7674,7675,7676,5326,5327,5328,5329,5330,5331,5332,5333,5334,5335,5336,5337,5338,5339,5340,5341,5342,5432,5433,5434,5435,5436,5437,5438,5439,5440,5441,5442,5443,5444,5445,5446,5447,5448,5449,5450,5451,5452,5453,5454,5455,5456,5457,5458,5459,5460,5461,5462,5463,5464,7303,7304,7305,7306,7307,7308,7309,7310,7311,7312,7313,7314,7315,7316,7317,7318,7319,5555,5556,5557,5558,5559,5560,5561,5562,5563,5564,5565,5566,5567,5568,5569,5570,5571,5572,5573,5574,5575,5576,5577,5578,5579,5580,5581,5582,5583,5584,5585,5586,5587,5588,5589,5590,5591,5592,5593,5594,5595,5596,1197,1198,1199,5350,5351,5352,5353,5354,5355,5357,6013,6014,4312,4313,4314,4315,4316,4317,4318,5487,5488,5489,5490,5491,5492,5493,5494,5495,5496,5497,5498,5499,5500,5501,5502,5503,5504,5505,5506,5507,5508,5509,5510,5511,5512,5513,5514,5515,5516,5517,5518,5519,5520,5521,5522,5523,5524,5525,5526,5527,5528,946,1472,7783,7784,7785,7786,7787,7788,7789,7790,7791,7792,7793,7794,7795,7397,7398,7399,7400,7401,7402,6281,6282,6283,6284,6285,6286,4001,4002,4003,4004,4005,4006,4007,4008,4009,4010,4011,4012,4013,4014,4015,4016,4017,4018,4019,4020,4021,4022,4023,4024,4025,4026,4027,4028,4029,4030,4031,4032,4033,4034,4035,4036,4037,4038,4039,4040,4041,4042,4043,4044,4045,4046,4047,4048,4049,4050,4051,5072,5073,5074,5075,5076,5077,5078,5079,5080,5081,5082,5083,5084,5085,5086,5087,5088,5089,5090,5091,5092,5093,6707,6708,6709,6710,6711,6712,6713,5793,5794,5795,5796,5797,5798,5799,5800,5801,5802,5803,5804,5805,5806,5807,5808,5809,5810,5811,5812,5813,5814,5815,5816,5817,5818,5819,5820,5821,5822,5823,5824,5825,5826,5827,5828,5829,5830,5831,5832,5833,5834,5835,5836,5837,5838,5839,5840,5841,5842,5843,5844,5845,5846,5847,5848,5849,6857,6146,6147,6148,4101,4102,4103,4104,4105,4106,4107,4108,5286,5287,5288,5289,5290,5291,5292,5293,5294,5295,5296,5297,5298,5299,5300,5301,5302,5303,5304,5305,5306,5307,5308,5309,5310,5311,5312,5313,5314,5315,5316,954]',
                    'name' => '(Exmpl) Biotropica, Journal of Mammalogy, & Acta Chiropterologica - Arthropod'
                ]
            ],
            'set' => [
                'brazil' => [
                    'details' => '{"focus":"locs","panel":{"combo":{"Country":{"text":"Country","value":190}}},"table":{"Interaction Type":{"interactionType":["Consumption"]},"Tags":{"tags":["Arthropod"]}},"view":null}',
                    'name' => '(Exmpl) Brazil - Arthropod, consumption'
                ], 
                'journal' => [
                    'details' => '{"focus":"srcs","panel":{"combo":{"Publication Type":{"text":"Publication Type","value":"3"}},"time":{"type":"cited","date":"January 1, 1990 12:00 AM"}},"table":{"Interaction Type":{"interactionType":["Consumption"]},"Tags":{"tags":["Arthropod"]}},"view":"pubs"}',
                    'name' => '(Exmpl) Journals - Arthropod, consumption, >=1990'
                ], 
                'taxon' => [
                    'details' => '{"focus":"taxa","panel":{"time":{"date":"January 1, 1988 12:00 AM","type":"cited"},"combo":{"Family":{"text":"Hipposideridae","value":"1850"}}},"table":{},"view":"2"}',
                    'name' => '(Exmpl) Taxon - Hipposideridae >= 1988'
                ]
            ]
        ];
        return $map[$type][$key];
    }

    private function createUserNamedEntity($type, $data)
    {
        $entity = new UserNamed();
        $entity->setCreatedBy($this->user);
        $entity->setDetails($data['details']);
        $entity->setDisplayName($data['name']);
        $entity->setType($type);        
        $this->em->persist($entity);
    }

    public static function getSubscribedEvents()
    {
        return [
            FOSUserEvents::REGISTRATION_COMPLETED => 'addDataOnRegistration'
        ];
    }
}