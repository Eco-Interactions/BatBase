<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Adds the GeoJSON entity and arranges the table columns. 
 */
class Version20180404182316GeoJSON extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE geo_json (id INT AUTO_INCREMENT NOT NULL, loc_id INT DEFAULT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, type VARCHAR(255) NOT NULL, coordinates LONGTEXT NOT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, UNIQUE INDEX UNIQ_6F200A456505CAD1 (loc_id), INDEX IDX_6F200A45DE12AB56 (created_by), INDEX IDX_6F200A4516FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE geo_json ADD CONSTRAINT FK_6F200A456505CAD1 FOREIGN KEY (loc_id) REFERENCES location (id)');
        $this->addSql('ALTER TABLE geo_json ADD CONSTRAINT FK_6F200A45DE12AB56 FOREIGN KEY (created_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE geo_json ADD CONSTRAINT FK_6F200A4516FE72E1 FOREIGN KEY (updated_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE geo_json MODIFY COLUMN type VARCHAR(255) NOT NULL AFTER loc_id;');
        $this->addSql('ALTER TABLE geo_json MODIFY COLUMN coordinates LONGTEXT NOT NULL AFTER type;');
        $this->addSql('ALTER TABLE geo_json MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE geo_json MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');
        $this->addSql('DROP TABLE geo_json');
    }
}
