<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

/**
 * Ajax controller.
 *
 * @Route("/ajax")
 */
class AjaxController extends Controller
{
    /**
     * Post to entity.
     *
     * @Route("/post", name="app_ajax_post")
     * @Method("POST")
     */
    public function postAction(Request $request) 
	  {
  	    if (!$request->isXmlHttpRequest()) {
  	        return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
  	    }  

        $em = $this->getDoctrine()->getManager();
        $logger = $this->get('logger');
        $requestContent = $request->getContent();
        $pushedData = json_decode($requestContent);
        
        $entityData = $pushedData->data->entityData;
        $refData = $pushedData->data->refData;        //  $logger->error('SASSSSSSS:: refData ->' . print_r($refData, true));
        $linkFields = $pushedData->data->linkFields;     //  $logger->error('SASSSSSSS:: linkFields ->' . print_r($linkFields, true));

        $entityName = $pushedData->entity;
        $entityClassPrefix = "AppBundle\\Entity\\";
        $entityClass = $entityClassPrefix . $entityName;        $logger->info('SASSSSSSS:: entityName ->' . print_r($entityName, true));
        $returnRefs = [];
        $returnData = [];

        foreach ($entityData as $rcrdId => $rcrd) {    
            $entity = new $entityClass;
            
            foreach ($rcrd as $field => $val) {     //   $logger->info('SASSSSSSS:: rcrd ->' . print_r($rcrd, true));
                if ($field === "tempId") { continue; }
                
                $setField = "set" . ucfirst($field); //  $logger->info('SASSSSSSS:: setField ->' . print_r($setField, true));
                
                $setRefField = function($field, $val) use ($entity, $refData, $setField, $em, $entityClassPrefix, $logger) {
                    $refId = $refData->$field->$val;  //    $logger->error('SASSSSSSS:: subRefId ->' . print_r($refId, true));
                    $relatedEntity = $em->getRepository("AppBundle\\Entity\\" . $field)->find($refId);
                    $entity->$setField($relatedEntity);
                };

                if (!empty($linkFields) && in_array($field, $linkFields)) {   //   $logger->error('SASSSSSSS:: val ->' . print_r($val, true));
                    if ($val === null) { continue; }

                    if (is_array($val)) {
                        foreach ($val as $subVal) {
                            $setRefField($field, $subVal);                           
                        }
                    } else {
                        $setRefField($field, $val);              
                    }
                } else {
                    $entity->$setField($val);            //  $logger->info('SASSSSSSS:: val ->' . print_r($val, true));   
                }
            }

            $returnRefs[$rcrdId] = $entity;
            $em->persist($entity);
        }
        $em->flush();

        foreach ($returnRefs as $refId => $entity) {
            $returnData[$refId] = $entity->getId();
        }

        $response = new JsonResponse();
        $response->setData(array(
            $entityName => $returnData,
        ));

        return $response;
    }
    /**
     * Post locations to regions
     * 
     * @Route("/post/region", name="app_ajax_post_region")
     * @Method("POST")
     */
    public function postRegionAction(Request $request)
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }   
        
        $em = $this->getDoctrine()->getManager();
        $logger = $this->get('logger');
        $requestContent = $request->getContent();
        $pushedData = json_decode($requestContent);
        
        $entityData = $pushedData->data->entityData;
        $refData = $pushedData->data->refData;        //  $logger->error('SASSSSSSS:: refData ->' . print_r($refData, true));

        $returnRefs = [];
        $returnData = [];

        foreach ($entityData as $rcrdId => $rcrd) {   
            $regRef =  $rcrd->region;
            $locRef = $rcrd->location;
            $regRefId = $refData->region->$regRef;    //  $logger->error('SASSSSSSS:: regRefId ->' . print_r($regRefId, true));
            $locRefId = $refData->location->$locRef;   // $logger->error('SASSSSSSS:: locRefId ->' . print_r($locRefId, true));

            $region = $em->getRepository('AppBundle:Region')->findOneBy(array('id' => $regRefId));
            $loc = $em->getRepository('AppBundle:Location')->findOneBy(array('id' => $locRefId));

            $region->addLocation($loc);
            $em->persist($region);
        }
        $em->flush();

        $response = new JsonResponse();
        $response->setData(array(
            "region_location" => "success",
        ));

        return $response;
    }
    /**
     * Post new Taxon entities.
     *
     * @Route("/post/taxon", name="app_ajax_post_taxon")
     * @Method("POST")
     */
    public function postTaxonAction(Request $request) 
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }   
        set_time_limit(1000);

        $em = $this->getDoctrine()->getManager();
        $logger = $this->get('logger');
        $requestContent = $request->getContent();
        $pushedData = json_decode($requestContent);
        
        $entityData = $pushedData->data->entityData;    $logger->error('SASSSSSSS:: taxon entityData ->' . print_r($entityData, true));
        $levelRefs = $pushedData->data->refData->level;          $logger->error('SASSSSSSS:: levelRefs ->' . print_r($levelRefs, true));

        $entityClass = "AppBundle\\Entity\\Taxon";
        $returnData = [];
        $taxaRefs = [];

        foreach ($entityData as $rcrdId => $rcrd) {    
            $entity = new $entityClass;

            $entity->setDisplayName($rcrd->displayName);

            $lvlRef = $rcrd->level;
            $lvlId = $levelRefs->$lvlRef;     $logger->error('SASSSSSSS:: lvlId ->' . print_r($lvlId, true));
            $lvlEntity = $em->getRepository("AppBundle\\Entity\\Level")->find($lvlId);
            $entity->setLevel($lvlEntity);

            if ($rcrd->parentTaxon !== null) {
                $prntRef = $rcrd->parentTaxon;  //    $logger->error('SASSSSSSS:: prntRef ->' . print_r($prntRef, true));
                $prntId = $taxaRefs[$prntRef];   //   $logger->error('SASSSSSSS:: prntId ->' . print_r($prntId, true));
                $prntEntity = $em->getRepository("AppBundle\\Entity\\Taxon")->find($prntId);
                $entity->setParentTaxon($prntEntity);
            }

            $em->persist($entity);
            $em->flush();

            $taxaRefs[$rcrdId] = $entity->getId();
        }

        $response = new JsonResponse();
        $response->setData(array(
            "taxon" => $taxaRefs,
        ));

        return $response;
    }
    /**
     * Post to Interaction Entity.
     *
     * @Route("/post/interaction", name="app_ajax_post_interaction")
     * @Method("POST")
     */
    public function postInteractionAction(Request $request) 
      {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }  
        set_time_limit(1000);


        $em = $this->getDoctrine()->getManager();
        $logger = $this->get('logger');
        $requestContent = $request->getContent();
        $pushedData = json_decode($requestContent);
        
        $entityData = $pushedData->data->entityData;
        $refData = $pushedData->data->refData;       //  $logger->error('SASSSSSSS:: refData ->' . print_r($refData, true));

        $entityClassPrefix = "AppBundle\\Entity\\";
        $interaction = $entityClassPrefix . "Interaction";
        $returnRefs = [];
        $returnData = [];
        $fieldTransMap = [
            "subject" => "taxon",
            "object" => "taxon",
            "tags" => "intTag"
        ];

        foreach ($entityData as $rcrdId => $rcrd) {    
            $entity = new $interaction;
            
            foreach ($rcrd as $field => $val) {     //   $logger->info('SASSSSSSS:: rcrd ->' . print_r($rcrd, true));
                if ($field === "tempId") { continue; }
                if ($val === null) { continue; }
                if ($field === "note") { 
                    $entity->setNote($val);
                    continue;
                }
                $setField = "set" . ucfirst($field); //  $logger->info('SASSSSSSS:: setField ->' . print_r($setField, true));
      
                $setRefField = function($field, $val) use ($entity, $refData, $setField, $em, $entityClassPrefix, $logger) {
                    $refId = $refData->$field->$val;   //   $logger->error('SASSSSSSS:: subRefId ->' . print_r($refId, true));
                    $relatedEntity = $em->getRepository("AppBundle\\Entity\\" . $field)->find($refId);
                    $entity->$setField($relatedEntity);
                };

                $setRefs = function($field, $val) use ($setRefField) {
                    if (is_array($val)) {
                        foreach ($val as $subVal){
                            $setRefField($field, $subVal);
                        }
                    } else {
                        $setRefField($field, $val);                     
                    }
                };  

                if (isset($fieldTransMap[$field])) {
                    $fieldEntity = $fieldTransMap[$field];   //   $logger->error('SASSSSSSS:: fieldEntity ->' . print_r($fieldEntity, true));                        
                    $setRefs($fieldEntity, $val);
                } else {
                    $setRefs($field, $val);        
                }
            }

            $returnRefs[$rcrdId] = $entity;
            $em->persist($entity);
        }

        $em->flush();

        foreach ($returnRefs as $refId => $entity) {
            $returnData[$refId] = $entity->getId();
        }

        $response = new JsonResponse();
        $response->setData(array(
            'interaction' => $returnData,
        ));

        return $response;
    }
