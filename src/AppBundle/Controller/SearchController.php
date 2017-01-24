<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;


/**
 * Search Page controller.
 *
 * @Route("/")
 */
class SearchController extends Controller
{
    /**
     * Finds and displays Search Page content blocks.
     *
     * @Route("/search", name="app_search_show")
     */
    public function searchAction()
    {
        $em = $this->getDoctrine()->getManager();

        $repo = $em->getRepository('AppBundle:ContentBlock');

        return $this->render('ContentBlock/search.html.twig', array());
    }
    /**
     * Returns the total number of interaction records.
     *
     * @Route("/search/interaction/count", name="app_search_int_cnt")
     */
    public function getInteractionCountAction(Request $request)
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }  
        $em = $this->getDoctrine()->getManager();

        $interactions = $em->getRepository('AppBundle:Interaction')->findAll();

        $response = new JsonResponse();
        $response->setData(array(
            'rcrdCount' => count($interactions)
        ));
        return $response;
    }
    /**
     * Returns serialized data objects for the Domain, Level, and Taxon entities.
     *
     * @Route("/search/taxa", name="app_serialize_taxa")
     */
    public function serializeTaxonDataAction(Request $request) 
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }  
        $em = $this->getDoctrine()->getManager();
        $serializer = $this->container->get('jms_serializer');

        $domainData = $this->getEntityData('Domain', $serializer, $em);
        $levelData = $this->getEntityData('Level', $serializer, $em);
        $taxonData = $this->getEntityData('Taxon', $serializer, $em);

        $response = new JsonResponse(); 
        $response->setData(array(                                    
            'domainData' => $domainData, 'levelData' => $levelData,
            'taxonData' => $taxonData            
        )); 
        return $response;
    }
    /** Returns serialized Entity data. */
    private function getEntityData($entity, $serializer, $em)
    {
        $entities = $em->getRepository('AppBundle:'.$entity)->findAll();
        $data = new \stdClass;   

        foreach ($entities as $entity) {  
            $id = $entity->getId();
            $data->$id = $serializer->serialize($entity, 'json');
        }
        return $data;
    }
