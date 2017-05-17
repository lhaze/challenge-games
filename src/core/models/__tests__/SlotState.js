import _ from 'lodash';

import serialization from '../../utils/serialization';
import SlotState from '../SlotState';


const emptyState = new SlotState();
const value = {
    hash: () => 'hash of value',
    toJSON: () => 'JSON of value'
};
const otherValue = {
    hash: () => 'hash of otherValue',
    toJSON: () => 'JSON of otherValue'
};
const someState = emptyState.setValue(value);
const customIsFull = () => true;
const options = { value: value, active: false, isFull: customIsFull };


describe('SlotState constructor', () => {
    test('without options', () => {
        expect(new SlotState())
            .toMatchObject({ _value: null, _active: true, options: {} });
    });
    test('with options', () => {
        const options = { value: value, active: false, isFull: customIsFull };
        expect(new SlotState(options)).toMatchObject(
            { _value: value, _active: false, options: options }
        );
    });
});

describe('SlotState.setValue', () => {
    test('returns new SlotState instance when instance has been changed', () => {
        expect(someState).not.toBe(emptyState);
    });
    test('returns the same instance when instance has not been changed', () => {
        expect(someState.setValue(value)).toBe(someState);
    });
    test('returns state given value', () => {
        expect(someState.value).toBe(value);
    });
    test('returns state with the same options', () => {
        const state = new SlotState(options);
        const newState = state.setValue(otherValue);
        expect(newState.options).toMatchObject(_.omit(options, ['value']));
        expect(newState.options.value).toBe(otherValue);
    });
});

describe('SlotState.clear', () => {
    test('returns new SlotState instance when value was cleared', () => {
        expect(someState.clear()).not.toBe(someState);
    });
    test('returns the same instance when value was not set', () => {
        expect(emptyState.clear()).toBe(emptyState);
    });
    test('returns state with value cleared', () => {
        expect(someState.clear()).toMatchObject({ _value: null });
    });
});

describe('SlotState.isEmpty', () => {
    test('false with empty value', () => {
        expect(emptyState.isEmpty()).toBeTruthy();
    });
    test('false with value set', () => {
        expect(someState.isEmpty()).toBeFalsy();
    });
    test('false after clear', () => {
        expect(someState.clear().isEmpty()).toBeTruthy();
    });
});

describe('SlotState.isEqual', () => {
    test('on equal state', () => {
        const otherState = new SlotState(someState.options);
        expect(someState.isEqual(otherState)).toBeTruthy();
    });
    test('on different state', () => {
        expect(someState.isEqual(emptyState)).toBeFalsy();
    });
    test('on nil', () => {
        expect(someState.isEqual(null)).toBeFalsy();
    });
});

describe('SlotState.hasChangedValue', () => {
    test('true if value changed from null to some', () => {
        const newState = emptyState.setValue(otherValue);
        expect(newState.hasChangedValue(emptyState)).toBeTruthy();
    });
    test('false if value changed from null to falsy', () => {
        const newState = emptyState.setValue(0);
        expect(newState.hasChangedValue(emptyState)).toBeFalsy();
    });
    test('false if slot was deactivated', () => {
        const newState = someState.deactivate();
        expect(newState.hasChangedValue(someState)).toBeFalsy();
    });
    test('true if value changed from some to other', () => {
        const newState = someState.setValue(otherValue);
        expect(newState.hasChangedValue(someState)).toBeTruthy();
    });
    test('false if value changed from some to the same', () => {
        const newState = emptyState.setValue(null);
        expect(newState.hasChangedValue(emptyState)).toBeFalsy();
    });
    test('false if slot was activated', () => {
        const state = new SlotState({ value: value, active: false });
        const newState = state.activate();
        expect(newState.hasChangedValue(state)).toBeFalsy();
    });
});


const inactiveState = new SlotState({ active: false });
const activeState = new SlotState({ active: true });

describe('SlotState.activate', () => {
    test('returns new SlotState instance when instance has been changed', () => {
        const newState = inactiveState.activate();
        expect(newState).not.toBe(inactiveState);
        expect(newState.active).toBeTruthy();
    });
    test('returns the same instance when instance has not been changed', () => {
        const newState = activeState.activate();
        expect(newState).toBe(activeState);
        expect(newState.active).toBeTruthy();
    });
    test('returns state with the same options', () => {
        const state = new SlotState(options);
        const newState = state.activate();
        expect(newState.options).toMatchObject(_.omit(options, ['active']));
    });
});

describe('SlotState.deactivate', () => {
    test('returns new SlotState instance when instance has been changed', () => {
        const newState = activeState.deactivate();
        expect(newState).not.toBe(activeState);
        expect(newState.active).toBeFalsy();
    });
    test('returns the same instance when instance has not been changed', () => {
        const newState = inactiveState.deactivate();
        expect(newState).toBe(inactiveState);
        expect(newState.active).toBeFalsy();
    });
    test('returns state with the same options', () => {
        const state = new SlotState(options);
        const newState = state.deactivate();
        expect(newState.options).toMatchObject(_.omit(options, ['active']));
    });
});

describe('SlotState.hash', () => {
    test('equals for equal stack', () => {
        expect(someState.hash()).toEqual(
            new SlotState({ value: value }).hash()
        );
    });
    test('differs for other stack', () => {
        expect(someState.hash()).not.toEqual(emptyState.hash());
    });
});

describe('SlotState serialization', () => {
    const state = new SlotState(options);
    const serialized = '{"type":"SlotState","args":{"value":"JSON of value","active":false}}';
    test('serialize', () => {
        expect(serialization.serialize(state)).toEqual(serialized);
    });
    test('deserialize', () => {
        const e = serialization.deserialize(serialized);
        expect(e).toMatchObject(state);
    });
});
