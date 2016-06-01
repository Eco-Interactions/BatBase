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

        $requestContent = $request->getContent();
        $pushedData = json_decode($requestContent);
        $entityName = "AppBundle\\Entity\\" . $pushedData->entity;
        $entityData = $pushedData->data;
        $refData = [];
        $returnData = [];

        foreach ($entityData as $rcrd) {   var_dump($rcrd);     	
        	$entity = new $entityName;

    		foreach ($rcrd as $field => $val) {
        		$setField = "set" . ucfirst($field);
        		if ($field === "tempId") { continue; }
        		$entity->$setField = $val;
    		}
        	$refData[$rcrd->tempId] = $entity;

            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
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