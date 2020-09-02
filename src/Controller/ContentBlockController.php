<?php

namespace App\Controller;

use App\Entity\ContentBlock;
use App\Form\ContentBlockType;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityManagerInterface;


/**
 * Content Block controller.
 *
 * @Route("/")
 */
class ContentBlockController extends AbstractController
{
    /** ---------------- SHOW PAGE ACTIONS ---------------------------------- */
    /** Returns an associative array of the content blocks relevant data for a page. */
    private function getPageBlocks($contentBlocks)
    {
        $returnData = [];

        foreach ($contentBlocks as $block) {
            $name = $block->getSlug();
            $content = $block->getContent();
            $returnData = array_merge($returnData, array($name => $content));
        }

        return $returnData;
    }
    /**
     * Finds and displays Definition page content blocks.
     *
     * @Route("/", name="app_home")
     */
    public function homeAction()
    {
        $em = $this->getDoctrine()->getManager();

        $repo = $em->getRepository('App:ContentBlock');
        $contentBlocks = $repo->findByPage("home");

        $returnData = $this->getPageBlocks($contentBlocks);

        return $this->render('ContentBlock/home.html.twig', array(
            'entities' => $returnData
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

        $repo = $em->getRepository('App:ContentBlock');
        $contentBlocks = $repo->findByPage("about");

        $returnData = $this->getPageBlocks($contentBlocks);


        return $this->render('ContentBlock/about.html.twig', array(
                "entities" => $returnData,
            )
        );
    }

    /**
     * Finds and displays a bibliography of all citations in the database.
     *
     * @Route("bibliography", name="app_biblio")
     */
    public function bibilographyAction()
    {
        $em = $this->getDoctrine()->getManager();
        $citations = $em->getRepository('App:Citation')->findAll();

        usort($citations, function($a, $b)
        {
            return strcmp($a->getFullText(), $b->getFullText());
        });

        return $this->render('Bibliography/biblio.html.twig',
            ['citations' => $citations]);
    }

    /**
     * Finds and displays Definition page content blocks.
     *
     * @Route("definitions", name="app_definitions")
     */
    public function definitionsAction()
    {
        $em = $this->getDoctrine()->getManager();

        $repo = $em->getRepository('App:ContentBlock');
        $contentBlocks = $repo->findByPage("definitions");

        $returnData = $this->getPageBlocks($contentBlocks);

        return $this->render('ContentBlock/definitions.html.twig', array(
            'entities' => $returnData,
            )
        );
    }

    /**
     * Finds and displays Search Page content blocks.
     *
     * @Route("/search", name="app_search_show")
     */
    public function searchAction()
    {
        $em = $this->getDoctrine()->getManager();

        // $repo = $em->getRepository('App:ContentBlock');

        return $this->render('ContentBlock/search/search.html.twig', array());
    }

    /**
     * Finds and displays Source page content blocks.
     *
     * @Route("/sources", name="app_sources")
     */
    public function sourcesAction()
    {
        $em = $this->getDoctrine()->getManager();

        $repo = $em->getRepository('App:ContentBlock');
        $contentBlocks = $repo->findByPage("sources");

        $returnData = $this->getPageBlocks($contentBlocks);


        return $this->render('ContentBlock/sources.html.twig', array(
            "entities" => $returnData,
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

        $repo = $em->getRepository('App:ContentBlock');
        $contentBlocks = $repo->findByPage("about-db");

        $returnData = $this->getPageBlocks($contentBlocks);

        return $this->render('ContentBlock/db_top.html.twig', array(
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

        $repo = $em->getRepository('App:ContentBlock');
        $contentBlocks = $repo->findByPage("future-developments");

        $returnData = $this->getPageBlocks($contentBlocks);

        return $this->render('ContentBlock/future_dev.html.twig', array(
            'entities' => $returnData,
            )
        );
    }

    /** ------------ CONTENT BLOCK ENTITY ACTIONS --------------------------- */

    /**
     * Lists all Content Block entities.
     *
     * @Route("/admin/contentblock", name="admin_content_block")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('App:ContentBlock')->findBy(
            array(),
            array('name' => 'ASC')
        );

        return $this->render('ContentBlock/entity/index.html.twig', array(
            'entities' => $entities,
        ));
    }
    /**
     * Creates a new Content Block entity.
     *
     * @Route("admin/contentblock/create", name="admin_content_block_create", methods={"POST"})
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

        return $this->render('ContentBlock/entity/new.html.twig', array(
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
        $form = $this->createForm('App\Form\ContentBlockType', $entity, array(
            'action' => $this->generateUrl('admin_content_block_create'),
            'method' => 'POST',
        ));
        $form->add('submit', SubmitType::class, ['label' => 'Create']);

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

        return $this->render('ContentBlock/entity/new.html.twig', array(
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

        $entity = $em->getRepository('App:ContentBlock')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Content Block entity.');
        }

        return $this->render('ContentBlock/entity/show.html.twig', array(
            'entity' => $entity,        ));
    }

    /**
     * Displays a form to edit an existing Content Block entity.
     *
     * @Route("/admin/contentblock/{slug}/edit", name="admin_content_block_edit")
     */
    public function editAction(ContentBlock $block, Request $request, EntityManagerInterface $em)
    {
        // $entity = $em->getRepository('App:ContentBlock')
        //         ->findOneBy(array('slug' => $slug));
        $form = $this->createForm(ContentBlockType::class, $block);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            /** @var ContentBlock $block */
            $block = $form->getData();
            $em->persist($block);
            $em->flush();

            return $this->redirectToRoute('admin_content_block_show', [
                'slug' => $block->getSlug(),
            ]);
        }
        return $this->render('ContentBlock/entity/edit.html.twig', [
            'form' => $form->createView(),
            'contentblock' => $block
        ]);
    }
    /**
     * Edits an existing Content Block entity from the WYSIWYG editor.
     *
     * @Route(
     *      "/admin/contentblock/{slug}/update",
     *      name="admin_content_block_update",
     *      methods={"PUT", "POST"}
     * )
     */
    public function updateAction(Request $request, $slug)
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }

        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('App:ContentBlock')
                ->findOneBy(array('slug' => $slug));

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Content Block entity.');
        }

        $requestContent = $request->getContent();
        $pushedData = json_decode($requestContent);
        $content = $pushedData->content;

        $entity->setContent($content);
        $em->flush();

        $response = new JsonResponse();
        $response->setData(array(
            'contentblock' => "success",
        ));

        return $response;
    }

    /**
     * Deletes a Content Block entity.
     *
     * @Route("/admin/contentblock/{slug}/delete", name="admin_content_block_delete")
     */
    public function deleteAction(Request $request, $slug)
    {
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('App:ContentBlock')
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
        $entity = $em->getRepository('App:ContentBlock')->find($id);
        $slug = $entity->getSlug();

        return $this->createFormBuilder()
            ->setAction($this->generateUrl('admin_content_block_delete', array('slug' => $slug)))
            ->setMethod('DELETE')
            ->add('submit', SubmitType::class, array('label' => 'Delete'))
            ->getForm()
        ;
    }
}
