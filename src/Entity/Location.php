<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use JMS\Serializer\Annotation as JMS;
use JMS\Serializer\Annotation\Groups;

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
     * @ORM\Column(name="display_name", type="string", length=255, unique=true, nullable=false)
     * @JMS\Expose
     * @JMS\SerializedName("displayName")
     * @Groups({"normalized", "flattened"})
     */
    private $displayName;

    /**
     * @var string
     *
     * @ORM\Column(name="description", type="string", length=255, nullable=true)
     * @JMS\Expose
     * @Groups({"normalized", "flattened"})
     */
    private $description;

    /**
     * @var string
     * 2 letter country code.
     *
     * @ORM\Column(name="iso_code", type="string", length=255, nullable=true)
     */
    private $isoCode;

    /**
     * @var int
     *
     * @ORM\Column(name="elevation", type="integer", nullable=true)
     * @JMS\Expose
     * @Groups({"normalized", "flattened"})
     */
    private $elevation;

    /**
     * @var int
     *
     * @ORM\Column(name="elevation_max", type="integer", nullable=true)
     * @JMS\Expose
     * @JMS\SerializedName("elevationMax")
     * @Groups({"normalized", "flattened"})
     */
    private $elevationMax;

    /**
     * @var string
     *
     * @ORM\Column(name="elev_unit_abbrv", type="string", length=3, nullable=true)
     * @JMS\Expose
     * @JMS\SerializedName("elevUnitAbbrv")
     * @Groups({"normalized", "flattened"})
     */
    private $elevUnitAbbrv;

    /**
     * @var string
     *
     * @ORM\Column(name="gps_data", type="string", length=255, nullable=true)
     * @JMS\Expose
     * @JMS\SerializedName("gpsData")
     * @Groups({"normalized", "flattened"})
     */
    private $gpsData;

    /**
     * @var string
     *
     * @ORM\Column(name="latitude", type="decimal", precision=18, scale=14, nullable=true)
     * @JMS\Expose
     * @Groups({"normalized", "flattened"})
     */
    private $latitude;

    /**
     * @var string
     *
     * @ORM\Column(name="longitude", type="decimal", precision=18, scale=14, nullable=true)
     * @JMS\Expose
     * @Groups({"normalized", "flattened"})
     */
    private $longitude;

    /**
     * @var bool
     *
     * @ORM\Column(name="show_on_map", type="boolean", nullable=true)
     */
    private $showOnMap;

    /**
     * @var \App\Entity\Location
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\Location", inversedBy="childLocs")
     * @ORM\JoinColumn(name="parent_loc_id", referencedColumnName="id", onDelete="SET NULL")
     */
    private $parentLoc;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="App\Entity\Location", mappedBy="parentLoc", fetch="EXTRA_LAZY")
     * @ORM\OrderBy({
     *     "description"="ASC"
     * })
     */
    private $childLocs;

    /**
     * @var \App\Entity\LocationType
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\LocationType", inversedBy="locations")
     * @ORM\JoinColumn(name="type_id", referencedColumnName="id", nullable=false)
     */
    private $locationType;

    /**
     * @var \App\Entity\GeoJson
     *
     * @ORM\OneToOne(targetEntity="App\Entity\GeoJson", cascade={"persist"})
     * @ORM\JoinColumn(name="geo_json", referencedColumnName="id", nullable=true)
     * @JMS\Expose
     * @Groups({"flattened"})
     */
    private $geoJson;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="App\Entity\Interaction", mappedBy="location", fetch="EXTRA_LAZY")
     */
    private $interactions;

    /**
     * @var \App\Entity\HabitatType
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\HabitatType", inversedBy="locations")
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
     * @ORM\ManyToOne(targetEntity="App\Entity\User")
     * @ORM\JoinColumn(name="created_by", referencedColumnName="id")
     */
    private $createdBy;

    /**
     * @var \DateTime
     *
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(type="datetime")
     * @JMS\Expose
     * @JMS\SerializedName("serverUpdatedAt")
     * @Groups({"normalized", "flattened"})
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
     * @Groups({"normalized", "flattened"})
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
     * Set isoCode.
     *
     * @param string $isoCode
     *
     * @return Location
     */
    public function setIsoCode($isoCode)
    {
        $this->isoCode = $isoCode;

        return $this;
    }

    /**
     * Get isoCode.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("isoCode")
     * @Groups({"normalized", "flattened"})
     *
     * @return string
     */
    public function getIsoCode()
    {
        return $this->isoCode;
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
     * @param \App\Entity\Location $parentLoc
     *
     * @return Location
     */
    public function setParentLoc(\App\Entity\Location $parentLoc = null)
    {
        $this->parentLoc = $parentLoc;

        return $this;
    }

    /**
     * Get parentLoc.
     *
     * @return \App\Entity\Location
     */
    public function getParentLoc()
    {
        return $this->parentLoc;
    }

    /**
     * Get the parent Location's id.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("parent")
     * @Groups({"normalized"})
     */
    public function getParentLocId()
    {
        return $this->parentLoc ? $this->parentLoc->getId() : null;
    }

    /**
     * Add childLoc.
     *
     * @param \App\Entity\Location $childLoc
     *
     * @return Location
     */
    public function addChildLocs(\App\Entity\Location $childLoc)
    {
        $this->childLocs[] = $childLoc;
        $childLoc->setParentLoc($this);

        return $this;
    }

    /**
     * Remove childLoc.
     *
     * @param \App\Entity\Location $childLoc
     */
    public function removeChildLoc(\App\Entity\Location $childLoc)
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
     * @Groups({"normalized"})
     */
    public function getChildLocIds()
    {
        if ($this->childLocs) {
            $children = [];
            foreach ($this->childLocs as $child) {
                array_push($children, $child->getId());
            }
            return $children;
        }
    }

    /**
     * Set locationType.
     *
     * @param \App\Entity\LocationType $locationType
     *
     * @return Location
     */
    public function setLocationType(\App\Entity\LocationType $locationType = null)
    {
        $this->locationType = $locationType;

        return $this;
    }

    /**
     * Get locationType.
     *
     * @return \App\Entity\LocationType
     */
    public function getLocationType()
    {
        return $this->locationType;
    }
    /** -------- Serialize Location Type Data ------------------------ */
    /**
     * Get locationType id and displayName.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("locationType")
     * @Groups({"normalized", "flattened"})
     */
    public function getLocationTypeData()
    {
        return [
            "id" => $this->locationType->getId(),
            "displayName" => $this->locationType->getDisplayName()
        ];
    }

    /**
     * Get the Region of this Location.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("region")
     * @Groups({"normalized", "flattened"})
     */
    public function getRegionData()
    {
        $locType = $this->locationType; // print("Region loc Type = ".$locType->getId());
        if ($locType->getSlug() === 'region') { return $this->getLocObj($this); }
        return $this->findParentLocType($this, 'region');
    }

    /**
     * Get the Country of this Location.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("country")
     * @Groups({"normalized", "flattened"})
     */
    public function getCountryData()
    {
        $locType = $this->locationType; //print("Country loc Type = ".$locType->getId()." for ".$this->displayName);
        if ($locType->getSlug() === 'region') { return false; }
        if ($locType->getSlug() === 'country') { return $this->getLocObj($this); }
        return $this->findParentLocType($this, 'country');
    }

    /** Get the parent location of the passed type, region or country, if it exists. */
    private function findParentLocType($loc, $typeSlug)
    {
        $parent = $loc->getParentLoc();
        if (!$parent) { return null; }
        if ($typeSlug=='country' && $this->hasRegionParent($parent)) {return null;}
        if ($parent->getLocationType()->getSlug() === $typeSlug) {
            return $this->getLocObj($parent);
        }
        return $this->findParentLocType($parent, $typeSlug);
    }
    private function hasRegionParent($parent)
    {
        return $parent->getLocationType()->getSlug() == 'region';
    }

    /** Get the Location id and displayName. */
    private function getLocObj($loc)
    {
        return [ "id" => $loc->getId(), "displayName" => $loc->getDisplayName() ];
    }
    /** ---- End Location Type Data ---- */
    /**
     * Set geoJson.
     *
     * @param \App\Entity\GeoJson $geoJson
     *
     * @return Source
     */
    public function setGeoJson(\App\Entity\GeoJson $geoJson)
    {
        $this->geoJson = $geoJson;

        return $this;
    }

    public function removeGeoJson()
    {
        $this->geoJson = null;

        return $this;
    }

    /**
     * Get geoJson Entity.
     *
     * @return \App\Entity\GeoJson
     */
    public function getGeoJson()
    {
        return $this->geoJson;
    }

    /**
     * Get geoJson ID.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("geoJsonId")
     * @Groups({"normalized"})
     *
     * @return integer
     */
    public function getGeoJsonId()
    {
        $geoJson = $this->geoJson ? $this->geoJson->getId() : null;
        if (!$geoJson && $this->isHabitat()) {
            $geoJson = $this->parentLoc->getGeoJsonId();
        }
        return $geoJson;
    }

    private function isHabitat()
    {
        if ($this->locationType->getDisplayName() !== 'Habitat') { return false;}
        $pName = $this->parentLoc->getDisplayName();
        $habitat = $this->getHabitatType()->getDisplayName();
        return $this->getDisplayName() == $pName.'-'.$habitat;
    }

    /**
     * Add interactions.
     *
     * @param \App\Entity\Interaction $interactions
     *
     * @return Location
     */
    public function addInteraction(\App\Entity\Interaction $interaction)
    {
        $this->interactions[] = $interaction;

        return $this;
    }

    /**
     * Remove interactions.
     *
     * @param \App\Entity\Interaction $interactions
     */
    public function removeInteraction(\App\Entity\Interaction $interaction)
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
     * @Groups({"normalized"})
     */
    public function getInteractionIds()
    {
        $allIntIds = [];
        foreach ($this->interactions as $interaction) {
            array_push($allIntIds, $interaction->getId());
        }
        return $allIntIds;
    }

    /**
     * Set habitatType.
     *
     * @param \App\Entity\HabitatType $habitatType
     *
     * @return Location
     */
    public function setHabitatType(\App\Entity\HabitatType $habitatType = null)
    {
        $this->habitatType = $habitatType;

        return $this;
    }

    /**
     * Get habitatType.
     *
     * @return \App\Entity\HabitatType
     */
    public function getHabitatType()
    {
        return $this->habitatType;
    }

    /**
     * Get habitatType id and displayName.
     * @JMS\VirtualProperty
     * @JMS\SerializedName("habitatType")
     * @Groups({"normalized", "flattened"})
     */
    public function getHabitatTypeData()
    {
        if ($this->habitatType) {
            return [
                "id" => $this->habitatType->getId(),
                "displayName" => $this->habitatType->getDisplayName()
            ];
        }
        return [];
    }

    public function getPlural()
    {
        return 'Locations';
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
     * @return \App\Entity\User
     */
    public function getCreatedBy()
    {
        return $this->createdBy;
    }

    /**
     * Set last updated by user.
     *
     * @return \App\Entity\User
     */
    public function setUpdatedBy(\App\Entity\User $user = null)
    {
        $this->updatedBy = $user;

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
     * Get last updated by user.
     *
     * @return \App\Entity\User
     */
    public function getUpdatedBy()
    {
        return $this->updatedBy;
    }

    /**
     * Get updated by user name.
     * Note: Returns null for records developer (ID = 6) modified
     * @JMS\VirtualProperty
     * @JMS\SerializedName("updatedBy")
     * @Groups({"normalized", "flattened"})
     *
     * @return string
     */
    public function serializeUpdatedBy()
    {
        $createdBy = $this->createdBy ?
            ($this->createdBy->getId() == 6 ? null : $this->createdBy) : null;
        $user = $this->updatedBy ?
            ($this->updatedBy->getId() == 6 ? null : $this->updatedBy) : $createdBy;

        return !$user ? null : $user->getFirstName();
    }

    /**
     * Set deleted at.
     *
     * @param \DateTime $deletedAt
     */
    public function setDeletedAt($deletedAt)
    {
        $this->deletedAt = $deletedAt;

        return $this;
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
        return $this->getDisplayName();
    }
}
