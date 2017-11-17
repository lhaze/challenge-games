import _ from 'lodash';
import * as Slot from '../Slot';


const ctx = {
    'Slot.field': {},
    'ResourceStack.tokens': {
        resourceNames: ['tokens']
    }
};
const addType = function(state) {
    state.type = 'Slot.field';
    return state;
};
const someValue = {
    type: 'ResourceStack.tokens',
    tokens: 7
};
const otherValue = {
    type: 'ResourceStack.tokens',
    tokens: 5
};
const emptyState = addType({});
const someState = addType({ value: someValue });
const activeState = addType({ active: true });
const inactiveState = addType({ active: false });


describe('Slot.isEmpty', () => {
    test('on empty state', () => {
        expect(Slot.isEmpty(ctx, emptyState)).toBeTruthy();
    });
    test('on state with nil value', () => {
        const state = _.assign(_.clone(someState), { value: null });
        expect(Slot.isEmpty(ctx, state)).toBeTruthy();
    });
    test('on state with value', () => {
        expect(Slot.isEmpty(ctx, someState)).toBeFalsy();
    });
});

describe('Slot.isActive', () => {
    test('on empty state', () => {
        expect(Slot.isActive(ctx, emptyState)).toBeTruthy();
    });
    test('on an active state', () => {
        expect(Slot.isActive(ctx, activeState)).toBeTruthy();
    });
    test('on an inactive state', () => {
        expect(Slot.isActive(ctx, inactiveState)).toBeFalsy();
    });
});

describe('Slot.isFull', () => {
    test('on empty state', () => {
        expect(Slot.isFull(ctx, emptyState)).toBeFalsy();
    });
    test('on an state with value and without strategy', () => {
        expect(Slot.isFull(ctx, someState)).toBeTruthy();
    });
    test('raises on a wrong strategy name', () => {
        const state = _.assign(_.clone(someState), { isFullStrategy: 'foo' });
        expect(() => Slot.isFull(ctx, state)).toThrow();
    });
    test('on an state with value and "always" strategy on state', () => {
        const state = _.assign(_.clone(someState), { isFullStrategy: 'always' });
        expect(Slot.isFull(ctx, state)).toBeTruthy();
    });
    test('on an state with value and "always" strategy on ctx', () => {
        const ctx = {
            'Slot.field': { isFullStrategy: 'always' }
        };
        expect(Slot.isFull(ctx, someState)).toBeTruthy();
    });
});

describe('Slot.IsFullPolicy', () => {
    test('always on a state with value', () => {
        expect(Slot.IsFullPolicy.always(ctx, someState)).toBeTruthy();
    });
    test('never on an empty state', () => {
        expect(Slot.IsFullPolicy.never(ctx, emptyState)).toBeFalsy();
    });
    test('maxValue on state', () => {
        const state = _.assign(_.clone(someState), { isFullStrategy: 'maxValue', maxValue: 7 });
        expect(Slot.IsFullPolicy.maxValue(ctx, state)).toBeTruthy();
    });
    test('maxValue on ctx', () => {
        const ctx = {
            'Slot.field': { isFullStrategy: 'maxValue', maxValue: 7 },
            'ResourceStack.tokens': { resourceNames: ['tokens'] }
        };
        expect(Slot.IsFullPolicy.maxValue(ctx, someState)).toBeTruthy();
    });
    test('maxValue with a high limit', () => {
        const ctx = {
            'Slot.field': { isFullStrategy: 'maxValue', maxValue: 10 },
            'ResourceStack.tokens': { resourceNames: ['tokens'] }
        };
        expect(Slot.isFull(ctx, someState)).toBeFalsy();
    });
    test('maxValue with a low limit', () => {
        const ctx = {
            'Slot.field': { isFullStrategy: 'maxValue', maxValue: 2 },
            'ResourceStack.tokens': { resourceNames: ['tokens'] }
        };
        expect(Slot.isFull(ctx, someState)).toBeTruthy();
    });
});

