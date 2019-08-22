<?php

namespace AppBundle\Controller;

use AppBundle\Form\FileUploadType;
use AppBundle\Entity\FileUpload;
use AppBundle\Form\ImageUploadType;
use AppBundle\Entity\ImageUpload;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
// use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
// use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
// use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Image Upload controller.
 *
 * @Route("/upload")
 */
class FileUploadController extends Controller
{
    /** ==================== FILE UPLOADS =================================== */
    /**
     * Lists all Image Upload entities.
     *
     * @Route("/", name="app_file_upload_list")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('AppBundle:FileUpload')->findAll();

        return $this->render('Uploads/pdf_submissions.html.twig', array(
            'entities' => $entities,
        ));
    }

    /**
     * @Route("/publication", name="app_submit_pub")
     */
    public function newAction(Request $request)
    {
        $entity = new FileUpload();
        $form = $this->createForm('AppBundle\Form\FileUploadType', $entity);
        $form->add('submit', SubmitType::class, array('label' => 'Submit'));

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            /** @var UploadedFile $file */
            $file = $form['file']->getData();
            
            $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            // this is needed to safely include the file name as part of the URL
            $safeFilename = transliterator_transliterate('Any-Latin; Latin-ASCII; [^A-Za-z0-9_] remove; Lower()', $originalFilename);
            $newFilename = $safeFilename.'-'.uniqid().'.'.$file->guessExtension();

            // Move the file to the directory where publication PDFs are stored
            try {
                $file->move(
                    $this->getParameter('publication_file_dir'),
                    $newFilename
                );
            } catch (FileException $e) {
                $data = [
                    'type' => 'validation_error',
                    'title' => 'There was an error uploading the PDF. If this persists, please <a href="mailto:info@batplant.com">Email Us</a>.',
                    'errors' => $e->getMessage()
                ];
                return $this->render('Uploads/submit_file.html.twig', [
                    'form' => $form->createView(),
                    'success' => 'error',
                    'error' => $data
                ]);
            }
            // stores the PDF file name instead of its contents
            $entity->setFileName($newFilename);
            $entity->setPath($this->getParameter('publication_file_dir'));
            $entity->setMimeType('application/pdf');
            $entity->setStatus();
            $entity->setSize($file->getClientSize());
            
            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->render('Uploads/submit_file.html.twig', [
                'form' => $form->createView(),
                'success' => true,
            ]);
        }
        return $this->render('Uploads/submit_file.html.twig', [
            'form' => $form->createView(),
            'success' => null
        ]);
    }

    /** ==================== IMAGE UPLOADS ================================== */
    // /**
    //  * Lists all Image Upload entities.
    //  *
    //  * @Route("/", name="app_image_upload")
    //  */
    // public function indexAction()
    // {
    //     $em = $this->getDoctrine()->getManager();

    //     $entities = $em->getRepository('AppBundle:ImageUpload')->findAll();

    //     return $this->render('ImageUpload/index.html.twig', array(
    //         'entities' => $entities,
    //     ));
    // }
    // /**
    //  * Creates a new Image Upload entity.
    //  *
    //  * @Route("/create", name="app_image_upload_create")
    //  * @Method({"POST"})
    //  */
    // public function createAction(Request $request)
    // {
    //     $entity = new ImageUpload();
    //     $form = $this->createCreateForm($entity);
    //     $form->handleRequest($request);

    //     if ($form->isSubmitted()) {
    //         $em = $this->getDoctrine()->getManager();
    //         if ($entity->upload()) {
    //             $em->persist($entity);
    //             $em->flush();
    //         }

    //         return $this->redirect($this->generateUrl('app_image_upload'));
    //     }

    //     return $this->render('ImageUpload/new.html.twig', array(
    //         'entity' => $entity,
    //         'form' => $form->createView(),
    //     ));
    // }

    // /**
    //  * Creates a form to create a Image Upload entity.
    //  *
    //  * @param ImageUpload $entity The entity
    //  *
    //  * @return \Symfony\Component\Form\Form The form
    //  */
    // private function createCreateForm(ImageUpload $entity)
    // {
    //     $form = $this->createForm(new ImageUploadType(), $entity, array(
    //         'action' => $this->generateUrl('app_image_upload_create'),
    //         'method' => 'POST',
    //     ));

    //     $form->add('submit', 'submit', array('label' => 'Create'));

    //     return $form;
    // }

    // /**
    //  * Displays a form to create a new ImageUpload entity.
    //  *
    //  * @Route("/new", name="app_image_upload_new")
    //  */
    // public function newAction()
    // {
    //     $entity = new ImageUpload();
    //     $form = $this->createCreateForm($entity);

    //     return $this->render('ImageUpload/new.html.twig', array(
    //         'entity' => $entity,
    //         'form' => $form->createView(),
    //     ));
    // }

    // *
    //  * Displays a form to edit an existing Image Upload entity.
    //  *
    //  * @Route("/{id}/edit", name="app_image_upload_edit")
     
    // public function editAction($id)
    // {
    //     $em = $this->getDoctrine()->getManager();

    //     $entity = $em->getRepository('AppBundle:ImageUpload')->find($id);

    //     if (!$entity) {
    //         throw $this->createNotFoundException('Unable to find Image Upload entity.');
    //     }

    //     $editForm = $this->createEditForm($entity);

    //     return $this->render('ImageUpload/edit.html.twig', array(
    //         'entity' => $entity,
    //         'edit_form' => $editForm->createView(),
    //     ));
    // }

    // /**
    //  * Creates a form to edit a Image Upload entity.
    //  *
    //  * @param ImageUpload $entity The entity
    //  *
    //  * @return \Symfony\Component\Form\Form The form
    //  */
    // private function createEditForm(ImageUpload $entity)
    // {
    //     $form = $this->createForm(new ImageUploadType(), $entity, array(
    //         'action' => $this->generateUrl('app_image_upload_update', array('id' => $entity->getId())),
    //         'method' => 'PUT',
    //     ));

    //     $form->add('submit', 'submit', array('label' => 'Update'));

    //     return $form;
    // }
    // /**
    //  * Edits an existing Image Upload entity.
    //  *
    //  * @Route("/{id}/update", name="app_image_upload_update")
    //  * @Method({"PUT", "POST"})
    //  */
    // public function updateAction(Request $request, $id)
    // {
    //     $em = $this->getDoctrine()->getManager();

    //     $entity = $em->getRepository('AppBundle:ImageUpload')->find($id);

    //     if (!$entity) {
    //         throw $this->createNotFoundException('Unable to find Image Upload entity.');
    //     }

    //     $editForm = $this->createEditForm($entity);
    //     $editForm->handleRequest($request);

    //     if ($editForm->isSubmitted()) {
    //         $entity->upload();
    //         $em->flush();

    //         return $this->redirect($this->generateUrl('app_image_upload_edit', array('id' => $id)));
    //     }

    //     return $this->render('ImageUpload/edit.html.twig', array(
    //         'entity' => $entity,
    //         'edit_form' => $editForm->createView(),
    //     ));
    // }
}
