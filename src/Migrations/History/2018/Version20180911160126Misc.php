<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Removed Publisher Type code. 
 * Changed GeoJson's 'centerPoint' to 'displayPoint'.
 * Added 'role' to Realm entity. 
 */
class Version20180911160126Misc extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema):void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE publisher DROP FOREIGN KEY FK_9CE8D546C54C8C93');
        $this->addSql('DROP TABLE publisher_type');
        $this->addSql('DROP INDEX IDX_9CE8D546C54C8C93 ON publisher');
        $this->addSql('ALTER TABLE publisher DROP type_id');
        $this->addSql('ALTER TABLE geo_json CHANGE center_point display_point VARCHAR(255) DEFAULT NULL');

        $this->addSql('ALTER TABLE user ADD last_activity_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE user MODIFY last_activity_at DATETIME DEFAULT NULL AFTER email_canonical');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema):void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE publisher_type (id INT AUTO_INCREMENT NOT NULL, updated_by INT DEFAULT NULL, created_by INT DEFAULT NULL, slug VARCHAR(128) DEFAULT NULL COLLATE utf8_unicode_ci, display_name VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci, description VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci, created DATETIME NOT NULL, updated DATETIME NOT NULL, UNIQUE INDEX UNIQ_6DC7877ED5499347 (display_name), UNIQUE INDEX UNIQ_6DC7877E989D9B62 (slug), INDEX IDX_6DC7877EDE12AB56 (created_by), INDEX IDX_6DC7877E16FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE publisher_type ADD CONSTRAINT FK_6DC7877E16FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE publisher_type ADD CONSTRAINT FK_6DC7877EDE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE geo_json CHANGE display_point center_point VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci');
        $this->addSql('ALTER TABLE publisher ADD type_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE publisher ADD CONSTRAINT FK_9CE8D546C54C8C93 FOREIGN KEY (type_id) REFERENCES publisher_type (id)');
        $this->addSql('CREATE INDEX IDX_9CE8D546C54C8C93 ON publisher (type_id)');
        $this->addSql('ALTER TABLE realm DROP role');
    }
}
