<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use AppBundle\Entity\Taxon;
use AppBundle\Form\TaxonType;

/**
 * Taxon controller.
 *
 */
class TaxonController extends Controller
{

    /**
     * Lists all Taxon entities.
     *
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:Taxon')->findAll();

        return $this->render('AppBundle:Taxon:index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new Taxon entity.
     *
     */
    public function createAction(Request $request)
    {
        $entity = new Taxon();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('app_taxon_show', array('id' => $entity->getId())));
        }

        return $this->render('AppBundle:Taxon:new.html.twig', array(
            'entity' => $entity,
            'form'   => $form->createView(),
        ));
    }

    /**
    * Creates a form to create a Taxon entity.
    *
    * @param Taxon $entity The entity
    *
    * @return \Symfony\Component\Form\Form The form
    */
    private function createCreateForm(Taxon $entity)
    {
        $form = $this->createForm(new TaxonType(), $entity, array(
            'action' => $this->generateUrl('app_taxon_create'),
            'method' => 'POST',
        ));

        $form->add('submit', 'submit', array('label' => 'Create'));

        return $form;
    }

    /**
     * Displays a form to create a new Taxon entity.
     *
     */
    public function newAction()
    {
        $entity = new Taxon();
        $form   = $this->createCreateForm($entity);

        return $this->render('AppBundle:Taxon:new.html.twig', array(
            'entity' => $entity,
            'form'   => $form->createView(),
        ));
    }

    /**
     * Finds and displays a Taxon entity.
     *
     */
    public function showAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Taxon')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Taxon entity.');
        }

        $deleteForm = $this->createDeleteForm($id);

        return $this->render('AppBundle:Taxon:show.html.twig', array(
            'entity'      => $entity,
            'delete_form' => $deleteForm->createView(),        ));
    }

    /**
     * Displays a form to edit an existing Taxon entity.
     *
     */
    public function editAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Taxon')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Taxon entity.');
        }

        $editForm = $this->createEditForm($entity);
        $deleteForm = $this->createDeleteForm($id);

        return $this->render('AppBundle:Taxon:edit.html.twig', array(
            'entity'      => $entity,
            'edit_form'   => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
    * Creates a form to edit a Taxon entity.
    *
    * @param Taxon $entity The entity
    *
    * @return \Symfony\Component\Form\Form The form
    */
    private function createEditForm(Taxon $entity)
    {
        $form = $this->createForm(new TaxonType(), $entity, array(
            'action' => $this->generateUrl('app_taxon_update', array('id' => $entity->getId())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }
    /**
     * Edits an existing Taxon entity.
     *
     */
    public function updateAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Taxon')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Taxon entity.');
        }

        $deleteForm = $this->createDeleteForm($id);
        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isValid()) {
            $em->flush();

            return $this->redirect($this->generateUrl('app_taxon_edit', array('id' => $id)));
        }

        return $this->render('AppBundle:Taxon:edit.html.twig', array(
            'entity'      => $entity,
            'edit_form'   => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }
    /**
     * Deletes a Taxon entity.
     *
     */
    public function deleteAction(Request $request, $id)
    {
        $form = $this->createDeleteForm($id);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $entity = $em->getRepository('AppBundle:Taxon')->find($id);

            if (!$entity) {
                throw $this->createNotFoundException('Unable to find Taxon entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('app_taxon'));
    }

    /**
     * Creates a form to delete a Taxon entity by id.
     *
     * @param mixed $id The entity id
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm($id)
    {
        return $this->createFormBuilder()
            ->setAction($this->generateUrl('app_taxon_delete', array('id' => $id)))
            ->setMethod('DELETE')
            ->add('submit', 'submit', array('label' => 'Delete'))
            ->getForm()
        ;
    }
}
