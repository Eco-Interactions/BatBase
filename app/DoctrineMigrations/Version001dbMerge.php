<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

use AppBundle\Entity\Interaction;

/**
 * @up -> Merges JSON data into the database.
 */
class Version001dbMerge extends AbstractMigration implements ContainerAwareInterface
{

    private $container;

    private $em;

    private $admin;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * Create and add all interactions and related entities
     * Then add tags to interactions. 
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->em->getRepository('AppBundle:User')->findOneBy(['id' => 6]);

        $data = $this->getJsonData();

        $this->mergeEntityData($data["interaction"], $data);
    }

    private function mergeEntityData($interactions, $allData)
    {
        // foreach ($interactions as $intData) { // ignore: slug, id
            $int = new Interaction(); // "{add}": 
            $this->addAllRelatedInteractionData($interactions[0], $int, $allData);
        // }
        $this->em->flush();
        // $em->persist($int);
    }

    private function addAllRelatedInteractionData($intData, &$int, $allData)
    {    
        $relFields = ["source", "interactionType", "location", "subject", 
            "object", "createdBy", "updatedBy"];

        // foreach ($intData as $field => $value) {
            // $setter = 'set'.ucfirst($field);  //getFieldName split('_') ucfirst
            // if (in_array($field, $relFields)) {
                $entity = $this->createRelatedEntity("source", $intData["source"], $allData);
                // $int->$setter = $entity;
            // }
            // $int->$setter = $value;
        // }
    }

    private function createRelatedEntity($intField, $intVal, $allData)
    {
        $trans = [ "subject" => "taxon", "object" => "taxon", "updatedBy" => "user", "createdBy" => "user" ];
        $entityType = array_key_exists($intField, $trans) ? $trans[$intField] : $intField; 

        $entity = $this->getNewEntity($entityType);
        $entityData = $this->getEntityData($entityType, $intVal, false, $allData);  
            
        return $entityType === "source" ? 
            $this->setSourceData($entity, $entityType, $entityData, $allData) : 
            $this->setEntityData($entity, $entityType, $entityData, $allData);
    }

    /** ---------------- Set Source Data ------------------------------------ */ 
    private function setSourceData(&$srcEntity, $entityType, $entData, $allData)
    {        
        $this->createAndSetParentSourceEntity($srcEntity, $entData, $allData);
        $this->createAndSetSrcTypeEntity($srcEntity, $entData, $allData);
        $relFields = $this->getEntityRelFields($entityType);  
        $skipFields = ['id', 'slug', 'parentSource', 'created', 'updated', 'deletedAt'];

        foreach ($entData as $field => $val) { print("\n  field = ".$field);
            if (in_array($field, $skipFields)) { continue; }
            if (array_key_exists($field, $relFields)) { 
                $this->setRelField($field, $val, $relFields, $srcEntity);
                continue; 
            }
            $setter = 'set'.ucfirst($field); //print("\n setting source field = ".$setter);
            $srcEntity->$setter($val);
        }   
        $this->em->persist($srcEntity);
        return $srcEntity;
    }

    private function createAndSetParentSourceEntity(&$srcEntity, $entData, $allData)
    {
        if ($entData['parentSource'] === null) { return; }
        $parent = $this->em->getRepository('AppBundle:Source')
            ->findOneBy(['id' => $entData['parentSource']]);
        if ($parent === null) { 
            $entity = $this->getNewEntity('source');
            $entityData = $this->getEntityData('source', $entData['parentSource'], false, $allData); 
            $parent = $this->setSourceData($entity, 'source', $entityData, $allData);
        }
        $srcEntity->setParentSource($parent);
    }

    private function createAndSetSrcTypeEntity(&$srcEntity, $entData, $allData)
    { 
        $srcType = $this->em->getRepository('AppBundle:SourceType')
            ->findOneBy(['id' => $entData["sourceType"]])->getSlug(); 
        $typeEntity = $this->getNewEntity($srcType);
        $entityData = $this->getEntityData($srcType, false, $entData["displayName"], $allData);  //print_r("\n".$srcType." data = ");print_r($entityData);

        $relFields = $this->getEntityRelFields($srcType); //print_r($relFields);
        $skipFields = ['id', 'slug', 'source', 'created', 'updated', 'deletedAt'];

        foreach ($entityData as $field => $val) {
            if (in_array($field, $skipFields)) { continue; }
            if (array_key_exists($field, $relFields)) { print("\nsetting rel field = ". $field);
                $this->setRelField($field, $val, $relFields, $typeEntity); 
                continue;
            }
            $setter = 'set'.ucfirst($field); // print("\n setting source type entity field = ".$setter);
            $typeEntity->$setter($val);
        }
        $typeEntity->setSource($srcEntity);
        $this->em->persist($typeEntity);

        $setter = 'set'.ucfirst($srcType);
        $srcEntity->$setter($typeEntity);
    }

    /** ----------- Helpers --------------------------------------------------*/
    private function getNewEntity($entityType)
    {
        $typeClass = 'AppBundle\\Entity\\'.ucfirst($entityType); 
        return new $typeClass();
    }
    private function getEntityData($entityType, $id, $dispName, $allData)
    {
        foreach ($allData[$entityType] as $entity) {
            if ($id && $entity["id"] === $id) { return $entity; }            
            if ($dispName && $entity["displayName"] === $dispName) { return $entity; }
        }
    }

    private function setEntityData(&$entity, $entData, $allData)
    {
        $trans = [];
        foreach ($entityData as $field => $val) {
        }
    }

    private function getEntityRelFields($entity)
    {  print("\n getEntityRelFields called. Entity = ". $entity);
        return [
            'author' => ['source' => 'source', 'createdBy' => 'user', 'updatedBy' => 'user'],
            'citation' => ['source' => 'source', 'citationType' => 'citationType', 'createdBy' => 'user', 'updatedBy' => 'user'],
            'contribution' => ['source' => 'source', 'createdBy' => 'user', 'updatedBy' => 'user'],
            'interaction' => ['source' => 'source', 'interactionType' => 'interactionType',
               'location' => 'location', 'subject' => 'taxon', 'object' => 'taxon', 'createdBy' => 'user', 'updatedBy' => 'user'],
            'location' => ['parentLoc' => 'location', 'locationType' => 'locationType', 
               'habitatType' => 'habitatType', 'createdBy' => 'user', 'updatedBy' => 'user'],
            'publication' => ['source' => 'source', 'publicationType' => 'publicationType', 'createdBy' => 'user', 'updatedBy' => 'user'],
            'source' => ['parentSource' => 'source', 'sourceType' => 'sourceType', 'createdBy' => 'user', 'updatedBy' => 'user'],
            'taxon' => ['parentTaxon' => 'taxon', 'createdBy' => 'user', 'updatedBy' => 'user']
        ][$entity];
    }

    private function setRelField($field, $val, $relFields, &$entity)
    {
        $relEntityType = ucfirst($relFields[$field]);
        $relEntity = $this->em->getRepository('AppBundle:'.$relEntityType)
            ->findOneBy(['id' => $val]);  
        $setter = 'set'.ucfirst($field);
        $entity->$setter($relEntity);
    }

    private function createEntity($entityType, $id, $allData)
    {
        
    }

    private function getJsonData()
    {
        return array (
            'author' => 
              array (
                0 => 
                array (
                  'id' => 389,
                  'source' => 986,
                  'slug' => 'rollinson-d',
                  'displayName' => 'Rollinson, D.',
                  'fullName' => 'Dominic P Rollinson',
                  'lastName' => 'Rollinson',
                  'firstName' => 'Dominic',
                  'middleName' => 'P',
                  'suffix' => null,
                  'created' => '2017-12-01 21:45:16',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 21:45:16',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                1 => 
                array (
                  'id' => 390,
                  'source' => 987,
                  'slug' => 'coleman-j',
                  'displayName' => 'Coleman, J.',
                  'fullName' => 'Joy C Coleman',
                  'lastName' => 'Coleman',
                  'firstName' => 'Joy',
                  'middleName' => 'C',
                  'suffix' => null,
                  'created' => '2017-12-01 21:46:52',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 21:46:52',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                2 => 
                array (
                  'id' => 391,
                  'source' => 988,
                  'slug' => 'downs-c',
                  'displayName' => 'Downs, C.',
                  'fullName' => 'Colleen T Downs',
                  'lastName' => 'Downs',
                  'firstName' => 'Colleen',
                  'middleName' => 'T',
                  'suffix' => null,
                  'created' => '2017-12-01 21:47:32',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 21:47:32',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                3 => 
                array (
                  'id' => 392,
                  'source' => 990,
                  'slug' => 'seltzer-c',
                  'displayName' => 'Seltzer, C.',
                  'fullName' => 'Carrie E. Seltzer',
                  'lastName' => 'Seltzer',
                  'firstName' => 'Carrie',
                  'middleName' => 'E.',
                  'suffix' => null,
                  'created' => '2017-12-01 23:52:47',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 23:52:47',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                4 => 
                array (
                  'id' => 393,
                  'source' => 991,
                  'slug' => 'ndangalasi-h',
                  'displayName' => 'Ndangalasi, H.',
                  'fullName' => 'Henry J. Ndangalasi',
                  'lastName' => 'Ndangalasi',
                  'firstName' => 'Henry',
                  'middleName' => 'J.',
                  'suffix' => null,
                  'created' => '2017-12-01 23:55:02',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 23:55:02',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                5 => 
                array (
                  'id' => 394,
                  'source' => 992,
                  'slug' => 'cordeiro-n',
                  'displayName' => 'Cordeiro, N.',
                  'fullName' => 'Norbert J. Cordeiro',
                  'lastName' => 'Cordeiro',
                  'firstName' => 'Norbert',
                  'middleName' => 'J.',
                  'suffix' => null,
                  'created' => '2017-12-01 23:55:51',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 23:55:51',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
              ),
              'citation' => 
              array (
                0 => 
                array (
                  'id' => 262,
                  'source' => 989,
                  'citationType' => 1,
                  'displayName' => 'Seasonal differences in foraging dynamics, habitat use and home range size of Wahlberg\'s epauletted fruit bat in an urban environment.',
                  'title' => 'Seasonal differences in foraging dynamics, habitat use and home range size of Wahlberg\'s epauletted fruit bat in an urban environment.',
                  'fullText' => 'Rollinson, D., J. Coleman, & C. Downs.  2013.  Seasonal differences in foraging dynamics, habitat use and home range size of Wahlberg\'s epauletted fruit bat in an urban environment.  African Zoology 48: 340-350.',
                  'abstract' => 'Urbanization through the process of habitat loss and fragmentation affects ecosystems. Many species are no longer able to survive in these urban areas; however, there are some that have been able to persist and even thrive in these habitats. One such species is Wahlberg’s epauletted fruit bat [Epomophorus wahlbergi]. Little is known about its existence in urban areas. Consequently we studied their seasonal variation in home range size, movements and foraging dynamics in the urban environment of Pietermaritzburg, South Africa. In a pilot study in summer, adult fruit bats [n = 8] were caught, fitted with radio-transmitters, and their movements followed for 12 nights and days. Although their movements varied considerably, no bats left the urban environment. Some of the larger distances covered in a single night were 2 and 5 km. In winter, an additional ten adult fruit bats were caught and fitted with radio-transmitters. Movements were followed for three weeks during winter and spring respectively. Winter home range size was greater than spring home range size. During winter the bats fed mostly on syringa fruits [Melia azedarach], an alien invasive, while their diet in spring was more varied and included species of indigenous and exotic fruits. The reduced variety of fruit eaten in winter may be explained by a reduction in fruiting plant species, and thus a reliance on a few species to meet their dietary requirements. The bats would have a role in seed dispersal but therein lies the problem of them also dispersing invasive plants. Further research is needed to assess the role played by exotic and alien plant species in the continued success of urban wildlife, in particular fruit bats. The seasonal variation in home range size gives insight into the urban movements of Wahlberg’s epauletted fruit bats. The use of exotic and invasive plants by these bats is also significant.',
                  'publicationVolume' => '48',
                  'publicationIssue' => '2',
                  'publicationPages' => '340-350',
                  'created' => '2017-12-01 21:51:17',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 21:51:17',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                1 => 
                array (
                  'id' => 263,
                  'source' => 993,
                  'citationType' => 1,
                  'displayName' => 'Seed dispersal in the dark: shedding light on the role of fruit bats in Africa.',
                  'title' => 'Seed dispersal in the dark: shedding light on the role of fruit bats in Africa.',
                  'fullText' => 'Seltzer, C., H. Ndangalasi, & N. Cordeiro. 2013.  Seed dispersal in the dark: shedding light on the role of fruit bats in Africa.  Biotropica 45: 450-456.',
                  'abstract' => null,
                  'publicationVolume' => '45',
                  'publicationIssue' => '4',
                  'publicationPages' => '450-456',
                  'created' => '2017-12-01 23:56:15',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 23:56:15',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
              ),
              'contribution' => 
              array (
                0 => 
                array (
                  'id' => 1056,
                  'workSource' => 989,
                  'authorSource' => 986,
                  'citedAs' => null,
                  'created' => '2017-12-01 21:51:17',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 21:51:17',
                  'updatedBy' => 45,
                ),
                1 => 
                array (
                  'id' => 1057,
                  'workSource' => 989,
                  'authorSource' => 987,
                  'citedAs' => null,
                  'created' => '2017-12-01 21:51:17',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 21:51:17',
                  'updatedBy' => 45,
                ),
                2 => 
                array (
                  'id' => 1058,
                  'workSource' => 989,
                  'authorSource' => 988,
                  'citedAs' => null,
                  'created' => '2017-12-01 21:51:17',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 21:51:17',
                  'updatedBy' => 45,
                ),
                3 => 
                array (
                  'id' => 1059,
                  'workSource' => 993,
                  'authorSource' => 990,
                  'citedAs' => null,
                  'created' => '2017-12-01 23:56:15',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 23:56:15',
                  'updatedBy' => 45,
                ),
                4 => 
                array (
                  'id' => 1060,
                  'workSource' => 993,
                  'authorSource' => 991,
                  'citedAs' => null,
                  'created' => '2017-12-01 23:56:15',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 23:56:15',
                  'updatedBy' => 45,
                ),
                5 => 
                array (
                  'id' => 1061,
                  'workSource' => 993,
                  'authorSource' => 992,
                  'citedAs' => null,
                  'created' => '2017-12-01 23:56:15',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 23:56:15',
                  'updatedBy' => 45,
                ),
              ),
              'interaction' => 
              array (
                0 => 
                array (
                  'id' => 5248,
                  'source' => 989,
                  'interactionType' => 2,
                  'location' => 3120,
                  'subject' => 1201,
                  'object' => 1619,
                  'note' => null,
                  'isLikely' => null,
                  'isOldWorld' => null,
                  'created' => '2017-12-01 22:36:39',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 22:36:39',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                1 => 
                array (
                  'id' => 5249,
                  'source' => 989,
                  'interactionType' => 2,
                  'location' => 3120,
                  'subject' => 1201,
                  'object' => 209,
                  'note' => null,
                  'isLikely' => null,
                  'isOldWorld' => null,
                  'created' => '2017-12-01 22:38:56',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 22:38:56',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                2 => 
                array (
                  'id' => 5250,
                  'source' => 989,
                  'interactionType' => 2,
                  'location' => 3120,
                  'subject' => 1201,
                  'object' => 734,
                  'note' => null,
                  'isLikely' => null,
                  'isOldWorld' => null,
                  'created' => '2017-12-01 22:44:34',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 22:44:34',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                3 => 
                array (
                  'id' => 5251,
                  'source' => 989,
                  'interactionType' => 2,
                  'location' => 3120,
                  'subject' => 1201,
                  'object' => 1813,
                  'note' => null,
                  'isLikely' => null,
                  'isOldWorld' => null,
                  'created' => '2017-12-01 22:54:08',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 22:54:08',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                4 => 
                array (
                  'id' => 5252,
                  'source' => 989,
                  'interactionType' => 2,
                  'location' => 3120,
                  'subject' => 1201,
                  'object' => 1814,
                  'note' => null,
                  'isLikely' => null,
                  'isOldWorld' => null,
                  'created' => '2017-12-01 22:55:07',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 22:55:07',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                5 => 
                array (
                  'id' => 5253,
                  'source' => 989,
                  'interactionType' => 2,
                  'location' => 3120,
                  'subject' => 1201,
                  'object' => 1815,
                  'note' => null,
                  'isLikely' => null,
                  'isOldWorld' => null,
                  'created' => '2017-12-01 22:55:55',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 22:55:55',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                6 => 
                array (
                  'id' => 5254,
                  'source' => 993,
                  'interactionType' => 1,
                  'location' => 3122,
                  'subject' => 1816,
                  'object' => 1817,
                  'note' => null,
                  'isLikely' => null,
                  'isOldWorld' => null,
                  'created' => '2017-12-02 11:02:55',
                  'createdBy' => 45,
                  'updated' => '2017-12-02 11:02:55',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
              ),
              'interactionTag' => 
              array (
                0 => 
                array (
                  'tag' => 1,
                  'interaction' => 5254,
                ),
                1 => 
                array (
                  'tag' => 4,
                  'interaction' => 5248,
                ),
                2 => 
                array (
                  'tag' => 4,
                  'interaction' => 5249,
                ),
                3 => 
                array (
                  'tag' => 4,
                  'interaction' => 5250,
                ),
                4 => 
                array (
                  'tag' => 4,
                  'interaction' => 5251,
                ),
                5 => 
                array (
                  'tag' => 4,
                  'interaction' => 5252,
                ),
                6 => 
                array (
                  'tag' => 4,
                  'interaction' => 5253,
                ),
              ),
              'location' => 
              array (
                0 => 
                array (
                  'id' => 3120,
                  'parentLoc' => 393,
                  'locationType' => 5,
                  'habitatType' => 6,
                  'displayName' => 'University of KwaZulu-Natal',
                  'description' => 'Pietermaritzburg campus, University of KwaZulu-Natal [UKZN]',
                  'elevation' => 660,
                  'elevationMax' => null,
                  'gpsData' => null,
                  'latitude' => '-29.62522000000000',
                  'longitude' => '30.40358000000000',
                  'created' => '2017-12-01 22:12:58',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 22:12:58',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                1 => 
                array (
                  'id' => 3121,
                  'parentLoc' => 217,
                  'locationType' => 5,
                  'habitatType' => 1,
                  'displayName' => 'Amani Nature Reserve',
                  'description' => 'In the East Usambara Mountains [EUM] in Tanzania.  The EUM are part of the Eastern Arc mountain chain that stretces from southeastern Kenya to southern Tanzania.',
                  'elevation' => 700,
                  'elevationMax' => 12,
                  'gpsData' => null,
                  'latitude' => '-5.10000000000000',
                  'longitude' => '38.63333333333333',
                  'created' => '2017-12-02 00:10:14',
                  'createdBy' => 45,
                  'updated' => '2017-12-02 00:10:14',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                2 => 
                array (
                  'id' => 3122,
                  'parentLoc' => 217,
                  'locationType' => 5,
                  'habitatType' => 1,
                  'displayName' => 'Amani Nature Reserve',
                  'description' => 'In the East Usambara Mountains [EUM]',
                  'elevation' => 700,
                  'elevationMax' => 1200,
                  'gpsData' => null,
                  'latitude' => '-5.10000000000000',
                  'longitude' => '38.63333333333333',
                  'created' => '2017-12-02 10:49:48',
                  'createdBy' => 45,
                  'updated' => '2017-12-02 10:49:48',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
              ),
              'publication' => 
              array (
                0 => 
                array (
                  'id' => 567,
                  'source' => 985,
                  'publicationType' => 3,
                  'slug' => 'african-zoology',
                  'displayName' => 'African Zoology',
                  'description' => null,
                  'created' => '2017-12-01 21:32:10',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 21:32:10',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
              ),
              'source' => 
              array (
                0 => 
                array (
                  'id' => 985,
                  'parentSource' => null,
                  'sourceType' => 2,
                  'displayName' => 'African Zoology',
                  'description' => null,
                  'year' => null,
                  'doi' => null,
                  'linkDisplay' => null,
                  'linkUrl' => null,
                  'isDirect' => null,
                  'created' => '2017-12-01 21:32:10',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 21:32:10',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                1 => 
                array (
                  'id' => 986,
                  'parentSource' => null,
                  'sourceType' => 3,
                  'displayName' => 'Rollinson, D.',
                  'description' => null,
                  'year' => null,
                  'doi' => null,
                  'linkDisplay' => null,
                  'linkUrl' => null,
                  'isDirect' => null,
                  'created' => '2017-12-01 21:45:16',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 21:45:16',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                2 => 
                array (
                  'id' => 987,
                  'parentSource' => null,
                  'sourceType' => 3,
                  'displayName' => 'Coleman, J.',
                  'description' => null,
                  'year' => null,
                  'doi' => null,
                  'linkDisplay' => null,
                  'linkUrl' => null,
                  'isDirect' => null,
                  'created' => '2017-12-01 21:46:52',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 21:46:52',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                3 => 
                array (
                  'id' => 988,
                  'parentSource' => null,
                  'sourceType' => 3,
                  'displayName' => 'Downs, C.',
                  'description' => null,
                  'year' => null,
                  'doi' => null,
                  'linkDisplay' => null,
                  'linkUrl' => null,
                  'isDirect' => null,
                  'created' => '2017-12-01 21:47:32',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 21:47:32',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                4 => 
                array (
                  'id' => 989,
                  'parentSource' => 985,
                  'sourceType' => 4,
                  'displayName' => 'Seasonal differences in foraging dynamics, habitat use and home range size of Wahlberg\'s epauletted fruit bat in an urban environment.',
                  'description' => 'Rollinson, D., J. Coleman, & C. Downs.  2013.  Seasonal differences in foraging dynamics, habitat use and home range size of Wahlberg\'s epauletted fruit bat in an urban environment.  African Zoology 48: 340-350.',
                  'year' => '2013',
                  'doi' => null,
                  'linkDisplay' => null,
                  'linkUrl' => null,
                  'isDirect' => 1,
                  'created' => '2017-12-01 21:51:17',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 22:36:39',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                5 => 
                array (
                  'id' => 990,
                  'parentSource' => null,
                  'sourceType' => 3,
                  'displayName' => 'Seltzer, C.',
                  'description' => null,
                  'year' => null,
                  'doi' => null,
                  'linkDisplay' => null,
                  'linkUrl' => null,
                  'isDirect' => null,
                  'created' => '2017-12-01 23:52:47',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 23:52:47',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                6 => 
                array (
                  'id' => 991,
                  'parentSource' => null,
                  'sourceType' => 3,
                  'displayName' => 'Ndangalasi, H.',
                  'description' => null,
                  'year' => null,
                  'doi' => null,
                  'linkDisplay' => null,
                  'linkUrl' => null,
                  'isDirect' => null,
                  'created' => '2017-12-01 23:55:02',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 23:55:02',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                7 => 
                array (
                  'id' => 992,
                  'parentSource' => null,
                  'sourceType' => 3,
                  'displayName' => 'Cordeiro, N.',
                  'description' => null,
                  'year' => null,
                  'doi' => null,
                  'linkDisplay' => null,
                  'linkUrl' => null,
                  'isDirect' => null,
                  'created' => '2017-12-01 23:55:51',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 23:55:51',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                8 => 
                array (
                  'id' => 993,
                  'parentSource' => 8,
                  'sourceType' => 4,
                  'displayName' => 'Seed dispersal in the dark: shedding light on the role of fruit bats in Africa.',
                  'description' => 'Seltzer, C., H. Ndangalasi, & N. Cordeiro. 2013.  Seed dispersal in the dark: shedding light on the role of fruit bats in Africa.  Biotropica 45: 450-456.',
                  'year' => '2013',
                  'doi' => null,
                  'linkDisplay' => null,
                  'linkUrl' => null,
                  'isDirect' => 1,
                  'created' => '2017-12-01 23:56:15',
                  'createdBy' => 45,
                  'updated' => '2017-12-02 11:02:55',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
              ),
              'taxon' => 
              array (
                0 => 
                array (
                  'id' => 1813,
                  'level' => 7,
                  'parentTaxon' => 60,
                  'slug' => 'ficus-sur',
                  'displayName' => 'Ficus sur',
                  'isOldWorld' => null,
                  'linkDisplay' => null,
                  'linkUrl' => null,
                  'created' => '2017-12-01 22:53:57',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 22:53:57',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                1 => 
                array (
                  'id' => 1814,
                  'level' => 7,
                  'parentTaxon' => 60,
                  'slug' => 'ficus-natalensis',
                  'displayName' => 'Ficus natalensis',
                  'isOldWorld' => null,
                  'linkDisplay' => null,
                  'linkUrl' => null,
                  'created' => '2017-12-01 22:55:01',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 22:55:01',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                2 => 
                array (
                  'id' => 1815,
                  'level' => 7,
                  'parentTaxon' => 60,
                  'slug' => 'ficus-pumila',
                  'displayName' => 'Ficus pumila',
                  'isOldWorld' => null,
                  'linkDisplay' => null,
                  'linkUrl' => null,
                  'created' => '2017-12-01 22:55:49',
                  'createdBy' => 45,
                  'updated' => '2017-12-01 22:55:49',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                3 => 
                array (
                  'id' => 1816,
                  'level' => 7,
                  'parentTaxon' => 595,
                  'slug' => 'myonycteris-angolensis',
                  'displayName' => 'Myonycteris angolensis',
                  'isOldWorld' => null,
                  'linkDisplay' => null,
                  'linkUrl' => null,
                  'created' => '2017-12-02 10:52:15',
                  'createdBy' => 45,
                  'updated' => '2017-12-02 10:52:15',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
                4 => 
                array (
                  'id' => 1817,
                  'level' => 7,
                  'parentTaxon' => 1768,
                  'slug' => 'anthocleista-grandiflora',
                  'displayName' => 'Anthocleista grandiflora',
                  'isOldWorld' => null,
                  'linkDisplay' => null,
                  'linkUrl' => null,
                  'created' => '2017-12-02 11:01:39',
                  'createdBy' => 45,
                  'updated' => '2017-12-02 11:01:39',
                  'updatedBy' => 45,
                  'deletedAt' => null,
                ),
              ),
            );
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
