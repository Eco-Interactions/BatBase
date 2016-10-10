<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Update the database into the new Source heirarchical-structure.
 */
class Version201610101857190SrcStructure extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE contribution (id INT AUTO_INCREMENT NOT NULL, work_src_id INT DEFAULT NULL, auth_src_id INT DEFAULT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, cited_as VARCHAR(255) DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, INDEX IDX_EA351E15A40CEF8E (work_src_id), INDEX IDX_EA351E15F675F31B (auth_src_id), INDEX IDX_EA351E15DE12AB56 (created_by), INDEX IDX_EA351E1516FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE publication_type (id INT AUTO_INCREMENT NOT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, slug VARCHAR(128) DEFAULT NULL, display_name VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, UNIQUE INDEX UNIQ_8726D6E4989D9B62 (slug), UNIQUE INDEX UNIQ_8726D6E4D5499347 (display_name), INDEX IDX_8726D6E4DE12AB56 (created_by), INDEX IDX_8726D6E416FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE source (id INT AUTO_INCREMENT NOT NULL, parent_src_id INT DEFAULT NULL, source_type_id INT DEFAULT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, slug VARCHAR(128) DEFAULT NULL, display_name VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, year VARCHAR(255) DEFAULT NULL, doi VARCHAR(255) DEFAULT NULL, link_display VARCHAR(255) DEFAULT NULL, link_url VARCHAR(255) DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, deletedAt DATETIME DEFAULT NULL, UNIQUE INDEX UNIQ_5F8A7F73989D9B62 (slug), UNIQUE INDEX UNIQ_5F8A7F73D5499347 (display_name), INDEX IDX_5F8A7F7340E6EA6A (parent_src_id), INDEX IDX_5F8A7F738C9334FB (source_type_id), INDEX IDX_5F8A7F73DE12AB56 (created_by), INDEX IDX_5F8A7F7316FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE source_type (id INT AUTO_INCREMENT NOT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, slug VARCHAR(128) DEFAULT NULL, display_name VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, ordinal INT DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, UNIQUE INDEX UNIQ_8D54D22A989D9B62 (slug), INDEX IDX_8D54D22ADE12AB56 (created_by), INDEX IDX_8D54D22A16FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE source_tag (tag_id INT NOT NULL, source_id INT NOT NULL, INDEX IDX_527DB2C2BAD26311 (tag_id), INDEX IDX_527DB2C2953C1C61 (source_id), PRIMARY KEY(tag_id, source_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        
        $this->addSql('RENAME TABLE type_tag_contraints TO int_type_tag_contraints');
        
        $this->addSql('ALTER TABLE contribution ADD CONSTRAINT FK_EA351E15500A8AB7 FOREIGN KEY (work_src_id) REFERENCES source (id)');
        $this->addSql('ALTER TABLE contribution ADD CONSTRAINT FK_EA351E15F675F31B FOREIGN KEY (auth_src_id) REFERENCES source (id)');
        $this->addSql('ALTER TABLE contribution ADD CONSTRAINT FK_EA351E15DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE contribution ADD CONSTRAINT FK_EA351E1516FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        
        $this->addSql('ALTER TABLE publication_type ADD CONSTRAINT FK_8726D6E4DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE publication_type ADD CONSTRAINT FK_8726D6E416FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        
        $this->addSql('ALTER TABLE source ADD CONSTRAINT FK_5F8A7F7340E6EA6A FOREIGN KEY (parent_src_id) REFERENCES source (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE source ADD CONSTRAINT FK_5F8A7F738C9334FB FOREIGN KEY (source_type_id) REFERENCES source_type (id)');
        $this->addSql('ALTER TABLE source ADD CONSTRAINT FK_5F8A7F73DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE source ADD CONSTRAINT FK_5F8A7F7316FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        
        $this->addSql('ALTER TABLE source_type ADD CONSTRAINT FK_8D54D22ADE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE source_type ADD CONSTRAINT FK_8D54D22A16FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        
        $this->addSql('ALTER TABLE source_tag ADD CONSTRAINT FK_527DB2C2BAD26311 FOREIGN KEY (tag_id) REFERENCES tag (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE source_tag ADD CONSTRAINT FK_527DB2C2953C1C61 FOREIGN KEY (source_id) REFERENCES source (id) ON DELETE CASCADE');
        
        $this->addSql('ALTER TABLE author ADD source_id INT DEFAULT NULL, CHANGE short_name display_name VARCHAR(255) NOT NULL');
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
        
        $this->addSql('ALTER TABLE publication ADD pub_type_id INT DEFAULT NULL, ADD source_id INT DEFAULT NULL, ADD description VARCHAR(255) DEFAULT NULL, DROP publication_type, CHANGE name display_name VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE publication ADD CONSTRAINT FK_AF3C67792376B666 FOREIGN KEY (pub_type_id) REFERENCES publication_type (id)');
        $this->addSql('ALTER TABLE publication ADD CONSTRAINT FK_AF3C6779953C1C61 FOREIGN KEY (source_id) REFERENCES source (id)');
        $this->addSql('CREATE INDEX IDX_AF3C67792376B666 ON publication (pub_type_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_AF3C6779953C1C61 ON publication (source_id)');
        
        $this->addSql('ALTER TABLE tag ADD description LONGTEXT NOT NULL, CHANGE tag tag VARCHAR(255) NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_389B783389B783 ON tag (tag)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {

    }
}
