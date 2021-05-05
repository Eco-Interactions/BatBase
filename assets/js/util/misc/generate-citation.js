/**
 * Auto-generates citation text for the citation forms and for the auto-updates
 * when any changes are made to related citation data (ie: author, publication, etc).
 *
 * Export
 *     generateCitationText
 */
import { _alert, _u } from '~util';
/**
 * All data needed to generate the citation.
 * {obj} cit            Citation detail-entity data
 * {obj} citSrc         Citation source data
 * {obj} citationType   Citation-type data
 * {obj} pubSrc         Publication source data
 * {obj} rcrds          {author, citation, publisher, source} Records by id
 * {str} type           Citation-type displayNameZ
 * {bol} showWarnings   Shows text warning editor to fill in missing data.
 */
let d = {};
/** Generates the citation text for the passed citation type. */
export function generateCitationText(data) {                        /*dbug-log*///console.log('+--generateCitationText data[%O]', data);
    d = data;
    d.type = d.cit.citationType.displayName;                        /*dbug-log*///console.log("   --type[%s]", d.type);
    const buildCitationText = getTypeCitationGenerator(d.type)
    return buildCitationText(d.type);
}
function getTypeCitationGenerator(type) {
    const map = {
        Article: buildArticleCite,
        Book: buildBookCite,
        Chapter: buildChapterCite,
        'Ph.D. Dissertation': buildDissertThesisCite,
        Other: buildOtherCite,
        Report: buildOtherCite,
        "Master's Thesis": buildDissertThesisCite,
        'Museum record': buildOtherCite
    };
    return map[type];
}
/**
 * Articles, Museum records, etc.
 * Citation example with all data available:
 *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author
 *     [Initials. Last]. Year. Title of article. Title of Journal
 *     Volume (Issue): Pages.
 */
function  buildArticleCite(type) {
    const athrs = getCitAuthors();
    const year = d.citSrc.year;
    const title = _u('stripString', [d.cit.title]);
    const pub = _u('stripString', [d.pubSrc.displayName]);
    const vip = getCiteVolumeIssueAndPages();
    let fullText = [athrs, year, title].map(addPunc).join(' ')+' ';
    fullText += vip ? (pub+' '+vip) : pub;
    return fullText + '.';
}
/**
 * Citation example with all data available:
 *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author
 *     [Initials. Last]. Year. Book Title (Editor 1 [initials, last name],
 *      & Editor X [initials, last name], eds.). Edition. Publisher Name,
 *      City, Country.
 */
function buildBookCite(type) {
    const athrs = getPubSrcAuthors() || getCitAuthors();
    const year = d.pubSrc.year;
    const titlesAndEds = getCitTitlesAndEditors();
    const ed = d.cit.publicationVolume;
    const pages = getCitBookPages();
    const publ = buildPublString(d.pubSrc) || ifWarning('[NEEDS PUBLISHER DATA]');
    const allFields = [athrs, year, titlesAndEds, ed, pages, publ];
    return allFields.filter(f=>f).map(addPunc).join(' ');
}
/**
 * Citation example with all data available:
 *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author
 *     [Initials. Last]. Year. Chapter Title. In: Book Title (Editor 1
 *     [initials, last name], & Editor X [initials, last name], eds.).
 *     pp. pages. Publisher Name, City, Country.
 */
function buildChapterCite(type) {
    const athrs = getPubSrcAuthors() || getCitAuthors();
    const year = d.pubSrc.year;
    const titlesAndEds = getCitTitlesAndEditors();
    const pages = getCitBookPages();
    const publ = buildPublString(d.pubSrc) || ifWarning('[NEEDS PUBLISHER DATA]');
    const allFields = [athrs, year, titlesAndEds, pages, publ];
    return allFields.filter(f => f).join('. ')+'.';
}
/**
 * Citation example with all data available:
 *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author
 *     [Initials. Last]. Year. Title.  Academic degree. Academic
 *     Institution, City, Country.
 */
function buildDissertThesisCite(type) {
    const athrs = getPubSrcAuthors();
    const year = d.pubSrc.year;
    const title = _u('stripString', [d.cit.title]);
    const degree = type === "Master's Thesis" ? 'M.S. Thesis' : type;
    const publ = buildPublString(d.pubSrc) || ifWarning('[NEEDS PUBLISHER DATA]');
    return [athrs, year, title, degree, publ].join('. ')+'.';
}
/**
 * Citation example with all data available:
 *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author
 *     [Initials. Last]. Year. Title. Volume (Issue): Pages. Publisher
 *     Name, City, Country.
 */
function buildOtherCite(type) {
    const athrs = getCitAuthors() || getPubSrcAuthors();
    const year = d.citSrc.year ? d.citSrc.year : d.pubSrc.year;
    const title = _u('stripString', [d.cit.title]);
    const vip = getCiteVolumeIssueAndPages();
    const publ = buildPublString(d.pubSrc);
    return [athrs, year, title, vip, publ].filter(f=>f).join('. ') +'.';
}
    /** ---------- citation full text helpers ----------------------- */
