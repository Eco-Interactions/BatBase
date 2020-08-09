<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200627IntTypeMapping extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema):void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE int_type_tag_contraints DROP FOREIGN KEY FK_109E44E4CAC6DF8F');
        $this->addSql('DROP INDEX IDX_3E25DD7DCAC6DF8F ON int_type_tag_contraints');
        $this->addSql('ALTER TABLE int_type_tag_contraints DROP PRIMARY KEY');
        $this->addSql('ALTER TABLE int_type_tag_contraints CHANGE interactiontype_id interaction_type_id INT NOT NULL');
        $this->addSql('ALTER TABLE int_type_tag_contraints ADD CONSTRAINT FK_3E25DD7DA50ABBF2 FOREIGN KEY (interaction_type_id) REFERENCES interaction_type (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_3E25DD7DA50ABBF2 ON int_type_tag_contraints (interaction_type_id)');
        $this->addSql('ALTER TABLE int_type_tag_contraints ADD PRIMARY KEY (tag_id, interaction_type_id)');
    }

    public function down(Schema $schema):void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE int_type_tag_contraints DROP FOREIGN KEY FK_3E25DD7DA50ABBF2');
        $this->addSql('DROP INDEX IDX_3E25DD7DA50ABBF2 ON int_type_tag_contraints');
        $this->addSql('ALTER TABLE int_type_tag_contraints DROP PRIMARY KEY');
        $this->addSql('ALTER TABLE int_type_tag_contraints CHANGE interaction_type_id interactiontype_id INT NOT NULL');
        $this->addSql('ALTER TABLE int_type_tag_contraints ADD CONSTRAINT FK_109E44E4CAC6DF8F FOREIGN KEY (interactiontype_id) REFERENCES interaction_type (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_3E25DD7DCAC6DF8F ON int_type_tag_contraints (interactiontype_id)');
        $this->addSql('ALTER TABLE int_type_tag_contraints ADD PRIMARY KEY (tag_id, interactiontype_id)');
    }
}
