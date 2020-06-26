<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @up - Cleans up location data by:
 *      >> Changes captivity into a habitat assigned to the 'unspecified' region.
 *      >> Changes location type to 'area' for specific mis-identified locations 
 */
class Version20170716232015LocData extends AbstractMigration  implements ContainerAwareInterface
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
        $admin = $em->getRepository('App:User')->findOneBy(['id' => 6]);

        $this->updateCaptivityLocs($admin, $em);
        $this->changeLocTypeToArea($admin, $em);

        $em->flush();
    }
    private function updateCaptivityLocs($admin, &$em)
    {
        $loc = $em->getRepository('App:Location')->findOneBy(['id' => 24]);
        $loc->setParentLoc($em->getRepository('App:Location')
            ->findOneBy(['id' => 439]));
        $loc->setLocationType($em->getRepository('App:LocationType')
            ->findOneBy(['id' => 3]));
        $loc->setUpdatedBy($admin);
        $em->persist($loc);
        $this->deleteCaptivityHabitatCombos($em);
    }
    private function deleteCaptivityHabitatCombos(&$em)
    {
        $delete = [444, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459];
        foreach ($delete as $id) {
            $loc = $em->getRepository('App:Location')
                ->findOneBy(['id' => $id]);
            $em->remove($loc);
        }        
    }
    private function changeLocTypeToArea($admin, &$em)
    {
        $ids = [ 129, 11, 77, 22, 12, 155, 145, 141, 187, 88 ];
        foreach ($ids as $id) {
            $loc = $em->getRepository('App:Location')
                ->findOneBy(['id' => $id]);
            $loc->setLocationType($em->getRepository('App:LocationType')
                ->findOneBy(['id' => 4]));
            $loc->setUpdatedBy($admin);
            $em->persist($loc);
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
