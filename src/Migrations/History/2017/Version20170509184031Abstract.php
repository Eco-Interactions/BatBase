<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Adds an abstract field to Citation. Swaps the primary keys in the interaction_tags table.
 */
class Version20170509184031Abstract extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema):void
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE citation ADD abstract LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE interaction_tag DROP PRIMARY KEY');
        $this->addSql('ALTER TABLE interaction_tag ADD PRIMARY KEY (interaction_id, tag_id)');

        $this->addSql('ALTER TABLE citation MODIFY COLUMN abstract LONGTEXT DEFAULT NULL AFTER full_text;');

    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema):void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE citation DROP abstract');
        $this->addSql('ALTER TABLE interaction_tag DROP PRIMARY KEY');
        $this->addSql('ALTER TABLE interaction_tag ADD PRIMARY KEY (tag_id, interaction_id)');
    }
}
