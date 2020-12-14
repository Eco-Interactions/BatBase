<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use JMS\Serializer\Annotation as JMS;

/**
 * Group Root.
 *
 * @ORM\Table(name="group_root")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks
 * @JMS\ExclusionPolicy("all")
 */
class GroupRoot
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
     * @var string
     * JSON array with the rank IDs for each sub-rank in the sub-group.
     *
     * @ORM\Column(name="sub_ranks", type="string", length=255, nullable=false)
     * @JMS\Expose
     * @JMS\SerializedName("subRanks")
     */
    private $subRanks;

    /**
     * @ORM\ManyToOne(targetEntity="Group", cascade={"persist", "remove"})
     * @ORM\JoinColumn(nullable=false)
     */
    private $group;

    /**
     * @ORM\OneToOne(targetEntity="Taxon", inversedBy="group", cascade={"persist", "remove"})
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
     * Set subRanks.
     *
     * @param string $subRanks
     *
     * @return GroupRoot
     */
    public function setSubRanks($subRanks)
    {
        $this->subRanks = $subRanks;

        return $this;
    }

    /**
     * Get subRanks.
     *
     * @return string
     */
    public function getSubRanks()
    {
        return $this->subRanks;
    }

    /**
     * Set group.
     *
     * @param \App\Entity\Group $group
     *
     * @return GroupRoot
     */
    public function setGroup(\App\Entity\Group $group)
    {
        $this->group = $group;

        $group->addTaxon($this);

        return $this;
    }

    /**
     * Get group.
     *
     * @return \App\Entity\Group
     */
    public function getGroup()
    {
        return $this->group;
    }

    /**
     * Get Group Id
     * @JMS\VirtualProperty
     * @JMS\SerializedName("group")
     */
    public function getGroupId()
    {
        return $this->group->getId();
    }

    /**
     * Set Taxon.
     *
     * @param \App\Entity\Taxon $taxon
     *
     * @return GroupRoot
     */
    public function setTaxon(\App\Entity\Taxon $taxon)
    {
        $this->taxon = $taxon;

        $taxon->setGroup($this);

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
     * Set created datetime.
     *
     * @param \DateTime $createdAt
     *
     * @return GroupRoot
     */
    public function setCreated(\DateTime $createdAt)
    {
        $this->created = $createdAt;

        return $this;
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
     * Set createdBy user.
     *
     * @return \App\Entity\User
     */
    public function setCreatedBy(\App\Entity\User $user)
    {
        $this->createdBy = $user;
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
     * Set last-updated datetime.
     *
     * @param \DateTime $updatedAt
     *
     * @return GroupRoot
     */
    public function setUpdated(\DateTime $updatedAt)
    {
        $this->updated = $updatedAt;

        return $this;
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
     * Set last updated by user.
     *
     * @return \App\Entity\User
     */
    public function setUpdatedBy(\App\Entity\User $user)
    {
        $this->updatedBy = $user;
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
        return $group->getDisplayName() . ' ' . $taxon->getDisplayName();
    }
}
