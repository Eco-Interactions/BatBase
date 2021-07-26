<?php

namespace App\Service;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Security;

class TrackActivity
{
    protected $em;
    protected $security;

    public function __construct(EntityManagerInterface $em, Security $security)
    {
        $this->em= $em;
        // Avoid calling getUser() in the constructor: auth may not
        // be complete yet. Instead, store the entire Security object.
        $this->security = $security;
    }
/* ======================== TRACK TIME-UPDATED ============================== */
    public function trackUserActivity()
    {
        // returns User object or null if not authenticated
        $user = $this->security->getUser();

        if ( ($user instanceof User) && !($user->isActiveNow()) ) {
            $user->setLastActivityAt(new \DateTime('now'), new \DateTimeZone('UTC'));
            $this->em->flush($user);
        }
    }
}