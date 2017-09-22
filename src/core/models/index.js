import _ from 'lodash';
import ResourceStack from './ResourceStack';
import Slot from './Slot';


function getModelName(type) { return type.split('.')[0]; }

export default function getModel(ctx, type) {
    console.assert(name, `No name of model provided: ${type}`);
    const modelName = getModelName(type);
    const model = {
        'ResourceStack': ResourceStack(ctx),
        'Slot': Slot(ctx)
    }[modelName];
    console.assert(model, `No model found: ${modelName}`);
    return model;
}
