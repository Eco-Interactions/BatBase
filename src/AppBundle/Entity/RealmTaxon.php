<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * Realm Taxon.
 *
 * @ORM\Table(name="realm_taxon")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks
 */
class RealmTaxon
{
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * True if the taxon is the root of the realm's taxon tree.
     * @var bool
     *
     * @ORM\Column(name="is_root", type="boolean")
     */
    private $isRoot;

    /**
     * @ORM\ManyToOne(targetEntity="Realm", cascade={"persist", "remove"})
     * @ORM\JoinColumn(nullable=false)
     */
    private $realm;

    /**
     * @ORM\OneToOne(targetEntity="Taxon", inversedBy="realm", cascade={"persist", "remove"})
     * @ORM\JoinColumn(nullable=false)
     */
    private $taxon;

    /**
     * @var \DateTime
     *
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(type="datetime")
     */
    private $created;

    /**
     * @var User
     *
     * @Gedmo\Blameable(on="create")
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\User")
     * @ORM\JoinColumn(name="created_by", referencedColumnName="id")
     */
    private $createdBy;
    
    /**
     * @var \DateTime
     *
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(type="datetime")
     */
    private $updated;

    /**
     * @var User
     *
     * @Gedmo\Blameable(on="update")
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\User")
     * @ORM\JoinColumn(name="updated_by", referencedColumnName="id")
     */
    private $updatedBy;

    /**
     * Get id.
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set isRoot.
     *
     * @param bool $isRoot
     *
     * @return RealmTaxon
     */
    public function setIsRoot($isRoot = false)
    {
        $this->isRoot = $isRoot;

        return $this;
    }

    /**
     * Get isRoot.
     *
     * @return bool
     */
    public function getIsRoot()
    {
        return $this->isRoot;
    }

    /**
     * Set realm.
     *
     * @param \AppBundle\Entity\Realm $realm
     *
     * @return RealmTaxon
     */
    public function setRealm(\AppBundle\Entity\Realm $realm)
    {
        $this->realm = $realm;

        return $this;
    }

    /**
     * Get realm.
     *
     * @return \AppBundle\Entity\Realm
     */
    public function getRealm()
    {
        return $this->realm;
    }

    /**
     * Set Taxon.
     *
     * @param \AppBundle\Entity\Taxon $taxon
     *
     * @return RealmTaxon
     */
    public function setTaxon(\AppBundle\Entity\Taxon $taxon)
    {
        $this->taxon = $taxon;

        return $this;
    }

    /**
     * Get Taxon.
     *
     * @return \AppBundle\Entity\Taxon
     */
    public function getTaxon()
    {
        return $this->taxon;
    }

    /**
     * Set createdBy user.
     *
     * @return \AppBundle\Entity\User
     */
    public function setCreatedBy(\AppBundle\Entity\User $user)
    {
        $this->createdBy = $user;
    }

    /**
     * Get created datetime.
     *
     * @return \DateTime
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * Get createdBy user.
     *
     * @return \AppBundle\Entity\User
     */
    public function getCreatedBy()
    {
        return $this->createdBy;
    }

    /**
     * Set last updated by user.
     *
     * @return \AppBundle\Entity\User
     */
    public function setUpdatedBy(\AppBundle\Entity\User $user)
    {
        $this->updatedBy = $user;
    }

    /**
     * Get last updated datetime.
     *
     * @return \DateTime
     */
    public function getUpdated()
    {
        return $this->updated;
    }

    /**
     * Get last updated by user.
     *
     * @return \AppBundle\Entity\User
     */
    public function getUpdatedBy()
    {
        return $this->updatedBy;
    }

    /**
     * Get string representation of object.
     *
     * @return string
     */
    public function __toString()
    {
        return $realm->getDisplayName() . ' ' . $taxon->getDisplayName();
    }
}
