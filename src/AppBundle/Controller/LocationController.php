<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use AppBundle\Entity\Location;
use AppBundle\Form\LocationType;

/**
 * Location controller.
 *
 * @Route("/location")
 */
class LocationController extends Controller
{
    /**
     * Lists all Location entities.
     *
     * @Route("/", name="app_location")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:Location')->findAll();

        return $this->render('location/index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new Location entity.
     *
     * @Route("/create", name="app_location_create")
     * @Method("POST")
     */
    public function createAction(Request $request)
    {
        $entity = new Location();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('app_location_show', array('id' => $entity->getId())));
        }

        return $this->render('location/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Creates a form to create a Location entity.
     *
     * @param Location $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createCreateForm(Location $entity)
    {
        $form = $this->createForm(new LocationType(), $entity, array(
            'action' => $this->generateUrl('app_location_create'),
            'method' => 'POST',
        ));

        $form->add('submit', 'submit', array('label' => 'Create'));

        return $form;
    }

    /**
     * Displays a form to create a new Location entity.
     *
     * @Route("/new", name="app_location_new")
     */
    public function newAction()
    {
        $entity = new Location();
        $form = $this->createCreateForm($entity);

        return $this->render('location/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Finds and displays a Location entity.
     *
     * @Route("/{id}/show", name="app_location_show")
     */
    public function showAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Location')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Location entity.');
        }

        $deleteForm = $this->createDeleteForm($id);

        return $this->render('location/show.html.twig', array(
            'entity' => $entity,
            'delete_form' => $deleteForm->createView(),        ));
    }

    /**
     * Displays a form to edit an existing Location entity.
     *
     * @Route("/{id}/edit", name="app_location_edit")
     */
    public function editAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Location')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Location entity.');
        }

        $editForm = $this->createEditForm($entity);
        $deleteForm = $this->createDeleteForm($id);

        return $this->render('location/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Creates a form to edit a Location entity.
     *
     * @param Location $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createEditForm(Location $entity)
    {
        $form = $this->createForm(new LocationType(), $entity, array(
            'action' => $this->generateUrl('app_location_update', array('id' => $entity->getId())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }
    /**
     * Edits an existing Location entity.
     *
     * @Route("/{id}/update", name="app_location_update")
     * @Method({"PUT", "POST"})
     */
    public function updateAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Location')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Location entity.');
        }

        $deleteForm = $this->createDeleteForm($id);
        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted()) {
            $em->flush();

            return $this->redirect($this->generateUrl('app_location_edit', array('id' => $id)));
        }

        return $this->render('location/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }
    /**
     * Deletes a Location entity.
     *
     * @Route("/{id}/delete", name="app_location_delete")
     */
    public function deleteAction(Request $request, $id)
    {
        $form = $this->createDeleteForm($id);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $entity = $em->getRepository('AppBundle:Location')->find($id);

            if (!$entity) {
                throw $this->createNotFoundException('Unable to find Location entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('app_location'));
    }

    /**
     * Creates a form to delete a Location entity by id.
     *
     * @param mixed $id The entity id
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm($id)
    {
        return $this->createFormBuilder()
            ->setAction($this->generateUrl('app_location_delete', array('id' => $id)))
            ->setMethod('DELETE')
            ->add('submit', 'submit', array('label' => 'Delete'))
            ->getForm()
        ;
    }

    /**
     * Ajax action to create a new Location entity.
     *
     * @Route("/post", name="app_location_post")
     * @Method("POST")
     */
    public function postAction(Request $request)
    {
        // $requestContent = $request->getContent();
        // $pushedData = json_decode($requestContent);
        // $entityData = $pushedData->entityData;

        // $refData = [];
        // $returnData = [];

        // foreach ($pushedData as $entityData) {
        //     $refId = $entityData->tempId;
        //     $name = $entityData->pubTitle;
        //     $publisher = $entityData->publisher;
        //     $pubType = $entityData->pubType;

        //     $entity = new Publication();
        //     $entity->setName($name);
        //     // $entity->setLastName($lastName);
        //     // $entity->setFullName($fullName);
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
        //     'publication' => $returnData,
        // ));

        // return $response;
    }
}