/**------------------------Search By Taxa-------------------------------------*/
    /**
     * Get Domain Data.
     *
     * @Route("/search/domain", name="app_ajax_search_domain")
     */
    public function searchDomainAction(Request $request) 
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }  

        $em = $this->getDoctrine()->getManager();
        // $logger = $this->get('logger');

        $requestContent = $request->getContent();
        $pushedData = json_decode($requestContent);                             // $logger->error('SASSSSSSS:: pushedData ->' . print_r($pushedData, true));
        $props = $pushedData->props;

        $returnObj = new \stdClass;

        $entities = $em->getRepository('AppBundle:Domain')->findAll();

        foreach ($entities as $entity) 
        {                                                                       // $logger->error('SASSSSSSS:: entity ->' . print_r('entity', true));
            $taxonId = strval($entity->getTaxon()->getId());
            $returnObj->$taxonId = [];

            foreach ($props as $prop) 
            {
                $getProp = 'get' . ucfirst($prop);                              // $logger->error('SASSSSSSS:: getProp ->' . print_r($getProp, true));
                $propVal = $entity->$getProp();                                 // $logger->error('SASSSSSSS:: propVal ->' . print_r($propVal, true));
                $returnObj->$taxonId = array_merge( 
                    $returnObj->$taxonId, [ $prop => $propVal ] 
                );
            }
        }

        $response = new JsonResponse();
        $response->setData(array(
            'results' => $returnObj
        ));

        return $response;
    }

    /**
     * Get Interaction IDs by Taxa.
     *
     * @Route("/search/taxa", name="app_ajax_search_taxa")
     */
    public function searchTaxaAction(Request $request) 
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }  

        $em = $this->getDoctrine()->getManager();
        // $logger = $this->get('logger');
        $requestContent = $request->getContent();
        $pushedParams = json_decode($requestContent); //$logger->error('SASSSSSSS:: pushedParams ->' . print_r($pushedParams, true));

        $returnObj = new \stdClass;

        $taxa = $em->getRepository('AppBundle:Taxon')->findAll();

        foreach ($taxa as $taxon) 
        {
            $this->getTaxonData($taxon, $pushedParams, $returnObj);
        }

        $response = new JsonResponse();
        $response->setData(array(
            'results' => $returnObj
        ));

        return $response;
    }
    private function getTaxonData($taxon, $params, $returnObj) 
    {
        $taxonId = $taxon->getId();
        $taxonKey = strval($taxonId);

        $returnObj->$taxonKey = new \stdClass;

        foreach ($params->props as $prop) 
        {
            $getProp = 'get' . ucfirst($prop);
            $returnObj->$taxonKey->$prop = $taxon->$getProp();           
        }

        $returnObj->$taxonKey->id = $taxon->getId();
        $returnObj->$taxonKey->children = $this->getChildren($taxon, $params);
        $returnObj->$taxonKey->parentTaxon = $taxon->getParentTaxon() ?
            $taxon->getParentTaxon()->getId() : null ;           
        $returnObj->$taxonKey->level = $taxon->getLevel()->getName();                //getInteractions($taxon);
        $returnObj->$taxonKey->interactions = $this->getTaxaInteractions($taxon, $params);
    }
    private function getChildren($taxon, $params)
    {
        $childEntities = $taxon->getChildTaxa();
        $children = [];

        foreach ($childEntities as $child)
        {
            array_push($children, $child->getId());
        }
        return $children;
    }
    private function getTaxaInteractions($taxon, $params) 
    {
        $intRcrds = new \stdClass;

        foreach ($params->roles as $role) 
        {
            $getIntRcrds = 'get' . $role; 
            $interactions = $taxon->$getIntRcrds();
            $intRcrds->$role = $this->getInteractions($interactions, $params);
        }
        return $intRcrds;
    }
