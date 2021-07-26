<?php
namespace App\EventSubscriber;

use Symfony\Component\Security\Core\SecurityContext;
use Symfony\Component\HttpKernel\Event\FilterControllerEvent;
use Symfony\Component\HttpKernel\HttpKernel;
use App\Service\TrackActivity;

/**
 * Listener that updates the last activity of the authenticated user
 */
class ActivityListener
{
    protected $tokenContext;
    private $trackActivity;

    public function __construct($tokenContext, TrackActivity $trackActivity)
    {
        $this->tokenContext= $tokenContext;
        $this->trackActivity = $trackActivity;
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
            $this->trackActivity->trackUserActivity();
        }
    }
}