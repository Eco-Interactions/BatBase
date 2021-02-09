<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202011131SubRanksSql extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE group_root ADD sub_ranks VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE group_root MODIFY COLUMN sub_ranks VARCHAR(255) NOT NULL AFTER taxon_id;');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE group_root DROP sub_ranks');
    }
}
