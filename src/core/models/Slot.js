import _ from 'lodash';
import getModelFunction from './index';


export function validateState(ctx, state) {
    const isFullStrategy = state.isFullStrategy;
    const truthy = () => true;
    if (!_.isNill(isFullStrategy)) {
        const condition = {
            'never': truthy,
            'always': truthy,
            'maxValue': () => !_.isNill(state.maxValue)
        }[isFullStrategy];
        console.assert(condition && condition());
    }
    const setValueStrategy = state.setValueStrategy;
    if (!_.isNill(setValueStrategy)) {
        const condition = {
            'never': truthy,
            'always': truthy,
            'empty': truthy,
            'notEmpty': truthy,
            'type': () => !_.isNill(state.acceptedTypes),
            'maxValue': () => !_.isNill(state.maxValue)
        }[setValueStrategy];
        console.assert(condition && condition());
    }
    return true;
}

function getAttibute(ctx, state, name) {
    const meta = ctx[state.type];
    const attribute = state[name] || meta[name];
    console.assert(attribute, `Attribute '${name}' on '${JSON.stringify(state)} not defined'`);
    return attribute;
}

export function isEmpty(ctx, state) { return _.isNil(state.value); }

export function isActive(ctx, state) { return _.isNil(state.active) ? true : state.active;}

export const IsFullPolicy = {
    never(ctx, state) { return false; },
    always(ctx, state) { return true; },
    maxValue(ctx, state) {
        const max = getAttibute(ctx, state, 'maxValue');
        const count = getModelFunction(ctx, state.value.type, 'count');
        return count(state.value) >= max;
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

export const CanPushValuePolicy = {
    never(ctx, state, value) {
        return {
            success: false,
            value: null,
            msg: 'VLD/NEVER'
        };
    },
    always(ctx, state, value) {
        return {
            success: true,
            value: value,
            msg: null
        };
    },
    empty(ctx, state, value) {
        const full = isFull(ctx, state) && !_.isNil(value);
        return {
            success: !full,
            value: full ? null : value,
            msg: full ? 'VLD/EMPTY' : null
        };
    },
    notEmpty(ctx, state, value) {
        const empty = _.isNil(value);
        return {
            success: !empty,
            value: empty ? null : value,
            msg: empty ? 'VLD/NOT-EMPTY' : null
        };
    },
    type(ctx, state, value) {
        // clearing null value is short-circuited here
        if (_.isNil(value)) return { success: true, value: value, msg: null };
        const acceptedTypes = getAttibute(ctx, state, 'acceptedTypes');
        const accepted = _.includes(acceptedTypes, value.type);
        return {
            success: accepted,
            value: accepted ? value : null,
            msg: accepted ? null : 'VLD/TYPE'
        };
    },
    maxValue(ctx, state, value) {
        const max = getAttibute(ctx, state, 'maxValue');
        const count = getModelFunction(ctx, state.value.type, 'count');
        const full = count(state.value) >= max;
        return { success: !full, value: value, msg: full ? 'VLD/MAX-VALUE' : null };
    }
};

export function canPushValue(ctx, state, value) {
    if (!isActive(ctx, state)) return { success: false, state: state, msg: 'VLD/NOT-ACTIVE' };
    const meta = ctx[state.type];
    const strategyName = state.setValueStrategy || meta.setValueStrategy || 'empty';
    const strategy = CanPushValuePolicy[strategyName];
    console.assert(strategy, `Strategy '${strategyName}' on '${JSON.stringify(state)}' not found`);
    return strategy(ctx, state, value);
}

export function pushValue(ctx, state, value) {
    if (state.value === value) {
        return { success: false, state: state, rest: value, msg: 'VLD/SAME-VALUE' };
    }
    const { success, value: newValue, msg } = canPushValue(ctx, state, value);
    if (!success) return { success, state, msg };
    const newState = _.assign(_.clone(state), { value: newValue });
    return { success, state: newState, msg };
}

export function popValue(ctx, state) {
    if (_.isNil(state.value)) {
        return { success: false, state: state, rest: null, msg: 'VLD/NO-VALUE-TO-POP' };
    }
    const { success, msg, value: newValue } = canPushValue(ctx, state, null);
    if (!success) return { success, state, rest: null, msg };
    const newState = _.assign(_.clone(state), { value: newValue });
    return { success, state: newState, rest: state.value, msg };
}

export function setActive(ctx, state, active) {
    if ((_.isNil(state.active) ? true : state.active) === active) {
        return { success: false, state: state, msg: 'VLD/ALREADY-ACTIVE' };
    }
    const newState = _.assign(_.clone(state), { active: active });
    return { success: true, state: newState, msg: null };
}

export function isEqual(ctx, stateL, stateR) {
    return _.isEqual(stateL, stateR);
}

// export function hasChangedValue(ctx, stateL, stateR) {
//     return getHash(stateL.value) !== getHash(stateR.value);
// }
//
// export function canChangeActive(ctx, state, active) {
//     if (!_.isNil(state.canChangeValue)) return state.canChangeValue(ctx, state, active);
//     const [, desc] = getTypeDesc(ctx, state);
//     if (!_.isNil(desc.canChangeValue)) return desc.canChangeValue(ctx, state, active);
//     return true;
// }
//
// export function activeHasChanged(ctx, state, value) {
//     if (!_.isNil(state.valueHasChanged)) return state.valueHasChanged(ctx, state, value);
//     const [, desc] = getTypeDesc(ctx, state);
//     if (!_.isNil(desc.valueHasChanged)) return desc.valueHasChanged(ctx, state, value);
//     return true;
// }
//
// export function hash(ctx, state) {
//     if (!state._hash) {
//         state._hash = _hash(state);
//     }
//     return state._hash;
// }
//
// export function toJSON(ctx, state) {
//     // functions toJSON
//     return JSON.stringify(state);
// }
