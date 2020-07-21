<?php

namespace App\Controller;

use App\Entity\IssueReport;
use App\Entity\ImageUpload;

use Symfony\Component\HttpFoundation\File\UploadedFile;
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;


/**
 * Date-entry/edit form controller.
 *
 * @Route("/")
 */
class IssueReportController extends AbstractController
{
    private $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /**
     * Creates a new Entity, and any new detail-entities, from the form data.
     *
     * @Route("/issue/report", name="app_issue_report")
     */
    public function issueReportAction(Request $request)
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'You can access this only using Ajax!'), 400);
        }
        $em = $this->getDoctrine()->getManager();

        $report = new IssueReport();

        $report->setDescription($request->get('description'));                  //var_dump($request->files->all());
        $report->setStepsToReproduce($request->get('stepsToReproduce'));
        $report->setMiscInfo($request->get('miscInfo'));

        $files = [];
        foreach ($request->files->all() as $file) {
            $upload = new ImageUpload();
            $upload->setImage($file);
            $upload->setIssueReport($report);
            $report->addScreenshot($upload);
            $em->persist($upload);
            array_push($files, $upload->getFileName());
        }
        $em->persist($report);

        return $this->attemptFlushAndSendResponse($report, $files, $em);
    }
    /*---------- Flush and Return Data ---------------------------------------*/
    /**
     * Attempts to flush all persisted data. If there are no errors, the created/updated
     * data is sent back to the crud form; otherise, an error message is sent back.
     */
    private function attemptFlushAndSendResponse($report, $files, &$em)
    {
        try {
            $em->flush();
        } catch (\DBALException $e) {
            return $this->sendErrorResponse($e);
        } catch (\Exception $e) {
            return $this->sendErrorResponse($e);
        }
        return $this->sendDataAndResponse($report, $files);
    }
    /** Logs the error message and returns an error response message. */
    private function sendErrorResponse($e)
    {                                                                           //print("\n\n### Error @ [".$e->getLine().'] = '.$e->getMessage()."\n".$e->getTraceAsString()."\n");
        $this->logger->error("\n\n### Error @ [".$e->getLine().'] = '.$e->getMessage()."\n".$e->getTraceAsString()."\n");
        $response = new JsonResponse();
        $response->setStatusCode(500);
        $response->setData($e->getMessage());
        return $response;
    }
    /** Sends an object with the entities' serialized data back to the crud form. */
    private function sendDataAndResponse($report, $files)
    {
        $response = new JsonResponse();
        $response->setData(array(
            'filenames' => $files
        ));
        return $response;
    }
}