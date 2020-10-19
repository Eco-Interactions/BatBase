<?php

namespace App\Controller;

use App\Entity\Contribution;
use App\Entity\Interaction;
use App\Entity\Location;
use App\Entity\Source;
use App\Entity\Taxon;
use JMS\Serializer\SerializationContext;
use JMS\Serializer\SerializerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;

/**
 * Date-entry/edit form controller.
 *
 * @Route("/crud", name="app_")
 */
class DataEntryController extends AbstractController
{
    private $serializer;
    private $logger;
    private $em;

    public function __construct(SerializerInterface $serializer, LoggerInterface $logger)
    {
        $this->serializer = $serializer;
        $this->logger = $logger;
    }

    private function buildReturnDataObj($coreName, $coreEntity, $formData)
    {
        $data = new \stdClass;
        $data->core = $coreName;
        $data->coreId = $coreEntity->getId();  //Created entities have ids added before returning
        $data->coreEntity = $coreEntity;
        $data->coreEdits = $this->getEditsObj($formData, 'core');
        $data->detailEdits = $this->getEditsObj($formData, 'detail');
        return $data;
    }
    private function returnEntity($class, $val, $prop = 'id')
    {
        return $this->em->getRepository("App:".$class)
            ->findOneBy([$prop => $val]);
    }
/*------------------------------ CREATE --------------------------------------*/
    /**
     * Creates a new Entity, and any new detail-entities, from the form data.
     *
     * @Route("/entity/create", name="entity_create")
     */
    public function entityCreateAction(Request $request)
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }                                                                       //print("\nCreating Source.\n");
        $this->em = $this->getDoctrine()->getManager();
        $requestContent = $request->getContent();
        $formData = json_decode($requestContent);                               //print("\nForm data =");print_r($formData);

        $coreName = $formData->coreEntity;                                      //print("coreName = ". $coreName);
        $coreClass = 'App\\Entity\\'. ucfirst($coreName);                       //print("\ncoreClass = ". $coreClass);
        $coreEntity = new $coreClass();
        $coreFormData = $formData->$coreName;

        $returnData = $this->buildReturnDataObj($coreName, $coreEntity, $formData);

        $this->setEntityData($coreFormData, $coreEntity, $returnData->coreEdits);

        if ($coreName !== 'interaction') {
            $returnData->name = $coreEntity->getDisplayName();
        }

        if (property_exists($coreFormData, 'hasDetail')) {
            $returnData->detailEntity = $this->handleDetailEntity(
                $coreFormData, $formData, $returnData
            );
        }
        $this->removeEditingFlag($returnData->coreEdits, $returnData->detailEdits);
        return $this->attemptFlushAndSendResponse($returnData);
    }
