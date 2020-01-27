<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Not a functional migration. Documents migrations made in 2019.
 */
class Version2020Migrations extends AbstractMigration
{
    /**
     * 20200106Sql - Fixes Taxon and Realm field defaults.
     * 20200107TypeTags - Restricts Tags to specific Interaction Types, also adds new and updates tags and types.
     * 20200114DataCleanup - See file for specifics. 
     * 
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // See full migrations in 2020 directory
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
