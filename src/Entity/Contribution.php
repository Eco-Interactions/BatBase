<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * Contribution.
 *
 * @ORM\Table(name="contribution", uniqueConstraints={
 *     @ORM\UniqueConstraint(name="unq_contrib", columns={"work_src_id", "auth_src_id"})
 * })
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks
 */
class Contribution
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
     * @var bool
     *
     * @ORM\Column(name="is_editor", type="boolean", nullable=true)
     */
    private $isEditor;

    /**
     * @var int
     *
     * @ORM\Column(name="ord", type="integer", nullable=false)
     */
    private $ord;

    /**
     * @var \App\Entity\Source
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\Source", inversedBy="contributors")
     * @ORM\JoinColumn(name="work_src_id", referencedColumnName="id", nullable=false)
     *
     * Refers to a single work source record.
     */
    private $workSource;

    /**
     * @var \App\Entity\Source
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\Source", inversedBy="contributions")
     * @ORM\JoinColumn(name="auth_src_id", referencedColumnName="id", nullable=false)
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
     * @ORM\ManyToOne(targetEntity="App\Entity\User")
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
     * @ORM\ManyToOne(targetEntity="App\Entity\User")
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
     * @return Contribution
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
     * Set isEditor.
     *
     * @param bool $isEditor
     *
     * @return Source
     */
    public function setIsEditor($isEditor)
    {
        $this->isEditor = $isEditor;

        return $this;
    }

    /**
     * Get isEditor.
     *
     * @return bool
     */
    public function getIsEditor()
    {
        return $this->isEditor;
    }

    /**
     * Set ord.
     *
     * @return Contribution
     */
    public function setOrd($ord)
    {
        $this->ord = $ord;

        return $this;
    }

    /**
     * Get ord.
     *
     * @return int
     */
    public function getOrd()
    {
        return $this->ord;
    }

    /**
     * Set workSource.
     *
     * @param \App\Entity\Source $workSource
     *
     * @return Contribution
     */
    public function setWorkSource(\App\Entity\Source $workSource)
    {
        $this->workSource = $workSource;

        return $this;
    }

    /**
     * Get workSource.
     *
     * @return \App\Entity\Source
     */
    public function getWorkSource()
    {
        return $this->workSource;
    }

    /**
     * Set Author Source.
     *
     * @param \App\Entity\Source $authorSource
     *
     * @return Contribution
     */
    public function setAuthorSource(\App\Entity\Source $authorSource)
    {
        $this->authorSource = $authorSource;

        return $this;
    }

    /**
     * Get Author Source.
     *
     * @return \App\Entity\Source
     */
    public function getAuthorSource()
    {
        return $this->authorSource;
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
    public function setUpdatedBy(\App\Entity\User $user)
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
     * @return \App\Entity\User
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
            $desc_str = $this->getAuthorSource().' - '.$this->getWorkSource();
            return $desc_str;
        }
    }
}
