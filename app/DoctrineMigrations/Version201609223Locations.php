<?php

namespace Application\Migrations;

use AppBundle\Entity\Location;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Migration updates all locations to the new structure. Parent locations and location
 * types are filled in. Duplicate location entities are consolidated into one record, 
 * the other record is appended with '-Removed' and soft-deleted.
 */
class Version201609223Locations extends AbstractMigration implements ContainerAwareInterface
{

    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');
       
        $em = $this->container->get('doctrine.orm.entity_manager');
        $locations = $em->getRepository('AppBundle:Location')->findAll();

        foreach ($locations as $locEntity) {   
            $locEntity->setUpdatedBy($em->getRepository('AppBundle:User')
                ->findOneBy(array('id' => '6')));
            $locDesc = $locEntity->getDescription();

            if ($locDesc === "Captivity") {  
                $locEntity->setLocationType($em->getRepository('AppBundle:LocationType')
                    ->findOneBy(array('id' => 1)));
                continue;
            }
            if ($locEntity->getLocationType() === null) { 
                $this->SetLocTypeAndParent($locEntity, $em);
            }
            if (strpos($locDesc, '-Unspecified') !== false) {
                $this->renameUnspecifieds($locDesc, $locEntity, $em);
            }
            $em->persist($locEntity);
        }
        $em->flush();
    }
    private function renameUnspecifieds($locDesc, $locEntity, $em)
    {
        $dupLocNames = ["USA" => "United States", "Virgin Islands" => "Virgin Islands, British",
                      "Trinidad" => "Trinidad and Tobago", "Surinam" => "Suriname" ];
        $newLocName = explode('-Unspecified', $locDesc)[0]; 

        if (array_key_exists($newLocName, $dupLocNames)) { 
            $finalLocEntity = $em->getRepository('AppBundle:Location')
                ->findOneBy(array('description' => $dupLocNames[$newLocName]));  
            $this->ConsolidateEntityData($finalLocEntity, $locEntity, $em);  
            return;
        }
        $finalLocEntity = $em->getRepository('AppBundle:Location')
                ->findOneBy(array('description' => $newLocName));
        /**
         * Remove '-Unspecified' from locations records that are unique locations inside of a country or region.
         * Java, Pemba Island, Tokara Island, Okinawjima Island, Rodrigues Island, Caroline Island, Yap Island, Guerrero.
         */
        if ($finalLocEntity === null) { 
            $locEntity->setDescription($newLocName);  
            return;
        } else {
            $this->ConsolidateEntityData($finalLocEntity, $locEntity, $em);  
        }
        $em->persist($locEntity);
        $em->persist($finalLocEntity);
        $em->flush();
    }
    /**
     * Transfers all interactions from the original location entity for this loop 
     * to the final location entity that will remain.
     */
    private function ConsolidateEntityData($finalLocEntity, $orgLocEntity, $em)
    {
        $interactions = $orgLocEntity->getInteractions();   print("\norg to be deleted = ". $orgLocEntity->getDescription());
        $orgLocEntity->setDescription($orgLocEntity->getDescription().'--Removed');

        foreach ($interactions as $interaction) {
            $orgLocEntity->removeInteraction($interaction);
            $finalLocEntity->addInteraction($interaction);
        }
        $em->remove($orgLocEntity);
        $em->persist($finalLocEntity);
        $em->flush();
    }
    private function SetLocTypeAndParent($entity, $em)
    {
        if ($entity->getGpsData() === null && $entity->getLatitude() === null 
                && $entity->getLongitude() === null) {  
            if ($entity->getHabitatType() !== null) {
                $entity->setLocationType($em->getRepository('AppBundle:LocationType')
                    ->findOneBy(array('id' => 3)));  //habitat
            } else { 
                $entity->setLocationType($em->getRepository('AppBundle:LocationType')
                    ->findOneBy(array('id' => 4)));  //area
            }
        } else {
            $entity->setLocationType($em->getRepository('AppBundle:LocationType')
                ->findOneBy(array('id' => 5)));      //point
        }
        if ($entity->getCountry() !== null) {
            $parentDesc = $entity->getCountry()->getName();
            $parent = $em->getRepository('AppBundle:Location')
                ->findOneBy(array('description' => $parentDesc));
            if($parent === null) {print("NULL PARENT === ". $parentDesc); 
            } else {
                $entity->setParentLoc($parent);
            }
        }
    }
    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');      
    }
}
