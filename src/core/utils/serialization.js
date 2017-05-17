const register = {};


export function serialize(value) {
    return JSON.stringify(value);
}

export function deserialize(value) {
    const data = register[value.type];
    const deserializator = data.deserializator;
    return deserializator(value.args);
}

export function registerState(name, deserializator, serializator) {
    register[name] = {
        serializator: serializator,
        deserializator: deserializator
    };
}
