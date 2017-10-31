import _ from 'lodash';
import { hash as _hash } from '../utils/hashable';


export function validateState(ctx, state) {
    const type = state.type;
    console.assert(type, `State object doesn't define its type: ${JSON.stringify(state)}`);
    const meta = ctx[type];
    console.assert(meta,
        `Context object doesn't have meta-description of the type: ${JSON.stringify(ctx)}`);
    console.assert('resourceNames' in meta,
        `Meta-description of type '${JSON.stringify(type)}'
         doesn't seem to have 'resourceNames': ${JSON.stringify(meta)}`);
    console.assert(meta.resourceNames,
        `Meta-description of type '${JSON.stringify(type)}'
         doesn't seem to have 'resourceNames': ${JSON.stringify(meta)}`);
    console.assert(_.keys(state) in meta.resourceNames,
        `Meta-description of type '${JSON.stringify(type)}'
         doesn't seem to have 'resourceNames': ${JSON.stringify(meta)}`);
}

function validateCtx(ctx, type) {
    const meta = ctx[type];
    console.assert('resourceNames' in meta,
        `Meta-description of type '${JSON.stringify(type)}'
         doesn't seem to have 'resourceNames': ${JSON.stringify(meta)}`);
    console.assert(meta.resourceNames,
        `Meta-description of type '${JSON.stringify(type)}'
         doesn't seem to have 'resourceNames': ${JSON.stringify(meta)}`);
}

function getResources(ctx, state) {
    const meta = ctx[state.type];
    return _.map(meta.resourceNames, (name) => (state[name] || 0));
}

function getResourcesPairwise(ctx, stateL, stateR) {
    const typeL = stateL.type;
    const typeR = stateR.type;
    const meta = ctx[typeL];
    console.assert(typeL === typeR,
        `Types of ResourceStack doesnt seem to match:
        '${JSON.stringify(stateL)}' and '${JSON.stringify(stateR)}'`);
    return _.map(meta.resourceNames, (name) => [stateL[name] || 0, stateR[name] || 0]);
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

export function count(ctx, state) {
    const meta = ctx[state.type];
    return _.reduce(meta.resourceNames, (sum, name) => {
        // eslint-disable-next-line no-param-reassign
        sum += state[name];
        return sum;
    }, 0);
}

export function add(ctx, addendL, addendR) {
    if (isEmpty(ctx, addendL)) return addendR;
    if (isEmpty(ctx, addendR)) return addendL;
    const typeL = addendL.type;
    const typeR = addendR.type;
    console.assert(typeL === typeR);
    const meta = ctx[typeL];
    return _.reduce(
        meta.resourceNames,
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
    if (_.isNil(minuend)) minuend = { type: subtrahend.type };
    const typeM = minuend.type;
    const typeS = subtrahend.type;
    console.assert(typeM === typeS);
    const meta = ctx[typeM];
    return _.reduce(
        meta.resourceNames,
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
    // maybe sth more here later
    return JSON.stringify(state);
}

export default function bindToContext(ctx) {
    return {
        name: 'ResourceStack',
        validate: _.partial(validateState, ctx),
        isEmpty: _.partial(isEmpty, ctx),
        isPositive: _.partial(isPositive, ctx),
        isEqual: _.partial(isEqual, ctx),
        isContaining: _.partial(isContaining, ctx),
        count: _.partial(count, ctx),
        add: _.partial(add, ctx),
        subtract: _.partial(subtract, ctx),
        hash: _.partial(hash, ctx),
        toJSON: _.partial(toJSON, ctx)
    };
}
