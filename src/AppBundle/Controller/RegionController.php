<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use AppBundle\Entity\Region;
use AppBundle\Form\RegionType;

/**
 * Region controller.
 *
 * @Route("/region")
 */
class RegionController extends Controller
{
    /**
     * Lists all Region entities.
     *
     * @Route("/", name="app_region")
     * @Method("GET")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:Region')->findAll();

        return $this->render('region/index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new Region entity.
     *
     * @Route("/", name="app_region_create")
     * @Method("POST")
     */
    public function createAction(Request $request)
    {
        $entity = new Region();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('app_region_show', array('slug' => $entity->getSlug())));
        }

        return $this->render('region/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Creates a form to create a Region entity.
     *
     * @param Region $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createCreateForm(Region $entity)
    {
        $form = $this->createForm(new RegionType(), $entity, array(
            'action' => $this->generateUrl('app_region_create'),
            'method' => 'POST',
        ));

        $form->add('submit', 'submit', array('label' => 'Create'));

        return $form;
    }

    /**
     * Displays a form to create a new Region entity.
     *
     * @Route("/new", name="app_region_new")
     * @Method("GET")
     */
    public function newAction()
    {
        $entity = new Region();
        $form = $this->createCreateForm($entity);

        return $this->render('region/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Finds and displays a Region entity.
     *
     * @Route("/{slug}", name="app_region_show")
     * @Method("GET")
     */
    public function showAction($slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Region')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Region entity.');
        }

        $deleteForm = $this->createDeleteForm($entity->getId());

        return $this->render('region/show.html.twig', array(
            'entity' => $entity,
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Displays a form to edit an existing Region entity.
     *
     * @Route("/{slug}/edit", name="app_region_edit")
     * @Method("GET")
     */
    public function editAction($slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Region')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Region entity.');
        }

        $editForm = $this->createEditForm($entity);
        $deleteForm = $this->createDeleteForm($entity->getId());

        return $this->render('region/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Creates a form to edit a Region entity.
     *
     * @param Region $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createEditForm(Region $entity)
    {
        $form = $this->createForm(new RegionType(), $entity, array(
            'action' => $this->generateUrl('app_region_update', array('slug' => $entity->getSlug())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }
    /**
     * Edits an existing Region entity.
     *
     * @Route("/{slug}", name="app_region_update")
     * @Method("PUT")
     */
    public function updateAction(Request $request, $slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Region')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Region entity.');
        }

        $deleteForm = $this->createDeleteForm($entity->getId());
        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted()) {
            $em->flush();

            return $this->redirect($this->generateUrl('app_region_edit', array('slug' => $slug)));
        }

        return $this->render('region/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }
    /**
     * Deletes a Region entity.
     *
     * @Route("/{slug}/delete", name="app_region_delete")
     * @Method("DELETE")
     */
    public function deleteAction(Request $request, $slug)
    {
        $form = $this->createDeleteForm($entity->getId());
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $entity = $em->getRepository('AppBundle:Region')
                ->findOneBy(array('slug' => $slug));

            if (!$entity) {
                throw $this->createNotFoundException('Unable to find Region entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('region'));
    }

    /**
     * Creates a form to delete a Region entity by id.
     *
     * @param mixed $id The entity id
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm($id)
    {
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('AppBundle:Region')->find($id);
        $slug = $entity->getSlug();

        return $this->createFormBuilder()
            ->setAction($this->generateUrl('app_region_delete', array('slug' => $slug)))
            ->setMethod('DELETE')
            ->add('submit', 'submit', array('label' => 'Delete'))
            ->getForm()
        ;
    }
}
