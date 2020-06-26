<?php

namespace Application\Migrations;

use App\Entity\CitationType;
use App\Entity\LocationType;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Creates a new 'City' location type and sets the ordinals of all location Types.
 * Adds Citation types-- Museum record, Symposium proceeding, report, and other.
 */
class Version20170518210100TypeAdditions extends AbstractMigration implements ContainerAwareInterface
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
        $em = $this->container->get('doctrine.orm.entity_manager');
        $this->updateLocationTypes($em);
        $this->updateCitationTypes($em);

        $em->flush();
    }

    private function updateLocationTypes(&$em)
    {
        $this->addOrdinals($em);
        $this->addCity($em);
    }

    private function addOrdinals(&$em)
    {
        $types = $em->getRepository('App:LocationType')->findAll(); 
        $ordinal = 10;
        foreach ($types as $locType) {
            $locType->setOrdinal($ordinal);
            $ordinal += 10;
            $em->persist($locType);
        }
    }
    private function addCity(&$em)
    {
        $city = new LocationType();
        $city->setDisplayName('City');
        $city->setOrdinal(25);
        $em->persist($city);
    }

    private function updateCitationTypes(&$em)
    {
        $types = ['Book', 'Museum record', 'Symposium proceeding', 'Report', 'Other'];

        foreach ($types as $typeName) {
            $type = new CitationType();
            $type->setDisplayName($typeName);
            $em->persist($type);
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