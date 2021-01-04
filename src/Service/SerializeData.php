<?php
namespace App\Service;

use JMS\Serializer\SerializerInterface;
use JMS\Serializer\SerializationContext;
use App\Service\LogError;
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
    public function __construct(SerializerInterface $serializer, LogError $logger)
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
            $this->logger->logError($e);
        } catch (\Exception $e) {
            $this->logger->logError($e);
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
}