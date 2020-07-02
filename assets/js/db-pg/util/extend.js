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