/**------------------------Search By Location---------------------------------*/

    /**
     * Get Interactions IDs by Region and Location.
     *
     * @Route("/search/location", name="app_ajax_search_location")
     */
    public function searchLocationsAction(Request $request) 
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }  

        $em = $this->getDoctrine()->getManager();
        // $logger = $this->get('logger');            // $logger->error('SASSSSSSS:: pushedData ->' . print_r($pushedData, true));

        $intsByRegion = new \stdClass;

        $locations = $em->getRepository('AppBundle:Location')->findAll();

        foreach ($locations as $location) 
        {                     //  $logger->error('SASSSSSSS:: location ->' . print_r($location, true));
            $loc = new \stdClass;

            $loc->id = $location->getId();
            $loc->desc = $location->getDescription();
            $loc->elev = $location->getElevation();
            $loc ->elevMax = $location->getElevationMax();
            $loc->elevUnit = $location->getElevUnitAbbrv();
            $loc->gpsData = $location->getGpsData();
            $loc->lat = $location->getLatitude();
            $loc->long = $location->getLongitude();
            $loc->habitatType = $location->getHabitatType() === null ? null : $location->getHabitatType()->getName();  // $logger->error('SASSSSSSS:: getting interactions...');
            $interactions = $location->getInteractions();
            $loc->intRcrds = $this->getInteractions($interactions);

            if ($location->getCountry() === null) {
                $country =  null;
                $countryId = null;
            } else { 
                $country = $location->getCountry()->getName();
                $countryId = $location->getCountry()->getId();
            }
            $region = $this->getLocRegions($location->getRegions());            //$logger->error('SASSSSSSSSSSSS:: region = ' . print_r($region, true));
            $loc->country = $country;
            $loc->countryId = $countryId;
            $loc->region = $region;

            if ( $country === null ) {
                if ( !property_exists($intsByRegion, $region) ) {//  $logger->error('SASSSSSSSSSSSS:: region property being created = ' . print_r($region, true));
                    $intsByRegion->$region = []; 
                }
                if (is_array($intsByRegion->$region)) {
                    $intsByRegion->$region = array_merge( 
                        $intsByRegion->$region, [ $loc->id => $loc ]
                    );         
                } else {
                    if ( !property_exists($intsByRegion->$region, "Unspecified") ) {
                        $intsByRegion->$region->Unspecified = [];
                    }
                    $intsByRegion->$region->Unspecified = array_merge( 
                        $intsByRegion->$region->Unspecified, [ $loc->id => $loc ]
                    ); 
                }
            } else {
                if ( !property_exists($intsByRegion, $region) ) {  ///$logger->error('SASSSSSSSSSSSS:: region property being created with country = ' . print_r($region, true));
                    $intsByRegion->$region = new \stdClass; 
                }
                if ( !property_exists($intsByRegion->$region, $country) ) { 
                    $intsByRegion->$region->$country = []; 
                }
                $intsByRegion->$region->$country = array_merge( 
                    $intsByRegion->$region->$country, [ $loc->id => $loc ]
                );            
            }
        }  // $logger->error('SASSSSSSSSSSSS:: about to return... ->' . print_r($intsByRegion, true));

        $response = new JsonResponse();
        $response->setData(array(
            'results' => $intsByRegion              //$intsByRegion
        ));

        return $response;
    }
    private function getLocRegions($regionEntities)  /*Can't figure out how to properly access the first propeprty, i.e. the first region, so only the first region is being used currently.*/
    {
        if ($regionEntities[0] !== null) {
            $region = $regionEntities[0]->getDescription();
            // $regionAry = explode(",", $region);
            return $region;              //$regionAry[0];
        } else {
            return "Unspecified";
        }
    }
    /**
     * Get Interactions.
     *
     * @Route("/search/interaction", name="app_ajax_search_interaction")
     */
    public function searchInteractionAction(Request $request) 
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }  

        $em = $this->getDoctrine()->getManager();
        // $logger = $this->get('logger');            // $logger->error('SASSSSSSS:: pushedData ->' . print_r($pushedData, true));

        $intRcrds = new \stdClass;

        $interactions = $em->getRepository('AppBundle:Interaction')->findAll();

        foreach ($interactions as $int) 
        {                     //  $logger->error('SASSSSSSS:: location ->' . print_r($location, true));
            $rcrd = new \stdClass;
            $intId = $int->getId();
            $rcrd->id = $intId;
            $rcrd->note = $int->getNote();
            $rcrd->citation = $int->getCitation()->getDescription();
            $rcrd->interactionType = $int->getInteractionType()->getName();
            $rcrd->subject = array(
                "name" => $int->getSubject()->getDisplayName(),
                "level" => $int->getSubject()->getLevel()->getName(),
                "id" => $int->getSubject()->getId() );  // $logger->error('SASSSSSSS:: $rcrd->subject ->' . print_r($rcrd->subject, true));
            $rcrd->object = array(
                "name" => $int->getObject()->getDisplayName(),
                "level" => $int->getObject()->getLevel()->getName(),
                "id" => $int->getObject()->getId() );
            $rcrd->tags = $this->getTagAry($int->getTags());  

            if ($int->getLocation() !== null) {
                $rcrd->location = $int->getLocation()->getDescription();
                $rcrd->country = $int->getLocation()->getCountry() === null ?
                    null : $int->getLocation()->getCountry()->getName() ;
                $rcrd->region = $int->getLocation()->getCountry() === null ?
                    null : $int->getLocation()->getCountry()->getRegion()->getDescription() ;
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
    private function getInteractions($interactions)
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