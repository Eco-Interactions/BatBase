<?php

namespace AppBundle\Controller;

use AppBundle\Form\FileUploadType;
use AppBundle\Entity\FileUpload;
// use AppBundle\Form\ImageUploadType;  NOT USED CURRENTLY. DON'T DELETE.
// use AppBundle\Entity\ImageUpload;   NOT USED CURRENTLY. DON'T DELETE.
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
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
class FileUploadController extends Controller
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
            $fileName = $safeFilename.'-'.uniqid().'.'.$file->guessExtension();

            // Move the file to the directory where publication PDFs are stored
            try {
                $file->move(
                    $this->getParameter('publication_file_dir'),
                    $fileName
                );
            } catch (FileException $e) { 
                return $this->render('Uploads/submit_file.html.twig', [
                    'form' => $form->createView(),
                    'success' => false,
                    'error' => $e->getMessage()
                ]);
            }
            // stores the PDF file name instead of its contents
            $entity->setFileName($fileName);
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
        $entity = $em->getRepository('AppBundle:FileUpload')->find($id);
        
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
        $entity = $em->getRepository('AppBundle:FileUpload')->find($id);
        
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
