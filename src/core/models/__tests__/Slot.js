import _ from 'lodash';
import {
    isFull,
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
const emptyState = addType({});
const someState = addType({
    value: {
        type: 'ResourceStack.tokens',
        tokens: 7
    },
    active: true
});


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
    test('on an state with value and "never" strategy on state', () => {
        const state = _.assign(_.clone(someState), { isFullStrategy: 'never' });
        expect(Slot.isFull(state)).toBeFalsy();
    });
    test('on an state with value and "never" strategy on ctx', () => {
        const ctx = {
            'Slot.field': { isFullStrategy: 'never' }
        };
        expect(isFull(ctx, someState)).toBeFalsy();
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
    test('on an state with high value and "limit" strategy on state', () => {
        const state = _.assign(_.clone(someState), { isFullStrategy: 'limit', limit: 7 });
        expect(Slot.isFull(state)).toBeTruthy();
    });
    test('on an state with low value and "limit" strategy on state', () => {
        const state = _.assign(_.clone(someState), { isFullStrategy: 'limit', limit: 10 });
        expect(Slot.isFull(state)).toBeFalsy();
    });
    test('on an state with high value and "limit" strategy on ctx', () => {
        const ctx = {
            'Slot.field': { isFullStrategy: 'limit', limit: 7 },
            'ResourceStack.tokens': { resourceNames: ['tokens'] }
        };
        expect(isFull(ctx, someState)).toBeTruthy();
    });
    test('on an state with high value and "limit" strategy on ctx', () => {
        const ctx = {
            'Slot.field': { isFullStrategy: 'limit', limit: 10 },
            'ResourceStack.tokens': { resourceNames: ['tokens'] }
        };
        expect(isFull(ctx, someState)).toBeFalsy();
    });
});

// describe('Slot.setValue', () => {
//     test('returns new Slot instance when instance has been changed', () => {
//         expect(someState).not.toBe(emptyState);
//     });
//     test('returns the same instance when instance has not been changed', () => {
//         expect(Slot.setValue(someState, value)).toBe(someState);
//     });
//     test('returns state given value', () => {
//         expect(someState.value).toBe(value);
//     });
//     test('returns state with the same args', () => {
//         const state = new Slot(args);
//         const newState = state.setValue(otherValue);
//         expect(newState.args).toMatchObject(_.omit(args, ['value']));
//         expect(newState.args.value).toBe(otherValue);
//     });
// });
//
// describe('Slot.clear', () => {
//     test('returns new Slot instance when value was cleared', () => {
//         expect(Slot.clear(someState)).not.toBe(someState);
//     });
//     test('returns the same instance when value was not set', () => {
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
//     test('false with value set', () => {
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
//         const newState = emptyState.setValue(otherValue);
//         expect(newState.hasChangedValue(emptyState)).toBeTruthy();
//     });
//     test('false if value changed from null to falsy', () => {
//         const newState = emptyState.setValue(0);
//         expect(newState.hasChangedValue(emptyState)).toBeTruthy();
//     });
//     test('false if slot was deactivated', () => {
//         const newState = someState.deactivate();
//         expect(newState.hasChangedValue(someState)).toBeFalsy();
//     });
//     test('true if value changed from some to other', () => {
//         const newState = someState.setValue(otherValue);
//         expect(newState.hasChangedValue(someState)).toBeTruthy();
//     });
//     test('false if value changed from some to the same', () => {
//         const newState = emptyState.setValue(null);
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
