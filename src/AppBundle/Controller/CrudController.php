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
 * @Route("/crud")
 */
class CrudController extends Controller
{
/*------------------------------ CREATE --------------------------------------*/
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
        $coreEntity = new $coreClass();
        $coreFormData = $formData->$coreName;

        $returnData = new \stdClass; 
        $returnData->core = $coreName;
        $returnData->coreEntity = $coreEntity;
        $returnData->coreEdits = $this->getEditsObj(false); 
        $returnData->detailEdits = $this->getEditsObj(false); 

        $this->setEntityData($coreFormData, $coreEntity, $returnData->coreEdits, $em);

        $returnData->detailEntity = $this->handleDetailEntity(
            $coreFormData, $formData, $returnData, $em
        );
        return $this->attemptFlushAndSendResponse($returnData, $em);
    }
/*------------------------------ Edit ----------------------------------------*/
    /**
     * Updates an Entity, and any detail-entities, with the submitted form data. 
     *
     * @Route("/entity/edit", name="app_entity_edit")
     */
    public function entityEditAction(Request $request)
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }                                                                       //print("\nCreating Source.\n");
        $em = $this->getDoctrine()->getManager();
        $requestContent = $request->getContent();
        $formData = json_decode($requestContent);                               //print("\nForm data =");print_r($formData);
        
        $coreName = $formData->coreEntity;                                      //print("coreName = ". $coreName);
        $coreFormData = $formData->$coreName;
        $coreEntity = $em->getRepository('AppBundle:'.ucfirst($coreName))
            ->findOneBy(['id' => $formData->intId ]);
        
        $returnData = new \stdClass; 
        $returnData->core = $coreName;
        $returnData->coreEntity = $coreEntity;
        $returnData->coreEdits = $this->getEditsObj(true); 
        $returnData->detailEdits = $this->getEditsObj(true);

        $this->setEntityData($coreFormData, $coreEntity, $returnData->coreEdits, $em);

        $returnData->detailEntity = $this->handleDetailEntity(
            $coreFormData, $formData, $returnData, $em
        );
        return $this->attemptFlushAndSendResponse($returnData, $em);
    }
