<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use AppBundle\Entity\Attribution;
use AppBundle\Form\AttributionType;

/**
 * Attribution controller.
 *
 * @Route("/attribution")
 */
class AttributionController extends Controller
{
    /**
     * Lists all Attribution entities.
     *
     * @Route("/", name="app_attribution")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:Attribution')->findAll();

        return $this->render('attribution/index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new Attribution entity.
     *
     * @Route("/create", name="app_attribution_create")
     * @Method({"POST"})
     */
    public function createAction(Request $request)
    {
        $entity = new Attribution();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('app_attribution_show', array('id' => $entity->getId())));
        }

        return $this->render('attribution/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Creates a form to create a Attribution entity.
     *
     * @param Attribution $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createCreateForm(Attribution $entity)
    {
        $form = $this->createForm(new AttributionType(), $entity, array(
            'action' => $this->generateUrl('app_attribution_create'),
            'method' => 'POST',
        ));

        $form->add('submit', 'submit', array('label' => 'Create'));

        return $form;
    }

    /**
     * Displays a form to create a new Attribution entity.
     *
     * @Route("/new", name="app_attribution_new")
     */
    public function newAction()
    {
        $entity = new Attribution();
        $form = $this->createCreateForm($entity);

        return $this->render('attribution/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Finds and displays a Attribution entity.
     *
     * @Route("/{id}/show", name="app_attribution_show")
     */
    public function showAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Attribution')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Attribution entity.');
        }

        $deleteForm = $this->createDeleteForm($id);

        return $this->render('attribution/show.html.twig', array(
            'entity' => $entity,
            'delete_form' => $deleteForm->createView(),        ));
    }

    /**
     * Displays a form to edit an existing Attribution entity.
     *
     * @Route("/{id}/edit", name="app_author_edit")
     */
    public function editAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Attribution')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Attribution entity.');
        }

        $editForm = $this->createEditForm($entity);
        $deleteForm = $this->createDeleteForm($id);

        return $this->render('attribution/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Creates a form to edit a Attribution entity.
     *
     * @param Attribution $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createEditForm(Attribution $entity)
    {
        $form = $this->createForm(new AttributionType(), $entity, array(
            'action' => $this->generateUrl('app_attribution_update', array('id' => $entity->getId())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }
    /**
     * Edits an existing Attribution entity.
     *
     * @Route("/{id}/update", name="app_attribution_update")
     * @Method({"PUT", "POST"})
     */
    public function updateAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Attribution')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Attribution entity.');
        }

        $deleteForm = $this->createDeleteForm($id);
        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted()) {
            $em->flush();

            return $this->redirect($this->generateUrl('app_attribution_edit', array('id' => $id)));
        }

        return $this->render('attribution/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }
    /**
     * Deletes a Attribution entity.
     *
     * @Route("/{id}/delete", name="app_attribution_delete")
     */
    public function deleteAction(Request $request, $id)
    {
        $form = $this->createDeleteForm($id);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $entity = $em->getRepository('AppBundle:Attribution')->find($id);

            if (!$entity) {
                throw $this->createNotFoundException('Unable to find Attribution entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('app_attribution'));
    }

    /**
     * Creates a form to delete a Attribution entity by id.
     *
     * @param mixed $id The entity id
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm($id)
    {
        return $this->createFormBuilder()
            ->setAction($this->generateUrl('app_attribution_delete', array('id' => $id)))
            ->setMethod('DELETE')
            ->add('submit', 'submit', array('label' => 'Delete'))
            ->getForm()
        ;
    }
}
