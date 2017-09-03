import _ from 'lodash';
import { getHash, hash } from '../utils/hashable';
import serialization from '../utils/serialization';


function isFullExistence() {
    return !this.isEmpty();
}


export default class SlotState {
    /** Immutable State object for a slot */

    constructor(args = {}) {
        this.args = args;
        this._value = _.isUndefined(args.value) ? null : args.value;
        this._active = _.isUndefined(args.active) ? true : args.active;
        this.isFull = (args.isFull || isFullExistence).bind(this);
    }

    get value() {
        return this._value;
    }

    setValue(value) {
        return this._value === value ? this :
            new SlotState(_.assign(_.clone(this.args), { value: value }));
    }

    clear() {
        return this.isEmpty() ? this :
            new SlotState(_.assign(_.clone(this.args), { value: null }));
    }

    isEmpty() {
        return this._value === null;
    }

    hasChangedValue(otherState) {
        return getHash(this._value) !== getHash(otherState._value);
    }

    isEqual(otherState) {
        if (!_.isObjectLike(otherState)) return false;
        return _.isEqual(this.args, otherState.args);
    }

    get active() {
        return this._active;
    }

    activate() {
        return this.active ? this :
            new SlotState(_.assign({}, this.args, { active: true }));
    }

    deactivate() {
        return !this.active ? this :
            new SlotState(_.assign({}, this.args, { active: false }));
    }

    hash() {
        if (!this._hash) {
            this._hash = hash(this.args);
        }
        return this._hash;
    }

    toJSON() {
        return {
            type: 'SlotState',
            args: this.args
        };
    }
}

serialization.registerType('SlotState', SlotState, {
    isFull: (value) => ({
        isFullExistence
    }[value]),
    value: serialization.construct.bind(serialization)
});
