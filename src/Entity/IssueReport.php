<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
// use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\File\File;
use Vich\UploaderBundle\Mapping\Annotation as Vich;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Mapping\ClassMetadata;


/**
 * Issue report.
 *
 * @ORM\Entity
 * @Vich\Uploadable
 * @ORM\Table(name="issue_report")
 * @ORM\HasLifecycleCallbacks
 */
class IssueReport
{
    /**
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="desctiption", type="text", nullable=false)
     */
    private $description;

    /**
     * @var string
     *
     * @ORM\Column(name="steps_to_reproduce", type="text", nullable=false)
     */
    private $stepsToReproduce;

    /**
     * @var string
     *
     * @ORM\Column(name="misc_info", type="text", nullable=true)
     */
    private $miscInfo;

    /**
     * @var \Doctrine\Common\Collections\Collection
     *
     * @ORM\OneToMany(targetEntity="App\Entity\ImageUpload", mappedBy="report", fetch="EXTRA_LAZY")
     */
    private $screenshots;

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
     * Constructor.
     */
    public function __construct()
    {
        $this->screenshots = new \Doctrine\Common\Collections\ArrayCollection();
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
     * Get description.
     *
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * Set temporary UploadedFile obj.
     *
     * @return IssueReport
     */
    public function setDescription($description)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * Get stepsToReproduce.
     *
     * @return string
     */
    public function getStepsToReproduce()
    {
        return $this->stepsToReproduce;
    }

    /**
     * Set stepsToReproduce.
     *
     * @return IssueReport
     */
    public function setStepsToReproduce($stepsToReproduce)
    {
        $this->stepsToReproduce = $stepsToReproduce;

        return $this;
    }

    /**
     * Get miscInfo.
     *
     * @return string
     */
    public function getMiscInfo()
    {
        return $this->miscInfo;
    }

    /**
     * Set temporary UploadedFile obj.
     *
     * @return IssueReport
     */
    public function setMiscInfo($miscInfo)
    {
        $this->miscInfo = $miscInfo;

        return $this;
    }

    /**
     * Add screenshots.
     *
     * @param \App\Entity\ImageUpload $screenshots
     *
     * @return IssueReport
     */
    public function addScreenshot(\App\Entity\ImageUpload $screenshots)
    {
        $this->screenshots[] = $screenshots;

        return $this;
    }

    /**
     * Remove screenshots.
     *
     * @param \App\Entity\ImageUpload $screenshots
     */
    public function removeScreenshot(\App\Entity\ImageUpload $screenshots)
    {
        $this->screenshots->removeElement($screenshots);
    }

    /**
     * Get screenshots.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getScreenshots()
    {
        return $this->screenshots;
    }

    /**
     * Set created datetime.
     *
     * @param \DateTime $createdAt
     *
     * @return IssueReport
     */
    public function setCreated(\DateTime $createdAt)
    {
        $this->created = $createdAt;

        return $this;
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
     * Set createdBy user.
     *
     * @return \App\Entity\User
     */
    public function setCreatedBy(\App\Entity\User $user)
    {
        $this->createdBy = $user;
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
     * Get last updated datetime.
     *
     * @return \DateTime
     */
    public function getUpdated()
    {
        return $this->updated;
    }

    /**
     * Set last-updated datetime.
     *
     * @param \DateTime $updatedAt
     *
     * @return IssueReport
     */
    public function setUpdated(\DateTime $updatedAt)
    {
        $this->updated = $updatedAt;

        return $this;
    }

    /**
     * Set last updated by user.
     *
     * @return \App\Entity\User
     */
    public function setUpdatedBy(\App\Entity\User $user = null)
    {
        $this->updatedBy = $user;
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
        return $this->description;
    }
}
