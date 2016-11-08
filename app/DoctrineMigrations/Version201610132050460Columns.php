<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version201610132050460Columns extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        //http://stackoverflow.com/questions/19220902/alter-table-error-code-1834
        $this->addSql('SET FOREIGN_KEY_CHECKS=0;');

        $this->addSql('ALTER TABLE author MODIFY COLUMN source_id INT DEFAULT NULL AFTER id;');
        $this->addSql('ALTER TABLE author MODIFY COLUMN display_name VARCHAR(255) NOT NULL AFTER slug;');
        $this->addSql('ALTER TABLE author MODIFY COLUMN last_name VARCHAR(255) DEFAULT NULL AFTER display_name;');
        $this->addSql('ALTER TABLE author MODIFY COLUMN full_name VARCHAR(255) DEFAULT NULL AFTER last_name;');
        $this->addSql('ALTER TABLE author MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE author MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;');

        $this->addSql('ALTER TABLE authority MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE authority MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;');

        $this->addSql('ALTER TABLE citation MODIFY COLUMN source_id INT DEFAULT NULL AFTER id;');
        $this->addSql('ALTER TABLE citation MODIFY COLUMN display_name VARCHAR(255) DEFAULT NULL AFTER source_id;');
        $this->addSql('ALTER TABLE citation MODIFY COLUMN title VARCHAR(255) DEFAULT NULL AFTER display_name;');
        $this->addSql('ALTER TABLE citation MODIFY COLUMN publication_volume VARCHAR(255) DEFAULT NULL AFTER full_text;');
        $this->addSql('ALTER TABLE citation MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE citation MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;');   

        $this->addSql('ALTER TABLE content_block MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE content_block MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;');    
        $this->addSql('ALTER TABLE contribution MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE contribution MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;');    
        $this->addSql('ALTER TABLE domain MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE domain MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;');    
        $this->addSql('ALTER TABLE feedback MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE feedback MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;');  
        $this->addSql('ALTER TABLE habitat_type MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE habitat_type MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;');  
        $this->addSql('ALTER TABLE image_upload MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE image_upload MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;');  

        $this->addSql('ALTER TABLE interaction MODIFY COLUMN source_id INT DEFAULT NULL AFTER id;');  
        $this->addSql('ALTER TABLE interaction MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE interaction MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;');  

        $this->addSql('ALTER TABLE interaction_type MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE interaction_type MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;');  
        $this->addSql('ALTER TABLE level MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE level MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;');  

        $this->addSql('ALTER TABLE location MODIFY COLUMN parent_loc_id INT DEFAULT NULL AFTER id;');
        $this->addSql('ALTER TABLE location ADD description VARCHAR(255) DEFAULT NULL AFTER display_name');
        $this->addSql('ALTER TABLE location MODIFY COLUMN location_type_id INT DEFAULT NULL AFTER parent_loc_id;');  
        $this->addSql('ALTER TABLE location MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE location MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;');  

        $this->addSql('ALTER TABLE location_type MODIFY COLUMN ordinal INT DEFAULT NULL AFTER name;');  
        $this->addSql('ALTER TABLE location_type MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE location_type MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;');  

        $this->addSql('ALTER TABLE naming MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE naming MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;');  
        $this->addSql('ALTER TABLE naming_type MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE naming_type MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;');  

        $this->addSql('ALTER TABLE publication MODIFY COLUMN source_id INT DEFAULT NULL AFTER id;');
        $this->addSql('ALTER TABLE publication MODIFY COLUMN pub_type_id INT DEFAULT NULL AFTER source_id;');
        $this->addSql('ALTER TABLE publication MODIFY COLUMN description INT DEFAULT NULL AFTER display_name;');  
        $this->addSql('ALTER TABLE publication MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE publication MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;'); 
 
        $this->addSql('ALTER TABLE publication_type MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE publication_type MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;');   
        $this->addSql('ALTER TABLE source MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE source MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;');  
        $this->addSql('ALTER TABLE source_type MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE source_type MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;'); 

        $this->addSql('ALTER TABLE tag MODIFY COLUMN description LONGTEXT NOT NULL AFTER tag;');  
        $this->addSql('ALTER TABLE tag MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE tag MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;'); 

        $this->addSql('ALTER TABLE taxon MODIFY COLUMN display_name VARCHAR(255) NOT NULL AFTER slug;');  
        $this->addSql('ALTER TABLE taxon MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE taxon MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;'); 

        $this->addSql('ALTER TABLE taxonym MODIFY COLUMN created_by INT DEFAULT NULL AFTER created;');
        $this->addSql('ALTER TABLE taxonym MODIFY COLUMN updated_by INT DEFAULT NULL AFTER updated;'); 

        $this->addSql('ALTER TABLE user MODIFY COLUMN first_name VARCHAR(255) NOT NULL AFTER id;');
        $this->addSql('ALTER TABLE user MODIFY COLUMN last_name VARCHAR(255) NOT NULL AFTER first_name;'); 
        $this->addSql('ALTER TABLE user MODIFY COLUMN aboutMe LONGTEXT NOT NULL AFTER last_name;'); 

        $this->addSql('SET FOREIGN_KEY_CHECKS=1;');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {

    }
}