describe('Slot.canPushValue', () => {
    const stateWithNever = addType({ setValueStrategy: 'never' });
    const otherCtx = {
        'Slot.field': { setValueStrategy: 'never' },
        'ResourceStack.tokens': { resourceNames: ['tokens'] }
    };
    test('empty on an empty state', () => {
        const { success, value, msg } = Slot.canPushValue(ctx, emptyState, someValue);
        expect(success).toBeTruthy();
        expect(value).toEqual(someValue);
        expect(msg).toBeNull();
    });
    test('empty on a state with value', () => {
        const { success, value, msg } = Slot.canPushValue(ctx, someState, otherValue);
        expect(success).toBeFalsy();
        expect(value).toBeNull();
        expect(msg).toEqual('VLD/EMPTY');
    });
    test('never on a state', () => {
        const { success, value, msg } = Slot.canPushValue(ctx, stateWithNever, someValue);
        expect(success).toBeFalsy();
        expect(value).toBeNull();
        expect(msg).toEqual('VLD/NEVER');
    });
    test('never on a context', () => {
        const { success, value, msg } = Slot.canPushValue(otherCtx, emptyState, someValue);
        expect(success).toBeFalsy();
        expect(value).toBeNull();
        expect(msg).toEqual('VLD/NEVER');
    });
    test('on an inactive state', () => {
        const { success, state, msg } = Slot.canPushValue(ctx, inactiveState, someValue);
        expect(success).toBeFalsy();
        expect(state).toEqual(inactiveState);
        expect(msg).toEqual('VLD/NOT-ACTIVE');
    });
});

describe('Slot.CanPushValuePolicy.never', () => {
    test('never on an empty state', () => {
        const { success, value, msg } = Slot.CanPushValuePolicy.never(ctx, emptyState, otherValue);
        expect(success).toBeFalsy();
        expect(value).toBeNull();
        expect(msg).toEqual('VLD/NEVER');
    });
});

describe('Slot.CanPushValuePolicy.always', () => {
    test('always on a state with value', () => {
        const { success, value, msg } = Slot.CanPushValuePolicy.always(ctx, someState, otherValue);
        expect(success).toBeTruthy();
        expect(value).toEqual(otherValue);
        expect(msg).toBeNull();
    });
});

describe('Slot.CanPushValuePolicy.empty', () => {
    test('empty on an empty state', () => {
        const { success, value, msg } = Slot.CanPushValuePolicy.empty(ctx, emptyState, otherValue);
        expect(success).toBeTruthy();
        expect(value).toEqual(otherValue);
        expect(msg).toBeNull();
    });
    test('empty on a state with value', () => {
        const { success, value, msg } = Slot.CanPushValuePolicy.empty(ctx, someState, otherValue);
        expect(success).toBeFalsy();
        expect(value).toBeNull();
        expect(msg).toEqual('VLD/EMPTY');
    });
    test('empty on an empty value', () => {
        const { success, value, msg } = Slot.CanPushValuePolicy.empty(ctx, someState, null);
        expect(success).toBeTruthy();
        expect(value).toBeNull();
        expect(msg).toBeNull();
    });
});

describe('Slot.CanPushValuePolicy.notEmpty', () => {
    test('notEmpty on a state with value', () => {
        const { success, value, msg } = Slot.CanPushValuePolicy.notEmpty(
            ctx, someState, otherValue);
        expect(success).toBeTruthy();
        expect(value).toEqual(otherValue);
        expect(msg).toBeNull();
    });
    test('notEmpty on an empty state', () => {
        const { success, value, msg } = Slot.CanPushValuePolicy.notEmpty(
            ctx, emptyState, otherValue);
        expect(success).toBeTruthy();
        expect(value).toEqual(otherValue);
        expect(msg).toBeNull();
    });
    test('notEmpty on an empty value', () => {
        const { success, value, msg } = Slot.CanPushValuePolicy.notEmpty(
            ctx, emptyState, null);
        expect(success).toBeFalsy();
        expect(value).toBeNull();
        expect(msg).toEqual('VLD/NOT-EMPTY');
    });
    test('notEmpty on an empty value', () => {
        const { success, value, msg } = Slot.CanPushValuePolicy.notEmpty(
            ctx, emptyState, otherValue);
        expect(success).toBeTruthy();
        expect(value).toEqual(otherValue);
        expect(msg).toBeNull();
    });
});

