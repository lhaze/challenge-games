import { ResourceStack, ResourceException } from '../ResourceStack';


class TestResourceStack extends ResourceStack {
    static getResourceLiterals() {
        return new Set(['red', 'green', 'blue']);
    }
}


test('adding another resource stack', () => {
    const stack = new TestResourceStack({red: 2});
    const new_stack = new TestResourceStack({blue: 1, red: 1});
    expect(stack.add(new_stack)).objectContaining({
        blue: 1,
        red: 3,
    })
});

test('raises an error on using undefined resource name', () => {
    expect(() => {
        new TestResourceStack({'blue': 1, 'green': 2, 'white': 3})
    }).toThrowError(ResourceException);
});
