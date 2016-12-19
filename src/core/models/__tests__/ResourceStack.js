import { ResourceStack, ResourceError } from '../ResourceStack';


const TestResourceStack = class TestResourceStack extends ResourceStack {
    static getResourceLiterals() {
        return new Set(['red', 'green', 'blue']);
    }
};


it('raises an error on using unknown resource name', () => {
    expect(() => {
        const stack = new TestResourceStack({'blue': 1, 'green': 2, 'white': 3});
    }).toThrowError(ResourceError);
});