describe('Slot.CanPushValuePolicy.type', () => {
    const typedState = addType({
        value: someValue,
        acceptedTypes: ['ResourceStack.tokens', 'foo']
    });
    test('type on an empty value', () => {
        const { success, value, msg } = Slot.CanPushValuePolicy.type(
            ctx, typedState, null);
        expect(success).toBeTruthy();
        expect(value).toBeNull();
        expect(msg).toBeNull();
    });
    test('type on an value of type', () => {
        const { success, value, msg } = Slot.CanPushValuePolicy.type(
            ctx, typedState, otherValue);
        expect(success).toBeTruthy();
        expect(value).toEqual(otherValue);
        expect(msg).toBeNull();
    });
    test('type on an value of other type', () => {
        const otherTypeValue = {
            type: 'bar',
            tokens: 7
        };
        const { success, value, msg } = Slot.CanPushValuePolicy.type(
            ctx, typedState, otherTypeValue);
        expect(success).toBeFalsy();
        expect(value).toBeNull();
        expect(msg).toEqual('VLD/TYPE');
    });
    test('type with acceptedTypes not defined', () => {
        expect(() => Slot.CanPushValuePolicy.type(ctx, someState, someValue)).toThrow();
    });
    test('type with acceptedTypes on context', () => {
        const ctx = {
            'Slot.field': {
                acceptedTypes: ['ResourceStack.tokens', 'foo']
            },
            'ResourceStack.tokens': {
                resourceNames: ['tokens']
            }
        };
        const { success, value, msg } = Slot.CanPushValuePolicy.type(ctx, someState, otherValue);
        expect(success).toBeTruthy();
        expect(value).toEqual(otherValue);
        expect(msg).toBeNull();
    });
    test('type with acceptedTypes on both state and context', () => {
        const ctx = {
            'Slot.field': {
                acceptedTypes: ['foo']
            },
            'ResourceStack.tokens': {
                resourceNames: ['tokens']
            }
        };
        const { success, value, msg } = Slot.CanPushValuePolicy.type(ctx, typedState, otherValue);
        expect(success).toBeTruthy();
        expect(value).toEqual(otherValue);
        expect(msg).toBeNull();
    });
});

describe('Slot.CanPushValuePolicy.maxValue', () => {
    const maxValueCtx = {
        'Slot.field': {
            maxValue: 10
        },
        'ResourceStack.tokens': {
            resourceNames: ['tokens']
        }
    };
    test('maxValue on a state with value below', () => {
        const { success, value, msg } = Slot.CanPushValuePolicy.maxValue(
            maxValueCtx, someState, otherValue);
        expect(success).toBeTruthy();
        expect(value).toEqual(otherValue);
        expect(msg).toBeNull();
    });
    test('maxValue with maxValue not defined', () => {
        expect(() => Slot.CanPushValuePolicy.maxValue(ctx, someState, someValue)).toThrow();
    });

    test('notEmpty on an empty state', () => {
        const { success, value, msg } = Slot.CanPushValuePolicy.notEmpty(
            ctx, emptyState, otherValue);
        expect(success).toBeTruthy();
        expect(value).toEqual(otherValue);
        expect(msg).toBeNull();
    });
    test('notEmpty on an empty value', () => {
        const { success, value, msg } = Slot.CanPushValuePolicy.notEmpty(ctx, emptyState, null);
        expect(success).toBeFalsy();
        expect(value).toBeNull();
        expect(msg).toEqual('VLD/NOT-EMPTY');
    });
    test('notEmpty on an empty value', () => {
        const { success, value, msg } = Slot.CanPushValuePolicy.notEmpty(
            ctx, emptyState, otherValue);
        expect(success).toBeTruthy();
        expect(value).toEqual(otherValue);
        expect(msg).toBeNull();
    });
});

