<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160614031104 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE attribution (id INT AUTO_INCREMENT NOT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, citation_id INT DEFAULT NULL, author_id INT DEFAULT NULL, cited_as VARCHAR(255) DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, INDEX IDX_C751ED49DE12AB56 (created_by), INDEX IDX_C751ED4916FE72E1 (updated_by), INDEX IDX_C751ED49500A8AB7 (citation_id), INDEX IDX_C751ED49F675F31B (author_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE author (id INT AUTO_INCREMENT NOT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, slug VARCHAR(128) DEFAULT NULL, full_name VARCHAR(255) DEFAULT NULL, last_name VARCHAR(255) DEFAULT NULL, link_display VARCHAR(255) DEFAULT NULL, link_url VARCHAR(255) DEFAULT NULL, short_name VARCHAR(255) NOT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, deletedAt DATETIME DEFAULT NULL, UNIQUE INDEX UNIQ_BDAFD8C8989D9B62 (slug), INDEX IDX_BDAFD8C8DE12AB56 (created_by), INDEX IDX_BDAFD8C816FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE authority (id INT AUTO_INCREMENT NOT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, description VARCHAR(255) DEFAULT NULL, name VARCHAR(255) NOT NULL, priority INT DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, INDEX IDX_4AF96AFCDE12AB56 (created_by), INDEX IDX_4AF96AFC16FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE citation (id INT AUTO_INCREMENT NOT NULL, publication_id INT DEFAULT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, description VARCHAR(255) DEFAULT NULL, full_text LONGTEXT NOT NULL, is_secondary TINYINT(1) DEFAULT NULL, publication_issue VARCHAR(255) DEFAULT NULL, publication_pages VARCHAR(255) DEFAULT NULL, publisher VARCHAR(255) DEFAULT NULL, title VARCHAR(255) DEFAULT NULL, year VARCHAR(255) DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, deletedAt DATETIME DEFAULT NULL, INDEX IDX_FABD9C7E38B217A7 (publication_id), INDEX IDX_FABD9C7EDE12AB56 (created_by), INDEX IDX_FABD9C7E16FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE content_block (id INT AUTO_INCREMENT NOT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, slug VARCHAR(128) DEFAULT NULL, name VARCHAR(255) DEFAULT NULL, page VARCHAR(255) DEFAULT NULL, content LONGTEXT NOT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, deletedAt DATETIME DEFAULT NULL, UNIQUE INDEX UNIQ_68D8C3F0989D9B62 (slug), UNIQUE INDEX UNIQ_68D8C3F05E237E06 (name), INDEX IDX_68D8C3F0DE12AB56 (created_by), INDEX IDX_68D8C3F016FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE country (id INT AUTO_INCREMENT NOT NULL, default_region INT DEFAULT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, slug VARCHAR(128) DEFAULT NULL, deletedAt DATETIME DEFAULT NULL, name VARCHAR(255) NOT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, UNIQUE INDEX UNIQ_5373C966989D9B62 (slug), INDEX IDX_5373C966E833FA25 (default_region), INDEX IDX_5373C966DE12AB56 (created_by), INDEX IDX_5373C96616FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE domain (id INT AUTO_INCREMENT NOT NULL, taxon_id INT DEFAULT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, slug VARCHAR(128) DEFAULT NULL, name VARCHAR(255) NOT NULL, plural_name VARCHAR(255) DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, UNIQUE INDEX UNIQ_A7A91E0B989D9B62 (slug), UNIQUE INDEX UNIQ_A7A91E0BDE13F470 (taxon_id), INDEX IDX_A7A91E0BDE12AB56 (created_by), INDEX IDX_A7A91E0B16FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE feedback (id INT AUTO_INCREMENT NOT NULL, assigned_user INT DEFAULT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, status INT NOT NULL, topic VARCHAR(255) NOT NULL, route VARCHAR(255) NOT NULL, content LONGTEXT NOT NULL, admin_notes LONGTEXT DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, deletedAt DATETIME DEFAULT NULL, INDEX IDX_D229445864EB2CB0 (assigned_user), INDEX IDX_D2294458DE12AB56 (created_by), INDEX IDX_D229445816FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE habitat_type (id INT AUTO_INCREMENT NOT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, slug VARCHAR(128) DEFAULT NULL, name VARCHAR(255) NOT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, UNIQUE INDEX UNIQ_63B23110989D9B62 (slug), INDEX IDX_63B23110DE12AB56 (created_by), INDEX IDX_63B2311016FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE image_upload (id INT AUTO_INCREMENT NOT NULL, taxon_id INT DEFAULT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, filename VARCHAR(255) NOT NULL, path VARCHAR(255) NOT NULL, mime_type VARCHAR(255) NOT NULL, status INT NOT NULL, size NUMERIC(10, 0) NOT NULL, caption VARCHAR(255) DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, deletedAt DATETIME DEFAULT NULL, INDEX IDX_B8A0B8D7DE13F470 (taxon_id), INDEX IDX_B8A0B8D7DE12AB56 (created_by), INDEX IDX_B8A0B8D716FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE interaction (id INT AUTO_INCREMENT NOT NULL, citation_id INT DEFAULT NULL, interaction_type_id INT DEFAULT NULL, location_id INT DEFAULT NULL, subject_taxon_id INT DEFAULT NULL, object_taxon_id INT DEFAULT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, note VARCHAR(255) DEFAULT NULL, is_likely TINYINT(1) DEFAULT NULL, is_old_world TINYINT(1) DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, deletedAt DATETIME DEFAULT NULL, INDEX IDX_378DFDA7500A8AB7 (citation_id), INDEX IDX_378DFDA7A50ABBF2 (interaction_type_id), INDEX IDX_378DFDA764D218E (location_id), INDEX IDX_378DFDA7E66EB418 (subject_taxon_id), INDEX IDX_378DFDA78C51918 (object_taxon_id), INDEX IDX_378DFDA7DE12AB56 (created_by), INDEX IDX_378DFDA716FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE interaction_type (id INT AUTO_INCREMENT NOT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, slug VARCHAR(128) DEFAULT NULL, is_symmetric TINYINT(1) DEFAULT NULL, name VARCHAR(255) NOT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, UNIQUE INDEX UNIQ_1E1A8229989D9B62 (slug), INDEX IDX_1E1A8229DE12AB56 (created_by), INDEX IDX_1E1A822916FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE level (id INT AUTO_INCREMENT NOT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, name VARCHAR(255) NOT NULL, ordinal INT DEFAULT NULL, plural_name VARCHAR(255) DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, INDEX IDX_9AEACC13DE12AB56 (created_by), INDEX IDX_9AEACC1316FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE location (id INT AUTO_INCREMENT NOT NULL, country_id INT DEFAULT NULL, habitat_type_id INT DEFAULT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, description VARCHAR(255) NOT NULL, elevation INT DEFAULT NULL, elevation_max INT DEFAULT NULL, elev_unit_abbrv VARCHAR(3) DEFAULT NULL, gps_data VARCHAR(255) DEFAULT NULL, latitude NUMERIC(18, 14) DEFAULT NULL, longitude NUMERIC(18, 14) DEFAULT NULL, show_on_map TINYINT(1) DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, deletedAt DATETIME DEFAULT NULL, INDEX IDX_5E9E89CBF92F3E70 (country_id), INDEX IDX_5E9E89CB9955B331 (habitat_type_id), INDEX IDX_5E9E89CBDE12AB56 (created_by), INDEX IDX_5E9E89CB16FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE naming (id INT AUTO_INCREMENT NOT NULL, taxon_id INT DEFAULT NULL, taxonym_id INT DEFAULT NULL, naming_type_id INT DEFAULT NULL, authority_id INT DEFAULT NULL, parent_taxon_id INT DEFAULT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, from_date DATETIME DEFAULT NULL, guid VARCHAR(255) DEFAULT NULL, to_date DATETIME DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, deletedAt DATETIME DEFAULT NULL, INDEX IDX_818CFCD7DE13F470 (taxon_id), INDEX IDX_818CFCD7C30BB132 (taxonym_id), INDEX IDX_818CFCD7FBF60FC7 (naming_type_id), INDEX IDX_818CFCD781EC865B (authority_id), INDEX IDX_818CFCD741DE58A1 (parent_taxon_id), INDEX IDX_818CFCD7DE12AB56 (created_by), INDEX IDX_818CFCD716FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE naming_type (id INT AUTO_INCREMENT NOT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, name VARCHAR(255) NOT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, INDEX IDX_EC29668ADE12AB56 (created_by), INDEX IDX_EC29668A16FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE publication (id INT AUTO_INCREMENT NOT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, slug VARCHAR(128) DEFAULT NULL, doi VARCHAR(255) DEFAULT NULL, link_display VARCHAR(255) DEFAULT NULL, link_url VARCHAR(255) DEFAULT NULL, name VARCHAR(255) NOT NULL, publication_type VARCHAR(255) DEFAULT NULL, publisher VARCHAR(255) DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, deletedAt DATETIME DEFAULT NULL, UNIQUE INDEX UNIQ_AF3C6779989D9B62 (slug), INDEX IDX_AF3C6779DE12AB56 (created_by), INDEX IDX_AF3C677916FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE region (id INT AUTO_INCREMENT NOT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, slug VARCHAR(128) DEFAULT NULL, deletedAt DATETIME DEFAULT NULL, description VARCHAR(255) NOT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, UNIQUE INDEX UNIQ_F62F176989D9B62 (slug), INDEX IDX_F62F176DE12AB56 (created_by), INDEX IDX_F62F17616FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE regions_locations (region_id INT NOT NULL, location_id INT NOT NULL, INDEX IDX_F71BC25698260155 (region_id), INDEX IDX_F71BC25664D218E (location_id), PRIMARY KEY(region_id, location_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE tag (id INT AUTO_INCREMENT NOT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, tag LONGTEXT NOT NULL, constrained_to_entity LONGTEXT DEFAULT NULL, deletedAt DATETIME DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, INDEX IDX_389B783DE12AB56 (created_by), INDEX IDX_389B78316FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE interaction_tag (tag_id INT NOT NULL, interaction_id INT NOT NULL, INDEX IDX_15D22C4FBAD26311 (tag_id), INDEX IDX_15D22C4F886DEE8F (interaction_id), PRIMARY KEY(tag_id, interaction_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE citation_tag (tag_id INT NOT NULL, citation_id INT NOT NULL, INDEX IDX_3D08F3B5BAD26311 (tag_id), INDEX IDX_3D08F3B5500A8AB7 (citation_id), PRIMARY KEY(tag_id, citation_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE type_tag_contraints (tag_id INT NOT NULL, interactiontype_id INT NOT NULL, INDEX IDX_109E44E4BAD26311 (tag_id), INDEX IDX_109E44E4CAC6DF8F (interactiontype_id), PRIMARY KEY(tag_id, interactiontype_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE taxon (id INT AUTO_INCREMENT NOT NULL, level_id INT DEFAULT NULL, parent_taxon_id INT DEFAULT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, slug VARCHAR(128) DEFAULT NULL, default_guid VARCHAR(255) DEFAULT NULL, display_name VARCHAR(255) NOT NULL, is_old_world TINYINT(1) DEFAULT NULL, link_display VARCHAR(255) DEFAULT NULL, link_url VARCHAR(255) DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, deletedAt DATETIME DEFAULT NULL, UNIQUE INDEX UNIQ_5B6723AB989D9B62 (slug), INDEX IDX_5B6723AB5FB14BA7 (level_id), INDEX IDX_5B6723AB41DE58A1 (parent_taxon_id), INDEX IDX_5B6723ABDE12AB56 (created_by), INDEX IDX_5B6723AB16FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE taxonym (id INT AUTO_INCREMENT NOT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, name VARCHAR(255) NOT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, deletedAt DATETIME DEFAULT NULL, INDEX IDX_63B38292DE12AB56 (created_by), INDEX IDX_63B3829216FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, username VARCHAR(255) NOT NULL, username_canonical VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, email_canonical VARCHAR(255) NOT NULL, enabled TINYINT(1) NOT NULL, salt VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, last_login DATETIME DEFAULT NULL, locked TINYINT(1) NOT NULL, expired TINYINT(1) NOT NULL, expires_at DATETIME DEFAULT NULL, confirmation_token VARCHAR(255) DEFAULT NULL, password_requested_at DATETIME DEFAULT NULL, roles LONGTEXT NOT NULL COMMENT \'(DC2Type:array)\', credentials_expired TINYINT(1) NOT NULL, credentials_expire_at DATETIME DEFAULT NULL, aboutMe LONGTEXT NOT NULL, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, deletedAt DATETIME DEFAULT NULL, UNIQUE INDEX UNIQ_8D93D64992FC23A8 (username_canonical), UNIQUE INDEX UNIQ_8D93D649A0D96FBF (email_canonical), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE attribution ADD CONSTRAINT FK_C751ED49DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE attribution ADD CONSTRAINT FK_C751ED4916FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE attribution ADD CONSTRAINT FK_C751ED49500A8AB7 FOREIGN KEY (citation_id) REFERENCES citation (id)');
        $this->addSql('ALTER TABLE attribution ADD CONSTRAINT FK_C751ED49F675F31B FOREIGN KEY (author_id) REFERENCES author (id)');
        $this->addSql('ALTER TABLE author ADD CONSTRAINT FK_BDAFD8C8DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE author ADD CONSTRAINT FK_BDAFD8C816FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE authority ADD CONSTRAINT FK_4AF96AFCDE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE authority ADD CONSTRAINT FK_4AF96AFC16FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE citation ADD CONSTRAINT FK_FABD9C7E38B217A7 FOREIGN KEY (publication_id) REFERENCES publication (id)');
        $this->addSql('ALTER TABLE citation ADD CONSTRAINT FK_FABD9C7EDE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE citation ADD CONSTRAINT FK_FABD9C7E16FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE content_block ADD CONSTRAINT FK_68D8C3F0DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE content_block ADD CONSTRAINT FK_68D8C3F016FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE country ADD CONSTRAINT FK_5373C966E833FA25 FOREIGN KEY (default_region) REFERENCES region (id)');
        $this->addSql('ALTER TABLE country ADD CONSTRAINT FK_5373C966DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE country ADD CONSTRAINT FK_5373C96616FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE domain ADD CONSTRAINT FK_A7A91E0BDE13F470 FOREIGN KEY (taxon_id) REFERENCES taxon (id)');
        $this->addSql('ALTER TABLE domain ADD CONSTRAINT FK_A7A91E0BDE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE domain ADD CONSTRAINT FK_A7A91E0B16FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE feedback ADD CONSTRAINT FK_D229445864EB2CB0 FOREIGN KEY (assigned_user) REFERENCES user (id)');
        $this->addSql('ALTER TABLE feedback ADD CONSTRAINT FK_D2294458DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE feedback ADD CONSTRAINT FK_D229445816FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE habitat_type ADD CONSTRAINT FK_63B23110DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE habitat_type ADD CONSTRAINT FK_63B2311016FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE image_upload ADD CONSTRAINT FK_B8A0B8D7DE13F470 FOREIGN KEY (taxon_id) REFERENCES taxon (id)');
        $this->addSql('ALTER TABLE image_upload ADD CONSTRAINT FK_B8A0B8D7DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE image_upload ADD CONSTRAINT FK_B8A0B8D716FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7500A8AB7 FOREIGN KEY (citation_id) REFERENCES citation (id)');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7A50ABBF2 FOREIGN KEY (interaction_type_id) REFERENCES interaction_type (id)');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA764D218E FOREIGN KEY (location_id) REFERENCES location (id)');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7E66EB418 FOREIGN KEY (subject_taxon_id) REFERENCES taxon (id)');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA78C51918 FOREIGN KEY (object_taxon_id) REFERENCES taxon (id)');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA716FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE interaction_type ADD CONSTRAINT FK_1E1A8229DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE interaction_type ADD CONSTRAINT FK_1E1A822916FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE level ADD CONSTRAINT FK_9AEACC13DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE level ADD CONSTRAINT FK_9AEACC1316FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE location ADD CONSTRAINT FK_5E9E89CBF92F3E70 FOREIGN KEY (country_id) REFERENCES country (id)');
        $this->addSql('ALTER TABLE location ADD CONSTRAINT FK_5E9E89CB9955B331 FOREIGN KEY (habitat_type_id) REFERENCES habitat_type (id)');
        $this->addSql('ALTER TABLE location ADD CONSTRAINT FK_5E9E89CBDE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE location ADD CONSTRAINT FK_5E9E89CB16FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE naming ADD CONSTRAINT FK_818CFCD7DE13F470 FOREIGN KEY (taxon_id) REFERENCES taxon (id)');
        $this->addSql('ALTER TABLE naming ADD CONSTRAINT FK_818CFCD7C30BB132 FOREIGN KEY (taxonym_id) REFERENCES taxonym (id)');
        $this->addSql('ALTER TABLE naming ADD CONSTRAINT FK_818CFCD7FBF60FC7 FOREIGN KEY (naming_type_id) REFERENCES naming_type (id)');
        $this->addSql('ALTER TABLE naming ADD CONSTRAINT FK_818CFCD781EC865B FOREIGN KEY (authority_id) REFERENCES authority (id)');
        $this->addSql('ALTER TABLE naming ADD CONSTRAINT FK_818CFCD741DE58A1 FOREIGN KEY (parent_taxon_id) REFERENCES taxon (id)');
        $this->addSql('ALTER TABLE naming ADD CONSTRAINT FK_818CFCD7DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE naming ADD CONSTRAINT FK_818CFCD716FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE naming_type ADD CONSTRAINT FK_EC29668ADE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE naming_type ADD CONSTRAINT FK_EC29668A16FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE publication ADD CONSTRAINT FK_AF3C6779DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE publication ADD CONSTRAINT FK_AF3C677916FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE region ADD CONSTRAINT FK_F62F176DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE region ADD CONSTRAINT FK_F62F17616FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE regions_locations ADD CONSTRAINT FK_F71BC25698260155 FOREIGN KEY (region_id) REFERENCES region (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE regions_locations ADD CONSTRAINT FK_F71BC25664D218E FOREIGN KEY (location_id) REFERENCES location (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE tag ADD CONSTRAINT FK_389B783DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE tag ADD CONSTRAINT FK_389B78316FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE interaction_tag ADD CONSTRAINT FK_15D22C4FBAD26311 FOREIGN KEY (tag_id) REFERENCES tag (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE interaction_tag ADD CONSTRAINT FK_15D22C4F886DEE8F FOREIGN KEY (interaction_id) REFERENCES interaction (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE citation_tag ADD CONSTRAINT FK_3D08F3B5BAD26311 FOREIGN KEY (tag_id) REFERENCES tag (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE citation_tag ADD CONSTRAINT FK_3D08F3B5500A8AB7 FOREIGN KEY (citation_id) REFERENCES citation (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE type_tag_contraints ADD CONSTRAINT FK_109E44E4BAD26311 FOREIGN KEY (tag_id) REFERENCES tag (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE type_tag_contraints ADD CONSTRAINT FK_109E44E4CAC6DF8F FOREIGN KEY (interactiontype_id) REFERENCES interaction_type (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE taxon ADD CONSTRAINT FK_5B6723AB5FB14BA7 FOREIGN KEY (level_id) REFERENCES level (id)');
        $this->addSql('ALTER TABLE taxon ADD CONSTRAINT FK_5B6723AB41DE58A1 FOREIGN KEY (parent_taxon_id) REFERENCES taxon (id)');
        $this->addSql('ALTER TABLE taxon ADD CONSTRAINT FK_5B6723ABDE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE taxon ADD CONSTRAINT FK_5B6723AB16FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE taxonym ADD CONSTRAINT FK_63B38292DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE taxonym ADD CONSTRAINT FK_63B3829216FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE attribution DROP FOREIGN KEY FK_C751ED49F675F31B');
        $this->addSql('ALTER TABLE naming DROP FOREIGN KEY FK_818CFCD781EC865B');
        $this->addSql('ALTER TABLE attribution DROP FOREIGN KEY FK_C751ED49500A8AB7');
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7500A8AB7');
        $this->addSql('ALTER TABLE citation_tag DROP FOREIGN KEY FK_3D08F3B5500A8AB7');
        $this->addSql('ALTER TABLE location DROP FOREIGN KEY FK_5E9E89CBF92F3E70');
        $this->addSql('ALTER TABLE location DROP FOREIGN KEY FK_5E9E89CB9955B331');
        $this->addSql('ALTER TABLE interaction_tag DROP FOREIGN KEY FK_15D22C4F886DEE8F');
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7A50ABBF2');
        $this->addSql('ALTER TABLE type_tag_contraints DROP FOREIGN KEY FK_109E44E4CAC6DF8F');
        $this->addSql('ALTER TABLE taxon DROP FOREIGN KEY FK_5B6723AB5FB14BA7');
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA764D218E');
        $this->addSql('ALTER TABLE regions_locations DROP FOREIGN KEY FK_F71BC25664D218E');
        $this->addSql('ALTER TABLE naming DROP FOREIGN KEY FK_818CFCD7FBF60FC7');
        $this->addSql('ALTER TABLE citation DROP FOREIGN KEY FK_FABD9C7E38B217A7');
        $this->addSql('ALTER TABLE country DROP FOREIGN KEY FK_5373C966E833FA25');
        $this->addSql('ALTER TABLE regions_locations DROP FOREIGN KEY FK_F71BC25698260155');
        $this->addSql('ALTER TABLE interaction_tag DROP FOREIGN KEY FK_15D22C4FBAD26311');
        $this->addSql('ALTER TABLE citation_tag DROP FOREIGN KEY FK_3D08F3B5BAD26311');
        $this->addSql('ALTER TABLE type_tag_contraints DROP FOREIGN KEY FK_109E44E4BAD26311');
        $this->addSql('ALTER TABLE domain DROP FOREIGN KEY FK_A7A91E0BDE13F470');
        $this->addSql('ALTER TABLE image_upload DROP FOREIGN KEY FK_B8A0B8D7DE13F470');
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7E66EB418');
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA78C51918');
        $this->addSql('ALTER TABLE naming DROP FOREIGN KEY FK_818CFCD7DE13F470');
        $this->addSql('ALTER TABLE naming DROP FOREIGN KEY FK_818CFCD741DE58A1');
        $this->addSql('ALTER TABLE taxon DROP FOREIGN KEY FK_5B6723AB41DE58A1');
        $this->addSql('ALTER TABLE naming DROP FOREIGN KEY FK_818CFCD7C30BB132');
        $this->addSql('ALTER TABLE attribution DROP FOREIGN KEY FK_C751ED49DE12AB56');
        $this->addSql('ALTER TABLE attribution DROP FOREIGN KEY FK_C751ED4916FE72E1');
        $this->addSql('ALTER TABLE author DROP FOREIGN KEY FK_BDAFD8C8DE12AB56');
        $this->addSql('ALTER TABLE author DROP FOREIGN KEY FK_BDAFD8C816FE72E1');
        $this->addSql('ALTER TABLE authority DROP FOREIGN KEY FK_4AF96AFCDE12AB56');
        $this->addSql('ALTER TABLE authority DROP FOREIGN KEY FK_4AF96AFC16FE72E1');
        $this->addSql('ALTER TABLE citation DROP FOREIGN KEY FK_FABD9C7EDE12AB56');
        $this->addSql('ALTER TABLE citation DROP FOREIGN KEY FK_FABD9C7E16FE72E1');
        $this->addSql('ALTER TABLE content_block DROP FOREIGN KEY FK_68D8C3F0DE12AB56');
        $this->addSql('ALTER TABLE content_block DROP FOREIGN KEY FK_68D8C3F016FE72E1');
        $this->addSql('ALTER TABLE country DROP FOREIGN KEY FK_5373C966DE12AB56');
        $this->addSql('ALTER TABLE country DROP FOREIGN KEY FK_5373C96616FE72E1');
        $this->addSql('ALTER TABLE domain DROP FOREIGN KEY FK_A7A91E0BDE12AB56');
        $this->addSql('ALTER TABLE domain DROP FOREIGN KEY FK_A7A91E0B16FE72E1');
        $this->addSql('ALTER TABLE feedback DROP FOREIGN KEY FK_D229445864EB2CB0');
        $this->addSql('ALTER TABLE feedback DROP FOREIGN KEY FK_D2294458DE12AB56');
        $this->addSql('ALTER TABLE feedback DROP FOREIGN KEY FK_D229445816FE72E1');
        $this->addSql('ALTER TABLE habitat_type DROP FOREIGN KEY FK_63B23110DE12AB56');
        $this->addSql('ALTER TABLE habitat_type DROP FOREIGN KEY FK_63B2311016FE72E1');
        $this->addSql('ALTER TABLE image_upload DROP FOREIGN KEY FK_B8A0B8D7DE12AB56');
        $this->addSql('ALTER TABLE image_upload DROP FOREIGN KEY FK_B8A0B8D716FE72E1');
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7DE12AB56');
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA716FE72E1');
        $this->addSql('ALTER TABLE interaction_type DROP FOREIGN KEY FK_1E1A8229DE12AB56');
        $this->addSql('ALTER TABLE interaction_type DROP FOREIGN KEY FK_1E1A822916FE72E1');
        $this->addSql('ALTER TABLE level DROP FOREIGN KEY FK_9AEACC13DE12AB56');
        $this->addSql('ALTER TABLE level DROP FOREIGN KEY FK_9AEACC1316FE72E1');
        $this->addSql('ALTER TABLE location DROP FOREIGN KEY FK_5E9E89CBDE12AB56');
        $this->addSql('ALTER TABLE location DROP FOREIGN KEY FK_5E9E89CB16FE72E1');
        $this->addSql('ALTER TABLE naming DROP FOREIGN KEY FK_818CFCD7DE12AB56');
        $this->addSql('ALTER TABLE naming DROP FOREIGN KEY FK_818CFCD716FE72E1');
        $this->addSql('ALTER TABLE naming_type DROP FOREIGN KEY FK_EC29668ADE12AB56');
        $this->addSql('ALTER TABLE naming_type DROP FOREIGN KEY FK_EC29668A16FE72E1');
        $this->addSql('ALTER TABLE publication DROP FOREIGN KEY FK_AF3C6779DE12AB56');
        $this->addSql('ALTER TABLE publication DROP FOREIGN KEY FK_AF3C677916FE72E1');
        $this->addSql('ALTER TABLE region DROP FOREIGN KEY FK_F62F176DE12AB56');
        $this->addSql('ALTER TABLE region DROP FOREIGN KEY FK_F62F17616FE72E1');
        $this->addSql('ALTER TABLE tag DROP FOREIGN KEY FK_389B783DE12AB56');
        $this->addSql('ALTER TABLE tag DROP FOREIGN KEY FK_389B78316FE72E1');
        $this->addSql('ALTER TABLE taxon DROP FOREIGN KEY FK_5B6723ABDE12AB56');
        $this->addSql('ALTER TABLE taxon DROP FOREIGN KEY FK_5B6723AB16FE72E1');
        $this->addSql('ALTER TABLE taxonym DROP FOREIGN KEY FK_63B38292DE12AB56');
        $this->addSql('ALTER TABLE taxonym DROP FOREIGN KEY FK_63B3829216FE72E1');
        $this->addSql('DROP TABLE attribution');
        $this->addSql('DROP TABLE author');
        $this->addSql('DROP TABLE authority');
        $this->addSql('DROP TABLE citation');
        $this->addSql('DROP TABLE content_block');
        $this->addSql('DROP TABLE country');
        $this->addSql('DROP TABLE domain');
        $this->addSql('DROP TABLE feedback');
        $this->addSql('DROP TABLE habitat_type');
        $this->addSql('DROP TABLE image_upload');
        $this->addSql('DROP TABLE interaction');
        $this->addSql('DROP TABLE interaction_type');
        $this->addSql('DROP TABLE level');
        $this->addSql('DROP TABLE location');
        $this->addSql('DROP TABLE naming');
        $this->addSql('DROP TABLE naming_type');
        $this->addSql('DROP TABLE publication');
        $this->addSql('DROP TABLE region');
        $this->addSql('DROP TABLE regions_locations');
        $this->addSql('DROP TABLE tag');
        $this->addSql('DROP TABLE interaction_tag');
        $this->addSql('DROP TABLE citation_tag');
        $this->addSql('DROP TABLE type_tag_contraints');
        $this->addSql('DROP TABLE taxon');
        $this->addSql('DROP TABLE taxonym');
        $this->addSql('DROP TABLE user');
    }
}
