<?php

namespace AppBundle\Entity;

use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\ORM\Mapping as ORM;

/**
 * Contributor.
 *
 * @ORM\Table(name="contributor")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks
 */
class Contributor
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
     * @ORM\Column(name="cited_as", type="string", length=255, nullable=true)
     */
    private $citedAs;

    /**
     * @var \AppBundle\Entity\Source
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Source", inversedBy="authors")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="citation_id", referencedColumnName="id")
     * })
     *
     * Refers to a single citation source record.
     */
    private $citationSource;

    /**
     * @var \AppBundle\Entity\Source
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Author", inversedBy="citations")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="author_id", referencedColumnName="id")
     * })
     *
     * Refers to a single author source record.
     */
    private $authorSource;

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
     * Get id.
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set citedAs.
     *
     * @param string $citedAs
     *
     * @return Contributor
     */
    public function setCitedAs($citedAs)
    {
        $this->citedAs = $citedAs;

        return $this;
    }

    /**
     * Get citedAs.
     *
     * @return string
     */
    public function getCitedAs()
    {
        return $this->citedAs;
    }

    /**
     * Set Citation Source.
     *
     * @param \AppBundle\Entity\Source $citationSource
     *
     * @return Contributor
     */
    public function setCitationSource(\AppBundle\Entity\Source $citationSource = null)
    {
        $this->citationSource = $citationSource;

        return $this;
    }

    /**
     * Get Citation Source.
     *
     * @return \AppBundle\Entity\Source
     */
    public function getCitationSource()
    {
        return $this->citationSource;
    }

    /**
     * Set Author Source.
     *
     * @param \AppBundle\Entity\Source $authorSource
     *
     * @return Contributor
     */
    public function setAuthorSource(\AppBundle\Entity\Source $authorSource = null)
    {
        $this->authorSource = $authorSource;

        return $this;
    }

    /**
     * Get Author Source.
     *
     * @return \AppBundle\Entity\Source
     */
    public function getAuthorSource()
    {
        return $this->source;
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
     * Get string representation of object.
     *
     * @return string
     */
    public function __toString()
    {
        $citedAs = $this->getCitedAs();
        if (!is_null($citedAs)) {
            return $citedAs;
        } else {
            $desc_str = $this->getAuthor().' - '.$this->getSource();
            return $desc_str;
        }
    }
}
