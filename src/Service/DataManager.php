<?php

namespace App\Service;

use App\Entity\Contribution;
use App\Entity\Group;
use App\Entity\Interaction;
use App\Entity\Location;
use App\Entity\Source;
use App\Entity\Taxon;
use App\Service\LogError;
use App\Service\TrackEntityUpdate;
use Doctrine\ORM\EntityManagerInterface;
/**
 * public
 *     createEntity
 *     editEntity
 *     attemptFlushAndLogErrors
 *
 * TOC
 *     ACTIONS
 *         CREATE ENTITY
 *         EDIT ENTITY
 *     SET DATA AND TRACK EDITS
 *         DETAIL-ENTITY
 *         FLAT DATA
 *         RELATIONAL DATA
 *             SPECIALIZED
 *                 CONTRIBUTIONS
 *                 TAGS
 *                 INTERACTION SOURCE
 *             GENERAL
 *     FLUSH DATA
 *         TRACK ENTITY-UPDATE
 *     HELPERS
 *         GET ENTITY
 *         RETURN-DATA BUILDER
 */
class DataManager
{
    private $em;
    private $logger;
    private $tracker;

    public function __construct(EntityManagerInterface $em, LogError $logger,
        TrackEntityUpdate $tracker)
    {
        $this->em = $em;
        $this->logger = $logger;
        $this->tracker = $tracker;
    }

/* ============================ ACTIONS ===================================== */
    // Used from PHP code.
    public function new($coreName, $dataAry)
    {                                                                           //print("\n"); print_r($dataAry);
        $data = new \stdClass();
        $data->core = new \stdClass();
        $data->core->flat = new \stdClass();
        $data->core->rel = new \stdClass();

        $this->addToData($data->core->flat, $dataAry['flat']);

        if (array_key_exists('rel', $dataAry)) {
            $this->addToData($data->core->rel, $dataAry['rel']);
        }
        return $this->createEntity($coreName, $data);
    }
    private function addToData(&$obj, $ary)
    {
        foreach ($ary as $prop => $value) {
            $obj->$prop = $value;
        }
    }
/* ------------------------ CREATE ENTITY ----------------------------------- */
    /**
     * Create new entity from data-entry form.
     * @param  String  $coreName        Core-Entity class name.
     * @param  Array   $data            [ eName: [ // Core name, detail name (optional)
     *                                      flat: [ field => val ],
     *                                      rel: [ entity => id] ]]
     * @return String                  Success or Error message
     */
    public function createEntity($coreName, $data)
    {
        $coreClass = 'App\\Entity\\'. ucfirst($coreName);                       //print("\ncoreClass = ". $coreClass);

        $coreEntity = new $coreClass();
        $coreData = $data->core;

        $returnData = $this->buildReturnDataObj($coreName, $coreEntity, $data);

        $this->setEntityData($coreData, $coreEntity, $returnData->coreEdits);

        if (method_exists($coreEntity, 'getDisplayName')) {
            $returnData->name = $coreEntity->getDisplayName();
        }

        if (property_exists($data, 'detailEntity')) {
            $returnData->detailEntity = $this->handleDetailEntity(
                $coreData, $data, $returnData
            );
        }
        $this->removeEditingFlag($returnData->coreEdits, $returnData->detailEdits);
        $this->attemptFlushAndLogErrors($returnData);
        return $returnData;
    }
/* -------------------------- EDIT ENTITY ----------------------------------- */
    /**
     * Create new entity.
     * @param  String  $coreName        Core-Entity class name.
     * @param  Array   $data            [ eName: [ // Core name, detail name (optional)
     *                                      flat: [ field => val ],
     *                                      rel: [ entity => id] ]]
     * @return String                  Success or Error message
     */
    public function editEntity($coreName, $data)
    {
        $coreData = $data->core;
        $coreEntity = $this->em->getRepository('App:'.ucfirst($coreName))
            ->findOneBy(['id' => $data->ids->core ]);

        $returnData = $this->buildReturnDataObj($coreName, $coreEntity, $data);

        $this->setEntityData($coreData, $coreEntity, $returnData->coreEdits);

        if (method_exists($coreEntity, 'getDisplayName')) {
            $returnData->name = $coreEntity->getDisplayName();
        }

        if (property_exists($data, 'detailEntity')) {
            $returnData->detailEntity = $this->handleDetailEntity(
                $coreData, $data, $returnData
            );
        }
        $this->removeEditingFlag($returnData->coreEdits, $returnData->detailEdits);
        $this->attemptFlushAndLogErrors($returnData);
        return $returnData;
    }
/* ====================== SET DATA AND TRACK EDITS ========================== */
/* ----------------------- DETAIL-ENTITY ------------------------------------ */
    /** If the core-entity is 'Source', process any detail-entity data. */
    private function handleDetailEntity($cData, $data, &$returnData)
    {
        return $this->setDetailEntityData($cData, $data, $returnData);
    }
    /**
     * Sets all detail-entity data and returns the entity.
     * Note: Publishers are the only 'sourceType' with no detail-entity.
     */
    private function setDetailEntityData($cData, $data, &$returnData)
    {
        $dName = property_exists($cData->rel, "SourceType") ?
            lcfirst($cData->rel->SourceType) : 'geoJson';                       //print('detail name = '.$dName);
        $returnData->detail = $dName;
        if (!property_exists($data, 'detail')) { return false; }
        // if (!property_exists($cData, 'hasDetail')) { return false; }
        $dData = $data->detail;

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
    /**
     * Calls the set method for both types of entity data, flat and relational,
     * and persists the entity.
     */
    private function setEntityData($data, &$entity, &$edits)
    {
        $this->setFlatData($data->flat, $entity, $edits);
        $this->setRelatedEntityData($data->rel, $entity, $edits);
        $this->em->persist($entity);
    }
/* ============================ FLAT DATA =================================== */
    /** Sets all scalar data. */
    private function setFlatData($data, &$entity, &$edits)
    {
        foreach ($data as $field => $val) {
            $this->setFlatDataAndTrackEdits($entity, $field, $val, $edits);
        }
    }
    /**
     * Checks whether current value is equal to the passed value. If not, the
     * entity is updated with the new value and the field is added to the edits obj.
     */
    private function setFlatDataAndTrackEdits(&$entity, $field, $newVal, &$edits)
    {
        $setField = 'set'. $field;  //CamelCase
        $getField = 'get'. $field;

        $curVal = $entity->$getField();
        if ($curVal === $newVal) { return; }

        if ($edits->editing) { $edits->$field = [ "old" => $curVal, "new" => $newVal]; }
        $entity->$setField($newVal);
    }
/* ========================= RELATIONAL DATA ================================ */
    /** Sets all realtional data. */
    private function setRelatedEntityData($data, &$entity, &$edits)
    {
        $edgeCases = [
            "Contributor" => function($ary) use (&$entity, &$edits) {
                $this->handleContributors($ary, $entity, $edits); },
            "Tags" => function($ary) use (&$entity, &$edits) {
                $this->handleTags($ary, $entity, $edits); },
            "Source" => function($id) use (&$entity, &$edits) {
                $this->addInteractionToSource($id, $entity, $edits); }
        ];
        foreach ($data as $rEntityName => $val) {  //print("field [$rEntityName] type of [$val][".gettype($val)."]\n");
            if (array_key_exists($rEntityName, $edgeCases)) {
                call_user_func($edgeCases[$rEntityName], $val);
            } else {
                $relEntity = $this->getEntity($rEntityName, $val);
                $this->setRelDataAndTrackEdits($entity, $rEntityName, $relEntity, $edits);
            }
        }
    }
/* ---------------------- SPECIALIZED --------------------------------------- */
/* __________________________ CONTRIBUTIONS _________________________________ */
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
        foreach ($contributors as $contrib) { //print("line 327");
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
            if (!property_exists($edits, 'Contributor')) { $edits->contributor = []; }
            $edits->contributor[$action] = $ary;
        }
    }
/* ___________________________ TAGS _________________________________________ */
    /** Handles adding and removing tags from the entity. */
    private function handleTags($ary, &$entity, &$edits)
    {
        $curTags = $entity->getTagIds();
        $this->removeFromCollection('Tag', $curTags, $ary, $entity, $edits);
        $this->addToCollection('Tag', $curTags, $ary, $entity, $edits);
    }
    /** Removes any entities currently in the $coll(ection) that are not in $ary.  */
    private function removeFromCollection($field, $coll, $ary, &$entity, &$edits)
    {
        $removed = [];
        $removeField = 'remove'.$field;
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
        $addField = 'add'.$field;
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
/* _______________________ INTERACTION SOURCE _______________________________ */
    /** If adding an interaction to a source, ensures it's 'isDirect' flag to true. */
    private function addInteractionToSource($id, $entity, &$edits)
    {
        $relEntity = $this->getEntity("Source", $id);
        $this->setRelDataAndTrackEdits($entity, "Source", $relEntity, $edits);
        $className = $this->em->getClassMetadata(get_class($entity))->getName();
        if ($className === "App\Entity\Interaction" && !$relEntity->getIsDirect()) {
            $relEntity->setIsDirect(true);
            $this->em->persist($relEntity);
        }
    }
/* --------------------------- GENERAL -------------------------------------- */
    /**
     * Checks whether current value is equal to the passed value. If not, the
     * entity is updated with the new value and the field is added to the edits obj.
     */
    private function setRelDataAndTrackEdits(&$entity, $field, $newVal, &$edits)
    {
        $setField = 'set'. $field;
        $getField = 'get'. $field;

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
/* =========================== FLUSH DATA =================================== */
    /**
     * Attempts to flush all persisted data. If there are no errors, the created/updated
     * data is sent back to the crud form; otherise, an error message is sent back.
     */
    public function attemptFlushAndLogErrors(&$returnData)
    {
        try {
            $this->em->flush();
        } catch (\DBALException $e) {
            return $this->logError($returnData, $e);
        } catch (\Exception $e) {
            return $this->logError($returnData, $e);
        }
        $this->setUpdatedAtTimes($returnData);
        // return $this->sendDataAndResponse($returnData);
    }
    /** Logs the error message and returns an error response message. */
    private function logError(&$returnData, $e)
    {
        if ($this->ifNotDuplicateEntityError($e)) {
            $this->logger->logError($e);
        }
        $returnData->error = $e->getMessage();
    }
    private function ifNotDuplicateEntityError($e)
    {
        return !strpos($e->getMessage(), 'Duplicate entry') ||
            !strpos($e->getTraceAsString(), 'Duplicate entry');
    }
/* --------------------- TRACK ENTITY-UPDATE -------------------------------- */
    /**
     * Sets the updatedAt timestamp for modified entities. This will be used to
     * ensure local data stays updated with any changes.
     */
    private function setUpdatedAtTimes($entityData)
    {
        $this->tracker->trackEntityUpdate($entityData->core);
        if (property_exists($entityData, 'detailEntity')) {
            $this->tracker->trackEntityUpdate($entityData->detail);
        }
    }
/* ============================ HELPERS ===================================== */
/* --------------------------- GET ENTITY ----------------------------------- */
    /** Returns the entity. */
    private function getEntity($relField, $val)
    {                                                                           //print("\ngetEntity [$relField][$val]");
        if (!$val) { return; }
        $relClass = $this->getEntityClass($relField);
        $prop = is_numeric($val) ? 'id'  : 'displayName';//print("prop [$prop]");
        return $this->returnEntity($relClass, $val, $prop);
    }
    /** Handles field name to class name translations. */
    private function getEntityClass($relField)
    {
        $classMap = [
            "ParentLocation" => "Location",
            "ParentSource" => "Source",
            "ParentTaxon" => "Taxon",
            "Subject" => "Taxon",
            "Object" => "Taxon"
        ];
        return array_key_exists($relField, $classMap) ?
            $classMap[$relField] : $relField;
    }

    private function returnEntity($class, $val, $prop = 'id')
    {
        return $this->em->getRepository("App:".$class)
            ->findOneBy([$prop => $val]);
    }
/* ------------------- RETURN-DATA BUILDER ---------------------------------- */
    private function buildReturnDataObj($coreName, $coreEntity, $formData)
    { //print("buildReturnDataObj");
        $data = new \stdClass;
        $data->core = lcfirst($coreName);
        $data->coreId = $coreEntity->getId();  //Created entities have ids added before returning
        $data->coreEntity = $coreEntity;
        $data->coreEdits = $this->getEditsObj($formData, 'core');
        $data->detailEdits = $this->getEditsObj($formData, 'detail');
        return $data;
    }
    /**
     * Builds and returns an object that will track any edits made to the entity.
     * The editing prop holds the id of the entity being edited, or false if creating.
     */
    private function getEditsObj($data, $type)
    {
        $edits = new \stdClass;
        $edits->editing = property_exists($data, 'ids') ?
            $data->ids->$type : false;
        return $edits;
    }
    private function removeEditingFlag($coreObj, $detailObj)
    {
        unset($coreObj->editing);
        unset($detailObj->editing);
    }
}