/**------------------------Search By Location---------------------------------*/
    /**
     * Returns Location Records organized by ID, an array of top-region ids, and 
     * all country names by id.
     *
     * @Route("/search/location", name="app_ajax_search_location")
     */
    public function serializeLocationDataAction(Request $request) 
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }  

        $em = $this->getDoctrine()->getManager();
        $serializer = $this->container->get('jms_serializer');
        $habitatTypeData = $this->getEntityData('HabitatType', $serializer, $em);
        $locationData = $this->getEntityData('Location', $serializer, $em);
        $locTypeData = $this->getEntityData('LocationType', $serializer, $em);

        $response = new JsonResponse();
        $response->setData(array( 
            'habitatTypeData' => $habitatTypeData, 'locationData' => $locationData, 
            'locationTypeData' => $locTypeData
        ));

        return $response;
    }
    /**
     * Builds a Location Data Object with an object for all location records to be 
     * stored by id (locRcrds), an array for all 'top' regions and their ids (topRegions), 
     * and arrays for all countries (countries), of all Location Types (locTypes) 
     * and of all Habitat Types (habTypes) and their ids.
     */
    private function buildLocDataObj($em)
    {
        $dataObj = new \stdClass;
        $dataObj->locRcrds = new \stdClass;
        $dataObj->topRegions = [];
        $dataObj->countries = [];
        $dataObj->locTypes = $this->buildTypeAry("LocationType", $em);;
        $dataObj->habTypes = $this->buildTypeAry("HabitatType", $em);

        return $dataObj;
    }
    /**
     * Builds and returns Location Data object.
     */
    private function getLocationData($locEntity, &$locDataById, &$countries)
    {
        $data = new \stdClass; 

        $data->id = $locEntity->getId();
        $data->displayName = $locEntity->getDisplayName();
        $data->description = $locEntity->getDescription();
        $data->elevation = $locEntity->getElevation();
        $data->elevationMax = $locEntity->getElevationMax();
        $data->elevUnitAbbrv = $locEntity->getElevUnitAbbrv();
        $data->gpsData = $locEntity->getGpsData();
        $data->latitude = $locEntity->getLatitude();
        $data->longitude = $locEntity->getLongitude();
        $data->showOnMap = $locEntity->getShowOnMap();
        $data->locationType = $locEntity->getLocationType()->getDisplayName();

        $data->habitatType = $this->getHabType($locEntity);
        $data->childLocs = $this->getChildLocationData($locEntity, $locDataById, $countries);
        $data->interactions = $this->getInteractionIds($locEntity->getInteractions());
        
        $parentLoc = $locEntity->getParentLoc();
        $data->parentLoc = $parentLoc === null ? null : $parentLoc->getId();


        return $data;
    }    
    private function getHabType($locEntity)
    {
        $habitatType = $locEntity->getHabitatType();                            //echo("\nhabitatType = ".gettype($habitatType)); 
        $habData = null;
        if ($habitatType !== null) {
            $habData = new \stdClass;
            $habData->name = $habitatType->getDisplayName();
            $habData->id = $habitatType->getId();
        } 
        return $habData;
    }
    /**
     * Returns an object keyed with child location descriptions and their data.
     * Adds all country locations to the return $countries array.
     */
    private function getChildLocationData($parentLoc, &$locDataById, &$countries)
    {
        $children = [];
        $childLocs = $parentLoc->getChildLocs();  

        foreach ($childLocs as $childLoc) {
            $childId = $childLoc->getId();  //print("\nlocType = ".$childLoc->getLocationType());
            array_push($children, $childId);
            if ($childLoc->getLocationType()->getId() === 2) {
                $countries = array_merge($countries, [ $childLoc->getDisplayName() => $childId ]); 
            }
            $locDataById->$childId = $this->getLocationData($childLoc, $locDataById, $countries);
        }     
        return $children;
    }
    /** The only properties are those that later affect how this 'region' will be handled. */
    private function getUnspecifiedIntRcrds($em)
    {
        $interactions = $em->getRepository('AppBundle:Interaction')
            ->findBy(array('location'=> null));   //print(count($interactions));

        $data = new \stdClass; 
        $data->id = 999;
        $data->childLocs = [];
        $data->displayName = "Unspecified";
        $data->locationType = "Region";
        $data->interactions = $this->getInteractionIds($interactions);
        $data->parentLoc = null;
        return $data;
    }
