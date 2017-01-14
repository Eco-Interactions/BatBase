<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

use AppBundle\Entity\Source;
use AppBundle\Entity\Contribution;


/**
 * Search Page controller.
 *
 * @Route("/admin/crud")
 */
class CrudController extends Controller
{
    /**
     * Creates a new Source, and any new detail-entities, according to 
     * the submitted form data object. 
     *
     * @Route("/source/create", name="app_crud_source_create")
     */
    public function sourceCreateAction(Request $request)
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }                                                                       //print("\nCreating Source.\n");
        $em = $this->getDoctrine()->getManager();
        $requestContent = $request->getContent();
        $formData = json_decode($requestContent);                               //print("\nForm data =");print_r($formData);
        $srcData = $formData->source;
        $detailEntity = false;

        if ($srcData->hasDetail) {                                              //print("\nHas Detail.\n");
            $detailEntName = $srcData->rel->sourceType;
            $detailData = $formData->$detailEntName;
            $detailEntClass = 'AppBundle\\Entity\\'. ucfirst($detailEntName);
            $detailEntity = new $detailEntClass();
            $this->setEntityData($detailEntName, $detailData, $detailEntity, $em);  
        }
        $srcEntity = new Source();
        $this->setEntityData("Source", $srcData, $srcEntity, $em);

        if ($srcData->hasDetail) { $detailEntity->setSource($srcEntity); } 
        
        return $this->attemptFlushAndSendResponse($srcEntity, $detailEntity, $em);
    }
    /**
     * Calls the set method for both types of entity data, flat and relational, 
     * and persists the entity.
     */
    private function setEntityData($entName, $formData, &$entity, &$em)
    {
        $this->setFlatData($formData->flat, $entity, $em);
        $this->setRelatedEntityData($formData->rel, $entity, $em);
        $em->persist($entity);
    }
    /** Sets all scalar data. */ 
    private function setFlatData($formData, &$entity, &$em)
    {
        foreach ($formData as $field => $val) {
            $setField = 'set'. ucfirst($field);                                 //print("\nsetFlatField = ".$setField."\n");
            $entity->$setField($val);
        }
    }
    /** Sets all realtional-data. */
    private function setRelatedEntityData($formData, &$entity, &$em)
    {
        $edgeCases = [
            "contributor" => function($ary) use ($entity, &$em) { 
                $this->addContributors($ary, $entity, $em); },
        ];
        foreach ($formData as $rEntityName => $val) {  
            $setField = 'set'. ucfirst($rEntityName);                           
            if (array_key_exists($rEntityName, $edgeCases)) {
                call_user_func($edgeCases[$rEntityName], $val);
            } else {
                $relEntity = $this->getRelatedEntity($rEntityName, $val, $em);
                $entity->$setField($relEntity);
            }
        }
    }
    /** Returns the related entity object after deriving the class and prop to use. */
    private function getRelatedEntity($rEntityName, $val, $em)
    {
        $relClass = $rEntityName === 'parentSource' ? 'Source' : ucfirst($rEntityName);
        $prop = is_numeric($val) ? 'id'  : 'displayName';                       
        return $this->returnRelatedEntity($relClass, $prop, $val, $em);
    }
    private function returnRelatedEntity($class, $prop, $val, $em)
    {
        return $em->getRepository("AppBundle:".$class)
            ->findOneBy([$prop => $val]);
    }
    /** Creates a new Contribution for each author source in the array. */
    private function addContributors($ary, &$srcEntity, &$em)
    {
        foreach ($ary as $contributorId) {
            $authSrc = $em->getRepository("AppBundle:Source")
                ->findOneBy(['id' => $contributorId]);
            $contribEntity = new Contribution();
            $contribEntity->setWorkSource($srcEntity);
            $contribEntity->setAuthorSource($authSrc);
            $em->persist($contribEntity);
        }  
    }
    /**
     * Attempts to flush all persisted data. If there are no errors, the created/updated 
     * data is sent back to the crud form; otherise, an error message is sent back.
     */
    private function attemptFlushAndSendResponse($entity, $subEntity, &$em)
    {        
        try {
            $em->flush();
        } catch (\Doctrine\DBAL\DBALException $e) {                             
            return $this->sendErrorResponse($e, "DBALException");
        } catch (\Exception $e) {
            return $this->sendErrorResponse($e, "\Exception");
        }
        return $this->sendDataAndResponse($em, $entity, $subEntity);
    }
    /**
     * Sends an object with all created/updated data back to the crud form. 
     */
    private function sendDataAndResponse($em, $entity, $subEntity)
    {
        $response = new JsonResponse();
        $response->setData(array(
            'YouRock' => 'SuperDuper'
        ));
        return $response;
    }
    /** Logs the error message and returns an error response message. */
    private function sendErrorResponse($e, $tag)
    {   
        $this->get('logger')->error($e->getMessage());
        $response = new JsonResponse();
        $response->setStatusCode(500);
        $response->setData(array(
            $tag => $e->getMessage()
        ));
        return $response;
    }
}