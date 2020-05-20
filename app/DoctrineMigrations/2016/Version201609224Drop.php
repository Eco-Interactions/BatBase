<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Drops Country, Region and Region_Location tables.
 */
class Version201609224Drop extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE location DROP FOREIGN KEY FK_5E9E89CBF92F3E70');
        $this->addSql('ALTER TABLE location DROP FOREIGN KEY FK_5E9E89CB2A160917');
        $this->addSql('DROP INDEX IDX_5E9E89CBF92F3E70 ON location');
        $this->addSql('ALTER TABLE location DROP country_id');
        $this->addSql('ALTER TABLE location ADD CONSTRAINT FK_5E9E89CB2A160917 FOREIGN KEY (parent_loc_id) REFERENCES location (id) ON DELETE SET NULL');
        $this->addSql('DROP TABLE country');
        $this->addSql('DROP TABLE regions_locations');
        $this->addSql('DROP TABLE region');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');      
    }
}
