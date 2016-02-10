<?php

namespace AppBundle\Entity;

use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\ORM\Mapping as ORM;

/**
 * Int Tag.
 *
 * @ORM\Table(name="int_tag")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks
 */
class IntTag
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
     * @ORM\JoinTable(name="interaction_int_tag")
     */
    private $interactions;

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
     * Add Interactions.
     *
     * @param \AppBundle\Entity\Interaction $interactions
     *
     * @return IntTag
     */
    public function addInteraction(\AppBundle\Entity\Interaction $interactions)
    {
        $this->interactions[] = $interactions;

        return $this;
    }

    /**
     * Remove Interactions.
     *
     * @param \AppBundle\Entity\Interaction $interactions
     */
    public function removeInteraction(\AppBundle\Entity\Interaction $interactions)
    {
        $this->interactions->removeElement($interactions);
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
     * Add ConstrainedToType.
     *
     * @param \AppBundle\Entity\InteractionType $constrainedToType
     *
     * @return IntTag
     */
    public function addConstrainedToType(\AppBundle\Entity\InteractionType $constrainedToType)
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
     * @return IntTag
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
}
