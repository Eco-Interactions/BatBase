<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 * Admin controller.
 *
 * @Route("/admin")
 */
class AdminController extends Controller
{
    /**
     * Lists all Domain entities and an Admin interface.
     *
     * @Route("/", name="app_admin")
     */
    public function indexAction()
    {
        $is_admin = $this->get('security.context')->isGranted('ROLE_ADMIN');

        return $this->render('AppBundle:Admin:index.html.twig', array(
            'is_admin' => $is_admin,
        ));
    }
}
