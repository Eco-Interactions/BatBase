<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use AppBundle\Entity\Authority;
use AppBundle\Form\AuthorityType;

/**
 * Authority controller.
 *
 * @Route("/authority")
 */
class AuthorityController extends Controller
{
    /**
     * Lists all Authority entities.
     *
     * @Route("/", name="app_authority")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:Authority')->findAll();

        return $this->render('authority/index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new Authority entity.
     *
     * @Route("/create", name="app_authority_create")
     * @Method({"POST"})
     */
    public function createAction(Request $request)
    {
        $entity = new Authority();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('app_authority_show', array('id' => $entity->getId())));
        }

        return $this->render('authority/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Creates a form to create a Authority entity.
     *
     * @param Authority $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createCreateForm(Authority $entity)
    {
        $form = $this->createForm(new AuthorityType(), $entity, array(
            'action' => $this->generateUrl('app_authority_create'),
            'method' => 'POST',
        ));

        $form->add('submit', 'submit', array('label' => 'Create'));

        return $form;
    }

    /**
     * Displays a form to create a new Authority entity.
     *
     * @Route("/new", name="app_authority_new")
     */
    public function newAction()
    {
        $entity = new Authority();
        $form = $this->createCreateForm($entity);

        return $this->render('authority/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Finds and displays a Authority entity.
     *
     * @Route("/{id}/show", name="app_authority_show")
     */
    public function showAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Authority')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Authority entity.');
        }

        $deleteForm = $this->createDeleteForm($id);

        return $this->render('authority/show.html.twig', array(
            'entity' => $entity,
            'delete_form' => $deleteForm->createView(),        ));
    }

    /**
     * Displays a form to edit an existing Authority entity.
     *
     * @Route("/{id}/edit", name="app_authority_edit")
     */
    public function editAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Authority')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Authority entity.');
        }

        $editForm = $this->createEditForm($entity);
        $deleteForm = $this->createDeleteForm($id);

        return $this->render('authority/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Creates a form to edit a Authority entity.
     *
     * @param Authority $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createEditForm(Authority $entity)
    {
        $form = $this->createForm(new AuthorityType(), $entity, array(
            'action' => $this->generateUrl('app_authority_update', array('id' => $entity->getId())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }
    /**
     * Edits an existing Authority entity.
     *
     * @Route("/{id}/update", name="app_authority_update")
     * @Method({"PUT", "POST"})
     */
    public function updateAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Authority')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Authority entity.');
        }

        $deleteForm = $this->createDeleteForm($id);
        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted()) {
            $em->flush();

            return $this->redirect($this->generateUrl('app_authority_edit', array('id' => $id)));
        }

        return $this->render('authority/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }
    /**
     * Deletes a Authority entity.
     *
     * @Route("/{id}/delete", name="app_authority_delete")
     */
    public function deleteAction(Request $request, $id)
    {
        $form = $this->createDeleteForm($id);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $entity = $em->getRepository('AppBundle:Authority')->find($id);

            if (!$entity) {
                throw $this->createNotFoundException('Unable to find Authority entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('app_authority'));
    }

    /**
     * Creates a form to delete a Authority entity by id.
     *
     * @param mixed $id The entity id
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm($id)
    {
        return $this->createFormBuilder()
            ->setAction($this->generateUrl('app_authority_delete', array('id' => $id)))
            ->setMethod('DELETE')
            ->add('submit', 'submit', array('label' => 'Delete'))
            ->getForm()
        ;
    }
}
