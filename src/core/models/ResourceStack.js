import _ from 'lodash';
import { hash as _hash } from '../utils/hashable';


const typeSymbol = Symbol.for('type');

export function validateState(ctx, state) {
    const type = state[typeSymbol];
    console.assert(type, `State object doesn't define its type: ${JSON.stringify(state)}`);
    const desc = ctx[type];
    console.assert(desc, `Context object doesn't describe the type: ${JSON.stringify(ctx)}`);
    console.assert('resourceNames' in desc,
        `Context description of type '${JSON.stringify(type)}'
         doesn't seem to have 'resourceNames': ${JSON.stringify(desc)}`);
    console.assert(desc.resourceNames,
        `Context description of type '${JSON.stringify(type)}'
         doesn't seem to have 'resourceNames': ${JSON.stringify(desc)}`);
    console.assert(_.keys(state) in desc.resourceNames,
        `Context description of type '${JSON.stringify(type)}'
         doesn't seem to have 'resourceNames': ${JSON.stringify(desc)}`);
}

function validateCtx(ctx, type) {
    const desc = ctx[type];
    console.assert('resourceNames' in desc,
        `Context description of type '${JSON.stringify(type)}'
         doesn't seem to have 'resourceNames': ${JSON.stringify(desc)}`);
    console.assert(desc.resourceNames,
        `Context description of type '${JSON.stringify(type)}'
         doesn't seem to have 'resourceNames': ${JSON.stringify(desc)}`);
}

function getTypeDesc(ctx, state) {
    const type = state[typeSymbol];
    return [type, ctx[type]];
}

function getResources(ctx, state) {
    const [, desc] = getTypeDesc(ctx, state);
    return _.map(desc.resourceNames, (name) => (state[name] || 0));
}

function getResourcesPairwise(ctx, stateL, stateR) {
    const [typeL, descL] = getTypeDesc(ctx, stateL);
    const [typeR] = getTypeDesc(ctx, stateR);
    console.assert(typeL === typeR,
        `Types of ResourceStack doesnt seem to match:
        '${JSON.stringify(stateL)}' and '${JSON.stringify(stateR)}'`);
    return _.map(descL.resourceNames, (name) => [stateL[name] || 0, stateR[name] || 0]);
}

export function isEmpty(ctx, state) {
    return _.isNil(state) || _.every(
        getResources(ctx, state),
        (count) => count === 0
    );
}

function isConditionFulfiled(ctx, stateL, stateR, condition) {
    const emptyL = isEmpty(ctx, stateL);
    const emptyR = isEmpty(ctx, stateR);
    return (emptyL && emptyR) || ((!emptyL && !emptyR) && condition());
}

export function isPositive(ctx, state) {
    return !_.isNil(state) && _.every(
        getResources(ctx, state),
        (count) => count >= 0
    );
}

export function isEqual(ctx, stateL, stateR) {
    return isConditionFulfiled(ctx, stateL, stateR, () => (
        _.every(
            getResourcesPairwise(ctx, stateL, stateR),
            ([countL, countR]) => countL === countR
        )
    ));
}

export function isContaining(ctx, stateBigger, stateSmaller) {
    return _.every(
        getResourcesPairwise(ctx, stateBigger, stateSmaller),
        ([countBigger, countSmaller]) => (
            countBigger >= countSmaller && countBigger >= 0 && countSmaller >= 0
        )
    );
}


export function add(ctx, addendL, addendR) {
    if (isEmpty(ctx, addendL)) return addendR;
    if (isEmpty(ctx, addendR)) return addendL;
    const [typeL, desc] = getTypeDesc(ctx, addendL);
    const [typeR] = getTypeDesc(ctx, addendR);
    console.assert(typeL === typeR);
    return _.reduce(
        desc.resourceNames,
        (obj, name) => {
            obj[name] = (addendL[name] || 0) + (addendR[name] || 0);
            return obj;
        },
        _.clone(addendL)
    );
}

export function subtract(ctx, minuend, subtrahend) {
    if (isEmpty(ctx, subtrahend)) return minuend;
    // eslint-disable-next-line no-param-reassign
    if (_.isNil(minuend)) minuend = { typeSymbol: subtrahend.type };
    const [typeM, desc] = getTypeDesc(ctx, minuend);
    const [typeS] = getTypeDesc(ctx, subtrahend);
    console.assert(typeM === typeS);
    return _.reduce(
        desc.resourceNames,
        (obj, name) => {
            obj[name] = (minuend[name] || 0) - (subtrahend[name] || 0);
            return obj;
        },
        _.clone(minuend)
    );
}

export function hash(ctx, state) {
    // maybe sth more here later
    return _hash(state);
}

export function toJSON(ctx, state) {
    return JSON.stringify(state);
}

export default function bindToContext(ctx) {
    return {
        validate: _.partial(validateState, ctx),
        isEmpty: _.partial(isEmpty, ctx),
        isPositive: _.partial(isPositive, ctx),
        isEqual: _.partial(isEqual, ctx),
        isContaining: _.partial(isContaining, ctx),
        add: _.partial(add, ctx),
        subtract: _.partial(subtract, ctx),
        hash: _.partial(hash, ctx),
        toJSON: _.partial(toJSON, ctx)
    };
}
