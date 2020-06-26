<?php

namespace App\Controller;

use JMS\Serializer\SerializationContext;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;

/**
 * Ajax Data controller:
 *     getDataLastUpdatedState
 *     serializeUserListData
 *     serializeGeoJsonData
 *     serializeInteractionData
 *     serializeLocationData
 *     serializeSourceData
 *     serializeTaxonData
 *     getUpdatedEntityData
 *
 * @Route("/fetch")
 */
class FetchController extends AbstractController
{
    private $em;
    private $serializer;

    /**
     * Returns an object with the lastUpdated datetime for the system and for 
     * each entity.
     *
     * @Route("/data-state", name="app_ajax_data_state")
     */
    public function getDataLastUpdatedState(Request $request)
    { 
        $em = $this->getDoctrine()->getManager();
        $entities = $em->getRepository('App:SystemDate')->findAll();
        $state = new \stdClass;
        
        foreach ($entities as $entity) {
            $entityClass = $entity->getDescription();
            $state->$entityClass = $entity->getDateVal()->format('Y-m-d H:i:s');
        }
        $response = new JsonResponse();
        $response->setData(array(
            'state' => $state,
        ));
        return $response;
    }
/* ===================== FETCH TAXON DATA =================================== */
    /**
     * Returns data necessary to load the  taxon tree. This is the first batch
     * downloaded when local data is initialized. 
     *
     * @Route("/taxon", name="app_serialize_taxon")
     */ 
    public function serializeTaxonData(Request $request)
    {
        $this->em = $this->getDoctrine()->getManager();
        $this->em->getConnection()->getConfiguration()->setSQLLogger(null);
        $this->serializer = $this->container->get('jms_serializer');

        $level = $this->serializeEntityRecords('Level');
        $realm = $this->serializeEntityRecords('Realm');
        $realmRoot = $this->serializeEntityRecords('RealmRoot');
        $taxa = $this->serializeEntityRecords('Taxon', 'normalized');

        $response = new JsonResponse(); 
        $response->setData(array(                                    
            'level' => $level,  'realm' => $realm,  'realmRoot' => $realmRoot,    
            'taxon' => $taxa            
        )); 
        return $response;
    }
/* =================== FETCH LOCATION DATA ================================== */
    /**
     * Returns serialized data objects for Habitat Type, Location Type, and Location. 
     *
     * @Route("/location", name="app_serialize_location")
     */
    public function serializeLocationData(Request $request) 
    {
        $this->em = $this->getDoctrine()->getManager();
        $this->serializer = $this->container->get('jms_serializer');

        $habitatType = $this->serializeEntityRecords('HabitatType');
        $location = $this->serializeEntityRecords('Location', 'normalized');
        $locType = $this->serializeEntityRecords('LocationType');

        $response = new JsonResponse();
        $response->setData(array( 
            'location' => $location,    'habitatType' => $habitatType,   
            'locationType' => $locType
        )); 
        return $response;
    }
    /**
     * Returns serialized data objects for Habitat Type, Location Type, and Location. 
     *
     * @Route("/geoJson", name="app_serialize_geojson")
     */
    public function serializeGeoJsonData(Request $request) 
    {
        $this->em = $this->getDoctrine()->getManager();
        $this->serializer = $this->container->get('jms_serializer');

        $geoJson = $this->serializeEntityRecords('GeoJson', 'normalized');

        $response = new JsonResponse();
        $response->setData(array( 
            'geoJson' => $geoJson
        )); 
        return $response;
    }
/* =================== FETCH SOURCE DATA ==================================== */
    /**
    /**
     * Returns serialized data objects for all entities related to Source. 
     *
     * @Route("/source", name="app_serialize_source")
     */
    public function serializeSourceData(Request $request) 
    {
        $this->em = $this->getDoctrine()->getManager();
        $this->serializer = $this->container->get('jms_serializer');

        $author = $this->serializeEntityRecords('Author', 'normalized');
        $citation = $this->serializeEntityRecords('Citation', 'normalized');
        $citType = $this->serializeEntityRecords('CitationType');
        $publication = $this->serializeEntityRecords('Publication', 'normalized');
        $pubType = $this->serializeEntityRecords('PublicationType');
        $publisher = $this->serializeEntityRecords('Publisher', 'normalized');
        $source = $this->serializeEntityRecords('Source', 'normalized');
        $srcType = $this->serializeEntityRecords('SourceType');

        $response = new JsonResponse();
        $response->setData(array( 
            'author' => $author,        'citation' => $citation,
            'source' => $source,        'citationType' => $citType, 
            'sourceType' => $srcType,   'publication' => $publication,  
            'publicationType' => $pubType, 'publisher' => $publisher
        ));
        return $response;
    }
    /**
     * Returns serialized data objects for Interaction and Interaction Type. 
     *
     * @Route("/interaction", name="app_serialize_interactions")
     */
    public function serializeInteractionData(Request $request) 
    {
        $this->em = $this->getDoctrine()->getManager();
        $this->serializer = $this->container->get('jms_serializer');

        $interaction = $this->serializeEntityRecords('Interaction', 'normalized');
        $intType = $this->serializeEntityRecords('InteractionType');
        $tag = $this->serializeEntityRecords('Tag');

        $response = new JsonResponse();
        $response->setData(array(
            'interaction' => $interaction,  'interactionType' => $intType,
            'tag' => $tag
        ));
        return $response;
    }
    /**
     * Gets all UserNamed entities created by the current user.
     * @Route("/lists", name="app_serialize_user_named")
     */
    public function serializeUserListData(Request $request)
    {      
        $this->em = $this->getDoctrine()->getManager();
        $this->serializer = $this->container->get('jms_serializer');

        $lists = $this->em->getRepository('App:UserNamed')
            ->findBy(['createdBy' => $this->getUser()]);

        $returnData = [];

        foreach ($lists as $list) {
            $json = $this->serializeRcrd($list);
            if (!$json) { continue; }
            array_push($returnData, $json);
        }

        $response = new JsonResponse();
        $response->setData(array(
            'lists' => $returnData
        ));
        return $response;
    }
    /** Returns serialized Entity data. */
    private function serializeEntityRecords($entity, $group = false)
    {
        $entities = $this->em->getRepository('App:'.$entity)->findAll();
        $data = $this->serializeEntities($entities, $group);
        $this->em->clear();
        return $data;
    }
    private function serializeEntities($entities, $group)
    {
        $data = new \stdClass;  //print("\n total entities = ".count($entities));
        $count = 0;
        foreach ($entities as $entity) {
            $id = $entity->getId();
            $jsonData = $this->serializeRcrd($entity, $group);
            if ($jsonData) { $data->$id = $jsonData; }
            if ($count < 3000) { ++$count; 
            } else { $this->em->clear(); $count = 0; }
        }
        return $data;
    }

