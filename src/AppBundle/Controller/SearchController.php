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
    /**------------------------Search By Taxa---------------------------------*/
    /**
     * Returns a Taxa data obj and Domain data obj organized by taxon ID
     *
     * @Route("/search/taxa", name="app_ajax_search_taxa")
     */
    public function searchTaxaAction(Request $request) 
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }  
        $em = $this->getDoctrine()->getManager();

        $domainData = $this->getDomainData($em);
        $domainTaxaIds = array_keys(get_object_vars($domainData));  

        $taxaData = new \stdClass;

        foreach ($domainTaxaIds as $domainTaxonId) 
        {                                     
            $domainTaxonEntity = $em->getRepository('AppBundle:Taxon')
                ->findOneBy(array('id' => $domainTaxonId));
            $taxonId = $domainTaxonEntity->getId();
            $taxaData->$taxonId = $this->getTaxonData($domainTaxonEntity, $taxaData);
        } 

        $response = new JsonResponse();
        $response->setData(array(                                    
            'domainData' => $domainData, 'taxaData' => $taxaData
        )); 
        return $response;
    }
    /** Returns domain data by taxon ID */
    private function getDomainData($em)
    {
        $domainEntities = $em->getRepository('AppBundle:Domain')->findAll();
        $data = new \stdClass;

        foreach ($domainEntities as $entity) 
        {                               
            $taxonId = $entity->getTaxon()->getId();
            $slug = $entity->getSlug();                               
            $name = $entity->getPluralName();                              

            $data->$taxonId = [ "slug" => $slug, "name" => $name ];
        }  
        return $data;
    }
    /**
     * Builds and returns Taxa Data object starting with the parent taxon for each domain.
     */
    private function getTaxonData($taxon, &$taxaData) 
    {           
        $data = new \stdClass;

        $data->id = $taxon->getId();
        $data->name = $taxon->getDisplayName();
        $data->slug = $taxon->getSlug();
        $data->children = $this->getTaxaChildren($taxon, $taxaData);
        $data->parentTaxon = $taxon->getParentTaxon() ?
            $taxon->getParentTaxon()->getId() : null ;           
        $data->level = $taxon->getLevel()->getName();               
        $data->interactions = $this->getTaxaInteractionIds($taxon);

        return $data;
    }
    /** Calls getTaxonData for each child and returns an array of all child Ids */
    private function getTaxaChildren($taxon, &$taxaData)
    {   
        $children = [];
        $childEntities = $taxon->getChildTaxa();

        foreach ($childEntities as $child)
        {
            $childId = $child->getId();
            array_push($children, $childId);
            $taxaData->$childId = $this->getTaxonData($child, $taxaData);
        }
        return $children;
    }
    private function getTaxaInteractionIds($taxon) 
    {
        $intRcrds = new \stdClass;
        $roles = ['SubjectRoles', 'ObjectRoles'];

        foreach ($roles as $role) 
        {
            $getIntRcrds = 'get' . $role; 
            $interactions = $taxon->$getIntRcrds();
            $intRcrds->$role = $this->getInteractionIds($interactions);
        }
        return $intRcrds;
    }
