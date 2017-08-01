<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Removes sources and related detail entities.
 */
class Version20170725215243RmvSrcs extends AbstractMigration implements ContainerAwareInterface
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
        $admin = $em->getRepository('AppBundle:User')->findOneBy(['id' => 6]);

        $this->removeSrcs($admin, $em);
    }
    private function removeSrcs($admin, &$em)
    {
        $srcs = [ 801, 770, 452, 918, 953, 807, 796, 954, 767, 854, 720, 465 ];
        foreach ($srcs as $srcId) {                                             print('processing src = '. $srcId."\n");
            $src = $this->getEntity($srcId, 'Source', $em);
            $detail = $this->getDetailEntity($src, $em);

            $src->setUpdatedBy($admin);
            $detail->setUpdatedBy($admin);
            
            $em->remove($detail);
            
            $this->removeChildSrcs($src, $em);
            $this->removeFromContributors($src, $em);
            $this->removeFromParentSrc($src, $em);
            
            $em->remove($src);            
            $em->flush();   
        }
    }
    private function getDetailEntity($src, $em)
    {
        $srcType = $src->getSourceType()->getDisplayName();
        $getSrcType = 'get' . $srcType;
        return $this->getEntity($src->$getSrcType()->getId(), $srcType, $em);   //print('detail = '.$detail->getId());
    }
    private function getEntity($id, $entity, $em)
    {
        return $em->getRepository('AppBundle:'.$entity)->findOneBy(['id' => $id]);
    }
    private function removeFromParentSrc($src, &$em)
    {                                                                           //print("removing parent\n");
        $prnt = $src->getParentSource();
        if (!$prnt) { return; }  
        $src->setParentSource(null);    
        $prnt->removeChildSource($src);                                         
        $em->persist($src);   
        $em->persist($prnt);
    }
    private function removeChildSrcs($src, &$em)
    {
        foreach ($src->getChildSources() as $child) {
            $src->removeChildSource($child);
            $this->removeFromContributors($child, $em);
            $em->persist($child);
            $em->remove($child);   
        }
    }
    private function removeFromContributors($src, &$em)
    {
        foreach ($src->getContributors() as $contrib) {
            $auth = $contrib->getAuthorSource(); 
            $auth->removeContribution($contrib);
            $src->removeContributor($contrib);
            $em->persist($auth);
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
