<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160206011511 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE image_upload ADD taxon_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE image_upload ADD CONSTRAINT FK_B8A0B8D7DE13F470 FOREIGN KEY (taxon_id) REFERENCES taxon (id)');
        $this->addSql('CREATE INDEX IDX_B8A0B8D7DE13F470 ON image_upload (taxon_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE image_upload DROP FOREIGN KEY FK_B8A0B8D7DE13F470');
        $this->addSql('DROP INDEX IDX_B8A0B8D7DE13F470 ON image_upload');
        $this->addSql('ALTER TABLE image_upload DROP taxon_id');
    }
}
