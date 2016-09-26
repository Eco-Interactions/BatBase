<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use AppBundle\Entity\LocationType;

/**
 * Migration adds location parent self-join and LocationType entity. 
 */
class Version20160809221825 extends AbstractMigration implements ContainerAwareInterface
{

    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE location_type (id INT AUTO_INCREMENT NOT NULL, created_by INT DEFAULT NULL, updated_by INT DEFAULT NULL, slug VARCHAR(128) DEFAULT NULL, name VARCHAR(255) NOT NULL, created DATETIME NOT NULL, updated DATETIME NOT NULL, UNIQUE INDEX UNIQ_CDAE269989D9B62 (slug), INDEX IDX_CDAE269DE12AB56 (created_by), INDEX IDX_CDAE26916FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE location_type ADD CONSTRAINT FK_CDAE269DE12AB56 FOREIGN KEY (created_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE location_type ADD CONSTRAINT FK_CDAE26916FE72E1 FOREIGN KEY (updated_by) REFERENCES user (id)');
        $this->addSql('ALTER TABLE location ADD parent_loc_id INT DEFAULT NULL, ADD location_type_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE location ADD CONSTRAINT FK_5E9E89CB2A160917 FOREIGN KEY (parent_loc_id) REFERENCES location (id)');
        $this->addSql('ALTER TABLE location ADD CONSTRAINT FK_5E9E89CB2B099F37 FOREIGN KEY (location_type_id) REFERENCES location_type (id)');
        $this->addSql('CREATE INDEX IDX_5E9E89CB2A160917 ON location (parent_loc_id)');
        $this->addSql('CREATE INDEX IDX_5E9E89CB2B099F37 ON location (location_type_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE location DROP FOREIGN KEY FK_5E9E89CB2B099F37');
        $this->addSql('ALTER TABLE location DROP FOREIGN KEY FK_5E9E89CB2A160917');
        $this->addSql('DROP TABLE location_type');
        $this->addSql('DROP INDEX IDX_5E9E89CB2A160917 ON location');
        $this->addSql('DROP INDEX IDX_5E9E89CB2B099F37 ON location');
        $this->addSql('ALTER TABLE location DROP parent_loc_id, DROP location_type_id');
    }

    /**
     * @param Schema $schema
     */
    public function postUp(Schema $schema)
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $em = $this->container->get('doctrine.orm.entity_manager');
        $locTypes = ['Region', 'Country', 'Habitat', 'Area', 'Point'];

        foreach ($locTypes as $locType) {    
            $entity = new LocationType();
            $entity->setName($locType);

            $em->persist($entity);
        }
        $em->flush();
    }

}
