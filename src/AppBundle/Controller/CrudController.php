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
use AppBundle\Entity\Interaction;
use AppBundle\Entity\Location;
use AppBundle\Entity\Taxon;


/**
 * Crud-form controller.
 *
 * @Route("/admin/crud")
 */
class CrudController extends Controller
{
    /**
     * Creates a new Entity, and any new detail-entities, from the form data. 
     *
     * @Route("/entity/create", name="app_entity_create")
     */
    public function entityCreateAction(Request $request)
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }                                                                       //print("\nCreating Source.\n");
        $em = $this->getDoctrine()->getManager();
        $requestContent = $request->getContent();
        $formData = json_decode($requestContent);                               //print("\nForm data =");print_r($formData);
        
        $coreName = $formData->coreEntity;                                      //print("coreName = ". $coreName);
        $coreClass = 'AppBundle\\Entity\\'. ucfirst($coreName);                 //print("\ncoreClass = ". $coreClass);
        $coreFormData = $formData->$coreName;
        $returnData = new \stdClass; 

        $coreEntity = new $coreClass();
        $this->setEntityData(ucfirst($coreName), $coreFormData, $coreEntity, $em);
        $returnData->core = $coreName;
        $returnData->coreEntity = $coreEntity;

        $returnData->detailEntity = $this->handleDetailEntity(
            $coreFormData, $formData, $returnData, $em
        );
        return $this->attemptFlushAndSendResponse($returnData, $em);
    }
    /** If the core-entity is 'Source', process any detail-entity data. */
    private function handleDetailEntity($coreFormData, $formData, &$returnData, $em)
    {
        if (property_exists($coreFormData->rel, "sourceType")) { 
            return $this->setDetailEntityData(
                $coreFormData, $formData, $returnData, $em
            );  
        }
        return false;
    }
    /**
     * Sets all detail-entity data and returns the entity. 
     * Note: Publishers are the only 'sourceType' with no detail-entity.
     */
    private function setDetailEntityData($cFormData, $formData, &$returnData, &$em)
    {
        $detailName = $cFormData->rel->sourceType;
        $returnData->detail = $detailName;
        if (!$cFormData->hasDetail) { return false; }
        $detailData = $formData->$detailName;
        return $this->setDetailData(
            $detailData, $detailName, $returnData, $em
        );
    }
    private function setDetailData($detailData, $detailName, &$returnData, &$em)
    {
        $detailEntClass = 'AppBundle\\Entity\\'. ucfirst($detailName);
        $detailEntity = new $detailEntClass();
        $detailEntity->setSource($returnData->coreEntity);
        $this->addDetailToCoreEntity($returnData->coreEntity, $detailEntity, $detailName, $em);
        $this->setEntityData($detailName, $detailData, $detailEntity, $em);  

        return $detailEntity;
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
    private function getRelatedEntity($relField, $val, $em)
    {
        $relClass = $this->getRelatedEntityClass($relField);
        $prop = is_numeric($val) ? 'id'  : 'displayName';                       
        return $this->returnRelatedEntity($relClass, $prop, $val, $em);
    }
    private function getRelatedEntityClass($relField)
    {
        $classMap = [ "parentSource" => "Source", "parentLoc" => "Location", 
            "parentTaxon" => "Taxon", "subject" => "Taxon", "object" => "Taxon" ];
        return array_key_exists($relField, $classMap) ? 
            $classMap[$relField] : ucfirst($relField);
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
    private function addTags($ary, &$entity, &$em)
    {
        foreach ($ary as $tag) {
            $tagEnt = $em->getRepository("AppBundle:Tag")
                ->findOneBy(['id' => $tag]);
            $entity->addTag($tagEnt);
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
        $entityData->coreEntity = $serializer->serialize($entityData->coreEntity, 'json');
        $entityData->detailEntity = $entityData->detailEntity ? 
            $serializer->serialize($entityData->detailEntity, 'json') : false;

        $response = new JsonResponse();
        $response->setData(array(
            'results' => $entityData
        ));
        return $response;
    }
}