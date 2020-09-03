<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use JMS\Serializer\Annotation as JMS;
use JMS\Serializer\Annotation\Groups;
use JMS\Serializer\Annotation\MaxDepth;


/**
 * Taxon.
 *
 * @ORM\Table(name="taxon")
 * @ORM\Entity(repositoryClass="App\Entity\TaxonRepository")
 * @ORM\HasLifecycleCallbacks
 * @Gedmo\SoftDeleteable(fieldName="deletedAt", timeAware=false)
 * @JMS\ExclusionPolicy("all")
 */
class Taxon
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
     * @ORM\Column(name="display_name", type="string", length=255, nullable=false)
     * @JMS\Expose
     * @JMS\SerializedName("displayName")
     * @Groups({"normalized", "flattened"})
     */
    private $displayName;

    /**
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=255, nullable=false)
     * @JMS\Expose
     * @JMS\SerializedName("name")
     * @Groups({"normalized", "flattened"})
     */
    private $name;

    /**
     * True if the taxon is the root of the realm's taxon tree.
     * @var bool
     *
     * @ORM\Column(name="is_root", type="boolean", nullable=true)
     * @JMS\Expose
     * @JMS\SerializedName("isRoot")
     * @Groups({"normalized", "flattened"})
     */
    private $isRoot;

    /**
     * @var string
     *
     * @ORM\Column(name="default_guid", type="string", length=255, nullable=true)
     * @JMS\Expose
     * @JMS\SerializedName("defaultGuid")
     * @Groups({"normalized", "flattened"})
     */
    private $defaultGuid;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_old_world", type="boolean", nullable=true)
     * @JMS\Expose
     * @JMS\SerializedName("isOldWorld")
     * @Groups({"normalized", "flattened"})
     */
    private $isOldWorld;

    /**
     * @var string
     *
     * @ORM\Column(name="link_display", type="string", length=255, nullable=true)
     * @JMS\Expose
     * @JMS\SerializedName("linkDisplay")
     * @Groups({"normalized", "flattened"})
     */
    private $linkDisplay;

    /**
     * @var string
     *
     * @ORM\Column(name="link_url", type="string", length=255, nullable=true)
     * @JMS\Expose
     * @JMS\SerializedName("linkUrl")
     * @Groups({"normalized", "flattened"})
     */
    private $linkUrl;

    /**
     * @var \App\Entity\Realm
     *
     * @ORM\OneToOne(targetEntity="App\Entity\RealmRoot", mappedBy="taxon", cascade={"persist", "remove"})
     */
    private $realm;

    /**
     * @var \App\Entity\Level
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\Level", inversedBy="taxons")
     * @ORM\JoinColumn(name="level_id", referencedColumnName="id", nullable=false)
     */
    private $level;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="App\Entity\Naming", mappedBy="taxon")
     */
    private $namings;

    /**
     * @var \App\Entity\Taxon
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\Taxon", inversedBy="childTaxa")
     * @ORM\JoinColumn(name="parent_taxon_id", referencedColumnName="id")
     * @JMS\Expose
     * @JMS\SerializedName("parentTaxon")
     * @Groups({"flattened"})
     */
    private $parentTaxon;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="App\Entity\Taxon", mappedBy="parentTaxon", fetch="EXTRA_LAZY")
     * @ORM\OrderBy({
     *     "displayName"="ASC"
     * })
     * @JMS\Expose
     * @JMS\SerializedName("childTaxa")
     * @MaxDepth(1)
     * @Groups({"flattened"})
     */
    private $childTaxa;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="App\Entity\Naming", mappedBy="parentTaxon")
     */
    private $childNamings;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="App\Entity\Interaction", mappedBy="subject", fetch="EXTRA_LAZY")
     */
    private $subjectRoles;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="App\Entity\Interaction", mappedBy="object", fetch="EXTRA_LAZY")
     */
    private $objectRoles;

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
     * @JMS\Expose
     * @JMS\SerializedName("serverUpdatedAt")
     * @Groups({"normalized", "flattened"})
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
     * Constructor.
     */
    public function __construct()
    {
        $this->namings = new \Doctrine\Common\Collections\ArrayCollection();
        $this->childTaxa = new \Doctrine\Common\Collections\ArrayCollection();
        $this->childNamings = new \Doctrine\Common\Collections\ArrayCollection();
        $this->subjectRoles = new \Doctrine\Common\Collections\ArrayCollection();
        $this->objectRoles = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /**
     * Get id.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("id")
     * @Groups({"normalized", "flattened"})
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
     * @return Taxon
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
     * Set name.
     *
     * @param string $name
     *
     * @return Taxon
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name.
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set isRoot.
     *
     * @param bool $isRoot
     *
     * @return Taxon
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
     * Set defaultGuid.
     *
     * @param string $defaultGuid
     *
     * @return Taxon
     */
    public function setDefaultGuid($defaultGuid)
    {
        $this->defaultGuid = $defaultGuid;

        return $this;
    }

    /**
     * Get defaultGuid.
     *
     * @return string
     */
    public function getDefaultGuid()
    {
        return $this->defaultGuid;
    }

    /**
     * Set isOldWorld.
     *
     * @param bool $isOldWorld
     *
     * @return Taxon
     */
    public function setIsOldWorld($isOldWorld)
    {
        $this->isOldWorld = $isOldWorld;

        return $this;
    }

    /**
     * Get isOldWorld.
     *
     * @return bool
     */
    public function getIsOldWorld()
    {
        return $this->isOldWorld;
    }

    /**
     * Set linkDisplay.
     *
     * @param string $linkDisplay
     *
     * @return Taxon
     */
    public function setLinkDisplay($linkDisplay)
    {
        $this->linkDisplay = $linkDisplay;

        return $this;
    }

    /**
     * Get linkDisplay.
     *
     * @return string
     */
    public function getLinkDisplay()
    {
        return $this->linkDisplay;
    }

    /**
     * Set linkUrl.
     *
     * @param string $linkUrl
     *
     * @return Taxon
     */
    public function setLinkUrl($linkUrl)
    {
        $this->linkUrl = $linkUrl;

        return $this;
    }

    /**
     * Get linkUrl.
     *
     * @return string
     */
    public function getLinkUrl()
    {
        return $this->linkUrl;
    }

    /**
     * Set Realm.
     *
     * @param \App\Entity\RealmRoot $realm
     *
     * @return Taxon
     */
    public function setRealm(\App\Entity\RealmRoot $realm)
    {
        $this->realm = $realm;

        return $this;
    }

    /**
     * Get Realm.
     *
     * @return \App\Entity\Realm
     */
    public function getRealm()
    {
        return $this->realm ? $this->realm->getRealm() : null;
    }

    /**
     * Get Realm data.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("realm")
     * @Groups({"flattened"})
     *
     * @return \App\Entity\Realm
     */
    public function getRealmData()
    {
        $realm = $this->getTaxonRealm();
        if (!$realm) { return null; }
        return [
            'id' => $realm->getId(),
            'displayName' => $realm->getDisplayName(),
            'pluralName' => $realm->getPluralName()
        ];
    }

    /**
     * Get Taxon Realm.
     *
     * @return Realm
     */
    public function getTaxonRealm()
    {
        return $this->findRealmAndReturnObj($this);
    }

    private function findRealmAndReturnObj($taxon)
    {
        if ($taxon->getSlug() === 'kingdom-animalia') { return false; }
        if ($taxon->getIsRoot()) { return $taxon->getRealm(); }
        $parent = $taxon->getParentTaxon();
        if (!$parent) { return false; }
        return $this->findRealmAndReturnObj($parent);
    }

    /**
     * Set level.
     *
     * @param \App\Entity\Level $level
     *
     * @return Taxon
     */
    public function setLevel(\App\Entity\Level $level)
    {
        $this->level = $level;

        return $this;
    }

    /**
     * Get level.
     *
     * @return \App\Entity\Level
     */
    public function getLevel()
    {
        return $this->level;
    }

    /**
     * Get level id and displayName.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("level")
     * @Groups({"normalized", "flattened"})
     */
    public function getLevelData()
    {
        return [
            "id" => $this->level->getId(),
            "displayName" => $this->level->getDisplayName()
        ];
    }

    /**
     * Add namings.
     *
     * @param \App\Entity\Naming $namings
     *
     * @return Taxon
     */
    public function addNaming(\App\Entity\Naming $namings)
    {
        $this->namings[] = $namings;

        return $this;
    }

    /**
     * Remove namings.
     *
     * @param \App\Entity\Naming $namings
     */
    public function removeNaming(\App\Entity\Naming $namings)
    {
        $this->namings->removeElement($namings);
    }

    /**
     * Get namings.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getNamings()
    {
        return $this->namings;
    }

    /**
     * Set parentTaxon.
     *
     * @param \App\Entity\Taxon $parentTaxon
     *
     * @return Taxon
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
     * Get the Parent Taxon's id.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("parent")
     * @Groups({"normalized"})
     */
    public function getParentTaxonId()
    {
        return $this->parentTaxon ? $this->parentTaxon->getId() : null;
    }

    /**
     * Add childTaxon.
     *
     * @param \App\Entity\Taxon $childTaxon
     *
     * @return Taxon
     */
    public function addChildTaxon(\App\Entity\Taxon $childTaxon)
    {
        $this->childTaxa[] = $childTaxon;

        return $this;
    }

    /**
     * Remove childTaxon.
     *
     * @param \App\Entity\Taxon $childTaxon
     */
    public function removeChildTaxon(\App\Entity\Taxon $childTaxon)
    {
        $this->childTaxa->removeElement($childTaxon);
    }

    /**
     * Get childTaxa.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getChildTaxa()
    {
        return $this->childTaxa;
    }

    /**
     * Get an array of child Taxon ids.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("children")
     * @Groups({"normalized"})
     *
     * @return array
     */
    public function getChildTaxonIds()
    {
        // if ($this->childTaxa) {
            $childIds = [];
            foreach ($this->childTaxa as $child) {
                array_push($childIds, $child->getId());
            }
            return $childIds;
        // }
    }

    /**
     * Add childNamings.
     *
     * @param \App\Entity\Naming $childNamings
     *
     * @return Taxon
     */
    public function addChildNaming(\App\Entity\Naming $childNamings)
    {
        $this->childNamings[] = $childNamings;

        return $this;
    }

    /**
     * Remove childNamings.
     *
     * @param \App\Entity\Naming $childNamings
     */
    public function removeChildNaming(\App\Entity\Naming $childNamings)
    {
        $this->childNamings->removeElement($childNamings);
    }

    /**
     * Get childNamings.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getChildNamings()
    {
        return $this->childNamings;
    }

    /**
     * Add subjectRoles.
     *
     * @param \App\Entity\Interaction $subjectRoles
     *
     * @return Taxon
     */
    public function addSubjectRole(\App\Entity\Interaction $subjectRole)
    {
        $this->subjectRoles[] = $subjectRole;

        return $this;
    }

    /**
     * Remove subjectRoles.
     *
     * @param \App\Entity\Interaction $subjectRoles
     */
    public function removeSubjectRole(\App\Entity\Interaction $subjectRole)
    {
        $this->subjectRoles->removeElement($subjectRole);
        $this->updated = new \DateTime('now');
    }

    /**
     * Get subjectRoles.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getSubjectRoles()
    {
        return $this->subjectRoles;
    }

    /**
     * Returns an array of ids for all interactions where the taxon was the subject.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("subjectRoles")
     * @Groups({"normalized"})
     */
    public function getSubjectRoleIds()
    {
        $interactions = $this->subjectRoles;
        return $this->getInteractionIds($interactions);
    }

    /**
     * Returns flattened interactions where the taxon was the subject.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("subjectRoles")
     * @Groups({"flattened"})
     */
    public function flattenSubjectRoles()
    {
        return $this->flattenTaxonInteractions($this->subjectRoles);
    }

    /**
     * Add objectRoles.
     *
     * @param \App\Entity\Interaction $objectRoles
     *
     * @return Taxon
     */
    public function addObjectRole(\App\Entity\Interaction $objectRoles)
    {
        $this->objectRoles[] = $objectRoles;

        return $this;
    }

    /**
     * Remove objectRoles.
     *
     * @param \App\Entity\Interaction $objectRoles
     */
    public function removeObjectRole(\App\Entity\Interaction $objectRoles)
    {
        $this->objectRoles->removeElement($objectRoles);
        $this->updated = new \DateTime('now');
    }

    /**
     * Get objectRoles.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getObjectRoles()
    {
        return $this->objectRoles;
    }

    /**
     * Returns an array of ids for all interactions where the taxon was the object.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("objectRoles")
     * @Groups({"normalized"})
     */
    public function getObjectRoleIds()
    {
        $interactions = $this->objectRoles;
        return $this->getInteractionIds($interactions);
    }

    /**
     * Returns flattened interactions where the taxon was the object.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("objectRoles")
     * @Groups({"flattened"})
     */
    public function flattenObjectRoles()
    {
        return $this->flattenTaxonInteractions($this->objectRoles);
    }

    /**
     * Returns an array of ids for all passed interactions.
     */
    public function getInteractionIds($interactions)
    {
        $allIntIds = [];

        foreach ($interactions as $interaction) {
            array_push($allIntIds, $interaction->getId());
        }
        return $allIntIds;
    }
    /* Used in DB MIGRATION */
    public function getAllInteractionIds()
    {
        return array_merge($this->getObjectRoleIds(), $this->getSubjectRoleIds());
    }

    public function flattenTaxonInteractions($interactions)
    {
        $flattened = [];
        foreach ($interactions as $int) {  //print("\n    COUNTRY [".$int->getLocation()->getCountryData()."]    \n");
            $flatInt = [
                'country' => !$int->getLocation()->getCountryData() ? 'Unspecified' :
                    explode('[', $int->getLocation()->getCountryData()['displayName'])[0],
                'id' => $int->getId(),
                'interactionType' => $int->getInteractionType()->getDisplayName(),
                'publication' => $int->getSource()->getParentSource()->getDisplayName(),
                'region' => $int->getLocation()->getRegionData()['displayName'],
            ];
            array_push($flattened, $flatInt);
        }
        return $flattened;
    }

    /**
     * Set created datetime.
     *
     * @param \DateTime $createdAt
     *
     * @return Taxon
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
     * @return Taxon
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
     * Get updated by user name.
     * Note: Returns null for records developer (ID = 6) modified
     * @JMS\VirtualProperty
     * @JMS\SerializedName("updatedBy")
     * @Groups({"normalized", "flattened"})
     *
     * @return string
     */
    public function serializeUpdatedBy()
    {
        $createdBy = $this->createdBy ?
            ($this->createdBy->getId() == 6 ? null : $this->createdBy) : null;
        $user = $this->updatedBy ?
            ($this->updatedBy->getId() == 6 ? null : $this->updatedBy) : $createdBy;

        return !$user ? null : $user->getUsername();
    }

    /**
     * Set deleted at.
     *
     * @param \DateTime $deletedAt
     */
    public function setDeletedAt($deletedAt)
    {
        $this->deletedAt = $deletedAt;

        return $this;
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
        return $this->getDisplayName();
    }
}
