<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160119033900 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE feedback ADD assigned_user INT DEFAULT NULL, ADD status INT NOT NULL, ADD admin_notes LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE feedback ADD CONSTRAINT FK_D229445864EB2CB0 FOREIGN KEY (assigned_user) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_D229445864EB2CB0 ON feedback (assigned_user)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE feedback DROP FOREIGN KEY FK_D229445864EB2CB0');
        $this->addSql('DROP INDEX IDX_D229445864EB2CB0 ON feedback');
        $this->addSql('ALTER TABLE feedback DROP assigned_user, DROP status, DROP admin_notes');
    }
}
