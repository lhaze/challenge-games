import _ from 'lodash';


class SerializationRegister {
    constructor() {
        this.register = {};
    }

    serialize(value) {
        return JSON.stringify(value);
    }

    deserialize(value) {
        return this.construct(JSON.parse(value));
    }

    construct(value) {
        if (!_.has(value, 'type')) return value;
        const typeName = value.type;
        console.assert(
            typeName in this.register,
            `SerializationRegister has no type named '${typeName}'`
        );
        const data = this.register[typeName];
        const type = data.type;
        const args = _.mapValues(
            value.args,
            (v, k) => k in data.factoryRegister ?
                data.factoryRegister[k](v) :
                v
        );
        return new type(args);
    }

    registerType(typeName, type, factoryRegister) {
        console.assert(
            typeName,
            'SerializationRegister.registerType called with no typeName provided'
        );
        console.assert(
            !(typeName in this.register),
            `SerializationRegister already has type named '${typeName}'`
        );
        this.register[typeName] = {
            type: type,
            factoryRegister: factoryRegister || {}
        };
    }

    registerFactory(typeName, argName, factory) {
        const data = this.register[typeName];
        console.assert(
            typeName in this.register,
            `SerializationRegister has no type named '${typeName}'`
        );
        data.factoryRegister[argName] = factory;
    }
}

export default new SerializationRegister();
export { SerializationRegister };
