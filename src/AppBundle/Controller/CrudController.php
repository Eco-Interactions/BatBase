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
 * Crud-form controller.
 *
 * @Route("/admin/crud")
 */
class CrudController extends Controller
{
    /**
     * Creates a new Source, and any new detail-entities, from the form data. 
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
        $entityData = new \stdClass; 

        $srcEntity = new Source();
        $this->setEntityData("Source", $srcData, $srcEntity, $em);
        $entityData->main = "source";
        $entityData->mainEntity = $srcEntity;

        $entityData->detailEntity = $this->setDetailEntityData(
            $srcData, $formData, $entityData, $em
        );

        return $this->attemptFlushAndSendResponse($entityData, $em);
    }
    /** Sets all detail-entity data and adds entity to entityData object. */
    private function setDetailEntityData($srcData, $formData, &$entityData, $em)
    {
        $detailName = $srcData->rel->sourceType;
        if (!$srcData->hasDetail) { return $this->noDetailEntity($detailName, $entityData); }
        $detailData = $formData->$detailName;
        $detailEntClass = 'AppBundle\\Entity\\'. ucfirst($detailName);
        $detailEntity = new $detailEntClass();
        $detailEntity->setSource($entityData->mainEntity);
        $this->addDetailToCoreEntity($entityData->mainEntity, $detailEntity, $detailName, $em);
        $this->setEntityData($detailName, $detailData, $detailEntity, $em);  

        $entityData->detail = $detailName;
        return $detailEntity;
    }
    private function noDetailEntity($detailName, &$entityData)
    {
        $entityData->detail = $detailName;
        return false;
    }
    private function addDetailToCoreEntity(&$coreEntity, &$detailEntity, $detailName, &$em)
    {
        $setMethod = 'set'. ucfirst($detailName);
        $coreEntity->$setMethod($detailEntity);
        $em->persist($coreEntity);
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
    /** Sets all realtional data. */
    private function setRelatedEntityData($formData, &$entity, &$em)
    {
        $edgeCases = [
            "contributor" => function($ary) use ($entity, &$em) { 
                $this->addContributors($ary, $entity, $em); },
            "tags" => function($ary) use ($entity, &$em) { 
                $this->addTags($ary, $entity, $em); },
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
    /** Returns the related-entity object after deriving the class and prop to use. */
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

            $srcEntity->addContributor($contribEntity);  //$srcEntity persisted later
            $authSrc->addContribution($contribEntity);
            $em->persist($authSrc);
        }  
    }
    /** Creates a new Contribution for each author source in the array. */
    private function addTags($ary, &$srcEntity, &$em)
    {
        foreach ($ary as $tag) {
            $tagEnt = $em->getRepository("AppBundle:Tag")
                ->findOneBy(['id' => $tag]);
            $srcEntity->addTag($tagEnt);
        }  
    }
    /**
     * Attempts to flush all persisted data. If there are no errors, the created/updated 
     * data is sent back to the crud form; otherise, an error message is sent back.
     */
    private function attemptFlushAndSendResponse($entityData, &$em)
    {        
        try {
            $em->flush();
        } catch (\Doctrine\DBAL\DBALException $e) {                             
            return $this->sendErrorResponse($e, "DBALException");
        } catch (\Exception $e) {
            return $this->sendErrorResponse($e, "\Exception");
        }
        return $this->sendDataAndResponse($entityData);
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
    /** Sends an object with the entities' serialized data back to the crud form. */
    private function sendDataAndResponse($entityData)
    {
        $serializer = $this->container->get('jms_serializer');
        $entityData->mainEntity = $serializer->serialize($entityData->mainEntity, 'json');
        $entityData->detailEntity = $entityData->detailEntity ? 
            $serializer->serialize($entityData->detailEntity, 'json') : false;

        $response = new JsonResponse();
        $response->setData(array(
            'results' => $entityData
        ));
        return $response;
    }
}