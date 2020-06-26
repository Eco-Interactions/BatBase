<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Adds User Named table. 
 * Fixes the center point for Russia.
 */
final class Version20190503190909UserNamed extends AbstractMigration implements ContainerAwareInterface
{

    private $container;
    private $em;
    private $admin;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema) : void
    {
        $this->em = $this->container->get('doctrine.orm.entity_manager');
        $this->admin = $this->em->getRepository('App:User')->findOneBy(['id' => 6]);

        $this->createUserNamedTable();
        $this->updateCenterPoint();
    }
    private function createUserNamedTable()
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE user_named (id INT AUTO_INCREMENT NOT NULL, type VARCHAR(255) NOT NULL, display_name VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, details LONGTEXT NOT NULL, loaded DATETIME DEFAULT NULL, created DATETIME NOT NULL, created_by INT DEFAULT NULL, updated DATETIME NOT NULL, updated_by INT DEFAULT NULL, deletedAt DATETIME DEFAULT NULL, INDEX IDX_932237DFDE12AB56 (created_by), INDEX IDX_932237DF16FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE UTF8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE user_named ADD CONSTRAINT FK_932237DFDE12AB56 FOREIGN KEY (created_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE user_named ADD CONSTRAINT FK_932237DF16FE72E1 FOREIGN KEY (updated_by) REFERENCES `user` (id)');

    }
    private function updateCenterPoint()
    {
        $loc = $this->em->getRepository('App:Location')
            ->findOneBy(['displayName' => 'Russian Federation']);
        $geoJson = $loc->getGeoJson();
        $geoJson->setDisplayPoint(json_encode([105.3188, 61.5240]));
        $geoJson->setUpdatedBy($this->admin);
        $this->em->persist($geoJson);
        $this->em->flush();
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE user_named');
    }
}