<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200630IssueReport extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE issue_report (id INT AUTO_INCREMENT NOT NULL, desctiption LONGTEXT NOT NULL, steps_to_reproduce LONGTEXT NOT NULL, misc_info LONGTEXT DEFAULT NULL, created DATETIME NOT NULL, created_by INT DEFAULT NULL, updated DATETIME NOT NULL, updated_by INT DEFAULT NULL, INDEX IDX_36DFFDA3DE12AB56 (created_by), INDEX IDX_36DFFDA316FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE issue_report ADD CONSTRAINT FK_36DFFDA3DE12AB56 FOREIGN KEY (created_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE issue_report ADD CONSTRAINT FK_36DFFDA316FE72E1 FOREIGN KEY (updated_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE file_upload DROP status');
        $this->addSql('ALTER TABLE image_upload DROP FOREIGN KEY FK_B8A0B8D7DE13F470');
        $this->addSql('DROP INDEX IDX_B8A0B8D7DE13F470 ON image_upload');
        $this->addSql('ALTER TABLE image_upload ADD desctiption LONGTEXT DEFAULT NULL, DROP status, DROP deletedAt, CHANGE taxon_id report_id INT DEFAULT NULL, CHANGE caption title VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE image_upload ADD CONSTRAINT FK_B8A0B8D74BD2A4C0 FOREIGN KEY (report_id) REFERENCES issue_report (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_B8A0B8D72B36786B ON image_upload (title)');
        $this->addSql('CREATE INDEX IDX_B8A0B8D74BD2A4C0 ON image_upload (report_id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE image_upload DROP FOREIGN KEY FK_B8A0B8D74BD2A4C0');
        $this->addSql('DROP TABLE issue_report');
        $this->addSql('ALTER TABLE file_upload ADD status INT NOT NULL');
        $this->addSql('DROP INDEX UNIQ_B8A0B8D72B36786B ON image_upload');
        $this->addSql('DROP INDEX IDX_B8A0B8D74BD2A4C0 ON image_upload');
        $this->addSql('ALTER TABLE image_upload ADD status INT NOT NULL, ADD deletedAt DATETIME DEFAULT NULL, DROP desctiption, CHANGE report_id taxon_id INT DEFAULT NULL, CHANGE title caption VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`');
        $this->addSql('ALTER TABLE image_upload ADD CONSTRAINT FK_B8A0B8D7DE13F470 FOREIGN KEY (taxon_id) REFERENCES taxon (id)');
        $this->addSql('CREATE INDEX IDX_B8A0B8D7DE13F470 ON image_upload (taxon_id)');
    }
}
