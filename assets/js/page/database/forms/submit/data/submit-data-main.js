/**
 *
 *
 *
 */
import { getValidatedFormData } from './get-form-data.js';


export function prepareDataForServer() {
    return getValidatedFormData(...arguments);
}