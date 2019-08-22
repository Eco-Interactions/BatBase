<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190819180803FileUpload extends AbstractMigration
{
    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE file_upload (id INT AUTO_INCREMENT NOT NULL, filename VARCHAR(255) NOT NULL, desctiption VARCHAR(255) NOT NULL, path VARCHAR(255) NOT NULL, mime_type VARCHAR(255) NOT NULL, status INT NOT NULL, size NUMERIC(10, 0) NOT NULL, created_by INT DEFAULT NULL, created DATETIME NOT NULL, updated_by INT DEFAULT NULL, updated DATETIME NOT NULL, deletedAt DATETIME DEFAULT NULL, INDEX IDX_AFAAC0A0DE12AB56 (created_by), INDEX IDX_AFAAC0A016FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE UTF8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE file_upload ADD CONSTRAINT FK_AFAAC0A0DE12AB56 FOREIGN KEY (created_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE file_upload ADD CONSTRAINT FK_AFAAC0A016FE72E1 FOREIGN KEY (updated_by) REFERENCES `user` (id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE file_upload');
    }
}
