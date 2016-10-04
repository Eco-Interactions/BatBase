<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Adds Source, SourceType, and Contributor entities with all related fields added and/or modified. 
 */
class Version201610042217150SrcStructure extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE contributor (id INT AUTO_INCREMENT NOT NULL, citation_id INT DEFAULT NULL, author_id INT DEFAULT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, cited_as VARCHAR(255) DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, INDEX IDX_DA6F9793500A8AB7 (citation_id), INDEX IDX_DA6F9793F675F31B (author_id), INDEX IDX_DA6F9793DE12AB56 (created_by), INDEX IDX_DA6F979316FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE source (id INT AUTO_INCREMENT NOT NULL, parent_src_id INT DEFAULT NULL, source_type_id INT DEFAULT NULL, author_id INT DEFAULT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, slug VARCHAR(128) DEFAULT NULL, display_name VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, year VARCHAR(255) DEFAULT NULL, doi VARCHAR(255) DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, deletedAt DATETIME DEFAULT NULL, pub_id INT DEFAULT NULL, UNIQUE INDEX UNIQ_5F8A7F73989D9B62 (slug), UNIQUE INDEX UNIQ_5F8A7F73D5499347 (display_name), INDEX IDX_5F8A7F7340E6EA6A (parent_src_id), INDEX IDX_5F8A7F738C9334FB (source_type_id), UNIQUE INDEX UNIQ_5F8A7F7383FDE077 (pub_id), UNIQUE INDEX UNIQ_5F8A7F73F675F31B (author_id), INDEX IDX_5F8A7F73DE12AB56 (created_by), INDEX IDX_5F8A7F7316FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE source_type (id INT AUTO_INCREMENT NOT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, slug VARCHAR(128) DEFAULT NULL, name VARCHAR(255) NOT NULL, ordinal INT DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, UNIQUE INDEX UNIQ_8D54D22A989D9B62 (slug), INDEX IDX_8D54D22ADE12AB56 (created_by), INDEX IDX_8D54D22A16FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE source_tag (tag_id INT NOT NULL, source_id INT NOT NULL, INDEX IDX_527DB2C2BAD26311 (tag_id), INDEX IDX_527DB2C2953C1C61 (source_id), PRIMARY KEY(tag_id, source_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        
        $this->addSql('RENAME TABLE type_tag_contraints TO int_type_tag_contraints');

        $this->addSql('ALTER TABLE contributor ADD CONSTRAINT FK_DA6F9793500A8AB7 FOREIGN KEY (citation_id) REFERENCES source (id)');
        $this->addSql('ALTER TABLE contributor ADD CONSTRAINT FK_DA6F9793F675F31B FOREIGN KEY (author_id) REFERENCES source (id)');
        $this->addSql('ALTER TABLE contributor ADD CONSTRAINT FK_DA6F9793DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE contributor ADD CONSTRAINT FK_DA6F979316FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');

        $this->addSql('ALTER TABLE source ADD CONSTRAINT FK_5F8A7F7340E6EA6A FOREIGN KEY (parent_src_id) REFERENCES source (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE source ADD CONSTRAINT FK_5F8A7F738C9334FB FOREIGN KEY (source_type_id) REFERENCES source_type (id)');
        $this->addSql('ALTER TABLE source ADD CONSTRAINT FK_5F8A7F73F675F31B FOREIGN KEY (author_id) REFERENCES author (id)');
        $this->addSql('ALTER TABLE source ADD CONSTRAINT FK_5F8A7F73DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE source ADD CONSTRAINT FK_5F8A7F7316FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');

        $this->addSql('ALTER TABLE source_type ADD CONSTRAINT FK_8D54D22ADE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE source_type ADD CONSTRAINT FK_8D54D22A16FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');

        $this->addSql('ALTER TABLE source_tag ADD CONSTRAINT FK_527DB2C2BAD26311 FOREIGN KEY (tag_id) REFERENCES tag (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE source_tag ADD CONSTRAINT FK_527DB2C2953C1C61 FOREIGN KEY (source_id) REFERENCES source (id) ON DELETE CASCADE');

        $this->addSql('ALTER TABLE author ADD source_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE author ADD CONSTRAINT FK_BDAFD8C8953C1C61 FOREIGN KEY (source_id) REFERENCES source (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_BDAFD8C8953C1C61 ON author (source_id)');

        $this->addSql('ALTER TABLE citation ADD source_id INT DEFAULT NULL, ADD display_name VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE citation ADD CONSTRAINT FK_FABD9C7E953C1C61 FOREIGN KEY (source_id) REFERENCES source (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_FABD9C7ED5499347 ON citation (display_name)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_FABD9C7E953C1C61 ON citation (source_id)');

        $this->addSql('ALTER TABLE interaction ADD source_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7953C1C61 FOREIGN KEY (source_id) REFERENCES source (id)');
        $this->addSql('CREATE INDEX IDX_378DFDA7953C1C61 ON interaction (source_id)');
        
        $this->addSql('ALTER TABLE location_type ADD ordinal INT DEFAULT NULL');
   
        $this->addSql('ALTER TABLE publication ADD source_id INT DEFAULT NULL, ADD displayName VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE publication ADD CONSTRAINT FK_AF3C6779953C1C61 FOREIGN KEY (source_id) REFERENCES source (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_AF3C6779953C1C61 ON publication (source_id)');
           
        $this->addSql('ALTER TABLE tag ADD description LONGTEXT NOT NULL, CHANGE tag tag VARCHAR(255) NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_389B783389B783 ON tag (tag)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE author DROP FOREIGN KEY FK_BDAFD8C8953C1C61');
        $this->addSql('ALTER TABLE citation DROP FOREIGN KEY FK_FABD9C7E953C1C61');
        $this->addSql('ALTER TABLE contributor DROP FOREIGN KEY FK_DA6F9793500A8AB7');
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7953C1C61');
        $this->addSql('ALTER TABLE publication DROP FOREIGN KEY FK_AF3C6779953C1C61');
        $this->addSql('ALTER TABLE source DROP FOREIGN KEY FK_5F8A7F7340E6EA6A');
        $this->addSql('ALTER TABLE source_tag DROP FOREIGN KEY FK_527DB2C2953C1C61');
        $this->addSql('ALTER TABLE source DROP FOREIGN KEY FK_5F8A7F738C9334FB');
        $this->addSql('CREATE TABLE type_tag_contraints (tag_id INT NOT NULL, interactiontype_id INT NOT NULL, INDEX IDX_109E44E4BAD26311 (tag_id), INDEX IDX_109E44E4CAC6DF8F (interactiontype_id), PRIMARY KEY(tag_id, interactiontype_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE type_tag_contraints ADD CONSTRAINT FK_109E44E4BAD26311 FOREIGN KEY (tag_id) REFERENCES tag (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE type_tag_contraints ADD CONSTRAINT FK_109E44E4CAC6DF8F FOREIGN KEY (interactiontype_id) REFERENCES interaction_type (id) ON DELETE CASCADE');
        $this->addSql('DROP TABLE contributor');
        $this->addSql('DROP TABLE source');
        $this->addSql('DROP TABLE source_type');
        $this->addSql('DROP TABLE source_tag');
        $this->addSql('DROP INDEX UNIQ_BDAFD8C8953C1C61 ON author');
        $this->addSql('ALTER TABLE author DROP source_id');
        $this->addSql('DROP INDEX UNIQ_FABD9C7ED5499347 ON citation');
        $this->addSql('DROP INDEX UNIQ_FABD9C7E953C1C61 ON citation');
        $this->addSql('ALTER TABLE citation DROP source_id, DROP display_name');
        $this->addSql('DROP INDEX IDX_378DFDA7953C1C61 ON interaction');
        $this->addSql('ALTER TABLE interaction DROP source_id');
        $this->addSql('ALTER TABLE location_type DROP ordinal');
        $this->addSql('DROP INDEX UNIQ_AF3C6779953C1C61 ON publication');
        $this->addSql('ALTER TABLE publication ADD doi VARCHAR(255) DEFAULT NULL, DROP source_id, DROP displayName, DROP pub_issue, DROP pub_pages, DROP pub_volume');
        $this->addSql('DROP INDEX UNIQ_389B783389B783 ON tag');
        $this->addSql('ALTER TABLE tag DROP description, CHANGE tag tag LONGTEXT NOT NULL');
    }
}
