export default class Computed {
    _value;
    getter;
    isReady = false;
    isDeprecated = true;

    constructor(getter) {
        this.getter = getter;
    }

    compute() {
        this.value = this.getter();
        this.isDeprecated = false;
        return this.value;
    }

    deprecate() {
        this.isDeprecated = true;
    }

    get value() {
        if (this.isDeprecated) return this.compute();
        return this._value;
    }

    set value(val) {
        this._value = val;
        return true;
    }
}