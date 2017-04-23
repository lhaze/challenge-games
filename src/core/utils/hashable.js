import _ from 'lodash';
import _hash from 'object-hash';


export function hash(value) {
    // TODO: options?
    return _hash.MD5(value);
}


export function getHash(value) {
    return _.isNil(value) ? null : value.hash();
}
