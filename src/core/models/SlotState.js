import _ from 'lodash';

function isMatchingType(types) {
    console.assert(!!types, 'No types to check for matching');
    return !_.isEmpty(_.intersection(this.types, types));
}

function isFullExistence() {
    return !this.isEmpty();
}


class SlotState {
    /** Immutable state of the slot */

    constructor(types, options = {}) {
        console.assert(!!types, 'No type given to a SlotState instance');
        this.types = _.isArray(types) ? types : [types];
        this.options = options;
        this._value = options.value || null;
        this.isMatching = options.isMatching || isMatchingType.bind(this);
        this._active = options.active || true;
        this.isFull = options.isFull || isFullExistence.bind(this);
    }

    get value() {
        return this._value;
    }

    setValue(value) {
        console.assert(value.types, 'Given value does not declare its types');
        console.assert(this.isMatching(value.types),
            'Value type(s) are not matching to the slot'
        );
        return this._value === value ? this :
            new SlotState(this.types, _.assign(_.clone(this.options), { value: value }));
    }

    clear() {
        return this.isEmpty() ? this :
            new SlotState(this.types, _.assign(_.clone(this.options), { value: null }));
    }

    isEmpty() {
        return this._value === null;
    }

    get active() {
        return this._active;
    }

    activate() {
        return this.active ? this :
            new SlotState(this.types, _.assign(_.clone(this.options), { active: true }));
    }

    deactivate() {
        return !this.active ? this :
            new SlotState(this.types, _.assign(_.clone(this.options), { active: false }));
    }
}

export default SlotState;
