<?php

namespace App\Service;

use App\Service\SerializeData;
use Psr\Log\LoggerInterface;
use Symfony\Component\Asset\Packages;
use Doctrine\ORM\EntityManagerInterface;

class WeeklyDigestManager
{
    private $em;
    private $logger;
    private $mailer;
    private $templating;
    private $packages;

    private $oneWeekAgo;

    public function __construct(\Swift_Mailer $mailer, \Twig\Environment $templating,
        LoggerInterface $logger, SerializeData $serialize, Packages $packages,
        EntityManagerInterface $em
    )
    {
        $this->em = $em;
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
        $lastWeekString = $this->oneWeekAgo->format('m-d-Y');
        $yesterday = new \DateTime('-1 day', new \DateTimeZone('UTC'));
        $data = [
            'lastWeek' => $lastWeekString,
            'yesterday' => $yesterday->format('m-d-Y'),
            'dataUpdates' => $this->getUpdatedEntityData(),
            'feedback' => $this->getFeedbackData(),
            'pdfs' => $this->getPDFData(),
            'users' => $this->getNewUserData(),
        ];
        return $data;
    }
/* ----------------------- DATA-ENTRY --------------------------------------- */
    private function getUpdatedEntityData()
    {
        $data = [];
        $skip = ['System', 'FileUpload', 'Feedback', 'Source', 'GeoJson'];
        $withUpdates = $this->getEntitiesUpdatedLastWeek('SystemDate');
        foreach ($withUpdates as $updatedEntity) {
            $entityName = $updatedEntity->getEntity();
            if (in_array($entityName, $skip)) { continue; }
            $updated = $this->getEntitiesUpdatedLastWeek($entityName);
            $created = $this->getEntitiesCreatedLastWeek($entityName);
            array_push($data, [
                'name' => $entityName,
                'created' => count($created),
                'updated' => count($updated)
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
            // 'created' => $this->getCreatedFeedback($created),
            // 'updated' => $this->getCreatedFeedback($updated)
        ];
        return $data;
    }
    // private function getCreatedFeedback($created)
    // {
    //     $data = [];
    //     foreach ($created as $feedback) {
    //         array_push($data, [
    //             'page' => $feedback->getRoute(),
    //             'topic' => $feedback->getTopic(),
    //             'feedback' => $feedback->getContent(),
    //             'user' => $feedback->getCreatedBy()->getFullName(),
    //             'userEmail' => $feedback->getCreatedBy()->getEmail()
    //         ]);
    //     }
    //     return $data;
    // }
    // private function getUpdatedFeedback($updated)
    // {
    //     $data = [];
    //     foreach ($created as $feedback) {
    //         array_push($data, [
    //             'status' => $feedback->getStatusStr(),
    //             'assignedTo' => $feedback->assignedUser->getFullName(),
    //             'notes' => $feedback->getAdminNotes(),
    //             'page' => $feedback->getRoute(),
    //             'topic' => $feedback->getTopic(),
    //             'feedback' => $feedback->getContent(),
    //             'user' => $feedback->getCreatedBy()->getFullName(),
    //             'userEmail' => $feedback->getCreatedBy()->getEmail()
    //         ]);
    //     }
    //     return $data;
    // }
/* ----------------------- PDF SUBMISSIONS ---------------------------------- */
    private function getPDFData()
    {
        $data = [];
        $created = $this->getEntitiesCreatedLastWeek('FileUpload');
        foreach ($created as $pdf) {
            array_push($data, [
                'path' => $pdf->getPath(),
                'filename' => $pdf->getFileName(),
                'title' => $pdf->getTitle(),
                'description' => $pdf->getDescription(),
                'user' => $pdf->getCreatedBy()->getFullName(),
                'userEmail' => $pdf->getCreatedBy()->getEmail()
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
        $data = [];
        foreach ($newUsers as $user) {
            array_push($data, [
                'name' => $user->getFullName(),
                'about' => $user->getAboutMe(),
            ]);
        }
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
            ->where('e.updated > :lastWeek');
        if ($entity !== 'SystemDate') {
            $query->andWhere('e.updated > e.created');
        }
        $query->setParameter('lastWeek', $this->oneWeekAgo);
        return $query->getQuery()->getResult();
    }
}