/**------------------------Search By Source-----------------------------------*/
    /**
     * Returns all Sources by Id.
     *
     * @Route("/search/source", name="app_ajax_search_source")
     */
    public function searchSourcesAction(Request $request) 
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }  
        $em = $this->getDoctrine()->getManager();
        $srcEntities = $em->getRepository('AppBundle:Source')->findAll();
        $srcData = $this->buildSrcDataObj($em);

        foreach ($srcEntities as $srcEntity) 
        {                    
            $id = $srcEntity->getId(); 
            $type = lcfirst($srcEntity->getSourceType()->getDisplayName());
            array_push($srcData->$type->ids, $id);
            $srcData->srcRcrds->$id = $this->getSrcRcrd($srcEntity);
        }

        $response = new JsonResponse();
        $response->setData(array( 'srcData' => $srcData ));
        return $response;
    }
    /**
     * Builds a Source Data Object with an array of all Source Types (srcTypes), 
     * an object for all source records to be stored by id (srcRcrds), nested objects 
     * for each source type ($type) which contain an array of (ids) for all 
     * source records of the type and, if they exist, an array of their (types).
     */
    private function buildSrcDataObj($em)
    {
        $dataObj = new \stdClass;
        $dataObj->srcTypes = $this->buildTypeAry("SourceType", $em);;
        $dataObj->srcRcrds = new \stdClass;
        
        foreach ($dataObj->srcTypes as $type => $typeId) {
            $dataObj->$type = new \stdClass;
            $dataObj->$type->ids = [];
        }
        $dataObj->citation->types = $this->buildTypeAry("CitationType", $em);
        $dataObj->publication->types = $this->buildTypeAry("PublicationType", $em);

        return $dataObj;
    }
    private function getSrcRcrd($srcEntity)
    {
        $data = new \stdClass; 
        $data->id = $srcEntity->getId();
        $data->displayName = $srcEntity->getDisplayName();
        $data->description = $srcEntity->getDescription();
        $data->year = $srcEntity->getYear();
        $data->doi = $srcEntity->getDoi();
        $data->linkUrl = $srcEntity->getLinkUrl();
        $data->linkDisplay = $srcEntity->getLinkDisplay();
        $data->isDirect = $srcEntity->getIsDirect();

        $data->interactions = $this->getInteractionIds($srcEntity->getInteractions());
        $data->sourceType = $this->getSourceTypeData($srcEntity);
        $data->tags = $this->getSourceTags($srcEntity);
        $data->childSources = $this->getChildSources($srcEntity);

        $parentSource = $srcEntity->getParentSource();
        $data->parentSource = $parentSource === null ? null : $parentSource->getId();

        return $data;
    }
    /** Returns an array with the tags for the source. */
    private function getSourceTags($srcEntity)
    {
        $tagAry = [];
        $tags = $srcEntity->getTags();

        foreach ($tags as $tag) { 
            array_push($tagAry, $tag->getDisplayName()); 
        }
        return $tagAry;
    }
    /** Returns an array with the ids of each child source, or null if there are none. */
    private function getChildSources($srcEntity)
    {
        $children = $srcEntity->getChildSources();
        $childIds = [];

        foreach ($children as $child) {
            array_push($childIds, $child->getId());
        }
        return count($children) > 0 ? $childIds : null; 
    }
    private function getSourceTypeData($srcEntity)
    {
        $data = new \stdClass;
        $sourceType = $srcEntity->getSourceType()->getSlug();                   //print("\nsourceType = ".$sourceType);
        $getTypeData = [ 
            "author" => function($entity){ return $this->getAuthorData($entity); },
            "citation" => function($entity){ return $this->getCitationData($entity); },
            "publication" => function($entity){ return $this->getPublicationData($entity); }
        ];

        if (array_key_exists($sourceType, $getTypeData)) {
            $data->$sourceType = call_user_func($getTypeData[$sourceType], $srcEntity);
        }
        return $data;
    }
    /** Returns an associative array with the author data. */
    private function getAuthorData($srcEntity)
    {
        $author = $srcEntity->getAuthor();  //print("\n    srcEntity = ". $srcEntity."  author = ". $author);
        $authData = [
            'contributions' => [], 'displayName' => $author->getDisplayName(),
            'fullName' => $author->getFullName(), 'lastName' => $author->getLastName()
        ];
        $contributions = $srcEntity->getContributions();
        // Adds the work source id to the array of author contributions
        foreach ($contributions as $contrib) {
            array_push($authData['contributions'], $contrib->getWorkSource()->getId());
        }
        return $authData;
    }
    /** Returns an associative array with the publication data. */
    private function getPublicationData($srcEntity)
    {
        $pub = $srcEntity->getPublication();
        $pubType = $pub->getPublicationType() ? 
            $pub->getPublicationType()->getId() : 0;

        return [ 'description' => $pub->getDescription(), 
                 'displayName' => $pub->getDisplayName(),
                 'type' => $pubType 
        ];
    }
    /** Returns an associative array with the citation data. */
    private function getCitationData($srcEntity)
    {
        $cit = $srcEntity->getCitation();
        $citData = [ 'displayName' => $cit->getDisplayName(),
                     'fullText' => $cit->getFullText(), 
                     'publicationIssue' => $cit->getPublicationIssue(),
                     'publicationPages' => $cit->getPublicationPages(),
                     'publicationVolume' => $cit->getPublicationVolume(),
                     'title' => $cit->getTitle(),
        ];
        return $citData;
    }
