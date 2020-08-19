<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use JMS\Serializer\Annotation as JMS;
use JMS\Serializer\Annotation\Groups;

/**
 * Interaction.
 *
 * @ORM\Table(name="interaction")
 * @ORM\Entity(repositoryClass="App\Entity\InteractionRepository")
 * @ORM\HasLifecycleCallbacks
 * @Gedmo\SoftDeleteable(fieldName="deletedAt", timeAware=false)
 * @JMS\ExclusionPolicy("all")
 */
class Interaction
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
     * @ORM\Column(name="note", type="string", length=255, nullable=true)
     * @JMS\Expose
     * @Groups({"normalized", "flattened"})
     */
    private $note;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_likely", type="boolean", nullable=true)
     * @JMS\Expose
     * @JMS\SerializedName("isLikely")
     * @Groups({"normalized", "flattened"})
     */
    private $isLikely;

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
     * @var \App\Entity\Source
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\Source", inversedBy="interactions")
     * @ORM\JoinColumn(name="source_id", referencedColumnName="id", nullable=false)
     * @JMS\Expose
     * @Groups({"flattened"})
     */
    private $source;

    /**
     * @var \App\Entity\InteractionType
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\InteractionType", inversedBy="interactions")
     * @ORM\JoinColumn(name="type_id", referencedColumnName="id", nullable=false)
     */
    private $interactionType;

    /**
     * @var \App\Entity\Location
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\Location", inversedBy="interactions")
     * @ORM\JoinColumn(name="location_id", referencedColumnName="id", nullable=false)
     * @JMS\Expose
     * @Groups({"flattened"})
     */
    private $location;

    /**
     * @var \App\Entity\Taxon
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\Taxon", inversedBy="subjectRoles")
     * @ORM\JoinColumn(name="subject_taxon_id", referencedColumnName="id", nullable=false)
     * @JMS\Expose
     * @Groups({"flattened"})
     */
    private $subject;

    /**
     * @var \App\Entity\Taxon
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\Taxon", inversedBy="objectRoles")
     * @ORM\JoinColumn(name="object_taxon_id", referencedColumnName="id", nullable=false)
     * @JMS\Expose
     * @Groups({"flattened"})
     */
    private $object;

    /**
     * @ORM\ManyToMany(targetEntity="Tag", inversedBy="interactions")
     * @ORM\JoinTable(name="interaction_tag")
     */
    private $tags;

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
     * Set note.
     *
     * @param string $note
     *
     * @return Note
     */
    public function setNote($note)
    {
        $this->note = $note;

        return $this;
    }

    /**
     * Get note.
     *
     * @return note
     */
    public function getNote()
    {
        return $this->note;
    }

    /**
     * Set isLikely.
     *
     * @param bool $isLikely
     *
     * @return Interaction
     */
    public function setIsLikely($isLikely)
    {
        $this->isLikely = $isLikely;

        return $this;
    }

    /**
     * Get isLikely.
     *
     * @return bool
     */
    public function getIsLikely()
    {
        return $this->isLikely;
    }

    /**
     * Set isOldWorld.
     *
     * @param bool $isOldWorld
     *
     * @return Interaction
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
     * Set source.
     *
     * @param \App\Entity\Source $source
     *
     * @return Interaction
     */
    public function setSource(\App\Entity\Source $source)
    {
        $this->source = $source;

        return $this;
    }

    /**
     * Get source.
     *
     * @return \App\Entity\Source
     */
    public function getSource()
    {
        return $this->source;
    }

    /**
     * Get the Source id.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("source")
     * @Groups({"normalized"})
     */
    public function getSourceId()
    {
        return $this->source->getId();
    }

    /**
     * Set interactionType.
     *
     * @param \App\Entity\InteractionType $interactionType
     *
     * @return Interaction
     */
    public function setInteractionType(\App\Entity\InteractionType $interactionType)
    {
        $this->interactionType = $interactionType;

        return $this;
    }

    /**
     * Get interactionType.
     *
     * @return \App\Entity\InteractionType
     */
    public function getInteractionType()
    {
        return $this->interactionType;
    }

    /**
     * Get the Interaction Type id and displayName.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("interactionType")
     * @Groups({"normalized"})
     */
    public function getInteractionTypeSummaryData()
    {
        if ($this->interactionType) {
            return [
                'id' => $this->interactionType->getId(),
                'displayName' => $this->interactionType->getDisplayName()
            ];
        }
        return null;
    }

    /**
     * Get the Interaction Type id and displayName.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("interactionType")
     * @Groups({"flattened"})
     */
    public function getAllInteractionTypeData()
    {
        if ($this->interactionType) {
            return [
                'id' => $this->interactionType->getId(),
                'displayName' => $this->interactionType->getDisplayName(),
                'activeForm' => $this->interactionType->getActiveForm(),
                'passiveForm' => $this->interactionType->getPassiveForm()
            ];
        }
        return null;
    }

    /**
     * Set location.
     *
     * @param \App\Entity\Location $location
     *
     * @return Interaction
     */
    public function setLocation(\App\Entity\Location $location)
    {
        $this->location = $location;

        return $this;
    }

    /**
     * Get location.
     *
     * @return \App\Entity\Location
     */
    public function getLocation()
    {
        return $this->location;
    }

    /**
     * Get the Location id.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("location")
     * @Groups({"normalized"})
     */
    public function getLocationId()
    {
        return $this->location->getId();
    }

    /**
     * Set subject.
     *
     * @param \App\Entity\Taxon $subject
     *
     * @return Interaction
     */
    public function setSubject(\App\Entity\Taxon $subject)
    {
        if ($this->subject) { $this->subject->removeSubjectRole($this); }
        $this->subject = $subject;

        return $this;
    }

    /**
     * Get subject.
     *
     * @return \App\Entity\Taxon
     */
    public function getSubject()
    {
        return $this->subject;
    }

    /**
     * Get the Subject id.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("subject")
     * @Groups({"normalized"})
     */
    public function getSubjectId()
    {
        return $this->subject->getId();
    }

    /**
     * Set object.
     *
     * @param \App\Entity\Taxon $object
     *
     * @return Interaction
     */
    public function setObject(\App\Entity\Taxon $object)
    {
        if ($this->object) { $this->object->removeObjectRole($this); }
        $this->object = $object;

        return $this;
    }

    /**
     * Get object.
     *
     * @return \App\Entity\Taxon
     */
    public function getObject()
    {
        return $this->object;
    }

    /**
     * Get the Object id.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("object")
     * @Groups({"normalized"})
     */
    public function getObjectId()
    {
        return $this->object->getId();
    }

    /**
     * Get the Object id.
     * Note: Used for filtering the database by object realm.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("objRealm")
     * @Groups({"normalized"})
     */
    public function getObjectRealmId()
    {
        return $this->object->getTaxonRealm()->getId();
    }

    /**
     * Add Tag.
     *
     * @param \App\Entity\Tag $tag
     *
     * @return Interaction
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
     * Get comma separated tag names. If 'Secondary' present, it is listed last.
     *
     * @return array
     */
    public function getTagNames()
    {
        if (!$this->tags) { return null; }
        $names = [];
        if ($this->tags) {
            foreach ($this->tags as $tag) { array_push($names, $tag->getDisplayName()); }
        }
        uasort($names, function($a, $b)
        {
            if ($a == 'Secondary') return 1;
            if ($b == 'Secondary') return -1;
            return 0;
        });
        return join(', ', $names);
    }

    /**
     * Set created datetime.
     *
     * @param \DateTime $createdAt
     *
     * @return Interaction
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
     * @return Interaction
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
     * @JMS\VirtualProperty
     * @JMS\SerializedName("updatedBy")
     * @Groups({"normalized", "flattened"})
     *
     * @return string
     */
    public function serializeUpdatedBy()
    {
        $user = $this->updatedBy ? $this->updatedBy : $this->createdBy;
        return $user->getFirstName();
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
        $interactionType = (string) $this->getInteractionType();
        $subject_name = (string) $this->getSubject();
        $object_name = (string) $this->getObject();
        if ($interactionType == 'Unspecified') {
            $interaction_desc = 'Unspecified Interaction by '.$subject_name.' on '.$object_name;
        } else {
            $interaction_desc = $interactionType.' by '.$subject_name.' of '.$object_name;
        }

        return $interaction_desc;
    }
}
