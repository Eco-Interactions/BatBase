<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use AppBundle\Entity\ContentBlock;
use AppBundle\Form\ContentBlockType;

/**
 * Content Block controller.
 *
 * @Route("/")
 */
class ContentBlockController extends Controller
{
    /**
     * Lists all Content Block entities.
     *
     * @Route("/admin/contentblock", name="admin_content_block")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:ContentBlock')->findAll();

        return $this->render('contentblock/index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new Content Block entity.
     *
     * @Route("admin/contentblock/create", name="admin_content_block_create")
     * @Method({"POST"})
     */
    public function createAction(Request $request)
    {
        $entity = new ContentBlock();
        $form = $this->createCreateForm($entity);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->redirect($this->generateUrl('admin_content_block_show', array('slug' => $entity->getSlug())));
        }

        return $this->render('contentblock/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Creates a form to create a Content Block entity.
     *
     * @param ContentBlock $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createCreateForm(ContentBlock $entity)
    {
        $form = $this->createForm(new ContentBlockType(), $entity, array(
            'action' => $this->generateUrl('admin_content_block_create'),
            'method' => 'POST',
        ));

        $form->add('submit', 'submit', array('label' => 'Create'));

        return $form;
    }

    /**
     * Displays a form to create a new ContentBlock entity.
     *
     * @Route("admin/contentblock/new", name="admin_content_block_new")
     */
    public function newAction()
    {
        $entity = new ContentBlock();
        $form = $this->createCreateForm($entity);

        return $this->render('contentblock/new.html.twig', array(
            'entity' => $entity,
            'form' => $form->createView(),
        ));
    }

    /**
     * Finds and displays a Content Block entity.
     *
     * @Route("admin/contentblock/{slug}", name="admin_content_block_show")
     */
    public function showAction($slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:ContentBlock')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Content Block entity.');
        }

