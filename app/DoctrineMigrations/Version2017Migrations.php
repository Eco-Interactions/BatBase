<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Not a functional migration. Documents migrations made in 2016.
 */
class Version2017Migrations extends AbstractMigration
{
    /**
     * 20170109113942HabTypes - Creates the missing Habitat Types.
     * 20170115151240Tag - Updated tag field and Source relationship.
     * 20170117171242SourceTags - Moves all citation tags to their source entity.
     * 20170120233642Author - Updates all Author Source's display names.
     * 20170123180120Names - Changes all "name" fields to "display name"s.
     * 20170203170024SystemDate - Creates a systemDate for each entity expected 
     *      to be modified during data entry/edit.
     * 20170405200118Countries - Creates a Location entity for each new country.
     * 20170509184031Abstract - Adds an abstract field to Citation
     * 20170517181831UnspecifiedRegion - Adds interactions without locations to 
     *      an 'Unspecified' region and creates all the hab type combos.
     * 20170518210100TypeAdditions - Adds various Location and Citation Types. 
     * 20170713015904LocHabs - Adds each possible Country/Region-HabType location
     * 20170715165522SrcData - Fixes some misc Source data. 
     * 20170716232015LocData - Fixes some misc Location data. 
     * 20170724212122AddSuffix - Adds a 'Suffix' field to the Author Entity.
     * 20170724232513AuthNames - Adds missing Author name data.
     * 20170725183034MoveData - Moves interactions and data from redundant entities. 
     * 20170725215243RmvSrcs - Removes redundant sources and related detail entities.
     * 20171117172039Realm - Renames the Domain entity to Realm, and related changes. 
     * 20171118002328SecondaryTags - Moves the 'secondary' tag from the Citations 
     *      to the Interactions attributed to those Citations.
     * 20171122163558AuthDisplay - Author display names = [Last, First Middle Suff]
     * 20171231001839SrcFields - Adds and arranges city and country Source fields
     *
     *
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // See full migrations in 2017 directory
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
