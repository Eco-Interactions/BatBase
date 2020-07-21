<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use JMS\Serializer\Annotation as JMS;
use JMS\Serializer\Annotation\Groups;

/**
 * Source.
 *
 * @ORM\Table(name="source")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks
 * @Gedmo\SoftDeleteable(fieldName="deletedAt", timeAware=false)
 * @JMS\ExclusionPolicy("all")
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
     * @ORM\Column(name="display_name", type="string", length=255, unique=true, nullable=false)
     * @JMS\Expose
     * @JMS\SerializedName("displayName")
     * @Groups({"normalized", "flattened"})
     */
    private $displayName;

    /**
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=255, nullable=true)
     * @JMS\Expose
     * @JMS\SerializedName("name")
     * @Groups({"normalized", "flattened"})
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(name="description", type="text", nullable=true)
     * @JMS\Expose
     * @Groups({"normalized", "flattened"})
     */
    private $description;

    /**
     * @var string
     *
     * @ORM\Column(name="year", type="string", length=255, nullable=true)
     * @JMS\Expose
     * @Groups({"normalized", "flattened"})
     */
    private $year;

    /**
     * @var string
     *
     * @ORM\Column(name="doi", type="string", length=255, nullable=true)
     * @JMS\Expose
     * @Groups({"normalized", "flattened"})
     */
    private $doi;

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
     * @var bool
     *
     * @ORM\Column(name="is_direct", type="boolean", nullable=true)
     * @JMS\Expose
     * @JMS\SerializedName("isDirect")
     * @Groups({"normalized", "flattened"})
     */
    private $isDirect;

    /**
     * @var \App\Entity\Source
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\Source", inversedBy="childSources")
     * @ORM\JoinColumn(name="parent_src_id", referencedColumnName="id", onDelete="SET NULL")
     * @JMS\Expose
     * @JMS\SerializedName("parent")
     * @Groups({"flattened"})
     */
    private $parentSource;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="App\Entity\Source", mappedBy="parentSource", fetch="EXTRA_LAZY")
     * @ORM\OrderBy({
     *     "description"="ASC"
     * })
     */
    private $childSources;

    /**
     * @var \App\Entity\SourceType
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\SourceType", inversedBy="sources")
     * @ORM\JoinColumn(name="type_id", referencedColumnName="id", nullable=false)
     */
    private $sourceType;

    /**
     * @ORM\ManyToMany(targetEntity="Tag", inversedBy="sources")
     * @ORM\JoinTable(name="source_tag")
     */
    private $tags;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="App\Entity\Interaction", mappedBy="source", fetch="EXTRA_LAZY")
     */
    private $interactions;

    /**
     * @var \App\Entity\Author
     *
     * @ORM\OneToOne(targetEntity="App\Entity\Author", mappedBy="source")
     * @JMS\Expose
     * @Groups({"flattened"})
     */
    private $author;

    /**
     * @var \App\Entity\Citation
     *
     * @ORM\OneToOne(targetEntity="App\Entity\Citation", mappedBy="source")
     * @JMS\Expose
     * @Groups({"flattened"})
     */
    private $citation;

    /**
     * @var \App\Entity\Publication
     *
     * @ORM\OneToOne(targetEntity="App\Entity\Publication", mappedBy="source")
     * @JMS\Expose
     * @Groups({"flattened"})
     */
    private $publication;

    /**
     * @var \App\Entity\Publisher
     *
     * @ORM\OneToOne(targetEntity="App\Entity\Publisher", mappedBy="source")
     * @JMS\Expose
     * @Groups({"flattened"})
     */
    private $publisher;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(
     *     targetEntity="App\Entity\Contribution",
     *     mappedBy="workSource",
     *     cascade={"remove"},
     *     orphanRemoval=true
     * )
     *
     * A collection of all Authors that contributed to a source work.
     */
    private $contributors;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(
     *     targetEntity="App\Entity\Contribution",
     *     mappedBy="authorSource",
     *     cascade={"remove"},
     *     orphanRemoval=true,
     *     fetch="EXTRA_LAZY"
     * )
     *
     * A collection of all works an Author source contributed to.
     */
    private $contributions;

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
     * @JMS\Expose
     * @JMS\SerializedName("serverUpdatedAt")
     * @Groups({"normalized", "flattened"})
     */
    private $updated;

    /**
     * @var User
     *
     * @Gedmo\Blameable(on="create")
     * @ORM\ManyToOne(targetEntity="App\Entity\User")
     * @ORM\JoinColumn(name="created_by", referencedColumnName="id")
     */
    private $createdBy;

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
        $this->contributors = new \Doctrine\Common\Collections\ArrayCollection();
        $this->contributions = new \Doctrine\Common\Collections\ArrayCollection();
        $this->childSources = new \Doctrine\Common\Collections\ArrayCollection();
        $this->interactions = new \Doctrine\Common\Collections\ArrayCollection();
        $this->tags = new \Doctrine\Common\Collections\ArrayCollection();
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
     * Set name.
     *
     * @param string $name
     *
     * @return Source
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
     * @return Source
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
     * @param \App\Entity\Source $parentSource
     *
     * @return Source
     */
    public function setParentSource(\App\Entity\Source $parentSource = null)
    {
        $this->parentSource = $parentSource;

        return $this;
    }

    /**
     * Get parent Source.
     *
     * @return \App\Entity\Source
     */
    public function getParentSource()
    {
        return $this->parentSource;
    }

    /**
     * Get the parent Source's id.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("parent")
     * @Groups({"normalized"})
     */
    public function getParentSourceId()
    {
        return $this->parentSource ? $this->parentSource->getId() : null;
    }

    /**
     * Add child Source.
     *
     * @param \App\Entity\Source $childSource
     *
     * @return Source
     */
    public function addChildSource(\App\Entity\Source $childSource)
    {
        $this->childSources[] = $childSource;
        $childSource->setParentSource($this);

        return $this;
    }

    /**
     * Remove child Source.
     *
     * @param \App\Entity\Source $childSource
     */
    public function removeChildSource(\App\Entity\Source $childSource)
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
     * Get an array of child Source ids.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("children")
     * @Groups({"normalized", "flattened"})
     *
     * @return array
     */
    public function getChildSourceIds()
    {
        if ($this->childSources) {
            $childIds = [];
            foreach ($this->childSources as $child) {
                array_push($childIds, $child->getId());
            }
            return $childIds;
        }
    }

    /**
     * Set SourceType.
     *
     * @param \App\Entity\SourceType $sourceType
     *
     * @return Source
     */
    public function setSourceType(\App\Entity\SourceType $sourceType)
    {
        $this->sourceType = $sourceType;

        return $this;
    }

    /**
     * Get SourceType.
     *
     * @return \App\Entity\SourceType
     */
    public function getSourceType()
    {
        return $this->sourceType;
    }

    /**
     * Get Source Type id and displayName.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("sourceType")
     * @Groups({"normalized", "flattened"})
     *
     * @return int
     */
    public function getSourceTypeData()
    {
        return [
            "id" => $this->sourceType->getId(),
            "displayName" => $this->sourceType->getDisplayName()
        ];
    }

    /**
     * Add Tag.
     *
     * @param \App\Entity\Tag $tag
     *
     * @return Source
     */
    public function addTag(\App\Entity\Tag $tag)
    {
        $this->tags[] = $tag;

        return $this;
    }

    /**
     * Remove Tag.
     *
     * @param \App\Entity\Tag $tag
     */
    public function removeTag(\App\Entity\Tag $tag)
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
     * Get an array of tag ids and displayNames.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("tags")
     * @Groups({"normalized", "flattened"})
     *
     * @return array
     */
    public function getTagData()
    {
        if ($this->tags) {
            $tagIds = [];
            foreach ($this->tags as $tag) {
                array_push(
                    $tagIds,
                    ["id" => $tag->getId(), "displayName" => $tag->getDisplayName()]
                );
            }
            return $tagIds;
        }
    }

    /**
     * Get an array of tag ids.
     *
     * @return array
     */
    public function getTagIds()
    {
        $tagIds = [];
        if ($this->tags) {
            foreach ($this->tags as $tag) { array_push($tagIds, $tag->getId()); }
        }
        return $tagIds;
    }

    /**
     * Add interaction.
     *
     * @param \App\Entity\Interaction $interaction
     *
     * @return Source
     */
    public function addInteraction(\App\Entity\Interaction $interaction)
    {
        $this->interactions[] = $interaction;

        return $this;
    }

    /**
     * Remove interaction.
     *
     * @param \App\Entity\Interaction $interaction
     */
    public function removeInteraction(\App\Entity\Interaction $interaction)
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
     * Returns an array of interactions ids.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("interactions")
     * @Groups({"normalized"})
     */
    public function getInteractionIds()
    {
        $intIds = [];
        foreach ($this->interactions as $interaction) {
            array_push($intIds, $interaction->getId());
        }
        return $intIds;
    }

    /**
     * Set author.
     *
     * @param \App\Entity\Author $author
     *
     * @return Source
     */
    public function setAuthor(\App\Entity\Author $author)
    {
        $this->author = $author;

        return $this;
    }

    /**
     * Get author.
     *
     * @return \App\Entity\Author
     */
    public function getAuthor()
    {
        return $this->author;
    }

    /**
     * If this is an Author Source, get the Author id.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("author")
     * @Groups({"normalized"})
     */
    public function getAuthorId()
    {
        return $this->author ? $this->author->getId() : null;
    }

    /**
     * Set citation.
     *
     * @param \App\Entity\Citation $citation
     *
     * @return Source
     */
    public function setCitation(\App\Entity\Citation $citation)
    {
        $this->citation = $citation;

        return $this;
    }

    /**
     * Get citation.
     *
     * @return \App\Entity\Citation
     */
    public function getCitation()
    {
        return $this->citation;
    }

    /**
     * If this is a Citation Source, get the Citation id.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("citation")
     * @Groups({"normalized"})
     */
    public function getCitationId()
    {
        return $this->citation ? $this->citation->getId() : null;
    }

    /**
     * Set publication.
     *
     * @param \App\Entity\Publication $publication
     *
     * @return Source
     */
    public function setPublication(\App\Entity\Publication $publication)
    {
        $this->publication = $publication;

        return $this;
    }

    /**
     * Remove publication.
     *
     * @return Source
     */
    public function removePublication()
    {
        $this->publication = null;

        return $this;
    }

    /**
     * Get publication.
     *
     * @return \App\Entity\Publication
     */
    public function getPublication()
    {
        return $this->publication;
    }

    /**
     * If this is a Publication Source, get the Publication id.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("publication")
     * @Groups({"normalized"})
     */
    public function getPublicationId()
    {
        return $this->publication ? $this->publication->getId() : null;
    }

    /**
     * Set publisher.
     *
     * @param \App\Entity\Publisher $publisher
     *
     * @return Source
     */
    public function setPublisher(\App\Entity\Publisher $publisher)
    {
        $this->publisher = $publisher;

        return $this;
    }

    /**
     * Get publisher.
     *
     * @return \App\Entity\Publisher
     */
    public function getPublisher()
    {
        return $this->publisher;
    }

    /**
     * If this is a Publisher Source, get the Publisher id.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("publisher")
     * @Groups({"normalized"})
     */
    public function getPublisherId()
    {
        return $this->publisher ? $this->publisher->getId() : null;
    }

    /**
     * Add an Contributor.
     *
     * @param \App\Entity\Contributon $contributor
     *
     * @return Source
     */
    public function addContributor(\App\Entity\Contribution $contributor)
    {
        $this->contributors[] = $contributor;

        return $this;
    }

    /**
     * Remove a Contributor.
     *
     * @param \App\Entity\Contribution $contributor
     */
    public function removeContributor(\App\Entity\Contribution $contributor)
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
     * Get Author Names
     * NOTE: Used for Interaction show pages
     * @JMS\VirtualProperty
     * @JMS\SerializedName("contributors")
     * @Groups({"flattened"})
     *
     * @return array
     */
    public function getAuthorNames()
    {
        $contribs = strpos($this->displayName, '(citation)') ?
            $this->parentSource->getContributors() : $this->contributors;

        return $this->getContributorsArray($contribs, 'DisplayName', 'all');
    }

    /**
     * Get Author Ids.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("authors")
     * @Groups({"normalized"})
     *
     * @return array
     */
    public function getAuthorIds()
    {
        return $this->getContributorsArray($this->contributors, 'Id', 'author');
    }

    /**
     * Get Editor Ids.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("editors")
     * @Groups({"normalized"})
     *
     * @return array
     */
    public function getEditorIds()
    {
        return $this->getContributorsArray($this->contributors, 'Id', 'editor');

    }

    private function getContributorsArray($contributors, $field, $types)
    {
        $getField = 'get'.$field;
        $contribs = [];

        foreach ($contributors as $contributor) {
            $type = $contributor->getIsEditor() ? 'editor' : 'author';
            if ($types !== 'all' && $type !== $types) { continue; }
            $data = $contributor->getAuthorSource()->$getField();
            $ord = $contributor->getOrd();
            $contribs = $contribs + [$ord => $this->getContribData($data, $types, $type)];
        }
        return count($contribs) > 0 ? $contribs : null;
    }
    private function getContribData($data, $types, $type)
    {
        return $types === 'all' ? [$type => $data] : $data;
    }

    /**
     * Get Author Ids with contribId and isEditor flag.
     *
     * @JMS\VirtualProperty
     * @JMS\SerializedName("contributors")
     * @Groups({"normalized"})
     * @return array
     */
    public function getContributorData()
    {
        $contribs = [];
        foreach ($this->contributors as $contributor) {
            $contribId = $contributor->getId();
            $authId = $contributor->getAuthorSource()->getId();
            $isEd = $contributor->getIsEditor();
            $ord =  $contributor->getOrd();
            $contribs = $contribs + [ $authId => [
                'contribId' => $contribId, 'isEditor' => $isEd, 'ord' => $ord]];
        }
        return $contribs;
    }

    /**
     * Add an Contribution.
     *
     * @param \App\Entity\Contributon $contribution
     *
     * @return Source
     */
    public function addContribution(\App\Entity\Contribution $contribution)
    {
        $this->contributions[] = $contribution;

        return $this;
    }

    /**
     * Remove a Contribution.
     *
     * @param \App\Entity\Contribution $contribution
     */
    public function removeContribution(\App\Entity\Contribution $contribution)
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
     * Get Contribution Ids.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("contributions")
     * @Groups({"normalized"})
     *
     * @return array
     */
    public function getContributonIds()
    {
        $contribIds = [];
        foreach ($this->contributions as $contribution) {
            array_push($contribIds, $contribution->getWorkSource()->getId());
        }
        return $contribIds;
    }

    /**
     * Set created datetime.
     *
     * @param \DateTime $createdAt
     *
     * @return Source
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
     * @param \App\Entity\User $user
     *
     * @return  Source
     */
    public function setCreatedBy(\App\Entity\User $user)
    {
        $this->createdBy = $user;

        return $this;
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
     * @return Source
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
     * @param \App\Entity\User $user
     *
     * @return  Source
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

        return !$user ? null : $user->getFirstName();
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