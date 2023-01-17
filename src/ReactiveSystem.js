import Ref from './Ref.js';
import Computed from './Computed.js';

export default class ReactiveSystem {
    deps = new WeakMap(); // [Ref | Computed]: Set<Computed | watcher>
    computing = []; // Array<Computed | watcher>
    triggeredWatchers = new Set(); // Set<watcher>

    computed(getter) {
        return this.proxy(new Computed(getter));
    }

    ref(value) {
        return this.proxy(new Ref(value));
    }

    reactive(objectValue) {
        return this.proxy(objectValue);
    }

    isComputed(ref) {
        return ref instanceof Computed;
    }

    watch(handler) {
        this.computing.push(handler);
        handler();
        this.computing.pop();
    }

    proxy(ref) {
        const rs = this;
        return new Proxy(ref, {
            get(target, prop) {
                 // if something is computing now, then this target is dependency (Moment when I am glad js is single threaded)
                if (rs.computing.length) rs.addDependency(target);

                if (rs.isComputed(target) && !target.isReady) {
                    rs.computing.push(target);
                    const value = target[prop];
                    rs.computing.pop();
                    target.isReady = true;
                    return value;
                }

                return Reflect.get(...arguments);
            },
            set(target, prop, value) {
                const isNewValue = target[prop] !== value;
                Reflect.set(...arguments);
                if (isNewValue) rs.triggerDependencies(target);
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
        this.deps.get(ref)?.forEach(computedOrWatcher => {
            if (this.isComputed(computedOrWatcher)) {
                computedOrWatcher.deprecate();
                this.triggerDependencies(computedOrWatcher);
            } else if (typeof computedOrWatcher === 'function' && !this.triggeredWatchers.has(computedOrWatcher)) {
                this.triggeredWatchers.add(computedOrWatcher);
                queueMicrotask(() => {
                    computedOrWatcher();
                    this.triggeredWatchers.delete(computedOrWatcher);
                });
            }
        });
    }
}