import _ from 'lodash';
import {
    CanPushValuePolicy,
    IsFullPolicy,
    isFull,
    canPushValue
} from '../Slot';
import bindSlot from '../Slot';


const ctx = {
    'Slot.field': {},
    'ResourceStack.tokens': {
        resourceNames: ['tokens']
    }
};
const Slot = bindSlot(ctx);
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


describe('Slot.isEmpty', () => {
    test('on empty state', () => {
        expect(Slot.isEmpty(emptyState)).toBeTruthy();
    });
    test('on state with nil value', () => {
        const state = _.assign(_.clone(someState), { value: null });
        expect(Slot.isEmpty(state)).toBeTruthy();
    });
    test('on state with value', () => {
        expect(Slot.isEmpty(someState)).toBeFalsy();
    });
});

describe('Slot.isActive', () => {
    test('on empty state', () => {
        expect(Slot.isActive(emptyState)).toBeTruthy();
    });
    test('on an active state', () => {
        expect(Slot.isActive(someState)).toBeTruthy();
    });
    test('on an inactive state', () => {
        const state = _.assign(_.clone(someState), { active: false });
        expect(Slot.isActive(state)).toBeFalsy();
    });
});

describe('Slot.isFull', () => {
    test('on empty state', () => {
        expect(Slot.isFull(emptyState)).toBeFalsy();
    });
    test('on an state with value and without strategy', () => {
        expect(Slot.isFull(someState)).toBeTruthy();
    });
    test('raises on a wrong strategy name', () => {
        const state = _.assign(_.clone(someState), { isFullStrategy: 'foo' });
        expect(() => Slot.isFull(state)).toThrow();
    });
    test('on an state with value and "always" strategy on state', () => {
        const state = _.assign(_.clone(someState), { isFullStrategy: 'always' });
        expect(Slot.isFull(state)).toBeTruthy();
    });
    test('on an state with value and "always" strategy on ctx', () => {
        const ctx = {
            'Slot.field': { isFullStrategy: 'always' }
        };
        expect(isFull(ctx, someState)).toBeTruthy();
    });
});

describe('Slot.IsFullPolicy', () => {
    test('always on a state with value', () => {
        expect(IsFullPolicy.always(ctx, someState)).toBeTruthy();
    });
    test('never on an empty state', () => {
        expect(IsFullPolicy.never(ctx, emptyState)).toBeFalsy();
    });
    test('maxValue on state', () => {
        const state = _.assign(_.clone(someState), { isFullStrategy: 'maxValue', maxValue: 7 });
        expect(IsFullPolicy.maxValue(ctx, state)).toBeTruthy();
    });
    test('maxValue on ctx', () => {
        const ctx = {
            'Slot.field': { isFullStrategy: 'maxValue', maxValue: 7 },
            'ResourceStack.tokens': { resourceNames: ['tokens'] }
        };
        expect(IsFullPolicy.maxValue(ctx, someState)).toBeTruthy();
    });
    test('maxValue with a high limit', () => {
        const ctx = {
            'Slot.field': { isFullStrategy: 'maxValue', maxValue: 10 },
            'ResourceStack.tokens': { resourceNames: ['tokens'] }
        };
        expect(isFull(ctx, someState)).toBeFalsy();
    });
    test('maxValue with a low limit', () => {
        const ctx = {
            'Slot.field': { isFullStrategy: 'maxValue', maxValue: 2 },
            'ResourceStack.tokens': { resourceNames: ['tokens'] }
        };
        expect(isFull(ctx, someState)).toBeTruthy();
    });
});

describe('Slot.canPushValue', () => {
    const stateWithNever = addType({ setValueStrategy: 'never' });
    const otherCtx = {
        'Slot.field': { setValueStrategy: 'never' },
        'ResourceStack.tokens': { resourceNames: ['tokens'] }
    };
    test('empty on an empty state', () => {
        const { success, value, msg } = Slot.canPushValue(emptyState, someValue);
        expect(success).toBeTruthy();
        expect(value).toEqual(someValue);
        expect(msg).toBeNull();
    });
    test('empty on a state with value', () => {
        const { success, value, msg } = Slot.canPushValue(someState, otherValue);
        expect(success).toBeFalsy();
        expect(value).toBeNull();
        expect(msg).toEqual('CAN-PUSH-VALUE/EMPTY');
    });
    test('never on a state', () => {
        const { success, value, msg } = Slot.canPushValue(stateWithNever, someValue);
        expect(success).toBeFalsy();
        expect(value).toBeNull();
        expect(msg).toEqual('CAN-PUSH-VALUE/NEVER');
    });
    test('never on a context', () => {
        const { success, value, msg } = canPushValue(otherCtx, emptyState, someValue);
        expect(success).toBeFalsy();
        expect(value).toBeNull();
        expect(msg).toEqual('CAN-PUSH-VALUE/NEVER');
    });
});