describe('Slot.pushValue', () => {
    test('on an empty state with empty strategy', () => {
        const { success, state, msg } = Slot.pushValue(ctx, emptyState, someValue);
        expect(success).toBeTruthy();
        expect(state).toEqual(someState);
        expect(msg).toBeNull();
    });
    test('on a state with the same value', () => {
        const { success, state, msg } = Slot.pushValue(ctx, someState, someValue);
        expect(success).toBeFalsy();
        expect(state).toEqual(someState);
        expect(msg).toEqual('VLD/SAME-VALUE');
    });
    test('on an inactive state', () => {
        const { success, state, msg } = Slot.pushValue(ctx, inactiveState, someValue);
        expect(success).toBeFalsy();
        expect(state).toEqual(inactiveState);
        expect(msg).toEqual('VLD/NOT-ACTIVE');
    });
    test('on a state with value with empty strategy', () => {
        const { success, state, msg } = Slot.pushValue(ctx, someState, otherValue);
        expect(success).toBeFalsy();
        expect(state).toEqual(someState);
        expect(msg).toEqual('VLD/EMPTY');
    });
    test('finds strategy on the state', () => {
        const stateWithStrategy = _.assign(_.clone(someState), { setValueStrategy: 'always' });
        const stateExpected = _.assign(_.clone(stateWithStrategy), { value: otherValue });
        const { success, state, msg } = Slot.pushValue(ctx, stateWithStrategy, otherValue);
        expect(success).toBeTruthy();
        expect(state).toEqual(stateExpected);
        expect(msg).toBeNull();
    });
    test('finds strategy on the context', () => {
        const someCtx = {
            'Slot.field': {
                setValueStrategy: 'always'
            },
            'ResourceStack.tokens': {
                resourceNames: ['tokens']
            }
        };
        const stateExpected = _.assign(_.clone(someState), { value: otherValue });
        const { success, state, msg } = Slot.pushValue(someCtx, someState, otherValue);
        expect(success).toBeTruthy();
        expect(state).toEqual(stateExpected);
        expect(msg).toBeNull();
    });
});

describe('Slot.popValue', () => {
    test('returns new Slot instance when value was popped', () => {
        const { success, state, msg } = Slot.popValue(ctx, someState);
        expect(success).toBeTruthy();
        expect(state).not.toBe(someState);
        expect(msg).toBeNull();
    });
    test('returns state with value cleared', () => {
        const { state, rest } = Slot.popValue(ctx, someState);
        expect(state.value).toBeNull();
        expect(rest).toBe(someState.value);
    });
    test('on an empty state', () => {
        const { success, state, msg } = Slot.popValue(ctx, emptyState);
        expect(success).toBeFalsy();
        expect(state).toEqual(emptyState);
        expect(msg).toEqual('VLD/NO-VALUE-TO-POP');
    });
    test('on an inactive state', () => {
        const inactiveState = addType({ value: someState, active: false });
        const { success, state, msg } = Slot.popValue(ctx, inactiveState);
        expect(success).toBeFalsy();
        expect(state).toEqual(inactiveState);
        expect(msg).toEqual('VLD/NOT-ACTIVE');
    });
});

describe('Slot.isEmpty', () => {
    test('on an empty state', () => {
        expect(Slot.isEmpty(ctx, emptyState)).toBeTruthy();
    });
    test('on a state with a value', () => {
        expect(Slot.isEmpty(ctx, someState)).toBeFalsy();
    });
    test('on an state with null', () => {
        const state = addType({ value: null });
        expect(Slot.isEmpty(ctx, state)).toBeTruthy();
    });
});

describe('Slot.isActive', () => {
    test('on an active state', () => {
        expect(Slot.isActive(ctx, activeState)).toBeTruthy();
    });
    test('on an inactive state', () => {
        expect(Slot.isActive(ctx, inactiveState)).toBeFalsy();
    });
    test('on an empty state', () => {
        expect(Slot.isActive(ctx, emptyState)).toBeTruthy();
    });
});

