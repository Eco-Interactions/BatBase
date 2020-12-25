<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Mailer\MailerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;


class MailerController extends AbstractController
{
    public function __construct(LoggerInterface $logger, MailerInterface $mailer)
    {
        $this->logger = $logger;
        $this->mailer = $mailer;
    }

    public function sendAdminWeeklyDigestEmail($digestData)
    {
        $email = (new TemplatedEmail())
/* ==================== COMPOSE EMAIL ======================================= */
        /* ---- TO & From ---- */
            ->from('automated@batbase.org')
            ->to('you@example.com')
            //->cc('cc@example.com')
            //->bcc('bcc@example.com')
            //->replyTo('fabien@example.com')
            //->priority(Email::PRIORITY_HIGH)
        /* ---- Subject ---- */
            ->subject('BatBase Weekly Digest')
        /* ---- Template ---- */
            // path of the Twig template to render
            ->htmlTemplate('emails/weekly-digest.html.twig')

            // pass variables (name => value) to the template
            ->context([
                // pass variables (name => value) to the template
            ])
        /* ---- Attach files ---- */
            // optionally you can tell email clients to display a custom name for the file
            // ->attachFromPath('/path/to/documents/privacy.pdf', 'Privacy Policy')
        // /* Tells auto-repliers to not reply to this message because it's an automated email */
        //     ->getHeaders()
        //         ->addTextHeader('X-Auto-Response-Suppress', 'OOF, DR, RN, NRN, AutoReply')
        ;
/* ======================= SEND EMAIL ======================================= */
//The Symfony\Component\Mailer\SentMessage object returned by the send() method of the Symfony\Component\Mailer\Transport\TransportInterface provides access to the original message (getOriginalMessage()) and to some debug information (getDebug()) such as the HTTP calls done by the HTTP transports, which is useful to debug errors.
        try {
            $this->mailer->send($email);
        } catch (TransportExceptionInterface $e) {
            // some error prevented the email sending; display an
            // error message or try to resend the message
            //debug information via the getDebug() method.
            $this->logger->error($e->getMessage());
        }
    }
}