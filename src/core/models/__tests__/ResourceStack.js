import resourceStackFactory from '../ResourceStack';


const TestStack = resourceStackFactory(['red', 'green', 'blue']);
const stackCyan = new TestStack({ blue: 1, green: 2 });
const stackYellow = new TestStack({ red: 1, green: 1, white: 3 });


describe('ResourceStack constructor', () => {
    test('is mapping keys', () => {
        expect(stackYellow).toMatchObject({ red: 1, green: 1 });
    });
    test('when unexpected keys happen', () => {
        expect(stackYellow).not.toHaveProperty('white');
    });
});

describe('ResourceStack.add', () => {
    test('on ResourceStack', () => {
        expect(stackCyan.add(stackYellow))
            .toMatchObject({ blue: 1, red: 1, green: 3 });
    });
    test('on object', () => {
        expect(stackCyan.add({ blue: 10 }))
            .toMatchObject({ blue: 11, green: 2 });
    });
});

describe('ResourceStack.subtract', () => {
    test('on ResourceStack', () => {
        expect(stackCyan.subtract(stackYellow))
            .toMatchObject({ blue: 1, green: 1, red: -1 });
    });
    test('on object', () => {
        expect(stackCyan.subtract({ blue: 2, green: 3 }))
            .toMatchObject({ blue: -1, green: -1, red: 0 });
    });
});

describe('ResourceStack.isPositive', () => {
    test('on an empty stack', () => {
        expect(new TestStack().isPositive()).toBeTruthy();
    });
    test('on a negative stack', () => {
        expect(new TestStack({ red: -1 }).isPositive()).toBeFalsy();
    });
    test('on a mixed stack', () => {
        expect(new TestStack({ red: -1, green: 1 }).isPositive()).toBeFalsy();
    });
    test('on a positive stack', () => {
        expect(stackCyan.isPositive()).toBeTruthy();
    });
});

describe('ResourceStack.isContaining', () => {
    test('on self', () => {
        expect(stackCyan.isContaining(stackCyan)).toBeTruthy();
    });
    test('on an empty stack', () => {
        expect(stackCyan.isContaining(new TestStack())).toBeTruthy();
    });
    test('on a negative stack', () => {
        expect(stackCyan.isContaining(new TestStack({ blue: -1 }))).toBeFalsy();
    });
    test('on a mixed stack', () => {
        expect(stackCyan.isContaining(new TestStack({ blue: -1, green: 1 }))).toBeFalsy();
    });
    test('on a positive stack', () => {
        expect(stackCyan.isContaining(new TestStack({ blue: 1, green: 1 }))).toBeTruthy();
    });
});

describe('ResourceStack.isEqual', () => {
    test('on an equal ResourceStack', () => {
        const otherStackCyan = new TestStack({ blue: 1, green: 2 });
        expect(stackCyan.isEqual(otherStackCyan)).toBeTruthy();
    });
    test('on a different ResourceStack', () => {
        expect(stackCyan.isEqual(stackYellow)).toBeFalsy();
    });
    test('on an equal object', () => {
        expect(stackCyan.isEqual({ blue: 1, green: 2 })).toBeTruthy();
    });
    test('on a different object', () => {
        expect(stackCyan.isEqual({ blue: 3, green: 2 })).toBeFalsy();
    });
    test('on nil', () => {
        expect(stackCyan.isEqual(null)).toBeFalsy();
    });
});

describe('ResourceStack.hash', () => {
    test('equals for equal state', () => {
        expect(stackYellow.hash()).toEqual(
            new TestStack({ red: 1, green: 1, white: 3 }).hash()
        );
    });
    test('differs for other stack', () => {
        expect(stackYellow.hash()).not.toEqual(stackCyan.hash());
    });
});
