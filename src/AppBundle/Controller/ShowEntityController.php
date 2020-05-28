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

    private $em;



    private function getEntity($className, $val, $prop = 'id')
    {
        return $this->em->getRepository('AppBundle:'.$className)
            ->findOneBy([$prop => $val]);
    }
/* ----------------------------- INTERACTION -------------------------------- */
    /**
     * Oopens the Interaction show page.
     *
     * @Route("interaction/{id}", name="app_interaction_show")
     */
    public function showInteractionAction($id)
    {
        $this->em = $this->getDoctrine()->getManager();

        $interaction = $this->getEntity('Interaction', $id);

        if (!$interaction) {
            throw $this->createNotFoundException("Unable to find Interaction [$id].");
        }

        $citation = $this->getCitation($interaction->getSource());

        return $this->render('Entity/interaction.html.twig', array(
            'interaction' => $interaction, 'citation' => $citation 
        ));
    }
    private function getCitation($source)
    {
        $citationDetails = $source->getCitation();
        return [
            'fullText' => $citationDetails->getFullText(),
            'abstract' => $citationDetails->getAbstract(),
            'authors' => $source->getAuthorNames(),
            'title' => $citationDetails->getTitle()
        ];
    }
}