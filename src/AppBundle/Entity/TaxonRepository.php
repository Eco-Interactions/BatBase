<?php

namespace AppBundle\Entity;

use Doctrine\ORM\EntityRepository;

/**
 * TaxonRepository.
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class TaxonRepository extends EntityRepository
{       
    public function findAllNonBatTaxa($batRealm)
    {
        return $this->createQueryBuilder('taxon')
            ->leftJoin('taxon.realm', 'realm_taxon')
            ->andWhere('realm_taxon.realm != :batRealm')
            ->setParameter('batRealm', $batRealm)
            ->getQuery()
            ->execute();
    }
}
