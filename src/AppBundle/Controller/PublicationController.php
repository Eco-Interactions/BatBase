<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use AppBundle\Entity\Publication;
use AppBundle\Form\PublicationType;

/**
 * Publication controller.
 *
 * @Route("/publication")
 */
class PublicationController extends Controller
{
    /**
     * Lists all Publication entities.
     *
     * @Route("/", name="app_publication")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:Publication')
                ->findAllOrderedByName();

        return $this->render('publication/index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new Publication entity.
     *
     * @Route("/create", name="app_publication_create")
     * @Method({"POST"})
     */
    public function createAction(Request $request)
    {
        $entity = new Publication();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('app_publication_show', array('slug' => $entity->getSlug())));
        }

        return $this->render('publication/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Creates a form to create a Publication entity.
     *
     * @param Publication $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createCreateForm(Publication $entity)
    {
        $form = $this->createForm(new PublicationType(), $entity, array(
            'action' => $this->generateUrl('app_publication_create'),
            'method' => 'POST',
        ));

        $form->add('submit', 'submit', array('label' => 'Create'));

        return $form;
    }

    /**
     * Displays a form to create a new Publication entity.
     *
     * @Route("/new", name="app_publication_new")
     */
    public function newAction()
    {
        $entity = new Publication();
        $form = $this->createCreateForm($entity);

        return $this->render('publication/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Finds and displays a Publication entity.
     *
     * @Route("/{slug}", name="app_publication_show")
     */
    public function showAction($slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Publication')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Publication entity.');
        }

        $deleteForm = $this->createDeleteForm($entity->getId());

        return $this->render('publication/show.html.twig', array(
            'entity' => $entity,
            'delete_form' => $deleteForm->createView(),        ));
    }

    /**
     * Displays a form to edit an existing Publication entity.
     *
     * @Route("/{slug}/edit", name="app_publication_edit")
     */
    public function editAction($slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Publication')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Publication entity.');
        }

        $editForm = $this->createEditForm($entity);
        $deleteForm = $this->createDeleteForm($entity->getId());

        return $this->render('publication/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Creates a form to edit a Publication entity.
     *
     * @param Publication $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createEditForm(Publication $entity)
    {
        $form = $this->createForm(new PublicationType(), $entity, array(
            'action' => $this->generateUrl('app_publication_update', array('slug' => $entity->getSlug())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }
    /**
     * Edits an existing Publication entity.
     *
     * @Route("/{slug}/update", name="app_publication_update")
     * @Method({"PUT", "POST"})
     */
    public function updateAction(Request $request, $slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Publication')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Publication entity.');
        }

        $deleteForm = $this->createDeleteForm($entity->getId());
        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted()) {
            $em->flush();

            return $this->redirect($this->generateUrl('app_publication_edit', array('slug' => $slug)));
        }

        return $this->render('publication/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }
    /**
     * Deletes a Publication entity.
     *
     * @Route("/{slug}/delete", name="app_publication_delete")
     */
    public function deleteAction(Request $request, $slug)
    {
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('AppBundle:Publication')
                ->findOneBy(array('slug' => $slug));

        $form = $this->createDeleteForm($entity->getId());
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            if (!$entity) {
                throw $this->createNotFoundException('Unable to find Publication entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('app_publication'));
    }

    /**
     * Creates a form to delete a Publication entity by id.
     *
     * @param mixed $id The entity id
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm($id)
    {
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('AppBundle:Publication')->find($id);
        $slug = $entity->getSlug();

        return $this->createFormBuilder()
            ->setAction($this->generateUrl('app_publication_delete', array('slug' => $slug)))
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

        $entities = $em->getRepository('AppBundle:Publication')->findAll();

        foreach ($entities as $entity) {
            $name = $entity->getName();
            $entity->setSlug($name);
            $em->persist($entity);
            $em->flush();
        }

        return $this->render('publication/index.html.twig', array(
            'entities' => $entities,
        ));
    }
}
