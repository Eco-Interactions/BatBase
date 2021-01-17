/**
 * Facade for various util methods related to imported libraries.
 *
 * TOC
 *
 *
 */
import * as cal from './flatpickr-util.js';

export function getNewCalendar() {
    return cal.getNewCalendar(...arguments);
}