/*------------------------------ Edit ----------------------------------------*/
    /**
     * Updates an Entity, and any detail-entities, with the submitted form data.
     *
     * @Route("/entity/edit", name="entity_edit")
     */
    public function entityEditAction(Request $request)
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }                                                                       //print("\nCreating Source.\n");
        $this->em = $this->getDoctrine()->getManager();
        $requestContent = $request->getContent();
        $formData = json_decode($requestContent);                               //print("\nForm data =");print_r($formData);

        $coreName = $formData->coreEntity;                                      //print("coreName = ". $coreName);
        $coreFormData = $formData->$coreName;
        $coreEntity = $this->em->getRepository('App:'.ucfirst($coreName))
            ->findOneBy(['id' => $formData->ids->core ]);

        $returnData = $this->buildReturnDataObj($coreName, $coreEntity, $formData);

        $this->setEntityData($coreFormData, $coreEntity, $returnData->coreEdits);

        if ($coreName !== 'interaction') {
            $returnData->name = $coreEntity->getDisplayName();
        }

        if (property_exists($coreFormData, 'hasDetail')) {
            $returnData->detailEntity = $this->handleDetailEntity(
                $coreFormData, $formData, $returnData
            );
        }
        $this->checkForEditsToClientSideData($coreName, $returnData);

        $this->removeEditingFlag($returnData->coreEdits, $returnData->detailEdits);
        return $this->attemptFlushAndSendResponse($returnData);
    }

    private function checkForEditsToClientSideData($entityName, &$returnData)
    {
        $coreEdits = $returnData->coreEdits;
        $map = [
            'taxon' => function() use (&$coreEdits) {
                $this->checkForTaxonGroupEdit($coreEdits);
            }
        ];
        if (array_key_exists($entityName, $map)) {
            call_user_func($map[$entityName]);
        }
    }
    private function checkForTaxonGroupEdit(&$edits)
    {
        if (!property_exists($edits, 'parentTaxon')) { return; }
        $old = $this->getEntity('Taxon', $edits->parentTaxon['old']);
        $new = $this->getEntity('Taxon', $edits->parentTaxon['new']);
        if ($old->getSubGroup() === $new->getSubGroup()) { return; }
        $edits->subGroup = [ 'old' => $old->getSubGroup(), 'new' => $new->getSubGroup() ];
    }
    /*--------------------- Update Citation Text -----------------------------*/
    /**
     * Updates the Citation and Source entities with the updated citation text.
     *
     * @Route("/citation/edit", name="citation_edit")
     */
    public function citationTextupdate(Request $request)
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }
        $this->em = $this->getDoctrine()->getManager();
        $requestContent = $request->getContent();
        $data = json_decode($requestContent);

        $src =  $this->em->getRepository('App:Source')
            ->findOneBy(['id' => $data->srcId ]);
        $src->setDescription($data->text);
        $this->em->persist($src);

        $cit = $src->getCitation();
        $cit->setFullText($data->text);
        $this->em->persist($cit);

        $returnData = new \stdClass;
        $returnData->core = 'source';
        $returnData->coreId = $src->getId();
        $returnData->coreEntity = $src;
        $returnData->detail = 'citation';
        $returnData->detailEntity = $cit;

        return $this->attemptFlushAndSendResponse($returnData);
    }
