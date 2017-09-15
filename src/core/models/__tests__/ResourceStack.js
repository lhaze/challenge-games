import bindResourceStack from '../ResourceStack';
import serialization from '../../utils/serialization';

const ctx = {
    'ResourceStack.tokens': {
        resourceNames: ['tokens']
    },
    'ResourceStack.colors': {
        resourceNames: ['red', 'green', 'blue']
    }
};
const ResourceStack = bindResourceStack(ctx);
const typeSymbol = Symbol.for('type');
const _ = function(state) {
    state[typeSymbol] = 'ResourceStack.colors';
    return state;
};

const tokensState = {
    [typeSymbol]: 'ResourceStack.tokens',
    tokens: 7
};
const stateCyan = _({
    red: 1,
    green: 2
});
const stateYellow = _({
    red: 1,
    green: 1,
    blue: 3
});


describe('ResourceStack.validateState', () => {
    test('is mapping keys', () => {
        expect(stateYellow).toMatchObject({ red: 1, green: 1 });
    });
    test('when unexpected keys happen', () => {
        expect(stateYellow).not.toHaveProperty('white');
    });
});


describe('ResourceStack.isEmpty', () => {
    test('on null', () => {
        expect(ResourceStack.isEmpty(null)).toBeTruthy();
    });
    test('on undefined', () => {
        expect(ResourceStack.isEmpty(undefined)).toBeTruthy();
    });
    test('on an empty stack', () => {
        const state = _({});
        expect(ResourceStack.isEmpty(state)).toBeTruthy();
    });
    test('on stack with only zero', () => {
        const state = _({ green: 0 });
        expect(ResourceStack.isEmpty(state)).toBeTruthy();
    });
    test('on negative stack', () => {
        const state = _({ red: -1 });
        expect(ResourceStack.isEmpty(state)).toBeFalsy();
    });
    test('on positive stack', () => {
        const state = _({ red: 1 });
        expect(ResourceStack.isEmpty(state)).toBeFalsy();
    });
    test('on stack with zero and anything else', () => {
        const state = _({ red: 1, green: 0 });
        expect(ResourceStack.isEmpty(state)).toBeFalsy();
    });
});

describe('ResourceStack.isPositive', () => {
    test('on an empty stack', () => {
        const state = _({});
        expect(ResourceStack.isPositive(state)).toBeTruthy();
    });
    test('on a negative stack', () => {
        const state = _({ red: -1 });
        const result = ResourceStack.isPositive(state);
        expect(result).toBeFalsy();
    });
    test('on a mixed stack', () => {
        const state = _({ red: -1, green: 1 });
        expect(ResourceStack.isPositive(state)).toBeFalsy();
    });
    test('on a positive stack', () => {
        expect(ResourceStack.isPositive(stateCyan)).toBeTruthy();
    });
});

describe('ResourceStack.isEqual', () => {
    test('on self', () => {
        expect(ResourceStack.isEqual(stateCyan, stateCyan)).toBeTruthy();
    });
    test('on a different state of the same type', () => {
        expect(ResourceStack.isEqual(stateYellow)).toBeFalsy();
    });
    test('on an equal object', () => {
        const other = _({ red: 1, green: 2 });
        expect(ResourceStack.isEqual(stateCyan, other)).toBeTruthy();
    });
    test('on a different type of ResourceStack', () => {
        expect(() => ResourceStack.isEqual(stateCyan, tokensState)).toThrow();
    });
    test('on nil', () => {
        expect(ResourceStack.isEqual(stateCyan, null)).toBeFalsy();
    });
    test('nil on nil', () => {
        expect(ResourceStack.isEqual(undefined, null)).toBeTruthy();
    });
});

describe('ResourceStack.isContaining', () => {
    test('on self', () => {
        expect(ResourceStack.isContaining(stateCyan, stateCyan)).toBeTruthy();
    });
    test('on an empty state', () => {
        expect(ResourceStack.isContaining(stateCyan, _({}))).toBeTruthy();
    });
    test('on a negative state', () => {
        const negativeState = _({ blue: -1 });
        expect(ResourceStack.isContaining(stateCyan, negativeState)).toBeFalsy();
    });
    test('on a mixed stack', () => {
        const mixedState = _({ blue: -1, green: 1 });
        expect(ResourceStack.isContaining(stateCyan, mixedState)).toBeFalsy();
    });
    test('on a positive stack', () => {
        const positiveState = _({ red: 1, green: 1 });
        expect(ResourceStack.isContaining(stateCyan, positiveState)).toBeTruthy();
    });
});

describe('ResourceStack.add', () => {
    test('on ResourceStack', () => {
        expect(ResourceStack.add(stateCyan, stateYellow))
            .toMatchObject({ red: 2, green: 3, blue: 3 });
    });
    test('on object', () => {
        expect(ResourceStack.add(stateCyan, _({ red: 10 })))
            .toMatchObject({ red: 11, green: 2 });
    });
    test('on nil', () => {
        expect(ResourceStack.add(stateCyan, null))
            .toMatchObject(stateCyan);
        expect(ResourceStack.add(null, stateCyan))
            .toMatchObject(stateCyan);
    });
});

describe('ResourceStack.subtract', () => {
    test('on ResourceStack', () => {
        expect(ResourceStack.subtract(stateCyan, stateYellow))
            .toMatchObject({ blue: -3, green: 1, red: 0 });
    });
    test('on nil', () => {
        // expect(ResourceStack.subtract(stateCyan, null))
        //     .toMatchObject(stateCyan);
        expect(ResourceStack.subtract(null, stateCyan))
            .toMatchObject({ blue: 0, green: -2, red: -1 });
    });
});

describe('ResourceStack serialization', () => {
    test('serialize', () => {
        console.log(ResourceStack.toJSON(stateCyan));
        expect(ResourceStack.toJSON(stateCyan)).toBe('{"red":1,"green":2}');
    });
});
