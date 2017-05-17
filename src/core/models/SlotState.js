import _ from 'lodash';
import { getHash, hash } from '../utils/hashable';
import { registerState, serialize } from '../utils/serialization';


function isFullExistence() {
    return !this.isEmpty();
}


export default class SlotState {
    /** Immutable State object for a slot */

    constructor(options = {}) {
        this.options = options;
        this._value = options.value || null;
        this._active = _.isUndefined(options.active) ? true : options.active;
        this.isFull = options.isFull || isFullExistence.bind(this);
    }

    get value() {
        return this._value;
    }

    setValue(value) {
        return this._value === value ? this :
            new SlotState(_.assign(_.clone(this.options), { value: value }));
    }

    clear() {
        return this.isEmpty() ? this :
            new SlotState(_.assign(_.clone(this.options), { value: null }));
    }

    isEmpty() {
        return this._value === null;
    }

    hasChangedValue(otherState) {
        return getHash(this._value) !== getHash(otherState._value);
    }

    isEqual(otherState) {
        if (!_.isObjectLike(otherState)) return false;
        return _.isEqual(this.options, otherState.options);
    }

    get active() {
        return this._active;
    }

    activate() {
        return this.active ? this :
            new SlotState(_.assign({}, this.options, { active: true }));
    }

    deactivate() {
        return !this.active ? this :
            new SlotState(_.assign({}, this.options, { active: false }));
    }

    hash() {
        if (!this._hash) {
            this._hash = hash(this.options);
        }
        return this._hash;
    }

    toJSON() {
        return {
            type: 'SlotState',
            args: this.options
            // TODO update args with methods
        };
    }
}


registerState('SlotState', (args) => new SlotState(args), serialize);
