<?php
namespace App\EventListener;

use Symfony\Component\Security\Core\SecurityContext;
use Symfony\Component\HttpKernel\Event\FilterControllerEvent;
use Symfony\Component\HttpKernel\HttpKernel;
use Doctrine\ORM\EntityManager;
use App\Entity\User;

/**
 * Listener that updates the last activity of the authenticated user
 */
class ActivityListener
{
    protected $tokenContext;
    protected $doctrine;

    public function __construct($tokenContext, $doctrine)
    {
        $this->tokenContext= $tokenContext;
        $this->doctrine= $doctrine;
    }

    /**
    * Update the user "lastActivity" on each request
    * @param FilterControllerEvent $event
    */
    public function onCoreController(FilterControllerEvent $event)
    {
        // Check that the current request is a "MASTER_REQUEST"
        // Ignore any sub-request
        if ($event->getRequestType() !== HttpKernel::MASTER_REQUEST) {
            return;
        }

        // Check token authentication availability
        if ($this->tokenContext->getToken()) {
            $user = $this->tokenContext->getToken()->getUser();

            if ( ($user instanceof User) && !($user->isActiveNow()) ) {
                $user->setLastActivityAt(new \DateTime('now', new \DateTimeZone('America/Los_Angeles')));
                $this->doctrine->getManager()->flush($user);
            }
        }
    }
}