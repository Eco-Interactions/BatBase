<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use JMS\Serializer\Annotation as JMS;

/**
 * Group.
 *
 * @ORM\Table(name="`group`")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks
 * @JMS\ExclusionPolicy("all")
 */
class Group
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
     * @Gedmo\Slug(fields={"displayName"})
     * @ORM\Column(length=128, unique=true, nullable=true)
     */
    private $slug;

    /**
     * @var string
     *
     * @ORM\Column(name="display_name", type="string", length=255)
     * @JMS\Expose
     * @JMS\SerializedName("displayName")
     */
    private $displayName;

    /**
     * @var string
     *
     * @ORM\Column(name="plural_name", type="string", nullable=true)
     * @JMS\Expose
     * @JMS\SerializedName("pluralName")
     */
    private $pluralName;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(
     *     targetEntity="App\Entity\GroupRoot",
     *     mappedBy="group",
     *     cascade={"remove"},
     *     orphanRemoval=true,
     *     fetch="EXTRA_LAZY"
     * )
     *
     * A collection of all works an Author source contributed to.
     */
    private $taxa;

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
     * @JMS\VirtualProperty
     * @JMS\SerializedName("id")
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set slug.
     *
     * @return string
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;

        return $this;
    }

    /**
     * Get slug.
     *
     * @return string
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * Set displayName.
     *
     * @param string $displayName
     *
     * @return Group
     */
    public function setDisplayName($displayName)
    {
        $this->displayName = $displayName;

        return $this;
    }

    /**
     * Get displayName.
     *
     * @return string
     */
    public function getDisplayName()
    {
        return $this->displayName;
    }

    /**
     * Set pluralName.
     *
     * @param string $pluralName
     *
     * @return Group
     */
    public function setPluralName($pluralName)
    {
        $this->pluralName = $pluralName;

        return $this;
    }

    /**
     * Get pluralName.
     *
     * @return string
     */
    public function getPluralName()
    {
        return $this->pluralName;
    }

    /**
     * Add a Taxon.
     *
     * @param \App\Entity\GroupRoot $groupRoot
     *
     * @return Group
     */
    public function addTaxon(\App\Entity\GroupRoot $groupRoot)
    {
        $this->taxa[] = $groupRoot;

        return $this;
    }

    /**
     * Remove a Taxon.
     *
     * @param \App\Entity\GroupRoot $groupRoot
     */
    public function removeTaxon(\App\Entity\GroupRoot $groupRoot)
    {
        $this->taxa->removeElement($groupRoot);
    }

    /**
     * Get Taxa.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getTaxa()
    {
        $taxa = [];

        foreach ($this->taxa as $groupRoot) {
            array_push($taxa, $groupRoot->getTaxon());
        }

        return $this->taxa;
    }

    /**
     * Get Taxa for serialization.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("taxa")
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function serializeTaxa()
    {
        $taxa = [];

        foreach ($this->taxa as $groupRoot) {
            $taxon = $groupRoot->getTaxon();
            $taxa = array_merge($taxa, [ $taxon->getName() => [
                'displayName' => $taxon->getDisplayName(),
                'id' => $taxon->getId(),
                'name' => $taxon->getName(),
                'subRanks' => $groupRoot->getSubRanks()
            ]]);
        }
        ksort($taxa);
        return $taxa;
    }

    /**
     * Set created datetime.
     *
     * @param \DateTime $createdAt
     *
     * @return Group
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
     * @return Group
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

        return $this;
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
        return $this->getDisplayName();
    }
}
