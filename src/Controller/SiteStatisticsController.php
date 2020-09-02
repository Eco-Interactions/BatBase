<?php

namespace App\Controller;


use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityManagerInterface;


/**
 * Site Statistics controller.
 *
 * @Route("/stats")
 */
class SiteStatisticsController extends AbstractController
{
    private $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    /**
     * Finds and displays Definition page content blocks.
     *
     * @Route("/", name="app_page_stats")
     */
    public function pageStatisticsAction(Request $request)
    {

        $requestContent = $request->getContent();
        $page = json_decode($requestContent)->pg;
        $data = $this->getPageStats($page);

        $response = new JsonResponse();
        $response->setData($data);
        return $response;
    }
    private function getPageStats($page)
    {
        $map = [
            "about" => function() { return $this->buildAboutProjectStatData(); },
            "db" => function() { return $this->buildAboutDatabaseStatData(); },
            "home" => function() { return $this->buildCoreStatData(); },
        ];
        return call_user_func($map[$page]);
    }

    private function buildAboutProjectStatData()
    {
        $users = $this->em->getRepository('App:User')->findAll();
        $editors = 0;

        foreach ($users as $user) {
            if (!$user->hasRole('ROLE_EDITOR')) { continue; }
            $editors++;
        }
        return [
            'usr' => count($users),
            'editor' => $editors
        ];
    }

    private function buildAboutDatabaseStatData()
    {
        $data = $this->buildCoreStatData();
        $data['nonBats'] = $this->getAllNonBatSpeciesCount($data['bats']);
        return $data;
    }

    private function buildCoreStatData()
    {
        $locs = $this->getLocationsWithInteractions();
        $cntries = $this->getCountryCount($locs);

        return [
            'ints' => count($this->em->getRepository('App:Interaction')->findAll()),
            'cits' => count($this->em->getRepository('App:Source')->findBy(['isDirect' => true])),
            'locs' => $locs,
            'cntries' => $cntries,
            'bats' => $this->getBatSpeciesCount(),
        ];
    }

/* =========================== GET COUNTS =================================== */
/* ---------------------------- LOCATIONS =---------------------------------- */
    private function getLocationsWithInteractions()
    {
        $data = [ 'count' => [/*names*/], 'cntries' => [/*names*/] ];
        $locs = $this->em->getRepository('App:Location')->findAll();

        foreach ($locs as $loc) {
            if (!count($loc->getInteractions())) { continue; }
            if ($loc->getLocationType()->getDisplayName() === 'Habitat') { continue; }
            array_push($data['count'], $loc->getDisplayName());
            array_push($data['cntries'], $loc->getCountryData()['displayName']);
        }
        $data['count'] = count(array_unique($data['count']));
        $data['cntries'] = count(array_unique($data['cntries'])) - 1;
        return $data;
    }

    private function getCountryCount(&$locs)
    {
        $cntries = $locs['cntries'];
        $locs = $locs['count'];
        return $cntries;
    }
/* --------------------------- BAT SPECIES ---------------------------------- */
    private function getBatSpeciesCount()
    {
        $speciesCount = 0;
        $bat = $this->em->getRepository('App:Taxon')->findOneBy(['name' => 'Chiroptera']);

        $speciesCount += $this->getSpeciesTaxa($bat);
        return $speciesCount;
    }

    private function getSpeciesTaxa($taxon)
    {
        if ($taxon->getLevel()->getDisplayName() === 'Species') { return 1; }
        $subCount = 0;

        foreach ($taxon->getChildTaxa() as $childTaxon) {
            $subCount += $this->getSpeciesTaxa($childTaxon);
        }

        return $subCount;
    }
/* ------------------------- OTHER SPECIES ---------------------------------- */
    private function getAllNonBatSpeciesCount($batSpeciesCount)
    {
        $species = $this->em->getRepository('App:Level')
            ->findOneBy(['displayName' => 'Species']);

        return count($species->getTaxa()) - $batSpeciesCount;
    }

}
