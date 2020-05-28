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

        $cit = $this->getCitationData($interaction->getSource());
        $loc = $this->getLocationData($interaction->getLocation());
        $int = $this->getInteractionData($interaction);

        return $this->render('Entity/interaction.html.twig', array(
            'int' => $int, 'cit' => $cit , 'loc' => $loc
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
        $type = $location->getLocationTypeData()['displayName'];
        $habitat = $location->getHabitatTypeData()? 
            $location->getHabitatTypeData()['displayName'] : null;
        $isLocHabType = ($name == $name . '- ' . $habitat &&
            (strpos($name, $country) !== false || strpos($name, $region) !== false))
            || $type === 'habitat' ;   

        return [
            'description' => $location->getDescription(),
            'elev' => $location->getElevation(),
            'elevMax' => $location->getElevationMax(),
            'country' => $country,
            'habitat' => $habitat,
            'isCountryOrRegionHabType' => $isLocHabType,
            'habLocType' => $isLocHabType ? (strpos($name, $country) !== false ?
                'Country' : 'Region') : null,
            'lat' => $location->getLatitude(),
            'lng' => $location->getLongitude(),
            'name' => $name,
            'region' => $region,
            'type' => $location->getLocationTypeData()['displayName'],
        ];
    }
    private function getInteractionData($interaction)
    {
        return [
            'id' => $interaction->getId(),
            'note' => $interaction->getNote(),
            'object' => $interaction->getObject()->getDisplayName(),
            'oRealm' => $interaction->getObject()->getTaxonRealm()->getDisplayName(),
            'subject' => $interaction->getSubject()->getDisplayName(),
            'sRealm' => $interaction->getSubject()->getTaxonRealm()->getDisplayName(),
            'type' => $interaction->getInteractionTypeData()['displayName'],
            'tags' => $interaction->getTagNames(),
        ];
    }
}