/**------------------------Search By Location---------------------------------*/
    /**
     * Returns Location Data organized by ID
     *
     * @Route("/search/location", name="app_ajax_search_location")
     */
    public function searchLocationsAction(Request $request) 
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }  

        $em = $this->getDoctrine()->getManager();
        $locDataById = new \stdClass;
        $topRegions = [];

        $regionLocs = $em->getRepository('AppBundle:Location')
            ->findBy(array('locationType' => '1'));

        foreach ($regionLocs as $locEntity) 
        {                    
            $locId = $locEntity->getId(); 
            if ($locEntity->getParentLoc() === null) {  /** Only top regions are handled here */
                array_push($topRegions, $locId);
                $locDataById->$locId = $this->getLocationData($locEntity, $locDataById);
            }
        }

        $response = new JsonResponse();
        $response->setData(array(
            'locRcrds' => $locDataById, 'topRegions' => $topRegions               
        ));

        return $response;
    }
    /**
     * Builds and returns Location Data object.
     */
    private function getLocationData($locEntity, &$locDataById)
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
        $data->locationType = $locEntity->getLocationType()->getName(); 
        $data->childLocs = $this->getChildLocationData($locEntity, $locDataById);
        
        $parentLoc = $locEntity->getParentLoc();
        $data->parentLoc = $parentLoc === null ? null : $parentLoc->getId();

        $habitatType = $locEntity->getHabitatType();                            //echo("\nhabitatType = ".gettype($habitatType)); 
        $data->habitatType = $habitatType === null ? null : $habitatType->getName() ;
        
        $interactions = $locEntity->getInteractions();
        $data->interactions = $this->getInteractionIds($locEntity->getInteractions());

        return $data;
    }    
    /**
     * Returns an object keyed with child location descriptions and their data.
     */
    private function getChildLocationData($parentLoc, &$locDataById)
    {
        $children = [];
        $childLocs = $parentLoc->getChildLocs();  

        foreach ($childLocs as $childLoc) {
            $childId = $childLoc->getId();
            array_push($children, $childId);

            $locDataById->$childId = $this->getLocationData($childLoc, $locDataById);
        }     
        return $children;
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
        $srcDataById = new \stdClass;

        $srcEntities = $em->getRepository('AppBundle:Source')
            ->findAll();

        foreach ($srcEntities as $srcEntity) 
        {                    
            $id = $srcEntity->getId(); 
            $srcDataById->$id = $this->getSourceData($srcEntity, $srcDataById);
        }

        $response = new JsonResponse();
        $response->setData(array(
            'results' => $srcDataById               
        ));

        return $response;
    }
    /**
     * Builds and returns Source Data object.
     */
    private function getSourceData($srcEntity, &$srcDataById)
    {
        $data = new \stdClass; 

        $data->id = $srcEntity->getId();
        $data->displayName = $srcEntity->getDisplayName();
        $data->description = $srcEntity->getDescription();
        $data->year = $srcEntity->getYear();
        $data->doi = $srcEntity->getDoi();
        $data->linkUrl = $srcEntity->getLinkUrl();
        $data->linkDisplay = $srcEntity->getLinkDisplay();
        $data->tags = $this->getSourceTags($srcEntity);

        $parentSource = $srcEntity->getParentSource();
        $data->parentSource = $parentSource == null ? null : $parentSource->getId();

        $sourceType = $srcEntity->getSourceType()->getDisplayName();
        $data->sourceType = $sourceType;

        if ($sourceType === "Author") {
            $data->author = $this->getAuthorData($srcEntity);
        } else if ($sourceType === "Publication") {
            $data->publication = $this->getPublicationData($srcEntity);
        } else if ($sourceType === "Citation") {
            $data->citation = $this->getCitationData($srcEntity);
        }
        return $data;
    }    
    /** Returns an array with the tags for the source. */
    private function getSourceTags($srcEntity)
    {
        $tagAry = [];
        $tags = $srcEntity->getTags();

        foreach ($tags as $tag) { 
            array_push($tagAry, $tag->getTag()); 
        }
        return $tagAry;
    }
    /** Returns an associative array with the author data. */
    private function getAuthorData($srcEntity)
    {
        $author = $srcEntity->getAuthor();
        $authData = [
            'contributions' => [], 'displayName' => $author->getDisplayName(),
            'fullName' => $author->getFullName()
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

        return [ 'description' => $pub->getDescription(), 
                 'type' => $pub->getPublicationType() ];
    }
    /** Returns an associative array with the citation data. */
    private function getCitationData($srcEntity)
    {
        $cit = $srcEntity->getCitation();
        $tags = $cit->getTags();
        $citData = [ 'fullText' => $cit->getFullText(), 
                     'publicationVolume' => $cit->getPublicationVolume(),
                     'publicationIssue' => $cit->getPublicationIssue(),
                     'publicationPages' => $cit->getPublicationPages(),
                     'title' => $cit->getTitle(), 'tags' => []
                    ];
        // Adds each tag to the array of citation tags
        foreach ($tags as $tag) {
            array_push($citData['tags'], $tag->getTag());
        }
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
            $rcrd->id = $intId;
            $rcrd->note = $int->getNote();
            $rcrd->citation = $int->getCitation()->getDescription();
            $rcrd->interactionType = $int->getInteractionType()->getName();
            $rcrd->subject = array(
                "name" => $int->getSubject()->getDisplayName(),
                "level" => $int->getSubject()->getLevel()->getName(),
                "id" => $int->getSubject()->getId() );  
            $rcrd->object = array(
                "name" => $int->getObject()->getDisplayName(),
                "level" => $int->getObject()->getLevel()->getName(),
                "id" => $int->getObject()->getId() );
            $rcrd->tags = $this->getTagAry($int->getTags());  

            if ($int->getLocation() !== null) {
                $rcrd->location = $int->getLocation()->getDescription();
                $rcrd->habitatType = $int->getLocation()->getHabitatType() === null ?
                    null : $int->getLocation()->getHabitatType()->getName() ;
            }
            $intRcrds->$intId = $rcrd;
        }
        
        $response = new JsonResponse();
        $response->setData(array(
            'results' => $intRcrds
        ));

        return $response;
    }
/**------------------------Shared Search Methods------------------------------*/
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
            array_push($ary, $tag->getTag());
        }
        return $ary;
    }
}