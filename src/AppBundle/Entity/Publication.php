<?php

namespace AppBundle\Entity;

use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\ORM\Mapping as ORM;

/**
 * Publication.
 *
 * @ORM\Table(name="publication")
 * @ORM\Entity(repositoryClass="AppBundle\Entity\PublicationRepository")
 * @ORM\HasLifecycleCallbacks
 * @Gedmo\SoftDeleteable(fieldName="deletedAt", timeAware=false)
 */
class Publication
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
     * @Gedmo\Slug(fields={"name"})
     * @ORM\Column(length=128, unique=true, nullable=true)
     */
    private $slug;

    /**
     * @var string
     *
     * @ORM\Column(name="doi", type="string", length=255, nullable=true)
     */
    private $doi;

    /**
     * @var string
     *
     * @ORM\Column(name="link_display", type="string", length=255, nullable=true)
     */
    private $linkDisplay;

    /**
     * @var string
     *
     * @ORM\Column(name="link_url", type="string", length=255, nullable=true)
     */
    private $linkUrl;

    /**
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=255)
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(name="publication_type", type="string", length=255, nullable=true)
     */
    private $publicationType;

    /**
     * @var string
     *
     * @ORM\Column(name="publisher", type="string", length=255, nullable=true)
     */
    private $publisher;
    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Citation", mappedBy="publication")
     */
    private $citations;

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
        $this->citations = new \Doctrine\Common\Collections\ArrayCollection();
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
     * Set doi.
     *
     * @param string $doi
     *
     * @return Publication
     */
    public function setDoi($doi)
    {
        $this->doi = $doi;

        return $this;
    }

    /**
     * Get doi.
     *
     * @return string
     */
    public function getDoi()
    {
        return $this->doi;
    }

    /**
     * Set linkDisplay.
     *
     * @param string $linkDisplay
     *
     * @return Publication
     */
    public function setLinkDisplay($linkDisplay)
    {
        $this->linkDisplay = $linkDisplay;

        return $this;
    }

    /**
     * Get linkDisplay.
     *
     * @return string
     */
    public function getLinkDisplay()
    {
        return $this->linkDisplay;
    }

    /**
     * Set linkUrl.
     *
     * @param string $linkUrl
     *
     * @return Publication
     */
    public function setLinkUrl($linkUrl)
    {
        $this->linkUrl = $linkUrl;

        return $this;
    }

    /**
     * Get linkUrl.
     *
     * @return string
     */
    public function getLinkUrl()
    {
        return $this->linkUrl;
    }

    /**
     * Set name.
     *
     * @param string $name
     *
     * @return Publication
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name.
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }
    
    /**
     * Set publicationType.
     *
     * @param string $publicationType
     *
     * @return Citation
     */
    public function setPublicationType($publicationType)
    {
        $this->publicationType = $publicationType;

        return $this;
    }

    /**
     * Get publicationType.
     *
     * @return string
     */
    public function getPublicationType()
    {
        return $this->publicationType;
    }

    /**
     * Set publisher.
     *
     * @param string $publisher
     *
     * @return Citation
     */
    public function setPublisher($publisher)
    {
        $this->publisher = $publisher;

        return $this;
    }

    /**
     * Get publisher.
     *
     * @return string
     */
    public function getPublisher()
    {
        return $this->publisher;
    }

    /**
     * Add citations.
     *
     * @param \AppBundle\Entity\Citation $citations
     *
     * @return Publication
     */
    public function addCitation(\AppBundle\Entity\Citation $citations)
    {
        $this->citations[] = $citations;

        return $this;
    }

    /**
     * Remove citations.
     *
     * @param \AppBundle\Entity\Citation $citations
     */
    public function removeCitation(\AppBundle\Entity\Citation $citations)
    {
        $this->citations->removeElement($citations);
    }

    /**
     * Get citations.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getCitations()
    {
        return $this->citations;
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
        return $this->getName();
    }
}
