import _ from 'lodash';

import serialization from '../../utils/serialization';
import resourceStackFactory from '../ResourceStack';
import SlotState from '../SlotState';


const emptyState = new SlotState();
const value = {
    hash: () => 'hash of value',
    toJSON: () => '{"name":"value"}'
};
const otherValue = {
    hash: () => 'hash of otherValue',
    toJSON: () => '{"name":"otherValue"}'
};

const customIsFull = () => true;
serialization.registerFactory('SlotState', 'isFull', 'customIsFull', customIsFull);

const someState = emptyState.setValue(value);
const args = { value: value, active: false, isFull: customIsFull };


describe('SlotState constructor', () => {
    test('without args', () => {
        expect(new SlotState())
            .toMatchObject({ _value: null, _active: true, args: {} });
    });
    test('with args', () => {
        const args = { value: value, active: false, isFull: customIsFull };
        expect(new SlotState(args)).toMatchObject(
            { _value: value, _active: false, args: args }
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
    test('returns state with the same args', () => {
        const state = new SlotState(args);
        const newState = state.setValue(otherValue);
        expect(newState.args).toMatchObject(_.omit(args, ['value']));
        expect(newState.args.value).toBe(otherValue);
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
        const otherState = new SlotState(someState.args);
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
    test('returns state with the same args', () => {
        const state = new SlotState(args);
        const newState = state.activate();
        expect(newState.args).toMatchObject(_.omit(args, ['active']));
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
    test('returns state with the same args', () => {
        const state = new SlotState(args);
        const newState = state.deactivate();
        expect(newState.args).toMatchObject(_.omit(args, ['active']));
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
    const serializedEmpty = '{"type":"SlotState","args":{}}';
    const valueStr = 'value';
    const serializedStr = '{"type":"SlotState","args":{"value":"value"}}';
    const valueObj = { name: 'value' };
    const serializedObj = '{"type":"SlotState","args":{"value":{"name":"value"}}}';
    const valueEmptyObj = {};
    const serializedEmptyObj = '{"type":"SlotState","args":{"value":{}}}';
    const valueStack = new (resourceStackFactory(['tokens'], 'TokenStack'))({ tokens: 7 });
    const serializedStack = (
        `{"type":"SlotState","args":{"value":${serialization.serialize(valueStack)}}}`
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
