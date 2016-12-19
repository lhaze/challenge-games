import { default as BaseResourceStack } from '../../core/models/ResourceStack';

class ResourceStack extends BaseResourceStack {
    static getResourceLiterals() {
        return new Set(['money', 'influence', 'improbability']);
    }
}

export default ResourceStack;
