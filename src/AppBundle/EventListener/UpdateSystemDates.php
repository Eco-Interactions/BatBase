<?php

namespace AppBundle\EventListener;

use Doctrine\ORM\Event\LifecycleEventArgs;

class UpdateSystemDates
{   
    /**
     * The persisted entity's SystemDate value is updated with the current date.
     * The system-wide date value is also updated.
     */
    public function postPersist(LifecycleEventArgs $args)
    {
        $entity = $args->getEntity();
        $em = $args->getEntityManager();
        
        $dateId = $this->getSystemDateId($entity, $em);
        if (!$dateId) { return; }
        
        $this->updateSystemDate($dateId, $em);
        $this->updateSystemDate(1, $em);    //System wide lastUpdated    
        $em->flush();
    }
    private function updateSystemDate($id, &$em)
    {  
        $entity = $em->getRepository('AppBundle:SystemDate')
            ->findOneBy(['id' => $id]);
        $entity->setDateVal(new \DateTime());
        $em->persist($entity);
    }
    private function getSystemDateId($entity, $em)
    {  
        $dateEntities = ["System", "Author", "Authority", "Citation", "CitationType", 
            "ContentBlock", "Contribution", "Domain", "Feedback", "HabitatType", 
            "ImageUpload", "Interaction", "InteractionType", "Level", "Location", 
            "LocationType", "Naming", "NamingType", "Publication", "PublicationType", 
            "Source", "SourceType", "Tag", "Taxon", "Taxonym"];
        $classNameSpace = $em->getMetadataFactory()->getMetadataFor(get_class($entity))->getName();
        $classNames = explode("\\", $classNameSpace);
        $className = array_pop($classNames);
        if (!in_array($className, $dateEntities)) { return false; }
        $dateId = array_search($className, $dateEntities) + 1;
        return $dateId;
    }
}