<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * 01152016: Changed 'tag' to 'displayName' for Tag entity. Changed the 'owner' of
 * the source_tag relationship to Source.
 */
class Version20170115151240Tag extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema):void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP INDEX UNIQ_389B783389B783 ON tag');
        $this->addSql('ALTER TABLE tag CHANGE tag display_name VARCHAR(255) NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_389B783D5499347 ON tag (display_name)');

        $this->addSql('ALTER TABLE source_tag DROP PRIMARY KEY');
        $this->addSql('ALTER TABLE source_tag ADD PRIMARY KEY (source_id, tag_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema):void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP INDEX UNIQ_389B783D5499347 ON tag');
        $this->addSql('ALTER TABLE tag CHANGE display_name tag VARCHAR(255) NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_389B783389B783 ON tag (tag)');
 
        $this->addSql('ALTER TABLE source_tag DROP PRIMARY KEY');
        $this->addSql('ALTER TABLE source_tag ADD PRIMARY KEY (tag_id, source_id)');
    }
}
