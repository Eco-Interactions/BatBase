<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use AppBundle\Entity\Naming;
use AppBundle\Form\NamingType;

/**
 * Naming controller.
 *
 * @Route("/naming")
 */
class NamingController extends Controller
{
    /**
     * Lists all Naming entities.
     *
     * @Route("/", name="app_naming")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:Naming')->findAll();

        return $this->render('naming/index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new Naming entity.
     *
     * @Route("/create", name="app_naming_create")
     * @Method({"POST"})
     */
    public function createAction(Request $request)
    {
        $entity = new Naming();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('app_naming_show', array('id' => $entity->getId())));
        }

        return $this->render('naming/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Creates a form to create a Naming entity.
     *
     * @param Naming $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createCreateForm(Naming $entity)
    {
        $form = $this->createForm(new NamingType(), $entity, array(
            'action' => $this->generateUrl('app_naming_create'),
            'method' => 'POST',
        ));

        $form->add('submit', 'submit', array('label' => 'Create'));

        return $form;
    }

    /**
     * Displays a form to create a new Naming entity.
     *
     * @Route("/new", name="app_naming_new")
     */
    public function newAction()
    {
        $entity = new Naming();
        $form = $this->createCreateForm($entity);

        return $this->render('naming/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Finds and displays a Naming entity.
     *
     * @Route("/{id}/show", name="app_naming_show")
     */
    public function showAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Naming')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Naming entity.');
        }

        $deleteForm = $this->createDeleteForm($id);

        return $this->render('naming/show.html.twig', array(
            'entity' => $entity,
            'delete_form' => $deleteForm->createView(),        ));
    }

    /**
     * Displays a form to edit an existing Naming entity.
     *
     * @Route("/{id}/edit", name="app_naming_edit")
     */
    public function editAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Naming')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Naming entity.');
        }

        $editForm = $this->createEditForm($entity);
        $deleteForm = $this->createDeleteForm($id);

        return $this->render('naming/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Creates a form to edit a Naming entity.
     *
     * @param Naming $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createEditForm(Naming $entity)
    {
        $form = $this->createForm(new NamingType(), $entity, array(
            'action' => $this->generateUrl('app_naming_update', array('id' => $entity->getId())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }
    /**
     * Edits an existing Naming entity.
     *
     * @Route("/{id}/update", name="app_naming_update")
     * @Method({"PUT", "POST"})
     */
    public function updateAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Naming')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Naming entity.');
        }

        $deleteForm = $this->createDeleteForm($id);
        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted()) {
            $em->flush();

            return $this->redirect($this->generateUrl('app_naming_edit', array('id' => $id)));
        }

        return $this->render('naming/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }
    /**
     * Deletes a Naming entity.
     *
     * @Route("/{id}/delete", name="app_naming_delete")
     */
    public function deleteAction(Request $request, $id)
    {
        $form = $this->createDeleteForm($id);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $entity = $em->getRepository('AppBundle:Naming')->find($id);

            if (!$entity) {
                throw $this->createNotFoundException('Unable to find Naming entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('app_naming'));
    }

    /**
     * Creates a form to delete a Naming entity by id.
     *
     * @param mixed $id The entity id
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm($id)
    {
        return $this->createFormBuilder()
            ->setAction($this->generateUrl('app_naming_delete', array('id' => $id)))
            ->setMethod('DELETE')
            ->add('submit', 'submit', array('label' => 'Delete'))
            ->getForm()
        ;
    }
}
