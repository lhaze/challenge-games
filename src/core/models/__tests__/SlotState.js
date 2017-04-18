import SlotState from '../SlotState';


describe('SlotState constructor', () => {
    test('with one type', () => {
        expect(new SlotState('type').types).toEqual(['type']);
    });
    test('with multiple types', () => {
        expect(
            new SlotState(['matching', 'nonMatching']).types
        ).toEqual(['matching', 'nonMatching']);
    });
    test('without types', () => {
        // eslint-disable-next-line no-new
        expect(() => {new SlotState();}).toThrow();
    });
});

describe('SlotState.isMatching', () => {
    const state = new SlotState(['matching']);

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
    const state = new SlotState(['matching']);
    const value = { types: ['matching'] };
    const newState = state.setValue(value);

    test('returns new SlotState instance', () => {
        expect(newState).not.toBe(state);
    });
    test('returns state given value', () => {
        expect(newState.value).toBe(value);
    });
    test('returns state with the same options', () => {
        expect(newState).toMatchObject({ types: state.types, isMatching: state.isMatching });
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
