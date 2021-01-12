<?php

namespace App\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;

use App\Service\SerializeData;
/**
 * public:
 *     getDataLastUpdatedState
 *     getUpdatedEntityData
 *     serializeGeoJsonData
 *     serializeInteractionData
 *     serializeLocationData
 *     serializeSourceData
 *     serializeTaxonData
 *     serializeUserListData
 *
 * TOC:
 *     GET UPDATED DATA
 *     GET ALL ENTITY DATA
 *
 * @Route("/fetch")
 */
class FetchController extends AbstractController
{
    private $em;

    private $serialize;

/* ____________________ CONSTRUCT/CONFIGURE COMMAND _________________________ */
    public function __construct(SerializeData $serialize)
    {
        $this->serialize = $serialize;
    }
/* ++++++++++++++++++++++ GET UPDATED DATA ++++++++++++++++++++++++++++++++++ */
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
        $skip = ['Feedback'];
        $state = new \stdClass;

        foreach ($entities as $entity) {
            $entityClass = $entity->getEntity();
            if (in_array($entityClass, $skip)) { continue; }
            $state->$entityClass = $entity->getUpdated()->format('Y-m-d H:i:s');
        }
        $response = new JsonResponse();
        $response->setData(array(
            'state' => $state,
        ));
        return $response;
    }
/* ===================== GET ENTITIES WITH UPDATES ========================== */
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
        $entities = $this->getEntitiesWithUpdates($entityType, $lastUpdatedAt);
        return $this->serialize->serializeRecords($entities, $this->em, 'normalized');
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
/* +++++++++++++++++++++ GET ALL ENTITY DATA ++++++++++++++++++++++++++++++++ */
    private function getSerializedEntities($entity, $group = false)
    {                                                               /*dbug-log*///print("Serialize [$entity]");
        $entities = $this->em->getRepository('App:'.$entity)->findAll();
        return $this->serialize->serializeRecords($entities, $this->em, $group);
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

        $rank = $this->getSerializedEntities('Rank');
        $group = $this->getSerializedEntities('Group');
        $groupRoot = $this->getSerializedEntities('GroupRoot');
        $taxa = $this->getSerializedEntities('Taxon', 'normalized');

        $response = new JsonResponse();
        $response->setData(array(
            'group' => $group,
            'groupRoot' => $groupRoot,
            'rank' => $rank,
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

        $habitatType = $this->getSerializedEntities('HabitatType');
        $location = $this->getSerializedEntities('Location', 'normalized');
        $locType = $this->getSerializedEntities('LocationType');

        $response = new JsonResponse();
        $response->setData(array(
            'habitatType' => $habitatType,
            'location' => $location,
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

        $geoJson = $this->getSerializedEntities('GeoJson', 'normalized');

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

        $author = $this->getSerializedEntities('Author', 'normalized');
        $citation = $this->getSerializedEntities('Citation', 'normalized');
        $citType = $this->getSerializedEntities('CitationType');
        $publication = $this->getSerializedEntities('Publication', 'normalized');
        $pubType = $this->getSerializedEntities('PublicationType');
        $publisher = $this->getSerializedEntities('Publisher', 'normalized');
        $source = $this->getSerializedEntities('Source', 'normalized');
        $srcType = $this->getSerializedEntities('SourceType');

        $response = new JsonResponse();
        $response->setData(array(
            'author' => $author,
            'citation' => $citation,
            'citationType' => $citType,
            'publication' => $publication,
            'publicationType' => $pubType,
            'publisher' => $publisher,
            'source' => $source,
            'sourceType' => $srcType
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

        $interaction = $this->getSerializedEntities('Interaction', 'normalized');
        $intType = $this->getSerializedEntities('InteractionType');
        $tag = $this->getSerializedEntities('Tag');

        $response = new JsonResponse();
        $response->setData(array(
            'interaction' => $interaction,
            'interactionType' => $intType,
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

        $lists = $this->em->getRepository('App:UserNamed')
            ->findBy(['createdBy' => $this->getUser()]);

        $returnData = [];

        foreach ($lists as $list) {
            $json = $this->serialize->serializeRecord($list);
            if (!$json) { continue; }
            array_push($returnData, $json);
        }

        $response = new JsonResponse();
        $response->setData(array(
            'lists' => $returnData
        ));
        return $response;
    }
    /**
     * Gets all UserNamed entities created by the current user.
     * @Route("/user", name="app_serialize_users")
     */
    public function serializeUserData(Request $request)
    {
        $this->em = $this->getDoctrine()->getManager();

        $users = $this->getSerializedEntities('User');

        $response = new JsonResponse();
        $response->setData(array(
            'users' => $users
        ));
        return $response;
    }
}