/*------------------------------ Shared Helpers ------------------------------*/
    /**
     * Builds and returns an object that will track any edits made to the entity.
     * The editing prop holds the id of the entity being edited, or false if creating.
     */
    private function getEditsObj($formData, $type)
    {
        $edits = new \stdClass;
        $edits->editing = property_exists($formData, 'ids') ?
            $formData->ids->$type : false;
        return $edits;
    }
    private function removeEditingFlag($coreObj, $detailObj)
    {
        unset($coreObj->editing);
        unset($detailObj->editing);
    }
    /*---------- Detail Entity ------------------------------------------*/
    /** If the core-entity is 'Source', process any detail-entity data. */
    private function handleDetailEntity($cFormData, $formData, &$returnData)
    {
        return $this->setDetailEntityData($cFormData, $formData, $returnData);
    }
    /**
     * Sets all detail-entity data and returns the entity.
     * Note: Publishers are the only 'sourceType' with no detail-entity.
     */
    private function setDetailEntityData($cFormData, $formData, &$returnData)
    {
        $dName = property_exists($cFormData->rel, "sourceType") ?
            $cFormData->rel->sourceType : 'geoJson';                            //print('detail name = '.$dName);
        $returnData->detail = $dName;
        if (!property_exists($cFormData, "hasDetail")) { return false; }
        $dData = $formData->$dName;

        return $this->setDetailData( $dData, $dName, $returnData);
    }
    private function setDetailData($dData, $dName, &$returnData)
    {
        $dEntity = $this->getDetailEntity($dName, $returnData->detailEdits);
        if ($dName !== 'geoJson') {
            $this->setCoreEntity($returnData->core, $returnData->coreEntity, $dEntity);
        }
        $this->addDetailToCoreEntity($returnData->coreEntity, $dEntity, $dName);
        $this->setEntityData($dData, $dEntity, $returnData->detailEdits);
        return $dEntity;
    }
    private function setCoreEntity($coreName, &$coreEntity, &$dEntity)
    {
        $setCore = 'set'.ucfirst($coreName);
        $dEntity->$setCore($coreEntity);
    }
    /** Returns either a newly created entity or an existing entity to edit. */
    private function getDetailEntity($dName, $edits)
    {
        if (!!$edits->editing) {
            $curDetail = $this->getEntity(ucfirst($dName), $edits->editing);
            if ($curDetail) { return $curDetail; }
        }
        $dClass = 'App\\Entity\\'. ucfirst($dName);
        return new $dClass();
    }
    /** Adds the detail entity to the core entity. Eg, A Publication to it's Source record. */
    private function addDetailToCoreEntity(&$coreEntity, &$dEntity, $dName)
    {
        $setMethod = 'set'. ucfirst($dName);
        $coreEntity->$setMethod($dEntity);
        $this->em->persist($coreEntity);
    }
    /*---------- Set Entity Data ---------------------------------------------*/
    /**
     * Calls the set method for both types of entity data, flat and relational,
     * and persists the entity.
     */
    private function setEntityData($formData, &$entity, &$edits)
    {
        $this->setFlatData($formData->flat, $entity, $edits);
        $this->setRelatedEntityData($formData->rel, $entity, $edits);
        $this->em->persist($entity);
    }
    /** Sets all scalar data. */
    private function setFlatData($formData, &$entity, &$edits)
    {
        foreach ($formData as $field => $val) {
            $this->setFlatDataAndTrackEdits($entity, $field, $val, $edits);
        }
    }
    /** Sets all realtional data. */
    private function setRelatedEntityData($formData, &$entity, &$edits)
    {
        $edgeCases = [
            "contributor" => function($ary) use (&$entity, &$edits) {
                $this->handleContributors($ary, $entity, $edits); },
            "tags" => function($ary) use (&$entity, &$edits) {
                $this->handleTags($ary, $entity, $edits); },
            "source" => function($id) use (&$entity, &$edits) {
                $this->addInteractionToSource($id, $entity, $edits); }
        ];
        foreach ($formData as $rEntityName => $val) {
            if (array_key_exists($rEntityName, $edgeCases)) {
                call_user_func($edgeCases[$rEntityName], $val);
            } else {
                $relEntity = $this->getEntity($rEntityName, $val);
                $this->setRelDataAndTrackEdits($entity, $rEntityName, $relEntity, $edits);
            }
        }
    }
    /** Returns the entity. */
    private function getEntity($relField, $val)
    {
        $relClass = $this->getEntityClass($relField);
        $prop = is_numeric($val) ? 'id'  : 'displayName';
        return $this->returnEntity($relClass, $val, $prop);
    }
    /** Handles field name to class name translations. */
    private function getEntityClass($relField)
    {
        $classMap = [ "parentSource" => "Source", "parentLoc" => "Location",
            "parentTaxon" => "Taxon", "subject" => "Taxon", "object" => "Taxon" ];
        return array_key_exists($relField, $classMap) ?
            $classMap[$relField] : ucfirst($relField);
    }
    private function handleContributors($ary, &$entity, &$edits)
    {
        $this->removeContributors($ary, $entity, $edits);
        $this->addContributors($ary, $entity, $edits);
    }
    /** Creates a new Contribution for each author/editor source in the array. */
    private function addContributors($ary, &$pubSrc, &$edits)
    {
        $added = [];
        $cur = $pubSrc->getContributorData();
        foreach ($ary as $authId => $newData) {
            if (array_key_exists($authId, $cur) ) {
                $this->checkAuthStatus($cur[$authId], $newData);
                continue;
            }
            $this->addContrib($authId, $newData, $pubSrc);
        }
    }
    /** Updates any changes to the author/editor status and/or auth/ed ord(er). */
    private function checkAuthStatus($curData, $newData)
    {
        $contrib = $this->em->getRepository('App:Contribution')
            ->findOneBy(['id' => $curData['contribId'] ]);
        $this->updateEditorStatus($curData, $newData, $contrib);
        $this->updateOrder($curData, $newData, $contrib);
        $this->em->persist($contrib);
    }
    private function updateEditorStatus($curData, $newData, &$contrib)
    {
        $curIsEd = $curData['isEditor'];
        $newIsEd = $newData->isEditor;
        if ($curIsEd === $newIsEd) { return; }
        $contrib->setIsEditor($newIsEd);
    }
    /** Stores auth/ed order for the citation/publication source. */
    private function updateOrder($curData, $newData, &$contrib)
    {
        $curOrd = $curData['ord'];
        $newOrd = $newData->ord;
        if ($curOrd === $newOrd) { return; }
        $contrib->setOrd($newOrd);
    }
    private function addContrib($id, $data, &$pubSrc)
    {
        $authSrc = $this->em->getRepository('App:Source')
            ->findOneBy(['id' => $id ]);
        $contribEntity = $this->createContrib($pubSrc, $authSrc, $data);
        $pubSrc->addContributor($contribEntity);  //$pubSrc persisted later
        $authSrc->addContribution($contribEntity);
        $this->em->persist($authSrc);
    }
    private function createContrib($pubSrc, $authSrc, $data)
    {
        $entity = new Contribution();
        $entity->setWorkSource($pubSrc);
        $entity->setAuthorSource($authSrc);
        $entity->setIsEditor($data->isEditor);
        $entity->setOrd($data->ord);

        $this->em->persist($entity);
        return $entity;
    }
    /** Removes any of the current contributors that are not in the new $authObj. */
    private function removeContributors($authObj, &$entity, &$edits)
    {
        $contributors = $entity->getContributors();
        $removed = [];
        foreach ($contributors as $contrib) {
            $authId = $contrib->getAuthorSource()->getId();
            if (property_exists($authObj, $authId)) { continue; }
            $entity->removeContributor($contrib);
            array_push($removed, $authId);
        }
        $this->addContribEdits($edits, 'removed', $removed);
    }
    /** Add added/removed array to edits obj. */
    private function addContribEdits(&$edits, $action, $ary)
    {
        if (count($ary)) {
            if (!property_exists($edits, 'contributor')) { $edits->contributor = []; }
            $edits->contributor[$action] = $ary;
        }
    }
    /** Handles adding and removing tags from the entity. */
    private function handleTags($ary, &$entity, &$edits)
    {
        $curTags = $entity->getTagIds();
        $this->removeFromCollection('tag', $curTags, $ary, $entity, $edits);
        $this->addToCollection('tag', $curTags, $ary, $entity, $edits);
    }
    /** Removes any entities currently in the $coll(ection) that are not in $ary.  */
    private function removeFromCollection($field, $coll, $ary, &$entity, &$edits)
    {
        $removed = [];
        $removeField = 'remove'.ucfirst($field);
        foreach ($coll as $id) {
            if (in_array($id, $ary)) { continue; }
            $collEnt = $this->getEntity($field, $id);
            $entity->$removeField($collEnt);
            array_push($removed, $id);
        }
        if (count($removed)) { $edits->$field = [ 'removed' => $removed ]; }
    }
    /** Adds each new entity in ary to the collection.  */
    private function addToCollection($field, $coll, $ary, &$entity, &$edits)
    {
        $added = [];
        $addField = 'add'.ucfirst($field);
        foreach ($ary as $id) {
            if (in_array($id, $coll)) { continue; }
            array_push($added, intval($id));
            $collEnt = $this->getEntity($field, $id);
            $entity->$addField($collEnt);
        }
        if ($edits->editing && count($added)) {
            $edits->$field = property_exists($edits, $field) ?
                array_merge($edits->$field, ['added' => $added]) : ['added' => $added];
        }
    }
    /** If adding an interaction to a source, ensures it's 'isDirect' flag to true. */
    private function addInteractionToSource($id, $entity, &$edits)
    {
        $relEntity = $this->getEntity("Source", $id);
        $this->setRelDataAndTrackEdits($entity, "source", $relEntity, $edits);
        $className = $this->em->getClassMetadata(get_class($entity))->getName();
        if ($className === "App\Entity\Interaction" && !$relEntity->getIsDirect()) {
            $relEntity->setIsDirect(true);
            $this->em->persist($relEntity);
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

        if ($edits->editing) { $edits->$field = [ "old" => $curVal, "new" => $newVal]; }
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

        $oldVal = $entity->$getField() ? $entity->$getField()->getId() : null;
        $oldEntity = $entity->$getField();

        if ($newVal === null) {
            if ($oldVal === null) { return; }
        } else if ($oldVal === $newVal->getId()) { return; }

        if ($edits->editing) {
            $newValue = $newVal === null ? null : $newVal->getId();
            $edits->$field = [ "old" => $oldVal, "new" => $newValue ];
        }

        $entity->$setField($newVal);
        if ($oldEntity !== null) { $this->em->persist($oldEntity); }

    }
    /*---------- Flush and Return Data ---------------------------------------*/
    /**
     * Attempts to flush all persisted data. If there are no errors, the created/updated
     * data is sent back to the crud form; otherise, an error message is sent back.
     */
    private function attemptFlushAndSendResponse($entityData)
    {
        try {
            $this->em->flush();
        } catch (\DBALException $e) {
            return $this->sendErrorResponse($e);
        } catch (\Exception $e) {
            return $this->sendErrorResponse($e);
        }
        $this->setUpdatedAtTimes($entityData);
        return $this->sendDataAndResponse($entityData);
    }
    /** Logs the error message and returns an error response message. */
    private function sendErrorResponse($e)
    {
        if ($this->ifNotDuplicateEntityError($e)) {
            $this->logErr($e->getLine(), $e->getMessage(), $e->getTraceAsString());
        }
        $response = new JsonResponse();
        $response->setStatusCode(500);
        $response->setData($e->getMessage());
        return $response;
    }
    private function logErr($lineNum, $msg, $trace)
    {
        $this->logger->error("\n\n### Error @ [$line] = $msg\n$trace\n");
        if ($this->getParameter('env') === 'prod') { return; };
        print("\n\n### Error @ [$line] = $msg\n$trace\n");
    }
    private function ifNotDuplicateEntityError($e)
    {
        return !strpos($e->getMessage(), 'Duplicate entry') ||
            !strpos($e->getTraceAsString(), 'Duplicate entry');
    }
    /** Sends an object with the entities' serialized data back to the crud form. */
    private function sendDataAndResponse($entityData)
    {
        $serialize = ['core', 'detail'];

        foreach ($serialize as $p) {
            $prop = $p.'Entity';
            $id = $p.'Id';
            if (!property_exists($entityData, $prop)) { continue; }
            try {
                $entityData->$id = $entityData->$prop->getId();
                $entityData->$prop = $this->serializer->serialize(
                    $entityData->$prop, 'json',
                    SerializationContext::create()->setGroups(array('normalized')));
            } catch (\Throwable $e) {
                return $this->sendErrorResponse($e);
            } catch (\Exception $e) {
                return $this->sendErrorResponse($e);
            }
        }
        $response = new JsonResponse();
        $response->setData(array(
            'results' => $entityData
        ));
        return $response;
    }
    /** ----------------- Set Entity/System UpdatedAt ----------------------- */
    /**
     * Sets the updatedAt timestamp for modified entities. This will be used to
     * ensure local data stays updated with any changes.
     */
    private function setUpdatedAtTimes($entityData)
    {
        $this->setUpdatedAt($entityData->core);
        if (property_exists($entityData, 'detailEntity')) {
            $this->setUpdatedAt($entityData->detail);
        }
        $this->setUpdatedAt('System');
        $this->em->flush();
    }
    private function setUpdatedAt($name)
    {
        $entity = $this->em->getRepository('App:SystemDate')
            ->findOneBy(['description' => $name]);
        if (!$entity) { return; }
        $entity->setDateVal(new \DateTime('now', new \DateTimeZone('America/Los_Angeles')));
        $this->em->persist($entity);
    }
}