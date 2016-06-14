<?php

namespace AppBundle\Entity;

use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\ORM\Mapping as ORM;

/**
 * Tag.
 *
 * @ORM\Table(name="tag")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks
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
     * @ORM\Column(name="tag", type="text", nullable=false)
     */
    private $tag;

    /**
     * @ORM\ManyToMany(targetEntity="Interaction", inversedBy="tags")
     * @ORM\JoinTable(name="interaction_tag")
     */
    private $interactions;

    /**
     * @ORM\ManyToMany(targetEntity="Citation", inversedBy="tags")
     * @ORM\JoinTable(name="citation_tag")
     */
    private $citations;

    /**
     * @var text
     *
     * @ORM\Column(name="constrained_to_entity", type="text", nullable=true)
     */
    private $constrainedToEntity;

    /**
     * @ORM\ManyToMany(targetEntity="InteractionType", inversedBy="validTags")
     * @ORM\JoinTable(name="type_tag_contraints")
     */
    private $constrainedToType;

    /**
     * @ORM\Column(name="deletedAt", type="datetime", nullable=true)
     */
    private $deletedAt;

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
     * Constructor.
     */
    public function __construct()
    {
        $this->interactions = new \Doctrine\Common\Collections\ArrayCollection();
        $this->citations = new \Doctrine\Common\Collections\ArrayCollection();
        $this->constrainedToType = new \Doctrine\Common\Collections\ArrayCollection();
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
     * Set tag.
     *
     * @return string
     */
    public function setTag($tag)
    {
        $this->tag = $tag;

        return $this;
    }

    /**
     * Get tag.
     *
     * @return string
     */
    public function getTag()
    {
        return $this->tag;
    }

    /**
     * Add Interaction.
     *
     * @param \AppBundle\Entity\Interaction $interaction
     *
     * @return Tag
     */
    public function setInteraction(\AppBundle\Entity\Interaction $interaction)
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
     * Add Citations.
     *
     * @param \AppBundle\Entity\Citation $citation
     *
     * @return Tag
     */
    public function setCitation(\AppBundle\Entity\Citation $citation)
    {
        $this->citations[] = $citation;

        return $this;
    }

    /**
     * Remove Citations.
     *
     * @param \AppBundle\Entity\Citation $citation
     */
    public function removeCitation(\AppBundle\Entity\Citation $citation)
    {
        $this->citations->removeElement($citation);
    }

    /**
     * Get citations.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getCitations()
    {
        return $this->citations;
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
     * Add ConstrainedToType.
     *
     * @param \AppBundle\Entity\InteractionType $constrainedToType
     *
     * @return Tag
     */
    public function setConstrainedToType(\AppBundle\Entity\InteractionType $constrainedToType)
    {
        $this->constrainedToType[] = $constrainedToType;

        return $this;
    }

    /**
     * Remove ConstrainedToType.
     *
     * @param \AppBundle\Entity\InteractionType $constrainedToType
     */
    public function removeConstrainedToType(\AppBundle\Entity\InteractionType $constrainedToType)
    {
        $this->constrainedToType->removeElement($constrainedToType);
    }

    /**
     * Get constrainedToType.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getConstrainedToType()
    {
        return $this->constrainedToType;
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
     * Set deleted at.
     *
     * @param /DateTime $deletedAt
     */
    public function setDeletedAt($deletedAt)
    {
        $this->deletedAt = $deletedAt;
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
     * Get created datetime.
     *
     * @return \DateTime
     */
    public function getCreated()
    {
        return $this->created;
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
     * Get created by user.
     *
     * @return \AppBundle\Entity\User
     */
    public function getCreatedBy()
    {
        return $this->createdBy;
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
     * Get string representation of object.
     *
     * @return string
     */
    public function __toString()
    {
        return $this->getTag();
    }

    /**
     * Set created
     *
     * @param \DateTime $created
     * @return Tag
     */
    public function setCreated($created)
    {
        $this->created = $created;

        return $this;
    }

    /**
     * Set updated
     *
     * @param \DateTime $updated
     * @return Tag
     */
    public function setUpdated($updated)
    {
        $this->updated = $updated;

        return $this;
    }

    /**
     * Add interactions
     *
     * @param \AppBundle\Entity\Interaction $interactions
     * @return Tag
     */
    public function addInteraction(\AppBundle\Entity\Interaction $interactions)
    {
        $this->interactions[] = $interactions;

        return $this;
    }

    /**
     * Add citations
     *
     * @param \AppBundle\Entity\Citation $citations
     * @return Tag
     */
    public function addCitation(\AppBundle\Entity\Citation $citations)
    {
        $this->citations[] = $citations;

        return $this;
    }

    /**
     * Add constrainedToType
     *
     * @param \AppBundle\Entity\InteractionType $constrainedToType
     * @return Tag
     */
    public function addConstrainedToType(\AppBundle\Entity\InteractionType $constrainedToType)
    {
        $this->constrainedToType[] = $constrainedToType;

        return $this;
    }

    /**
     * Set createdBy
     *
     * @param \AppBundle\Entity\User $createdBy
     * @return Tag
     */
    public function setCreatedBy(\AppBundle\Entity\User $createdBy = null)
    {
        $this->createdBy = $createdBy;

        return $this;
    }

    /**
     * Set updatedBy
     *
     * @param \AppBundle\Entity\User $updatedBy
     * @return Tag
     */
    public function setUpdatedBy(\AppBundle\Entity\User $updatedBy = null)
    {
        $this->updatedBy = $updatedBy;

        return $this;
    }
}
