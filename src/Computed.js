export default class Computed {
    _value;
    getter;
    deprecated = false;

    applyGetter(getter) {
        this.getter = getter;
        this.compute();
    }

    compute() {
        this.value = this.getter();
        this.deprecated = false;
        return this.value;
    }

    deprecate() {
        this.deprecated = true;
    }

    get value() {
        if (this.deprecated) return this.compute(); // computed are lazy all time except first initialization
        return this._value;
    }

    set value(val) {
        this._value = val;
        return true;
    }
}