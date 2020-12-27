<?php

namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;
/**
 * public:
 *
 * TOC:
 *     TRACK TIME-UPDATED
 */
class TrackEntityUpdate
{
    private $em;
/* ========================= CONSTRUCT ====================================== */
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }
/* ======================== TRACK TIME-UPDATED ============================== */
    /**
     * TODO
     */
    public function trackEntityUpdate($entityName, $isSystemUpdate = false)
    {
        $entity = $this->em->getRepository('App:SystemDate')
            ->findOneBy(['entity' => $entityName]);
        if (!$entity) { return; }
        $entity->setUpdated(new \DateTime('now', new \DateTimeZone('UTC')));
        $this->em->persist($entity);
        if ($isSystemUpdate) { return; }
        $this->trackEntityUpdate('System', true);
    }
}