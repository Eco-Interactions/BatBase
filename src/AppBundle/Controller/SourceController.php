<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use AppBundle\Entity\Source;

/**
 * Source controller.
 *
 * @Route("/source")
 */
class SourceController extends Controller
{
    /**
     * Creates a new Source entity.
     *
     * @Route("/create", name="app_source_create")
     * @Method("POST")
     */
    public function createAction(Request $request)
    {
        $requestContent = $request->getContent();
        $pushedData = json_decode($requestContent);

        //Validate and create entity

        $response = new JsonResponse();
        $response->setData(array(
            'source' => $returnData,
        ));

        return $response;
    }
    /**
     * Ajax action to create a new Source entity.
     *
     * @Route("/post", name="app_source_post")
     * @Method("POST")
     */
    public function postAction(Request $request)            // postNewAction
    {
        // $requestContent = $request->getContent();
        // $pushedData = json_decode($requestContent);

        // $refData = [];
        // $returnData = [];

        // // $returnData[$name] = [ "id" => $entity->getId() ];
        // // $entityData->id = $entity->getId();

        // $response = new JsonResponse();
        // $response->setData(array(
        //     'source' => $returnData,
        // ));

        // return $response;
    }
    /**
     * Edits an existing Source entity.
     *
     * @Route("/{slug}/update", name="app_source_update")
     * @Method({"PUT", "POST"})
     */
    public function updateAction(Request $request, $slug)
    {
        // $em = $this->getDoctrine()->getManager();

        // $entity = $em->getRepository('AppBundle:Source')
        //         ->findOneBy(array('slug' => $slug));

        // if (!$entity) {
        //     throw $this->createNotFoundException('Unable to find Source entity.');
        // }

        // $deleteForm = $this->createDeleteForm($entity->getId());
        // $editForm = $this->createEditForm($entity);
        // $editForm->handleRequest($request);

        // if ($editForm->isSubmitted()) {
        //     $em->flush();

        //     return $this->redirect($this->generateUrl('app_source_edit', array('slug' => $slug)));
        // }

        // return $this->render('Source/edit.html.twig', array(
        //     'entity' => $entity,
        //     'edit_form' => $editForm->createView(),
        //     'delete_form' => $deleteForm->createView(),
        // ));
    }
    /**
     * Ajax action to create a new Source entity.
     *
     * @Route("/post", name="app_source_post")
     * @Method("POST")
     */
    public function postAction(Request $request)            // postNewAction
    {
        // $requestContent = $request->getContent();
        // $pushedData = json_decode($requestContent);

        // $refData = [];
        // $returnData = [];

        // foreach ($pushedData as $entityData) {
        //     $refId = $entityData->tempId;
        //     $shortName = $entityData->shortName;
        //     $lastName = $entityData->last;
        //     $fullName = $entityData->first . $entityData->middle . $entityData->last . $entityData->suffix;

        //     $entity = new Source();
        //     $entity->setShortName($shortName);
        //     $entity->setLastName($lastName);
        //     $entity->setFullName($fullName);
        //     $refData[$refId] = $entity;

        //     $em = $this->getDoctrine()->getManager();
        //     $em->persist($entity);
        // }

        // $em->flush();

        // foreach ($refData as $refId => $entity) {
        //     $returnData[$refId] = $entity->getId();
        // }

        // // $returnData[$name] = [ "id" => $entity->getId() ];
        // // $entityData->id = $entity->getId();

        // $response = new JsonResponse();
        // $response->setData(array(
        //     'source' => $returnData,
        // ));

        // return $response;
    }

}
