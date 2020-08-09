<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Makes changes to the publication and citation types.
 */
class Version20180225041911Types extends AbstractMigration implements ContainerAwareInterface
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
    public function up(Schema $schema):void
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->em->getRepository('App:User')->findOneBy(['id' => 6]);

        $this->updateCitationTypes();
        $this->updatePublicationTypes();
        $this->em->flush();
    }

    private function updateCitationTypes()
    {
        $names = [
            'Symposium proceeding' => "Master's Thesis", 
            'Thesis/Ph.D. Dissertation' => 'Ph.D. Dissertation'];
        $this->updateTypes($names, 'CitationType');
        
    }
    private function updatePublicationTypes()
    {
        $names = ['Thesis/Ph.D. Dissertation' => 'Thesis/Dissertation'];
        $this->updateTypes($names, 'PublicationType');
        
    }
    private function updateTypes($ary, $entity)
    {
        foreach ($ary as $curName => $newName) {
            $type = $this->em->getRepository('App:'.$entity)
                ->findOneBy(['displayName' => $curName]);
            $type->setDisplayName($newName);
            $type->setUpdatedBy($this->admin);
            $this->em->persist($type);
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema):void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
