<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use App\Service\DataManager;

/**
 * Adds Country and Education data for current editors
 */
final class Version20210805EditorData extends AbstractMigration implements ContainerAwareInterface
{

    private $em;
    protected $container;
    protected $dataManager;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }
    public function setDataManager(DataManager $manager)
    {
        $this->dataManager = $manager;
    }

    public function getDescription() : string
    {
        return 'Adds Country and Education data for current editors.';
    }

    private function getEntity($className, $val, $prop = 'id')
    {
        return $this->em->getRepository('App:'.$className)
            ->findOneBy([$prop => $val]);
    }

    private function getEntities($className)
    {
        return $this->em->getRepository('App:'.$className)->findAll();
    }

    private function persistEntity($entity, $creating = false)
    {
        // if ($creating) {
        //     $entity->setCreatedBy($this->admin);
        // }
        // $entity->setUpdatedBy($this->admin);
        $this->em->persist($entity);
    }
/* ============================== UP ======================================== */
    public function up(Schema $schema) : void
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        // $this->admin = $this->getEntity('User', 6, 'id');

        // $this->updateEditorStatus();
        $this->addEditorData();

        $this->em->flush();
    }
/* +++++++++++++++++++++++++ NEW TAGS +++++++++++++++++++++++++++++++++++++++ */
    private function addEditorData()
    {
        $editors = $this->getEditorData();

        foreach ($editors as $email => $editor) {
            $user = $this->getEntity('User', $email, 'email');

            foreach ($editor as $prop => $data) {
                $setProp = 'set'.$prop;
                $user->$setProp($data);
            }
            
            $this->persistEntity($user);
        }
    }
    private function getEditorData()
    {
        return [
            'pedroaguilarr@gmail.com' => [
                'FirstName'     => 'Pedro Adrián',
                'LastName'      => 'Aguilar Rodríguez',
                'Country'       => 'Mexico',
                'Education'     => 'PhD',
                'Interest'  => 'Bat-plant and plant synonymy'
            ],
            'chandabennett1@gmail.com' => [
                'Country'   => 'United States',
                'Education' => 'PhD in Ecology',
                'Interest'  => 'Europe, Asia, Oceania'
            ],
            'cenuevo@gmail.com' => [
                'Country'   => 'Philippines',
                'Education' => 'MSc Graduate Student',
                'Interest'  => 'Old world fruit bats'
            ],
            'juanpe2104@gmail.com' => [
                'Country'   => 'Peru',
                'Education' => 'Graduate Student',
                'Interest'  => 'Bat-plants in Mexico/neotropics'
            ],
            'alicedesampaiokalkuhl@gmail.com' => [
                'Country'   => 'Belgium',
                'Education' => 'Graduate Student',
                'Interest'  => 'Infectious diseases'
            ],
            'caraandcuddle@gmail.com' => [
                'Country'   => 'United States',
                'Education' => 'Undergraduate Senior',
                'Interest'  => 'Arthropods and new groups in North America'
            ],
            'baheerathanm15@iisertvm.ac.in' => [
                'Country'   => 'India',
                'Education' => 'PhD Candidate, MSc Graduate',
                'Interest'  => 'Roosting'
            ],
            // 'lizbethsotelo2002@gmail.com' => [
                // 'Country'   => '',
                // 'Education' => '',
                // 'Interest'  => 'Bat-plant and plant synonymy'
            // ],
        ];
    }
/* ============================ DOWN ======================================== */
    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}