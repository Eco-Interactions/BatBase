<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Adds the Publisher table. Standardizes the names of entity type columns. 
 */
class Version20180105200017PublSql extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema):void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE publisher_type (id INT AUTO_INCREMENT NOT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, slug VARCHAR(128) DEFAULT NULL, display_name VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, UNIQUE INDEX UNIQ_6DC7877E989D9B62 (slug), UNIQUE INDEX UNIQ_6DC7877ED5499347 (display_name), INDEX IDX_6DC7877EDE12AB56 (created_by), INDEX IDX_6DC7877E16FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE publisher (id INT AUTO_INCREMENT NOT NULL, type_id INT DEFAULT NULL, source_id INT DEFAULT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, slug VARCHAR(128) DEFAULT NULL, display_name VARCHAR(255) NOT NULL, city VARCHAR(255) DEFAULT NULL, country VARCHAR(255) DEFAULT NULL, description VARCHAR(255) DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, deletedAt DATETIME DEFAULT NULL, UNIQUE INDEX UNIQ_9CE8D546989D9B62 (slug), UNIQUE INDEX UNIQ_9CE8D546D5499347 (display_name), INDEX IDX_9CE8D546C54C8C93 (type_id), UNIQUE INDEX UNIQ_9CE8D546953C1C61 (source_id), INDEX IDX_9CE8D546DE12AB56 (created_by), INDEX IDX_9CE8D54616FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE publisher_type ADD CONSTRAINT FK_6DC7877EDE12AB56 FOREIGN KEY (created_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE publisher_type ADD CONSTRAINT FK_6DC7877E16FE72E1 FOREIGN KEY (updated_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE publisher ADD CONSTRAINT FK_9CE8D546C54C8C93 FOREIGN KEY (type_id) REFERENCES publisher_type (id)');
        $this->addSql('ALTER TABLE publisher ADD CONSTRAINT FK_9CE8D546953C1C61 FOREIGN KEY (source_id) REFERENCES source (id)');
        $this->addSql('ALTER TABLE publisher ADD CONSTRAINT FK_9CE8D546DE12AB56 FOREIGN KEY (created_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE publisher ADD CONSTRAINT FK_9CE8D54616FE72E1 FOREIGN KEY (updated_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE publisher MODIFY COLUMN source_id INT DEFAULT NULL AFTER id;');
        $this->addSql('ALTER TABLE publisher MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE publisher MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;');
        $this->addSql('ALTER TABLE source DROP city, DROP country');
        
        $this->addSql('ALTER TABLE citation DROP FOREIGN KEY FK_FABD9C7EC54C8C93');
        $this->addSql('DROP INDEX IDX_FABD9C7EF62A4E31 ON citation');
        $this->addSql('ALTER TABLE citation CHANGE cit_type_id type_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE citation ADD CONSTRAINT FK_FABD9C7EC54C8C93 FOREIGN KEY (type_id) REFERENCES citation_type (id)');
        $this->addSql('CREATE INDEX IDX_FABD9C7EC54C8C93 ON citation (type_id)');
        $this->addSql('ALTER TABLE publication DROP FOREIGN KEY FK_AF3C67792376B666');
        $this->addSql('DROP INDEX IDX_AF3C67792376B666 ON publication');
        $this->addSql('ALTER TABLE publication CHANGE pub_type_id type_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE publication ADD CONSTRAINT FK_AF3C6779C54C8C93 FOREIGN KEY (type_id) REFERENCES publication_type (id)');
        $this->addSql('CREATE INDEX IDX_AF3C6779C54C8C93 ON publication (type_id)');
        $this->addSql('ALTER TABLE location DROP FOREIGN KEY FK_5E9E89CB2B099F37');
        $this->addSql('DROP INDEX IDX_5E9E89CB2B099F37 ON location');
        $this->addSql('ALTER TABLE location CHANGE location_type_id type_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE location ADD CONSTRAINT FK_5E9E89CBC54C8C93 FOREIGN KEY (type_id) REFERENCES location_type (id)');
        $this->addSql('CREATE INDEX IDX_5E9E89CBC54C8C93 ON location (type_id)');
        $this->addSql('ALTER TABLE source DROP FOREIGN KEY FK_5F8A7F738C9334FB');
        $this->addSql('DROP INDEX IDX_5F8A7F738C9334FB ON source');
        $this->addSql('ALTER TABLE source CHANGE source_type_id type_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE source ADD CONSTRAINT FK_5F8A7F73C54C8C93 FOREIGN KEY (type_id) REFERENCES source_type (id)');
        $this->addSql('CREATE INDEX IDX_5F8A7F73C54C8C93 ON source (type_id)');
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7A50ABBF2');
        $this->addSql('DROP INDEX IDX_378DFDA7A50ABBF2 ON interaction');
        $this->addSql('ALTER TABLE interaction CHANGE interaction_type_id type_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7C54C8C93 FOREIGN KEY (type_id) REFERENCES interaction_type (id)');
        $this->addSql('CREATE INDEX IDX_378DFDA7C54C8C93 ON interaction (type_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema):void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE publisher DROP FOREIGN KEY FK_9CE8D546C54C8C93');
        $this->addSql('DROP TABLE publisher_type');
        $this->addSql('DROP TABLE publisher');
        $this->addSql('ALTER TABLE publication DROP FOREIGN KEY FK_AF3C6779C54C8C93');
        $this->addSql('DROP INDEX IDX_AF3C6779C54C8C93 ON publication');
        $this->addSql('ALTER TABLE publication CHANGE type_id pub_type_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE publication ADD CONSTRAINT FK_AF3C67792376B666 FOREIGN KEY (pub_type_id) REFERENCES publication_type (id)');
        $this->addSql('CREATE INDEX IDX_AF3C67792376B666 ON publication (pub_type_id)');
        $this->addSql('ALTER TABLE source ADD city VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci, ADD country VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci');
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7C54C8C93');
        $this->addSql('DROP INDEX IDX_378DFDA7C54C8C93 ON interaction');
        $this->addSql('ALTER TABLE interaction CHANGE type_id interaction_type_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7A50ABBF2 FOREIGN KEY (interaction_type_id) REFERENCES interaction_type (id)');
        $this->addSql('CREATE INDEX IDX_378DFDA7A50ABBF2 ON interaction (interaction_type_id)');
        $this->addSql('ALTER TABLE location DROP FOREIGN KEY FK_5E9E89CBC54C8C93');
        $this->addSql('DROP INDEX IDX_5E9E89CBC54C8C93 ON location');
        $this->addSql('ALTER TABLE location CHANGE type_id location_type_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE location ADD CONSTRAINT FK_5E9E89CB2B099F37 FOREIGN KEY (location_type_id) REFERENCES location_type (id)');
        $this->addSql('CREATE INDEX IDX_5E9E89CB2B099F37 ON location (location_type_id)');
        $this->addSql('ALTER TABLE source DROP FOREIGN KEY FK_5F8A7F73C54C8C93');
        $this->addSql('DROP INDEX IDX_5F8A7F73C54C8C93 ON source');
        $this->addSql('ALTER TABLE source CHANGE type_id source_type_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE source ADD CONSTRAINT FK_5F8A7F738C9334FB FOREIGN KEY (source_type_id) REFERENCES source_type (id)');
        $this->addSql('CREATE INDEX IDX_5F8A7F738C9334FB ON source (source_type_id)');
    }
}
