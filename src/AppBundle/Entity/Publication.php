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
     * @Gedmo\Slug(fields={"displayName"})
     * @ORM\Column(length=128, unique=true, nullable=true)
     */
    private $slug;
    
    /**
     * @var string
     *
     * @ORM\Column(name="displayName", type="string", length=255)
     */
    private $displayName;

    /**
     * @var string
     * //port to displayName and delete
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
     * @var string
     *
     * @ORM\Column(name="pub_issue", type="string", length=255, nullable=true)
     */
    private $publicationIssue;

    /**
     * @var string
     *
     * @ORM\Column(name="pub_pages", type="string", length=255, nullable=true)
     */
    private $publicationPages;

    /**
     * @var string
     *
     * @ORM\Column(name="pub_volume", type="string", length=255, nullable=true)
     */
    private $publicationVolume;

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
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToOne(targetEntity="AppBundle\Entity\Source", inversedBy="publication")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="source_id", referencedColumnName="id", unique=true)
     * })
     */
    private $source;

    /**
     * @var \Doctrine\Common\Collections\Collection
     * //port to citatoinSources and delete
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Citation", mappedBy="publication")
     */
    private $citations;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Source", mappedBy="publication") 
     */
    private $citationSources;

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
     * Set displayName.
     *
     * @param string $displayName
     *
     * @return Publication
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
     * @return Publication
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
     * @return Publication
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
     * Set publicationIssue.
     *
     * @param string $publicationIssue
     *
     * @return Publication
     */
    public function setPublicationIssue($publicationIssue)
    {
        $this->publicationIssue = $publicationIssue;

        return $this;
    }

    /**
     * Get publicationIssue.
     *
     * @return string
     */
    public function getPublicationIssue()
    {
        return $this->publicationIssue;
    }
    /**
     * Set publicationPages.
     *
     * @param string $publicationPages
     *
     * @return Publication
     */
    public function setPublicationPages($publicationPages)
    {
        $this->publicationPages = $publicationPages;

        return $this;
    }

    /**
     * Get publicationPages.
     *
     * @return string
     */
    public function getPublicationPages()
    {
        return $this->publicationPages;
    }

    /**
     * Set publicationVolume.
     *
     * @param string $publicationVolume
     *
     * @return Publication
     */
    public function setPublicationVolume($publicationVolume)
    {
        $this->publicationVolume = $publicationVolume;

        return $this;
    }

    /**
     * Get publicationVolume.
     *
     * @return string
     */
    public function getPublicationVolume()
    {
        return $this->publicationVolume;
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
     * Set source.
     *
     * @param \AppBundle\Entity\Source $source
     *
     * @return Publication
     */
    public function setSource(\AppBundle\Entity\Source $source)
    {
        $this->source = $source;

        return $this;
    }

    /**
     * Get source.
     *
     * @return \AppBundle\Entity\Source
     */
    public function getSource()
    {
        return $this->source;
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
     * Add citationSource.
     *
     * @param \AppBundle\Entity\Source $citationSource
     *
     * @return Publication
     */
    public function addCitationSource(\AppBundle\Entity\Source $citationSource)
    {
        $this->citationSources[] = $citationSource;

        return $this;
    }

    /**
     * Remove citationSource.
     *
     * @param \AppBundle\Entity\Source $citationSource
     */
    public function removeCitationSource(\AppBundle\Entity\Source $citationSource)
    {
        $this->citationSources->removeElement($citationSource);
    }

    /**
     * Get citationSources.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getCitationSources()
    {
        return $this->citationSources;
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
        return $this->getDisplayName();
    }
}