    private function serializeRcrd($entity, $group = false)
    {
        $rcrd = false;
        try {
            $rcrd = $this->serializer->serialize($entity, 'json', $this->setGroups($group));
        } catch (\Throwable $e) {                                               //print("\n\n### Error @ [".$e->getLine().'] = '.$e->getMessage()."\n".$e->getTraceAsString()."\n");
            $this->get('logger')->error("\n\n### Error @ [".$e->getLine().'] = '.$e->getMessage()."\n".$e->getTraceAsString()."\n");
        } catch (\Exception $e) {                                               //print("\n\n### Error @ [".$e->getLine().'] = '.$e->getMessage()."\n\n");
            $this->get('logger')->error("\n\n### Error @ [".$e->getLine().'] = '.$e->getMessage()."\n".$e->getTraceAsString()."\n");
        }
        return $rcrd;
    }
    private function setGroups($group)
    {
        if (!$group) { return null; }
        return SerializationContext::create()->setGroups(array($group));
    }
    /**
     * Serializes and returns all entities of the passed class that have been 
     * updated since the passed 'lastUpdatedAt' time.
     *
     * @Route("/sync-data", name="app_ajax_sync_data")
     */
    public function getUpdatedEntityData(Request $request)
    {
        $this->em = $this->getDoctrine()->getManager(); 

        $pushedData = json_decode($request->getContent());
        $entity = $pushedData->entity;                                          //print("getAllUpdatedData for ".$coreEntity);
        $lastUpdatedAt = $pushedData->updatedAt;

        $data = $this->getAllUpdatedData($entity, $lastUpdatedAt);

        $response = new JsonResponse(); 
        $response->setData(array( $entity => $data )); 
        return $response;        
    }
    /**
     * All entities updated since the lastUpdatedAt time are serialized and 
     * returned in a data object keyed by id.  
     */
    private function getAllUpdatedData($entityType, $lastUpdatedAt)
    {    
        $this->serializer = $this->container->get('jms_serializer');
        $data = new \stdClass;

        $entities = $this->getEntitiesWithUpdates($entityType, $lastUpdatedAt);

        foreach ($entities as $entity) {   
            $id = $entity->getId();    
            $json = $this->serializeRcrd($entity, 'normalized');
            if (!$json) { continue; }
            $data->$id = $json;
        }
        return $data;
    }
    /** Queries for all entities updated since the lastUpdatedAt time. */
    private function getEntitiesWithUpdates($entity, $lastUpdatedAt)
    {
        $repo = $this->em->getRepository('App:'.$entity);
        $query = $repo->createQueryBuilder('e')
            ->where('e.updated > :lastUpdated')
            ->setParameter('lastUpdated', $lastUpdatedAt)
            ->getQuery();
        return $query->getResult();
    }
}