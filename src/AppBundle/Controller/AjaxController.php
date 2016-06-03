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
  
        $logger = $this->get('logger');
        $requestContent = $request->getContent();
        $pushedData = json_decode($requestContent);
        $entityData = $pushedData->data;
        $entityName = $pushedData->entity;
        // $entityName = "Author";
        $entityClass = "AppBundle\\Entity\\" . $entityName;
        $refData = [];
        $returnData = [];
        $em = $this->getDoctrine()->getManager();

        foreach ($entityData as $rcrds) {     

            foreach ($rcrds as $rcrdId => $rcrd) {         $logger->info('SASSSSSSS:: RCRD ->' . print_r($rcrd, true));
                $entity = new $entityClass;
                
                foreach ($rcrd as $field => $val) {     // $logger->info('SASSSSSSS:: field ->' . print_r($field, true));
                    if ($field === "tempId") { continue; }
                    $setField = "set" . ucfirst($field); //  $logger->info('SASSSSSSS:: setField ->' . print_r($setField, true));
                    $entity->$setField($val);            //  $logger->info('SASSSSSSS:: val ->' . print_r($val, true));
                }
                $refData[$rcrdId] = $entity;
                
                $em->persist($entity);
            }
        }

        $em->flush();

        foreach ($refData as $refId => $entity) {
            $returnData[$refId] = $entity->getId();
        }

        $response = new JsonResponse();
        $response->setData(array(
            $entityName => $returnData,
        ));

        return $response;
    }
}