/**
 * Facade for interaction form build-chains.
 */
import * as reset from './reset-int-form.js';
import * as formBuild from './int-form-build.js';

export function initCreateForm() {
    return formBuild.initCreateForm(...arguments);
}
export function initEditForm() {
    return formBuild.initEditForm(...arguments);
}
export function finishInteractionFormBuild() {
    return formBuild.finishInteractionFormBuild(...arguments);
}
export function resetInteractionForm() {
    reset.resetInteractionForm(...arguments);
}