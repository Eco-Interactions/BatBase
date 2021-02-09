<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Adds the ValidInteraction entity for valid Subject -> Object -> IntType -> Tags combinations.
 */
final class Version20210205ValidInteractionSql extends AbstractMigration
{
    public function getDescription() : string
    {
        return 'Adds the ValidInteraction entity for valid Subject -> Object -> IntType -> Tags combinations.';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE valid_interaction (id INT AUTO_INCREMENT NOT NULL, subject_sub_group_id INT NOT NULL, object_sub_group_id INT NOT NULL,  interaction_type_id INT DEFAULT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, INDEX IDX_64A93140A381BE79 (object_sub_group_id), INDEX IDX_64A931407860DA17 (subject_sub_group_id), INDEX IDX_64A93140A50ABBF2 (interaction_type_id), INDEX IDX_64A93140DE12AB56 (created_by), INDEX IDX_64A9314016FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE valid_interaction_tag (valid_interaction_id INT NOT NULL, tag_id INT NOT NULL, INDEX IDX_C545DB027F8C546A (valid_interaction_id), INDEX IDX_C545DB02BAD26311 (tag_id), PRIMARY KEY(valid_interaction_id, tag_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE valid_interaction ADD CONSTRAINT FK_64A93140A381BE79 FOREIGN KEY (object_sub_group_id) REFERENCES group_root (id)');
        $this->addSql('ALTER TABLE valid_interaction ADD CONSTRAINT FK_64A931407860DA17 FOREIGN KEY (subject_sub_group_id) REFERENCES group_root (id)');
        $this->addSql('ALTER TABLE valid_interaction ADD CONSTRAINT FK_64A93140A50ABBF2 FOREIGN KEY (interaction_type_id) REFERENCES interaction_type (id)');
        $this->addSql('ALTER TABLE valid_interaction ADD CONSTRAINT FK_64A93140DE12AB56 FOREIGN KEY (created_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE valid_interaction ADD CONSTRAINT FK_64A9314016FE72E1 FOREIGN KEY (updated_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE valid_interaction_tag ADD CONSTRAINT FK_C545DB027F8C546A FOREIGN KEY (valid_interaction_id) REFERENCES valid_interaction (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE valid_interaction_tag ADD CONSTRAINT FK_C545DB02BAD26311 FOREIGN KEY (tag_id) REFERENCES tag (id) ON DELETE CASCADE');
        $this->addSql('DROP TABLE int_type_tag_contraints');
        $this->addSql('ALTER TABLE group_root ADD description LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE interaction_type DROP passive_form');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE valid_interaction_tag DROP FOREIGN KEY FK_C545DB027F8C546A');
        $this->addSql('CREATE TABLE int_type_tag_contraints (tag_id INT NOT NULL, interaction_type_id INT NOT NULL, INDEX IDX_3E25DD7DBAD26311 (tag_id), INDEX IDX_3E25DD7DA50ABBF2 (interaction_type_id), PRIMARY KEY(tag_id, interaction_type_id)) DEFAULT CHARACTER SET utf8 COLLATE `utf8_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE int_type_tag_contraints ADD CONSTRAINT FK_109E44E4BAD26311 FOREIGN KEY (tag_id) REFERENCES tag (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE int_type_tag_contraints ADD CONSTRAINT FK_3E25DD7DA50ABBF2 FOREIGN KEY (interaction_type_id) REFERENCES interaction_type (id) ON DELETE CASCADE');
        $this->addSql('DROP TABLE valid_interaction');
        $this->addSql('DROP TABLE valid_interaction_tag');
        $this->addSql('ALTER TABLE group_root DROP description');
        $this->addSql('ALTER TABLE interaction_type ADD passive_form VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`');
    }
}
