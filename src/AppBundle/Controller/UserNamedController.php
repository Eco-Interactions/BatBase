<?php

namespace AppBundle\Controller;

use AppBundle\Entity\UserNamed;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;


/**
 * Saves and displays user specified data sets: Interactions and Filters
 *
 * @Route("/lists", name="app_")
 */
class UserNamedController extends Controller
{
/*------------------------------ CREATE --------------------------------------*/
    /**
     * Saves a new set of user-named data
     * @Route("/create", name="list_create")
     */
    public function listCreateAction(Request $request)
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }                               
        $em = $this->getDoctrine()->getManager();
        $requestContent = $request->getContent();
        $data = json_decode($requestContent);                               
        $list = new UserNamed();
        
        $returnData = new \stdClass; 
        $returnData->name = $data->displayName;
        $returnData->entity = $list;
        $returnData->edits = new \stdClass;

        $list->setCreatedBy($this->getUser());
        $list->setLastLoaded(new \DateTime('now', new \DateTimeZone('America/Los_Angeles') ));
        $this->setListData($data, $list, $em, $returnData->edits);

        $em->persist($list);
        $returnData->edits = false;

        return $this->attemptFlushAndSendResponse($returnData, $em);
    }
/*------------------------------ EDIT ----------------------------------------*/
    /**
     * Updates the user-named filter set or interaction list.
     *
     * @Route("/edit", name="list_edit")
     */
    public function listEditAction(Request $request)
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }                                                                       //print("\nCreating Source.\n");
        $em = $this->getDoctrine()->getManager();
        $requestContent = $request->getContent();
        $data = json_decode($requestContent);                                   //print("\nForm data =");print_r($formData);
        $list = $em->getRepository('AppBundle:UserNamed')->findOneBy(['id' => $data->id]);
        
        $returnData = new \stdClass; 
        $returnData->name = $data->displayName;
        $returnData->entity = $list;
        $returnData->edits = new \stdClass;

        $list->setLastLoaded(new \DateTime('now', new \DateTimeZone('America/Los_Angeles')));
        $this->setListData($data, $list, $em, $returnData->edits);
        $em->persist($list);

        return $this->attemptFlushAndSendResponse($returnData, $em);
    }
    /*---------- Set List Data ---------------------------------------------*/
    private function setListData($data, &$entity, &$em, &$editing)
    {
        foreach ($data as $field => $val) {
            $this->setDataAndTrackEdits($entity, $field, $val, $editing);  
        }
    }
    /**
     * Checks whether current value is equal to the passed value. If not, the 
     * entity is updated with the new value and the field is added to the edits obj.   
     */
    private function setDataAndTrackEdits(&$entity, $field, $newVal, &$editing) 
    {  
        if ($field == 'id') { return; }
        $setField = 'set'. ucfirst($field);                                     
        $getField = 'get'. ucfirst($field);                                     
        
        $curVal = $entity->$getField();
        if ($curVal === $newVal) { return; }

        $entity->$setField($newVal);
        $editing->$field['old'] = $curVal;
    }
    /*---------- Flush and Return Data ---------------------------------------*/
    /**
     * Attempts to flush all persisted data. If there are no errors, the created/updated 
     * data is sent back to the crud form; otherise, an error message is sent back.
     */                                                                                                                                     
    private function attemptFlushAndSendResponse($data, &$em)
    {        
        try {
            $em->flush();
        } catch (\Doctrine\DBAL\DBALException $e) {                             
            return $this->sendErrorResponse($e, "DBALException");
        } catch (\Exception $e) {
            return $this->sendErrorResponse($e, "\Exception");
        }
        // $this->setUpdatedAtTimes($data, $em);
        return $this->sendDataAndResponse($data);
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
    private function sendDataAndResponse($data)
    {
        $data->entity = $this->container->get('jms_serializer')
            ->serialize($data->entity, 'json');

        $response = new JsonResponse();
        $response->setData(array(
            'list' => $data
        ));
        return $response;
    }
    // /** ----------------- Set Entity/System UpdatedAt ----------------------- */
    // /**
    //  * Sets the updatedAt timestamp for modified entities. This will be used to 
    //  * ensure local data stays updated with any changes.
    //  */
    // private function setUpdatedAtTimes($entityData, &$em)
    // {
    //     $this->setUpdatedAt($entityData->core, $em);
    //     if ($entityData->detailEntity) {
    //         $this->setUpdatedAt($entityData->detail, $em);
    //     }
    //     $this->setUpdatedAt('System', $em); 
    //     $em->flush();
    // }
    // private function setUpdatedAt($name, &$em)
    // {
    //     $entity = $em->getRepository('AppBundle:SystemDate')
    //         ->findOneBy(['description' => $name]);
    //     if (!$entity) { return; }
    //     $entity->setDateVal(new \DateTime());
    //     $em->persist($entity);
    // }
}