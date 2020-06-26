<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Renames the Domain entity to Realm. 
 * Combined two auto-generated migrations. The first changed all 'domain' references
 * to 'realm'. I then renamed the table and auto-generated a second migration to 
 * update all references and keys within the table. I combined the two migrations here.
 */
class Version20171117172039Realm extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE user DROP locked, DROP expired, DROP expires_at, DROP credentials_expired, DROP credentials_expire_at, CHANGE username username VARCHAR(180) NOT NULL, CHANGE username_canonical username_canonical VARCHAR(180) NOT NULL, CHANGE email email VARCHAR(180) NOT NULL, CHANGE email_canonical email_canonical VARCHAR(180) NOT NULL, CHANGE salt salt VARCHAR(255) DEFAULT NULL, CHANGE confirmation_token confirmation_token VARCHAR(180) DEFAULT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649C05FB297 ON user (confirmation_token)');
        $this->addSql('ALTER TABLE citation DROP FOREIGN KEY FK_FABD9C7EC54C8C93');
        $this->addSql('DROP INDEX idx_fabd9c7ec54c8c93 ON citation');
        $this->addSql('CREATE INDEX IDX_FABD9C7EF62A4E31 ON citation (cit_type_id)');
        $this->addSql('ALTER TABLE citation ADD CONSTRAINT FK_FABD9C7EC54C8C93 FOREIGN KEY (cit_type_id) REFERENCES citation_type (id)');
        $this->addSql('ALTER TABLE int_type_tag_contraints DROP FOREIGN KEY FK_109E44E4BAD26311');
        $this->addSql('ALTER TABLE int_type_tag_contraints DROP FOREIGN KEY FK_109E44E4CAC6DF8F');
        $this->addSql('DROP INDEX idx_109e44e4bad26311 ON int_type_tag_contraints');
        $this->addSql('CREATE INDEX IDX_3E25DD7DBAD26311 ON int_type_tag_contraints (tag_id)');
        $this->addSql('DROP INDEX idx_109e44e4cac6df8f ON int_type_tag_contraints');
        $this->addSql('CREATE INDEX IDX_3E25DD7DCAC6DF8F ON int_type_tag_contraints (interactiontype_id)');
        $this->addSql('ALTER TABLE int_type_tag_contraints ADD CONSTRAINT FK_109E44E4BAD26311 FOREIGN KEY (tag_id) REFERENCES tag (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE int_type_tag_contraints ADD CONSTRAINT FK_109E44E4CAC6DF8F FOREIGN KEY (interactiontype_id) REFERENCES interaction_type (id) ON DELETE CASCADE');

        $this->addSql('ALTER TABLE realm DROP FOREIGN KEY FK_A7A91E0B16FE72E1');
        $this->addSql('ALTER TABLE realm DROP FOREIGN KEY FK_A7A91E0BDE12AB56');
        $this->addSql('ALTER TABLE realm DROP FOREIGN KEY FK_A7A91E0BDE13F470');
        $this->addSql('DROP INDEX uniq_a7a91e0b989d9b62 ON realm');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_FA96DBDA989D9B62 ON realm (slug)');
        $this->addSql('DROP INDEX uniq_a7a91e0bde13f470 ON realm');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_FA96DBDADE13F470 ON realm (taxon_id)');
        $this->addSql('DROP INDEX idx_a7a91e0bde12ab56 ON realm');
        $this->addSql('CREATE INDEX IDX_FA96DBDADE12AB56 ON realm (created_by)');
        $this->addSql('DROP INDEX idx_a7a91e0b16fe72e1 ON realm');
        $this->addSql('CREATE INDEX IDX_FA96DBDA16FE72E1 ON realm (updated_by)');
        $this->addSql('ALTER TABLE realm ADD CONSTRAINT FK_A7A91E0B16FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE realm ADD CONSTRAINT FK_A7A91E0BDE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE realm ADD CONSTRAINT FK_A7A91E0BDE13F470 FOREIGN KEY (taxon_id) REFERENCES taxon (id)');

    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE realm DROP FOREIGN KEY FK_FA96DBDADE13F470');
        $this->addSql('ALTER TABLE realm DROP FOREIGN KEY FK_FA96DBDADE12AB56');
        $this->addSql('ALTER TABLE realm DROP FOREIGN KEY FK_FA96DBDA16FE72E1');
        $this->addSql('DROP INDEX uniq_fa96dbda989d9b62 ON realm');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_A7A91E0B989D9B62 ON realm (slug)');
        $this->addSql('DROP INDEX uniq_fa96dbdade13f470 ON realm');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_A7A91E0BDE13F470 ON realm (taxon_id)');
        $this->addSql('DROP INDEX idx_fa96dbdade12ab56 ON realm');
        $this->addSql('CREATE INDEX IDX_A7A91E0BDE12AB56 ON realm (created_by)');
        $this->addSql('DROP INDEX idx_fa96dbda16fe72e1 ON realm');
        $this->addSql('CREATE INDEX IDX_A7A91E0B16FE72E1 ON realm (updated_by)');
        $this->addSql('ALTER TABLE realm ADD CONSTRAINT FK_FA96DBDADE13F470 FOREIGN KEY (taxon_id) REFERENCES taxon (id)');
        $this->addSql('ALTER TABLE realm ADD CONSTRAINT FK_FA96DBDADE12AB56 FOREIGN KEY (created_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE realm ADD CONSTRAINT FK_FA96DBDA16FE72E1 FOREIGN KEY (updated_by) REFERENCES `user` (id)');

        $this->addSql('ALTER TABLE citation DROP FOREIGN KEY FK_FABD9C7EF62A4E31');
        $this->addSql('DROP INDEX idx_fabd9c7ef62a4e31 ON citation');
        $this->addSql('CREATE INDEX IDX_FABD9C7EC54C8C93 ON citation (cit_type_id)');
        $this->addSql('ALTER TABLE citation ADD CONSTRAINT FK_FABD9C7EF62A4E31 FOREIGN KEY (cit_type_id) REFERENCES citation_type (id)');
        $this->addSql('ALTER TABLE int_type_tag_contraints DROP FOREIGN KEY FK_3E25DD7DBAD26311');
        $this->addSql('ALTER TABLE int_type_tag_contraints DROP FOREIGN KEY FK_3E25DD7DCAC6DF8F');
        $this->addSql('DROP INDEX idx_3e25dd7dbad26311 ON int_type_tag_contraints');
        $this->addSql('CREATE INDEX IDX_109E44E4BAD26311 ON int_type_tag_contraints (tag_id)');
        $this->addSql('DROP INDEX idx_3e25dd7dcac6df8f ON int_type_tag_contraints');
        $this->addSql('CREATE INDEX IDX_109E44E4CAC6DF8F ON int_type_tag_contraints (interactiontype_id)');
        $this->addSql('ALTER TABLE int_type_tag_contraints ADD CONSTRAINT FK_3E25DD7DBAD26311 FOREIGN KEY (tag_id) REFERENCES tag (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE int_type_tag_contraints ADD CONSTRAINT FK_3E25DD7DCAC6DF8F FOREIGN KEY (interactiontype_id) REFERENCES interaction_type (id) ON DELETE CASCADE');
        $this->addSql('DROP INDEX UNIQ_8D93D649C05FB297 ON `user`');
        $this->addSql('ALTER TABLE `user` ADD locked TINYINT(1) NOT NULL, ADD expired TINYINT(1) NOT NULL, ADD expires_at DATETIME DEFAULT NULL, ADD credentials_expired TINYINT(1) NOT NULL, ADD credentials_expire_at DATETIME DEFAULT NULL, CHANGE username username VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci, CHANGE username_canonical username_canonical VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci, CHANGE email email VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci, CHANGE email_canonical email_canonical VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci, CHANGE salt salt VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci, CHANGE confirmation_token confirmation_token VARCHAR(255) DEFAULT NULL COLLATE utf8_unicode_ci');
    }
}
