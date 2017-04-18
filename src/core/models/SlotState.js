import _ from 'lodash';


class SlotState {
    /** Immutable state of the slot */

    constructor(types, { value = null, isMatching = null } = {}) {
        console.assert(!!types, 'No type given to a SlotState instance');
        this.types = _.isArray(types) ? types : [types];
        this._value = value;
        this.isMatching = isMatching || ((types) => {
            console.assert(!!types, 'No types to check for matching');
            return !_.isEmpty(_.intersection(this.types, types));
        });
    }

    get value() {
        return this._value;
    }

    setValue(value) {
        console.assert(value.types, 'Given value does not declare its types');
        console.assert(this.isMatching(value.types),
            'Value type(s) are not matching to the slot'
        );
        return new SlotState(this.types, { value: value, isMatching: this.isMatching });
    }
}

export default SlotState;
