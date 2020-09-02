/**
 * Loads site statistics relevant to the current page.
 *
 * Exports
 * 	initHeaderStats
 *
 *
 * TOC
 * 		INIT STAT HEADER
 * 		LOAD STAT HEADER
 *
 */
import { sendAjaxQuery } from '../util/util-main.js';

let pg;
/* ------------------------ INIT STAT HEADER -------------------------------- */
export default function initHeaderStats(pgPath) {
	pg = pgPath || 'home';
	if (!ifPgHasStatistics()) { return }
	sendAjaxQuery({pg: pg}, 'stats/', loadPageHeaderStatistics);
}
function ifPgHasStatistics() {
    const hasStats = ['home', 'about', 'db'];
    return hasStats.indexOf(pg) !== -1;
}
/* ------------------------ LOAD STAT HEADER -------------------------------- */
function loadPageHeaderStatistics(data, textStatus, jqXHR) {  					console.log('loadPageHeaderStatistics. args = %O', arguments);
	const map = {
		'about': loadAboutProjectPageHeaderStats,
		'db': loadAboutDatabasePageHeaderStats,
		'home': loadHomePageHeaderStats,
	};
	map[pg](data);
}
function updateHeaderStats(counts) {
	const statString = counts.join(' | ');
	$('#hdr-stats').empty().append(statString);
}
/* ------------------ HOME ------------------------- */
function loadHomePageHeaderStats(data) {
	const intCnt = `${data.ints} Interactions`;
	const batCnt = `${data.bats} Bat Species`;
	const citCnt = `${data.cits}  Citations`;
	const locCnt = `${data.locs} Locations in ${data.cntries} Countries`;
	updateHeaderStats([intCnt, batCnt, citCnt, locCnt]);
}
/* -------------- ABOUT PROJECT --------------------- */
function loadAboutProjectPageHeaderStats(data) {
	const usrCnt = `${data.usr} Users`;
	const edtrCnt = `${data.editor} Editors`;
	updateHeaderStats([usrCnt, edtrCnt, 'Est. 2002']);
}
/* -------------- ABOUT DATABASE --------------------- */
function loadAboutDatabasePageHeaderStats(data) {
	const intCnt = `${data.ints} Interactions`;
	const batCnt = `${data.bats} Bat Species`;
	const otherCnt = `${data.nonBats} Other Species`;
	const citCnt = `${data.cits}  Citations`;
	const locCnt = `${data.locs} Locations in ${data.cntries} Countries`;
	updateHeaderStats([intCnt, batCnt, otherCnt, citCnt, locCnt]);
}