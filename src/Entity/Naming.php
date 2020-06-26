<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * Naming.
 *
 * @ORM\Table(name="naming")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks
 * @Gedmo\SoftDeleteable(fieldName="deletedAt", timeAware=false)
 */
class Naming
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
     * @var \DateTime
     *
     * @ORM\Column(name="from_date", type="datetime", nullable=true)
     */
    private $fromDate;

    /**
     * @var string
     *
     * @ORM\Column(name="guid", type="string", length=255, nullable=true)
     */
    private $guid;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="to_date", type="datetime", nullable=true)
     */
    private $toDate;

    /**
     * @var \App\Entity\Taxon
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\Taxon", inversedBy="namings")
     * @ORM\JoinColumn(name="taxon_id", referencedColumnName="id")
     */
    private $taxon;

    /**
     * @var \App\Entity\Taxonym
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\Taxonym")
     * @ORM\JoinColumn(name="taxonym_id", referencedColumnName="id")
     */
    private $taxonym;

    /**
     * @var \App\Entity\NamingType
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\NamingType")
     * @ORM\JoinColumn(name="naming_type_id", referencedColumnName="id")
     */
    private $namingType;

    /**
     * @var \App\Entity\Authority
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\Authority")
     * @ORM\JoinColumn(name="authority_id", referencedColumnName="id")
     */
    private $authority;

    /**
     * @var \App\Entity\Taxon
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\Taxon", inversedBy="childNamings")
     * @ORM\JoinColumn(name="parent_taxon_id", referencedColumnName="id")
     */
    private $parentTaxon;

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
     * @ORM\ManyToOne(targetEntity="App\Entity\User")
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
     * @ORM\ManyToOne(targetEntity="App\Entity\User")
     * @ORM\JoinColumn(name="updated_by", referencedColumnName="id")
     */
    private $updatedBy;

    /**
     * @ORM\Column(name="deletedAt", type="datetime", nullable=true)
     */
    private $deletedAt;

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
     * Set fromDate.
     *
     * @param \DateTime $fromDate
     *
     * @return Naming
     */
    public function setFromDate($fromDate)
    {
        $this->fromDate = $fromDate;

        return $this;
    }

    /**
     * Get fromDate.
     *
     * @return \DateTime
     */
    public function getFromDate()
    {
        return $this->fromDate;
    }

    /**
     * Set guid.
     *
     * @param string $guid
     *
     * @return Naming
     */
    public function setGuid($guid)
    {
        $this->guid = $guid;

        return $this;
    }

    /**
     * Get guid.
     *
     * @return string
     */
    public function getGuid()
    {
        return $this->guid;
    }

    /**
     * Set toDate.
     *
     * @param \DateTime $toDate
     *
     * @return Naming
     */
    public function setToDate($toDate)
    {
        $this->toDate = $toDate;

        return $this;
    }

    /**
     * Get toDate.
     *
     * @return \DateTime
     */
    public function getToDate()
    {
        return $this->toDate;
    }

    /**
     * Set taxon.
     *
     * @param \App\Entity\Taxon $taxon
     *
     * @return Naming
     */
    public function setTaxon(\App\Entity\Taxon $taxon = null)
    {
        $this->taxon = $taxon;

        return $this;
    }

    /**
     * Get taxon.
     *
     * @return \App\Entity\Taxon
     */
    public function getTaxon()
    {
        return $this->taxon;
    }

    /**
     * Set taxonym.
     *
     * @param \App\Entity\Taxonym $taxonym
     *
     * @return Naming
     */
    public function setTaxonym(\App\Entity\Taxonym $taxonym = null)
    {
        $this->taxonym = $taxonym;

        return $this;
    }

    /**
     * Get taxonym.
     *
     * @return \App\Entity\Taxonym
     */
    public function getTaxonym()
    {
        return $this->taxonym;
    }

    /**
     * Set namingType.
     *
     * @param \App\Entity\NamingType $namingType
     *
     * @return Naming
     */
    public function setNamingType(\App\Entity\NamingType $namingType = null)
    {
        $this->namingType = $namingType;

        return $this;
    }

    /**
     * Get namingType.
     *
     * @return \App\Entity\NamingType
     */
    public function getNamingType()
    {
        return $this->namingType;
    }

    /**
     * Set authority.
     *
     * @param \App\Entity\Authority $authority
     *
     * @return Naming
     */
    public function setAuthority(\App\Entity\Authority $authority = null)
    {
        $this->authority = $authority;

        return $this;
    }

    /**
     * Get authority.
     *
     * @return \App\Entity\Authority
     */
    public function getAuthority()
    {
        return $this->authority;
    }

    /**
     * Set parentTaxon.
     *
     * @param \App\Entity\Taxon $parentTaxon
     *
     * @return Naming
     */
    public function setParentTaxon(\App\Entity\Taxon $parentTaxon = null)
    {
        $this->parentTaxon = $parentTaxon;

        return $this;
    }

    /**
     * Get parentTaxon.
     *
     * @return \App\Entity\Taxon
     */
    public function getParentTaxon()
    {
        return $this->parentTaxon;
    }

    /**
     * Set createdBy user.
     *
     * @return \App\Entity\User
     */
    public function setCreatedBy(\App\Entity\User $user)
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
     * @return \App\Entity\User
     */
    public function getCreatedBy()
    {
        return $this->createdBy;
    }

    /**
     * Set last updated by user.
     *
     * @return \App\Entity\User
     */
    public function setUpdatedBy(\App\Entity\User $user = null)
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
     * @return \App\Entity\User
     */
    public function getUpdatedBy()
    {
        return $this->updatedBy;
    }

    /**
     * Set deleted at.
     *
     * @param \DateTime $deletedAt
     */
    public function setDeletedAt($deletedAt)
    {
        $this->deletedAt = $deletedAt;
    }

    /**
     * Get deleted at.
     *
     * @return \DateTime
     */
    public function getDeletedAt()
    {
        return $this->deletedAt;
    }

    /**
     * Get string representation of object.
     *
     * @return string
     */
    public function __toString()
    {
        $auth_name = $this->getAuthority()->getName();

        return $this->getTaxonym()->getName().' according to '.$auth_name;
    }
}
