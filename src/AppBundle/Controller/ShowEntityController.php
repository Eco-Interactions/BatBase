<?php

namespace AppBundle\Controller;

use JMS\Serializer\SerializationContext;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

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
/* --------------- SERIALIZE --------------- */
    private function serializeEntity($entity)
    {
        $serializer = $this->container->get('jms_serializer');

        try {
            return $serializer->serialize($entity, 'json', 
                SerializationContext::create()->setGroups(array('flattened')));
        } catch (\Throwable $e) {
            return $this->logError($e);
        } catch (\Exception $e) {
            return $this->sendErrorResponse($e);
        }
    }
    private function logError($e)
    {                                                                           //print("\n\n### Error @ [".$e->getLine().'] = '.$e->getMessage()."\n".$e->getTraceAsString()."\n");
        $this->get('logger')->error("\n\n### Error @ [".$e->getLine().'] = '.$e->getMessage()."\n".$e->getTraceAsString()."\n");
    }
/* ----------------------------- INTERACTION -------------------------------- */
    /**
     * Opens the Interaction show page.
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

        $jsonEntity = $this->serializeEntity($interaction);

        return $this->render('Entity/interaction.html.twig', array(
            'id' => $id, 'int' => $jsonEntity
        ));
    }

}