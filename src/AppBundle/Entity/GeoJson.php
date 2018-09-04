<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use JMS\Serializer\Annotation as JMS;

/**
 * GeoJson.
 *
 * @ORM\Table(name="geo_json")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks
 * @JMS\ExclusionPolicy("all")
 */
class GeoJson
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
     * @ORM\Column(name="type", type="string", length=255, nullable=false)
     * @JMS\Expose
     * @JMS\SerializedName("type")
     */
    private $type;

    /**
     * @var string
     *
     * @ORM\Column(name="coordinates", type="text", nullable=false)
     * @JMS\Expose
     */
    private $coordinates;

    /**
     * @var string 
     * String array of coordinates - [ long, lat ]
     *
     * @ORM\Column(name="center_point", type="string", length=255, nullable=true)
     */
    private $centerPoint;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToOne(targetEntity="AppBundle\Entity\Location", inversedBy="geoJson")
     * @ORM\JoinColumn(name="loc_id", referencedColumnName="id", unique=true)
     */
    private $location;

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
        $this->locations = new \Doctrine\Common\Collections\ArrayCollection();
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
     * Set type.
     *
     * @param string $type
     *
     * @return GeoJson
     */
    public function setType($type)
    {
        $this->type = $type;

        return $this;
    }

    /**
     * Get type.
     *
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * Set coordinates.
     *
     * @param text $coordinates
     *
     * @return GeoJson
     */
    public function setCoordinates($coordinates)
    {
        $this->coordinates = $coordinates;

        return $this;
    }

    /**
     * Get coordinates.
     *
     * @return text
     */
    public function getCoordinates()
    {
        return $this->coordinates;
    }

    /**
     * Set centerPoint.
     *
     * @param text $centerPoint
     *
     * @return GeoJson
     */
    public function setCenterPoint($centerPoint)
    {
        $this->centerPoint = $centerPoint;

        return $this;
    }

    /**
     * Get centerPoint.
     *
     * @return text
     */
    public function getCenterPoint()
    {
        return $this->centerPoint;
    }

    /**
     * Get center point.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("centerPoint")
     *
     * @return int
     */
    public function serializeCenterPoint()
    {
        return $this->centerPoint;
    }

    /**
     * Set location.
     *
     * @param \AppBundle\Entity\Source $location
     *
     * @return GeoJson
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
     * Get location Id.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("location")
     *
     * @return integer
     */
    public function getLocationId()
    {
        return $this->location->getId();
    }

    /**
     * Get location Id.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("displayName")
     *
     * @return string
     */
    public function getLocationName()
    {
        return $this->location->getDisplayName();
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
        return $this->getLocation()->getDisplayName() + ' - GeoJson';
    }
}
