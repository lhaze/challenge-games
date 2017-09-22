import bindResourceStack from '../ResourceStack';

const ctx = {
    'ResourceStack.tokens': {
        resourceNames: ['tokens']
    },
    'ResourceStack.colors': {
        resourceNames: ['red', 'green', 'blue']
    }
};
const ResourceStack = bindResourceStack(ctx);
const tokensState = {
    type: 'ResourceStack.tokens',
    tokens: 7
};
const stateCyan = {
    type: 'ResourceStack.colors',
    red: 1,
    green: 2
};
const stateYellow = {
    type: 'ResourceStack.colors',
    red: 1,
    green: 1,
    blue: 3
};


describe('ResourceStack.isEmpty', () => {
    test('on null', () => {
        expect(ResourceStack.isEmpty(null)).toBeTruthy();
    });
    test('on undefined', () => {
        expect(ResourceStack.isEmpty(undefined)).toBeTruthy();
    });
    test('on an empty stack', () => {
        const state = { type: 'ResourceStack.colors' };
        expect(ResourceStack.isEmpty(state)).toBeTruthy();
    });
    test('on stack with only zero', () => {
        const state = { green: 0, type: 'ResourceStack.colors' };
        expect(ResourceStack.isEmpty(state)).toBeTruthy();
    });
    test('on negative stack', () => {
        const state = { red: -1, type: 'ResourceStack.colors' };
        expect(ResourceStack.isEmpty(state)).toBeFalsy();
    });
    test('on positive stack', () => {
        const state = { red: 1, type: 'ResourceStack.colors' };
        expect(ResourceStack.isEmpty(state)).toBeFalsy();
    });
    test('on stack with zero and anything else', () => {
        const state = { red: 1, green: 0, type: 'ResourceStack.colors' };
        expect(ResourceStack.isEmpty(state)).toBeFalsy();
    });
});

describe('ResourceStack.isPositive', () => {
    test('on an empty stack', () => {
        const state = { type: 'ResourceStack.colors' };
        expect(ResourceStack.isPositive(state)).toBeTruthy();
    });
    test('on a negative stack', () => {
        const state = { type: 'ResourceStack.colors', red: -1 };
        const result = ResourceStack.isPositive(state);
        expect(result).toBeFalsy();
    });
    test('on a mixed stack', () => {
        const state = { type: 'ResourceStack.colors', red: -1, green: 1 };
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
        const other = { red: 1, green: 2, type: 'ResourceStack.colors' };
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
        const emptyState = { type: 'ResourceStack.colors' };
        expect(ResourceStack.isContaining(stateCyan, emptyState)).toBeTruthy();
    });
    test('on a negative state', () => {
        const negativeState = { type: 'ResourceStack.colors', blue: -1 };
        expect(ResourceStack.isContaining(stateCyan, negativeState)).toBeFalsy();
    });
    test('on a mixed stack', () => {
        const mixedState = { type: 'ResourceStack.colors', blue: -1, green: 1 };
        expect(ResourceStack.isContaining(stateCyan, mixedState)).toBeFalsy();
    });
    test('on a positive stack', () => {
        const positiveState = { type: 'ResourceStack.colors', red: 1, green: 1 };
        expect(ResourceStack.isContaining(stateCyan, positiveState)).toBeTruthy();
    });
});

describe('ResourceStack.add', () => {
    test('on ResourceStack', () => {
        expect(ResourceStack.add(stateCyan, stateYellow))
            .toMatchObject({ red: 2, green: 3, blue: 3 });
    });
    test('on object', () => {
        expect(ResourceStack.add(stateCyan, { type: 'ResourceStack.colors', red: 10 }))
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
            .toMatchObject({ type: 'ResourceStack.colors', blue: -3, green: 1, red: 0 });
    });
    test('on nil', () => {
        // expect(ResourceStack.subtract(stateCyan, null))
        //     .toMatchObject(stateCyan);
        expect(ResourceStack.subtract(null, stateCyan))
            .toMatchObject({ type: 'ResourceStack.colors', blue: 0, green: -2, red: -1 });
    });
});
