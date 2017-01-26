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
     * @Route("/search/taxon", name="app_serialize_taxon")
     */
    public function serializeTaxonDataAction(Request $request) 
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }  
        $em = $this->getDoctrine()->getManager();
        $serializer = $this->container->get('jms_serializer');

        $domain = $this->serializeEntity('Domain', $serializer, $em);
        $level = $this->serializeEntity('Level', $serializer, $em);
        $taxon = $this->serializeEntity('Taxon', $serializer, $em);

        $response = new JsonResponse(); 
        $response->setData(array(                                    
            'domain' => $domain,    'level' => $level,
            'taxon' => $taxon            
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

        $habitatType = $this->serializeEntity('HabitatType', $serializer, $em);
        $location = $this->serializeEntity('Location', $serializer, $em);
        $locType = $this->serializeEntity('LocationType', $serializer, $em);
        $unspecifiedLocInts = $this->getInteractionsWithNoLocation($em);

        $response = new JsonResponse();
        $response->setData(array( 
            'location' => $location,    'habitatType' => $habitatType,   
            'locationType' => $locType, 'noLocIntIds' => $unspecifiedLocInts
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

        $author = $this->serializeEntity('Author', $serializer, $em);
        $citation = $this->serializeEntity('Citation', $serializer, $em);
        $citType = $this->serializeEntity('CitationType', $serializer, $em);
        $publication = $this->serializeEntity('Publication', $serializer, $em);
        $pubType = $this->serializeEntity('PublicationType', $serializer, $em);
        $source = $this->serializeEntity('Source', $serializer, $em);
        $srcType = $this->serializeEntity('SourceType', $serializer, $em);
        $tag = $this->serializeEntity('Tag', $serializer, $em);

        $response = new JsonResponse();
        $response->setData(array( 
            'author' => $author,        'citation' => $citation,
            'source' => $source,        'citationType' => $citType, 
            'sourceType' => $srcType,   'publication' => $publication,  
            'tag' => $tag,              'publicationType' => $pubType
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

        $interaction = $this->serializeEntity('Interaction', $serializer, $em);
        $intType = $this->serializeEntity('InteractionType', $serializer, $em);

        $response = new JsonResponse();
        $response->setData(array(
            'interaction' => $interaction,  'interactionType' => $intType
        ));
        return $response;
    }
    /** Returns serialized Entity data. */
    private function serializeEntity($entity, $serializer, $em)
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