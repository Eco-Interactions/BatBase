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
                
                $setRefField = function($field, $val) use ($entity, $refData, $setField, $em, $logger) {
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
     * Post entitoes with more complex relationships and/or properties.
     * 
     * @Route("/post/complex", name="app_ajax_post_complex")
     * @Method("POST")
     */
    public function postComplexAction(Request $request)
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }   
        $em = $this->getDoctrine()->getManager();
        $logger = $this->get('logger');
        $requestContent = $request->getContent();
        $pushedData = json_decode($requestContent);
        
        $entityData = $pushedData->data->entityData;
        $refData = $pushedData->data->refData;                 $logger->error('SASSSSSSS:: refData ->' . print_r($refData, true));
        $linkFields = $pushedData->data->linkFields;           $logger->error('SASSSSSSS:: linkFields ->' . print_r($linkFields, true));
        $cmplxFields = $pushedData->data->cmplxFields;        // $logger->error('SASSSSSSS:: refData ->' . print_r($refData, true));

        $entityName = $pushedData->entity;
        $entityClassPrefix = "AppBundle\\Entity\\";
        $entityClass = $entityClassPrefix . $entityName;        $logger->info('SASSSSSSS:: entityName ->' . print_r($entityName, true));
        
        $returnRefs = [];
        $returnData = [];

        foreach ($entityData as $rcrdId => $rcrd) {   
            $entity = new $entityClass;

            foreach ($rcrd as $field => $val) {
                if ($val === null) { continue; }

                $setField = "set" . ucfirst($field);            $logger->info('SASSSSSSS:: setField ->' . print_r($setField, true));

                $setRefField = function($field, $val) use ($entity, $refData, $setField, $em, $logger) {
                    $refId = $refData->$field->$val;  //    $logger->error('SASSSSSSS:: subRefId ->' . print_r($refId, true));
                    $relatedEntity = $em->getRepository("AppBundle\\Entity\\" . $field)->find($refId);
                    $entity->$setField($relatedEntity);
                };

                if (!empty($linkFields) && in_array($field, $linkFields)) {      //$logger->error('SASSSSSSS:: val ->' . print_r($val, true));
                    if (is_array($val)) {
                        foreach ($val as $subVal) {
                            $setRefField($field, $subVal);                           
                        }
                    } else {
                        $setRefField($field, $val);              
                    }
                } elseif (property_exists($cmplxFields, $field)) {
                    $relEntity = $em->getRepository('AppBundle:' . $cmplxFields->$field)
                        ->findOneBy(array('id' => $val));  $logger->error('SASSSSSSS:: relEntity desc->' . print_r($relEntity->getDescription(), true));
                    $entity->$setField($relEntity);     
                } else {
                    $entity->$setField($val);            //  $logger->info('SASSSSSSS:: val ->' . print_r($val, true));   
                }
            }
            $em->persist($entity);  //$logger->info('SASSSSSSS:: parent id ??->' . print_r($entity->getParentLoc()->getId(), true));    $logger->info('SASSSSSSS:: parent id ??->' . print_r($entity->getParentLoc()->getId(), true));   
            $em->flush();
        
                $logger->error('SASSSSSSS:: parentLocId ->' . print_r($entity->getParentLoc()->getId(), true));

            $returnData[$rcrdId] = $entity->getId();
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

}