<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use JMS\Serializer\Annotation as JMS;


/**
 * InteractionType.
 *
 * @ORM\Table(name="interaction_type")
 * @ORM\Entity()
 * @ORM\HasLifecycleCallbacks
 * @JMS\ExclusionPolicy("all")
 */
class InteractionType
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
     * @var bool
     *
     * @ORM\Column(name="is_symmetric", type="boolean", length=255, nullable=true)
     * @JMS\Expose
     */
    private $isSymmetric;

    /**
     * @var string
     *
     * @ORM\Column(name="display_name", type="string", length=255)
     * @JMS\Expose
     * @JMS\SerializedName("displayName")
     */
    private $displayName;

    /**
     * @var string
     *
     * @ORM\Column(name="active_form", type="string", length=255)
     * @JMS\Expose
     * @JMS\SerializedName("activeForm")
     */
    private $activeForm;

    // *
    //  * @var string
    //  *
    //  * @ORM\Column(name="passive_form", type="string", length=255)
    //  * @JMS\Expose
    //  * @JMS\SerializedName("passiveForm")

    // private $passiveForm;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(
     *      targetEntity="App\Entity\Interaction",
     *      mappedBy="interactionType",
     *      fetch="EXTRA_LAZY" )
     */
    private $interactions;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(
     *      targetEntity="App\Entity\ValidInteraction",
     *      mappedBy="interactionType")
     */
    private $validInteractions;

    /**
     * @ORM\ManyToMany(targetEntity="Tag", mappedBy="intTypeConstraints")
     * @ORM\JoinTable(name="int_type_tag_contraints")
     */
    private $validTags;

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
        $this->interactions = new \Doctrine\Common\Collections\ArrayCollection();
        $this->validTags = new \Doctrine\Common\Collections\ArrayCollection();
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
     * Set isSymmetric.
     *
     * @param bool $isSymmetric
     *
     * @return InteractionType
     */
    public function setIsSymmetric($isSymmetric)
    {
        $this->isSymmetric = $isSymmetric;

        return $this;
    }

    /**
     * Get isSymmetric.
     *
     * @return bool
     */
    public function getIsSymmetric()
    {
        return $this->isSymmetric;
    }

    /**
     * Set displayName.
     *
     * @param string $displayName
     *
     * @return InteractionType
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
     * Set activeForm.
     *
     * @param string $activeForm
     *
     * @return InteractionType
     */
    public function setActiveForm($activeForm)
    {
        $this->activeForm = $activeForm;

        return $this;
    }

    /**
     * Get activeForm.
     *
     * @return string
     */
    public function getActiveForm()
    {
        return $this->activeForm;
    }

    /**
     * Add interactions.
     *
     * @param \App\Entity\Interaction $interactions
     *
     * @return InteractionType
     */
    public function addInteraction(\App\Entity\Interaction $interactions)
    {
        $this->interactions[] = $interactions;

        return $this;
    }

    /**
     * Remove interactions.
     *
     * @param \App\Entity\Interaction $interactions
     */
    public function removeInteraction(\App\Entity\Interaction $interactions)
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
     * Add validInteraction.
     *
     * @param \App\Entity\ValidInteraction $validInteraction
     *
     * @return InteractionType
     */
    public function addValidInteraction(\App\Entity\ValidInteraction $validInteraction)
    {
        $this->validInteractions[] = $validInteraction;

        return $this;
    }

    /**
     * Remove validInteraction.
     *
     * @param \App\Entity\ValidInteraction $validInteraction
     */
    public function removeValidInteraction(\App\Entity\ValidInteraction $validInteraction)
    {
        $this->validInteractions->removeElement($validInteraction);
    }

    /**
     * Get validInteractions.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getValidInteractions()
    {
        return $this->validInteractions;
    }

    /**
     * Add validTags.
     *
     * @param \App\Entity\Tag $validTags
     *
     * @return InteractionType
     */
    public function addValidTag(\App\Entity\Tag $validTags)
    {
        $this->validTags[] = $validTags;

        return $this;
    }

    /**
     * Remove validTags.
     *
     * @param \App\Entity\Tag $validTags
     */
    public function removeValidTag(\App\Entity\Tag $validTags)
    {
        $this->validTags->removeElement($validTags);
    }

    /**
     * Get validTags.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getValidTags()
    {
        return $this->validTags;
    }

    /**
     * Serialize validTags.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("tags")
     *
     * @return array
     */
    public function serializeValidTags()
    {
        $tags = [];

        foreach ($this->validTags as $tag) {
            array_push($tags, [
                'id' => $tag->getId(),
                'displayName' => $tag->getDisplayName()
            ]);
        }

        return $tags;
    }

    /**
     * Set created datetime.
     *
     * @param \DateTime $createdAt
     *
     * @return InteractionType
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
     * @return InteractionType
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
    public function setUpdatedBy(\App\Entity\User $user = null)
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
        return $this->getDisplayName();
    }
}
