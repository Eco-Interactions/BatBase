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

        $citation = $this->getCitationData($interaction->getSource());
        $location = $this->getLocationData($interaction->getLocation());

        return $this->render('Entity/interaction.html.twig', array(
            'interaction' => $interaction, 'citation' => $citation , 'loc' => $location
        ));
    }
    private function getCitationData($source)
    {
        $citationDetails = $source->getCitation();
        return [
            'abstract' => $citationDetails->getAbstract(),
            'authors' => $source->getAuthorNames(),
            'fullText' => $citationDetails->getFullText(),
            'title' => $citationDetails->getTitle()
        ];
    }
    private function getLocationData($location)
    {
        $name = $location->getDisplayName();
        $country = $location->getCountryData()['displayName'];
        $region = $location->getRegionData()['displayName'];
        $habitat = $location->getHabitatTypeData()['displayName'];
        $isCountryOrRegionHabType = $name == $name . '- ' . $habitat &&
            ($name == $country || $name == $region);  print('isCountryOrRegionHabType = ['.$isCountryOrRegionHabType."]\n");

        return [
            'description' => $location->getDescription(),
            'elev' => $location->getElevation(),
            'elevMax' => $location->getElevationMax(),
            'country' => $isCountryOrRegionHabType ? null : $country,
            'habitat' => $habitat,
            'isCountryOrRegionHabType' => $isCountryOrRegionHabType,
            'lat' => $location->getLatitude(),
            'lng' => $location->getLongitude(),
            'name' => $name,
            'region' => $isCountryOrRegionHabType ? null : $region,
            'type' => $location->getLocationTypeData()['displayName'],
        ];
    }
}