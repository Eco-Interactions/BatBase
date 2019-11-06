/**
 * Builds the citation text from the provided data. 
 *
 * Exports:                Imported by:
 *     buildCitationText            db-forms
 *     rebuildCitationText          db-forms
 */
import * as _u from '../util.js';
import { getFormValueData, getSelectedVals } from './get-form-data.js';
import { getRcrd } from './db-forms.js';

let fP;
/**
 * Generates and displays the full citation text after all required fields 
 * are filled.
 */
export function buildCitationText(params, fLvl) {
    fP = params; 
    const type = $('#CitationType-sel option:selected').text();                 //console.log("buildCitationText for [%s]", type);
    return getFormValueData(fP, 'citation', null, null).then(generateCitText); 

    function generateCitText(formVals) {                                        //console.log('generateCitText. formVals = %O', formVals);
        const builder = { 'Article': articleCit, 'Book': bookCit, 
            'Chapter': chapterCit, 'Ph.D. Dissertation': dissertThesisCit, 
            'Other': otherCit, 'Report': otherCit, 'Museum record': otherCit, 
            "Master's Thesis": dissertThesisCit };
        return builder[type](type);                                
        /**
         * Articles, Museum records, etc.
         * Citation example with all data available: 
         *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author 
         *     [Initials. Last]. Year. Title of article. Title of Journal 
         *     Volume (Issue): Pages.
         */
        function  articleCit(type) {                                      
            const athrs = getFormAuthors();
            const year = _u.stripString(formVals.year);
            const title = _u.stripString(formVals.title);
            const pub = getPublicationName();
            const vip = getVolumeIssueAndPages(); 
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
        function bookCit(type) {
            const athrs = getPubAuthors() || getFormAuthors();
            const year = getPubYear();
            const titlesAndEds = getTitlesAndEditors();
            const ed = formVals.edition;
            const pages = getBookPages();
            const publ = getPublisherData() ? getPublisherData() : '[NEEDS PUBLISHER DATA]';  
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
        function chapterCit(type) {
            const athrs = getPubAuthors() || getFormAuthors();
            const year = getPubYear();
            const titlesAndEds = getTitlesAndEditors();
            const pages = getBookPages();
            const publ = getPublisherData() ? getPublisherData() : '[NEEDS PUBLISHER DATA]';
            const allFields = [athrs, year, titlesAndEds, pages, publ]; 
            return allFields.filter(f => f).join('. ')+'.';
        }
        /**
         * Citation example with all data available: 
         *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author 
         *     [Initials. Last]. Year. Title.  Academic degree. Academic 
         *     Institution, City, Country.
         */
        function dissertThesisCit(type) {
            const athrs = getPubAuthors();
            const year = getPubYear();
            const title = _u.stripString(formVals.title);
            const degree = type === "Master's Thesis" ? 'M.S. Thesis' : type;
            const publ = getPublisherData() ? getPublisherData() : '[NEEDS PUBLISHER DATA]';
            return [athrs, year, title, degree, publ].join('. ')+'.';
        }
        /**
         * Citation example with all data available: 
         *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author 
         *     [Initials. Last]. Year. Title. Volume (Issue): Pages. Publisher 
         *     Name, City, Country.
         */
        function otherCit(type) {
            const athrs = getFormAuthors() ? getFormAuthors() : getPubAuthors();
            const year = formVals.year ? _u.stripString(formVals.year) : getPubYear();
            const title = _u.stripString(formVals.title);
            const vip = getVolumeIssueAndPages();
            const publ = getPublisherData();
            return [athrs, year, title, vip, publ].filter(f=>f).join('. ') +'.';
        }
            /** ---------- citation full text helpers ----------------------- */
        function getPubYear() {
            return _u.stripString(fP.forms[fLvl].pub.src.year);
        }
        function getPublicationName() {
            return _u.stripString(fP.forms[fLvl].pub.src.displayName);
        }
        function getBookPages(argument) {
            if (!formVals.pages) { return false; }
            return 'pp. ' + _u.stripString(formVals.pages);
        }
        function getFormAuthors(eds) { 
            const auths = getSelectedVals($('#Authors-sel-cntnr')[0]);          //console.log('auths = %O', auths);
            if (!Object.keys(auths).length) { return false; }
            return getFormattedAuthorNames(auths, eds);
        }
        function getPubAuthors() {
            const auths = fP.forms[fLvl].pub.src.authors;
            if (!auths) { return false; }
            return getFormattedAuthorNames(auths);
        }
        function getPubEditors() {
            const eds = fP.forms[fLvl].pub.src.editors;  
            if (!eds) { return false }
            const names = getFormattedAuthorNames(eds, true);
            const edStr = Object.keys(eds).length > 1 ? ', eds.' : ', ed.';
            return '('+ names + edStr + ')';
        }
        /** Formats publisher data and returns the Name, City, Country. */
        function getPublisherData() {
            return buildPublString(fP.forms[fLvl].pub.src);
        } 
        /**
         * Returns: Chapter title. In: Publication title [if there are editors,
         * they are added in parentheses here.]. 
         */
        function getTitlesAndEditors() { 
            const chap = formVals.chapterTitle ? 
                _u.stripString(formVals.chapterTitle) : false;
            const pub = _u.stripString(getPublicationName());
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
        function getVolumeIssueAndPages() {  
            const iss = formVals.issue ? '('+formVals.issue+')' : null;
            const vol = formVals.volume ? formVals.volume : null;
            const pgs = formVals.pages ? formVals.pages : null;
            return vol && iss && pgs ? (vol+' '+iss+': '+pgs) :
                vol && iss ? (vol+' '+iss) : vol && pgs ? (vol+': '+pgs) :
                    vol ? (vol) : iss && pgs ? (iss+': '+pgs) : iss ? (iss) : 
                        pgs ? (pgs) : (null);
        }
    } 
}/* End buildCitationText */

/**
 * Generates and displays the full citation text after all required fields 
 * are filled.
 */
export function rebuildCitationText(params, citSrc, cit) {
    fP = params;
    const pubSrc = getRcrd('source', citSrc.parent);                    //console.log('rebuildCitationText. citSrc = %O, cit = %O, pub = %O', citSrc, cit, pubSrc);
    const type = cit.citationType.displayName;                                  //console.log("type = ", type);
    const getFullText = { 'Article': rbldArticleCit, 'Book': rbldBookCit, 
        'Chapter': rbldChapterCit, 'Ph.D. Dissertation': rbldDissertThesisCit, 
        'Other': rbldOtherCit, 'Report': rbldOtherCit, 
        "Master's Thesis": rbldDissertThesisCit, 'Museum record': rbldOtherCit };
    return getFullText[type](type);                                    
    /**
     * Articles, Museum records, etc.
     * Citation example with all data available: 
     *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author 
     *     [Initials. Last]. Year. Title of article. Title of Journal 
     *     Volume (Issue): Pages.
     */
    function  rbldArticleCit(type) {                                      
        const athrs = getCitAuthors();                                      
        const year = _u.stripString(citSrc.year);
        const title = _u.stripString(cit.title);
        const pub = _u.stripString(pubSrc.displayName);
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
    function rbldBookCit(type) {
        const athrs = getPubSrcAuthors() || getCitAuthors();
        const year = pubSrc.year;
        const titlesAndEds = getCitTitlesAndEditors();
        const ed = citSrc.publicationVolume;
        const pages = getCitBookPages();
        const publ = buildPublString(pubSrc) || '[NEEDS PUBLISHER DATA]';  
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
    function rbldChapterCit(type) {
        const athrs = getPubSrcAuthors() || getCitAuthors();
        const year = pubSrc.year;
        const titlesAndEds = getCitTitlesAndEditors();
        const pages = getCitBookPages();
        const publ = buildPublString(pubSrc) || '[NEEDS PUBLISHER DATA]';
        const allFields = [athrs, year, titlesAndEds, pages, publ]; 
        return allFields.filter(f => f).join('. ')+'.';
    }
    /**
     * Citation example with all data available: 
     *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author 
     *     [Initials. Last]. Year. Title.  Academic degree. Academic 
     *     Institution, City, Country.
     */
    function rbldDissertThesisCit(type) {
        const athrs = getPubSrcAuthors();
        const year = pubSrc.year;
        const title = _u.stripString(cit.title);
        const degree = type === "Master's Thesis" ? 'M.S. Thesis' : type;
        const publ = buildPublString(pubSrc) || '[NEEDS PUBLISHER DATA]';
        return [athrs, year, title, degree, publ].join('. ')+'.';
    }
    /**
     * Citation example with all data available: 
     *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author 
     *     [Initials. Last]. Year. Title. Volume (Issue): Pages. Publisher 
     *     Name, City, Country.
     */
    function rbldOtherCit(type) {
        const athrs = getCitAuthors() || getPubSrcAuthors();
        const year = citSrc.year ? _u.stripString(citSrc.year) : pubSrc.year;
        const title = _u.stripString(cit.title);
        const vip = getCiteVolumeIssueAndPages();
        const publ = buildPublString(pubSrc);
        return [athrs, year, title, vip, publ].filter(f=>f).join('. ') +'.';
    }
        /** ---------- citation full text helpers ----------------------- */
    function getCitBookPages(argument) {
        if (!cit.publicationPages) { return false; }
        return 'pp. ' + _u.stripString(cit.publicationPages);
    }
    function getCitAuthors() { 
        const auths = citSrc.authors;                                           //console.log('auths = %O', auths);
        if (!Object.keys(auths).length) { return false; }
        return getFormattedAuthorNames(auths);
    }
    function getPubSrcAuthors() {
        const auths = pubSrc.authors;
        if (!auths) { return false; }
        return getFormattedAuthorNames(auths);
    }
    function getPubEditors() {
        const eds = pubSrc.editors;  
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
        const chap = type === 'Chapter' ? _u.stripString(cit.title) : false;
        const pub = _u.stripString(pubSrc.displayName);
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
        const iss = cit.publicationIssue ? '('+cit.publicationIssue+')' : null; 
        const vol = cit.publicationVolume ? cit.publicationVolume : null;  
        const pgs = cit.publicationPages ? cit.publicationPages : null;   
        return vol && iss && pgs ? (vol+' '+iss+': '+pgs) :
            vol && iss ? (vol+' '+iss) : vol && pgs ? (vol+': '+pgs) :
                vol ? (vol) : iss && pgs ? (iss+': '+pgs) : iss ? (iss) : 
                    pgs ? (pgs) : (null);
    }
} /* End rebuildCitationText */


/** ======================== HELPERS ======================================== */
/** Formats publisher data and returns the Name, City, Country. */
function buildPublString(pub) {
    const publ = getPublRcrd(pub);
    if (!publ) { return false; }
    const name = publ.displayName;
    const city = publ.city ? publ.city : '[ADD CITY]';
    const cntry = publ.country ? publ.country : '[ADD COUNTRY]';
    return [name, city, cntry].join(', ');

    function getPublRcrd(pub) {
        if (!pub.parent) { return false; }
        const publSrc = fP.records.source[pub.parent];
        return getRcrd('publisher', publSrc.publisher);
    }
} /* End buildPublString */
/** 
 * Returns a string with all author names formatted with the first author
 * [Last, Initials.], all following authors as [Initials. Last], and each 
 * are seperated by commas until the final author, which is seperated 
 * with '&'. If the names are of editors, they are returned [Initials. Last].
 * If >= 4 authors, returns first author [Last, Initials.] + ', et al';  
 */
function getFormattedAuthorNames(auths, eds) {                                  //console.log('getFormattedAuthorNames. auths = %O, eds = %s', JSON.parse(JSON.stringify(auths)), eds);
    if (Object.keys(auths).length > 3) { return getFirstEtAl(auths[1]); }
    let athrs = '';
    for (let ord in auths) {  
        let name = getFormattedName(ord, auths[ord]); 
        athrs += (ord == 1 ? name : (ord == Object.keys(auths).length ?
            ' & '+ name : ', '+ name));                 
    }
    return _u.stripString(athrs);

    function getFirstEtAl(authId) {
        const name = getFormattedName(1, authId);
        return name +', et al';
    }
    function getFormattedName(i, srcId) {                                       //console.log('getFormattedName cnt =%s, id = %s', i, srcId);        
        const src = fP.records.source[srcId];                      
        const athrId = src[_u.lcfirst(src.sourceType.displayName)];  
        const athr = fP.records.author[athrId];        
        return getCitAuthName(i, athr, eds);
    }
    /**
     * Returns the last name and initials of the passed author. The first 
     * author is formatted [Last, Initials.] and all others [Initials. Last].
     * If editors (eds), [Initials. Last].
     */
    function getCitAuthName(cnt, a, eds) {                                      //console.log('getCitAuthName. cnt = [%s], auth = %O, eds = ', cnt, a, eds);
        const last = a.lastName;                     
        const initials = ["firstName", "middleName"].map(name => 
            a[name] ? a[name].charAt(0)+'.' : null).filter(i=>i).join(' '); //removes null values and joins
        return cnt > 1 || eds ? initials +' '+ last : last+', '+initials; 
    }
} /* End getFormattedAuthorNames */
/** Handles adding the punctuation for the data in the citation. */
function addPunc(data) {  
    return /[.!?,;:]$/.test(data) ? data : data+'.';
}