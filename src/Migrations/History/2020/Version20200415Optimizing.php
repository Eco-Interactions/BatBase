<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200415Optimizing extends AbstractMigration
{
    public function up(Schema $schema):void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE location ADD geo_json INT DEFAULT NULL');
        $this->addSql('ALTER TABLE location MODIFY COLUMN geo_json INT DEFAULT NULL AFTER habitat_type_id;');
        $this->addSql('ALTER TABLE location ADD CONSTRAINT FK_5E9E89CB6F200A45 FOREIGN KEY (geo_json) REFERENCES geo_json (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_5E9E89CB6F200A45 ON location (geo_json)');
    }

    public function down(Schema $schema):void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
