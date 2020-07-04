<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use JMS\Serializer\Annotation as JMS;

/**
 * Realm.
 *
 * @ORM\Table(name="realm")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks
 * @JMS\ExclusionPolicy("all")
 */
class Realm
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
     * @var string
     * JSON array with the level IDs for each level to display for the realm.
     *
     * @ORM\Column(name="ui_levels", type="string", length=255, nullable=false)
     * @JMS\Expose
     * @JMS\SerializedName("uiLevelsShown")
     */
    private $uiLevelsShown;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(
     *     targetEntity="App\Entity\RealmRoot",
     *     mappedBy="realm",
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
     * @return Realm
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
     * @return Realm
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
     * Set uiLevelsShown.
     *
     * @param string $uiLevelsShown
     *
     * @return Realm
     */
    public function setUiLevelsShown($uiLevelsShown)
    {
        $this->uiLevelsShown = $uiLevelsShown;

        return $this;
    }

    /**
     * Get uiLevelsShown.
     *
     * @return string
     */
    public function getUiLevelsShown()
    {
        return $this->uiLevelsShown;
    }

    /**
     * Add a Taxon.
     *
     * @param \App\Entity\RealmRoot $realmRoot
     *
     * @return Realm
     */
    public function addTaxon(\App\Entity\RealmRoot $realmRoot)
    {
        $this->taxa[] = $realmRoot;

        return $this;
    }

    /**
     * Remove a Taxon.
     *
     * @param \App\Entity\RealmRoot $realmRoot
     */
    public function removeTaxon(\App\Entity\RealmRoot $realmRoot)
    {
        $this->taxa->removeElement($realmRoot);
    }

    /**
     * Get Taxa.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getTaxa()
    {
        $taxa = [];

        if (!is_array($this->taxa)) { return [];}

        foreach ($this->taxa as $realmRoot) {
            array_push($taxa, $realmRoot->getTaxon());
        }

        return $this->taxa;
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
