<?php

namespace AppBundle\Entity;

use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\ORM\Mapping as ORM;

/**
 * Attribution.
 *
 * @ORM\Table(name="attribution")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks
 */
class Attribution
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
     * @var \AppBundle\Entity\Citation
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Citation", inversedBy="attributions")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="citation_id", referencedColumnName="id")
     * })
     */
    private $citation;

    /**
     * @var \AppBundle\Entity\Author
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Author", inversedBy="attributions")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="author_id", referencedColumnName="id")
     * })
     */
    private $author;

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
     * @return Attribution
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
     * Set citation.
     *
     * @param \AppBundle\Entity\Citation $citation
     *
     * @return Attribution
     */
    public function setCitation(\AppBundle\Entity\Citation $citation = null)
    {
        $this->citation = $citation;

        return $this;
    }

    /**
     * Get citation.
     *
     * @return \AppBundle\Entity\Citation
     */
    public function getCitation()
    {
        return $this->citation;
    }

    /**
     * Set author.
     *
     * @param \AppBundle\Entity\Author $author
     *
     * @return Attribution
     */
    public function setAuthor(\AppBundle\Entity\Author $author = null)
    {
        $this->author = $author;

        return $this;
    }

    /**
     * Get author.
     *
     * @return \AppBundle\Entity\Author
     */
    public function getAuthor()
    {
        return $this->author;
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
            $desc_str = $this->getAuthor().' - '.$this->getCitation();

            return $desc_str;
        }

        return;
    }
}
