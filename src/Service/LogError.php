<?php
namespace App\Service;

use Psr\Log\LoggerInterface;

/**
 * public:
 *     logError
 */
class LogError
{
    /** Logger */
    private $logger;
    /**
     * @param SerializerInterface $serializer
     * @param LoggerInterface     $logger
     */
    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }
    /**
     * Serializes entity records. Clears $em memory after each batch of 3000 records.
     * @param  Class  $error  Error class.
     */
    public function logError($error)
    {
        $lineNum = $e->getLine();
        $errMsg = $e->getMessage();
        $trace = $e->getTraceAsString();
        $this->handleLogging($lineNum, $errMsg, $trace);
    }
    /**
     * Logs the error with the line number, error message, and stack track. In
     * DEV environment, the log message is printed as well.
     * @param  number $lineNum Error line number
     * @param  string $msg     Error message
     * @param  string $trace   Error trace-log
     */
    private function handleLogging($lineNum, $msg, $trace)
    {
        $logMsg = "\n\n### Error @ [$lineNum] = $msg\n$trace\n";
        $this->logger->error($logMsg);
        if ($this->getParameter('env') === 'prod') { return; };
        print($logMsg);
    }
}