<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use JMS\Serializer\Annotation as JMS;

/**
 * Realm Root.
 *
 * @ORM\Table(name="realm_root")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks
 * @JMS\ExclusionPolicy("all")
 */
class RealmRoot
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
     * Get id.
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set realm.
     *
     * @param \App\Entity\Realm $realm
     *
     * @return RealmRoot
     */
    public function setRealm(\App\Entity\Realm $realm)
    {
        $this->realm = $realm;

        $realm->addTaxon($this);

        return $this;
    }

    /**
     * Get realm.
     *
     * @return \App\Entity\Realm
     */
    public function getRealm()
    {
        return $this->realm;
    }
   
    /**
     * Get Realm Id
     * @JMS\VirtualProperty
     * @JMS\SerializedName("realm")
     */
    public function getRealmId()
    {
        return $this->realm->getId();
    }

    /**
     * Set Taxon.
     *
     * @param \App\Entity\Taxon $taxon
     *
     * @return RealmRoot
     */
    public function setTaxon(\App\Entity\Taxon $taxon)
    {
        $this->taxon = $taxon;

        $taxon->setRealm($this);

        return $this;
    }

    /**
     * Get Taxon.
     *
     * @return \App\Entity\Taxon
     */
    public function getTaxon()
    {
        return $this->taxon;
    }
   
    /**
     * Get Taxon Id
     * @JMS\VirtualProperty
     * @JMS\SerializedName("taxon")
     */
    public function getTaxonId()
    {
        return $this->taxon->getId();
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
    public function setUpdatedBy(\App\Entity\User $user)
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
     * Get string representation of object.
     *
     * @return string
     */
    public function __toString()
    {
        return $realm->getDisplayName() . ' ' . $taxon->getDisplayName();
    }
}
