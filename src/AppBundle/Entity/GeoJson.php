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
     * String array of coordinates - [ long, lat ] (GeoJson format)
     *
     * @ORM\Column(name="coordinates", type="text", nullable=false)
     * @JMS\Expose
     */
    private $coordinates;

    /**
     * @var string 
     * String array of coordinates - [ long, lat ] (GeoJson format)
     *
     * @ORM\Column(name="display_point", type="string", length=255, nullable=false)
     */
    private $displayPoint;

    /**
     * @var string 
     *
     * @ORM\Column(name="loc_name", type="string", length=255, nullable=false)
     */
    private $locationName;

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
     * Set displayPoint.
     *
     * @param text $displayPoint
     *
     * @return GeoJson
     */
    public function setDisplayPoint($displayPoint)
    {
        $this->displayPoint = $displayPoint;

        return $this;
    }

    /**
     * Get displayPoint.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("displayPoint")
     *
     * @return text
     */
    public function getDisplayPoint()
    {
        return $this->displayPoint;
    }

    /**
     * Set locationName.
     *
     * @param text $locationName
     *
     * @return GeoJson
     */
    public function setLocationName($locationName)
    {
        $this->locationName = $locationName;

        return $this;
    }

    /**
     * Get locationName.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("displayName")
     *
     * @return text
     */
    public function getLocationName()
    {
        return $this->locationName;
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

    public function removeLocation()
    {
        $this->location = null;

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
