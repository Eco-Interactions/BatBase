<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use JMS\Serializer\Annotation as JMS;

/**
 * Taxon.
 *
 * @ORM\Table(name="taxon")
 * @ORM\Entity(repositoryClass="AppBundle\Entity\TaxonRepository")
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
     * @JMS\Expose
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
     * @ORM\Column(name="default_guid", type="string", length=255, nullable=true)
     * @JMS\Expose
     * @JMS\SerializedName("defaultGuid")
     */
    private $defaultGuid;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_old_world", type="boolean", nullable=true)
     * @JMS\Expose
     * @JMS\SerializedName("isOldWorld")
     */
    private $isOldWorld;

    /**
     * @var string
     *
     * @ORM\Column(name="link_display", type="string", length=255, nullable=true)
     * @JMS\Expose
     * @JMS\SerializedName("linkDisplay")
     */
    private $linkDisplay;

    /**
     * @var string
     *
     * @ORM\Column(name="link_url", type="string", length=255, nullable=true)
     * @JMS\Expose
     * @JMS\SerializedName("linkUrl")
     */
    private $linkUrl;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_realm", type="boolean")
     * @JMS\Expose
     * @JMS\SerializedName("isRealm")
     */
    private $isRealm = false;

    /**
     * @var \AppBundle\Entity\Realm
     *
     * @ORM\OneToOne(targetEntity="AppBundle\Entity\Realm", mappedBy="taxon")
     */
    private $realm;

    /**
     * @var \AppBundle\Entity\Level
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Level", inversedBy="taxons")
     * @ORM\JoinColumn(name="level_id", referencedColumnName="id", nullable=false)
     */
    private $level;
    
    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Naming", mappedBy="taxon")
     */
    private $namings;

    /**
     * @var \AppBundle\Entity\Taxon
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Taxon", inversedBy="childTaxa")
     * @ORM\JoinColumn(name="parent_taxon_id", referencedColumnName="id")
     */
    private $parentTaxon;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Taxon", mappedBy="parentTaxon")
     * @ORM\OrderBy({
     *     "displayName"="ASC"
     * })
     */
    private $childTaxa;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Naming", mappedBy="parentTaxon")
     */
    private $childNamings;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Interaction", mappedBy="subject")
     */
    private $subjectRoles;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Interaction", mappedBy="object")
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
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\User")
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
     * Set isRealm.
     *
     * @param bool $isRealm
     *
     * @return Taxon
     */
    public function setIsRealm($isRealm)
    {
        $this->isRealm = $isRealm;

        return $this;
    }

    /**
     * Get isRealm.
     *
     * @return bool
     */
    public function getIsRealm()
    {
        return $this->isRealm;
    }

    /**
     * Set realm.
     *
     * @param \AppBundle\Entity\Realm $realm
     *
     * @return Taxon
     */
    public function setRealm(\AppBundle\Entity\Realm $realm = null)
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
     * Get id.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("realm")
     *
     * @return int
     */
    public function serializeRealm()
    {
        return $this->findRealmAndReturnObj($this);
    }
    
    private function findRealmAndReturnObj($taxon)
    {
        if ($taxon->getSlug() === 'animalia') { return []; } 
        $realm = $taxon->getRealm();
        if ($realm) {
            return [ 
                "id" => $realm->getId(), 
                "displayName" => $realm->getDisplayName() ];
        }
        return $this->findRealmAndReturnObj($taxon->getParentTaxon());
    }

    /**
     * Set level.
     *
     * @param \AppBundle\Entity\Level $level
     *
     * @return Taxon
     */
    public function setLevel(\AppBundle\Entity\Level $levell)
    {
        $this->level = $level;

        return $this;
    }

    /**
     * Get level.
     *
     * @return \AppBundle\Entity\Level
     */
    public function getLevel()
    {
        return $this->level;
    }

    /**
     * Get level id and displayName.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("level")
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
     * @param \AppBundle\Entity\Naming $namings
     *
     * @return Taxon
     */
    public function addNaming(\AppBundle\Entity\Naming $namings)
    {
        $this->namings[] = $namings;

        return $this;
    }

    /**
     * Remove namings.
     *
     * @param \AppBundle\Entity\Naming $namings
     */
    public function removeNaming(\AppBundle\Entity\Naming $namings)
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
     * @param \AppBundle\Entity\Taxon $parentTaxon
     *
     * @return Taxon
     */
    public function setParentTaxon(\AppBundle\Entity\Taxon $parentTaxon = null)
    {
        $this->parentTaxon = $parentTaxon;

        return $this;
    }

    /**
     * Get parentTaxon.
     *
     * @return \AppBundle\Entity\Taxon
     */
    public function getParentTaxon()
    {
        return $this->parentTaxon;
    }

    /**
     * Get the Parent Taxon's id.   
     * @JMS\VirtualProperty
     * @JMS\SerializedName("parent")
     */
    public function getParentTaxonId()
    {
        return $this->parentTaxon ? $this->parentTaxon->getId() : null;
    }

    /**
     * Add childTaxa.
     *
     * @param \AppBundle\Entity\Taxon $childTaxa
     *
     * @return Taxon
     */
    public function addChildTaxa(\AppBundle\Entity\Taxon $childTaxa)
    {
        $this->childTaxa[] = $childTaxa;

        return $this;
    }

    /**
     * Remove childTaxa.
     *
     * @param \AppBundle\Entity\Taxon $childTaxa
     */
    public function removeChildTaxa(\AppBundle\Entity\Taxon $childTaxa)
    {
        $this->childTaxa->removeElement($childTaxa);
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
     *
     * @return array
     */
    public function getChildTaxonIds()
    {
        if ($this->childTaxa) {
            $childIds = [];
            foreach ($this->childTaxa as $child) {
                array_push($childIds, $child->getId());
            }
            return $childIds;
        }
    }

    /**
     * Add childNamings.
     *
     * @param \AppBundle\Entity\Naming $childNamings
     *
     * @return Taxon
     */
    public function addChildNaming(\AppBundle\Entity\Naming $childNamings)
    {
        $this->childNamings[] = $childNamings;

        return $this;
    }

    /**
     * Remove childNamings.
     *
     * @param \AppBundle\Entity\Naming $childNamings
     */
    public function removeChildNaming(\AppBundle\Entity\Naming $childNamings)
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
     * @param \AppBundle\Entity\Interaction $subjectRoles
     *
     * @return Taxon
     */
    public function addSubjectRole(\AppBundle\Entity\Interaction $subjectRole)
    {
        $this->subjectRoles[] = $subjectRole;

        return $this;
    }

    /**
     * Remove subjectRoles.
     *
     * @param \AppBundle\Entity\Interaction $subjectRoles
     */
    public function removeSubjectRole(\AppBundle\Entity\Interaction $subjectRole)
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
     */
    public function getSubjectRoleIds()
    {
        $interactions = $this->subjectRoles;
        return $this->getInteractionids($interactions);
    }

    /**
     * Add objectRoles.
     *
     * @param \AppBundle\Entity\Interaction $objectRoles
     *
     * @return Taxon
     */
    public function addObjectRole(\AppBundle\Entity\Interaction $objectRoles)
    {
        $this->objectRoles[] = $objectRoles;

        return $this;
    }

    /**
     * Remove objectRoles.
     *
     * @param \AppBundle\Entity\Interaction $objectRoles
     */
    public function removeObjectRole(\AppBundle\Entity\Interaction $objectRoles)
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
     */
    public function getObjectRoleIds()
    {
        $interactions = $this->objectRoles;
        return $this->getInteractionids($interactions);
    }
    // CURRENTLY ONLY USED IN DOCTRINE MIGRATIONS 
    public function getInteractions()
    {
        $subj = $this->getSubjectRoles();  
        $obj = $this->getObjectRoles();     

        return count($subj) > 0 ? $subj : $obj;
    }

    /**
     * Returns an array of ids for all passed interactions. 
     */
    public function getInteractionids($interactions)
    {
        $allIntIds = [];

        foreach ($interactions as $interaction) {
            array_push($allIntIds, $interaction->getId());
        }
        return $allIntIds;
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
     * @return \AppBundle\Entity\User
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
     *
     * @return string
     */
    public function serializeUpdatedBy()
    {
        $createdBy = $this->createdBy ? 
            ($this->createdBy->getId() == 6 ? null : $this->createdBy) : null;
        $user = $this->updatedBy ? 
            ($this->updatedBy->getId() == 6 ? null : $this->updatedBy) : $createdBy;

        return !$user ? null : $user->getFirstName();
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
        if ($this->getDisplayName()) {
            return $this->getDisplayName();
        }
        return 'Unnamed Taxon';
    }
}
