import _ from 'lodash';
import { hash } from '../utils/hashable';
import serialization from '../utils/serialization';


export default function resourceStackFactory(resourceNames, stackName) {
    // eslint-disable-next-line no-param-reassign
    const name = stackName || 'noname';

    class ResourceStack {
        /** Immutable ValueObject representing stack of resources */

        constructor(resources) {
            console.assert(!!resourceNames, 'Any resource literals have to be defined');
            // eslint-disable-next-line no-param-reassign
            resources = resources || {};
            this.name = name;
            this.resourceNames = resourceNames;
            for (const resource of this.resourceNames) {
                const count = resources[resource] || 0;
                console.assert(_.isNumber(count), 'ResourceStack values should be numbers');
                this[resource] = count;
            }
        }

        isPositive() {
            for (const name of this.resourceNames) {
                if (this[name] < 0) return false;
            }
            return true;
        }

        isContaining(otherStack) {
            for (const name of this.resourceNames) {
                const thisOne = this[name];
                const thatOne = otherStack[name];
                if (thisOne < thatOne || thisOne < 0 || thatOne < 0) return false;
            }
            return true;
        }

        isEqual(otherStack) {
            if (!_.isObjectLike(otherStack) || this.stackName !== otherStack.stackName) {
                return false;
            }
            for (const name of this.resourceNames) {
                if (this[name] !== (otherStack[name] || 0)) return false;
            }
            return true;
        }

        // TODO: which style is better: add with loop or subtract with reduce?
        add(addend) {
            const sum = {};
            for (const name of this.resourceNames) {
                sum[name] = this[name] + (addend[name] || 0);
            }
            return new ResourceStack(sum);
        }

        subtract(subtrahend) {
            const difference = _.reduce(this.resourceNames, (obj, name) => {
                obj[name] = this[name] - (subtrahend[name] || 0);
                return obj;
            }, {});
            return new ResourceStack(difference);
        }

        hash() {
            if (!this._hash) {
                this._hash = hash(_.pick(this, this.resourceNames));
            }
            return this._hash;
        }

        toJSON() {
            return {
                type: `ResourceStack.${this.name}`,
                args: _.reduce(this.resourceNames, (obj, name) => {
                    obj[name] = this[name];
                    return obj;
                }, {})
            };
        }
    }

    serialization.registerType(`ResourceStack.${name}`, ResourceStack);
    return ResourceStack;
}
