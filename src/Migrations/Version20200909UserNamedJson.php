<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Reformats saved User Named json data into the new structure,
 */
final class Version20200909UserNamedJson extends AbstractMigration implements ContainerAwareInterface
{

    private $em;
    protected $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function getDescription() : string
    {
        return "Reformats saved User Named json data into the new structure,";
    }

    private function getEntity($className, $val, $prop = 'id')
    {
        return $this->em->getRepository('App:'.$className)
            ->findOneBy([$prop => $val]);
    }

    public function getEntities($className)
    {
        return $this->em->getRepository('App:'.$className)->findAll();
    }

    public function persistEntity($entity, $creating = false)
    {
        if ($creating) {
            $entity->setCreatedBy($this->admin);
        }
        $entity->setUpdatedBy($this->admin);
        $this->em->persist($entity);
    }

/* ============================== UP ======================================== */
    public function up(Schema $schema) : void
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->getEntity('User', 6, 'id');

        $this->reformatJsonData($this->getEntities('UserNamed'));

        $this->em->flush();
    }
/* --------------------- REFORMAT JSON  ------------------------------------- */
    private function reformatJsonData($entities)
    {
        foreach ($entities as $entity) {
            if ($entity->getType() !== 'filter') { continue; }                  //print("\n details = ". $entity->getDetails());
            $data = json_decode($entity->getDetails()); 
            if (!property_exists($data, 'panel')) { continue; }
            $data->direct = new \stdClass();
            $data->rebuild = new \stdClass();   

            if (property_exists($data->panel, 'time')) { 
                $this->reformatTime($data->panel->time, $data); 
            }
            if (property_exists($data->panel, 'combo')) { 
                $this->reformatCombos($data->panel->combo, $data); 
            }
            if (property_exists($data->panel, 'name')) { 
                $data->direct->name = $data->panel->name; 
            }           

            unset($data->panel);
            $entity->setDetails(json_encode($data));                            //print_r($data);
            $this->persistEntity($entity);
        }
    }
    private function reformatTime($filter, &$data)
    {
        $date = new \stdClass();
        $date->type = $filter->type;
        $date->time = $filter->date;
        $date->active = true;

        $data->direct->date = $date;
    }
    private function reformatCombos($filters, &$data)
    {
        $direct = ['Publication Type', 'Object Realm'];

        foreach ($filters as $combo => $value) {
            $group = in_array($combo, $direct) ? 'direct' : 'rebuild';
            $data->$group->combo = new \stdClass();
            $data->$group->combo->$combo = $group === 'direct' ? $value->value : $value;
        }

    }

/* ============================ DOWN ======================================== */
    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
