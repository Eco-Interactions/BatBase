<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version201610132028430Drop extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('SET FOREIGN_KEY_CHECKS=0;');

        $this->addSql('DROP TABLE attribution');
        $this->addSql('ALTER TABLE author DROP link_display, DROP link_url');

        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7500A8AB7');
        $this->addSql('DROP INDEX IDX_378DFDA7500A8AB7 ON interaction');
        $this->addSql('ALTER TABLE interaction DROP citation_id');
        
        $this->addSql('ALTER TABLE citation DROP FOREIGN KEY FK_FABD9C7E38B217A7');
        $this->addSql('DROP INDEX IDX_FABD9C7E38B217A7 ON citation');
        $this->addSql('ALTER TABLE citation ADD publication_volume VARCHAR(255) DEFAULT NULL, DROP publication_id, DROP is_secondary, DROP description, DROP publisher, DROP year');
        
        $this->addSql('ALTER TABLE publication DROP doi, DROP link_display, DROP link_url, DROP publisher;');
        $this->addSql('ALTER TABLE publication CHANGE description description VARCHAR(255) DEFAULT NULL');

        $this->addSql('ALTER TABLE location CHANGE description display_name VARCHAR(255) NOT NULL');

        $this->addSql('ALTER TABLE source DROP slug');

        $this->addSql('SET FOREIGN_KEY_CHECKS=1;');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE attribution (id INT AUTO_INCREMENT NOT NULL, updated_by INT DEFAULT NULL, citation_id INT DEFAULT NULL, created_by INT DEFAULT NULL, author_id INT DEFAULT NULL, cited_as VARCHAR(255) DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, INDEX IDX_C751ED49DE12AB56 (created_by), INDEX IDX_C751ED4916FE72E1 (updated_by), INDEX IDX_C751ED49500A8AB7 (citation_id), INDEX IDX_C751ED49F675F31B (author_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE attribution ADD CONSTRAINT FK_C751ED4916FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE attribution ADD CONSTRAINT FK_C751ED49500A8AB7 FOREIGN KEY (citation_id) REFERENCES citation (id)');
        $this->addSql('ALTER TABLE attribution ADD CONSTRAINT FK_C751ED49DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE attribution ADD CONSTRAINT FK_C751ED49F675F31B FOREIGN KEY (author_id) REFERENCES author (id)');
        $this->addSql('ALTER TABLE author ADD link_display VARCHAR(255) DEFAULT NULL, ADD link_url VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE citation ADD publication_id INT DEFAULT NULL, ADD description VARCHAR(255) DEFAULT NULL, ADD year VARCHAR(255) DEFAULT NULL, CHANGE display_name display_name VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE citation ADD CONSTRAINT FK_FABD9C7E38B217A7 FOREIGN KEY (publication_id) REFERENCES publication (id)');
        $this->addSql('CREATE INDEX IDX_FABD9C7E38B217A7 ON citation (publication_id)');
        $this->addSql('ALTER TABLE interaction ADD citation_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7500A8AB7 FOREIGN KEY (citation_id) REFERENCES citation (id)');
        $this->addSql('CREATE INDEX IDX_378DFDA7500A8AB7 ON interaction (citation_id)');
        $this->addSql('ALTER TABLE publication ADD doi VARCHAR(255) DEFAULT NULL, ADD link_display VARCHAR(255) DEFAULT NULL, ADD link_url VARCHAR(255) DEFAULT NULL, ADD publisher VARCHAR(255) DEFAULT NULL');
    }
}
