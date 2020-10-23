/**
 *
 *
 * Export
 *
 *
 * TOC
 *
 *
 */
import * as fields from './input/input-builder.js';

export function buildFieldInput() {
    return fields.buildFieldInput(...arguments);
}
export function ifAllRequiredFieldsFilled() {
    return fields.ifAllRequiredFieldsFilled(...arguments);
}