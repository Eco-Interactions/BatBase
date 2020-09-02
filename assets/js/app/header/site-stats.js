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
		'home': loadHomePageHeaderStats
	};
	map[pg](data);
}
function loadHomePageHeaderStats(data) {
	const intCnt = `${data.ints} Interactions`;
	const batCnt = `${data.bats} Bat Species`;
	const citCnt = `${data.cits}  Citations`;
	const locCnt = `${data.locs} Locations in ${data.cntries} Countries`;
	const statString = [intCnt, batCnt, citCnt, locCnt].join(' | ');
	$('#hdr-stats').empty().append(statString);
}