<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Not a functional migration. Documents migrations made in 2019.
 */
class Version2019Migrations extends AbstractMigration
{
    /**
     * 20190214182051IntTypes - Adds the "roost" and "host" interaction types.
     * 20190503190909UserNamed - Adds User Named table. Fixes the center point for Russia.
     * 20190612193647TaxaDataCleanup - Cleans up duplicate taxa created unintentionally.
     * 20190714164720AddExmplData - Adds exmaple interaction lists and filter sets to all existing users.
     * 20190819180803FileUpload - File Upload sql.
     * 20191206RealmSql
     * 20191207NewRealmData - Creates new realms
     * 
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // See full migrations in 2019 directory
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
