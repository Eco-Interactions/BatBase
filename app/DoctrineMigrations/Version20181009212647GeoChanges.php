<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Template for doctrine migrations where the entity manager is necessary.
 * Note: The 'updatedBy' admin is hardcoded to 6, Sarah.
 */
class Version20181009212647GeoChanges extends AbstractMigration implements ContainerAwareInterface
{

    private $container;
    private $em;
    private $admin;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->em->getRepository('AppBundle:User')->findOneBy(['id' => 6]);

        $this->editGeoJsonData();
        $this->fixVariousDisplayPoints();
        $this->em->flush();
    }

    /** Add location name data.  */
    private function editGeoJsonData()
    {
        $geoJson = $this->em->getRepository('AppBundle:GeoJson')->findAll();

        foreach ($geoJson as $entity) {
            $loc = $entity->getLocation();
            $entity->setLocationName($loc->getDisplayName());
            $this->em->persist($entity);
        }
    }

    private function fixVariousDisplayPoints()
    {
        $points = [ //long, lat
            'Bonaire, Sint Eustatius and Saba' => [-68.2385, 12.1784],
            'Bouvet Island' => [3.3464, -54.4208],
            'Disputed Territory [includes the Paracel Islands and Spratly Islands]' => [111.916663, 8.6333308],
            'Svalbard and Jan Mayen' => [23.6703, 77.5536],
            'Guadeloupe' => [-61.551, 16.265], 
            'Saint Bathélemy' => [-62.8333, 17.9],
            'Mayotte' => [45.1662, -12.8275],
            'Réunion' => [55.5364, -21.1151],
            'Christmas Island' => [105.6904, -10.4475],
            'Cocos (Keeling) Islands' => [96.871, -12.1642],
            'Tokelau' => [-171.8484, -9.2002],
            'Jersey' => [-2.1312, 49.2144],    
            'Oceania' => [140.0188, -22.7359],
            'Martinique' => [14.6415, -61.0242],
            'Curacao' => [12.1696, -68.9900],
            'French Guiana' => [3.9339, -53.1258],
            'Yasuni National Park' => [-75.8069082, -1.1006555],
            'Russian Federation' => [94.44249, 62.25642]        
        ];

        foreach ($points as $name => $coordinates) {
            $geoJson = $this->em->getRepository('AppBundle:GeoJson')
                ->findOneBy(['locationName' => $name]);
            $geoJson->setDisplayPoint(json_encode($coordinates));

            if ($name === 'Yasuni National Park') { $geoJson->setType('Point'); }

            if ($geoJson->getType() == 'Point') {
                $geoJson->setCoordinates(json_encode($coordinates));
            }
            $this->em->persist($geoJson);
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
