<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use AppBundle\Entity\Interaction;
use AppBundle\Form\InteractionType;

/**
 * Interaction controller.
 *
 * @Route("/interaction")
 */
class InteractionController extends Controller
{
    /**
     * Lists all Interaction entities.
     *
     * @Route("/", name="app_interaction")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:Interaction')->findAll();

        return $this->render('Interaction/index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new Interaction entity.
     *
     * @Route("/create", name="app_interaction_create")
     * @Method({"POST"})
     */
    public function createAction(Request $request)
    {
        $entity = new Interaction();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('app_interaction_show', array('id' => $entity->getId())));
        }

        return $this->render('Interaction/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Creates a form to create a Interaction entity.
     *
     * @param Interaction $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createCreateForm(Interaction $entity)
    {
        $form = $this->createForm(new InteractionType(), $entity, array(
            'action' => $this->generateUrl('app_interaction_create'),
            'method' => 'POST',
        ));

        $form->add('submit', 'submit', array('label' => 'Create'));

        return $form;
    }

    /**
     * Displays a form to create a new Interaction entity.
     *
     * @Route("/new", name="app_interaction_new")
     */
    public function newAction()
    {
        $entity = new Interaction();
        $form = $this->createCreateForm($entity);

        return $this->render('Interaction/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Finds and displays a Interaction entity.
     *
     * @Route("/{id}/show", name="app_interaction_show")
     */
    public function showAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Interaction')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Interaction entity.');
        }

        $deleteForm = $this->createDeleteForm($id);

        return $this->render('Interaction/show.html.twig', array(
            'entity' => $entity,
            'delete_form' => $deleteForm->createView(),        ));
    }

    /**
     * Displays a form to edit an existing Interaction entity.
     *
     * @Route("/{id}/edit", name="app_interaction_edit")
     */
    public function editAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Interaction')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Interaction entity.');
        }

        $editForm = $this->createEditForm($entity);
        $deleteForm = $this->createDeleteForm($id);

        return $this->render('Interaction/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Creates a form to edit a Interaction entity.
     *
     * @param Interaction $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createEditForm(Interaction $entity)
    {
        $form = $this->createForm(new InteractionType(), $entity, array(
            'action' => $this->generateUrl('app_interaction_update', array('id' => $entity->getId())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }
    /**
     * Edits an existing Interaction entity.
     *
     *
     * @Route("/{id}/update", name="app_interaction_update")
     * @Method({"PUT", "POST"})
     */
    public function updateAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Interaction')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Interaction entity.');
        }

        $deleteForm = $this->createDeleteForm($id);
        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted()) {
            $em->flush();

            return $this->redirect($this->generateUrl('app_interaction_edit', array('id' => $id)));
        }

        return $this->render('Interaction/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }
    /**
     * Deletes a Interaction entity.
     *
     * @Route("/{id}/delete", name="app_interaction_delete")
     */
    public function deleteAction(Request $request, $id)
    {
        $form = $this->createDeleteForm($id);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $entity = $em->getRepository('AppBundle:Interaction')->find($id);

            if (!$entity) {
                throw $this->createNotFoundException('Unable to find Interaction entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('app_interaction'));
    }

    /**
     * Creates a form to delete a Interaction entity by id.
     *
     * @param mixed $id The entity id
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm($id)
    {
        return $this->createFormBuilder()
            ->setAction($this->generateUrl('app_interaction_delete', array('id' => $id)))
            ->setMethod('DELETE')
            ->add('submit', 'submit', array('label' => 'Delete'))
            ->getForm()
        ;
    }

    /**
     * Lists all Interaction data for export.
     *
     * @Route("/export", name="app_interaction_export")
     */
    public function exportAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:Interaction')->findAll();

        return $this->render('Interaction/export.html.twig', array(
            'entities' => $entities,

        ));
    }
}
