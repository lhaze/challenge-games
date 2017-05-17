class SerializationRegister {
    constructor() {
        this.register = {};
    }

    serialize(value) {
        return JSON.stringify(value);
    }

    deserialize(value) {
        const obj = JSON.parse(value);
        const typeName = obj.type;
        console.assert(typeName in this.register, `SerializationRegister has no type named ${typeName}`);
        const data = this.register[typeName];
        const deserializator = data.deserializator;
        return deserializator(obj.args);
    }

    registerState(name, deserializator, serializator) {
        console.assert(!(name in this.register));
        this.register[name] = {
            serializator: serializator || this.serialize,
            deserializator: deserializator
        };
    }
}

export default new SerializationRegister();
