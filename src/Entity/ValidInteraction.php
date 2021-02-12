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
     *     cascade={"persist"}
     * )
     * @ORM\JoinColumn(nullable=false)
     */
    private $objectSubGroup;

    /**
     * @var \App\Entity\GroupRoot
     *
     * @ORM\ManyToOne(
     *     targetEntity="GroupRoot",
     *     inversedBy="validSubjectInteractions",
     *     cascade={"persist"}
     * )
     * @ORM\JoinColumn(nullable=false)
     */
    private $subjectSubGroup;

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
     * NOTE:
     * - JS FORM VALIDATION ENSURES THAT AT LEAST ONE TAG, IF ANY HERE, WILL BE
     * SELECTED FOR THIS TYPE OF VALID INTERACTIONS.
     * - "Secondary" TAG IS ALWAYS VALID, AND IS NOT ADDED HERE. HANDLED IN JS CODE.
     * @ORM\ManyToMany(targetEntity="App\Entity\Tag", inversedBy="validInteractions")
     * @ORM\JoinTable(name="valid_interaction_tag")
     */
    private $tags;  //if there are tags, one must be selected

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
     * Set objectSubGroup.
     *
     * @param \App\Entity\GroupRoot $objectSubGroup
     *
     * @return ValidInteraction
     */
    public function setObjectSubGroup(\App\Entity\GroupRoot $objectSubGroup)
    {
        $this->objectSubGroup = $objectSubGroup;

        return $this;
    }

    /**
     * Get objectSubGroup.
     *
     * @return \App\Entity\GroupRoot
     */
    public function getObjectSubGroup()
    {
        return $this->objectSubGroup;
    }

    /**
     * Get Group Id
     * @JMS\VirtualProperty
     * @JMS\SerializedName("objectSubGroup")
     */
    public function getObjectSubGroupId()
    {
        return $this->objectSubGroup->getId();
    }


    /**
     * Set subjectSubGroup.
     *
     * @param \App\Entity\GroupRoot $subjectSubGroup
     *
     * @return ValidInteraction
     */
    public function setSubjectSubGroup(\App\Entity\GroupRoot $subjectSubGroup)
    {
        $this->subjectSubGroup = $subjectSubGroup;

        return $this;
    }

    /**
     * Get subjectSubGroup.
     *
     * @return \App\Entity\GroupRoot
     */
    public function getSubjectSubGroup()
    {
        return $this->subjectSubGroup;
    }

    /**
     * Get Group Id
     * @JMS\VirtualProperty
     * @JMS\SerializedName("subjectSubGroup")
     */
    public function getSubjectSubGroupId()
    {
        return $this->subjectSubGroup->getId();
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
        $string = $this->subjectSubGroup->getTaxon()->getDisplayName() + ' - ' +
            $this->objectSubGroup->getTaxon()->getDisplayName() + ' - ' +
            $this->interactionType->getDisplayName();
        if (count($this->tags)) {
            $string += ' - ';
            foreach ($this->tags as $tag) {
                $string += $tag->getDisplayName() + ' ';
            }
        }
        return $string;
    }
}
