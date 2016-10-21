<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use AppBundle\Entity\Citation;
use AppBundle\Form\CitationType;

/**
 * Citation controller.
 *
 * @Route("/citation")
 */
class CitationController extends Controller
{
    /**
     * Lists all Citation entities.
     *
     * @Route("/", name="app_citation")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:Citation')->findAll();

        return $this->render('Citation/index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new Citation entity.
     *
     * @Route("/create", name="app_citation_create")
     * @Method({"POST"})
     */
    public function createAction(Request $request)
    {
        $entity = new Citation();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('app_citation_show', array('id' => $entity->getId())));
        }

        return $this->render('Citation/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Creates a form to create a Citation entity.
     *
     * @param Citation $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createCreateForm(Citation $entity)
    {
        $form = $this->createForm(new CitationType(), $entity, array(
            'action' => $this->generateUrl('app_citation_create'),
            'method' => 'POST',
        ));

        $form->add('submit', 'submit', array('label' => 'Create'));

        return $form;
    }

    /**
     * Displays a form to create a new Citation entity.
     *
     * @Route("/new", name="app_citation_new")
     */
    public function newAction()
    {
        $entity = new Citation();
        $form = $this->createCreateForm($entity);

        return $this->render('Citation/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Finds and displays a Citation entity.
     *
     * @Route("/{id}/show", name="app_citation_show")
     */
    public function showAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Citation')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Citation entity.');
        }

        $deleteForm = $this->createDeleteForm($id);

        return $this->render('Citation/show.html.twig', array(
            'entity' => $entity,
            'delete_form' => $deleteForm->createView(),        ));
    }

    /**
     * Displays a form to edit an existing Citation entity.
     *
     * @Route("/{id}/edit", name="app_citation_edit")
     */
    public function editAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Citation')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Citation entity.');
        }

        $editForm = $this->createEditForm($entity);
        $deleteForm = $this->createDeleteForm($id);

        return $this->render('Citation/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Creates a form to edit a Citation entity.
     *
     * @param Citation $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createEditForm(Citation $entity)
    {
        $form = $this->createForm(new CitationType(), $entity, array(
            'action' => $this->generateUrl('app_citation_update', array('id' => $entity->getId())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }
    /**
     * Edits an existing Citation entity.
     *
     * @Route("/{id}/update", name="app_citation_update")
     * @Method({"PUT", "POST"})
     */
    public function updateAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Citation')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Citation entity.');
        }

        $deleteForm = $this->createDeleteForm($id);
        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted()) {
            $em->flush();

            return $this->redirect($this->generateUrl('app_citation_edit', array('id' => $id)));
        }

        return $this->render('Citation/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }
    /**
     * Deletes a Citation entity.
     *
     * @Route("/{id}/delete", name="app_citation_delete")
     */
    public function deleteAction(Request $request, $id)
    {
        $form = $this->createDeleteForm($id);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $entity = $em->getRepository('AppBundle:Citation')->find($id);

            if (!$entity) {
                throw $this->createNotFoundException('Unable to find Citation entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('app_citation'));
    }

    /**
     * Creates a form to delete a Citation entity by id.
     *
     * @param mixed $id The entity id
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm($id)
    {
        return $this->createFormBuilder()
            ->setAction($this->generateUrl('app_citation_delete', array('id' => $id)))
            ->setMethod('DELETE')
            ->add('submit', 'submit', array('label' => 'Delete'))
            ->getForm()
        ;
    }

    /**
     * Lists all Citations data for export.
     *
     * @Route("/export", name="app_citation_export")
     */
    public function exportAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:Citation')->findAll();

        return $this->render('Citation/export.html.twig', array(
            'entities' => $entities,
        ));
    }

    /**
     * Ajax action to create a new Citation entity.
     *
     * @Route("/post", name="app_citation_post")
     * @Method("POST")
     */
    public function postAction(Request $request)
    {
        $requestContent = $request->getContent();
        $pushedData = json_decode($requestContent);
        $entityData = $pushedData->entityData;
        $refEntityData = $pushedData->refData;

        $refData = [];
        $returnData = [];

        foreach ($entityData as $data) {
            $refId = $data->citId;
            // $description = $data->??;
            $fullText = $data->fullText;
            $authors = $data->author;
            $publication = $refEntityData->publication[$data->publication];

            $entity = new Citation();
            $entity->setName($name);
            // $entity->setLastName($lastName);
            // $entity->setFullName($fullName);
            $refData[$refId] = $entity;

            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
        }

        $em->flush();

        foreach ($refData as $refId => $entity) {
            $returnData[$refId] = $entity->getId();
        }

        $response = new JsonResponse();
        $response->setData(array(
            'publication' => $returnData,
        ));

        return $response;
    }

}
