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
        // ini_set("display_errors", "1");

        $em = $this->getDoctrine()->getManager();
        $logger = $this->get('logger');
        $requestContent = $request->getContent();
        $pushedData = json_decode($requestContent);
        
        $entityData = $pushedData->data->entityData;
        $refData = $pushedData->data->refData;          $logger->error('SASSSSSSS:: refData ->' . print_r($refData, true));
        $linkFields = $pushedData->data->linkFields;       $logger->error('SASSSSSSS:: linkFields ->' . print_r($linkFields, true));

        $entityName = $pushedData->entity;
        $entityClassPrefix = "AppBundle\\Entity\\";
        $entityClass = $entityClassPrefix . $entityName;
        $returnRefs = [];
        $returnData = [];

        foreach ($entityData as $rcrdId => $rcrd) {    
            $entity = new $entityClass;
            
            foreach ($rcrd as $field => $val) {       // $logger->info('SASSSSSSS:: field ->' . print_r($field, true));
                if ($field === "tempId") { continue; }
                
                $setField = "set" . ucfirst($field); //  $logger->info('SASSSSSSS:: setField ->' . print_r($setField, true));
      
                if (!empty($linkFields) && in_array($field, $linkFields)) {      $logger->error('SASSSSSSS:: val ->' . print_r($val, true));
                    if ($val === null) { continue; }

                    $refId = $refData->$field->$val;     // $logger->error('SASSSSSSS:: refId ->' . print_r($refId, true));
                    $repo = 'AppBundle:' . $entityName;
                    $relatedEntity = $em->getRepository($entityClassPrefix . $field)->find($refId);
                    $entity->$setField($relatedEntity);
                    continue;
                }
                
                $entity->$setField($val);            //  $logger->info('SASSSSSSS:: val ->' . print_r($val, true));
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
        // ini_set("display_errors", "1");

        $em = $this->getDoctrine()->getManager();
        $logger = $this->get('logger');
        $requestContent = $request->getContent();
        $pushedData = json_decode($requestContent);
        
        $entityData = $pushedData->data->entityData;     //$logger->error('SASSSSSSS:: taxon entityData ->' . print_r($entityData, true));
        $levelRefs = $pushedData->data->refData->level;    //      $logger->error('SASSSSSSS:: levelRefs ->' . print_r($levelRefs, true));

        $entityClass = "AppBundle\\Entity\\Taxon";
        $returnData = [];
        $taxaRefs = [];

        foreach ($entityData as $rcrdId => $rcrd) {    
            $entity = new $entityClass;

            $entity->setDisplayName($rcrd->displayName);

            $lvlRef = $rcrd->level;
            $lvlId = $levelRefs->$lvlRef;      $logger->error('SASSSSSSS:: taxaRefs ->' . print_r($taxaRefs, true));
            $lvlEntity = $em->getRepository("AppBundle\\Entity\\Level")->find($lvlId);
            $entity->setLevel($lvlEntity);

            if ($rcrd->parentTaxon !== null) {
                $prntRef = $rcrd->parentTaxon;      $logger->error('SASSSSSSS:: prntRef ->' . print_r($prntRef, true));
                $prntId = $taxaRefs[$prntRef];      $logger->error('SASSSSSSS:: prntId ->' . print_r($prntId, true));
                $prntEntity = $em->getRepository("AppBundle\\Entity\\Taxon")->find($prntId);
                $entity->setParentTaxon($prntEntity);
            }

            $em->persist($entity);
            $em->flush();

            $taxaRefs[$rcrdId] = $entity->getId();
        }

        $response = new JsonResponse();
        $response->setData(array(
            "Taxon" => $taxaRefs,
        ));

        return $response;
    }
}