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
        $em->flush();
    }
    private function removeSrcs($admin, &$em)
    {
        $srcs = [ 801, 452, 918, 953, 807, 796, 954, 767, 854, 720, 465 ];
        foreach ($srcs as $srcId) {
            $src = $this->getEntity($srcId, 'Source', $em);
            $srcType = $src->getSourceType()->getDisplayName();
            $getSrcType = 'get' . $srcType;
            $detail = $this->getEntity($src->$getSrcType()->getId(), $srcType, $em);  print('detail = '.$detail->getId());
            $src->setUpdatedBy($admin);
            $detail->setUpdatedBy($admin);
            $em->remove($detail);
            $em->remove($src);            
        }
    }
    private function getEntity($id, $entity, $em)
    {
        return $em->getRepository('AppBundle:'.$entity)->findOneBy(['id' => $id]);
    }
    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
