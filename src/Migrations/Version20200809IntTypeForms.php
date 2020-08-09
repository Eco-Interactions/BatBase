<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Adds active, passive, and noun form to each Interaction Type.
 * Trims all string fields that could have be edited directly.
 * Ensures all URLs are valid and with the full path.
 */
final class Version20200809IntTypeForms extends AbstractMigration implements ContainerAwareInterface
{

    private $em;
    protected $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function getDescription() : string
    {
        return "Adds active, passive, and noun form to each Interaction Type.
            Trims all string fields that could have be edited directly.
            Ensures all URLs are valid and with the full path.";
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

        $this->addInteractionTypeForms();
        $this->validateSourceUrls();
        // $this->deleteSourceErrs();

        $this->em->flush();

    }
/* ------------------ INTERACTION TYPE  ------------------------------------- */
private function addInteractionTypeForms()
{
    $names = $this->getInteractionTypeNameForms();
    $types = $this->getEntities('InteractionType');

    foreach ($types as $type) {                      print("\n type [".$type->getNounForm()."]\n");
        $forms = $names[$type->getNounForm()];
        $type->setActiveForm($forms['active']);
        $type->setPassiveForm($forms['passive']);
        $this->persistEntity($type);
    }
}

private function getInteractionTypeNameForms()
{
    return [
        'Visitation' => [
            'active' => 'visited flowers of',
            'passive' => 'flowers visited by'
        ],
        'Pollination' => [
            'active' => 'pollinated flowers of',
            'passive' => 'pollinated by'
        ],
        'Seed Dispersal' => [
            'active' => 'dispersed seeds of',
            'passive' => 'seeds dispersed by'
        ],
        'Consumption' => [
            'active' => 'consumed',
            'passive' => 'consumed by'
        ],
        'Transport' => [
            'active' => 'transported',
            'passive' => 'transported by'
        ],
        'Roost' => [
            'active' => 'roosted in',
            'passive' => 'was roosted in by'
        ],
        'Predation' => [
            'active' => 'preyed upon',
            'passive' => 'was preyed upon by`'
        ],
        'Prey' => [
            'active' => 'was preyed upon by',
            'passive' => 'preyed upon'
        ],
        'Host' => [
            'active' => 'was host of',
            'passive' => 'was hosted by'
        ],
        'Cohabitation' => [
            'active' => 'cohabitated with',
            'passive' => 'cohabitated with'
        ],
        'Hematophagy' => [
            'active' => 'fed on the blood of',
            'passive' => 'blood was fed upon by'
        ]
    ];
}
/* -------------------- URL VALIDATION  ------------------------------------- */
private function validateSourceUrls()
{
    $srcs = $this->getEntities('Source');
    $invalidUrls = [/* id => url */];
    // $byErrorResponse =[];

    foreach ($srcs as $src) {
        if ($src->getId() === 1408) { $src->setLinkUrl(null); continue; }       print("\n Source ID [".$src->getId()."] ");
        $link = $src->getLinkUrl();
        if (!$link) { continue; }
        if (!preg_match('-https?://.+-', $link)) { $link = 'http://' . $link; }
        $src->setLinkUrl($link);
        $this->persistEntity($src);
        $invalidUrl = $this->ifInvalidGetLinkData($link);
        if (!$invalidUrl) { continue; };
        $invalidUrls += [ $src->getId() => $invalidUrl ];
        if (!array_key_exists($invalidUrl['response'], $byErrorResponse)) {
            $byErrorResponse[$invalidUrl['response']] = [];
        }
        // $byErrorResponse[$invalidUrl['response']] += [
        //     $src->getDisplayName().' ['.$src->getId().']' => $invalidUrl['url']
        // ];
    }                                                                           print("\n\invalidUrls = "); print_r($invalidUrls);
    // ksort($byErrorResponse);
    // foreach ($byErrorResponse as $name => $urls) {
    //     ksort($urls);
    //     $byErrorResponse[$name] = $urls;
    // }
}
private function ifInvalidGetLinkData($url)
{
    $headers = @get_headers($url);                                              //print("\n    headers = ".$headers[0]);
    $valid = $headers && strpos($headers[0],'200') !== false;                   //print("\n         valid = ".$valid);
    return $valid ? false : $this->returnInvalidUrl($url, $headers[0]);
}
private function returnInvalidUrl($url, $header)
{
    return [
        'response' => $header,
        'url' => $url
     ];
}

private function deleteSourceErrs()
{
    $ids = [2089, 2090];

    foreach ($ids as $id) {
        $src = $this->getEntity('Source', $id);
        $this->em->remove($src);
    }
}


/* ============================ DOWN ======================================== */
    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE interaction_type ADD display_name VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, DROP noun_form, DROP active_form, DROP passive_form');
    }
}
