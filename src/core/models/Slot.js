import _ from 'lodash';
import { getHash, hash as _hash } from '../utils/hashable';
import getModel from './index';


export function validateState(ctx, state) {
    const isFullStrategy = state.isFullStrategy;
    if (!_.isNill(isFullStrategy)) {
        const condition = {
            'never': () => true,
            'always': () => true,
            'limit': () => !_.isNill(state.limit)
        }[isFullStrategy];
        console.assert(condition && condition());
    }
    return true;
}

export function isEmpty(ctx, state) { return _.isNil(state.value); }

export function isActive(ctx, state) { return _.isNil(state.active) ? true : state.active;}

const IsFullPolicy = {
    never(ctx, state) { return false; },
    always(ctx, state) { return true; },
    limit(ctx, state) {
        const meta = ctx[state.type];
        const limit = state.limit || meta.limit;
        console.assert(limit, 'No limit defined');
        const model = getModel(ctx, state.value.type);
        const countFunction = model.count;
        console.log('count', countFunction(state.value));
        console.assert(countFunction);
        return countFunction(state.value) >= limit;
    }
};

export function isFull(ctx, state) {
    if (_.isNil(state.value)) return false;
    const meta = ctx[state.type];
    const strategyName = state.isFullStrategy || meta.isFullStrategy;
    if (_.isNil(strategyName)) return !isEmpty(ctx, state);
    const strategy = IsFullPolicy[strategyName];
    console.assert(strategy);
    return strategy(ctx, state);
}

const CanSetValuePolicy = {
    existence(ctx, state, value) {
        const full = isActive(ctx, state) && !isFull(ctx, state);
        return { success: full, newValue: value, msg: full ? 'Slot is not empty' : null };
    },
    add(ctx, state, value) {
        return null;
    }
};

export function canSetValue(ctx, state, value) {
    const meta = ctx[state.type];
    const strategyName = state.setValueStrategy || meta.setValueStrategy;
    if (_.isNil(strategyName)) return true;
    const strategy = CanSetValuePolicy[strategyName];
    console.assert(strategy);
    return strategy(ctx, state, value);
}

export function setValue(ctx, state, value) {
    if (state.value === value) return { success: true, state: state, msg: 'Same value' };
    const { success, msg, newValue } = canSetValue(ctx, state, value);
    if (!success) return { success, state, msg };
    const newState = _.assign(_.clone(state), { value: newValue });
    return { success, msg, state: newState };
}

export function clearValue(ctx, state) {
    if (state.value === null) return { success: true, state: state, msg: 'Same value' };
    const { success, msg, newValue } = canSetValue(ctx, state, null);
    if (!success) return { success, state, msg };
    const newState = _.assign(_.clone(state), { value: newValue });
    return { success, msg, state: newState };
}

export function hasChangedValue(ctx, stateL, stateR) {
    return getHash(stateL.value) !== getHash(stateR.value);
}

export function isEqual(ctx, stateL, stateR) {
    return _.isEqual(stateL, stateR);
}

export function canChangeActive(ctx, state, active) {
    if (!_.isNil(state.canChangeValue)) return state.canChangeValue(ctx, state, active);
    const [, desc] = getTypeDesc(ctx, state);
    if (!_.isNil(desc.canChangeValue)) return desc.canChangeValue(ctx, state, active);
    return true;
}

export function activeHasChanged(ctx, state, value) {
    if (!_.isNil(state.valueHasChanged)) return state.valueHasChanged(ctx, state, value);
    const [, desc] = getTypeDesc(ctx, state);
    if (!_.isNil(desc.valueHasChanged)) return desc.valueHasChanged(ctx, state, value);
    return true;
}

export function setActive(ctx, state, active) {
    if (state.active === active || !canChangeActive(ctx, state, active)) return state;
    const newState = _.assign(_.clone(state), { active: active });
    activeHasChanged(ctx, newState, state.active);
    return newState;
}

export function hash(ctx, state) {
    if (!state._hash) {
        state._hash = _hash(state);
    }
    return state._hash;
}

export function toJSON(ctx, state) {
    // functions toJSON
    return JSON.stringify(state);
}

export default function bindToContext(ctx) {
    return {
        validateState: _.partial(validateState, ctx),
        isEmpty: _.partial(isEmpty, ctx),
        isActive: _.partial(isActive, ctx),
        isFull: _.partial(isFull, ctx),
        canSetValue: _.partial(canSetValue, ctx),
        setValue: _.partial(setValue, ctx),
        clearValue: _.partial(clearValue, ctx),
        // hasChangedValue: _.partial(hasChangedValue, ctx),
        // isEqual: _.partial(isEqual, ctx),
        // canChangeActive: _.partial(canChangeActive, ctx),
        // activeHasChanged: _.partial(activeHasChanged, ctx),
        // setActive: _.partial(setActive, ctx),
        // hash: _.partial(hash, ctx),
        // toJSON: _.partial(toJSON, ctx)
    };
}
