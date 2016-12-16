<?php

namespace AppBundle\Entity;

use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\ORM\Mapping as ORM;

/**
 * Source.
 *
 * @ORM\Table(name="source")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks
 * @Gedmo\SoftDeleteable(fieldName="deletedAt", timeAware=false)
 */
class Source
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
     *
     * @ORM\Column(name="display_name", type="string", length=255, unique=true)
     */
    private $displayName;

    /**
     * @var string
     *
     * @ORM\Column(name="description", type="text", nullable=true)
     */
    private $description;

    /**
     * @var string
     *
     * @ORM\Column(name="year", type="string", length=255, nullable=true)
     */
    private $year;

    /**
     * @var string
     *
     * @ORM\Column(name="doi", type="string", length=255, nullable=true)
     */
    private $doi;

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
     * @var bool
     *
     * @ORM\Column(name="is_citation", type="boolean", nullable=true)
     */
    private $isCitation;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_direct", type="boolean", nullable=true)
     */
    private $isDirect;

    /**
     * @var \AppBundle\Entity\Source
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Source", inversedBy="childSources")
     * @ORM\JoinColumn(name="parent_src_id", referencedColumnName="id", onDelete="SET NULL")
     */
    private $parentSource;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Source", mappedBy="parentSource")
     * @ORM\OrderBy({
     *     "description"="ASC"
     * })
     */
    private $childSources;

    /**
     * @var \AppBundle\Entity\SourceType
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\SourceType", inversedBy="sources")
     * @ORM\JoinColumn(name="source_type_id", referencedColumnName="id")
     */
    private $sourceType;

    /**
     * @ORM\ManyToMany(targetEntity="Tag", mappedBy="sources")
     * @ORM\JoinTable(name="source_tag")
     */
    private $tags;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Interaction", mappedBy="source")
     */
    private $interactions;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Contribution", mappedBy="workSource")

     * A collection of all Authors that contributed to a source work.
     */
    private $contributors;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Contribution", mappedBy="authorSource")
     *
     * A collection of all works an Author source contributed to.
     */
    private $contributions;

    /**
     * @var \AppBundle\Entity\Publication
     *
     * @ORM\OneToOne(targetEntity="AppBundle\Entity\Publication", mappedBy="source")
     */
    private $publication;

    /**
     * @var \AppBundle\Entity\Author
     *
     * @ORM\OneToOne(targetEntity="AppBundle\Entity\Author", mappedBy="source")
     */
    private $author;

    /**
     * @var \AppBundle\Entity\Citation
     *
     * @ORM\OneToOne(targetEntity="AppBundle\Entity\Citation", mappedBy="source")
     */
    private $citation;

    /**
     * @var \DateTime
     *
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(type="datetime")
     */
    private $created;

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
     * @Gedmo\Blameable(on="create")
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\User")
     * @ORM\JoinColumn(name="created_by", referencedColumnName="id")
     */
    private $createdBy;

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
        $this->contributors = new \Doctrine\Common\Collections\ArrayCollection();
        $this->contributions = new \Doctrine\Common\Collections\ArrayCollection();
        $this->childSources = new \Doctrine\Common\Collections\ArrayCollection();
        $this->interactions = new \Doctrine\Common\Collections\ArrayCollection();
        $this->tags = new \Doctrine\Common\Collections\ArrayCollection();
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
     * Set displayName.
     *
     * @param string $displayName
     *
     * @return Source
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
     * Set description.
     *
     * @param string $description
     *
     * @return Source
     */
    public function setDescription($description)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * Get description.
     *
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * Set year.
     *
     * @param string $year
     *
     * @return Source
     */
    public function setYear($year)
    {
        $this->year = $year;

        return $this;
    }

    /**
     * Get year.
     *
     * @return string
     */
    public function getYear()
    {
        return $this->year;
    }

    /**
     * Set doi.
     *
     * @param string $doi
     *
     * @return Source
     */
    public function setDoi($doi)
    {
        $this->doi = $doi;

        return $this;
    }

    /**
     * Get doi.
     *
     * @return string
     */
    public function getDoi()
    {
        return $this->doi;
    }

    /**
     * Set linkDisplay.
     *
     * @param string $linkDisplay
     *
     * @return Source
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
     * @return Source
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
     * Set isDirect.
     *
     * @param bool $isDirect
     *
     * @return Interaction
     */
    public function setIsDirect($isDirect)
    {
        $this->isDirect = $isDirect;

        return $this;
    }

    /**
     * Get isDirect.
     *
     * @return bool
     */
    public function getIsDirect()
    {
        return $this->isDirect;
    }

    /**
     * Set parent Source.
     *
     * @param \AppBundle\Entity\Source $parentSource
     *
     * @return Source
     */
    public function setParentSource(\AppBundle\Entity\Source $parentSource)
    {
        $this->parentSource = $parentSource;

        return $this;
    }

    /**
     * Get parent Source.
     *
     * @return \AppBundle\Entity\Source
     */
    public function getParentSource()
    {
        return $this->parentSource;
    }

    /**
     * Add child Source.
     *
     * @param \AppBundle\Entity\Source $childSource
     *
     * @return Source
     */
    public function addChildSource(\AppBundle\Entity\Source $childSource)
    {
        $this->childSources[] = $childSource;
        $childSource->setParentSource($this);

        return $this;
    }

    /**
     * Remove child Source.
     *
     * @param \AppBundle\Entity\Source $childSource
     */
    public function removeChildSource(\AppBundle\Entity\Source $childSource)
    {
        $this->childSources->removeElement($childSource);
    }

    /**
     * Get child Sources.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getChildSources()
    {
        return $this->childSources;
    }

    /**
     * Set SourceType.
     *
     * @param \AppBundle\Entity\SourceType $sourceType
     *
     * @return Source
     */
    public function setSourceType(\AppBundle\Entity\SourceType $sourceType)
    {
        $this->sourceType = $sourceType;

        return $this;
    }

    /**
     * Get SourceType.
     *
     * @return \AppBundle\Entity\SourceType
     */
    public function getSourceType()
    {
        return $this->sourceType;
    }

    /**
     * Add Tag.
     *
     * @param \AppBundle\Entity\Tag $tag
     *
     * @return Interaction
     */
    public function addTag(\AppBundle\Entity\Tag $tag)
    {
        $this->tags[] = $tag;

        return $this;
    }

    /**
     * Remove Tag.
     *
     * @param \AppBundle\Entity\Tag $tag
     */
    public function removeTag(\AppBundle\Entity\Tag $tag)
    {
        $this->tags->removeElement($tag);
    }

    /**
     * Get tags.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getTags()
    {
        return $this->tags;
    }

    /**
     * Add interaction.
     *
     * @param \AppBundle\Entity\Interaction $interaction
     *
     * @return Source
     */
    public function addInteraction(\AppBundle\Entity\Interaction $interaction)
    {
        $this->interactions[] = $interaction;

        return $this;
    }

    /**
     * Remove interaction.
     *
     * @param \AppBundle\Entity\Interaction $interaction
     */
    public function removeInteraction(\AppBundle\Entity\Interaction $interaction)
    {
        $this->interactions->removeElement($interaction);
    }

    /**
     * Get interactions.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getInteractions()
    {
        return $this->interactions;
    }

    /**
     * Add an Contributor.
     *
     * @param \AppBundle\Entity\Contributon $contributor
     *
     * @return Source
     */
    public function addContributor(\AppBundle\Entity\Contribution $contributor)
    {
        $this->contributors[] = $contributor;

        return $this;
    }

    /**
     * Remove a Contributor.
     *
     * @param \AppBundle\Entity\Contribution $contributor
     */
    public function removeContributor(\AppBundle\Entity\Contribution $contributor)
    {
        $this->contributors->removeElement($contributor);
    }

    /**
     * Get Contributors.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getContributors()
    {
        return $this->contributors;
    }

    /**
     * Add an Contribution.
     *
     * @param \AppBundle\Entity\Contributon $contribution
     *
     * @return Source
     */
    public function addContribution(\AppBundle\Entity\Contribution $contribution)
    {
        $this->contributions[] = $contribution;

        return $this;
    }

    /**
     * Remove a Contribution.
     *
     * @param \AppBundle\Entity\Contribution $contribution
     */
    public function removeContribution(\AppBundle\Entity\Contribution $contribution)
    {
        $this->contributions->removeElement($contribution);
    }

    /**
     * Get Contributions.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getContributions()
    {
        return $this->contributions;
    }
    /**
     * Add a Citation.
     *
     * @param \AppBundle\Entity\Citation $citation
     *
     * @return Source
     */
    public function addCitation(\AppBundle\Entity\Citation $citation)
    {
        $this->citations[] = $citation;

        return $this;
    }

    /**
     * Remove a Citation.
     *
     * @param \AppBundle\Entity\Citation $citation
     */
    public function removeCitation(\AppBundle\Entity\Citation $citation)
    {
        $this->citations->removeElement($citation);
    }

    /**
     * Get Citations.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getCitations()
    {
        return $this->citations;
    }

    /**
     * Set publication.
     *
     * @param \AppBundle\Entity\Publication $publication
     *
     * @return Source
     */
    public function setPublication(\AppBundle\Entity\Publication $publication)
    {
        $this->publication = $publication;

        return $this;
    }

    /**
     * Get publication.
     *
     * @return \AppBundle\Entity\Publication
     */
    public function getPublication()
    {
        return $this->publication;
    }

    /**
     * Set author.
     *
     * @param \AppBundle\Entity\Author $author
     *
     * @return Source
     */
    public function setAuthor(\AppBundle\Entity\Author $author)
    {
        $this->author = $author;

        return $this;
    }

    /**
     * Get author.
     *
     * @return \AppBundle\Entity\Author
     */
    public function getAuthor()
    {
        return $this->author;
    }

    /**
     * Set citation.
     *
     * @param \AppBundle\Entity\Citation $citation
     *
     * @return Source
     */
    public function setCitation(\AppBundle\Entity\Citation $citation)
    {
        $this->citation = $citation;

        return $this;
    }

    /**
     * Get citation.
     *
     * @return \AppBundle\Entity\Citation
     */
    public function getCitation()
    {
        return $this->citation;
    }

    /**
     * Set createdBy user.
     *
     * @param \AppBundle\Entity\User $user
     *
     * @return  Source
     */
    public function setCreatedBy(\AppBundle\Entity\User $user)
    {
        $this->createdBy = $user;

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
     * @param \AppBundle\Entity\User $user
     *
     * @return  Source
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