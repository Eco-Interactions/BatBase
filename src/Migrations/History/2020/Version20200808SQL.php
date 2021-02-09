<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Adds active and passive verb-form variables to the Interaction Type entity.
 */
final class Version20200808SQL extends AbstractMigration
{
    public function getDescription() : string
    {
        return 'Adds active and passive verb-form variables to the Interaction Type entity.';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE interaction_type ADD active_form VARCHAR(255) NOT NULL AFTER display_name, ADD passive_form VARCHAR(255) NOT NULL AFTER active_form');
        $this->addSql('ALTER TABLE interaction_type MODIFY COLUMN is_symmetric TINYINT(1) DEFAULT NULL AFTER passive_form');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
