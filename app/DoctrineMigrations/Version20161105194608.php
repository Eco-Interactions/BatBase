<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20161105194608 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE contribution DROP FOREIGN KEY FK_EA351E15F675F31B');
        $this->addSql('DROP INDEX IDX_EA351E15F675F31B ON contribution');
        $this->addSql('ALTER TABLE contribution CHANGE author_id auth_src_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE contribution ADD CONSTRAINT FK_EA351E152F568E4E FOREIGN KEY (auth_src_id) REFERENCES source (id)');
        $this->addSql('CREATE INDEX IDX_EA351E152F568E4E ON contribution (auth_src_id)');
        $this->addSql('ALTER TABLE publication CHANGE description description VARCHAR(255) DEFAULT NULL');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE contribution DROP FOREIGN KEY FK_EA351E152F568E4E');
        $this->addSql('DROP INDEX IDX_EA351E152F568E4E ON contribution');
        $this->addSql('ALTER TABLE contribution CHANGE auth_src_id author_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE contribution ADD CONSTRAINT FK_EA351E15F675F31B FOREIGN KEY (author_id) REFERENCES source (id)');
        $this->addSql('CREATE INDEX IDX_EA351E15F675F31B ON contribution (author_id)');
        $this->addSql('ALTER TABLE publication CHANGE description description INT DEFAULT NULL');
    }
}
