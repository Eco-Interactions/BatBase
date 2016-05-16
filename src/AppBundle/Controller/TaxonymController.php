<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use AppBundle\Entity\Taxonym;
use AppBundle\Form\TaxonymType;

/**
 * Taxonym controller.
 *
 * @Route("/taxonym")
 */
class TaxonymController extends Controller
{
    /**
     * Lists all Taxonym entities.
     *
     * @Route("/", name="app_taxonym")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:Taxonym')->findAll();

        return $this->render('taxonym/index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new Taxonym entity.
     *
     * @Route("/create", name="app_taxonym_create")
     * @Method({"POST"})
     */
    public function createAction(Request $request)
    {
        $entity = new Taxonym();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('app_taxonym_show', array('id' => $entity->getId())));
        }

        return $this->render('taxonym/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Creates a form to create a Taxonym entity.
     *
     * @param Taxonym $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createCreateForm(Taxonym $entity)
    {
        $form = $this->createForm(new TaxonymType(), $entity, array(
            'action' => $this->generateUrl('app_taxonym_create'),
            'method' => 'POST',
        ));

        $form->add('submit', 'submit', array('label' => 'Create'));

        return $form;
    }

    /**
     * Displays a form to create a new Taxonym entity.
     *
     * @Route("/new", name="app_taxonym_new")
     */
    public function newAction()
    {
        $entity = new Taxonym();
        $form = $this->createCreateForm($entity);

        return $this->render('taxonym/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Finds and displays a Taxonym entity.
     *
     * @Route("/{id}/show", name="app_taxonym_show")
     */
    public function showAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Taxonym')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Taxonym entity.');
        }

        $deleteForm = $this->createDeleteForm($id);

        return $this->render('taxonym/show.html.twig', array(
            'entity' => $entity,
            'delete_form' => $deleteForm->createView(),        ));
    }

    /**
     * Displays a form to edit an existing Taxonym entity.
     *
     * @Route("/{id}/edit", name="app_taxonym_edit")
     */
    public function editAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Taxonym')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Taxonym entity.');
        }

        $editForm = $this->createEditForm($entity);
        $deleteForm = $this->createDeleteForm($id);

        return $this->render('taxonym/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Creates a form to edit a Taxonym entity.
     *
     * @param Taxonym $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createEditForm(Taxonym $entity)
    {
        $form = $this->createForm(new TaxonymType(), $entity, array(
            'action' => $this->generateUrl('app_taxonym_update', array('id' => $entity->getId())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }
    /**
     * Edits an existing Taxonym entity.
     *
     * @Route("/{id}/update", name="app_taxonym_update")
     * @Method({"PUT", "POST"})
     */
    public function updateAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Taxonym')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Taxonym entity.');
        }

        $deleteForm = $this->createDeleteForm($id);
        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted()) {
            $em->flush();

            return $this->redirect($this->generateUrl('app_taxonym_edit', array('id' => $id)));
        }

        return $this->render('taxonym/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }
    /**
     * Deletes a Taxonym entity.
     *
     * @Route("/{id}/delete", name="app_taxonym_delete")
     */
    public function deleteAction(Request $request, $id)
    {
        $form = $this->createDeleteForm($id);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $entity = $em->getRepository('AppBundle:Taxonym')->find($id);

            if (!$entity) {
                throw $this->createNotFoundException('Unable to find Taxonym entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('app_taxonym'));
    }

    /**
     * Creates a form to delete a Taxonym entity by id.
     *
     * @param mixed $id The entity id
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm($id)
    {
        return $this->createFormBuilder()
            ->setAction($this->generateUrl('app_taxonym_delete', array('id' => $id)))
            ->setMethod('DELETE')
            ->add('submit', 'submit', array('label' => 'Delete'))
            ->getForm();
    }

    /**
     * Ajax action to create a new taxonym entity.
     *
     * @Route("/post", name="app_taxonym_post")
     * @Method("POST")
     */
    public function postAction(Request $request)
    {
        $requestContent = $request->getContent();
        $pushedData = json_decode($requestContent);

        $returnData = [];

        foreach ($pushedData as $entityData) {
            $name = $entityData->name;

            $entity = new Taxonym();
            $entity->setName($name);

            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            $returnData[$name] = [ "id" => $entity->getId() ];
            // $entityData->id = $entity->getId();
        }

        $response = new JsonResponse();
        $response->setData(array(
            'returnData' => $returnData,
        ));

        return $response;
    }

}


// in webview - sends json obj
//      post message with entity objs str
// conf dialog shown