import _ from 'lodash';

import serialization from '../../utils/serialization';
import resourceStackFactory from '../ResourceStack';
import Slot from '../Slot';
import * as bindSlot from '../Slot';


const ctx = {
    'Slot': {
        resourceNames: ['tokens']
    }
};
const Slot = bindSlot(ctx);
const f = function(state) {
    state.type = 'Slot';
    return state;
};

const emptyState = f({});
const value = {
    hash: () => 'hash of value',
    toJSON: () => '{"name":"value"}'
};
const otherValue = {
    hash: () => 'hash of otherValue',
    toJSON: () => '{"name":"otherValue"}'
};
const someState = Slot.setValue(emptyState, value);
const customIsFull = () => true;


describe('Slot.setValue', () => {
    test('returns new Slot instance when instance has been changed', () => {
        expect(someState).not.toBe(emptyState);
    });
    test('returns the same instance when instance has not been changed', () => {
        expect(Slot.setValue(someState, value)).toBe(someState);
    });
    test('returns state given value', () => {
        expect(someState.value).toBe(value);
    });
    test('returns state with the same args', () => {
        const state = new Slot(args);
        const newState = state.setValue(otherValue);
        expect(newState.args).toMatchObject(_.omit(args, ['value']));
        expect(newState.args.value).toBe(otherValue);
    });
});

describe('Slot.clear', () => {
    test('returns new Slot instance when value was cleared', () => {
        expect(Slot.clear(someState)).not.toBe(someState);
    });
    test('returns the same instance when value was not set', () => {
        expect(Slot.clear(emptyState)).toBe(emptyState);
    });
    test('returns state with value cleared', () => {
        expect(Slot.clear(someState)).toMatchObject({ value: null });
    });
});

describe('Slot.isEmpty', () => {
    test('false with empty value', () => {
        expect(emptyState.isEmpty()).toBeTruthy();
    });
    test('false with value set', () => {
        expect(someState.isEmpty()).toBeFalsy();
    });
    test('false after clearValue', () => {
        expect(someState.clear().isEmpty()).toBeTruthy();
    });
});

describe('Slot.isEqual', () => {
    test('on equal state', () => {
        const otherState = new Slot(someState.args);
        expect(someState.isEqual(otherState)).toBeTruthy();
    });
    test('on different state', () => {
        expect(someState.isEqual(emptyState)).toBeFalsy();
    });
    test('on nil', () => {
        expect(someState.isEqual(null)).toBeFalsy();
    });
});

describe('Slot.hasChangedValue', () => {
    test('true if value changed from null to some', () => {
        const newState = emptyState.setValue(otherValue);
        expect(newState.hasChangedValue(emptyState)).toBeTruthy();
    });
    test('false if value changed from null to falsy', () => {
        const newState = emptyState.setValue(0);
        expect(newState.hasChangedValue(emptyState)).toBeTruthy();
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
        const state = new Slot({ value: value, active: false });
        const newState = state.activate();
        expect(newState.hasChangedValue(state)).toBeFalsy();
    });
});


const inactiveState = new Slot({ active: false });
const activeState = new Slot({ active: true });

describe('Slot.activate', () => {
    test('returns new Slot instance when instance has been changed', () => {
        const newState = inactiveState.activate();
        expect(newState).not.toBe(inactiveState);
        expect(newState.active).toBeTruthy();
    });
    test('returns the same instance when instance has not been changed', () => {
        const newState = activeState.activate();
        expect(newState).toBe(activeState);
        expect(newState.active).toBeTruthy();
    });
    test('returns state with the same args', () => {
        const state = new Slot(args);
        const newState = state.activate();
        expect(newState.args).toMatchObject(_.omit(args, ['active']));
    });
});

describe('Slot.deactivate', () => {
    test('returns new Slot instance when instance has been changed', () => {
        const newState = activeState.deactivate();
        expect(newState).not.toBe(activeState);
        expect(newState.active).toBeFalsy();
    });
    test('returns the same instance when instance has not been changed', () => {
        const newState = inactiveState.deactivate();
        expect(newState).toBe(inactiveState);
        expect(newState.active).toBeFalsy();
    });
    test('returns state with the same args', () => {
        const state = new Slot(args);
        const newState = state.deactivate();
        expect(newState.args).toMatchObject(_.omit(args, ['active']));
    });
});

describe('Slot.hash', () => {
    test('equals for equal stack', () => {
        expect(someState.hash()).toEqual(
            new Slot({ value: value }).hash()
        );
    });
    test('differs for other stack', () => {
        expect(someState.hash()).not.toEqual(emptyState.hash());
    });
});

describe('Slot serialization', () => {
    const serializedEmpty = '{"type":"Slot","args":{}}';
    const valueStr = 'value';
    const serializedStr = '{"type":"Slot","args":{"value":"value"}}';
    const valueObj = { name: 'value' };
    const serializedObj = '{"type":"Slot","args":{"value":{"name":"value"}}}';
    const valueEmptyObj = {};
    const serializedEmptyObj = '{"type":"Slot","args":{"value":{}}}';
    const valueStack = new (resourceStackFactory(['tokens'], 'TokenStack'))({ tokens: 7 });
    const serializedStack = (
        `{"type":"Slot","args":{"value":${serialization.serialize(valueStack)}}}`
    );

    test('serialize empty state', () => {
        expect(serialization.serialize(emptyState)).toEqual(serializedEmpty);
    });
    test('deserialize empty state', () => {
        const result = serialization.deserialize(serializedEmpty);
        const expected = _.pick(emptyState, ['args', '_active', '_value']);
        expect(result).toMatchObject(expected);
    });
    test('serialize str value', () => {
        const state = emptyState.setValue(valueStr);
        expect(serialization.serialize(state)).toEqual(serializedStr);
    });
    test('deserialize str value', () => {
        const result = serialization.deserialize(serializedStr);
        expect(result).toMatchObject({
            args: { value: valueStr },
            _active: true,
            _value: valueStr
        });
    });
    test('serialize obj value', () => {
        const state = emptyState.setValue(valueObj);
        expect(serialization.serialize(state)).toEqual(serializedObj);
    });
    test('deserialize obj value', () => {
        const result = serialization.deserialize(serializedObj);
        expect(result).toMatchObject({
            args: { value: valueObj },
            _active: true,
            _value: valueObj
        });
    });
    test('serialize empty obj value', () => {
        const state = emptyState.setValue(valueEmptyObj);
        expect(serialization.serialize(state)).toEqual(serializedEmptyObj);
    });
    test('deserialize empty obj value', () => {
        const result = serialization.deserialize(serializedEmptyObj);
        expect(result).toMatchObject({
            args: { value: valueEmptyObj },
            _active: true,
            _value: valueEmptyObj
        });
    });
    test('serialize stack value', () => {
        const state = emptyState.setValue(valueStack);
        expect(serialization.serialize(state)).toEqual(serializedStack);
    });
    test('deserialize stack value', () => {
        const result = serialization.deserialize(serializedStack);
        expect(result).toMatchObject({
            args: { value: valueStack },
            _active: true,
            _value: valueStack
        });
    });
});
