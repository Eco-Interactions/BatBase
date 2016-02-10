<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use AppBundle\Entity\Author;
use AppBundle\Form\AuthorType;

/**
 * Author controller.
 *
 * @Route("/author")
 */
class AuthorController extends Controller
{
    /**
     * Lists all Author entities.
     *
     * @Route("/", name="app_author")
     * @Method("GET")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:Author')->findAll();

        return $this->render('author/index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new Author entity.
     *
     * @Route("/create", name="app_author_create")
     * @Method("POST")
     */
    public function createAction(Request $request)
    {
        $entity = new Author();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('app_author_show', array('slug' => $entity->getSlug())));
        }

        return $this->render('author/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Creates a form to create a Author entity.
     *
     * @param Author $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createCreateForm(Author $entity)
    {
        $form = $this->createForm(new AuthorType(), $entity, array(
            'action' => $this->generateUrl('app_author_create'),
            'method' => 'POST',
        ));

        $form->add('submit', 'submit', array('label' => 'Create'));

        return $form;
    }

    /**
     * Displays a form to create a new Author entity.
     *
     * @Route("/new", name="app_author_new")
     */
    public function newAction()
    {
        $entity = new Author();
        $form = $this->createCreateForm($entity);

        return $this->render('author/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Lists all Author data for export.
     *
     * @Route("/export", name="app_author_export")
     */
    public function exportAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:Author')->findAll();

        return $this->render('author/export.html.twig', array(
            'entities' => $entities,
        ));
    }

    /**
     * Finds and displays a Author entity.
     *
     * @Route("/{slug}", name="app_author_show")
     * @Method("GET")
     */
    public function showAction($slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Author')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Author entity.');
        }

        $deleteForm = $this->createDeleteForm($entity->getId());

        return $this->render('author/show.html.twig', array(
            'entity' => $entity,
            'delete_form' => $deleteForm->createView(),        ));
    }

    /**
     * Displays a form to edit an existing Author entity.
     *
     * @Route("/{slug}/edit", name="app_author_edit")
     * @Method("GET")
     */
    public function editAction($slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Author')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Author entity.');
        }

        $editForm = $this->createEditForm($entity);
        $deleteForm = $this->createDeleteForm($entity->getId());

        return $this->render('author/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Creates a form to edit a Author entity.
     *
     * @param Author $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createEditForm(Author $entity)
    {
        $form = $this->createForm(new AuthorType(), $entity, array(
            'action' => $this->generateUrl('app_author_update', array('slug' => $entity->getSlug())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }
    /**
     * Edits an existing Author entity.
     *
     * @Route("/{slug}/update", name="app_author_update")
     * @Method({"PUT", "POST"})
     */
    public function updateAction(Request $request, $slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Author')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Author entity.');
        }

        $deleteForm = $this->createDeleteForm($entity->getId());
        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted()) {
            $em->flush();

            return $this->redirect($this->generateUrl('app_author_edit', array('slug' => $slug)));
        }

        return $this->render('author/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }
    /**
     * Deletes a Author entity.
     *
     * @Route("/{slug}/delete", name="app_author_delete")
     * @Method("DELETE")
     */
    public function deleteAction(Request $request, $slug)
    {
        $form = $this->createDeleteForm($entity->getId());
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $entity = $em->getRepository('AppBundle:Author')
                ->findOneBy(array('slug' => $slug));

            if (!$entity) {
                throw $this->createNotFoundException('Unable to find Author entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('app_author'));
    }

    /**
     * Creates a form to delete a Author entity by id.
     *
     * @param mixed $id The entity id
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm($id)
    {
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('AppBundle:Author')->find($id);
        $slug = $entity->getSlug();

        return $this->createFormBuilder()
            ->setAction($this->generateUrl('app_author_delete', array('slug' => $slug)))
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

        $entities = $em->getRepository('AppBundle:Author')->findAll();

        foreach ($entities as $entity) {
            $name = $entity->getShortName();
            $entity->setSlug($name);
            $em->persist($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('app_author'));
    }
}
