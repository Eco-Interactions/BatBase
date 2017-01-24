<?php

namespace AppBundle\Entity;

use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as JMS;

/**
 * Location.
 *
 * @ORM\Table(name="location")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks
 * @Gedmo\SoftDeleteable(fieldName="deletedAt", timeAware=false)
 * @JMS\ExclusionPolicy("all")
 */
class Location
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
     * @ORM\Column(name="display_name", type="string", length=255)
     * @JMS\Expose
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
     * @var int
     *
     * @ORM\Column(name="elevation", type="integer", nullable=true)
     * @JMS\Expose
     */
    private $elevation;

    /**
     * @var int
     *
     * @ORM\Column(name="elevation_max", type="integer", nullable=true)
     * @JMS\Expose
     */
    private $elevationMax;

    /**
     * @var string
     *
     * @ORM\Column(name="elev_unit_abbrv", type="string", length=3, nullable=true)
     * @JMS\Expose
     */
    private $elevUnitAbbrv;

    /**
     * @var string
     *
     * @ORM\Column(name="gps_data", type="string", length=255, nullable=true)
     * @JMS\Expose
     */
    private $gpsData;

    /**
     * @var string
     *
     * @ORM\Column(name="latitude", type="decimal", precision=18, scale=14, nullable=true)
     * @JMS\Expose
     */
    private $latitude;

    /**
     * @var string
     *
     * @ORM\Column(name="longitude", type="decimal", precision=18, scale=14, nullable=true)
     * @JMS\Expose
     */
    private $longitude;

    /**
     * @var bool
     *
     * @ORM\Column(name="show_on_map", type="boolean", nullable=true)
     */
    private $showOnMap;

    /**
     * @var \AppBundle\Entity\Location
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Location", inversedBy="childLocs")
     * @ORM\JoinColumn(name="parent_loc_id", referencedColumnName="id", onDelete="SET NULL")
     */
    private $parentLoc;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Location", mappedBy="parentLoc")
     * @ORM\OrderBy({
     *     "description"="ASC"
     * })
     */
    private $childLocs;

    /**
     * @var \AppBundle\Entity\LocationType
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\LocationType", inversedBy="locations")
     * @ORM\JoinColumn(name="location_type_id", referencedColumnName="id")
     */
    private $locationType;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Interaction", mappedBy="location")
     */
    private $interactions;

    /**
     * @var \AppBundle\Entity\HabitatType
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\HabitatType", inversedBy="locations")
     * @ORM\JoinColumn(name="habitat_type_id", referencedColumnName="id")
     */
    private $habitatType;

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
        $this->childLocs = new \Doctrine\Common\Collections\ArrayCollection();
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
     * @param string $displayName
     *
     * @return Location
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
     * @return Location
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
     * Set elevation.
     *
     * @param int $elevation
     *
     * @return Location
     */
    public function setElevation($elevation)
    {
        $this->elevation = $elevation;

        return $this;
    }

    /**
     * Get elevation.
     *
     * @return int
     */
    public function getElevation()
    {
        return $this->elevation;
    }

    /**
     * Get elevation max.
     *
     * @return int
     */
    public function getElevationMax()
    {
        return $this->elevationMax;
    }

    /**
     * Set elevation Max.
     *
     * @param int $elevationMax
     *
     * @return Location
     */
    public function setElevationMax($elevationMax)
    {
        $this->elevationMax = $elevationMax;

        return $this;
    }

    /**
     * Set elevUnitAbbrv.
     *
     * @param string $elevUnitAbbrv
     *
     * @return Location
     */
    public function setElevUnitAbbrv($elevUnitAbbrv)
    {
        $this->elevUnitAbbrv = $elevUnitAbbrv;

        return $this;
    }

    /**
     * Get ElevUnitAbbrv.
     *
     * @return string
     */
    public function getElevUnitAbbrv()
    {
        return $this->elevUnitAbbrv;
    }

    /**
     * Set gpsData.
     *
     * @param string $gpsData
     *
     * @return Location
     */
    public function setGpsData($gpsData)
    {
        $this->gpsData = $gpsData;

        return $this;
    }

    /**
     * Get gpsData.
     *
     * @return string
     */
    public function getGpsData()
    {
        return $this->gpsData;
    }

    /**
     * Set latitude.
     *
     * @param decimal $latitude
     *
     * @return Location
     */
    public function setLatitude($latitude)
    {
        $this->latitude = $latitude;

        return $this;
    }

    /**
     * Get latitude.
     *
     * @return decimal
     */
    public function getLatitude()
    {
        return $this->latitude;
    }

    /**
     * Set longitude.
     *
     * @param decimal $longitude
     *
     * @return Location
     */
    public function setLongitude($longitude)
    {
        $this->longitude = $longitude;

        return $this;
    }

    /**
     * Get longitude.
     *
     * @return decimal
     */
    public function getLongitude()
    {
        return $this->longitude;
    }

    /**
     * Set showOnMap.
     *
     * @param bool $showOnMap
     *
     * @return Location
     */
    public function setShowOnMap($showOnMap)
    {
        $this->showOnMap = $showOnMap;

        return $this;
    }

    /**
     * Get showOnMap.
     *
     * @return bool
     */
    public function getShowOnMap()
    {
        return $this->showOnMap;
    }

    /**
     * Set parentLoc.
     *
     * @param \AppBundle\Entity\Location $parentLoc
     *
     * @return Location
     */
    public function setParentLoc(\AppBundle\Entity\Location $parentLoc)
    {
        $this->parentLoc = $parentLoc;

        return $this;
    }

    /**
     * Get parentLoc.
     *
     * @return \AppBundle\Entity\Location
     */
    public function getParentLoc()
    {
        return $this->parentLoc;
    }

    /**
     * Get the parent Location's id.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("parent")
     *
     * @return int
     */
    public function getParentLocId()
    {
        return $this->parentLoc ? $this->parentLoc->getId() : null;
    }

    /**
     * Add childLoc.
     *
     * @param \AppBundle\Entity\Location $childLoc
     *
     * @return Location
     */
    public function addChildLocs(\AppBundle\Entity\Location $childLoc)
    {
        $this->childLocs[] = $childLoc;
        $childLoc->setParentLoc($this);

        return $this;
    }

    /**
     * Remove childLoc.
     *
     * @param \AppBundle\Entity\Location $childLoc
     */
    public function removeChildLoc(\AppBundle\Entity\Location $childLoc)
    {
        $this->childLocs->removeElement($childLoc);
    }

    /**
     * Get childLocs.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getChildLocs()
    {
        return $this->childLocs;
    }

    /**
     * Get an array of child Location ids.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("children")
     *
     * @return int
     */
    public function getChildLocIds()
    {
        $childLocs = $this->getChildLocs();
        $children = [];
        if ($childLocs === null) { return; }
        foreach ($childLocs as $child) {
            array_push($children, $child->getId());
        }
        return $children;
    }

    /**
     * Set locationType.
     *
     * @param \AppBundle\Entity\LocationType $locationType
     *
     * @return Location
     */
    public function setLocationType(\AppBundle\Entity\LocationType $locationType = null)
    {
        $this->locationType = $locationType;

        return $this;
    }

    /**
     * Get locationType.
     *
     * @return \AppBundle\Entity\LocationType
     */
    public function getLocationType()
    {
        return $this->locationType;
    }

    /**
     * Get locationType id.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("locationType")
     *
     * @return int
     */
    public function getLocationTypeId()
    {
        return $this->locationType->getId();
    }

    /**
     * Add interactions.
     *
     * @param \AppBundle\Entity\Interaction $interactions
     *
     * @return Location
     */
    public function addInteraction(\AppBundle\Entity\Interaction $interaction)
    {
        $this->interactions[] = $interaction;

        return $this;
    }

    /**
     * Remove interactions.
     *
     * @param \AppBundle\Entity\Interaction $interactions
     */
    public function removeInteraction(\AppBundle\Entity\Interaction $interaction)
    {
        $interaction->removeLocation();
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
     * Returns an array of interaction ids.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("interactions") 
     */
    public function getInteractionids()
    {
        $interactions = $this->getInteractions();
        $allIntIds = [];
        foreach ($interactions as $interaction) {
            array_push($allIntIds, $interaction->getId());
        }
        return $allIntIds;
    }

    /**
     * Set habitatType.
     *
     * @param \AppBundle\Entity\HabitatType $habitatType
     *
     * @return Location
     */
    public function setHabitatType(\AppBundle\Entity\HabitatType $habitatType = null)
    {
        $this->habitatType = $habitatType;

        return $this;
    }

    /**
     * Get habitatType.
     *
     * @return \AppBundle\Entity\HabitatType
     */
    public function getHabitatType()
    {
        return $this->habitatType;
    }

    /**
     * Get habitatType id.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("habitatType")
     *
     * @return int
     */
    public function getHabitatTypeId()
    {
        return $this->habitatType ? $this->habitatType->getId() : null;
    }

    public function getPlural()
    {
        return 'Locations';
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
        return $this->getDescription();
    }
}
