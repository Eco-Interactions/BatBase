<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Adds a 'Suffix' field to the Author Entity.
 */
class Version20170724212122AddSuffix extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema):void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE author ADD suffix VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE author MODIFY COLUMN suffix VARCHAR(255) DEFAULT NULL AFTER middle_name;');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema):void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE author DROP suffix');
    }
}
