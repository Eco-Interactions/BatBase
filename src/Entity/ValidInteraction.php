<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use JMS\Serializer\Annotation as JMS;

/**
 * ValidInteraction
 *
 * @ORM\Table(name="valid_interaction")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks
 * @JMS\ExclusionPolicy("all")
 */
class ValidInteraction
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
     * @var \App\Entity\GroupRoot
     *
     * @ORM\ManyToOne(
     *     targetEntity="GroupRoot",
     *     inversedBy="validObjectInteractions",
     *     cascade={"persist", "remove"}
     * )
     * @ORM\JoinColumn(nullable=false)
     */
    private $objectGroup;

    /**
     * @var \App\Entity\GroupRoot
     *
     * @ORM\ManyToOne(
     *     targetEntity="GroupRoot",
     *     inversedBy="validSubjectInteractions",
     *     cascade={"persist", "remove"}
     * )
     * @ORM\JoinColumn(nullable=false)
     */
    private $subjectGroup;


    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\ManyToOne(
     *      targetEntity="App\Entity\InteractionType",
     *      inversedBy="validInteractions"
     * )
     */
    private $interactionType;

    /**
     * @ORM\ManyToMany(targetEntity="App\Entity\Tag", inversedBy="validInteractions")
     * @ORM\JoinTable(name="valid_interaction_tag")
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
     * Constructor.
     */
    public function __construct()
    {
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
     * Set objectGroup.
     *
     * @param \App\Entity\Group $objectGroup
     *
     * @return ValidInteraction
     */
    public function setObjectGroup(\App\Entity\Group $objectGroup)
    {
        $this->objectGroup = $objectGroup;

        return $this;
    }

    /**
     * Get objectGroup.
     *
     * @return \App\Entity\Group
     */
    public function getObjectGroup()
    {
        return $this->objectGroup;
    }

    /**
     * Get Group Id
     * @JMS\VirtualProperty
     * @JMS\SerializedName("objectGroup")
     */
    public function getObjectGroupId()
    {
        return $this->objectGroup->getId();
    }


    /**
     * Set subjectGroup.
     *
     * @param \App\Entity\Group $subjectGroup
     *
     * @return ValidInteraction
     */
    public function setSubjectGroup(\App\Entity\Group $subjectGroup)
    {
        $this->subjectGroup = $subjectGroup;

        return $this;
    }

    /**
     * Get subjectGroup.
     *
     * @return \App\Entity\Group
     */
    public function getSubjectGroup()
    {
        return $this->subjectGroup;
    }

    /**
     * Get Group Id
     * @JMS\VirtualProperty
     * @JMS\SerializedName("subjectGroup")
     */
    public function getSubjectGroupId()
    {
        return $this->subjectGroup->getId();
    }

    /**
     * Set interactionType.
     *
     * @param \App\Entity\InteractionType $interactionType
     *
     * @return ValidInteraction
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
     * Get Group Id
     * @JMS\VirtualProperty
     * @JMS\SerializedName("interactionType")
     */
    public function getInteractionTypeId()
    {
        return $this->interactionType->getId();
    }

    /**
     * Add Tag.
     *
     * @param \App\Entity\Tag $tag
     *
     * @return ValidInteraction
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
     * Set created datetime.
     *
     * @param \DateTime $createdAt
     *
     * @return Contribution
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
     * @return Contribution
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
     * Get string representation of object.
     *
     * @return string
     */
    public function __toString()
    {
        $citedAs = $this->getCitedAs();
        if (!is_null($citedAs)) {
            return $citedAs;
        } else {
            $desc_str = $this->getAuthorSource().' - '.$this->getSubjectGroup();
            return $desc_str;
        }
    }
}
