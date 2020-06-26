<?php

namespace Application\Migrations;

use App\Entity\Publication;
use App\Entity\Source;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @up- Fixes some miscellaneous source data discrepancies. 
 *      > Deletes the publication 'Ph.D. Dissertation', 24
 *      > Change 'University of Chicago Press' into a publisher, 33
 *      > Creates publication entities for the Ph.D. Dissert. citations 736, 745.
 *      > Creates publication (book) parents for citations 730, 907
 *      > Creates publication parents for citations 945, 768.
 */
class Version20170715165522SrcData extends AbstractMigration implements ContainerAwareInterface
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
        $admin = $em->getRepository('App:User')->findOneBy(['id' => 6]);
        
        $this->deleteUnusedPhDPub($admin, $em);
        $this->changePublisherType($admin, $em);
        $this->createPubParents($admin, $em);

        $em->flush();
    }
    /** Deletes the unused 'Ph.D. Dissertaion' publication source. */
    private function deleteUnusedPhDPub($admin, &$em)
    {
        $phdPub = $em->getRepository('App:Source')
            ->findOneBy(['id' => 24]);
        $phdPub->setUpdatedBy($admin);
        $em->remove($phdPub);        
    }
    /** Changes the 'University of Chicago' publication into a publisher. */
    private function changePublisherType($admin, &$em)
    {
        $src = $em->getRepository('App:Source')->findOneBy(['id' => 33]);
        $src->setSourceType($em->getRepository('App:SourceType')
                ->findOneBy(['id' => 1]));
        $src->setUpdatedBy($admin);
        $em->persist($src);
    }
    private function createPubParents($admin, &$em)
    {
        $this->addNewBookParents($admin, $em);
        $this->addPubsForCitPubs($admin, $em);
    }
    /** Adds new publications from the citation text of detached citations. */
    private function addNewBookParents($admin, &$em)
    {               // name,  parentSrc, childSrc,  yr
        $newPubs = [ 
            ['Nouragues. Dynamics and plant-animal interactions in a Neotropical rainforest', 447, 730, 2001 ],
            ['Columnar cacti and their mutualists', 471, 907, 2002 ]
        ];

        foreach ($newPubs as $pubData) {
            $pub = new Publication();
            $src = new Source();
            /** Set Publication Data */
            $pub->setDisplayName($pubData[0]);
            $pub->setPublicationType($em->getRepository('App:PublicationType')
                ->findOneBy(['id' => 2])); 
            $pub->setSource($src);
            $pub->setCreatedBy($admin);
            $pub->setUpdatedBy($admin);
            /** Set Source Data */
            $src->setDisplayName($pubData[0]);
            $src->setYear($pubData[3]);
            $src->setParentSource($em->getRepository('App:Source')
                ->findOneBy(['id' => $pubData[1]]));
            $src->setSourceType($em->getRepository('App:SourceType')
                ->findOneBy(['id' => 2])); 
            $src->setCreatedBy($admin);
            $src->setUpdatedBy($admin);
            $child = $em->getRepository('App:Source')
                ->findOneBy(['id' => $pubData[2]]);
            $child->setSourceType($em->getRepository('App:SourceType')
                ->findOneBy(['id' => 4])); 
            $child->setParentSource($src);
            $child->setUpdatedBy($admin);
            /** Persist */
            $em->persist($src);
            $em->persist($pub);
            $em->persist($child);
        }
    }
    private function addPubsForCitPubs($admin, &$em)
    {                   //citId, pubType, year, prntSrc, citType
        $citSrcs = [[945, 2, 1996, 33, 4], [768, 2, 1998, 33, 4], [736, 4, 1997, 448, 7], 
            [745, 4, 2004, 448, 7]];
     
        foreach ($citSrcs as $data) {
            $citSrc = $em->getRepository('App:Source')
                ->findOneBy(['id' => $data[0]]);
            $pub = new Publication();
            $src = new Source();
            /** Set Publication Data */
            $pub->setDisplayName($citSrc->getDisplayName());
            $pub->setPublicationType($em->getRepository('App:PublicationType')
                ->findOneBy(['id' => $data[1]])); 
            $pub->setSource($src);
            $pub->setCreatedBy($admin);
            $pub->setUpdatedBy($admin);
            /** Set Source Data */
            $src->setDisplayName($citSrc->getDisplayName());
            $src->setYear($data[2]);
            $src->setParentSource($em->getRepository('App:Source')
                ->findOneBy(['id' => $data[3]]));
            $src->setSourceType($em->getRepository('App:SourceType')
                ->findOneBy(['id' => 2])); 
            $src->setCreatedBy($admin);
            $src->setUpdatedBy($admin);
            /** Update Citation Data */
            $citSrc->setDisplayName($citSrc->getDisplayName().'-citation');   
            $em->persist($citSrc);
            $em->flush();  //Must flush in order to keep displaynames unique 
            $citSrc->setSourceType($em->getRepository('App:SourceType')
                ->findOneBy(['id' => 4])); 
            $cit = $citSrc->getCitation();
            $cit->setCitationType($em->getRepository('App:CitationType')
                ->findOneBy(['id' => $data[4]])); 
            $citSrc->setParentSource($src);
            $citSrc->setUpdatedBy($admin);
            /** Persist */
            $em->persist($citSrc);
            $em->persist($src);
            $em->persist($pub);
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
