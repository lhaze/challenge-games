import _ from 'lodash';


function isFullExistence() {
    return !this.isEmpty();
}

const safeHash = (value) => _.isNil(value) ? null : value.hash();


class SlotState {
    /** Immutable state of the slot */

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
        return safeHash(this._value) !== safeHash(otherState._value);
    }

    get active() {
        return this._active;
    }

    activate() {
        return this.active ? this :
            new SlotState(_.assign(_.clone(this.options), { active: true }));
    }

    deactivate() {
        return !this.active ? this :
            new SlotState(_.assign(_.clone(this.options), { active: false }));
    }
}

export default SlotState;
