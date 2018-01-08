<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use JMS\Serializer\Annotation as JMS;

/**
 * PublisherType.
 *
 * @ORM\Table(name="publisher_type")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks
 * @JMS\ExclusionPolicy("all")
 */
class PublisherType
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
     * @var string
     *
     * @ORM\Column(name="display_name", type="string", length=255, unique=true)
     * @JMS\Expose
     * @JMS\SerializedName("displayName")
     */
    private $displayName;

    /**
     * @var string
     *
     * @ORM\Column(name="description", type="string", length=255, nullable=true)
     * @JMS\Expose
     */
    private $description;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Publisher", mappedBy="publisherType")
     */
    private $publishers;

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
        $this->publishers = new \Doctrine\Common\Collections\ArrayCollection();
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
     * Set displayName.
     *
     * @param string $displayName
     *
     * @return PublisherType
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
     * @return PublisherType
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
     * Add publisher.
     *
     * @param \AppBundle\Entity\Publisher $publisher
     *
     * @return PublisherType
     */
    public function addPublisher(\AppBundle\Entity\Publisher $publisher)
    {
        $this->publishers[] = $publisher;

        return $this;
    }

    /**
     * Remove publisher.
     *
     * @param \AppBundle\Entity\Publisher $publisher
     */
    public function removePublisher(\AppBundle\Entity\Publisher $publisher)
    {
        $this->publishers->removeElement($publisher);
    }

    /**
     * Get publishers.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getPublishers()
    {
        return $this->publishers;
    }

    /**
     * Returns an array of Publisher ids. 
     * @JMS\VirtualProperty
     * @JMS\SerializedName("publishers")
     */
    public function getPublisherIds()
    {
        $pubIds = [];
        foreach ($this->publishers as $publisher) {
            array_push($pubIds, $publisher->getId());
        }
        return $pubIds;
    }

    /**
     * Set createdBy user.
     *
     * @param \AppBundle\Entity\User $user
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
     * @param \AppBundle\Entity\User $user
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
     * Get string representation of object.
     *
     * @return string
     */
    public function __toString()
    {
        return $this->getDisplayName();
    }
}
