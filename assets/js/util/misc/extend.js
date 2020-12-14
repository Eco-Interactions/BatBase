/*--------------------- Extend Prototypes/Libraries ----------------------*/
export default function extendPrototypes() {
    extendDate();
    extendJquery();
}
function extendDate() {
    /** Y-m-d  */
    Date.prototype.today = function () {
        return this.getFullYear() +"-"+
            (((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"-"+
            ((this.getDate() < 10)?"0":"") + this.getDate() ;
    }
    /** H:i:s */
    Date.prototype.timeNow = function () {
        return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+
            ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+
            ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
    }
    /** Ex: PDT|PST */
    Date.prototype.getTimezoneAlphaString = function () {
        return /.*\s(.+)/.exec(this.toLocaleDateString('en-us', { timeZoneName:'short' }))[1];
    }
    /** H:i(pm|am) PT */
    Date.prototype.getStandardTimeString = function () {
        let hours = this.getHours();
        let minutes = this.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        return `${hours}:${minutes}${ampm} ${this.getTimezoneAlphaString()}`;
    }
    /** m/d/Y */
    Date.prototype.getMonthDayYearString = function () {
        return `${this.getMonth()+1} /${this.getDate()}/${this.getFullYear()}`;
    }
    /** m/d/Y at H:i(pm|am) PT */
    Date.prototype.getDateTimeSentence = function () {
        return `${this.getMonthDayYearString()} at ${this.getStandardTimeString()}`;
    }
}
function extendJquery() {
    addOnEnterEvent();
    addOnDestroyedEvent();
}
function addOnEnterEvent() {
    $.fn.onEnter = function(func) {
        this.bind('keypress', function(e) {
            if (e.keyCode == 13) func.apply(this, [e]);
        });
        return this;
     };
}
/** A 'post-remove' event listener. Use: $('.elem').bind('destroyed', cb); */
function addOnDestroyedEvent() { //Note: this will fire after .off('destroy')
    $.event.special.destroyed = {
        remove: function(o) {
          if (o.handler) {  // (&& o.type !== 'destroyed') <- something similar to this should fix the off() firing.g
            o.handler();
          }
        }
      }
}