<?php
namespace App\Service;

use JMS\Serializer\SerializerInterface;
use JMS\Serializer\SerializationContext;
use Psr\Log\LoggerInterface;

/**
 * public:
 *     serializeRecords
 *     serializeRecord
 */
class SerializeData
{
    /** JMS Serializer */
    private $serializer;
    /** Logger */
    private $logger;
    /**
     * @param SerializerInterface $serializer
     * @param LoggerInterface     $logger
     */
    public function __construct(SerializerInterface $serializer, LoggerInterface $logger)
    {
        $this->serializer = $serializer;
        $this->logger = $logger;
    }
    /**
     * Serializes entity records. Clears $em memory after each batch of 3000 records.
     * @param  array  $entites Symfony Entity Records
     * @param  Class  &$em     Entity Manager
     * @param  string $group   Serializer data-group.
     * @return Object          Serialized entity records.
     */
    public function serializeRecords($entities, &$em, $group = false)
    {
        $data = new \stdClass;
        $count = 0;
        foreach ($entities as $entity) {
            $id = $entity->getId();
            $jsonData = $this->serializeRecord($entity, $group);
            if ($jsonData) { $data->$id = $jsonData; }
            if ($count < 3000) { ++$count;
            } else { $em->clear(); $count = 0; }
        }
        $em->clear();
        return $data;
    }
    /**
     * Serializes the entity record. Logs any errors.
     * @param  Class  $entity  Symfony entity record.
     * @param  string $group   Serializer data-group.
     * @return Object          JSON record.
     */
    public function serializeRecord($entity, $group = false)
    {
        $rcrd = false;
        try {
            $rcrd = $this->serializer->serialize($entity, 'json', $this->setGroups($group));
        } catch (\Throwable $e) {
            $this->logErr($e->getLine(), $e->getMessage(), $e->getTraceAsString());
        } catch (\Exception $e) {
            $this->logErr($e->getLine(), $e->getMessage(), $e->getTraceAsString());
        }
        return $rcrd;
    }
    /**
     * Sets the data-group serialization context.
     * @param  string $group   Serializer data-group.
     */
    private function setGroups($group)
    {
        if (!$group) { return null; }
        return SerializationContext::create()->setGroups(array($group));
    }
    /**
     * Logs the error with the line number, error message, and stack track. In
     * DEV environment, the log message is printed as well.
     * @param  number $lineNum Error line number
     * @param  string $msg     Error message
     * @param  string $trace   Error trace-log
     */
    private function logErr($lineNum, $msg, $trace)
    {
        $logMsg = "\n\n### Error @ [$lineNum] = $msg\n$trace\n";
        $this->logger->error($logMsg);
        if ($this->getParameter('env') === 'prod') { return; };
        print($logMsg);
    }
}