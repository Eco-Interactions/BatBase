<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200522NotNullMetadata extends AbstractMigration
{
    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE publication CHANGE source_id source_id INT NOT NULL, CHANGE type_id type_id INT NOT NULL');
        $this->addSql('ALTER TABLE location CHANGE type_id type_id INT NOT NULL');
        $this->addSql('ALTER TABLE contribution CHANGE work_src_id work_src_id INT NOT NULL, CHANGE auth_src_id auth_src_id INT NOT NULL');
        $this->addSql('ALTER TABLE source CHANGE type_id type_id INT NOT NULL');
        $this->addSql('ALTER TABLE publisher CHANGE source_id source_id INT NOT NULL');
        $this->addSql('ALTER TABLE citation CHANGE source_id source_id INT NOT NULL, CHANGE type_id type_id INT NOT NULL, CHANGE display_name display_name VARCHAR(255) NOT NULL, CHANGE title title VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE interaction CHANGE source_id source_id INT NOT NULL, CHANGE type_id type_id INT NOT NULL, CHANGE location_id location_id INT NOT NULL, CHANGE subject_taxon_id subject_taxon_id INT NOT NULL, CHANGE object_taxon_id object_taxon_id INT NOT NULL');
        $this->addSql('ALTER TABLE author CHANGE source_id source_id INT NOT NULL');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE author CHANGE source_id source_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE citation CHANGE type_id type_id INT DEFAULT NULL, CHANGE source_id source_id INT DEFAULT NULL, CHANGE display_name display_name VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, CHANGE title title VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`');
        $this->addSql('ALTER TABLE contribution CHANGE work_src_id work_src_id INT DEFAULT NULL, CHANGE auth_src_id auth_src_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE interaction CHANGE source_id source_id INT DEFAULT NULL, CHANGE type_id type_id INT DEFAULT NULL, CHANGE location_id location_id INT DEFAULT NULL, CHANGE subject_taxon_id subject_taxon_id INT DEFAULT NULL, CHANGE object_taxon_id object_taxon_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE location CHANGE type_id type_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE publication CHANGE type_id type_id INT DEFAULT NULL, CHANGE source_id source_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE publisher CHANGE source_id source_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE source CHANGE type_id type_id INT DEFAULT NULL');
    }
}
