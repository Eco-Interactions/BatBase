<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use JMS\Serializer\Annotation as JMS;

/**
 * Tag.
 *
 * @ORM\Table(name="tag")
 * @ORM\Entity(readOnly=true)
 * @ORM\HasLifecycleCallbacks
 * @JMS\ExclusionPolicy("all")
 */
class Tag
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
     * @var text
     *
     * @ORM\Column(name="display_name", type="string", length=255, unique=true, nullable=false)
     * @JMS\Expose
     * @JMS\SerializedName("displayName")
     */
    private $displayName;

    /**
     * @var text
     *
     * @ORM\Column(name="description", type="text", nullable=true)
     * @JMS\Expose
     */
    private $description;

    /**
     * @var text
     *
     * @ORM\Column(name="constrained_to_entity", type="text", nullable=true)
     * @JMS\Expose
     * @JMS\SerializedName("constrainedToEntity")
     */
    private $constrainedToEntity;

    /**
     * @ORM\ManyToMany(targetEntity="AppBundle\Entity\Interaction", mappedBy="tags", fetch="EXTRA_LAZY")
     * @ORM\JoinTable(name="interaction_tag")
     */
    private $interactions;

    /**
     * @ORM\ManyToMany(targetEntity="AppBundle\Entity\InteractionType", inversedBy="validTags")
     * @ORM\JoinTable(name="int_type_tag_contraints")
     */
    private $intTypeConstraints;

    /**
     * @ORM\ManyToMany(targetEntity="AppBundle\Entity\Source", mappedBy="tags", fetch="EXTRA_LAZY")
     * @ORM\JoinTable(name="source_tag")
     */
    private $sources;

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
        $this->interactions = new \Doctrine\Common\Collections\ArrayCollection();
        $this->sources = new \Doctrine\Common\Collections\ArrayCollection();
        $this->intTypeConstraints = new \Doctrine\Common\Collections\ArrayCollection();
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
     * Set displayName.
     *
     * @return string
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
     * @return Tag
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
     * Add ConstrainedToEntity.
     *
     * @param string $constrainedToEntity
     *
     * @return Tag
     */
    public function setConstrainedToEntity($constrainedToEntity)
    {
        $this->constrainedToEntity = $constrainedToEntity;

        return $this;
    }

    /**
     * Get ConstrainedToEntity.
     *
     * @return string
     */
    public function getConstrainedToEntity()
    {
        return $this->constrainedToEntity;
    }

    /**
     * Add Interaction.
     *
     * @param \AppBundle\Entity\Interaction $interaction
     *
     * @return Tag
     */
    public function addInteraction(\AppBundle\Entity\Interaction $interaction)
    {
        $this->interactions[] = $interaction;

        return $this;
    }

    /**
     * Remove Interaction.
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
     * Returns an array of interactions ids. 
     * @JMS\VirtualProperty
     * @JMS\SerializedName("interactions")
     */
    public function getInteractionids()
    {
        $intIds = [];
        foreach ($this->interactions as $interaction) {
            array_push($intIds, $interaction->getId());
        }
        return $intIds;
    }

    /**
     * 
     * Add intTypeConstraint.
     *
     * @param \AppBundle\Entity\InteractionType $intTypeConstraint
     *
     * @return Tag
     */
    public function addIntTypeConstraint(\AppBundle\Entity\InteractionType $intTypeConstraint)
    {
        $this->intTypeConstraints[] = $intTypeConstraint;

        return $this;
    }

    /**
     * Remove intTypeConstraint.
     *
     * @param \AppBundle\Entity\InteractionType $intTypeConstraint
     */
    public function removeIntTypeConstraint(\AppBundle\Entity\InteractionType $intTypeConstraint)
    {
        $this->intTypeConstraints->removeElement($intTypeConstraint);
    }

    /**
     * Get intTypeConstraints.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getIntTypeConstraints()
    {
        return $this->intTypeConstraints;
    }

    /**
     * Add Source.
     *
     * @param \AppBundle\Entity\Source $source
     *
     * @return Tag
     */
    public function addSource(\AppBundle\Entity\Source $source)
    {
        $this->sources[] = $source;

        return $this;
    }

    /**
     * Remove Source.
     *
     * @param \AppBundle\Entity\Source $source
     */
    public function removeSource(\AppBundle\Entity\Source $source)
    {
        $this->sources->removeElement($source);
    }

    /**
     * Get Sources.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getSources()
    {
        return $this->sources;
    }

    /**
     * Returns an array of Source ids. 
     * @JMS\VirtualProperty
     * @JMS\SerializedName("sources")
     */
    public function getSourceIds()
    {
        $srcIds = [];
        foreach ($this->sources as $source) {
            array_push($srcIds, $source->getId());
        }
        return $srcIds;
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
        return $this->getTag();
    }
}
