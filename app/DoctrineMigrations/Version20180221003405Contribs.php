<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Adds 'isEditor' flag and 'ord' property to contribution entities.
 */
class Version20180221003405Contribs extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE contribution ADD is_editor TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE contribution MODIFY COLUMN is_editor TINYINT(1) DEFAULT NULL AFTER auth_src_id;');
        $this->addSql('ALTER TABLE contribution ADD ord INT NOT NULL');
        $this->addSql('ALTER TABLE contribution MODIFY COLUMN ord INT NOT NULL AFTER is_editor;');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE contribution DROP is_editor');
        $this->addSql('ALTER TABLE contribution DROP ord');
    }
}
