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
        
        $entityData = $pushedData->data->entityData;   //  $logger->error('SASSSSSSS:: taxon entityData ->' . print_r($entityData, true));
        $levelRefs = $pushedData->data->refData->level;    //      $logger->error('SASSSSSSS:: levelRefs ->' . print_r($levelRefs, true));

        $entityClass = "AppBundle\\Entity\\Taxon";
        $returnData = [];
        $taxaRefs = [];

        foreach ($entityData as $rcrdId => $rcrd) {    
            $entity = new $entityClass;

            $entity->setDisplayName($rcrd->displayName);

            $lvlRef = $rcrd->level;
            $lvlId = $levelRefs->$lvlRef;    //  $logger->error('SASSSSSSS:: taxaRefs ->' . print_r($taxaRefs, true));
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
    /**
     * Get Search Data.
     *
     * @Route("/search", name="app_ajax_search")
     */
    public function searchAction(Request $request) 
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }  

        $em = $this->getDoctrine()->getManager();
        $logger = $this->get('logger');

        $requestContent = $request->getContent();
        $pushedData = json_decode($requestContent); //  $logger->error('SASSSSSSS:: requestContent ->' . print_r($requestContent, true));
        $repo = $pushedData->repo;        $logger->error('SASSSSSSS:: pushedData ->' . print_r($pushedData, true));
        $repoQ = $pushedData->repoQ;
        $props = $pushedData->props;

        $returnObj = new \stdClass;
        $tempId = 1;

        if ($repoQ === 'findAll') {
            $entities = $em->getRepository('AppBundle:' . $repo)
                    ->findAll();

        } else if ($repoQ === "findOne") {
            // $entity = $em->getRepository('AppBundle:' . $repo)
            //         ->findOneBy(array('slug' => $slug));
        }   // $logger->error('SASSSSSSS:: entity ->' . print_r($entity, true));

        foreach ($entities as $entity) {  $logger->error('SASSSSSSS:: entity ->' . print_r('entity', true));
            $returnObj->$tempId = [];


            foreach ($props as $prop) {
                $getProp = 'get' . ucfirst($prop);  $logger->error('SASSSSSSS:: getProp ->' . print_r($getProp, true));
                $propVal = $entity->$getProp();     $logger->error('SASSSSSSS:: propVal ->' . print_r($propVal, true));

                $returnObj->$tempId = array_merge($returnObj->$tempId, [ $prop => $propVal ] );
            }

            ++$tempId;
        }

        $response = new JsonResponse();
        $response->setData(array(
            'results' => $returnObj,
        ));

        return $response;
    }

    /**
     * Get Taxa Search Data.
     *
     * @Route("/search/taxa", name="app_ajax_search_taxa")
     */
    public function searchTaxaAction(Request $request) 
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }  

        $em = $this->getDoctrine()->getManager();
        $logger = $this->get('logger');

        $requestContent = $request->getContent();
        $pushedParams = json_decode($requestContent); $logger->error('SASSSSSSS:: pushedParams ->' . print_r($pushedParams, true));


        $returnObj = new \stdClass;

        $domainParnt = $em->getRepository('AppBundle:' . $pushedParams->repo)
                    ->findOneBy(array('slug' => $pushedParams->id));

        $parntTaxon = $domainParnt->getTaxon();

        $directChildren = $parntTaxon->getChildTaxa();

        $this->getNextLevel([$parntTaxon], $pushedParams, $returnObj);


        $response = new JsonResponse();
        $response->setData(array(
            'results' => $returnObj,
        ));

        return $response;
    }
    // Recurse to leaf taxon and call getTaxonData
    private function getNextLevel($siblings, $params, $returnObj) 
    {
        foreach ($siblings as $taxon) {
            $children = $taxon->getChildTaxa(); 

            if (count($children) >= 1) {
                $this->getNextLevel($children, $params, $returnObj);
                $this->getTaxonData($taxon, $params, $returnObj);
            } else {
                $this->getTaxonData($taxon, $params, $returnObj);
            }
        }
    }
    private function getTaxonData($taxon, $params, $returnObj) 
    {
        $taxonId = $taxon->getId();
        $returnObj->$taxonId = new \stdClass;

        foreach ($params->props as $prop) {
            $getProp = 'get' . ucfirst($prop);
            $returnObj->$taxonId->$prop = $taxon->$getProp();           
        }

        $returnObj->$taxonId->children = $this->getChildren($taxon, $params, $returnObj);
        $returnObj->$taxonId->parentTaxon = $taxon->getParentTaxon()->getId();           
        $returnObj->$taxonId->level = $taxon->getLevel()->getName();                //getInteractions($taxon);
        $returnObj->$taxonId->interactions = $this->getTaxaInteractions($taxon, $params, $returnObj);
    }
    private function getChildren($taxon, $params, $returnObj)
    {
        $childEntities = $taxon->getChildTaxa();
        $children = [];

        foreach ($childEntities as $child)
        {
            array_push($children, $child->getId());
        }
        return $children;
    }
    private function getTaxaInteractions($taxon, $params, $returnObj) 
    {
        $intRcrds = new \stdClass;

        foreach ($params->roles as $role) {
            $getIntRcrds = 'get' . $role; 
            $interactions = $taxon->$getIntRcrds();
            $intRcrds->$role = $this->getInteractions($interactions, $params, $returnObj);
        }
        return $intRcrds;
    }
    private function getInteractions($interactions, $params, $returnObj)
    {
        $intRcrds = [];

        $logger = $this->get('logger');


        foreach ($interactions as $int) {
            $rcrd = new \stdClass;
         
            $rcrd->id = $int->getId();
            $rcrd->note = $int->getNote();
            $rcrd->citation = $int->getCitation()->getDescription();
            $rcrd->interactionType = $int->getInteractionType()->getName();
            $rcrd->subject = array(
                "name" => $int->getSubject()->getDisplayName(),
                "Level" => $int->getSubject()->getLevel()->getName(),
                "id" => $int->getSubject()->getId() );  // $logger->error('SASSSSSSS:: $rcrd->subject ->' . print_r($rcrd->subject, true));
            $rcrd->object = array(
                "name" => $int->getObject()->getDisplayName(),
                "level" => $int->getObject()->getLevel()->getName(),
                "id" => $int->getObject()->getId() );
            $rcrd->tags = $int->getTags();

            if ($int->getLocation() !== null) {
                $rcrd->location = $int->getLocation()->getDescription();
                $rcrd->country = $int->getLocation()->getCountry() === null ?
                    null : $int->getLocation()->getCountry()->getName() ;
                $rcrd->habitatType = $int->getLocation()->getHabitatType() === null ?
                    null : $int->getLocation()->getHabitatType()->getName() ;
            }
            array_push( $intRcrds, $rcrd );
        }
        return $intRcrds;
    }
}