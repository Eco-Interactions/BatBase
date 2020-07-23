<?php

namespace App\Controller;

use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;

/**
 * Admin controller.
 *
 * @Route("/super")
 */
class SuperAdminController extends AbstractController
{
    /**
     * Lists all users active online in the last 24 hours.
     *
     * @Route("/online-users", name="super_user_online")
     */
    public function onlineAction()
    {
        $em = $this->getDoctrine()->getManager();

        $entities = $em->getRepository('App:User')->findOnlineNow();

        return $this->render('Admin/super/online.html.twig', array(
            'entities' => $entities,
        ));
    }
}