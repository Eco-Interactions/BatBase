<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160119023603 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE attribution DROP archive');
        $this->addSql('ALTER TABLE author DROP archive');
        $this->addSql('ALTER TABLE authority DROP archive');
        $this->addSql('ALTER TABLE citation DROP archive');
        $this->addSql('ALTER TABLE domain DROP archive');
        $this->addSql('ALTER TABLE habitat_type DROP archive');
        $this->addSql('ALTER TABLE interaction DROP archive');
        $this->addSql('ALTER TABLE interaction_type DROP archive');
        $this->addSql('ALTER TABLE level DROP archive');
        $this->addSql('ALTER TABLE location DROP archive');
        $this->addSql('ALTER TABLE naming DROP archive');
        $this->addSql('ALTER TABLE naming_type DROP archive');
        $this->addSql('ALTER TABLE publication DROP archive');
        $this->addSql('ALTER TABLE taxon DROP archive');
        $this->addSql('ALTER TABLE taxonym DROP archive');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE attribution ADD archive TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE author ADD archive TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE authority ADD archive TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE citation ADD archive TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE domain ADD archive TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE habitat_type ADD archive TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE interaction ADD archive TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE interaction_type ADD archive TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE level ADD archive TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE location ADD archive TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE naming ADD archive TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE naming_type ADD archive TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE publication ADD archive TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE taxon ADD archive TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE taxonym ADD archive TINYINT(1) DEFAULT NULL');
    }
}
