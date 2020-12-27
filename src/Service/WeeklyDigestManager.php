<?php

namespace App\Service;

use App\Service\SerializeData;
use Psr\Log\LoggerInterface;
use Symfony\Component\Asset\Packages;
// use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class WeeklyDigestManager //extends AbstractController
{

    private $logger;
    private $mailer;
    private $templating;
    private $packages;

    private $oneWeekAgo;

    public function __construct(\Swift_Mailer $mailer, \Twig\Environment $templating,
        LoggerInterface $logger, SerializeData $serialize, Packages $packages)
    {
        $this->logger = $logger;
        $this->mailer = $mailer;
        $this->serialize = $serialize;
        $this->packages = $packages;
        $this->templating   = $templating;
    }
    /**
     *
     */
    public function sendAdminWeeklyDigestEmail()
    {
        // $data = $this->getWeeklyDigestData();
        // return $data;
/* ==================== COMPOSE EMAIL ======================================= */
        $data = ['pdf' => []];
        $message = new \Swift_Message('Test email');
        $message->setFrom('no-reply@batbase.org');
        $message->setTo('test@batbase.org');
        $message->setSubject('BatBase Weekly Digest');

        // $this->addEmbeddedLogoPath($data);

        $message->setBody(
            $this->templating->render('emails/weekly-digest.html.twig', $data),
            'text/html'
        );
        $this->attachNewPDFs($data['pdf'], $message);
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
    // private function getEmbeddedLogoPath(&$data)
    // {
    //     $data['logo'] = $message->embed(\Swift_Image::fromPath('images/logos/BatLogo_Horizontal_Color.svg'));
    // }
/* ======================== BUILD DIGEST DATA =============================== */
    private function getWeeklyDigestData()
    {
        $this->oneWeekAgo = new \DateTime('-7 days', new \DateTimeZone('UTC'));

        $data = [
            'data' => $this->getUpdatedEntityData(),
            'feedback' => $this->getFeedbackData(),
            'pdf' => $this->getPDFData(),
            'users' => $this->getNewUserData(),
        ];
        return $data;
    }
/* ----------------------- DATA-ENTRY --------------------------------------- */
    private function getUpdatedEntityData()
    {
        $data = [];
        $withUpdates = $this->getEntitiesUpdatedLastWeek('SystemDate');
        foreach ($withUpdates as $updatedEntity) {
            $entityName = $updatedEntity->getEntity();
            $updated = $this->getEntitiesUpdatedLastWeek($entityName);
            $created = $this->getEntitiesCreatedLastWeek($entityName);
            $data = array_merge($data, [
                $entityName => [
                    'created' => count($created),
                    'updated' => count($updated)
                ]
            ]);
        }
        return $data;
    }
/* ----------------------- USER FEEDBACK ------------------------------------ */
    private function getFeedbackData()
    {
        $created = $this->getEntitiesCreatedLastWeek('Feedback');
        $updated = $this->getEntitiesUpdatedLastWeek('Feedback');

        $data = [
            'created' => $this->serialize->serializeRecords($created),
            'updated' => $this->serialize->serializeRecords($updated)
        ];
        return $data;
    }
/* ----------------------- PDF SUBMISSIONS ---------------------------------- */
    private function getPDFData()
    {
        $data = [];
        $created = $this->getEntitiesCreatedLastWeek('File Upload');
        foreach ($created as $pdf) {
            array_push($data, [
                'path' => $pdf->getPath(),
                'data' => $this->serialize->serializeRecord($pdf)
            ]);
        }
        return $data;
    }
    private function attachNewPDFs($pdfs, &$message)
    {
        foreach ($pdfs as $pdf) {
            $message->attach(Swift_Attachment::fromPath($pdf['path']));
        }
    }
/* ----------------------- NEW USER ----------------------------------------- */
    private function getNewUserData()
    {
        $newUsers = $this->getEntitiesCreatedLastWeek('User');
        $data = $this->serialze->serializeRecords($newUsers);
        return $data;
    }
/* ======================== HELPERS ========================================= */
/** Queries for all entities created in the last 7 days. */
    private function getEntitiesCreatedLastWeek($entity)
    {
        $repo = $this->em->getRepository('App:'.$entity);
        $query = $repo->createQueryBuilder('e')
            ->where('e.created > :lastWeek')
            ->setParameter('lastWeek', $this->oneWeekAgo)
            ->getQuery();
        return $query->getResult();
    }
    /** Queries for all entities updated in the last 7 days */
    private function getEntitiesUpdatedLastWeek($entity)
    {
        $repo = $this->em->getRepository('App:'.$entity);
        $query = $repo->createQueryBuilder('e')
            ->where('e.updated > :lastWeek')
            ->where('e.updated > e.created')
            ->setParameter('lastWeek', $this->oneWeekAgo)
            ->getQuery();
        return $query->getResult();
    }
}