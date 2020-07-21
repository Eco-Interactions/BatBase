<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Fixes Taxon and Realm field defaults.
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200106Sql extends AbstractMigration
{
    public function up(Schema $schema):void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE tag CHANGE description description LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE taxon CHANGE is_realm is_realm TINYINT(1) NOT NULL');
    }

    public function down(Schema $schema):void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE tag CHANGE description description LONGTEXT NOT NULL COLLATE utf8_unicode_ci');
        $this->addSql('ALTER TABLE taxon CHANGE is_realm is_realm TINYINT(1) DEFAULT NULL');
    }
}
