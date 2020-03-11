<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Adds SQL for the new ManyToMany between Taxon and Realm
 */
final class Version20200310SQL extends AbstractMigration
{
    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE realm_taxon (id INT AUTO_INCREMENT NOT NULL, realm_id INT NOT NULL, taxon_id INT NOT NULL, is_root TINYINT(1) NOT NULL, created DATETIME NOT NULL, created_by INT DEFAULT NULL, updated DATETIME NOT NULL, updated_by INT DEFAULT NULL, INDEX IDX_BCA7F6489DFF5F89 (realm_id), INDEX IDX_BCA7F648DE13F470 (taxon_id), INDEX IDX_BCA7F648DE12AB56 (created_by), INDEX IDX_BCA7F64816FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE realm_taxon ADD CONSTRAINT FK_BCA7F6489DFF5F89 FOREIGN KEY (realm_id) REFERENCES realm (id)');
        $this->addSql('ALTER TABLE realm_taxon ADD CONSTRAINT FK_BCA7F648DE13F470 FOREIGN KEY (taxon_id) REFERENCES taxon (id)');
        $this->addSql('ALTER TABLE realm_taxon ADD CONSTRAINT FK_BCA7F648DE12AB56 FOREIGN KEY (created_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE realm_taxon ADD CONSTRAINT FK_BCA7F64816FE72E1 FOREIGN KEY (updated_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE taxon DROP is_realm');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE realm_taxon');
        $this->addSql('ALTER TABLE taxon ADD is_realm TINYINT(1) NOT NULL');
    }
}
