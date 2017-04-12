import { default as _ } from 'lodash';


function resourceStackFactory(resourceNames) {

    class ResourceStack {

        constructor(resources) {
            console.assert(!!resourceNames, 'Any resource literals have to be defined');
            // eslint-disable-next-line no-param-reassign
            resources = resources || {};
            this.resourceNames = resourceNames;
            for (const name of this.resourceNames) {
                const count = resources[name] || 0;
                console.assert(_.isNumber(count), 'ResourceStack values should be numbers');
                this[name] = count;
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
                const t = this[name], o = otherStack[name];
                if (t < o || t < 0 || o < 0) return false;
            }
            return true;
        }

        isEqual(otherStack) {
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
    }

    return ResourceStack;
}

export default resourceStackFactory;
