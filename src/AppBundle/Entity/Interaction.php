<?php

namespace AppBundle\Entity;

use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as JMS;

/**
 * Interaction.
 *
 * @ORM\Table(name="interaction")
 * @ORM\Entity(repositoryClass="AppBundle\Entity\InteractionRepository")
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
     */
    private $note;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_likely", type="boolean", nullable=true)
     * @JMS\Expose
     * @JMS\SerializedName("isLikely")
     */
    private $isLikely;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_old_world", type="boolean", nullable=true)
     * @JMS\Expose
     * @JMS\SerializedName("isOldWorld")
     */
    private $isOldWorld;

    /**
     * @var \AppBundle\Entity\Source
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Source", inversedBy="interactions")
     * @ORM\JoinColumn(name="source_id", referencedColumnName="id")
     */
    private $source;

    /**
     * @var \AppBundle\Entity\InteractionType
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\InteractionType", inversedBy="interactions")
     * @ORM\JoinColumn(name="interaction_type_id", referencedColumnName="id")
     */
    private $interactionType;

    /**
     * @var \AppBundle\Entity\Location
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Location", inversedBy="interactions")
     * @ORM\JoinColumn(name="location_id", referencedColumnName="id")
     */
    private $location;

    /**
     * @var \AppBundle\Entity\Taxon
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Taxon", inversedBy="subjectRoles")
     * @ORM\JoinColumn(name="subject_taxon_id", referencedColumnName="id")
     */
    private $subject;

    /**
     * @var \AppBundle\Entity\Taxon
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Taxon", inversedBy="objectRoles")
     * @ORM\JoinColumn(name="object_taxon_id", referencedColumnName="id")
     */
    private $object;

    /**
     * @ORM\ManyToMany(targetEntity="Tag", mappedBy="interactions")
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
        $this->tags = new \Doctrine\Common\Collections\ArrayCollection();
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
     * @param \AppBundle\Entity\Source $source
     *
     * @return Interaction
     */
    public function setSource(\AppBundle\Entity\Source $source)
    {
        $this->source = $source;

        return $this;
    }

    /**
     * Get source.
     *
     * @return \AppBundle\Entity\Source
     */
    public function getSource()
    {
        return $this->source;
    }

    /**
     * Get the Source id.   
     * @JMS\VirtualProperty
     * @JMS\SerializedName("source")
     */
    public function getSourceId()
    {
        return $this->getSource()->getId();
    }

    /**
     * Set interactionType.
     *
     * @param \AppBundle\Entity\InteractionType $interactionType
     *
     * @return Interaction
     */
    public function setInteractionType(\AppBundle\Entity\InteractionType $interactionType)
    {
        $this->interactionType = $interactionType;

        return $this;
    }

    /**
     * Get interactionType.
     *
     * @return \AppBundle\Entity\InteractionType
     */
    public function getInteractionType()
    {
        return $this->interactionType;
    }

    /**
     * Get the Interaction Type id.   
     * @JMS\VirtualProperty
     * @JMS\SerializedName("interactionType")
     */
    public function getInteractionTypeId()
    {
        return $this->getInteractionType() ? $this->getInteractionType()->getId() : null;
    }

    /**
     * Set location.
     *
     * @param \AppBundle\Entity\Location $location
     *
     * @return Interaction
     */
    public function setLocation(\AppBundle\Entity\Location $location)
    {
        $this->location = $location;

        return $this;
    }

    /**
     * Get location.
     *
     * @return \AppBundle\Entity\Location
     */
    public function getLocation()
    {
        return $this->location;
    }

    /**
     * Get the Location id.   
     * @JMS\VirtualProperty
     * @JMS\SerializedName("location")
     */
    public function getLocationId()
    {
        return $this->getLocation() ? $this->getLocation()->getId() : null;
    }

    /**
     * Set subject.
     *
     * @param \AppBundle\Entity\Taxon $subject
     *
     * @return Interaction
     */
    public function setSubject(\AppBundle\Entity\Taxon $subject)
    {
        $this->subject = $subject;

        return $this;
    }

    /**
     * Get subject.
     *
     * @return \AppBundle\Entity\Taxon
     */
    public function getSubject()
    {
        return $this->subject;
    }

    /**
     * Get the Subject id.   
     * @JMS\VirtualProperty
     * @JMS\SerializedName("subject")
     */
    public function getSubjectId()
    {
        return $this->getSubject()->getId();
    }

    /**
     * Set object.
     *
     * @param \AppBundle\Entity\Taxon $object
     *
     * @return Interaction
     */
    public function setObject(\AppBundle\Entity\Taxon $object)
    {
        $this->object = $object;

        return $this;
    }

    /**
     * Get object.
     *
     * @return \AppBundle\Entity\Taxon
     */
    public function getObject()
    {
        return $this->object;
    }

    /**
     * Get the Object id.   
     * @JMS\VirtualProperty
     * @JMS\SerializedName("object")
     */
    public function getObjectId()
    {
        return $this->getObject()->getId();
    }

    /**
     * Add Tags.
     *
     * @param \AppBundle\Entity\Tag $tags
     *
     * @return Interaction
     */
    public function setTags(\AppBundle\Entity\Tag $tags)
    {
        $this->tags[] = $tags;

        return $this;
    }

    /**
     * Remove Tags.
     *
     * @param \AppBundle\Entity\Tag $tags
     */
    public function removeTag(\AppBundle\Entity\Tag $tags)
    {
        $this->tags->removeElement($tags);
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
     * Get an array of tag ids.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("tags")
     *
     * @return array 
     */
    public function getTagIds()
    {
        $tags = $this->getTags();
        $tagIds = [];
        if ($tags === null) { return; }
        foreach ($tags as $tag) {
            array_push($tagIds, $tag->getId());
        }
        return $tagIds;
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
