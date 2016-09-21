<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160129225527 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE int_tag (id INT AUTO_INCREMENT NOT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, tag LONGTEXT NOT NULL, deletedAt DATETIME DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, INDEX IDX_D2488F08DE12AB56 (created_by), INDEX IDX_D2488F0816FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE interaction_int_tag (inttag_id INT NOT NULL, interaction_id INT NOT NULL, INDEX IDX_B20EB869C09FA752 (inttag_id), INDEX IDX_B20EB869886DEE8F (interaction_id), PRIMARY KEY(inttag_id, interaction_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE type_tag_contraints (inttag_id INT NOT NULL, interactiontype_id INT NOT NULL, INDEX IDX_109E44E4C09FA752 (inttag_id), INDEX IDX_109E44E4CAC6DF8F (interactiontype_id), PRIMARY KEY(inttag_id, interactiontype_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE int_tag ADD CONSTRAINT FK_D2488F08DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE int_tag ADD CONSTRAINT FK_D2488F0816FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE interaction_int_tag ADD CONSTRAINT FK_B20EB869C09FA752 FOREIGN KEY (inttag_id) REFERENCES int_tag (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE interaction_int_tag ADD CONSTRAINT FK_B20EB869886DEE8F FOREIGN KEY (interaction_id) REFERENCES interaction (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE type_tag_contraints ADD CONSTRAINT FK_109E44E4C09FA752 FOREIGN KEY (inttag_id) REFERENCES int_tag (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE type_tag_contraints ADD CONSTRAINT FK_109E44E4CAC6DF8F FOREIGN KEY (interactiontype_id) REFERENCES interaction_type (id) ON DELETE CASCADE');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE interaction_int_tag DROP FOREIGN KEY FK_B20EB869C09FA752');
        $this->addSql('ALTER TABLE type_tag_contraints DROP FOREIGN KEY FK_109E44E4C09FA752');
        $this->addSql('DROP TABLE int_tag');
        $this->addSql('DROP TABLE interaction_int_tag');
        $this->addSql('DROP TABLE type_tag_contraints');
    }
}
