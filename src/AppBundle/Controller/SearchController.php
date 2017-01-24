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
            'domainData' => $domainData, 
            'levelData' => $levelData,
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
    /**
     * Returns serialized data objects for Habitat Type, Location Type, and Location. 
     *
     * @Route("/search/location", name="app_serialize_location")
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
        $unspecifiedLocInts = $this->getNoLocInteractionIds($em);

        $response = new JsonResponse();
        $response->setData(array( 
            'habitatTypeData' => $habitatTypeData, 
            'locationData' => $locationData, 
            'locationTypeData' => $locTypeData, 
            'noLocIntIds' => $unspecifiedLocInts
        ));
        return $response;
    }
    /** The only properties are those that later affect how this 'region' will be handled. */
    private function getNoLocInteractionIds($em)
    {
        $interactions = $em->getRepository('AppBundle:Interaction')
            ->findBy(array('location'=> null));   
        return $this->getInteractionIds($interactions);
    }
    /**
     * Returns serialized data objects for all entities related to Source. 
     *
     * @Route("/search/source", name="app_serialize_source")
     */
    public function serializeSourceDataAction(Request $request) 
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }  
        $em = $this->getDoctrine()->getManager();
        $serializer = $this->container->get('jms_serializer');

        $authorData = $this->getEntityData('Author', $serializer, $em);
        $citationData = $this->getEntityData('Citation', $serializer, $em);
        $citTypeData = $this->getEntityData('CitationType', $serializer, $em);
        $publicationData = $this->getEntityData('Publication', $serializer, $em);
        $pubTypeData = $this->getEntityData('PublicationType', $serializer, $em);
        $sourceData = $this->getEntityData('Source', $serializer, $em);
        $srcTypeData = $this->getEntityData('SourceType', $serializer, $em);
        $tagData = $this->getEntityData('Tag', $serializer, $em);

        $response = new JsonResponse();
        $response->setData(array( 
            'authorData' => $authorData, 
            'citationData' => $citationData,
            'citationTypeData' => $citTypeData, 
            'publicationData' => $publicationData, 
            'publicationTypeData' => $pubTypeData, 
            'sourceData' => $sourceData, 
            'sourceTypeData' => $srcTypeData, 
            'tagData' => $tagData, 
        ));
        return $response;
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