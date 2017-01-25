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
    public function showSearchAction()
    {
        $em = $this->getDoctrine()->getManager();

        $repo = $em->getRepository('AppBundle:ContentBlock');

        return $this->render('ContentBlock/search.html.twig', array());
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
        $unspecifiedLocInts = $this->getInteractionsWithNoLocation($em);

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
    private function getInteractionsWithNoLocation($em)
    {
        $intRcrdIds = []; 
        $interactions = $em->getRepository('AppBundle:Interaction')
            ->findBy(array('location'=> null));   
        if ( count($interactions) === 0 ) { return null; } 
        
        foreach ($interactions as $int)  
        { 
            array_push( $intRcrdIds, $int->getId() ); 
        } 

        return $intRcrdIds; 
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
    /**
     * Returns serialized data objects for Interaction and Interaction Type. 
     *
     * @Route("/search/interaction", name="app_serialize_interactions")
     */
    public function serializeInteractionDataAction(Request $request) 
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }  
        $em = $this->getDoctrine()->getManager();
        $serializer = $this->container->get('jms_serializer');

        $interactionData = $this->getEntityData('Interaction', $serializer, $em);
        $intTypeData = $this->getEntityData('InteractionType', $serializer, $em);

        $response = new JsonResponse();
        $response->setData(array(
            'interactionData' => $interactionData,
            'interactionTypeData' => $intTypeData
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
}