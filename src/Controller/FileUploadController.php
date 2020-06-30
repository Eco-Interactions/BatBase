<?php

namespace App\Controller;

use App\Form\FileUploadType;
use App\Entity\FileUpload;
// use App\Form\ImageUploadType;  NOT USED CURRENTLY. DON'T DELETE.
// use App\Entity\ImageUpload;   NOT USED CURRENTLY. DON'T DELETE.
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Security;
/**
 * Image Upload controller.
 *
 * @Route("/upload")
 */
class FileUploadController extends AbstractController
{
    /**
     * @var Security
     */
    private $security;

    public function __construct(Security $security)
    {
       $this->security = $security;
    }
    /** ==================== FILE UPLOADS =================================== */
    /**
     * Lists all Image Upload entities.
     *
     * @Route("/view-pdfs", name="app_file_upload_list")
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('App:FileUpload')->findAll();

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
        $form = $this->createForm('App\Form\FileUploadType', $entity);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            
            $entity->setMimeType($entity->getPdfFile()->getMimeType());
            $entity->setPath("uploads/publication/");
            $entity->setStatus();

            $em = $this->getDoctrine()->getManager();
            $em->persist($entity);
            $em->flush();

            return $this->render('Uploads/submit_file.html.twig', [
                'form' => $form->createView(),
                'success' => true,
                'error' =>  false
            ]);
        }
        return $this->render('Uploads/submit_file.html.twig', [
            'form' => $form->createView(),
            'success' => null,
            'error' => null
        ]);
    }

    /**
     * Deletes a File.
     *
     * @Route("/pub/{id}/delete", name="app_delete_pub")
     */
    public function deleteAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('App:FileUpload')->find($id);
        
        if (!$entity) {
            throw $this->createNotFoundException('Unable to find File Upload entity.');
        }

        $em->remove($entity);
        $em->flush();
        
        return new Response();
    }

    /**
     * Updates the file. This tracks who viewed the pdf last.
     *
     * @Route("/pub/{id}/update", name="app_update_pub")
     */
    public function updateAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('App:FileUpload')->find($id);
        
        if (!$entity) {
            throw $this->createNotFoundException('Unable to find File Upload entity.');
        }
        $user = $this->security->getUser(); 
        $entity->setUpdatedBy($user);
        $entity->setUpdated(new \DateTime('now'));
        $em->persist($entity);
        $em->flush();
        
        $userName = $user->getFirstName() . ' ' . substr($user->getLastName(), 0, 1);
        $response = new JsonResponse();
        $response->setData($userName);
        return $response;
    }
}
