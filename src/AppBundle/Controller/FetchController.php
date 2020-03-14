<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
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
class FetchController extends Controller
{
    /**
     * Returns an object with the lastUpdated datetime for the system and for 
     * each entity.
     *
     * @Route("/data-state", name="app_ajax_data_state")
     */
    public function getDataLastUpdatedState(Request $request)
    { 
        $em = $this->getDoctrine()->getManager();
        $entities = $em->getRepository('AppBundle:SystemDate')->findAll();
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
    /* --------------- SERIALIZE BAT TAXA ----------------------------------- */
    /**
     * Returns data necessary to load the bat taxon tree. This is the first batch
     * downloaded when local data is initialized. 
     *
     * @Route("/init", name="app_serialize_init")
     */ 
    public function serializeBaseBatTaxaData(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $serializer = $this->container->get('jms_serializer');

        $realm = $this->serializeEntityRecords('Realm', $serializer, $em);
        $level = $this->serializeEntityRecords('Level', $serializer, $em);
        $bats = $this->serializeBatTaxa($serializer, $em);

        $response = new JsonResponse(); 
        $response->setData(array(                                    
            'realm' => $realm,    'level' => $level,
            'taxon' => $bats            
        )); 
        return $response;
    }
    private function serializeBatTaxa($serializer, $em)
    {
        $batRealm = $em->getRepository('AppBundle:Realm')->findOneBy(['displayName' => 'Bat']);
        return $this->serializeEntities($batRealm->getTaxa(), $serializer);
    }
    /* ------------ SERIALIZE REMAINING TAXA -------------------------------- */
    /**
     * Returns serialized data objects for the Realm, Level, and Taxon entities.
     *
     * @Route("/taxa", name="app_serialize_taxa")
     */
    public function serializeNonBatTaxonData(Request $request) 
    {
        $em = $this->getDoctrine()->getManager();
        $serializer = $this->container->get('jms_serializer');
        
        $taxa = $this->getAllNonBatTaxa($em, $serializer);

        $response = new JsonResponse(); 
        $response->setData(array(                                    
            'taxon' => $taxa        
        )); 
        return $response;
    }

    private function getAllNonBatTaxa($em, $serializer)
    {
        $batRealm = $em->getRepository('AppBundle:Realm')->findOneBy(['displayName' => 'Bat']);
        $taxa = $em->getRepository('AppBundle:Taxon')->findAllNonBatTaxa($batRealm);
        return $this->serializeEntities($taxa, $serializer);
    }
/* =================== FETCH LOCATION DATA ================================== */
    /**
     * Returns serialized data objects for Habitat Type, Location Type, and Location. 
     *
     * @Route("/location", name="app_serialize_location")
     */
    public function serializeLocationData(Request $request) 
    {
        $em = $this->getDoctrine()->getManager();
        $serializer = $this->container->get('jms_serializer');

        $geoJson = $this->serializeEntityRecords('GeoJson', $serializer, $em);
        $habitatType = $this->serializeEntityRecords('HabitatType', $serializer, $em);
        $location = $this->serializeEntityRecords('Location', $serializer, $em);
        $locType = $this->serializeEntityRecords('LocationType', $serializer, $em);

        $response = new JsonResponse();
        $response->setData(array( 
            'location' => $location,    'habitatType' => $habitatType,   
            'locationType' => $locType, 'geoJson' => $geoJson
        )); 
        return $response;
    }
    /**
    /**
     * Returns serialized data objects for all entities related to Source. 
     *
     * @Route("/source", name="app_serialize_source")
     */
    public function serializeSourceData(Request $request) 
    {
        $em = $this->getDoctrine()->getManager();
        $serializer = $this->container->get('jms_serializer');

        $author = $this->serializeEntityRecords('Author', $serializer, $em);
        $citation = $this->serializeEntityRecords('Citation', $serializer, $em);
        $citType = $this->serializeEntityRecords('CitationType', $serializer, $em);
        $publication = $this->serializeEntityRecords('Publication', $serializer, $em);
        $pubType = $this->serializeEntityRecords('PublicationType', $serializer, $em);
        $publisher = $this->serializeEntityRecords('Publisher', $serializer, $em);
        $source = $this->serializeEntityRecords('Source', $serializer, $em);
        $srcType = $this->serializeEntityRecords('SourceType', $serializer, $em);

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
        $em = $this->getDoctrine()->getManager();
        $serializer = $this->container->get('jms_serializer');

        $interaction = $this->serializeEntityRecords('Interaction', $serializer, $em);
        $intType = $this->serializeEntityRecords('InteractionType', $serializer, $em);
        $tag = $this->serializeEntityRecords('Tag', $serializer, $em);

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
        $em = $this->getDoctrine()->getManager();
        $serializer = $this->container->get('jms_serializer');

        $lists = $em->getRepository('AppBundle:UserNamed')
            ->findBy(['createdBy' => $this->getUser()]);

        $returnData = [];

        foreach ($lists as $list) {
            $json = $this->serializeRcrd($list, $serializer);
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
    private function serializeEntityRecords($entity, $serializer, $em)
    {
        $entities = $em->getRepository('AppBundle:'.$entity)->findAll();
        return $this->serializeEntities($entities, $serializer);
    }
    private function serializeEntities($entities, $serializer)
    {
        $data = new \stdClass;  //print("\n total entities = ".count($entities));
        
        foreach ($entities as $entity) {
            $id = $entity->getId();                                             
            $jsonData = $this->serializeRcrd($entity, $serializer);
            if (!$jsonData) { continue; }
            $data->$id = $jsonData;   //print('id = '.$id."\n"); 
        }
        return $data;
    }

    private function serializeRcrd($entity, $serializer)
    {
        $rcrd = false;
        try {
            $rcrd = $serializer->serialize($entity, 'json');
        } catch (\Throwable $e) {    print("\n\n### Error = ".$e->getMessage()."\n\n");
            $this->get('logger')->error($e->getMessage());
        } catch (\Exception $e) {    print("\n\n### Error = ".$e->getMessage()."\n\n");
            $this->get('logger')->error($e->getMessage());
        }
        return $rcrd;
    }
    /**
     * Serializes and returns all entities of the passed class that have been 
     * updated since the passed 'lastUpdatedAt' time.
     *
     * @Route("/sync-data", name="app_ajax_sync_data")
     */
    public function getUpdatedEntityData(Request $request)
    {
        $em = $this->getDoctrine()->getManager(); 

        $pushedData = json_decode($request->getContent());
        $entity = $pushedData->entity;                                          //print("getAllUpdatedData for ".$coreEntity);
        $lastUpdatedAt = $pushedData->updatedAt;

        $data = $this->getAllUpdatedData($entity, $lastUpdatedAt, $em);

        $response = new JsonResponse(); 
        $response->setData(array( $entity => $data )); 
        return $response;        
    }
    /**
     * All entities updated since the lastUpdatedAt time are serialized and 
     * returned in a data object keyed by id.  
     */
    private function getAllUpdatedData($entityType, $lastUpdatedAt, &$em)
    {    
        $serializer = $this->container->get('jms_serializer');
        $data = new \stdClass;

        $entities = $this->getEntitiesWithUpdates($entityType, $lastUpdatedAt, $em);

        foreach ($entities as $entity) {   
            $id = $entity->getId();    
            $json = $this->serializeRcrd($entity, $serializer);
            if (!$json) { continue; }
            $data->$id = $json;
        }
        return $data;
    }
    /** Queries for all entities updated since the lastUpdatedAt time. */
    private function getEntitiesWithUpdates($entity, $lastUpdatedAt, &$em)
    {
        $repo = $em->getRepository('AppBundle:'.$entity);
        $query = $repo->createQueryBuilder('e')
            ->where('e.updated > :lastUpdated')
            ->setParameter('lastUpdated', $lastUpdatedAt)
            ->getQuery();
        return $query->getResult();
    }
}