import ResourceStack from './ResourceStack';
import * as Slot from './Slot';


function getModelName(type) { return type.split('.')[0]; }

export function getModel(ctx, type) {
    console.assert(name, `No name of model provided: ${type}`);
    const modelName = getModelName(type);
    const model = {
        'ResourceStack': ResourceStack(ctx),
        'Slot': Slot
    }[modelName];
    console.assert(model, `No model found: ${modelName}`);
    return model;
}

export default function getModelFunction(ctx, type, name) {
    const model = getModel(ctx, type);
    const func = model[name];
    console.assert(func, `No '${name}' operation on model '${model.name}'`);
    return func;
}
