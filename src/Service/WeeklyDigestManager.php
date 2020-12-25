<?php

namespace App\Service;

use Psr\Log\LoggerInterface;
// use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class WeeklyDigestManager //extends AbstractController
{

    private $logger;
    private $mailer;
    private $oneWeekAgo;
    private $templating;


    public function __construct(\Swift_Mailer $mailer, \Twig\Environment $templating,
        LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->mailer = $mailer;
        $this->templating   = $templating;
    }
    /**
     *
     */
    public function sendAdminWeeklyDigestEmail()
    {
/* ==================== COMPOSE EMAIL ======================================= */
        $message = new \Swift_Message('Test email');
        $message->setFrom('no-reply@batbase.org');
        $message->setTo('test@batbase.org');
        $message->setBody(
            $this->templating->render(
                'emails/weekly-digest.html.twig',
                [/*'name' => $name*/]
            ),
            'text/html'
        );

/* ======================= SEND EMAIL ======================================= */
        try {
            $this->mailer->send($message);
        } catch (TransportExceptionInterface $e) {
            // some error prevented the email sending; display an
            // error message or try to resend the message
            //debug information via the getDebug() method.
            $this->logger->error($e->getMessage());
        }

        $this->logger->info('email sent');
    }
/* ======================== BUILD DIGEST DATA =============================== */
    private function getWeeklyDigestData()
    {
        $this->oneWeekAgo = new \DateTime('-7 days', new \DateTimeZone('UTC'));
        $data = [
            // 'data' => $this->getDataEntryData(),
            // 'feedback' => $this->getFeedbackData(),
            // 'pdf' => $this->getPDFData(),
            'users' => $this->getNewUserData(),
        ];
    }
/* ----------------------- DATA-ENTRY --------------------------------------- */
    private function getDataEntryData()
    {
        // $data = [];
    }
/* ----------------------- USER FEEDBACK ------------------------------------ */
    private function getFeedbackData()
    {
        // $feedback = [];
    }
/* ----------------------- PDF SUBMISSIONS ---------------------------------- */
    private function getPDFData()
    {
        # code...
    }
/* ----------------------- NEW USER ----------------------------------------- */
    private function getNewUserData()
    {
        $newUsers = $this->getEntitiesCreatedLastWeek('User');
        $data = $this->serializeUsers($newUsers);


    }
/* ======================== HELPERS ========================================= */
/** Queries for all entities created in the last 7 days. */
    private function getEntitiesCreatedLastWeek($entity)
    {
        $repo = $this->em->getRepository('App:'.$entity);
        $query = $repo->createQueryBuilder('e')
            ->where('e.created > :lastWeek')
            ->setParameter('lastWeek', $oneWeekAgo)
            ->getQuery();
        return $query->getResult();
    }
    /** Queries for all entities updated in the last 7 days */
    private function getEntitiesUpdatedLastWeek($entity)
    {
        $repo = $this->em->getRepository('App:'.$entity);
        $query = $repo->createQueryBuilder('e')
            ->where('e.updated > :lastWeek')
            ->setParameter('lastWeek', $oneWeekAgo)
            ->getQuery();
        return $query->getResult();
    }
}