describe('Slot.setActive', () => {
    test('set true on an active state', () => {
        const { success, state, msg } = Slot.setActive(ctx, activeState, true);
        expect(success).toBeFalsy();
        expect(state).toEqual(state);
        expect(msg).toEqual('VLD/ALREADY-ACTIVE');
    });
    test('set true on an inactive state', () => {
        const { success, state, msg } = Slot.setActive(ctx, inactiveState, true);
        expect(success).toBeTruthy();
        expect(state).toEqual(activeState);
        expect(msg).toBeNull();
    });
    test('set false on an active state', () => {
        const { success, state, msg } = Slot.setActive(ctx, activeState, false);
        expect(success).toBeTruthy();
        expect(state).toEqual(inactiveState);
        expect(msg).toBeNull();
    });
    test('set true on an state without an "active" value', () => {
        const { success, state, msg } = Slot.setActive(ctx, someState, true);
        expect(success).toBeFalsy();
        expect(state).toEqual(someState);
        expect(msg).toEqual('VLD/ALREADY-ACTIVE');
    });
    test('set false on an state without an "active" value', () => {
        const { success, state, msg } = Slot.setActive(ctx, someState, false);
        const stateExpected = _.assign(_.clone(someState), { active: false });
        expect(success).toBeTruthy();
        expect(state).toEqual(stateExpected);
        expect(msg).toBeNull();
    });
});

// describe('Slot.isEqual', () => {
//     test('on equal state', () => {
//         const otherState = new Slot(someState.args);
//         expect(someState.isEqual(otherState)).toBeTruthy();
//     });
//     test('on different state', () => {
//         expect(someState.isEqual(emptyState)).toBeFalsy();
//     });
//     test('on nil', () => {
//         expect(someState.isEqual(null)).toBeFalsy();
//     });
// });
//
// describe('Slot.hasChangedValue', () => {
//     test('true if value changed from null to some', () => {
//         const newState = emptyState.pushValue(otherValue);
//         expect(newState.hasChangedValue(emptyState)).toBeTruthy();
//     });
//     test('false if value changed from null to falsy', () => {
//         const newState = emptyState.pushValue(0);
//         expect(newState.hasChangedValue(emptyState)).toBeTruthy();
//     });
//     test('false if slot was deactivated', () => {
//         const newState = someState.deactivate();
//         expect(newState.hasChangedValue(someState)).toBeFalsy();
//     });
//     test('true if value changed from some to other', () => {
//         const newState = someState.pushValue(otherValue);
//         expect(newState.hasChangedValue(someState)).toBeTruthy();
//     });
//     test('false if value changed from some to the same', () => {
//         const newState = emptyState.pushValue(null);
//         expect(newState.hasChangedValue(emptyState)).toBeFalsy();
//     });
//     test('false if slot was activated', () => {
//         const state = new Slot({ value: value, active: false });
//         const newState = state.activate();
//         expect(newState.hasChangedValue(state)).toBeFalsy();
//     });
// });
//
//
// const inactiveState = new Slot({ active: false });
// const activeState = new Slot({ active: true });
//
// describe('Slot.activate', () => {
//     test('returns new Slot instance when instance has been changed', () => {
//         const newState = inactiveState.activate();
//         expect(newState).not.toBe(inactiveState);
//         expect(newState.active).toBeTruthy();
//     });
//     test('returns the same instance when instance has not been changed', () => {
//         const newState = activeState.activate();
//         expect(newState).toBe(activeState);
//         expect(newState.active).toBeTruthy();
//     });
//     test('returns state with the same args', () => {
//         const state = new Slot(args);
//         const newState = state.activate();
//         expect(newState.args).toMatchObject(_.omit(args, ['active']));
//     });
// });
//
// describe('Slot.deactivate', () => {
//     test('returns new Slot instance when instance has been changed', () => {
//         const newState = activeState.deactivate();
//         expect(newState).not.toBe(activeState);
//         expect(newState.active).toBeFalsy();
//     });
//     test('returns the same instance when instance has not been changed', () => {
//         const newState = inactiveState.deactivate();
//         expect(newState).toBe(inactiveState);
//         expect(newState.active).toBeFalsy();
//     });
//     test('returns state with the same args', () => {
//         const state = new Slot(args);
//         const newState = state.deactivate();
//         expect(newState.args).toMatchObject(_.omit(args, ['active']));
//     });
// });
//
// describe('Slot.hash', () => {
//     test('equals for equal stack', () => {
//         expect(someState.hash()).toEqual(
//             new Slot({ value: value }).hash()
//         );
//     });
//     test('differs for other stack', () => {
//         expect(someState.hash()).not.toEqual(emptyState.hash());
//     });
// });
