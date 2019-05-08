<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190503190909UserNamed extends AbstractMigration
{
    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE user_named (id INT AUTO_INCREMENT NOT NULL, type VARCHAR(255) NOT NULL, display_name VARCHAR(255) NOT NULL, description LONGTEXT NOT NULL, details LONGTEXT NOT NULL, loaded DATETIME NOT NULL, created DATETIME NOT NULL, created_by INT DEFAULT NULL, updated DATETIME NOT NULL, updated_by INT DEFAULT NULL, deletedAt DATETIME DEFAULT NULL, INDEX IDX_932237DFDE12AB56 (created_by), INDEX IDX_932237DF16FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE UTF8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE user_named ADD CONSTRAINT FK_932237DFDE12AB56 FOREIGN KEY (created_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE user_named ADD CONSTRAINT FK_932237DF16FE72E1 FOREIGN KEY (updated_by) REFERENCES `user` (id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE user_named');
    }
}