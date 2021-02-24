<?php

namespace App\Controller;

use App\Service\SerializeData;
use App\Service\DataManager;
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
    private $em;
    private $serialize;
    private $dataManager;

    public function __construct(SerializeData $serialize, DataManager $dataManager)
    {
        $this->serialize = $serialize;
        $this->dataManager = $dataManager;
    }
/* ========================== EDIT ENTITY =================================== */
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
        $requestContent = $request->getContent();
        $formData = json_decode($requestContent);                               //print("\nForm data =");print_r($formData);
        $coreName = $formData->coreEntity;                                      //print("coreName = ". $coreName);

        $returnData = $this->dataManager->createEntity($coreName, $formData);

        return $this->sendDataAndResponse($returnData);
    }
/* ========================== EDIT ENTITY =================================== */

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
        $requestContent = $request->getContent();
        $formData = json_decode($requestContent);                               //print("\nForm data =");print_r($formData);
        $coreName = $formData->coreEntity;                                      //print("coreName = ". $coreName);

        $returnData = $this->dataManager->editEntity($coreName, $formData);

        $this->checkForEditsToClientSideData($coreName, $returnData);

        return $this->sendDataAndResponse($returnData);
    }
/* ------------------ FLAG EDITS FOR CLIENT-SIDE DATA ----------------------- */
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
        $this->checkForGroupEdits($new, $old, $edits);
        $this->checkForSubGroupEdits($new, $old, $edits);
    }
    private function checkForGroupEdits($new, $old, &$edits)
    {
        $oldGroup = $old->getGroup()->getDisplayName();
        $newGroup = $new->getGroup()->getId();
        $this->trackEditsToData('group', $newGroup, $oldGroup, $edits);
    }
    private function checkForSubGroupEdits($new, $old, &$edits)
    {
        $oldGroup = $old->getSubGroup();
        $newGroup = $new->getSubGroup();
        $this->trackEditsToData('subGroup', $newGroup, $oldGroup, $edits);
    }
    private function trackEditsToData($field, $newVal, $oldVal, &$edits)
    {
        if ($newVal === $oldVal) { return; }
        $edits->$field = [ 'new' => $newVal, 'old' => $oldVal ];
    }
/* ======================= SERIALIZE AND RETURN ============================= */
    /** Sends an object with the entities' serialized data back to the crud form. */
    private function sendDataAndResponse($entityData)
    {
        $serialize = ['core', 'detail'];

        foreach ($serialize as $p) {
            $prop = $p.'Entity';
            $id = $p.'Id';
            if (!property_exists($entityData, $prop) || !$entityData->$prop ) { continue; }
            try {
                $entityData->$id = $entityData->$prop->getId();
                $entityData->$prop = $this->serialize->serializeRecord(
                    $entityData->$prop, 'normalized');
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
    /** Logs the error message and returns an error response message. */
    private function sendErrorResponse($e)
    {
        $response = new JsonResponse();
        $response->setStatusCode(500);
        $response->setData($e->getMessage());
        return $response;
    }
/* ====================== UPDATE CITATION TEXT ============================== */
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
}