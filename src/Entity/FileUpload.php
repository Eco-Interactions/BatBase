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
 * PDF File Upload.
 *
 * @ORM\Entity
 * @Vich\Uploadable
 * @ORM\Table(name="file_upload")
 * @ORM\HasLifecycleCallbacks
 */
class FileUpload
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
     * @ORM\Column(name="fileName", type="string", nullable=false)
     */
    private $fileName;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", unique=true, length=255, nullable=false)
     */
    private $title;

    /**
     * @var string
     *
     * @ORM\Column(name="desctiption", type="text", nullable=false)
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
     *      size="size"
     * )
     *
     * @var File|null
     */
    private $issueImage;

    /**
     * Used as container for UploadedFile obj.
     *
     * @Vich\UploadableField(
     *      mapping="pdf_image",
     *      fileNameProperty="fileName",
     *      size="size"
     * )
     *
     * @var File|null
     */
    private $pdfFile;

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
     * Get file path.
     *
     * @return string
     */
    public function getFile()
    {
        return $this->file;
    }

    /**
     * Set temporary UploadedFile obj.
     *
     * @param Symfony\Component\HttpFoundation\File\UploadedFile $file
     *
     * @return FileUpload
     */
    public function setFile(UploadedFile $file)
    {
        $this->file = $file;

        return $this;
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
     * @return FileUpload
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
     * @return FileUpload
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
     * @return FileUpload
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
     * @return File
     */
    public function setPath($path)
    {
        $this->path = $path;

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
     * @return File
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
     * @return File
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
     * @param File|\Symfony\Component\HttpFoundation\File\UploadedFile|null $issueImage
     */
    public function setIssueImage(?File $issueImage = null): void
    {
        $this->issueImage = $issueImage;

        if (null !== $issueImage) {
            // It is required that at least one field changes if you are using doctrine
            // otherwise the event listeners won't be called and the file is lost
            $this->updatedAt = new \DateTimeImmutable();
        }
    }

    public function getIssueImage(): ?File
    {
        return $this->issueImage;
    }

    /**
     * If manually uploading a file (i.e. not using Symfony Form) ensure an instance
     * of 'UploadedFile' is injected into this setter to trigger the update.
     *
     * @param File|\Symfony\Component\HttpFoundation\File\UploadedFile|null $pdfFile
     */
    public function setPdfFile(?File $pdfFile = null): void
    {
        $this->pdfFile = $pdfFile;

        if (null !== $pdfFile) {
            // It is required that at least one field changes if you are using doctrine
            // otherwise the event listeners won't be called and the file is lost
            $this->updatedAt = new \DateTimeImmutable();
        }
    }

    public function getPdfFile(): ?File
    {
        return $this->pdfFile;
    }

    public static function loadValidatorMetadata(ClassMetadata $metadata)
    {
        $metadata->addPropertyConstraint('pdfFile', new Assert\File([
            'maxSize' => '1024k',
            'mimeTypes' => [
                'application/pdf',
                'application/x-pdf',
            ],
            'mimeTypesMessage' => 'Please upload a valid PDF',
        ]));
        $metadata->addPropertyConstraint('issueImage', new Assert\File([
            'maxSize' => '1024k',
            'mimeTypes' => [
                'image/jpeg',
                'image/gif',
                'image/png'
            ],
            'mimeTypesMessage' => 'Please upload a valid image: jpg, gif, or png.',
        ]));
    }









    // public function getAbsolutePath()
    // {
    //     return null === $this->path
    //         ? null
    //         : $this->getUploadRootDir().'/'.$this->path;
    // }

    // public function getWebPath()
    // {
    //     return null === $this->path
    //         ? null
    //         : $this->getUploadDir().'/'.$this->path;
    // }

    // public function upload()
    // {
    //     $validTypes = array('image/jpeg', 'image/png', 'image/gif', 'image/x-ms-bmp');
    //     $taxonImgsPath = $this->getUploadDir();
    //     $mimeType = $this->getFile()->getClientMimeType();

    //     if (in_array($mimeType, $validTypes)) {
    //         $this->mimeType = $mimeType;
    //         $randName = substr(sha1(rand(0, 1000)), 0, 11);
    //         $extension = '.'.$this->getFile()->guessExtension();
    //         $fileName = $randName.$extension;
    //         $this->size = $this->getFile()->getClientSize();
    //         $this->path = $taxonImgsPath.$fileName;   // set to the filename where you've saved the file
    //         $this->fileName = $fileName;
    //         $this->setStatus();

    //         $this->getFile()->move(// move takes the target directory and then the
    //             $this->getUploadDir(),                  // target filename to move to
    //             $fileName
    //         );
    //     } else {
    //         $this->file = null;
    //         return false;
    //     }
    //     return true;
    // }

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

    // protected function getUploadRootDir()
    // {
    //     // the absolute directory path where uploaded
    //     // documents should be saved
    //     return __DIR__.'/../../../web/'.$this->getUploadDir();
    // }

    // protected function getUploadDir()
    // {
    //     // get rid of the __DIR__ so it doesn't screw up
    //     // when displaying uploaded doc/image in the view.
    //     return 'uploads/files/';
    // }
}