        return $this->render('contentblock/show.html.twig', array(
            'entity' => $entity,        ));
    }

    /**
     * Displays a form to edit an existing Content Block entity.
     *
     * @Route("/admin/contentblock/{slug}/edit", name="admin_content_block_edit")
     */
    public function editAction($slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:ContentBlock')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Content Block entity.');
        }

        $editForm = $this->createEditForm($entity);
        $deleteForm = $this->createDeleteForm($entity->getId());

        return $this->render('contentblock/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Creates a form to edit a Content Block entity.
     *
     * @param ContentBlock $entity The entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createEditForm(ContentBlock $entity)
    {
        $form = $this->createForm(new ContentBlockType(), $entity, array(
            'action' => $this->generateUrl('admin_content_block_update', array('slug' => $entity->getSlug())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }
    /**
     * Edits an existing Content Block entity.
     *
     * @Route("/admin/contentblock/{slug}/update", name="admin_content_block_update")
     * @Method({"PUT", "POST"})
     */
    public function updateAction(Request $request, $slug)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:ContentBlock')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Content Block entity.');
        }

        $deleteForm = $this->createDeleteForm($entity->getId());
        $editForm = $this->createEditForm($entity);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted()) {
            $em->flush();

            return $this->redirect($this->generateUrl('admin_content_block_edit', array('slug' => $slug)));
        }

        return $this->render('contentblock/edit.html.twig', array(
            'entity' => $entity,
            'edit_form' => $editForm->createView(),
            'delete_form' => $deleteForm->createView(),
        ));
    }
    /**
     * Deletes a Content Block entity.
     *
     * @Route("/admin/contentblock/{slug}/delete", name="admin_content_block_delete")
     */
    public function deleteAction(Request $request, $slug)
    {
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('AppBundle:ContentBlock')
            ->findOneBy(array('slug' => $slug));

        $form = $this->createDeleteForm($entity->getId());
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            if (!$entity) {
                throw $this->createNotFoundException('Unable to find Content Block entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('admin_content_block'));
    }

    /**
     * Creates a form to delete a Content Block entity by id.
     *
     * @param mixed $id The entity id
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm($id)
    {
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('AppBundle:ContentBlock')->find($id);
        $slug = $entity->getSlug();

        return $this->createFormBuilder()
            ->setAction($this->generateUrl('admin_content_block_delete', array('slug' => $slug)))
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

        $entities = $em->getRepository('AppBundle:ContentBlock')->findAll();

        foreach ($entities as $entity) {
            $name = $entity->getName();
            $entity->setSlug($name);
            $em->persist($entity);
            $em->flush();
        }

        return $this->render('contentblock/index.html.twig', array(
            'entities' => $entities,
        ));
    }

    /**
     * Finds and displays Definition page content blocks.
     *
     * @Route("/", name="app_home")
     */
    public function homeAction()
    {
        $em = $this->getDoctrine()->getManager();

        $repo = $em->getRepository('AppBundle:ContentBlock');

        $firstcol = $repo->findOneBy(array('slug' => 'home-pg-intro'));
        $secondcol = $repo->findOneBy(array('slug' => 'home-pg-second-col'));
        $memberwelcome = $repo->findOneBy(array('slug' => 'home-member-welcome'));

        return $this->render('contentblock/home.html.twig', array(
            'introduction' => $firstcol,
            'memberWelcome' => $memberwelcome,
            'secondColBlock' => $secondcol,
             )
        );
    }

    /**
     * Finds and displays about page content blocks.
     *
     * @Route("/about", name="app_about")
     */
    public function aboutAction()
    {
        $em = $this->getDoctrine()->getManager();

        $repo = $em->getRepository('AppBundle:ContentBlock');
        $contentBlocks = $repo->findByPage("about");

        $returnData = $this->getPageBlocks($contentBlocks);

        return $this->render('contentblock/about.html.twig', array(
                "entities" => $returnData,
            )
        );
    }

    /**
     * Finds and displays Definition page content blocks.
     *
     * @Route("definitions", name="app_definitions")
     */
    public function definitionsAction()
    {
        $em = $this->getDoctrine()->getManager();

        $repo = $em->getRepository('AppBundle:ContentBlock');
        $contentBlocks = $repo->findByPage("definitions");

        $returnData = $this->getPageBlocks($contentBlocks);

        return $this->render('contentblock/definitions.html.twig', array(
            'entities' => $returnData,
            )
        );
    }

    /**
     * Finds and displays Source page content blocks.
     *
     * @Route("/sources", name="app_sources")
     */
    public function sourcesAction()
    {
        $em = $this->getDoctrine()->getManager();

        $repo = $em->getRepository('AppBundle:ContentBlock');

        $contentblock = $repo->findOneBy(array('slug' => 'sources-main'));

        return $this->render('contentblock/sources.html.twig', array(
            "entities" => $contentblock
            )
        );
    }

    /**
     * Finds and displays about page content blocks.
     *
     * @Route("/db", name="app_db_top")
     */
    public function dbAction()
    {
        $em = $this->getDoctrine()->getManager();

        $repo = $em->getRepository('AppBundle:ContentBlock');
        $contentBlocks = $repo->findByPage("about-db");

        $returnData = $this->getPageBlocks($contentBlocks);

        return $this->render('contentblock/db_top.html.twig', array(
            'entities' => $returnData,
            )
        );
    }


    /**
     * Finds and displays the future developments page content blocks.
     *
     * @Route("/future-developments", name="app_future_dev")
     */
    public function futureDevelopmentsAction()
    {
        $em = $this->getDoctrine()->getManager();

        $repo = $em->getRepository('AppBundle:ContentBlock');

        $futureDev = $repo->findOneBy(array('slug' => 'future-developments'));
        // $tuli = $repo->findOneBy(array('slug' => 'team-pg-tuli-bio'));
        // $taylor = $repo->findOneBy(array('slug' => 'team-pg-taylor-bio'));
        // $sarah = $repo->findOneBy(array('slug' => 'team-pg-sarah-bio'));

        return $this->render('contentblock/future_dev.html.twig', array(
            'futureDev' => $futureDev,
            )
        );
    }

    /**
     * Finds and displays Definition page content blocks.
     *
     * @Route("/search", name="app_search")
     */
    public function searchAction()
    {
        $em = $this->getDoctrine()->getManager();

        $repo = $em->getRepository('AppBundle:ContentBlock');

        // $firstcol = $repo->findOneBy(array('slug' => 'home-pg-intro'));

        return $this->render('contentblock/search.html.twig', array(
            // 'introduction' => $firstcol,
            // 'memberWelcome' => $memberwelcome,
            // 'secondColBlock' => $secondcol,
             )
        );
    }
    /** Returns an associative array of the content blocks relevant data for a page. */
    public function getPageBlocks($contentBlocks)
    {
        $returnData = [];

        foreach ($contentBlocks as $block) {
            $name = $block->getSlug();
            $content = $block->getContent();
            $returnData = array_merge($returnData, array($name => $content));
        }

        return $returnData;
    }
    // /**
    //  * Finds and displays team page content blocks.
    //  *
    //  * @Route("/team", name="app_team")
    //  */
    // public function teamAction()
    // {
    //     $em = $this->getDoctrine()->getManager();

    //     $repo = $em->getRepository('AppBundle:ContentBlock');

    //     $cullen = $repo->findOneBy(array('slug' => 'team-pg-cullen-bio'));
    //     $tuli = $repo->findOneBy(array('slug' => 'team-pg-tuli-bio'));
    //     $taylor = $repo->findOneBy(array('slug' => 'team-pg-taylor-bio'));
    //     $sarah = $repo->findOneBy(array('slug' => 'team-pg-sarah-bio'));

    //     return $this->render('contentblock/team.html.twig', array(
    //         'cullenBio' => $cullen,
    //         'tuliBio' => $tuli,
    //         'taylorBio' => $taylor,
    //         'sarahBio' => $sarah,
    //         )
    //     );
    // }
}
