<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20191206RealmSql extends AbstractMigration
{
    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE taxon ADD is_realm TINYINT(1) NOT NULL, CHANGE level_id level_id INT NOT NULL');
        $this->addSql('ALTER TABLE realm ADD ui_levels VARCHAR(255) NOT NULL');

        $this->addSql('ALTER TABLE taxon MODIFY is_realm TINYINT(1) DEFAULT NULL AFTER default_guid;');
        $this->addSql('ALTER TABLE realm MODIFY ui_levels VARCHAR(255) NOT NULL AFTER plural_name;');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE realm DROP ui_levels');
        $this->addSql('ALTER TABLE taxon DROP is_realm');
    }
}
