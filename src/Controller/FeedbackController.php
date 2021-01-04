<?php

namespace App\Controller;

use App\Entity\Feedback;
use App\Form\FeedbackType;
use App\Service\TrackEntityUpdate;

use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Feedback controller.
 */
class FeedbackController extends AbstractController
{
    protected $requestStack;
    private $tracker;

    public function __construct(RequestStack $requestStack, TrackEntityUpdate $tracker)
    {
        $this->requestStack = $requestStack;
        $this->tracker = $tracker;
    }

    /**
     * Lists all Feedback entities.
     *
     * @Route("/feedback", name="app_feedback", methods={"GET"})
     */
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('App:Feedback')->findAll();

        return $this->render('Feedback/index.html.twig', array(
            'entities' => $entities,
        ));
    }

    /**
     * Ajax action to create a new Feedback entity.
     *
     * @Route("/feedback/post", name="app_feedback_post", methods={"POST"})
     */
    public function postAction()
    {
        $request = $this->requestStack->getCurrentRequest();
        $requestContent = $request->getContent();
        $feedbackData = json_decode($requestContent);
        $route = $feedbackData->route;
        $topic = $feedbackData->topic;
        $content = $feedbackData->feedback;

        $entity = new Feedback();
        $entity->setTopic($topic);
        $entity->setContent($content);
        $entity->setRoute($route);
        $entity->setStatus(3);  //Index for:['Closed', 'Follow-Up', 'Read', 'Unread']

        $em = $this->getDoctrine()->getManager();
        $em->persist($entity);
        $em->flush();

        // $this->tracker->trackEntityUpdate('Feedback');

        $response = new JsonResponse();
        $response->setData(array(
            'feedback' => $feedbackData,
        ));

        return $response;
    }

    /**
     * Ajax action to retrieve all data for a Feedback entity.
     *
     * @Route("/feedback/update/{id}", name="app_feedback_update", methods={"POST"})
     */
    public function updateAction($id)
    {
        $request = $this->requestStack->getCurrentRequest();
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('App:Feedback')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Feedback entity.');
        }

        $requestContent = $request->getContent();
        $feedbackData = json_decode($requestContent);
        $assignedUserId = $feedbackData->assignedUserId;
        $adminNotes = $feedbackData->adminNotes;
        $status = $feedbackData->status;

        $asgnUser = $em->getRepository('App:User')->find($assignedUserId);

        $entity->setAssignedUser($asgnUser);
        $entity->setAdminNotes($adminNotes);
        $entity->setStatus($status);

        $em->persist($entity);
        $em->flush();

        $this->tracker->trackEntityUpdate('Feedback');

        $response = new JsonResponse();
        $response->setData(array(
            'feedback' => $feedbackData,
        ));

        return $response;
    }

    /**
     * Ajax action to retrieve all data for a Feedback entity.
     *
     * @Route("/feedback/load/{id}", name="app_feedback_load", methods={"POST"})
     */
    public function loadAction($id)
    {
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('App:Feedback')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Feedback entity.');
        }

        $response = new JsonResponse();
        $response->setData([
            'feedback' => [
                    'id' => $entity->getId(),
                    'from' => $this->getUserData($entity->getCreatedBy()),
                    'topic' => $entity->getTopic(),
                    'content' => $entity->getContent(),
                    'submitted' => $entity->getCreated(),
                    'status' => $entity->getStatus(),
                    'notes' => $entity->getAdminNotes(),
                    'assigned' => $this->getUserData($entity->getAssignedUser()),
                    'users' => $this->getAdminData($em),
            ]
        ]);
        return $response;
    }
    private function getUserData($user)
    {
        return is_null($user) ? ['email' => null, 'name' => null, 'id' => null]
            : [ 'email' => $user->getEmail(),
                'name' => $user->getFirstName().' '.$user->getLastName(),
                'id' => $user->getId()];
    }
    private function getAdminData($em)
    {
        $adminUsers = $em->getRepository('App:User')->findAdmins();
        $users = [];
        foreach ($adminUsers as $user) {
            array_push($users, $this->getUserData($user));
        }
        return $users;
    }

    /**
     * Deletes a Feedback entity.
     *
     * @Route("/{id}", name="feedback_delete", methods={"DELETE"})
     */
    public function deleteAction($id)
    {
        $request = $this->requestStack->getCurrentRequest();
        $form = $this->createDeleteForm($id);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $entity = $em->getRepository('App:Feedback')->find($id);

            if (!$entity) {
                throw $this->createNotFoundException('Unable to find Feedback entity.');
            }

            $em->remove($entity);
            $em->flush();
        }

        return $this->redirect($this->generateUrl('feedback'));
    }

    /**
     * Creates a form to delete a Feedback entity by id.
     *
     * @param mixed $id The entity id
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm($id)
    {
        return $this->createFormBuilder()
            ->setAction($this->generateUrl('feedback_delete', array('id' => $id)))
            ->setMethod('DELETE')
            ->add('submit', 'submit', array('label' => 'Delete'))
            ->getForm()
        ;
    }
}
