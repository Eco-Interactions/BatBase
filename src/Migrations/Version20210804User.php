<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210804UserProps extends AbstractMigration
{
    public function getDescription() : string
    {
        return 'Adds new props to collect data about editors.';
    }

    public function up(Schema $schema) : void
    {
        $this->addSql('ALTER TABLE user MODIFY COLUMN email VARCHAR(255) NOT NULL AFTER username;');
        $this->addSql('ALTER TABLE user MODIFY COLUMN roles LONGTEXT NOT NULL COMMENT \'(DC2Type:array)\' AFTER email;');
        $this->addSql('ALTER TABLE user ADD education VARCHAR(255) DEFAULT NULL AFTER username, ADD country VARCHAR(255) DEFAULT NULL AFTER username, ADD interest VARCHAR(255) DEFAULT NULL AFTER username');
    }

    public function down(Schema $schema) : void
    {
        $this->addSql('ALTER TABLE `user` DROP education, DROP country');
    }
}
