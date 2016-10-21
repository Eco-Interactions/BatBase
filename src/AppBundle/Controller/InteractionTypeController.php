<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use AppBundle\Entity\InteractionType;
use AppBundle\Form\InteractionTypeType;

/**
 * InteractionType controller.
 *
 * @Route("/interactiontype")
 */
class InteractionTypeController extends Controller
{
    /**
     * Lists all InteractionType entities.
     *
     *
     * @Route("/", name="app_interaction_type")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:InteractionType')->findAll();

        return $this->render('InteractionType/index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new InteractionType entity.
     *
     * @Route("/create", name="app_interaction_type_create")
     * @Method({"POST"})
     */
    public function createAction(Request $request)
    {
        $entity = new InteractionType();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('app_interaction_type_show', array('slug' => $entity->getSlug())));
        }

        return $this->render('InteractionType/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Creates a form to create a InteractionType entity.
     *
     * @param InteractionType $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createCreateForm(InteractionType $entity)
    {
        $form = $this->createForm(new InteractionTypeType(), $entity, array(
            'action' => $this->generateUrl('app_interaction_type_create'),
            'method' => 'POST',
        ));

        $form->add('submit', 'submit', array('label' => 'Create'));

        return $form;
    }

    /**
     * Displays a form to create a new InteractionType entity.
     *
     * @Route("/new", name="app_interaction_type_new")
     */
    public function newAction()
    {
        $entity = new InteractionType();
        $form = $this->createCreateForm($entity);

        return $this->render('InteractionType/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Finds and displays a InteractionType entity.
     *
     * @Route("/{slug}", name="app_interaction_type_show")
     */
    public function showAction($slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:InteractionType')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find InteractionType entity.');
        }

        $deleteForm = $this->createDeleteForm($entity->getId());

        return $this->render('InteractionType/show.html.twig', array(
            'entity' => $entity,
            'delete_form' => $deleteForm->createView(),        ));
    }

    /**
     * Displays a form to edit an existing InteractionType entity.
     *
     * @Route("/{slug}/edit", name="app_interaction_type_edit")
     */
    public function editAction($slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:InteractionType')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find InteractionType entity.');
        }

        $editForm = $this->createEditForm($entity);
        $deleteForm = $this->createDeleteForm($entity->getId());

        return $this->render('InteractionType/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Creates a form to edit a InteractionType entity.
     *
     * @param InteractionType $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createEditForm(InteractionType $entity)
    {
        $form = $this->createForm(new InteractionTypeType(), $entity, array(
            'action' => $this->generateUrl('app_interaction_type_update', array('slug' => $entity->getSlug())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }
    /**
     * Edits an existing InteractionType entity.
     *
     * @Route("/{slug}/update", name="app_interaction_type_update")
     * @Method({"PUT", "POST"})
     */
    public function updateAction(Request $request, $slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:InteractionType')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find InteractionType entity.');
        }

        $deleteForm = $this->createDeleteForm($entity->getId());
        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted()) {
            $em->flush();

            return $this->redirect($this->generateUrl('app_interaction_type_edit', array('slug' => $slug)));
        }

        return $this->render('InteractionType/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }
    /**
     * Deletes an InteractionType entity.
     *
     * @Route("/{slug}/delete", name="app_interaction_type_delete")
     */
    public function deleteAction(Request $request, $slug)
    {
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('AppBundle:InteractionType')
                ->findOneBy(array('slug' => $slug));

        $form = $this->createDeleteForm($entity->getId());
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            if (!$entity) {
                throw $this->createNotFoundException('Unable to find InteractionType entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('app_interaction_type'));
    }

    /**
     * Creates a form to delete a InteractionType entity by id.
     *
     * @param mixed $id The entity id
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm($id)
    {
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('AppBundle:InteractionType')->find($id);
        $slug = $entity->getSlug();

        return $this->createFormBuilder()
            ->setAction($this->generateUrl('app_interaction_type_delete', array('slug' => $slug)))
            ->setMethod('DELETE')
            ->add('submit', 'submit', array('label' => 'Delete'))
            ->getForm()
        ;
    }

    /**
     * Sluggify existing entities.
     *
     * @Route("/slug")
     */
    public function sluggifyAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:InteractionType')->findAll();

        foreach ($entities as $entity) {
            $name = $entity->getName();
            $entity->setSlug($name);
            $em->persist($entity);
            $em->flush();
        }

        return $this->render('InteractionType/index.html.twig', array(
            'entities' => $entities,
        ));
    }
}
