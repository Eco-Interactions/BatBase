<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use JMS\Serializer\Annotation as JMS;


/**
 * InteractionType.
 *
 * @ORM\Table(name="interaction_type")
 * @ORM\Entity
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
     * @JMS\Expose
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
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Interaction", mappedBy="interactionType")
     */
    private $interactions;

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
     * Add interactions.
     *
     * @param \AppBundle\Entity\Interaction $interactions
     *
     * @return InteractionType
     */
    public function addInteraction(\AppBundle\Entity\Interaction $interactions)
    {
        $this->interactions[] = $interactions;

        return $this;
    }

    /**
     * Remove interactions.
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
     * Returns an array of interactions ids. 
     * @JMS\VirtualProperty
     * @JMS\SerializedName("interactions")
     */
    public function getInteractionids()
    {
        $allIntIds = [];
        foreach ($this->interactions as $interaction) {
            array_push($allIntIds, $interaction->getId());
        }
        return $allIntIds;
    }

    /**
     * Add validTags.
     *
     * @param \AppBundle\Entity\Tag $validTags
     *
     * @return InteractionType
     */
    public function addValidTag(\AppBundle\Entity\Tag $validTags)
    {
        $this->validTags[] = $validTags;

        return $this;
    }

    /**
     * Remove validTags.
     *
     * @param \AppBundle\Entity\Tag $validTags
     */
    public function removeValidTag(\AppBundle\Entity\Tag $validTags)
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
     * Get string representation of object.
     *
     * @return string
     */
    public function __toString()
    {
        return $this->getDisplayName();
    }
}
