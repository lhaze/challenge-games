import _ from 'lodash';
import { getTypeDesc } from '../utils/ctx';
import { getHash, hash as _hash } from '../utils/hashable';


export function validateState(ctx, state) {
    return true;
}

export function canChangeValue(ctx, state, value) {
    if (!_.isNil(state.canChangeValue)) return state.canChangeValue(ctx, state, value);
    const [, desc] = getTypeDesc(ctx, state);
    if (!_.isNil(desc.canChangeValue)) return desc.canChangeValue(ctx, state, value);
    return true;
}

export function valueHasChanged(ctx, state, value) {
    if (!_.isNil(state.valueHasChanged)) return state.valueHasChanged(ctx, state, value);
    const [, desc] = getTypeDesc(ctx, state);
    if (!_.isNil(desc.valueHasChanged)) return desc.valueHasChanged(ctx, state, value);
    return true;
}

export function isEmpty(ctx, state) { return _.isNil(state.value); }

export function isFull(ctx, state) {
    if (!_.isNil(state.isFull)) return state.isFull(ctx, state);
    const [, desc] = getTypeDesc(ctx, state);
    if (!_.isNil(desc.isFull)) return desc.isFull(ctx, state);
    return !isEmpty(ctx, state);
}

export function setValue(ctx, state, value) {
    if (state.value === value || !canChangeValue(ctx, state, value)) return state;
    const newState = _.assign(_.clone(state), { value: value });
    valueHasChanged(ctx, newState, state.value);
    return newState;
}

export function clearValue(ctx, state) {
    if (isEmpty(ctx, state) || !canChangeValue(ctx, state, null)) return state;
    const newState = _.assign(_.clone(state), { value: null });
    valueHasChanged(ctx, newState, state.value);
    return newState;
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
        canChangeValue: _.partial(canChangeValue, ctx),
        valueHasChanged: _.partial(valueHasChanged, ctx),
        isEmpty: _.partial(isEmpty, ctx),
        setValue: _.partial(setValue, ctx),
        isFull: _.partial(isFull, ctx),
        clearValue: _.partial(clearValue, ctx),
        hasChangedValue: _.partial(hasChangedValue, ctx),
        isEqual: _.partial(isEqual, ctx),
        canChangeActive: _.partial(canChangeActive, ctx),
        activeHasChanged: _.partial(activeHasChanged, ctx),
        setActive: _.partial(setActive, ctx),
        hash: _.partial(hash, ctx),
        toJSON: _.partial(toJSON, ctx)
    };
}
