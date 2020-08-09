<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200413Sql extends AbstractMigration
{
    public function up(Schema $schema):void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE realm_root (id INT AUTO_INCREMENT NOT NULL, realm_id INT NOT NULL, taxon_id INT NOT NULL, created DATETIME NOT NULL, created_by INT DEFAULT NULL, updated DATETIME NOT NULL, updated_by INT DEFAULT NULL, INDEX IDX_6E0C1D559DFF5F89 (realm_id), UNIQUE INDEX UNIQ_6E0C1D55DE13F470 (taxon_id), INDEX IDX_6E0C1D55DE12AB56 (created_by), INDEX IDX_6E0C1D5516FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE realm_root ADD CONSTRAINT FK_6E0C1D559DFF5F89 FOREIGN KEY (realm_id) REFERENCES realm (id)');
        $this->addSql('ALTER TABLE realm_root ADD CONSTRAINT FK_6E0C1D55DE13F470 FOREIGN KEY (taxon_id) REFERENCES taxon (id)');
        $this->addSql('ALTER TABLE realm_root ADD CONSTRAINT FK_6E0C1D55DE12AB56 FOREIGN KEY (created_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE realm_root ADD CONSTRAINT FK_6E0C1D5516FE72E1 FOREIGN KEY (updated_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE taxon CHANGE is_realm is_root TINYINT(1) DEFAULT NULL');
    }

    public function down(Schema $schema):void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE realm_root');
        $this->addSql('ALTER TABLE taxon CHANGE is_root is_realm TINYINT(1) NOT NULL');
    }
}
