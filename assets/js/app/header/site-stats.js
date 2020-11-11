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
import { _u } from '~util';

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
export default function initHeaderStats() {
	const statTag = getStatTagForPage();
	if (!statTag) { return }
	_u('sendAjaxQuery', [{tag: statTag}, 'stats/', loadPageHeaderStatistics]);

	function loadPageHeaderStatistics(data, textStatus, jqXHR) {  	/*dbug-log*///console.log('loadPageHeaderStatistics. args = %O', arguments);
		loadHeaderData[statTag](data);
	}
}
function getStatTagForPage() {
	const pg = getPageName(window.location.pathname.split('/'));    /*dbug-log*///console.log('getStatTagForPage [%s] ?[%s]', pg, pageStatKeys[pg]);
	return pageStatKeys[pg];
}
function getPageName(path) {
    let pg = path.pop();
    pg = !pg ? 'home' : (path.pop() === 'register' ? 'register' : pg)
    return pg;
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