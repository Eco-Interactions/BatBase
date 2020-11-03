/**
 * Loads site statistics relevant to the current page.
 *
 * Export
 * 	initHeaderStats
 *
 * TOC
 * 		INIT STAT HEADER
 * 		LOAD STAT HEADER
 */
import { sendAjaxQuery } from '~util';

/** @type {Object} Page URL (k) statdata-set key (v) */
const pageStatKeys = {
	'about': 'project',
	'db': 'db',
	'home': 'core',
	'register': 'all',
	'search': 'db'
};
/** @type {Object} Data-set key (k) loadHeaderData (v) */
const loadHeaderData = {
	'all': loadAllDatabaseHeaderStats,
	'core': loadCoreDatabaseHeaderStats,
	'db': loadFullDatabaseHeaderStats,
	'project': loadAboutProjectHeaderStats
}
/* ------------------------ INIT STAT HEADER -------------------------------- */
export default function initHeaderStats(pgPath) {
	const pg = pgPath || 'home';
	if (!ifPgHasStatistics(pg)) { return }
	sendAjaxQuery({tag: pageStatKeys[pg]}, 'stats/', loadPageHeaderStatistics);

	function loadPageHeaderStatistics(data, textStatus, jqXHR) {  				//console.log('loadPageHeaderStatistics. args = %O', arguments);
		loadHeaderData[pageStatKeys[pg]](data);
	}
}
function ifPgHasStatistics(pg) {
	return Object.keys(pageStatKeys).indexOf(pg) !== -1;
}
/* ------------------------ LOAD STAT HEADER -------------------------------- */
function updateHeaderStats(counts) {
	const statString = counts.join(' | ');
	$('#hdr-stats').empty().append(statString);
}
function loadAllDatabaseHeaderStats(data) {  console.log('load all?')
	const intCnt = `${data.ints} Interactions`;
	const batCnt = `${data.bats} Bat Species`;
	const otherCnt = `${data.nonBats} Other Species`;
	const citCnt = `${data.cits}  Citations`;
	const locCnt = `${data.locs} Locations in ${data.cntries} Countries`;
	const usrCnt = `${data.usr} Users`;
	const edtrCnt = `${data.editor} Editors`;
	updateHeaderStats([intCnt, batCnt, otherCnt, citCnt, locCnt, usrCnt, edtrCnt, 'Est. 2002']);
}
/* ------------------ HOME ------------------------- */
function loadCoreDatabaseHeaderStats(data) {
	const intCnt = `${data.ints} Interactions`;
	const batCnt = `${data.bats} Bat Species`;
	const citCnt = `${data.cits}  Citations`;
	const locCnt = `${data.locs} Locations in ${data.cntries} Countries`;
	updateHeaderStats([intCnt, batCnt, citCnt, locCnt]);
}
/* -------------- ABOUT PROJECT --------------------- */
function loadAboutProjectHeaderStats(data) {
	const usrCnt = `${data.usr} Users`;
	const edtrCnt = `${data.editor} Editors`;
	updateHeaderStats([usrCnt, edtrCnt, 'Est. 2002']);
}
/* -------------- ABOUT DATABASE --------------------- */
function loadFullDatabaseHeaderStats(data) {
	const intCnt = `${data.ints} Interactions`;
	const batCnt = `${data.bats} Bat Species`;
	const otherCnt = `${data.nonBats} Other Species`;
	const citCnt = `${data.cits}  Citations`;
	const locCnt = `${data.locs} Locations in ${data.cntries} Countries`;
	updateHeaderStats([intCnt, batCnt, otherCnt, citCnt, locCnt]);
}