/**------------------------Search Interaction Actions-------------------------*/
    /**
     * Returns all interaction records.
     *
     * @Route("/search/interaction", name="app_ajax_search_ints")
     */
    public function getInteractionData(Request $request) 
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }  
        $em = $this->getDoctrine()->getManager();
        $interactions = $em->getRepository('AppBundle:Interaction')->findAll();

        $intRcrds = new \stdClass;

        foreach ($interactions as $int) 
        {                     
            $rcrd = new \stdClass;
            $intId = $int->getId();
            $intRcrds->$intId = $rcrd;
            
            $rcrd->id = $intId;
            $rcrd->note = $int->getNote();
            $rcrd->interactionType = $int->getInteractionType()->getName();
            $rcrd->source = array(
                "name" => $int->getSource()->getDescription(),
                "fullText" => $int->getSource()->getCitation()->getFullText(),
                "id" => $int->getSource()->getId());
            $rcrd->subject = array(
                "name" => $int->getSubject()->getDisplayName(),
                "level" => $int->getSubject()->getLevel()->getName(),
                "id" => $int->getSubject()->getId());  
            $rcrd->object = array(
                "name" => $int->getObject()->getDisplayName(),
                "level" => $int->getObject()->getLevel()->getName(),
                "id" => $int->getObject()->getId());
            $rcrd->tags = $this->getTagAry($int->getTags());  

            if ($int->getLocation() !== null) {
                $rcrd->habitatType = $int->getLocation()->getHabitatType() === null ?
                    null : $int->getLocation()->getHabitatType()->getDisplayName();
                $rcrd->location = $this->getInteractionLocData($int);
            } else {
                $rcrd->location = null;
                $rcrd->habitatType = null;
            }
        }
        $response = new JsonResponse();
        $response->setData(array(
            'intRcrds' => $intRcrds
        ));
        return $response;
    }
    private function getInteractionLocData($int)
    {
        $location = $int->getLocation();
        $locData = new \stdClass;

        $locData->name = $location->getDisplayName();
        $locData->id = $location->getId();
        $locData->type = $location->getLocationType()->getDisplayName(); 
        /** Deduce and set $locData->country and $locData->region */ 
        if ($locData->type === "Area" || $locData->type === "Point" || $locData->type === "Habitat") { 
            $parentType = $location->getParentLoc()->getLocationType()->getDisplayName();
            $this->getCountryAndRegion($location->getParentLoc(), $parentType, $locData);
        } else if ($locData->type === "Country") {  
            $locData->country = $locData->name;
            $parentType = $location->getParentLoc()->getLocationType()->getDisplayName();
            $this->getRegion($location->getParentLoc(), $parentType, $locData);
        } else if ($locData->type === "Region") {
            $locData->country = null;
            $locData->region = $locData->name;
        }
        return $locData;
    }
    private function getCountryAndRegion($parentLoc, $parentType, &$locData)
    {
        if ($parentType === "Country") {
            $locData->country = $parentLoc->getDisplayName();
            $grandParentType = $parentLoc->getParentLoc()->getLocationType()->getDisplayName();
            $this->getRegion($parentLoc->getParentLoc(), $grandParentType, $locData);
        } else {
            $locData->country = null;
            $this->getRegion($parentLoc, $parentType, $locData);
        }
    }
    private function getRegion($parentLoc, $parentType, &$locData)
    {
        if ($parentType === "Region") {
            $locData->region = $parentLoc->getDisplayName();
        }
    }
/**------------------------Shared Search Methods------------------------------*/
    /** Returns an associative array of Type ids and their lowercased names. */
    private function buildTypeAry($entityType, $em)
    {
        $types = $em->getRepository('AppBundle:'.$entityType)->findAll();
        $ary = [];
        foreach ($types as $type) {
            $subAry = [lcfirst($type->getDisplayName()) => strval($type->getId())];
            $ary = array_merge($ary, $subAry);
        }
        return $ary;
    }
    private function getInteractionIds($interactions)
    {
        if ( count($interactions) === 0 ) { return null; }
        $intRcrds = [];

        foreach ($interactions as $int) 
        {
            array_push( $intRcrds, $int->getId() );
        }
        return $intRcrds;
    }
    private function getTagAry($tags)
    {
        $ary = [];
        foreach ($tags as $tag) 
        {
            array_push($ary, $tag->getDisplayName());
        }
        return $ary;
    }
}