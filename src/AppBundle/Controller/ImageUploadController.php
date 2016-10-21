<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use AppBundle\Entity\ImageUpload;
use AppBundle\Form\ImageUploadType;

/**
 * Image Upload controller.
 *
 * @Route("/imageupload")
 */
class ImageUploadController extends Controller
{
    /**
     * Lists all Image Upload entities.
     *
     * @Route("/", name="app_image_upload")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:ImageUpload')->findAll();

        return $this->render('ImageUpload/index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new Image Upload entity.
     *
     * @Route("/create", name="app_image_upload_create")
     * @Method({"POST"})
     */
    public function createAction(Request $request)
    {
        $entity = new ImageUpload();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            if ($entity->upload()) {
                $em->persist($entity);
                $em->flush();
            }

            return $this->redirect($this->generateUrl('app_image_upload'));
        }

        return $this->render('ImageUpload/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Creates a form to create a Image Upload entity.
     *
     * @param ImageUpload $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createCreateForm(ImageUpload $entity)
    {
        $form = $this->createForm(new ImageUploadType(), $entity, array(
            'action' => $this->generateUrl('app_image_upload_create'),
            'method' => 'POST',
        ));

        $form->add('submit', 'submit', array('label' => 'Create'));

        return $form;
    }

    /**
     * Displays a form to create a new ImageUpload entity.
     *
     * @Route("/new", name="app_image_upload_new")
     */
    public function newAction()
    {
        $entity = new ImageUpload();
        $form = $this->createCreateForm($entity);

        return $this->render('ImageUpload/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Displays a form to edit an existing Image Upload entity.
     *
     * @Route("/{id}/edit", name="app_image_upload_edit")
     */
    public function editAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:ImageUpload')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Image Upload entity.');
        }

        $editForm = $this->createEditForm($entity);

        return $this->render('ImageUpload/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
        ));
    }

    /**
     * Creates a form to edit a Image Upload entity.
     *
     * @param ImageUpload $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createEditForm(ImageUpload $entity)
    {
        $form = $this->createForm(new ImageUploadType(), $entity, array(
            'action' => $this->generateUrl('app_image_upload_update', array('id' => $entity->getId())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }
    /**
     * Edits an existing Image Upload entity.
     *
     * @Route("/{id}/update", name="app_image_upload_update")
     * @Method({"PUT", "POST"})
     */
    public function updateAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:ImageUpload')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Image Upload entity.');
        }

        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted()) {
            $entity->upload();
            $em->flush();

            return $this->redirect($this->generateUrl('app_image_upload_edit', array('id' => $id)));
        }

        return $this->render('ImageUpload/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
        ));
    }
}
