<?php

namespace AppBundle\Entity;

use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\ORM\Mapping as ORM;

/**
 * Citation.
 *
 * @ORM\Table(name="citation")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks
 * @Gedmo\SoftDeleteable(fieldName="deletedAt", timeAware=false)
 */
class Citation
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
     * @ORM\Column(name="description", type="string", length=255, nullable=true)
     */
    private $description;

    /**
     * @var string
     *
     * @ORM\Column(name="full_text", type="text")
     */
    private $fullText;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_secondary", type="boolean", nullable=true)
     */
    private $isSecondary;

    /**
     * @var string
     *
     * @ORM\Column(name="publication_issue", type="string", length=255, nullable=true)
     */
    private $publicationIssue;

    /**
     * @var string
     *
     * @ORM\Column(name="publication_pages", type="string", length=255, nullable=true)
     */
    private $publicationPages;

    /**
     * @var string
     *
     * @ORM\Column(name="publisher", type="string", length=255, nullable=true)
     */
    private $publicationVolume;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=255, nullable=true)
     */
    private $title;

    /**
     * @var string
     *
     * @ORM\Column(name="year", type="string", length=255, nullable=true)
     */
    private $year;

    /**
     * @ORM\ManyToMany(targetEntity="Tag", mappedBy="citations")
     * @ORM\JoinTable(name="citation_tag")
     */
    private $tags;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Interaction", mappedBy="citation")
     */
    private $interactions;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Attribution", mappedBy="citation")
     */
    private $attributions;

    /**
     * @var \AppBundle\Entity\Publication
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Publication", inversedBy="citations")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="publication_id", referencedColumnName="id")
     * })
     */
    private $publication;

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
        $this->attributions = new \Doctrine\Common\Collections\ArrayCollection();
        $this->tags = new \Doctrine\Common\Collections\ArrayCollection();
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
     * @return Citation
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
     * Set fullText.
     *
     * @param string $fullText
     *
     * @return Citation
     */
    public function setFullText($fullText)
    {
        $this->fullText = $fullText;

        return $this;
    }

    /**
     * Get fullText.
     *
     * @return string
     */
    public function getFullText()
    {
        return $this->fullText;
    }

    /**
     * Set isSecondary.
     *
     * @param bool $isSecondary
     *
     * @return Citation
     */
    public function setIsSecondary($isSecondary)
    {
        $this->isSecondary = $isSecondary;

        return $this;
    }

    /**
     * Get isSecondary.
     *
     * @return bool
     */
    public function getIsSecondary()
    {
        return $this->isSecondary;
    }

    /**
     * Set publicationIssue.
     *
     * @param string $publicationIssue
     *
     * @return Citation
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
     * @return Citation
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
     * @return Citation
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
     * Set title.
     *
     * @param string $title
     *
     * @return Citation
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get title.
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set year.
     *
     * @param string $year
     *
     * @return Citation
     */
    public function setYear($year)
    {
        $this->year = $year;

        return $this;
    }

    /**
     * Get year.
     *
     * @return string
     */
    public function getYear()
    {
        return $this->year;
    }

    /**
     * Add Tags.
     *
     * @param \AppBundle\Entity\Tag $tags
     *
     * @return Interaction
     */
    public function setTags(\AppBundle\Entity\Tag $tags)
    {
        $this->tags[] = $tags;

        return $this;
    }

    /**
     * Remove Tags.
     *
     * @param \AppBundle\Entity\Tag $tags
     */
    public function removeTag(\AppBundle\Entity\Tag $tags)
    {
        $this->tags->removeElement($tags);
    }

    /**
     * Get tags.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getTags()
    {
        return $this->tags;
    }

    /**
     * Add interactions.
     *
     * @param \AppBundle\Entity\Interaction $interactions
     *
     * @return Citation
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
     * Add attributions.
     *
     * @param \AppBundle\Entity\Attribution $attributions
     *
     * @return Citation
     */
    public function addAttribution(\AppBundle\Entity\Attribution $attributions)
    {
        $this->attributions[] = $attributions;

        return $this;
    }

    /**
     * Remove attributions.
     *
     * @param \AppBundle\Entity\Attribution $attributions
     */
    public function removeAttribution(\AppBundle\Entity\Attribution $attributions)
    {
        $this->attributions->removeElement($attributions);
    }

    /**
     * Get attributions.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getAttributions()
    {
        return $this->attributions;
    }

    /**
     * Set publication.
     *
     * @param \AppBundle\Entity\Publication $publication
     *
     * @return Citation
     */
    public function setPublication(\AppBundle\Entity\Publication $publication = null)
    {
        $this->publication = $publication;

        return $this;
    }

    /**
     * Get publication.
     *
     * @return \AppBundle\Entity\Publication
     */
    public function getPublication()
    {
        return $this->publication;
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
        return $this->getDescription();
    }
}
