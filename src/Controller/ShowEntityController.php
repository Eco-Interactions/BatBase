<?php

namespace App\Controller;

use JMS\Serializer\SerializerInterface;
use JMS\Serializer\SerializationContext;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Psr\Log\LoggerInterface;

/**
 * Handles individual entity (interaction and taxon) show pages.
 *
 * @Route("/")
 */
class ShowEntityController extends AbstractController
{

    private $em;
    private $serializer;
    private $logger;

    public function __construct(SerializerInterface $serializer, LoggerInterface $logger)
    {
        $this->serializer = $serializer;
        $this->logger = $logger;
    }

    private function getEntity($className, $val, $prop = 'id')
    {
        return $this->em->getRepository('App:'.$className)
            ->findOneBy([$prop => $val]);
    }
/* --------------- SERIALIZE --------------- */
    private function serializeEntity($entity)
    {
        try {
            return $this->serializer->serialize($entity, 'json',
                SerializationContext::create()->setGroups(array('flattened')));
        } catch (\Throwable $e) {
            return $this->logError($e);
        } catch (\Exception $e) {
            return $this->sendErrorResponse($e);
        }
    }
    private function logError($e)
    {                                                                           //print("\n\n### Error @ [".$e->getLine().'] = '.$e->getMessage()."\n".$e->getTraceAsString()."\n");
        $this->logger->error("\n\n### Error @ [".$e->getLine().'] = '.$e->getMessage()."\n".$e->getTraceAsString()."\n");
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
        $object = $interaction->getObject()->getDisplayName();
        $subject = $interaction->getSubject()->getDisplayName();
        $tags = $interaction->getTagNames();
        $type = $interaction->getInteractionType()->getActiveForm();

        return $this->render('Entity/interaction.html.twig', array(
            'entity' => $jsonEntity,
            'object' => $object,
            'show' => 'interaction',
            'subject' => $subject,
            'tags' => $tags,
            'type' => $type,
        ));
    }
/* ----------------------------- TAXON -------------------------------- */
    /**
     * Opens the Taxon show page.
     *
     * @Route("taxon/{id}", name="app_taxon_show")
     */
    public function showTaxonAction($id)
    {
        $this->em = $this->getDoctrine()->getManager();

        $taxon = $this->getEntity('Taxon', $id);
        if (!$taxon) {
            throw $this->createNotFoundException("Unable to find Taxon [$id].");
        }

        $jsonEntity = $this->serializeEntity($taxon);

        return $this->render('Entity/taxon.html.twig', array(
            'displayName' => $taxon->getDisplayName(),
            'entity' => $jsonEntity,
            'show' => 'taxon',
        ));
    }

}