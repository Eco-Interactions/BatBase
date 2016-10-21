<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use AppBundle\Entity\NamingType;
use AppBundle\Form\NamingTypeType;

/**
 * NamingType controller.
 *
 * @Route("/namingtype")
 */
class NamingTypeController extends Controller
{
    /**
     * Lists all NamingType entities.
     *
     * @Route("/", name="app_naming_type")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:NamingType')->findAll();

        return $this->render('NamingType/index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new NamingType entity.
     *
     * @Route("/create", name="app_naming_type_create")
     * @Method({"POST"})
     */
    public function createAction(Request $request)
    {
        $entity = new NamingType();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('app_naming_type_show', array('id' => $entity->getId())));
        }

        return $this->render('NamingType/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Creates a form to create a NamingType entity.
     *
     * @param NamingType $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createCreateForm(NamingType $entity)
    {
        $form = $this->createForm(new NamingTypeType(), $entity, array(
            'action' => $this->generateUrl('app_naming_type_create'),
            'method' => 'POST',
        ));

        $form->add('submit', 'submit', array('label' => 'Create'));

        return $form;
    }

    /**
     * Displays a form to create a new NamingType entity.
     *
     * @Route("/new", name="app_naming_type_new")
     */
    public function newAction()
    {
        $entity = new NamingType();
        $form = $this->createCreateForm($entity);

        return $this->render('NamingType/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Finds and displays a NamingType entity.
     *
     * @Route("/{id}/show", name="app_naming_type_show")
     */
    public function showAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:NamingType')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find NamingType entity.');
        }

        $deleteForm = $this->createDeleteForm($id);

        return $this->render('NamingType/show.html.twig', array(
            'entity' => $entity,
            'delete_form' => $deleteForm->createView(),        ));
    }

    /**
     * Displays a form to edit an existing NamingType entity.
     *
     * @Route("/{id}/edit", name="app_naming_type_edit")
     */
    public function editAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:NamingType')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find NamingType entity.');
        }

        $editForm = $this->createEditForm($entity);
        $deleteForm = $this->createDeleteForm($id);

        return $this->render('NamingType/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Creates a form to edit a NamingType entity.
     *
     * @param NamingType $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createEditForm(NamingType $entity)
    {
        $form = $this->createForm(new NamingTypeType(), $entity, array(
            'action' => $this->generateUrl('app_naming_type_update', array('id' => $entity->getId())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }
    /**
     * Edits an existing NamingType entity.
     *
     * @Route("/{id}/update", name="app_naming_type_update")
     * @Method({"PUT", "POST"})
     */
    public function updateAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:NamingType')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find NamingType entity.');
        }

        $deleteForm = $this->createDeleteForm($id);
        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted()) {
            $em->flush();

            return $this->redirect($this->generateUrl('app_naming_type_edit', array('id' => $id)));
        }

        return $this->render('NamingType/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }
    /**
     * Deletes a NamingType entity.
     *
     * @Route("/{id}/delete", name="app_naming_type_delete")
     */
    public function deleteAction(Request $request, $id)
    {
        $form = $this->createDeleteForm($id);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $entity = $em->getRepository('AppBundle:NamingType')->find($id);

            if (!$entity) {
                throw $this->createNotFoundException('Unable to find NamingType entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('app_naming_type'));
    }

    /**
     * Creates a form to delete a NamingType entity by id.
     *
     * @param mixed $id The entity id
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm($id)
    {
        return $this->createFormBuilder()
            ->setAction($this->generateUrl('app_naming_type_delete', array('id' => $id)))
            ->setMethod('DELETE')
            ->add('submit', 'submit', array('label' => 'Delete'))
            ->getForm()
        ;
    }
}