function getCitBookPages(argument) {
    if (!d.cit.publicationPages) { return false; }
    return 'pp. ' + _u('stripString', [d.cit.publicationPages]);
}
function getCitAuthors() {
    const auths = d.citSrc.authors;                               /*dbug-log*///console.log('auths = %O', auths);
    if (!Object.keys(auths).length) { return false; }
    return getFormattedAuthorNames(auths, null);
}
function getPubSrcAuthors() {
    const auths = d.pubSrc.authors;
    if (!auths) { return false; }
    return getFormattedAuthorNames(auths, null);
}
function getPubEditors() {
    const eds = d.pubSrc.editors;
    if (!eds) { return false }
    const names = getFormattedAuthorNames(eds, true);
    const edStr = Object.keys(eds).length > 1 ? ', eds.' : ', ed.';
    return '('+ names + edStr + ')';
}
/**
 * Returns: Chapter title. In: Publication title [if there are editors,
 * they are added in parentheses here.].
 */
function getCitTitlesAndEditors() {
    const chap = d.type === 'Chapter' ? _u('stripString', [d.cit.title]) : false;
    const pub = _u('stripString', [d.pubSrc.displayName]);
    const titles = chap ? (chap + '. In: ' + pub) : pub;
    const eds = getPubEditors();
    return eds ? (titles + ' ' + eds) : titles;
}
/**
 * Formats volume, issue, and page range data and returns either:
 *     Volume (Issue): pag-es || Volume (Issue) || Volume: pag-es ||
 *     Volume || (Issue): pag-es || Issue || pag-es || null
 * Note: all possible returns wrapped in parentheses.
 */
function getCiteVolumeIssueAndPages() {
    const iss = d.cit.publicationIssue ? '('+d.cit.publicationIssue+')' : null;
    const vol = d.cit.publicationVolume ? d.cit.publicationVolume : null;
    const pgs = d.cit.publicationPages ? d.cit.publicationPages : null;
    return vol && iss && pgs ? (vol+' '+iss+': '+pgs) :
        vol && iss ? (vol+' '+iss) : vol && pgs ? (vol+': '+pgs) :
            vol ? (vol) : iss && pgs ? (iss+': '+pgs) : iss ? (iss) :
                pgs ? (pgs) : (null);
}

/** ======================= FORMAT PUBLISHER ================================ */
/** Formats publisher data and returns the Name, City, Country. */
function buildPublString(pubSrc) {
    const publ = getPublisher(pubSrc);
    if (!publ) { return false; }
    const name = publ.displayName;
    const city = publ.city ? publ.city : ifWarning('[ADD CITY]');
    const cntry = publ.country ? publ.country : ifWarning('[ADD COUNTRY]');
    return [name, city, cntry].join(', ');

    function getPublisher(pubSrc) {
        if (!pubSrc.parent) { return false; }
        const publSrc = d.rcrds.source[pubSrc.parent];
        return d.rcrds.publisher[publSrc.publisher];
    }
}
/* =================== FORMAT AUTHOR|EDITOR ================================= */
/**
 * Returns a string with all author names formatted with the first author
 * [Last, Initials.], all following authors as [Initials. Last], and each
 * are seperated by commas until the final author, which is seperated
 * with '&'. If the names are of editors, they are returned [Initials. Last].
 * If >= 4 authors, returns first author [Last, Initials.] + ', et al';
 */
function getFormattedAuthorNames(auths, eds) {                      /*dbug-log*///console.log('getFormattedAuthorNames. auths = %O, eds [%s]', _u('snapshot', [auths]), eds);
    if (Object.keys(auths).length > 3) { return getFirstAuthorEtAl(auths[1], eds); }
    let athrs = '';
    for (let ord in auths) {
        if (auths[ord] === 'create') { continue; }
        const name = getFormattedName(ord, auths[ord], eds);
        athrs += getAuthorName(name, ord, Object.keys(auths).length);
    }
    return _u('stripString', [athrs]);
}
/* ------------------- FIRST AUTHOR ET ALL ---------------------------------- */
function getFirstAuthorEtAl(authId, eds) {
    const name = getFormattedName(1, authId, eds);
    return name +', et al';
}
/* ----------------------- FORMAT NAME -------------------------------------- */
function getFormattedName(i, srcId, eds) {                          /*dbug-log*///console.log('getFormattedName cnt[%s] id[%s]', i, srcId);
    const src = d.rcrds.source[srcId];
    const athrId = src[_u('lcfirst', [src.sourceType.displayName])];
    const athr = d.rcrds.author[athrId];
    return getCitAuthName(i, athr, eds);
}
/**
 * Returns the last name and initials of the passed author. The first
 * author is formatted [Last, Initials.] and all others [Initials. Last].
 * If editors (eds), [Initials. Last].
 */
function getCitAuthName(cnt, a, eds) {                              /*dbug-log*///console.log('getCitAuthName. cnt[%s], auth = %O, eds?[%s] ', cnt, a, eds);
    const last = a.lastName;
    const initials = ['firstName', 'middleName'].map(getInitial).filter(i=>i).join(' ');
    return cnt > 1 || eds ? initials +' '+ last : last+', '+initials;

    function getInitial(name) {
        return a[name] ? a[name].charAt(0)+'.' : null;
    }
}
function getAuthorName(name, ord, authCnt) {
    return ord == 1 ? name : (ord != authCnt ? ', '+ name : ' & '+ name);
}
/** ======================== HELPERS ======================================== */
/** Handles adding the punctuation for the data in the citation. */
function addPunc(data) {
    return /[.!?,;:]$/.test(data) ? data : data+'.';
}
function ifWarning(warningTxt) {
    return d.showWarnings ? warningTxt : '';
}