/*------------------------------ Helpers -------------------------------------*/
    /** Builds and returns an object that will track any edits made to the entity. */
    private function getEditsObj($editing)
    {
        $edits = new \stdClass;
        $edits->editing = $editing;
        return $edits;
    }
    /*---------- Detail Entity ------------------------------------------*/
    /** If the core-entity is 'Source', process any detail-entity data. */
    private function handleDetailEntity($cFormData, $dFormData, &$returnData, $em)
    {
        if (!property_exists($cFormData->rel, "sourceType")) { return false; }
        return $this->setDetailEntityData($cFormData, $dFormData, $returnData, $em);  
    }
    /**
     * Sets all detail-entity data and returns the entity. 
     * Note: Publishers are the only 'sourceType' with no detail-entity.
     */
    private function setDetailEntityData($cFormData, $dFormData, &$returnData, &$em)
    {
        $dName = $cFormData->rel->sourceType;
        $returnData->detail = $dName;
        if (!$cFormData->hasDetail) { return false; }
        $dData = $dFormData->$dName;
        
        return $this->setDetailData( $dData, $dName, $returnData, $em );
    }
    private function setDetailData($dData, $dName, &$returnData, &$em)
    {
        $dClass = 'AppBundle\\Entity\\'. ucfirst($dName);
        $dEntity = new $dClass();
        $dEntity->setSource($returnData->coreEntity);
        $this->addDetailToCoreEntity($returnData->coreEntity, $dEntity, $dName, $em);
        $this->setEntityData($dData, $dEntity, $returnData->detailEdits, $em);  

        return $dEntity;
    }
    /** Adds the detail entity to the core entity. Eg, A Publication to it's Source record. */
    private function addDetailToCoreEntity(&$coreEntity, &$dEntity, $dName, &$em)
    {
        $setMethod = 'set'. ucfirst($dName);
        $coreEntity->$setMethod($dEntity);
        $em->persist($coreEntity);
    }
    /*---------- Set Entity Data ---------------------------------------------*/
    /**
     * Calls the set method for both types of entity data, flat and relational, 
     * and persists the entity.
     */
    private function setEntityData($formData, &$entity, &$edits, &$em)
    {
        $this->setFlatData($formData->flat, $entity, $edits, $em);
        $this->setRelatedEntityData($formData->rel, $entity, $edits, $em);
        $em->persist($entity);
    }
    /** Sets all scalar data. */ 
    private function setFlatData($formData, &$entity, &$edits, &$em)
    {
        foreach ($formData as $field => $val) {
            $this->setFlatDataAndTrackEdits($entity, $field, $val, $edits);  
        }
    }
    /** Sets all realtional data. */
    private function setRelatedEntityData($formData, &$entity, &$edits, &$em)
    {
        $edgeCases = [
            "contributor" => function($ary) use ($entity, &$edits, &$em) { 
                $this->handleContributors($ary, $entity, $edits, $em); },
            "tags" => function($ary) use ($entity, &$edits, &$em) { 
                $this->handleTags($ary, $entity, $edits, $em); },
            "source" => function($id) use ($entity, &$edits, &$em) {
                $this->addInteractionToSource($id, $entity, $edits, $em);
            }
        ];
        foreach ($formData as $rEntityName => $val) {  
            if (array_key_exists($rEntityName, $edgeCases)) {
                call_user_func($edgeCases[$rEntityName], $val);
            } else {
                $relEntity = $this->getEntity($rEntityName, $val, $em);
                $this->setRelDataAndTrackEdits($entity, $rEntityName, $relEntity, $edits);
            }
        }
    }
    /** Returns the entity. */
    private function getEntity($relField, $val, $em)
    {
        $relClass = $this->getEntityClass($relField);
        $prop = is_numeric($val) ? 'id'  : 'displayName';                       
        return $this->returnEntity($relClass, $prop, $val, $em);
    }
    /** Handles field name to class name translations. */
    private function getEntityClass($relField)
    {
        $classMap = [ "parentSource" => "Source", "parentLoc" => "Location", 
            "parentTaxon" => "Taxon", "subject" => "Taxon", "object" => "Taxon" ];
        return array_key_exists($relField, $classMap) ? 
            $classMap[$relField] : ucfirst($relField);
    }
    private function returnEntity($class, $prop, $val, $em)
    {
        return $em->getRepository("AppBundle:".$class)
            ->findOneBy([$prop => $val]);
    }
    private function handleContributors($ary, &$entity, &$edits, &$em)
    {
        $cur = $entity->getContributors(); //Get Contrib ids
        // $this->removeFromCollection('Contributor', $cur, $ary, $entity, $edits, $em);
        $this->addContributors($ary, $cur, $entity, $em);
    }
    /** Creates a new Contribution for each author source in the array. */
    private function addContributors($ary, $curContribs, &$srcEntity, &$em)
    {
        // $added = [];
        foreach ($ary as $contributorId) {
            $authSrc = $em->getRepository("AppBundle:Source")
                ->findOneBy(['id' => $contributorId]);
            // if (in_array($authSrc, $curContribs)) { continue; }
            $contribEntity = new Contribution();
            $contribEntity->setWorkSource($srcEntity);
            $contribEntity->setAuthorSource($authSrc);
            $em->persist($contribEntity);
            // array_push($added, $contributorId);
            $srcEntity->addContributor($contribEntity);  //$srcEntity persisted later
            $authSrc->addContribution($contribEntity);
            $em->persist($authSrc);
        }  
        // $edits->Contributor = [ 'added' => $added ];  //TODO 
    }
    /** Handles adding and removing tags from the entity. */  
    private function handleTags($ary, &$entity, &$edits, &$em)
    {
        $curTags = $entity->getTagIds();
        $this->removeFromCollection('tag', $curTags, $ary, $entity, $edits, $em);
        $this->addToCollection('tag', $curTags, $ary, $entity, $edits, $em);
    }
    /** Removes any entities currently in the $coll that are not in the new $ary.  */
    private function removeFromCollection($field, $coll, $ary, &$entity, &$edits, $em)
    {
        $removed = [];  
        $removeField = 'remove'.ucfirst($field);
        foreach ($coll as $id) { 
            if (in_array($id, $ary)) { continue; }
            array_push($removed, $id); 
            $collEnt = $this->getEntity($field, $id, $em);
            $entity->$removeField($collEnt);
        }
        if (count($removed)) { $edits->$field = [ 'removed' => $removed ]; }
    }
    /** Adds each new entity in ary to the collection.  */
    private function addToCollection($field, $coll, $ary, &$entity, &$edits, $em)
    {
        $added = []; 
        $addField = 'add'.ucfirst($field);  
        foreach ($ary as $id) { 
            if (in_array($id, $coll)) { continue; }
            array_push($added, intval($id));  
            $collEnt = $this->getEntity($field, $id, $em);
            $entity->$addField($collEnt);
        }
        if ($edits->editing && count($added)) {
            $edits->$field = property_exists($edits, $field) ? 
                array_merge($edits->$field, ['added' => $added]) : ['added' => $added]; 
        }
    }
    /** If adding an interaction to a source, ensures it's 'isDirect' flag to true. */
    private function addInteractionToSource($id, $entity, &$edits, &$em)
    {
        $relEntity = $this->getEntity("Source", $id, $em);
        $this->setRelDataAndTrackEdits($entity, "Source", $relEntity, $edits);
        $className = $em->getClassMetadata(get_class($entity))->getName(); 
        if ($className === "AppBundle\Entity\Interaction" && !$relEntity->getIsDirect()) {
            $relEntity->setIsDirect(true);
            $em->persist($relEntity);
        }
    }
    /**
     * Checks whether current value is equal to the passed value. If not, the 
     * entity is updated with the new value and the field is added to the edits obj.   
     */
    private function setFlatDataAndTrackEdits(&$entity, $field, $newVal, &$edits) 
    {
        $setField = 'set'. ucfirst($field);                                     
        $getField = 'get'. ucfirst($field);                                     
        
        $curVal = $entity->$getField();
        if ($curVal === $newVal) { return; }

        if ($edits->editing) { $edits->$field = $curVal; }
        $entity->$setField($newVal);
    }
    /**
     * Checks whether current value is equal to the passed value. If not, the 
     * entity is updated with the new value and the field is added to the edits obj.   
     */
    private function setRelDataAndTrackEdits(&$entity, $field, $newVal, &$edits) 
    {
        $setField = 'set'. ucfirst($field);                                     
        $getField = 'get'. ucfirst($field);                                     
        
        $curVal = $entity->$getField() ? $entity->$getField()->getId() : null;
        if ($newVal === null) { 
            if ($curVal === null) { return; }
        } else if ($curVal === $newVal->getId()) { return; }

        if ($edits->editing) { $edits->$field = $curVal; }
        $entity->$setField($newVal);
    }
    /*---------- Flush and Return Data ---------------------------------------*/
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