import Ref from './Ref.js';
import Computed from './Computed.js';

export default class ReactiveSystem {
    deps = new WeakMap(); // ref to set of computed
    computing = [];

    computed(getter) {
        const computed = new Computed();
        this.computing.push(computed);
        computed.applyGetter(getter);
        const proxiedComputed = this.proxy(computed);
        this.computing.pop();
        return proxiedComputed;
    }

    ref(value) {
        return this.proxy(new Ref(value));
    }

    reactive(objectValue) {
        return this.proxy(objectValue);
    }

    proxy(ref) {
        const rs = this;
        return new Proxy(ref, {
            get(target) {
                 // if something is computing now, then this target is dependency (Moment when I am glad js is single threaded)
                if (rs.computing.length) rs.addDependency(target);
                return Reflect.get(...arguments);
            },
            set(target) {
                Reflect.set(...arguments);
                rs.triggerDependencies(target);
                return true;
            },
            deleteProperty(target) {
                Reflect.deleteProperty(...arguments);
                rs.triggerDependencies(target);
                return true;
            }
        });
    }

    addDependency(ref) {
        if (this.deps.has(ref)) {
            this.deps.get(ref).add(this.computing.at(-1));
        } else {
            this.deps.set(ref, new Set([this.computing.at(-1)]));
        }
    }

    triggerDependencies(ref) {
        this.deps.get(ref)?.forEach(computed => {
            computed.deprecate();
            this.triggerDependencies(computed);
        });
    }
}