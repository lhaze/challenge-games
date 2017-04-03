import { ResourceStack, ResourceException } from '../ResourceStack';


class TestResourceStack extends ResourceStack {
    static getResourceLiterals() {
        return new Set(['red', 'green', 'blue']);
    }
}


it('raises an error on using unknown resource name', () => {
    expect(
        new TestResourceStack({'blue': 1, 'green': 2, 'white': 3})
    ).toThrowError(ResourceException);
});
