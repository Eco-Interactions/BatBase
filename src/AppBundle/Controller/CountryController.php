<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use AppBundle\Entity\Country;
use AppBundle\Form\CountryType;

/**
 * Country controller.
 *
 * @Route("/country")
 */
class CountryController extends Controller
{
    /**
     * Lists all Country entities.
     *
     * @Route("/", name="app_country")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:Country')->findAll();

        return $this->render('country/index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new Country entity.
     *
     * @Route("/create", name="app_country_create")
     * @Method({"POST"})
     */
    public function createAction(Request $request)
    {
        $entity = new Country();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('app_country_show', array('slug' => $entity->getSlug())));
        }

        return $this->render('country/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Creates a form to create a Country entity.
     *
     * @param Country $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createCreateForm(Country $entity)
    {
        $form = $this->createForm(new CountryType(), $entity, array(
            'action' => $this->generateUrl('app_country_create'),
            'method' => 'POST',
        ));

        $form->add('submit', 'submit', array('label' => 'Create'));

        return $form;
    }

    /**
     * Displays a form to create a new Country entity.
     *
     * @Route("/new", name="app_country_new")
     */
    public function newAction()
    {
        $entity = new Country();
        $form = $this->createCreateForm($entity);

        return $this->render('country/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Finds and displays a Country entity.
     *
     * @Route("/{slug}", name="app_country_show")
     */
    public function showAction($slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Country')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Country entity.');
        }

        return $this->render('country/show.html.twig', array(
            'entity' => $entity,        ));
    }

    /**
     * Displays a form to edit an existing Country entity.
     *
     * @Route("/{slug}/edit", name="app_country_edit")
     */
    public function editAction($slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Country')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Country entity.');
        }

        $editForm = $this->createEditForm($entity);
        $deleteForm = $this->createDeleteForm($entity->getId());

        return $this->render('country/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Creates a form to edit a Country entity.
     *
     * @param Country $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createEditForm(Country $entity)
    {
        $form = $this->createForm(new CountryType(), $entity, array(
            'action' => $this->generateUrl('app_country_update', array('slug' => $entity->getSlug())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }
    /**
     * Edits an existing Country entity.
     *
     * @Route("/{slug}/update", name="app_country_update")
     * @Method({"PUT", "POST"})
     */
    public function updateAction(Request $request, $slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Country')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Country entity.');
        }

        $deleteForm = $this->createDeleteForm($entity->getId());
        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted()) {
            $em->flush();

            return $this->redirect($this->generateUrl('app_country_edit', array('slug' => $slug)));
        }

        return $this->render('country/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }
    /**
     * Deletes a Country entity.
     *
     * @Route("/{slug}/delete", name="app_country_delete")
     */
    public function deleteAction(Request $request, $slug)
    {
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('AppBundle:Country')
            ->findOneBy(array('slug' => $slug));

        $form = $this->createDeleteForm($entity->getId());
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            if (!$entity) {
                throw $this->createNotFoundException('Unable to find Country entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('app_country'));
    }

    /**
     * Creates a form to delete a Country entity by id.
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
            ->setAction($this->generateUrl('app_country_delete', array('slug' => $slug)))
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

        $entities = $em->getRepository('AppBundle:Country')->findAll();

        foreach ($entities as $entity) {
            $name = $entity->getName();
            $entity->setSlug($name);
            $em->persist($entity);
            $em->flush();
        }

        return $this->render('country/index.html.twig', array(
            'entities' => $entities,
        ));
    }
}
