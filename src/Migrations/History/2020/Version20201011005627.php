<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20201011005627 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE `group` DROP FOREIGN KEY FK_A7A91E0B16FE72E1');
        $this->addSql('ALTER TABLE `group` DROP FOREIGN KEY FK_A7A91E0BDE12AB56');
        $this->addSql('ALTER TABLE `group` CHANGE ui_levels ui_ranks VARCHAR(255) NOT NULL');
        $this->addSql('DROP INDEX uniq_fa96dbda989d9b62 ON `group`');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_6DC044C5989D9B62 ON `group` (slug)');
        $this->addSql('DROP INDEX idx_fa96dbdade12ab56 ON `group`');
        $this->addSql('CREATE INDEX IDX_6DC044C5DE12AB56 ON `group` (created_by)');
        $this->addSql('DROP INDEX idx_fa96dbda16fe72e1 ON `group`');
        $this->addSql('CREATE INDEX IDX_6DC044C516FE72E1 ON `group` (updated_by)');
        $this->addSql('ALTER TABLE `group` ADD CONSTRAINT FK_A7A91E0B16FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE `group` ADD CONSTRAINT FK_A7A91E0BDE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE group_root DROP FOREIGN KEY FK_6E0C1D559DFF5F89');
        $this->addSql('DROP INDEX IDX_6E0C1D559DFF5F89 ON group_root');
        $this->addSql('ALTER TABLE group_root DROP FOREIGN KEY FK_6E0C1D5516FE72E1');
        $this->addSql('ALTER TABLE group_root DROP FOREIGN KEY FK_6E0C1D55DE12AB56');
        $this->addSql('ALTER TABLE group_root DROP FOREIGN KEY FK_6E0C1D55DE13F470');
        $this->addSql('ALTER TABLE group_root CHANGE realm_id group_id INT NOT NULL');
        $this->addSql('ALTER TABLE group_root ADD CONSTRAINT FK_3FAEA22BFE54D947 FOREIGN KEY (group_id) REFERENCES `group` (id)');
        $this->addSql('CREATE INDEX IDX_3FAEA22BFE54D947 ON group_root (group_id)');
        $this->addSql('DROP INDEX uniq_6e0c1d55de13f470 ON group_root');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_3FAEA22BDE13F470 ON group_root (taxon_id)');
        $this->addSql('DROP INDEX idx_6e0c1d55de12ab56 ON group_root');
        $this->addSql('CREATE INDEX IDX_3FAEA22BDE12AB56 ON group_root (created_by)');
        $this->addSql('DROP INDEX idx_6e0c1d5516fe72e1 ON group_root');
        $this->addSql('CREATE INDEX IDX_3FAEA22B16FE72E1 ON group_root (updated_by)');
        $this->addSql('ALTER TABLE group_root ADD CONSTRAINT FK_6E0C1D5516FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE group_root ADD CONSTRAINT FK_6E0C1D55DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE group_root ADD CONSTRAINT FK_6E0C1D55DE13F470 FOREIGN KEY (taxon_id) REFERENCES taxon (id)');
        $this->addSql('ALTER TABLE rank DROP FOREIGN KEY FK_9AEACC1316FE72E1');
        $this->addSql('ALTER TABLE rank DROP FOREIGN KEY FK_9AEACC13DE12AB56');
        $this->addSql('DROP INDEX idx_9aeacc13de12ab56 ON rank');
        $this->addSql('CREATE INDEX IDX_8879E8E5DE12AB56 ON rank (created_by)');
        $this->addSql('DROP INDEX idx_9aeacc1316fe72e1 ON rank');
        $this->addSql('CREATE INDEX IDX_8879E8E516FE72E1 ON rank (updated_by)');
        $this->addSql('ALTER TABLE rank ADD CONSTRAINT FK_9AEACC1316FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE rank ADD CONSTRAINT FK_9AEACC13DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE taxon DROP FOREIGN KEY FK_5B6723AB5FB14BA7');
        $this->addSql('DROP INDEX IDX_5B6723AB5FB14BA7 ON taxon');
        $this->addSql('ALTER TABLE taxon CHANGE level_id rank_id INT NOT NULL');
        $this->addSql('ALTER TABLE taxon ADD CONSTRAINT FK_5B6723AB7616678F FOREIGN KEY (rank_id) REFERENCES rank (id)');
        $this->addSql('CREATE INDEX IDX_5B6723AB7616678F ON taxon (rank_id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE `group` DROP FOREIGN KEY FK_6DC044C5DE12AB56');
        $this->addSql('ALTER TABLE `group` DROP FOREIGN KEY FK_6DC044C516FE72E1');
        $this->addSql('ALTER TABLE `group` CHANGE ui_ranks ui_levels VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`');
        $this->addSql('DROP INDEX idx_6dc044c516fe72e1 ON `group`');
        $this->addSql('CREATE INDEX IDX_FA96DBDA16FE72E1 ON `group` (updated_by)');
        $this->addSql('DROP INDEX uniq_6dc044c5989d9b62 ON `group`');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_FA96DBDA989D9B62 ON `group` (slug)');
        $this->addSql('DROP INDEX idx_6dc044c5de12ab56 ON `group`');
        $this->addSql('CREATE INDEX IDX_FA96DBDADE12AB56 ON `group` (created_by)');
        $this->addSql('ALTER TABLE `group` ADD CONSTRAINT FK_6DC044C5DE12AB56 FOREIGN KEY (created_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE `group` ADD CONSTRAINT FK_6DC044C516FE72E1 FOREIGN KEY (updated_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE group_root DROP FOREIGN KEY FK_3FAEA22BFE54D947');
        $this->addSql('DROP INDEX IDX_3FAEA22BFE54D947 ON group_root');
        $this->addSql('ALTER TABLE group_root DROP FOREIGN KEY FK_3FAEA22BDE13F470');
        $this->addSql('ALTER TABLE group_root DROP FOREIGN KEY FK_3FAEA22BDE12AB56');
        $this->addSql('ALTER TABLE group_root DROP FOREIGN KEY FK_3FAEA22B16FE72E1');
        $this->addSql('ALTER TABLE group_root CHANGE group_id realm_id INT NOT NULL');
        $this->addSql('ALTER TABLE group_root ADD CONSTRAINT FK_6E0C1D559DFF5F89 FOREIGN KEY (realm_id) REFERENCES `group` (id)');
        $this->addSql('CREATE INDEX IDX_6E0C1D559DFF5F89 ON group_root (realm_id)');
        $this->addSql('DROP INDEX idx_3faea22bde12ab56 ON group_root');
        $this->addSql('CREATE INDEX IDX_6E0C1D55DE12AB56 ON group_root (created_by)');
        $this->addSql('DROP INDEX uniq_3faea22bde13f470 ON group_root');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_6E0C1D55DE13F470 ON group_root (taxon_id)');
        $this->addSql('DROP INDEX idx_3faea22b16fe72e1 ON group_root');
        $this->addSql('CREATE INDEX IDX_6E0C1D5516FE72E1 ON group_root (updated_by)');
        $this->addSql('ALTER TABLE group_root ADD CONSTRAINT FK_3FAEA22BDE13F470 FOREIGN KEY (taxon_id) REFERENCES taxon (id)');
        $this->addSql('ALTER TABLE group_root ADD CONSTRAINT FK_3FAEA22BDE12AB56 FOREIGN KEY (created_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE group_root ADD CONSTRAINT FK_3FAEA22B16FE72E1 FOREIGN KEY (updated_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE rank DROP FOREIGN KEY FK_8879E8E5DE12AB56');
        $this->addSql('ALTER TABLE rank DROP FOREIGN KEY FK_8879E8E516FE72E1');
        $this->addSql('DROP INDEX idx_8879e8e5de12ab56 ON rank');
        $this->addSql('CREATE INDEX IDX_9AEACC13DE12AB56 ON rank (created_by)');
        $this->addSql('DROP INDEX idx_8879e8e516fe72e1 ON rank');
        $this->addSql('CREATE INDEX IDX_9AEACC1316FE72E1 ON rank (updated_by)');
        $this->addSql('ALTER TABLE rank ADD CONSTRAINT FK_8879E8E5DE12AB56 FOREIGN KEY (created_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE rank ADD CONSTRAINT FK_8879E8E516FE72E1 FOREIGN KEY (updated_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE taxon DROP FOREIGN KEY FK_5B6723AB7616678F');
        $this->addSql('DROP INDEX IDX_5B6723AB7616678F ON taxon');
        $this->addSql('ALTER TABLE taxon CHANGE rank_id level_id INT NOT NULL');
        $this->addSql('ALTER TABLE taxon ADD CONSTRAINT FK_5B6723AB5FB14BA7 FOREIGN KEY (level_id) REFERENCES rank (id)');
        $this->addSql('CREATE INDEX IDX_5B6723AB5FB14BA7 ON taxon (level_id)');
    }
}