describe('Slot.CanPushValuePolicy', () => {
    test('never on an empty state', () => {
        const { success, value, msg } = CanPushValuePolicy.never(ctx, emptyState, otherValue);
        expect(success).toBeFalsy();
        expect(value).toBeNull();
        expect(msg).toEqual('CAN-PUSH-VALUE/NEVER');
    });
    test('always on a state with value', () => {
        const { success, value, msg } = CanPushValuePolicy.always(ctx, someState, otherValue);
        expect(success).toBeTruthy();
        expect(value).toEqual(otherValue);
        expect(msg).toBeNull();
    });
    // CanPushValuePolicy.empty
    test('empty on an empty state', () => {
        const { success, value, msg } = CanPushValuePolicy.empty(ctx, emptyState, otherValue);
        expect(success).toBeTruthy();
        expect(value).toEqual(otherValue);
        expect(msg).toBeNull();
    });
    test('empty on a state with value', () => {
        const { success, value, msg } = CanPushValuePolicy.empty(ctx, someState, otherValue);
        expect(success).toBeFalsy();
        expect(value).toBeNull();
        expect(msg).toEqual('CAN-PUSH-VALUE/EMPTY');
    });
    test('empty on an empty value', () => {
        const { success, value, msg } = CanPushValuePolicy.empty(ctx, someState, null);
        expect(success).toBeTruthy();
        expect(value).toBeNull();
        expect(msg).toBeNull();
    });
    // CanPushValuePolicy.notEmpty
    test('notEmpty on a state with value', () => {
        const { success, value, msg } = CanPushValuePolicy.notEmpty(ctx, someState, otherValue);
        expect(success).toBeTruthy();
        expect(value).toEqual(otherValue);
        expect(msg).toBeNull();
    });
    test('notEmpty on an empty state', () => {
        const { success, value, msg } = CanPushValuePolicy.notEmpty(ctx, emptyState, otherValue);
        expect(success).toBeTruthy();
        expect(value).toEqual(otherValue);
        expect(msg).toBeNull();
    });
    test('notEmpty on an empty value', () => {
        const { success, value, msg } = CanPushValuePolicy.notEmpty(ctx, emptyState, null);
        expect(success).toBeFalsy();
        expect(value).toBeNull();
        expect(msg).toEqual('CAN-PUSH-VALUE/NOT-EMPTY');
    });
    test('notEmpty on an empty value', () => {
        const { success, value, msg } = CanPushValuePolicy.notEmpty(ctx, emptyState, otherValue);
        expect(success).toBeTruthy();
        expect(value).toEqual(otherValue);
        expect(msg).toBeNull();
    });
    // CanPushValuePolicy.type
    const typedState = addType({
        value: someValue,
        acceptedTypes: ['ResourceStack.tokens', 'foo']
    });
    test('type on an empty value', () => {
        const { success, value, msg } = CanPushValuePolicy.type(ctx, typedState, null);
        expect(success).toBeTruthy();
        expect(value).toBeNull();
        expect(msg).toBeNull();
    });
    test('type on an value of type', () => {
        const { success, value, msg } = CanPushValuePolicy.type(ctx, typedState, otherValue);
        expect(success).toBeTruthy();
        expect(value).toEqual(otherValue);
        expect(msg).toBeNull();
    });
    test('type on an value of other type', () => {
        const otherTypeValue = {
            type: 'bar',
            tokens: 7
        };
        const { success, value, msg } = CanPushValuePolicy.type(ctx, typedState, otherTypeValue);
        expect(success).toBeFalsy();
        expect(value).toBeNull();
        expect(msg).toEqual('CAN-PUSH-VALUE/TYPE');
    });
    test('type with acceptedTypes not defined', () => {
        const { success, value, msg } = CanPushValuePolicy.type(ctx, someState, someValue);
        expect(success).toBeFalsy();
        expect(value).toBeNull();
        expect(msg).toEqual('CAN-PUSH-VALUE/TYPE');
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
        const { success, value, msg } = CanPushValuePolicy.type(ctx, someState, otherValue);
        expect(success).toBeTruthy();
        expect(value).toEqual(otherValue);
        expect(msg).toBeNull();
    });
});

describe('Slot.pushValue', () => {
    test('on an empty state', () => {
        const { success, state, msg } = Slot.pushValue(emptyState, someValue);
        expect(success).toBeTruthy();
        expect(state).toEqual(someState);
        expect(msg).toBeNull();
    });
    test('on a state with the same value', () => {
        const { success, state, msg } = Slot.pushValue(someState, someValue);
        expect(success).toBeFalsy();
        expect(state).toEqual(someState);
        expect(msg).toEqual('VLD/SAME-VALUE');
    });
});

// describe('Slot.pushValue', () => {
//     test('returns new Slot instance when instance has been changed', () => {
//         expect(someState).not.toBe(emptyState);
//     });
//     test('returns the same instance when instance has not been changed', () => {
//         expect(Slot.pushValue(someState, value)).toBe(someState);
//     });
//     test('returns state given value', () => {
//         expect(someState.value).toBe(value);
//     });
//     test('returns state with the same args', () => {
//         const state = new Slot(args);
//         const newState = state.pushValue(otherValue);
//         expect(newState.args).toMatchObject(_.omit(args, ['value']));
//         expect(newState.args.value).toBe(otherValue);
//     });
// });
//
// describe('Slot.clear', () => {
//     test('returns new Slot instance when value was cleared', () => {
//         expect(Slot.clear(someState)).not.toBe(someState);
//     });
//     test('returns the same instance when value was not push', () => {
//         expect(Slot.clear(emptyState)).toBe(emptyState);
//     });
//     test('returns state with value cleared', () => {
//         expect(Slot.clear(someState)).toMatchObject({ value: null });
//     });
// });
//
// describe('Slot.isEmpty', () => {
//     test('false with empty value', () => {
//         expect(emptyState.isEmpty()).toBeTruthy();
//     });
//     test('false with value push', () => {
//         expect(someState.isEmpty()).toBeFalsy();
//     });
//     test('false after clearValue', () => {
//         expect(someState.clear().isEmpty()).toBeTruthy();
//     });
// });
//
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
