<?php

namespace AppBundle\Entity;

use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\ORM\Mapping as ORM;

/**
 * Location.
 *
 * @ORM\Table(name="location")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks
 * @Gedmo\SoftDeleteable(fieldName="deletedAt", timeAware=false)
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
     * @ORM\Column(name="description", type="string", length=255)
     */
    private $description;

    /**
     * @var int
     *
     * @ORM\Column(name="elevation", type="integer", nullable=true)
     */
    private $elevation;

    /**
     * @var string
     *
     * @ORM\Column(name="elev_unit_abbrv", type="string", length=3)
     */
    private $elevUnitAbbrv;

    /**
     * @var string
     *
     * @ORM\Column(name="gps_data", type="string", length=255, nullable=true)
     */
    private $gpsData;

    /**
     * @var string
     *
     * @ORM\Column(name="latitude", type="decimal", precision=18, scale=14, nullable=true)
     */
    private $latitude;

    /**
     * @var string
     *
     * @ORM\Column(name="longitude", type="decimal", precision=18, scale=14, nullable=true)
     */
    private $longitude;

    /**
     * @var bool
     *
     * @ORM\Column(name="show_on_map", type="boolean", nullable=true)
     */
    private $showOnMap;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Interaction", mappedBy="location")
     */
    private $interactions;

    /**
     * @ORM\ManyToMany(targetEntity="Region", mappedBy="locations")
     * @ORM\JoinTable(name="regions_locations")
     */
    private $regions;

    /**
     * @var \AppBundle\Entity\Country
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Country", inversedBy="locations")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="country_id", referencedColumnName="id")
     * })
     */
    private $country;

    /**
     * @var \AppBundle\Entity\HabitatType
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\HabitatType", inversedBy="locations")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="habitat_type_id", referencedColumnName="id")
     * })
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
     * @ORM\Column(name="deletedAt", type="datetime", nullable=true)
     */
    private $deletedAt;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->interactions = new \Doctrine\Common\Collections\ArrayCollection();
        $this->regions = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /**
     * Add interactions.
     *
     * @param \AppBundle\Entity\Interaction $interactions
     *
     * @return Location
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
     * Add Regions.
     *
     * @param \AppBundle\Entity\Region $regions
     *
     * @return Country
     */
    public function addRegion(\AppBundle\Entity\Region $regions)
    {
        $this->regions[] = $regions;

        return $this;
    }

    /**
     * Remove Regions.
     *
     * @param \AppBundle\Entity\Region $regions
     */
    public function removeRegion(\AppBundle\Entity\Region $regions)
    {
        $this->regions->removeElement($regions);
    }

    /**
     * Get regions.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getRegions()
    {
        return $this->regions;
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
     * Set country.
     *
     * @param \AppBundle\Entity\Country $country
     *
     * @return Location
     */
    public function setCountry(\AppBundle\Entity\Country $country = null)
    {
        $this->country = $country;

        return $this;
    }

    /**
     * Get country.
     *
     * @return \AppBundle\Entity\Country
     */
    public function getCountry()
    {
        return $this->country;
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

    public function getPlural()
    {
        return 'Locations';
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
     * @param \DateTime $deletedAt
     */
    public function setDeletedAt($deletedAt)
    {
        $this->deletedAt = $deletedAt;
    }

    /**
     * Get string representation of object.
     *
     * @return string
     */
    public function __toString()
    {
        if ($this->getDescription()) {
            return $this->getDescription();
        }
        $country = $this->getCountry()->getName();
        $habitatType = $this->getHabitatType()->getName();
        $gpsdata = $this->getGpsData();

        return $country.' '.$habitatType.' '.$gpsdata;
    }
}
