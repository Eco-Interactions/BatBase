<?php

namespace Application\Migrations;

// use AppBundle\Entity\User;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Adds exmaple interaction lists and filter sets to all existing users.
 * Note: The 'updatedBy' admin is hardcoded to 6, Sarah.
 */
class Version20190714164720AddExmplData extends AbstractMigration implements ContainerAwareInterface
{
    private $container;
    private $em;

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
        $addData = $this->container->get('app.add_example_data');
        $users = $this->em->getRepository('AppBundle:User')->findAll();

        foreach ($users as $user) {
            $addData->addExampleDataToUser($user);
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
