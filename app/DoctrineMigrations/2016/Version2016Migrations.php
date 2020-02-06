<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Not a functional migration. Documents migrations made in 2016.
 */
class Version2016Migrations extends AbstractMigration
{
    /**
     * 20160614031104 - Creates DB
     * 20160809221825 - adds Location parent self-join and LocationType entity.
     * 201609221Regions - Updates existing Region Locations (-Unspecified) 
     * 201609222Countries - Updates existing Country Locations (-Unspecified)
     * 201609223Locations - Updates all remaining Locations to the new structure.
     * 201609224Drop - Drops Country, Region and Region_Location tables.
     * 201610101857190SrcStructure - Update the db into the new Source structure.
     * 201610101857191Pubs - Creates all Source Type, Publication Types, and a 
     *      new Source entity for each Publication and rearranges related data.
     * 201610101857192Authors - Creates a new Source entity for each Author.
     * 201610101857193MissingPubs - Adds a Publication parent for each Citation. 
     *      Creates a Source entity for every Publication or Publisher found. 
     * 201610101857194Citations - Creates a new Source entity for each Citation.
     * 201610101857195EdgeCases - Handles duplicate Citations.
     * 201610132028430Drop - Drops unnecessary fields and rearranges others.
     * 201610132050460Columns - Rearranges DB fields.
     * 20161216174115 - Create Citation Type table and fields.
     * 20161216175055CitTypes - Creates all Citation Types and updates Citation Sources.
     * 20161218175055FixCitations - Various Citation and Source data fixes.
     * 
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // See full migrations in 2016 directory
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
