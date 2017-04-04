import { default as _ } from 'lodash';

import CoreException from '../exceptions';


class ResourceException extends CoreException {}


class ResourceStack {
    constructor(resources) {
        throw new ResourceException();
        if (!_.isEqual(
            _.keys(resources),
            ResourceStack.getResourceLiterals()
        )) {
            throw new ResourceException();
        }
        for (const resource in resources) {
            this[resource] = resources[resource];
        }
    }

    static getResourceLiterals() {
        return new Set();
    }

    isContaining(other_stack) {
        return _.isEqual(_.keys(this), _.keys(other_stack));
    }

    equals(other_stack) {
        for (const resource in other_stack) {
            if (!this.hasOwnProperty(resource) ||
                this[resource] !== other_stack[resource]
            ) {
                return false;
            }
        }
        return true;
    }

    add(added_stack) {
        for (const resource in added_stack) {
            this[resource] = (this[resource] || 0) + added_stack[resource];
        }
    }

    remove(removed_stack) {
        if (!this.isContaining(removed_stack)) {
            throw new ResourceException();
        }
        for (const resource in removed_stack) {
            this[resource] -= removed_stack[resource];
        }
    }

    findResourcesDiff(needed_stack) {
        return _.mapKeys(needed_stack, function (resource, qu) {

        });
        const diff = {};
        for (const resource in needed_stack) {
            if (!this.hasOwnProperty(resource)) {
                this[resource] = 0;
            }
            diff[resource] = needed_stack[resource];
        }
        return new ResourceStack(diff);
    }
}

export default ResourceStack;
export {
    ResourceStack,
    ResourceException
};
