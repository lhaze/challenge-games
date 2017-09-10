import _ from 'lodash';
import _hash from 'object-hash';


export function hash(value) {
    // maybe sth more here later
    return _hash.MD5(value);
}


export function getHash(value) {
    if (_.isNil(value)) return null;
    if (_.has(value, 'hash')) return value.hash();
    return hash(value);
}
