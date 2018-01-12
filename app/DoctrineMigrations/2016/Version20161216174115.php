<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Create Citation Type table and fields.
 */
class Version20161216174115 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE citation_type (id INT AUTO_INCREMENT NOT NULL, slug VARCHAR(128) DEFAULT NULL, display_name VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, created DATETIME NOT NULL, created_by INT DEFAULT NULL, updated DATETIME NOT NULL, updated_by INT DEFAULT NULL,  UNIQUE INDEX UNIQ_435A43F4989D9B62 (slug), UNIQUE INDEX UNIQ_435A43F4D5499347 (display_name), INDEX IDX_435A43F4DE12AB56 (created_by), INDEX IDX_435A43F416FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE citation_type ADD CONSTRAINT FK_435A43F4DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE citation_type ADD CONSTRAINT FK_435A43F416FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE citation ADD cit_type_id INT DEFAULT NULL AFTER source_id');
        $this->addSql('ALTER TABLE citation ADD CONSTRAINT FK_FABD9C7EC54C8C93 FOREIGN KEY (cit_type_id) REFERENCES citation_type (id)');
        $this->addSql('CREATE INDEX IDX_FABD9C7EC54C8C93 ON citation (cit_type_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE citation DROP FOREIGN KEY FK_FABD9C7EC54C8C93');
        $this->addSql('DROP TABLE citation_type');
        $this->addSql('DROP INDEX IDX_FABD9C7EC54C8C93 ON citation');
        $this->addSql('ALTER TABLE citation DROP cit_type_id');
    }
}
