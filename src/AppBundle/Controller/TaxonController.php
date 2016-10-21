<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use AppBundle\Entity\Taxon;
use AppBundle\Form\TaxonType;

/**
 * Taxon controller.
 *
 * @Route("/taxon")
 */
class TaxonController extends Controller
{
    /**
     * Lists all Taxon entities.
     *
     * @Route("/", name="app_taxon")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:Taxon')->findAll();

        return $this->render('Taxon/index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new Taxon entity.
     *
     * @Route("/create", name="app_taxon_create")
     * @Method({"POST"})
     */
    public function createAction(Request $request)
    {
        $entity = new Taxon();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('app_taxon_show', array('id' => $entity->getId())));
        }

        return $this->render('Taxon/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
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
     * @Route("/new", name="app_taxon_new")
     */
    public function newAction()
    {
        $entity = new Taxon();
        $form = $this->createCreateForm($entity);

        return $this->render('Taxon/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Finds and displays a Taxon entity.
     *
     * @Route("/{slug}", name="app_taxon_show")
     */
    public function showAction($slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Taxon')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Taxon entity.');
        }

        $ctx = $this->_getTaxonContext($entity);

        return $this->render('Taxon/show.html.twig', array(
            'entity' => $entity,
            'isdomain' => $ctx['isdomain'],
            'ancestors' => $ctx['ancestors'],
            'indomain' => $ctx['indomain'],
                   ));
    }

    /**
     * Displays a form to edit an existing Taxon entity.
     *
     * @Route("/{slug}/edit", name="app_taxon_edit")
     */
    public function editAction($slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Taxon')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Taxon entity.');
        }

        $ctx = $this->_getTaxonContext($entity);

        $editForm = $this->createEditForm($entity);

        return $this->render('Taxon/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'isdomain' => $ctx['isdomain'],
            'ancestors' => $ctx['ancestors'],
            'indomain' => $ctx['indomain'],
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
            'action' => $this->generateUrl('app_taxon_update', array('slug' => $entity->getSlug())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }
    /**
     * Edits an existing Taxon entity.
     *
     * @Route("/{slug}/update", name="app_taxon_update")
     * @Method({"PUT", "POST"})
     */
    public function updateAction(Request $request, $slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Taxon')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Taxon entity.');
        }

        $deleteForm = $this->createDeleteForm($entity->getId());
        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted()) {
            $em->flush();

            return $this->redirect($this->generateUrl('app_taxon_edit', array('slug' => $slug)));
        }

        return $this->render('Taxon/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Deletes a Taxon entity.
     *
     * @Route("/{slug}/delete", name="app_taxon_delete")
     */
    public function deleteAction(Request $request, $slug)
    {
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('AppBundle:Taxon')
                ->findOneBy(array('slug' => $slug));

        $form = $this->createDeleteForm($entity->getId());
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
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

    private function _getTaxonContext($taxon)
    {
        if ($taxon->getDomain() == null) {
            $isdomain = false;
            $ancestors = $this->_getAncestors($taxon);
            $indomain = $this->_getDomainContext($ancestors);
        } else {
            $isdomain = true;
            $ancestors = null;
            $indomain = $taxon->getDomain();
        }

        return [
            'isdomain' => $isdomain,
            'ancestors' => $ancestors,
            'indomain' => $indomain,
            ];
    }

    private function _getAncestors($taxon)
    {
        $ancestors = array();
        do {
            $ancestors[] = $taxon->getParentTaxon();
            $taxon = $taxon->getParentTaxon();
        } while ($taxon->getDomain() == null);

        return array_reverse($ancestors);
    }

    private function _getDomainContext($ancestors)
    {
        $first_taxon = $ancestors[0];

        return $first_taxon->getDomain();
    }

    /**
     * Sluggify existing entities.
     */
    public function sluggifyAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:Taxon')->findAll();

        foreach ($entities as $entity) {
            $name = $entity->getDisplayName();
            $curslug = $entity->getSlug();
            if ($curslug == null) {
                $entity->setSlug($name);
                $em->persist($entity);
                $em->flush();
            }
        }

        return $this->render('Taxon/index.html.twig', array(
            'entities' => $entities,
        ));
    }
}
