<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;


/**
 * Handles individual entity (interaction and taxon) show pages.
 *
 * @Route("/")
 */
class ShowEntityController extends Controller
{
/*------------------------------ CREATE --------------------------------------*/

    /**
     * Oopens the Interaction show page.
     *
     * @Route("interaction/{id}", name="app_interaction_show")
     */
    public function showInteractionAction($id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('AppBundle:Interaction')
                ->findOneBy(['id' => $id]);

        if (!$entity) {
            throw $this->createNotFoundException("Unable to find Interaction [$id].");
        }

        return $this->render('Entity/interaction.html.twig', array('entity' => $entity));
    }
}