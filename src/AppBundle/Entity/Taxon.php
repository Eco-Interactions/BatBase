<?php

namespace AppBundle\Entity;

use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\ORM\Mapping as ORM;

/**
 * Taxon.
 *
 * @ORM\Table(name="taxon")
 * @ORM\Entity(repositoryClass="AppBundle\Entity\TaxonRepository")
 * @ORM\HasLifecycleCallbacks
 * @Gedmo\SoftDeleteable(fieldName="deletedAt", timeAware=false)z
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
     * @ORM\Column(name="display_name", type="string", length=255)
     */
    private $displayName;

    /**
     * @var string
     *
     * @ORM\Column(name="default_guid", type="string", length=255, nullable=true)
     */
    private $defaultGuid;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_old_world", type="boolean", nullable=true)
     */
    private $isOldWorld;

    /**
     * @var string
     *
     * @ORM\Column(name="link_display", type="string", length=255, nullable=true)
     */
    private $linkDisplay;

    /**
     * @var string
     *
     * @ORM\Column(name="link_url", type="string", length=255, nullable=true)
     */
    private $linkUrl;

    /**
     * @var \AppBundle\Entity\Domain
     *
     * @ORM\OneToOne(targetEntity="AppBundle\Entity\Domain", mappedBy="taxon")
     */
    private $domain;

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
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="parent_taxon_id", referencedColumnName="id")
     * })
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
     * @var \AppBundle\Entity\Level
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Level", inversedBy="taxons")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="level_id", referencedColumnName="id")
     * })
     */
    private $level;

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
    public function addSubjectRole(\AppBundle\Entity\Interaction $subjectRoles)
    {
        $this->subjectRoles[] = $subjectRoles;

        return $this;
    }

    /**
     * Remove subjectRoles.
     *
     * @param \AppBundle\Entity\Interaction $subjectRoles
     */
    public function removeSubjectRole(\AppBundle\Entity\Interaction $subjectRoles)
    {
        $this->subjectRoles->removeElement($subjectRoles);
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
     * Set level.
     *
     * @param \AppBundle\Entity\Level $level
     *
     * @return Taxon
     */
    public function setLevel(\AppBundle\Entity\Level $level = null)
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
     * Set domain.
     *
     * @param \AppBundle\Entity\Domain $domain
     *
     * @return Taxon
     */
    public function setDomain(\AppBundle\Entity\Domain $domain = null)
    {
        $this->domain = $domain;

        return $this;
    }

    /**
     * Get domain.
     *
     * @return \AppBundle\Entity\Domain
     */
    public function getDomain()
    {
        return $this->domain;
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
    public function setUpdatedBy(\AppBundle\Entity\User $user = null)
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
        if ($this->getDisplayName()) {
            return $this->getDisplayName();
        }
        return 'Unnamed Taxon';
    }
}
