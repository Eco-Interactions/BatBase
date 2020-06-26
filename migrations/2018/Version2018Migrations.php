<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Not a functional migration. Documents migrations made in 2018.
 */
class Version2018Migrations extends AbstractMigration
{
    /**
     * Version20180105200017PublSql - Adds the Publisher table. Standardizes the names of entity type columns. 
     * Version20180106023244PubSrcs - Creates a new "Publisher" entity for each Source publisher.
     * Version20180221003405Contribs - Adds 'isEditor' flag and 'ord' property to contribution entities.
     * Version20180225004259Srcs - Sets the ord property of all existing contributors and Updates the display names of citations.
     * Version20180225041911Types - Makes changes to the publication and citation types.
     * Version20180312175442MergeEntities - Data cleanup
     * Version20180404182316GeoJSON - Adds GeoJson entity and iso_code to the Location entity.
     * Version20180404194658AddGeoData - Adds the GeoJSON data downloaded from Natural Earth Data to regions & countries.  
     * Version20180522211208CenterPoints - Fills in the center_point property of country geoJson objects. 
     * Version20180522233145AddLocPoints - Creates a geoJson entity for all locations with gps data
     * Version20180911160126Misc - Removed Publisher Type code, add role to Realm entity.
     * Version20180927162956DisplayPoint - Fills in the display_point property of country geoJson objects. 
     * Version20181008000249CntryCodes - Adds iso codes for all countries.
     * Version20181009212647GeoChanges - Adds location name to each geojson entity.
     * 
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // See full migrations in 2018 directory
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');      
    }
}
