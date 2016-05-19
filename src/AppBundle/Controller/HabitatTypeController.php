<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use AppBundle\Entity\HabitatType;
use AppBundle\Form\HabitatTypeType;

/**
 * HabitatType controller.
 *
 * @Route("/habitattype")
 */
class HabitatTypeController extends Controller
{
    /**
     * Lists all HabitatType entities.
     *
     * @Route("/", name="app_habitat_type")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:HabitatType')->findAll();

        return $this->render('habitattype/index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new HabitatType entity.
     *
     * @Route("/create", name="app_habitat_type_create")
     * @Method({"POST"})
     */
    public function createAction(Request $request)
    {
        $entity = new HabitatType();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('app_habitat_type_show', array('slug' => $entity->getSlug())));
        }

        return $this->render('habitattype/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Creates a form to create a HabitatType entity.
     *
     * @param HabitatType $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createCreateForm(HabitatType $entity)
    {
        $form = $this->createForm(new HabitatTypeType(), $entity, array(
            'action' => $this->generateUrl('app_habitat_type_create'),
            'method' => 'POST',
        ));

        $form->add('submit', 'submit', array('label' => 'Create'));

        return $form;
    }

    /**
     * Displays a form to create a new HabitatType entity.
     *
     * @Route("/new", name="app_habitat_type_new")
     */
    public function newAction()
    {
        $entity = new HabitatType();
        $form = $this->createCreateForm($entity);

        return $this->render('habitattype/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Finds and displays a HabitatType entity.
     *
     * @Route("/{slug}", name="app_habitat_type_show")
     */
    public function showAction($slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:HabitatType')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find HabitatType entity.');
        }

        $deleteForm = $this->createDeleteForm($entity->getId());

        return $this->render('habitattype/show.html.twig', array(
            'entity' => $entity,
            'delete_form' => $deleteForm->createView(),        ));
    }

    /**
     * Displays a form to edit an existing HabitatType entity.
     *
     * @Route("/{slug}/edit", name="app_habitat_type_edit")
     */
    public function editAction($slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:HabitatType')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find HabitatType entity.');
        }

        $editForm = $this->createEditForm($entity);
        $deleteForm = $this->createDeleteForm($entity->getId());

        return $this->render('habitattype/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Creates a form to edit a HabitatType entity.
     *
     * @param HabitatType $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createEditForm(HabitatType $entity)
    {
        $form = $this->createForm(new HabitatTypeType(), $entity, array(
            'action' => $this->generateUrl('app_habitat_type_update', array('slug' => $entity->getSlug())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }
    /**
     * Edits an existing HabitatType entity.
     *
     * @Route("/{slug}/update", name="app_habitat_type_update")
     * @Method({"PUT", "POST"})
     */
    public function updateAction(Request $request, $slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:HabitatType')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find HabitatType entity.');
        }

        $deleteForm = $this->createDeleteForm($entity->getId());
        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted()) {
            $em->flush();

            return $this->redirect($this->generateUrl('app_habitat_type_edit', array('slug' => $slug)));
        }

        return $this->render('habitattype/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }
    /**
     * Deletes a HabitatType entity.
     *
     * @Route("/{slug}/delete", name="app_habitat_type_delete")
     */
    public function deleteAction(Request $request, $slug)
    {
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('AppBundle:HabitatType')
                ->findOneBy(array('slug' => $slug));

        $form = $this->createDeleteForm($entity->getId());
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            if (!$entity) {
                throw $this->createNotFoundException('Unable to find HabitatType entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('app_habitat_type'));
    }

    /**
     * Creates a form to delete a HabitatType entity by id.
     *
     * @param mixed $id The entity id
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm($id)
    {
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('AppBundle:HabitatType')->find($id);
        $slug = $entity->getSlug();

        return $this->createFormBuilder()
            ->setAction($this->generateUrl('app_habitat_type_delete', array('slug' => $slug)))
            ->setMethod('DELETE')
            ->add('submit', 'submit', array('label' => 'Delete'))
            ->getForm()
        ;
    }

    /**
     * Sluggify existing entities.
     */
    public function sluggifyAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:HabitatType')->findAll();

        foreach ($entities as $entity) {
            $name = $entity->getName();
            $entity->setSlug($name);
            $em->persist($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('app_habitat_type'));
    }

    /**
     * Ajax action to create a new Habitat Type entity.
     *
     * @Route("/post", name="app_habitat_type_post")
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
