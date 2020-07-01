<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\HttpFoundation\File\File;
use Vich\UploaderBundle\Mapping\Annotation as Vich;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Mapping\ClassMetadata;


/**
 * Image Upload.
 *
 * @ORM\Entity
 * @Vich\Uploadable
 * @ORM\Table(name="image_upload")
 * @ORM\HasLifecycleCallbacks
 */
class ImageUpload
{
    /**
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * URL to image|pdf file.
     *
     * @ORM\Column(name="file_name", type="string", nullable=false)
     */
    private $fileName;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", unique=true, length=255, nullable=true)
     */
    private $title;

    /**
     * @var string
     *
     * @ORM\Column(name="desctiption", type="text", nullable=true)
     */
    private $description;

    /**
     * @ORM\Column(name="path", type="string", nullable=false)
     */
    private $path;

    /**
     * @ORM\Column(name="mime_type", type="string", nullable=false)
     */
    private $mimeType;

    /**
     * @ORM\Column(name="size", type="decimal", nullable=false)
     */
    private $size;

    /**
     * Used as container for UploadedFile obj.
     *
     * @Vich\UploadableField(
     *      mapping="issue_image",
     *      fileNameProperty="fileName",
     *      size="size",
     *      mimeType="mimeType"
     * )
     *
     * @var File|null
     */
    private $image;

    /**
     * @var \App\Entity\IssueReport
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\IssueReport", inversedBy="screenshots")
     * @ORM\JoinColumn(name="report_id", referencedColumnName="id", nullable=true)
     */
    private $issueReport;

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
     * Get fileName.
     *
     * @return string
     */
    public function getFileName()
    {
        return $this->fileName;
    }

    /**
     * Set fileName.
     *
     * @return ImageUpload
     */
    public function setFileName($fileName)
    {
        $this->fileName = $fileName;

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
     * Set title.
     *
     * @return ImageUpload
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Set description.
     *
     * @param string $description
     *
     * @return ImageUpload
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
     * Set path.
     *
     * @param string $path
     *
     * @return ImageUpload
     */
    public function setPath($path = 'uploads/issue_screenshots/')
    {
        $this->path = $path . $this->fileName;

        return $this;
    }

    /**
     * Get path.
     *
     * @return string
     */
    public function getPath()
    {
        return $this->path;
    }

    /**
     * Set mimeType.
     *
     * @param string $mimeType
     *
     * @return ImageUpload
     */
    public function setMimeType($mimeType)
    {
        $this->mimeType = $mimeType;

        return $this;
    }

    /**
     * Get mimeType.
     *
     * @return string
     */
    public function getMimeType()
    {
        return $this->mimeType;
    }

    /**
     * Set size.
     *
     * @param string $size
     *
     * @return ImageUpload
     */
    public function setSize($size)
    {
        $this->size = $size;

        return $this;
    }

    /**
     * Get size.
     *
     * @return string
     */
    public function getSize()
    {
        return $this->size;
    }

    /**
     * If manually uploading a file (i.e. not using Symfony Form) ensure an instance
     * of 'UploadedFile' is injected into this setter to trigger the update.
     *
     * @param File|\Symfony\Component\HttpFoundation\File\UploadedFile|null $image
     */
    public function setImage(?File $image = null): void
    {
        $this->image = $image;

        if (null !== $image) {
            // It is required that at least one field changes if you are using doctrine
            // otherwise the event listeners won't be called and the file is lost
            // $this->updatedAt = new \DateTimeImmutable();
            $this->setPath();
        }
    }

    public function getImage(): ?File
    {
        return $this->image;
    }

    public static function loadValidatorMetadata(ClassMetadata $metadata)
    {
        $metadata->addPropertyConstraint('image', new Assert\File([
            'maxSize' => '1024k',
            'mimeTypes' => [
                'image/jpeg',
                'image/gif',
                'image/png'
            ],
            'mimeTypesMessage' => 'Please upload a valid image: jpg, gif, or png.',
        ]));
    }

    /**
     * Set issueReport.
     *
     * @param \App\Entity\IssueReport $issueReport
     *
     * @return Interaction
     */
    public function setIssueReport(\App\Entity\IssueReport $issueReport)
    {
        $this->issueReport = $issueReport;

        return $this;
    }

    /**
     * Get issueReport.
     *
     * @return \App\Entity\IssueReport
     */
    public function getIssueReport()
    {
        return $this->issueReport;
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
     * Set last updated datetime.
     *
     * @return \App\Entity\User
     */
    public function setUpdated(\DateTime $updatedAt)
    {
        $this->updated = $updatedAt;
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
