<?php

namespace Application\Migrations;

use App\Entity\Location;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Updates existing country (-Unspecified) locations or adds a new location
 * for any not currently in the database. 
 */
class Version201609222Countries extends AbstractMigration implements ContainerAwareInterface
{

    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * For each country, either update current location entity by dropping '-Unspecified' 
     * and adding a "country" location type or create new location. 
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');
       
        $em = $this->container->get('doctrine.orm.entity_manager');
        $countries = $em->getRepository('App:Country')->findAll();

        foreach ($countries as $country) {
            $curLoc = null;
            $nameTrans = ["Venezuela, Bolivarian Republic of" => "Venezuela", "Bolivia, Plurinational State of" => "Bolivia",
                          "Tanzania, United Republic of" => "Tanzania", "Micronesia, Federated States of" => "Micronesia" ]; 
            $edgeCases = ["United States" => "USA"];
            $cntryName = $findByName = $country->getName();
            if (array_key_exists($cntryName, $nameTrans)) {
                $cntryName = $findByName = $nameTrans[$cntryName];
                $country->setName($cntryName);                
            } else if (array_key_exists($cntryName, $edgeCases)) {
                $findByName = $edgeCases[$cntryName];
            }
            $locDesc = $cntryName.'-Unspecified';    
            $locEntity = $em->getRepository('App:Location')
                ->findOneBy(array('description' => $locDesc));

            if ($locEntity === null) {                                              
                $this->BuildLocEntity($country, $cntryName, $em);
            } else {                                                       
                $this->UpdateLocEntity($locEntity, $country, $cntryName, $em);    
            }
        }
    }
    private function UpdateLocEntity($locEntity, $country, $cntryName, $em)
    {
        $locEntity->setDescription($cntryName);
        $locEntity->setLocationType($em->getRepository('App:LocationType')
            ->findOneBy(array('id' => 2)));
        $locEntity->setUpdatedBy($em->getRepository('App:User')
            ->findOneBy(array('id' => '6')));

        $parentDesc = $country->getRegion()->getDescription();
        $parent = $em->getRepository('App:Location')
            ->findOneBy(array('description' => $parentDesc)); 
        $locEntity->setParentLoc($parent);

        $em->persist($locEntity);
        $em->flush();
    }
    private function BuildLocEntity($country, $cntryName, $em)
    {
        $entity = new Location();
        $entity->setDescription($cntryName);
        $entity->setCreatedBy($em->getRepository('App:User')
            ->findOneBy(array('id' => '6')));  //Sarah
        $entity->setLocationType($em->getRepository('App:LocationType')
            ->findOneBy(array('id' => 2))); 

        $parentDesc = $country->getRegion()->getDescription();
        $parent = $em->getRepository('App:Location')
            ->findOneBy(array('description' => $parentDesc)); 

        $entity->setParentLoc($parent);

        $childLocs = $country->getLocations();  

        foreach ($childLocs as $loc) {
            $entity->addChildLocs($loc);
        }
        $em->persist($entity);
        $em->flush();
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