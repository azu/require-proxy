const __module_proxys = new Map(); // cache
// should be global align with require
// For same path with require(path)
const requireOndemand = <T extends any>(path: string) => {
    if (path[0] === '.') {
        console.log("path", require.resolve(path));
        return require(path);
    }

    if (__module_proxys.has(path)) {
        return __module_proxys.get(path);
    }

    let _module: null | any = null;

    const _loadModule = function (path: string) {
        if (_module === null) {
            console.log("require", path);
            _module = require(path);
        }
    };

    // Why fn?
    // want to set `apply` trap
    // https://stackoverflow.com/questions/32360218/cant-set-apply-trap-to-proxy-object
    const dummyFn: any = function () {
    };
    return new Proxy(dummyFn, {
        getPrototypeOf(_dummyTarget: T): object | null {
            _loadModule(path);
            return Reflect.getPrototypeOf(_module);
        },
        setPrototypeOf(_dummyTarget: T, v: any): boolean {
            _loadModule(path);
            return Reflect.setPrototypeOf(_module, v);
        },
        isExtensible(_dummyTarget: T): boolean {
            _loadModule(path);
            return Reflect.isExtensible(_module);
        },
        preventExtensions(_dummyTarget: T): boolean {
            _loadModule(path);
            return Reflect.preventExtensions(_module);
        },
        getOwnPropertyDescriptor(
            _dummyTarget: T,
            p: PropertyKey
        ): PropertyDescriptor | undefined {
            _loadModule(path);
            return Reflect.getOwnPropertyDescriptor(_module, p);
        },
        has(_dummyTarget: T, p: PropertyKey): boolean {
            _loadModule(path);
            return Reflect.has(_module, p);
        },
        get(_dummyTarget: T, p: PropertyKey, receiver: any): any {
            _loadModule(path);
            return Reflect.get(_module, p, receiver);
        },
        set(_dummyTarget: T, p: PropertyKey, value: any, receiver: any): boolean {
            _loadModule(path);
            return Reflect.set(_module, p, value, receiver);
        },
        deleteProperty(_dummyTarget: T, p: PropertyKey): boolean {
            _loadModule(path);
            return Reflect.deleteProperty(_module, p);
        },
        defineProperty(
            _dummyTarget: T,
            p: PropertyKey,
            attributes: PropertyDescriptor
        ): boolean {
            _loadModule(path);
            return Reflect.defineProperty(_module, p, attributes);
        },
        ownKeys(_dummyTarget: T): PropertyKey[] {
            _loadModule(path);
            return Reflect.ownKeys(_module);
        },
        apply(_dummyTarget: T, thisArg: any, argArray: any): any {
            _loadModule(path);
            return Reflect.apply(_module as Function, thisArg, argArray);
        },
        construct(_dummyTarget: T, argArray: any, newTarget: any): object {
            _loadModule(path);
            return Reflect.construct(_module as Function, argArray, newTarget);
        }
    }) as T;
};

// tests
const bigquery = requireOndemand("@google-cloud/bigquery");
const query = bigquery();
console.log("bigquery", query);

const lodash = requireOndemand("lodash");
const u = lodash.uniq([1, 2, 3, 3, 4]);
console.log(u);
console.log("lodash.VERSION", lodash.VERSION);
console.log("lodash.uniq", lodash.uniq);

const A = requireOndemand("./class");
const a = new A();
console.log(a.method());
