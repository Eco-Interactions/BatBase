<?php

namespace App\Service;

use App\Service\SerializeData;
use Psr\Log\LoggerInterface;
use Symfony\Component\Asset\Packages;
use Doctrine\ORM\EntityManagerInterface;
/**
 * TOC
 *     COMPOSE AND SEND EMAIL
 *         BUILD EMAIL
 *         SEND EMAIL
 *     BUILD DIGEST DATA
 *         DATA ENTRY
 *         SUBMITTED PUBLICATIONS
 *         NEW USER
 *         USER FEEDBACK
 *         HELPERS
 */
class WeeklyDigestManager
{
    private $em;
    private $logger;
    private $mailer;
    private $templating;
    private $packages;
    /** string $rootPath */
    private $rootPath;

    private $oneWeekAgo;

    public function __construct(string $rootPath, \Swift_Mailer $mailer,
        \Twig\Environment $templating, LoggerInterface $logger,
        SerializeData $serialize, Packages $packages, EntityManagerInterface $em)
    {
        $this->rootPath = $rootPath;
        $this->em = $em;
        $this->logger = $logger;
        $this->mailer = $mailer;
        $this->serialize = $serialize;
        $this->packages = $packages;
        $this->templating   = $templating;
    }
/* ==================== COMPOSE AND SEND EMAIL ============================== */
    /**
     * Sends an email to site admin's with various updates from site activity
     * over the last week: Data entry, submitted publications, new users, and new
     * user fedeback.
     */
    public function sendAdminWeeklyDigestEmail()
    {
        $data = $this->getWeeklyDigestData();
        $users = $this->em->getRepository('App:User')->findAll();

        foreach ($users as $user) {
            if (!$user->hasRole('ROLE_ADMIN') && !$user->hasRole('ROLE_SUPER_ADMIN')) { continue; }
            $email = $this->buildDigestEmail($user->getEmail(), $data);
            $this->sendEmail($email);
        }
        return $data;
    }
/* ----------------------- BUILD EMAIL -------------------------------------- */
    /**
     * Build the email object with the weekly digest data and any submitted PDFs.
     * @param  string $adminEmail   Admin email
     * @param  array $data          Weekly digest data
     * @return Class                Swiftmailer message object.
     */
    private function buildDigestEmail($adminEmail, $data)
    {
        $message = $this->initDigestEmail($adminEmail);
        $this->attachNewPDFs($data['pdfs'], $message);
        $this->addLogoToMessage($data, $message);
        $this->setEmailBody($data, $message);
        return $message;
    }
    /**
     * Inits and returns the Swiftmailer email.
     * @param  string $adminEmail   Admin email
     * @return Class                Swiftmailer message object.
     */
    private function initDigestEmail($adminEmail)
    {
        $message = new \Swift_Message('Test email');
        $message->setFrom('automated@batbase.org')
            ->setTo($adminEmail)
            ->setSubject('BatBase Weekly Digest');
        return $message;
    }
    private function addLogoToMessage(&$data, &$message)
    {
        $logoPath = $this->rootPath."/public_html/build/images/BatLogo_Horizontal_Color.jpg";
        $data['logo'] = $message->embed(\Swift_Image::fromPath($logoPath));
    }
    /**
     * Attach PDF files to the email.
     * @param array $pdfs     PDF data
     * @param Class &$message Swiftmailer message object.
     */
    private function attachNewPDFs($pdfs, &$message)
    {
        foreach ($pdfs as $pdf) {
            $pdfPath = $this->rootPath.'/public_html/'.$pdf['path'];
            $message->attach(\Swift_Attachment::fromPath($pdfPath));
        }
    }
    /**
     * Builds email body from= twig template and the digest data.

     * @param array $data          Weekly digest data
     * @param Class &$message Swiftmailer message object.
     */
    private function setEmailBody($data, &$message)
    {
        $message->setBody(
            $this->templating->render('emails/weekly-digest.html.twig', $data),
            'text/html'
        );
    }
/* ----------------------- SEND EMAIL --------------------------------------- */
    /**
     * Attempts to send email and logs any errors.
     * @param Class &$message Swiftmailer message object.
     */
    private function sendEmail($message)
    {
        try {
            $this->mailer->send($message);
        } catch (TransportExceptionInterface $e) {//debug information via the getDebug() method.
            $this->logger->error($e->getMessage());
        }
        $this->logger->info('email sent');
    }
/* ======================== BUILD DIGEST DATA =============================== */
    /**
     * Returns data about site activity over the last week: Data-entry, submitted
     * publications, new users, and new user fedeback.
     * @return array          Weekly digest data
     */
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
/* ----------------------- DATA ENTRY --------------------------------------- */
    /**
     * @return array  Each entity with updates, wth the totals created and edited.
     */
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
/* ------------------- SUBMITTED PUBLICATIONS ------------------------------- */
    /**
     * @return array  Data for each publication submitted last week
     */
    private function getPDFData()
    {
        $data = [];
        $created = $this->getEntitiesCreatedLastWeek('FileUpload');
        foreach ($created as $pdf) {
            array_push($data, [
                'path' => $pdf->getPath().$pdf->getFileName(),
                'filename' => $pdf->getFileName(),
                'title' => $pdf->getTitle(),
                'description' => $pdf->getDescription(),
                'user' => $pdf->getCreatedBy()->getFullName(),
                'userEmail' => $pdf->getCreatedBy()->getEmail()
            ]);
        }
        return $data;
    }
/* ----------------------- NEW USER ----------------------------------------- */
    /**
     * @return array  Data for each new user from last week
     */
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
/* ----------------------- USER FEEDBACK ------------------------------------ */
    /**
     * @return array  Data for user feedback submitted last week
     */
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
/* ------------------------ HELPERS ----------------------------------------- */
    /**
     * Queries for all entities created in the last 7 days.
     * @param  string $entity Entity name
     * @return Class          Entities
     */
    private function getEntitiesCreatedLastWeek($entity)
    {
        $repo = $this->em->getRepository('App:'.$entity);
        $query = $repo->createQueryBuilder('e')
            ->where('e.created > :lastWeek')
            ->setParameter('lastWeek', $this->oneWeekAgo)
            ->getQuery();
        return $query->getResult();
    }

    /**
     * Queries for all entities updated in the last 7 days.
     * @param  string $entity Entity name
     * @return Class          Entities
     */
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