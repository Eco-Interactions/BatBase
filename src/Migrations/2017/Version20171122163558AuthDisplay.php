<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @up -> Chages author display names into a [Last, First Middle Suff] format. 
 */
class Version20171122163558AuthDisplay extends AbstractMigration implements ContainerAwareInterface
{

    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema):void
    {
        $em = $this->container->get('doctrine.orm.entity_manager');
        $admin = $em->getRepository('App:User')->findOneBy(['id' => 6]);
        
        $this->updateDisplayNames($admin, $em);
        
        $em->persist($admin);
        $em->flush();
    }
    private function updateDisplayNames(&$admin, &$em)
    {
        $authrs = $em->getRepository('App:Author')->findAll();
        
        foreach ($authrs as $auth) {
            $dispName = $this->getDisplayName($auth);
            $this->updateAuthName($dispName, $auth, $admin, $em);
            $this->updateSrcName($dispName, $auth, $admin, $em);
        }                                                                      
    }

    private function updateAuthName($name, $auth, &$admin, &$em)
    {
        $auth->setDisplayName($name);
        $auth->setUpdatedBy($admin);                                    
        $em->persist($auth);
    }

    private function updateSrcName($name, $auth, &$admin, &$em)
    {
        $src = $auth->getSource();
        $src->setDisplayName($name);
        $src->setUpdatedBy($admin);                                    
        $em->persist($src);
    }

    private function getDisplayName($authr)
    {
        $name = $authr->getLastName().',';
        $nameParts = ['FirstName', 'MiddleName', 'Suffix'];
        foreach ($nameParts as $part) {
            $getNamePart = 'get'.$part;
            $namePart = $authr->$getNamePart();
            if ($namePart !== null) { 
                $name = $name.' '.$namePart;
            }
        }                                                                       //print("\nName = ". $name);
        return $name;
    }
    /**
     * @param Schema $schema
     */
    public function down(Schema $schema):void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }

}
