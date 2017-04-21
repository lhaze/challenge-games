import _ from 'lodash';
import SlotState from '../SlotState';


const state = new SlotState(['matching']);
const value = { types: ['matching'] };
const newState = state.setValue(value);


describe('SlotState constructor', () => {
    test('with one type', () => {
        expect(new SlotState('typeA').types).toEqual(['typeA']);
    });
    test('with multiple types', () => {
        expect(
            new SlotState(['typeA', 'typeB']).types
        ).toEqual(['typeA', 'typeB']);
    });
    test('without types', () => {
        // eslint-disable-next-line no-new
        expect(() => {new SlotState();}).toThrow();
    });
});

describe('SlotState.isMatching', () => {
    test('with one type', () => {
        expect(state.isMatching(['matching'])).toBeTruthy();
    });
    test('with multiple types', () => {
        expect(state.isMatching(['matching', 'otherNonMatching'])).toBeTruthy();
    });
    test('with non-matching type', () => {
        expect(state.isMatching(['otherNonMatching'])).toBeFalsy();
    });
    test('with non-matching types', () => {
        expect(state.isMatching(['otherNonMatching', 'anotherNonMatching'])).toBeFalsy();
    });
});

describe('SlotState.setValue', () => {
    test('returns new SlotState instance when instance has been changed', () => {
        expect(newState).not.toBe(state);
    });
    test('returns the same instance when instance has not been changed', () => {
        expect(newState.setValue(value)).toBe(newState);
    });
    test('returns state given value', () => {
        expect(newState.value).toBe(value);
    });
    test('returns state with the same options', () => {
        expect(newState).toMatchObject({ types: state.types, options: state.options });
    });
    test('returns state with the same custom isMatching callback', () => {
        const isMatching = () => { return true; };
        const state = new SlotState(['matching'], { isMatching: isMatching });
        const newState = state.setValue(value);
        expect(newState.isMatching).toBe(isMatching);
    });
    test('throws on value without types', () => {
        expect(() => {state.setValue({});}).toThrow();
    });
    test('throws on value with non-matching types', () => {
        expect(() => {state.setValue({ types: ['nonMatching'] });}).toThrow();
    });
});

describe('SlotState.isEmpty', () => {
    test('false with empty value', () => {
        expect(state.isEmpty()).toBeTruthy();
    });
    test('false with value set', () => {
        expect(newState.isEmpty()).toBeFalsy();
    });
    test('false after clear', () => {
        expect(newState.clear().isEmpty()).toBeTruthy();
    });
});

describe('SlotState.clear', () => {
    test('returns new SlotState instance when value was cleared', () => {
        expect(newState.clear()).not.toBe(newState);
    });
    test('returns the same instance when value was not set', () => {
        expect(state.clear()).toBe(state);
    });
    test('returns state with value cleared', () => {
        expect(state.clear()).toMatchObject({ _value: null });
    });
});
