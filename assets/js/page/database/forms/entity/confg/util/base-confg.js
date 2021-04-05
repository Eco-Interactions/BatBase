/**
 * Base form-confg properties:
 * { *: required confg-properties
 *    core: entityName,
 *    *fields: {
 *         //CORE.FIELDS AND TYPE.FIELDS WILL BE MERGED IN.
 *        FieldName: { //DisplayName
 *            class: '' //Otherwise set to form-level default
 *            //id: escaped id, added during field build
 *            info: { intro: "", *tooltip: ""(req) },
 *            label: Field label text (Name-prop used if absent)
 *            *name: FieldName,  [REQUIRED]
 *            prep: [], //server-data handled before form-submit
 *            required: true, //Set if true
 *            *type: "",  [REQUIRED]
 *        }, ...
 *    },
 *    misc: {
 *        entityProp: value
 *    },
 *    *name: formName (entity or su|object)
 *    types: { //ENTITY SUB-TYPES
 *         Type name: {
 *              name: (req)
 *              [confg prop with type-data]
 *         }
 *    },
 *    views: { //fields will be built and displayed according to the view
 *       *all:   [ [REQUIRED]
 *           FullRowFieldName,
 *           [FirstFieldName, Second, ...],
 *           [{fields: [FirstStackedField, SecondStacked]}, SecondRowField...]
 *       simple: [ ...SameFormat ]
 *    }
 * }
 *
 * Export
 *     getBaseFormConfg
 *
 * TOC
 *
 */
import { _u } from '~util';

export function getBaseFormConfg(entity) {
    const cName = getConfgName(entity);                             /*dbug-log*///console.log('   +--getBaseConfg [%s] for [%s]', cName, entity);
    const confg = getConfg(cName, entity);
    return confg;
}
function getConfgName(entity) {
    const map = {
        Editor: 'author',
        Object: 'group',
        Parent: 'group',
        Subject: 'group',
    };
    return map[entity] ? map[entity] : _u('lcfirst', [entity]);
}
function getConfg(name, entity) {                                   /*dbug-log*///console.log('getConfg [%s] for [%s]', name, entity);
    return require(`../entity/${name}-confg.js`).default(entity);
}