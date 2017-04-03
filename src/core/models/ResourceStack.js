import { default as _ } from 'lodash';

import CoreException from '../exceptions';


class ResourceException extends CoreException {}


class ResourceStack {
    constructor(resources) {
        // throw new ResourceException();
        if (!_.isEqual(Object.keys(resources), ResourceStack.getResourceLiterals())) {}
        for (let key in resources) {
            this[key] = resources[key];
        }
    }

    static getResourceLiterals() {
        return new Set();
    }

    findResourcesDiff(needed_stack) {
        return {enough: 'enough'}
    }
}

export default ResourceStack;
export {
    ResourceStack,
    ResourceException
};
