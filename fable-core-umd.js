(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.fableCore = mod.exports;
    }
})(this, function (exports) {
    "use strict";

    var __extends = undefined && undefined.__extends || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var fableGlobal = function () {
        var globalObj = typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : null;
        if (typeof globalObj.__FABLE_CORE__ == "undefined") {
            globalObj.__FABLE_CORE__ = {
                types: new Map(),
                symbols: {
                    interfaces: Symbol("interfaces"),
                    typeName: Symbol("typeName")
                }
            };
        }
        return globalObj.__FABLE_CORE__;
    }();
    var FSymbol = fableGlobal.symbols;
    exports.Symbol = FSymbol;
    function Tuple(x, y) {
        return [x, y];
    }
    exports.Tuple = Tuple;
    function Tuple3(x, y, z) {
        return [x, y, z];
    }
    exports.Tuple3 = Tuple3;
    var Util = function () {
        function Util() {}
        // For legacy reasons the name is kept, but this method also adds
        // the type name to a cache. Use it after declaration:
        // Util.setInterfaces(Foo.prototype, ["IFoo", "IBar"], "MyModule.Foo");
        Util.setInterfaces = function (proto, interfaces, typeName) {
            if (Array.isArray(interfaces) && interfaces.length > 0) {
                var currentInterfaces = proto[FSymbol.interfaces];
                if (Array.isArray(currentInterfaces)) {
                    for (var i = 0; i < interfaces.length; i++) if (currentInterfaces.indexOf(interfaces[i]) == -1) currentInterfaces.push(interfaces[i]);
                } else proto[FSymbol.interfaces] = interfaces;
            }
            if (typeName) {
                proto[FSymbol.typeName] = typeName;
                fableGlobal.types.set(typeName, proto.constructor);
            }
        };
        Util.hasInterface = function (obj) {
            var interfaceNames = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                interfaceNames[_i - 1] = arguments[_i];
            }
            return Array.isArray(obj[FSymbol.interfaces]) && obj[FSymbol.interfaces].some(function (x) {
                return interfaceNames.indexOf(x) >= 0;
            });
        };
        Util.getTypeFullName = function (cons) {
            if (cons.prototype && cons.prototype[FSymbol.typeName]) {
                return cons.prototype[FSymbol.typeName];
            } else {
                return cons.name || "unknown";
            }
        };
        Util.getTypeNamespace = function (cons) {
            var fullName = Util.getTypeFullName(cons);
            var i = fullName.lastIndexOf('.');
            return i > -1 ? fullName.substr(0, i) : "";
        };
        Util.getTypeName = function (cons) {
            var fullName = Util.getTypeFullName(cons);
            var i = fullName.lastIndexOf('.');
            return fullName.substr(i + 1);
        };
        Util.getRestParams = function (args, idx) {
            for (var _len = args.length, restArgs = Array(_len > idx ? _len - idx : 0), _key = idx; _key < _len; _key++) restArgs[_key - idx] = args[_key];
            return restArgs;
        };
        Util.toString = function (o) {
            return o != null && typeof o.ToString == "function" ? o.ToString() : String(o);
        };
        Util.equals = function (x, y) {
            if (x == null) return y == null;else if (y == null) return false;else if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y)) return false;else if (Array.isArray(x) || ArrayBuffer.isView(x)) return x.length != y.length ? false : Seq.fold2(function (prev, v1, v2) {
                return !prev ? prev : Util.equals(v1, v2);
            }, true, x, y);else if (x instanceof Date) return FDate.equals(x, y);else if (Util.hasInterface(x, "System.IEquatable")) return x.Equals(y);else return x === y;
        };
        Util.compare = function (x, y) {
            if (x == null) return y == null ? 0 : -1;else if (y == null) return -1;else if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y)) return -1;else if (Array.isArray(x) || ArrayBuffer.isView(x)) return x.length != y.length ? x.length < y.length ? -1 : 1 : Seq.fold2(function (prev, v1, v2) {
                return prev !== 0 ? prev : Util.compare(v1, v2);
            }, 0, x, y);else if (Util.hasInterface(x, "System.IComparable")) return x.CompareTo(y);else return x < y ? -1 : x > y ? 1 : 0;
        };
        Util.equalsRecords = function (x, y) {
            var keys = Object.getOwnPropertyNames(x);
            for (var i = 0; i < keys.length; i++) {
                if (!Util.equals(x[keys[i]], y[keys[i]])) return false;
            }
            return true;
        };
        Util.compareRecords = function (x, y) {
            var keys = Object.getOwnPropertyNames(x);
            for (var i = 0; i < keys.length; i++) {
                var res = Util.compare(x[keys[i]], y[keys[i]]);
                if (res !== 0) return res;
            }
            return 0;
        };
        Util.equalsUnions = function (x, y) {
            if (x.Case !== y.Case) return false;
            for (var i = 0; i < x.Fields.length; i++) {
                if (!Util.equals(x.Fields[i], y.Fields[i])) return false;
            }
            return true;
        };
        Util.compareUnions = function (x, y) {
            var res = Util.compare(x.Case, y.Case);
            if (res !== 0) return res;
            for (var i = 0; i < x.Fields.length; i++) {
                res = Util.compare(x.Fields[i], y.Fields[i]);
                if (res !== 0) return res;
            }
            return 0;
        };
        Util.createDisposable = function (f) {
            var disp = { Dispose: f };
            disp[FSymbol.interfaces] = ["System.IDisposable"];
            return disp;
        };
        Util.createObj = function (fields) {
            return Seq.fold(function (acc, kv) {
                acc[kv[0]] = kv[1];return acc;
            }, {}, fields);
        };
        return Util;
    }();
    Util.toPlainJsObj = function (source) {
        if (source != null && source.constructor != Object) {
            var target = {};
            var props = Object.getOwnPropertyNames(source);
            for (var i = 0; i < props.length; i++) {
                target[props[i]] = source[props[i]];
            }
            // Copy also properties from prototype, see #192
            var proto = Object.getPrototypeOf(source);
            if (proto != null) {
                props = Object.getOwnPropertyNames(proto);
                for (var i = 0; i < props.length; i++) {
                    var prop = Object.getOwnPropertyDescriptor(proto, props[i]);
                    if (prop.value) {
                        target[props[i]] = prop.value;
                    } else if (prop.get) {
                        target[props[i]] = prop.get.apply(source);
                    }
                }
            }
            return target;
        } else {
            return source;
        }
    };
    exports.Util = Util;
    var Serialize = function () {
        function Serialize() {}
        Serialize.toJson = function (o) {
            return JSON.stringify(o, function (k, v) {
                if (ArrayBuffer.isView(v)) {
                    return Array.from(v);
                } else if (v != null && typeof v === "object") {
                    if (v instanceof List || v instanceof FSet || v instanceof Set) {
                        return {
                            $type: v[FSymbol.typeName] || "System.Collections.Generic.HashSet",
                            $values: Array.from(v)
                        };
                    } else if (v instanceof FMap || v instanceof Map) {
                        return Seq.fold(function (o, kv) {
                            o[kv[0]] = kv[1];return o;
                        }, { $type: v[FSymbol.typeName] || "System.Collections.Generic.Dictionary" }, v);
                    } else if (v[FSymbol.typeName]) {
                        if (Util.hasInterface(v, "FSharpUnion", "FSharpRecord", "FSharpException")) {
                            return Object.assign({ $type: v[FSymbol.typeName] }, v);
                        } else {
                            var proto = Object.getPrototypeOf(v),
                                props = Object.getOwnPropertyNames(proto),
                                o_1 = { $type: v[FSymbol.typeName] };
                            for (var i = 0; i < props.length; i++) {
                                var prop = Object.getOwnPropertyDescriptor(proto, props[i]);
                                if (prop.get) o_1[props[i]] = prop.get.apply(v);
                            }
                            return o_1;
                        }
                    }
                }
                return v;
            });
        };
        Serialize.ofJson = function (json, expected) {
            var parsed = JSON.parse(json, function (k, v) {
                if (v == null) return v;else if (typeof v === "object" && typeof v.$type === "string") {
                    // Remove generic args and assembly info added by Newtonsoft.Json
                    var type = v.$type.replace('+', '.'),
                        i = type.indexOf('`');
                    if (i > -1) {
                        type = type.substr(0, i);
                    } else {
                        i = type.indexOf(',');
                        type = i > -1 ? type.substr(0, i) : type;
                    }
                    if (type === "System.Collections.Generic.List" || type.indexOf("[]") === type.length - 2) {
                        return v.$values;
                    }
                    if (type === "Microsoft.FSharp.Collections.FSharpList") {
                        return List.ofArray(v.$values);
                    } else if (type == "Microsoft.FSharp.Collections.FSharpSet") {
                        return FSet.create(v.$values);
                    } else if (type == "System.Collections.Generic.HashSet") {
                        return new Set(v.$values);
                    } else if (type == "Microsoft.FSharp.Collections.FSharpMap") {
                        delete v.$type;
                        return FMap.create(Object.getOwnPropertyNames(v).map(function (k) {
                            return [k, v[k]];
                        }));
                    } else if (type == "System.Collections.Generic.Dictionary") {
                        delete v.$type;
                        return new Map(Object.getOwnPropertyNames(v).map(function (k) {
                            return [k, v[k]];
                        }));
                    } else {
                        var T = fableGlobal.types.get(type);
                        if (T) {
                            delete v.$type;
                            return Object.assign(new T(), v);
                        }
                    }
                } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[+-]\d{2}:\d{2}|Z)$/.test(v)) return FDate.parse(v);else return v;
            });
            if (parsed != null && typeof expected == "function" && !(parsed instanceof expected)) {
                throw "JSON is not of type " + expected.name + ": " + json;
            }
            return parsed;
        };
        return Serialize;
    }();
    exports.Serialize = Serialize;
    var GenericComparer = function () {
        function GenericComparer(f) {
            this.Compare = f || Util.compare;
        }
        return GenericComparer;
    }();
    exports.GenericComparer = GenericComparer;
    Util.setInterfaces(GenericComparer.prototype, ["System.IComparer"], "Fable.Core.GenericComparer");
    var Choice = function () {
        function Choice(t, d) {
            this.Case = t;
            this.Fields = d;
        }
        Choice.Choice1Of2 = function (v) {
            return new Choice("Choice1Of2", [v]);
        };
        Choice.Choice2Of2 = function (v) {
            return new Choice("Choice2Of2", [v]);
        };
        Object.defineProperty(Choice.prototype, "valueIfChoice1", {
            get: function () {
                return this.Case === "Choice1Of2" ? this.Fields[0] : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Choice.prototype, "valueIfChoice2", {
            get: function () {
                return this.Case === "Choice2Of2" ? this.Fields[0] : null;
            },
            enumerable: true,
            configurable: true
        });
        Choice.prototype.Equals = function (other) {
            return Util.equalsUnions(this, other);
        };
        Choice.prototype.CompareTo = function (other) {
            return Util.compareUnions(this, other);
        };
        return Choice;
    }();
    exports.Choice = Choice;
    Util.setInterfaces(Choice.prototype, ["FSharpUnion", "System.IEquatable", "System.IComparable"], "Microsoft.FSharp.Core.FSharpChoice");
    var TimeSpan = function (_super) {
        __extends(TimeSpan, _super);
        function TimeSpan() {
            return _super.apply(this, arguments) || this;
        }
        TimeSpan.create = function (d, h, m, s, ms) {
            if (d === void 0) {
                d = 0;
            }
            if (h === void 0) {
                h = 0;
            }
            if (m === void 0) {
                m = 0;
            }
            if (s === void 0) {
                s = 0;
            }
            if (ms === void 0) {
                ms = 0;
            }
            switch (arguments.length) {
                case 1:
                    // ticks
                    return this.fromTicks(arguments[0]);
                case 3:
                    // h,m,s
                    d = 0, h = arguments[0], m = arguments[1], s = arguments[2], ms = 0;
                    break;
                default:
                    // d,h,m,s,ms
                    d = arguments[0], h = arguments[1], m = arguments[2], s = arguments[3], ms = arguments[4] || 0;
                    break;
            }
            return d * 86400000 + h * 3600000 + m * 60000 + s * 1000 + ms;
        };
        TimeSpan.fromTicks = function (ticks) {
            return ticks / 10000;
        };
        TimeSpan.fromDays = function (d) {
            return TimeSpan.create(d, 0, 0, 0);
        };
        TimeSpan.fromHours = function (h) {
            return TimeSpan.create(h, 0, 0);
        };
        TimeSpan.fromMinutes = function (m) {
            return TimeSpan.create(0, m, 0);
        };
        TimeSpan.fromSeconds = function (s) {
            return TimeSpan.create(0, 0, s);
        };
        TimeSpan.days = function (ts) {
            return Math.floor(ts / 86400000);
        };
        TimeSpan.hours = function (ts) {
            return Math.floor(ts % 86400000 / 3600000);
        };
        TimeSpan.minutes = function (ts) {
            return Math.floor(ts % 3600000 / 60000);
        };
        TimeSpan.seconds = function (ts) {
            return Math.floor(ts % 60000 / 1000);
        };
        TimeSpan.milliseconds = function (ts) {
            return Math.floor(ts % 1000);
        };
        TimeSpan.ticks = function (ts) {
            return ts * 10000;
        };
        TimeSpan.totalDays = function (ts) {
            return ts / 86400000;
        };
        TimeSpan.totalHours = function (ts) {
            return ts / 3600000;
        };
        TimeSpan.totalMinutes = function (ts) {
            return ts / 60000;
        };
        TimeSpan.totalSeconds = function (ts) {
            return ts / 1000;
        };
        TimeSpan.negate = function (ts) {
            return ts * -1;
        };
        TimeSpan.add = function (ts1, ts2) {
            return ts1 + ts2;
        };
        TimeSpan.subtract = function (ts1, ts2) {
            return ts1 - ts2;
        };
        return TimeSpan;
    }(Number);
    TimeSpan.compare = Util.compare;
    TimeSpan.compareTo = Util.compare;
    TimeSpan.duration = Math.abs;
    exports.TimeSpan = TimeSpan;
    var DateKind;
    (function (DateKind) {
        DateKind[DateKind["UTC"] = 1] = "UTC";
        DateKind[DateKind["Local"] = 2] = "Local";
    })(DateKind = exports.DateKind || (exports.DateKind = {}));
    var FDate = function (_super) {
        __extends(FDate, _super);
        function FDate() {
            return _super.apply(this, arguments) || this;
        }
        FDate.__changeKind = function (d, kind) {
            var d2;
            return d.kind == kind ? d : (d2 = new Date(d.getTime()), d2.kind = kind, d2);
        };
        FDate.__getValue = function (d, key) {
            return d[(d.kind == DateKind.UTC ? "getUTC" : "get") + key]();
        };
        FDate.minValue = function () {
            return FDate.parse(-8640000000000000, 1);
        };
        FDate.maxValue = function () {
            return FDate.parse(8640000000000000, 1);
        };
        FDate.parse = function (v, kind) {
            var date = v == null ? new Date() : new Date(v);
            if (isNaN(date.getTime())) throw "The string is not a valid Date.";
            date.kind = kind || (typeof v == "string" && v.slice(-1) == "Z" ? DateKind.UTC : DateKind.Local);
            return date;
        };
        FDate.create = function (year, month, day, h, m, s, ms, kind) {
            if (h === void 0) {
                h = 0;
            }
            if (m === void 0) {
                m = 0;
            }
            if (s === void 0) {
                s = 0;
            }
            if (ms === void 0) {
                ms = 0;
            }
            if (kind === void 0) {
                kind = DateKind.Local;
            }
            var date = kind === DateKind.UTC ? new Date(Date.UTC(year, month - 1, day, h, m, s, ms)) : new Date(year, month - 1, day, h, m, s, ms);
            if (isNaN(date.getTime())) throw "The parameters describe an unrepresentable Date.";
            date.kind = kind;
            return date;
        };
        FDate.utcNow = function () {
            return FDate.parse(null, 1);
        };
        FDate.today = function () {
            return FDate.date(FDate.now());
        };
        FDate.isLeapYear = function (year) {
            return year % 4 == 0 && year % 100 != 0 || year % 400 == 0;
        };
        FDate.daysInMonth = function (year, month) {
            return month == 2 ? FDate.isLeapYear(year) ? 29 : 28 : month >= 8 ? month % 2 == 0 ? 31 : 30 : month % 2 == 0 ? 30 : 31;
        };
        FDate.toUniversalTime = function (d) {
            return FDate.__changeKind(d, 1);
        };
        FDate.toLocalTime = function (d) {
            return FDate.__changeKind(d, 2);
        };
        FDate.timeOfDay = function (d) {
            return TimeSpan.create(0, FDate.hour(d), FDate.minute(d), FDate.second(d), FDate.millisecond(d));
        };
        FDate.date = function (d) {
            return FDate.create(FDate.year(d), FDate.month(d), FDate.day(d), 0, 0, 0, 0, d.kind);
        };
        FDate.day = function (d) {
            return FDate.__getValue(d, "Date");
        };
        FDate.hour = function (d) {
            return FDate.__getValue(d, "Hours");
        };
        FDate.millisecond = function (d) {
            return FDate.__getValue(d, "Milliseconds");
        };
        FDate.minute = function (d) {
            return FDate.__getValue(d, "Minutes");
        };
        FDate.month = function (d) {
            return FDate.__getValue(d, "Month") + 1;
        };
        FDate.second = function (d) {
            return FDate.__getValue(d, "Seconds");
        };
        FDate.year = function (d) {
            return FDate.__getValue(d, "FullYear");
        };
        FDate.ticks = function (d) {
            return (d.getTime() + 6.2135604e+13 /* millisecondsJSOffset */) * 10000;
        };
        FDate.dayOfWeek = function (d) {
            return FDate.__getValue(d, "Day");
        };
        FDate.dayOfYear = function (d) {
            var year = FDate.year(d);
            var month = FDate.month(d);
            var day = FDate.day(d);
            for (var i = 1; i < month; i++) day += FDate.daysInMonth(year, i);
            return day;
        };
        FDate.add = function (d, ts) {
            return FDate.parse(d.getTime() + ts, d.kind);
        };
        FDate.addDays = function (d, v) {
            return FDate.parse(d.getTime() + v * 86400000, d.kind);
        };
        FDate.addHours = function (d, v) {
            return FDate.parse(d.getTime() + v * 3600000, d.kind);
        };
        FDate.addMinutes = function (d, v) {
            return FDate.parse(d.getTime() + v * 60000, d.kind);
        };
        FDate.addSeconds = function (d, v) {
            return FDate.parse(d.getTime() + v * 1000, d.kind);
        };
        FDate.addMilliseconds = function (d, v) {
            return FDate.parse(d.getTime() + v, d.kind);
        };
        FDate.addTicks = function (d, v) {
            return FDate.parse(d.getTime() + v / 10000, d.kind);
        };
        FDate.addYears = function (d, v) {
            var newMonth = FDate.month(d);
            var newYear = FDate.year(d) + v;
            var daysInMonth = FDate.daysInMonth(newYear, newMonth);
            var newDay = Math.min(daysInMonth, FDate.day(d));
            return FDate.create(newYear, newMonth, newDay, FDate.hour(d), FDate.minute(d), FDate.second(d), FDate.millisecond(d), d.kind);
        };
        FDate.addMonths = function (d, v) {
            var newMonth = FDate.month(d) + v;
            var newMonth_ = 0;
            var yearOffset = 0;
            if (newMonth > 12) {
                newMonth_ = newMonth % 12;
                yearOffset = Math.floor(newMonth / 12);
                newMonth = newMonth_;
            } else if (newMonth < 1) {
                newMonth_ = 12 + newMonth % 12;
                yearOffset = Math.floor(newMonth / 12) + (newMonth_ == 12 ? -1 : 0);
                newMonth = newMonth_;
            }
            var newYear = FDate.year(d) + yearOffset;
            var daysInMonth = FDate.daysInMonth(newYear, newMonth);
            var newDay = Math.min(daysInMonth, FDate.day(d));
            return FDate.create(newYear, newMonth, newDay, FDate.hour(d), FDate.minute(d), FDate.second(d), FDate.millisecond(d), d.kind);
        };
        FDate.subtract = function (d, that) {
            return typeof that == "number" ? FDate.parse(d.getTime() - that, d.kind) : d.getTime() - that.getTime();
        };
        FDate.toLongDateString = function (d) {
            return d.toDateString();
        };
        FDate.toShortDateString = function (d) {
            return d.toLocaleDateString();
        };
        FDate.toLongTimeString = function (d) {
            return d.toLocaleTimeString();
        };
        FDate.toShortTimeString = function (d) {
            return d.toLocaleTimeString().replace(/:\d\d(?!:)/, "");
        };
        FDate.equals = function (d1, d2) {
            return d1.getTime() == d2.getTime();
        };
        return FDate;
    }(Date);
    FDate.now = FDate.parse;
    FDate.toBinary = FDate.ticks;
    FDate.compareTo = Util.compare;
    FDate.compare = Util.compare;
    FDate.op_Addition = FDate.add;
    FDate.op_Subtraction = FDate.subtract;
    exports.Date = FDate;
    var Timer = function () {
        function Timer(interval) {
            this.Interval = interval > 0 ? interval : 100;
            this.AutoReset = true;
            this._elapsed = new Event();
        }
        Object.defineProperty(Timer.prototype, "Elapsed", {
            get: function () {
                return this._elapsed;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Timer.prototype, "Enabled", {
            get: function () {
                return this._enabled;
            },
            set: function (x) {
                var _this = this;
                if (!this._isDisposed && this._enabled != x) {
                    if (this._enabled = x) {
                        if (this.AutoReset) {
                            this._intervalId = setInterval(function () {
                                if (!_this.AutoReset) _this.Enabled = false;
                                _this._elapsed.Trigger(new Date());
                            }, this.Interval);
                        } else {
                            this._timeoutId = setTimeout(function () {
                                _this.Enabled = false;
                                _this._timeoutId = 0;
                                if (_this.AutoReset) _this.Enabled = true;
                                _this._elapsed.Trigger(new Date());
                            }, this.Interval);
                        }
                    } else {
                        if (this._timeoutId) {
                            clearTimeout(this._timeoutId);
                            this._timeoutId = 0;
                        }
                        if (this._intervalId) {
                            clearInterval(this._intervalId);
                            this._intervalId = 0;
                        }
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Timer.prototype.Dispose = function () {
            this.Enabled = false;
            this._isDisposed = true;
        };
        Timer.prototype.Close = function () {
            this.Dispose();
        };
        Timer.prototype.Start = function () {
            this.Enabled = true;
        };
        Timer.prototype.Stop = function () {
            this.Enabled = false;
        };
        return Timer;
    }();
    exports.Timer = Timer;
    Util.setInterfaces(Timer.prototype, ["System.IDisposable"]);
    var FString = function () {
        function FString() {}
        FString.fsFormat = function (str) {
            function isObject(x) {
                return x !== null && typeof x === "object" && !(x instanceof Number) && !(x instanceof String) && !(x instanceof Boolean);
            }
            function formatOnce(str, rep) {
                return str.replace(FString.fsFormatRegExp, function (_, prefix, flags, pad, precision, format) {
                    switch (format) {
                        case "f":
                        case "F":
                            rep = rep.toFixed(precision || 6);
                            break;
                        case "g":
                        case "G":
                            rep = rep.toPrecision(precision);
                            break;
                        case "e":
                        case "E":
                            rep = rep.toExponential(precision);
                            break;
                        case "O":
                            rep = Util.toString(rep);
                            break;
                        case "A":
                            try {
                                rep = JSON.stringify(rep, function (k, v) {
                                    return v && v[Symbol.iterator] && !Array.isArray(v) && isObject(v) ? Array.from(v) : v;
                                });
                            } catch (err) {
                                // Fallback for objects with circular references
                                rep = "{" + Object.getOwnPropertyNames(rep).map(function (k) {
                                    return k + ": " + String(rep[k]);
                                }).join(", ") + "}";
                            }
                            break;
                    }
                    var plusPrefix = flags.indexOf("+") >= 0 && parseInt(rep) >= 0;
                    if (!isNaN(pad = parseInt(pad))) {
                        var ch = pad >= 0 && flags.indexOf("0") >= 0 ? "0" : " ";
                        rep = FString.padLeft(rep, Math.abs(pad) - (plusPrefix ? 1 : 0), ch, pad < 0);
                    }
                    var once = prefix + (plusPrefix ? "+" + rep : rep);
                    return once.replace(/%/g, "%%");
                });
            }
            function makeFn(str) {
                return function (rep) {
                    var str2 = formatOnce(str, rep);
                    return FString.fsFormatRegExp.test(str2) ? makeFn(str2) : _cont(str2.replace(/%%/g, "%"));
                };
            }
            var _cont;
            return function (cont) {
                _cont = cont;
                return FString.fsFormatRegExp.test(str) ? makeFn(str) : _cont(str);
            };
        };
        FString.format = function (str) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return str.replace(FString.formatRegExp, function (match, idx, pad, format) {
                var rep = args[idx],
                    padSymbol = " ";
                if (typeof rep === "number") {
                    switch ((format || "").substring(0, 1)) {
                        case "f":
                        case "F":
                            rep = format.length > 1 ? rep.toFixed(format.substring(1)) : rep.toFixed(2);
                            break;
                        case "g":
                        case "G":
                            rep = format.length > 1 ? rep.toPrecision(format.substring(1)) : rep.toPrecision();
                            break;
                        case "e":
                        case "E":
                            rep = format.length > 1 ? rep.toExponential(format.substring(1)) : rep.toExponential();
                            break;
                        case "p":
                        case "P":
                            rep = (format.length > 1 ? (rep * 100).toFixed(format.substring(1)) : (rep * 100).toFixed(2)) + " %";
                            break;
                        default:
                            var m = /^(0+)(\.0+)?$/.exec(format);
                            if (m != null) {
                                var decs = 0;
                                if (m[2] != null) rep = rep.toFixed(decs = m[2].length - 1);
                                pad = "," + (m[1].length + (decs ? decs + 1 : 0)).toString();
                                padSymbol = "0";
                            } else if (format) {
                                rep = format;
                            }
                    }
                } else if (rep instanceof Date) {
                    if (format.length === 1) {
                        switch (format) {
                            case "D":
                                rep = rep.toDateString();
                                break;
                            case "T":
                                rep = rep.toLocaleTimeString();
                                break;
                            case "d":
                                rep = rep.toLocaleDateString();
                                break;
                            case "t":
                                rep = rep.toLocaleTimeString().replace(/:\d\d(?!:)/, "");
                                break;
                            case "o":
                            case "O":
                                if (rep.kind === DateKind.Local) {
                                    var offset = rep.getTimezoneOffset() * -1;
                                    rep = FString.format("{0:yyyy-MM-dd}T{0:HH:mm}:{1:00.000}{2}{3:00}:{4:00}", rep, FDate.second(rep), offset >= 0 ? "+" : "-", ~~(offset / 60), offset % 60);
                                } else {
                                    rep = rep.toISOString();
                                }
                        }
                    } else {
                        rep = format.replace(/\w+/g, function (match2) {
                            var rep2 = match2;
                            switch (match2.substring(0, 1)) {
                                case "y":
                                    rep2 = match2.length < 4 ? FDate.year(rep) % 100 : FDate.year(rep);
                                    break;
                                case "h":
                                    rep2 = rep.getHours() > 12 ? FDate.hour(rep) % 12 : FDate.hour(rep);
                                    break;
                                case "M":
                                    rep2 = FDate.month(rep);
                                    break;
                                case "d":
                                    rep2 = FDate.day(rep);
                                    break;
                                case "H":
                                    rep2 = FDate.hour(rep);
                                    break;
                                case "m":
                                    rep2 = FDate.minute(rep);
                                    break;
                                case "s":
                                    rep2 = FDate.second(rep);
                                    break;
                            }
                            if (rep2 !== match2 && rep2 < 10 && match2.length > 1) {
                                rep2 = "0" + rep2;
                            }
                            return rep2;
                        });
                    }
                }
                if (!isNaN(pad = parseInt((pad || "").substring(1)))) {
                    rep = FString.padLeft(rep, Math.abs(pad), padSymbol, pad < 0);
                }
                return rep;
            });
        };
        FString.endsWith = function (str, search) {
            var idx = str.lastIndexOf(search);
            return idx >= 0 && idx == str.length - search.length;
        };
        FString.initialize = function (n, f) {
            if (n < 0) throw "String length must be non-negative";
            var xs = new Array(n);
            for (var i = 0; i < n; i++) xs[i] = f(i);
            return xs.join("");
        };
        FString.isNullOrEmpty = function (str) {
            return typeof str !== "string" || str.length == 0;
        };
        FString.isNullOrWhiteSpace = function (str) {
            return typeof str !== "string" || /^\s*$/.test(str);
        };
        FString.join = function (delimiter, xs) {
            xs = typeof xs == "string" ? Util.getRestParams(arguments, 1) : xs;
            return (Array.isArray(xs) ? xs : Array.from(xs)).join(delimiter);
        };
        FString.newGuid = function () {
            var uuid = "";
            for (var i = 0; i < 32; i++) {
                var random = Math.random() * 16 | 0;
                if (i === 8 || i === 12 || i === 16 || i === 20) uuid += "-";
                uuid += (i === 12 ? 4 : i === 16 ? random & 3 | 8 : random).toString(16);
            }
            return uuid;
        };
        FString.padLeft = function (str, len, ch, isRight) {
            ch = ch || " ";
            str = String(str);
            len = len - str.length;
            for (var i = -1; ++i < len;) str = isRight ? str + ch : ch + str;
            return str;
        };
        FString.padRight = function (str, len, ch) {
            return FString.padLeft(str, len, ch, true);
        };
        FString.remove = function (str, startIndex, count) {
            if (startIndex >= str.length) {
                throw "startIndex must be less than length of string";
            }
            if (typeof count === "number" && startIndex + count > str.length) {
                throw "Index and count must refer to a location within the string.";
            }
            return str.slice(0, startIndex) + (typeof count === "number" ? str.substr(startIndex + count) : "");
        };
        FString.replace = function (str, search, replace) {
            return str.replace(new RegExp(FRegExp.escape(search), "g"), replace);
        };
        FString.replicate = function (n, x) {
            return FString.initialize(n, function () {
                return x;
            });
        };
        FString.split = function (str, splitters, count, removeEmpty) {
            count = typeof count == "number" ? count : null;
            removeEmpty = typeof removeEmpty == "number" ? removeEmpty : null;
            if (count < 0) throw "Count cannot be less than zero";
            if (count === 0) return [];
            splitters = Array.isArray(splitters) ? splitters : Util.getRestParams(arguments, 1);
            splitters = splitters.map(function (x) {
                return FRegExp.escape(x);
            });
            splitters = splitters.length > 0 ? splitters : [" "];
            var m;
            var i = 0;
            var splits = [];
            var reg = new RegExp(splitters.join("|"), "g");
            while ((count == null || count > 1) && (m = reg.exec(str)) !== null) {
                if (!removeEmpty || m.index - i > 0) {
                    count = count != null ? count - 1 : count;
                    splits.push(str.substring(i, m.index));
                }
                i = reg.lastIndex;
            }
            if (!removeEmpty || str.length - i > 0) splits.push(str.substring(i));
            return splits;
        };
        FString.trim = function (str, side) {
            var chars = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                chars[_i - 2] = arguments[_i];
            }
            if (side == "both" && chars.length == 0) return str.trim();
            if (side == "start" || side == "both") {
                var reg = chars.length == 0 ? /^\s+/ : new RegExp("^[" + FRegExp.escape(chars.join("")) + "]+");
                str = str.replace(reg, "");
            }
            if (side == "end" || side == "both") {
                var reg = chars.length == 0 ? /\s+$/ : new RegExp("[" + FRegExp.escape(chars.join("")) + "]+$");
                str = str.replace(reg, "");
            }
            return str;
        };
        return FString;
    }();
    FString.fsFormatRegExp = /(^|[^%])%([0+ ]*)(-?\d+)?(?:\.(\d+))?(\w)/;
    FString.formatRegExp = /\{(\d+)(,-?\d+)?(?:\:(.+?))?\}/g;
    exports.String = FString;
    var FRegExp = function () {
        function FRegExp() {}
        FRegExp.create = function (pattern, options) {
            var flags = "g";
            flags += options & 1 ? "i" : "";
            flags += options & 2 ? "m" : "";
            return new RegExp(pattern, flags);
        };
        // From http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
        FRegExp.escape = function (str) {
            return str.replace(/[\-\[\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        };
        FRegExp.unescape = function (str) {
            return str.replace(/\\([\-\[\/\{\}\(\)\*\+\?\.\\\^\$\|])/g, "$1");
        };
        FRegExp.isMatch = function (str, pattern, options) {
            if (options === void 0) {
                options = 0;
            }
            var reg = str instanceof RegExp ? (reg = str, str = pattern, reg.lastIndex = options, reg) : reg = FRegExp.create(pattern, options);
            return reg.test(str);
        };
        FRegExp.match = function (str, pattern, options) {
            if (options === void 0) {
                options = 0;
            }
            var reg = str instanceof RegExp ? (reg = str, str = pattern, reg.lastIndex = options, reg) : reg = FRegExp.create(pattern, options);
            return reg.exec(str);
        };
        FRegExp.matches = function (str, pattern, options) {
            if (options === void 0) {
                options = 0;
            }
            var reg = str instanceof RegExp ? (reg = str, str = pattern, reg.lastIndex = options, reg) : reg = FRegExp.create(pattern, options);
            if (!reg.global) throw "Non-global RegExp"; // Prevent infinite loop
            var m;
            var matches = [];
            while ((m = reg.exec(str)) !== null) matches.push(m);
            return matches;
        };
        FRegExp.options = function (reg) {
            var options = 256; // ECMAScript
            options |= reg.ignoreCase ? 1 : 0;
            options |= reg.multiline ? 2 : 0;
            return options;
        };
        FRegExp.replace = function (reg, input, replacement, limit, offset) {
            if (offset === void 0) {
                offset = 0;
            }
            function replacer() {
                var res = arguments[0];
                if (limit !== 0) {
                    limit--;
                    var match = [];
                    var len = arguments.length;
                    for (var i = 0; i < len - 2; i++) match.push(arguments[i]);
                    match.index = arguments[len - 2];
                    match.input = arguments[len - 1];
                    res = replacement(match);
                }
                return res;
            }
            if (typeof reg == "string") {
                var tmp = reg;
                reg = FRegExp.create(input, limit);
                input = tmp;
                limit = undefined;
            }
            if (typeof replacement == "function") {
                limit = limit == null ? -1 : limit;
                return input.substring(0, offset) + input.substring(offset).replace(reg, replacer);
            } else {
                if (limit != null) {
                    var m = void 0;
                    var sub1 = input.substring(offset);
                    var matches = FRegExp.matches(reg, sub1);
                    var sub2 = matches.length > limit ? (m = matches[limit - 1], sub1.substring(0, m.index + m[0].length)) : sub1;
                    return input.substring(0, offset) + sub2.replace(reg, replacement) + input.substring(offset + sub2.length);
                } else {
                    return input.replace(reg, replacement);
                }
            }
        };
        FRegExp.split = function (reg, input, limit, offset) {
            if (offset === void 0) {
                offset = 0;
            }
            if (typeof reg == "string") {
                var tmp = reg;
                reg = FRegExp.create(input, limit);
                input = tmp;
                limit = undefined;
            }
            input = input.substring(offset);
            return input.split(reg, limit);
        };
        return FRegExp;
    }();
    exports.RegExp = FRegExp;
    var FArray = function () {
        function FArray() {}
        FArray.addRangeInPlace = function (range, xs) {
            Seq.iterate(function (x) {
                return xs.push(x);
            }, range);
        };
        FArray.copyTo = function (source, sourceIndex, target, targetIndex, count) {
            while (count--) target[targetIndex++] = source[sourceIndex++];
        };
        FArray.partition = function (f, xs) {
            var ys = [],
                zs = [],
                j = 0,
                k = 0;
            for (var i = 0; i < xs.length; i++) if (f(xs[i])) ys[j++] = xs[i];else zs[k++] = xs[i];
            return Tuple(ys, zs);
        };
        FArray.permute = function (f, xs) {
            // Keep the type of the array
            var ys = xs.map(function () {
                return null;
            });
            var checkFlags = new Array(xs.length);
            for (var i = 0; i < xs.length; i++) {
                var j = f(i);
                if (j < 0 || j >= xs.length) throw "Not a valid permutation";
                ys[j] = xs[i];
                checkFlags[j] = 1;
            }
            for (var i = 0; i < xs.length; i++) if (checkFlags[i] != 1) throw "Not a valid permutation";
            return ys;
        };
        FArray.removeInPlace = function (item, xs) {
            var i = xs.indexOf(item);
            if (i > -1) {
                xs.splice(i, 1);
                return true;
            }
            return false;
        };
        FArray.setSlice = function (target, lower, upper, source) {
            var length = (upper || target.length - 1) - lower;
            if (ArrayBuffer.isView(target) && source.length <= length) target.set(source, lower);else for (var i = lower | 0, j = 0; j <= length; i++, j++) target[i] = source[j];
        };
        FArray.sortInPlaceBy = function (f, xs, dir) {
            if (dir === void 0) {
                dir = 1;
            }
            return xs.sort(function (x, y) {
                x = f(x);
                y = f(y);
                return (x < y ? -1 : x == y ? 0 : 1) * dir;
            });
        };
        FArray.unzip = function (xs) {
            var bs = new Array(xs.length),
                cs = new Array(xs.length);
            for (var i = 0; i < xs.length; i++) {
                bs[i] = xs[i][0];
                cs[i] = xs[i][1];
            }
            return Tuple(bs, cs);
        };
        FArray.unzip3 = function (xs) {
            var bs = new Array(xs.length),
                cs = new Array(xs.length),
                ds = new Array(xs.length);
            for (var i = 0; i < xs.length; i++) {
                bs[i] = xs[i][0];
                cs[i] = xs[i][1];
                ds[i] = xs[i][2];
            }
            return Tuple3(bs, cs, ds);
        };
        return FArray;
    }();
    exports.Array = FArray;
    var List = function () {
        function List(head, tail) {
            this.head = head;
            this.tail = tail;
        }
        List.prototype.ToString = function () {
            return "[" + Array.from(this).map(Util.toString).join("; ") + "]";
        };
        List.prototype.Equals = function (x) {
            var iter1 = this[Symbol.iterator](),
                iter2 = x[Symbol.iterator]();
            for (var i = 0;; i++) {
                var cur1 = iter1.next(),
                    cur2 = iter2.next();
                if (cur1.done) return cur2.done ? true : false;else if (cur2.done) return false;else if (!Util.equals(cur1.value, cur2.value)) return false;
            }
        };
        List.prototype.CompareTo = function (x) {
            var acc = 0;
            var iter1 = this[Symbol.iterator](),
                iter2 = x[Symbol.iterator]();
            for (var i = 0;; i++) {
                var cur1 = iter1.next(),
                    cur2 = iter2.next();
                if (cur1.done) return cur2.done ? acc : -1;else if (cur2.done) return 1;else {
                    acc = Util.compare(cur1.value, cur2.value);
                    if (acc != 0) return acc;
                }
            }
        };
        List.ofArray = function (args, base) {
            var acc = base || new List();
            for (var i = args.length - 1; i >= 0; i--) {
                acc = new List(args[i], acc);
            }
            return acc;
        };
        Object.defineProperty(List.prototype, "length", {
            get: function () {
                return Seq.fold(function (acc, x) {
                    return acc + 1;
                }, 0, this);
            },
            enumerable: true,
            configurable: true
        });
        List.prototype[Symbol.iterator] = function () {
            var cur = this;
            return {
                next: function () {
                    var tmp = cur;
                    cur = cur.tail;
                    return { done: tmp.tail == null, value: tmp.head };
                }
            };
        };
        List.prototype.append = function (ys) {
            return List.append(this, ys);
        };
        List.append = function (xs, ys) {
            return Seq.fold(function (acc, x) {
                return new List(x, acc);
            }, ys, List.reverse(xs));
        };
        List.prototype.choose = function (f, xs) {
            return List.choose(f, this);
        };
        List.choose = function (f, xs) {
            var r = Seq.fold(function (acc, x) {
                var y = f(x);
                return y != null ? new List(y, acc) : acc;
            }, new List(), xs);
            return List.reverse(r);
        };
        List.prototype.collect = function (f) {
            return List.collect(f, this);
        };
        List.collect = function (f, xs) {
            return Seq.fold(function (acc, x) {
                return acc.append(f(x));
            }, new List(), xs);
        };
        // TODO: should be xs: Iterable<List<T>>
        List.concat = function (xs) {
            return List.collect(function (x) {
                return x;
            }, xs);
        };
        List.prototype.filter = function (f) {
            return List.filter(f, this);
        };
        List.filter = function (f, xs) {
            return List.reverse(Seq.fold(function (acc, x) {
                return f(x) ? new List(x, acc) : acc;
            }, new List(), xs));
        };
        List.prototype.where = function (f) {
            return List.filter(f, this);
        };
        List.where = function (f, xs) {
            return List.filter(f, xs);
        };
        List.initialize = function (n, f) {
            if (n < 0) {
                throw "List length must be non-negative";
            }
            var xs = new List();
            for (var i = 1; i <= n; i++) {
                xs = new List(f(n - i), xs);
            }
            return xs;
        };
        List.prototype.map = function (f) {
            return List.map(f, this);
        };
        List.map = function (f, xs) {
            return List.reverse(Seq.fold(function (acc, x) {
                return new List(f(x), acc);
            }, new List(), xs));
        };
        List.prototype.mapIndexed = function (f) {
            return List.mapIndexed(f, this);
        };
        List.mapIndexed = function (f, xs) {
            return List.reverse(Seq.fold(function (acc, x, i) {
                return new List(f(i, x), acc);
            }, new List(), xs));
        };
        List.prototype.partition = function (f) {
            return List.partition(f, this);
        };
        List.partition = function (f, xs) {
            return Seq.fold(function (acc, x) {
                var lacc = acc[0],
                    racc = acc[1];
                return f(x) ? Tuple(new List(x, lacc), racc) : Tuple(lacc, new List(x, racc));
            }, Tuple(new List(), new List()), List.reverse(xs));
        };
        List.replicate = function (n, x) {
            return List.initialize(n, function () {
                return x;
            });
        };
        List.prototype.reverse = function () {
            return List.reverse(this);
        };
        List.reverse = function (xs) {
            return Seq.fold(function (acc, x) {
                return new List(x, acc);
            }, new List(), xs);
        };
        List.singleton = function (x) {
            return new List(x, new List());
        };
        List.prototype.slice = function (lower, upper) {
            return List.slice(lower, upper, this);
        };
        List.slice = function (lower, upper, xs) {
            var noLower = lower == null;
            var noUpper = upper == null;
            return List.reverse(Seq.fold(function (acc, x, i) {
                return (noLower || lower <= i) && (noUpper || i <= upper) ? new List(x, acc) : acc;
            }, new List(), xs));
        };
        /* ToDo: instance unzip() */
        List.unzip = function (xs) {
            return Seq.foldBack(function (xy, acc) {
                return Tuple(new List(xy[0], acc[0]), new List(xy[1], acc[1]));
            }, xs, Tuple(new List(), new List()));
        };
        /* ToDo: instance unzip3() */
        List.unzip3 = function (xs) {
            return Seq.foldBack(function (xyz, acc) {
                return Tuple3(new List(xyz[0], acc[0]), new List(xyz[1], acc[1]), new List(xyz[2], acc[2]));
            }, xs, Tuple3(new List(), new List(), new List()));
        };
        List.groupBy = function (f, xs) {
            return Seq.toList(Seq.map(function (k) {
                return Tuple(k[0], Seq.toList(k[1]));
            }, Seq.groupBy(f, xs)));
        };
        return List;
    }();
    exports.List = List;
    Util.setInterfaces(List.prototype, ["System.IEquatable", "System.IComparable"], "Microsoft.FSharp.Collections.FSharpList");
    var Seq = function () {
        function Seq() {}
        Seq.__failIfNone = function (res) {
            if (res == null) throw "Seq did not contain any matching element";
            return res;
        };
        Seq.toList = function (xs) {
            return Seq.foldBack(function (x, acc) {
                return new List(x, acc);
            }, xs, new List());
        };
        Seq.ofList = function (xs) {
            return Seq.delay(function () {
                return Seq.unfold(function (x) {
                    return x.tail != null ? [x.head, x.tail] : null;
                }, xs);
            });
        };
        Seq.ofArray = function (xs) {
            return Seq.delay(function () {
                return Seq.unfold(function (i) {
                    return i < xs.length ? [xs[i], i + 1] : null;
                }, 0);
            });
        };
        Seq.append = function (xs, ys) {
            return Seq.delay(function () {
                var firstDone = false;
                var i = xs[Symbol.iterator]();
                var iters = Tuple(i, null);
                return Seq.unfold(function () {
                    var cur;
                    if (!firstDone) {
                        cur = iters[0].next();
                        if (!cur.done) {
                            return [cur.value, iters];
                        } else {
                            firstDone = true;
                            iters = [null, ys[Symbol.iterator]()];
                        }
                    }
                    cur = iters[1].next();
                    return !cur.done ? [cur.value, iters] : null;
                }, iters);
            });
        };
        Seq.average = function (xs) {
            var count = 1;
            var sum = Seq.reduce(function (acc, x) {
                count++;
                return acc + x;
            }, xs);
            return sum / count;
        };
        Seq.averageBy = function (f, xs) {
            var count = 1;
            var sum = Seq.reduce(function (acc, x) {
                count++;
                return (count === 2 ? f(acc) : acc) + f(x);
            }, xs);
            return sum / count;
        };
        Seq.countBy = function (f, xs) {
            return Seq.map(function (kv) {
                return Tuple(kv[0], Seq.count(kv[1]));
            }, Seq.groupBy(f, xs));
        };
        Seq.concat = function (xs) {
            return Seq.delay(function () {
                var iter = xs[Symbol.iterator]();
                var output = null;
                return Seq.unfold(function (innerIter) {
                    var hasFinished = false;
                    while (!hasFinished) {
                        if (innerIter == null) {
                            var cur = iter.next();
                            if (!cur.done) {
                                innerIter = cur.value[Symbol.iterator]();
                            } else {
                                hasFinished = true;
                            }
                        } else {
                            var cur = innerIter.next();
                            if (!cur.done) {
                                output = cur.value;
                                hasFinished = true;
                            } else {
                                innerIter = null;
                            }
                        }
                    }
                    return innerIter != null && output != null ? [output, innerIter] : null;
                }, null);
            });
        };
        Seq.collect = function (f, xs) {
            return Seq.concat(Seq.map(f, xs));
        };
        Seq.choose = function (f, xs) {
            var trySkipToNext = function (iter) {
                var cur = iter.next();
                if (!cur.done) {
                    var y = f(cur.value);
                    return y != null ? Tuple(y, iter) : trySkipToNext(iter);
                }
                return void 0;
            };
            return Seq.delay(function () {
                return Seq.unfold(function (iter) {
                    return trySkipToNext(iter);
                }, xs[Symbol.iterator]());
            });
        };
        Seq.compareWith = function (f, xs, ys) {
            var nonZero = Seq.tryFind(function (i) {
                return i != 0;
            }, Seq.map2(function (x, y) {
                return f(x, y);
            }, xs, ys));
            return nonZero != null ? nonZero : Seq.count(xs) - Seq.count(ys);
        };
        Seq.delay = function (f) {
            return _a = {}, _a[Symbol.iterator] = function () {
                return f()[Symbol.iterator]();
            }, _a;
            var _a;
        };
        Seq.distinctBy = function (f, xs) {
            return Seq.choose(function (tup) {
                return tup[0];
            }, Seq.scan(function (tup, x) {
                var acc = tup[1];
                var k = f(x);
                return acc.has(k) ? Tuple(null, acc) : Tuple(x, FSet.add(k, acc));
            }, Tuple(null, FSet.create()), xs));
        };
        Seq.distinct = function (xs) {
            return Seq.distinctBy(function (x) {
                return x;
            }, xs);
        };
        Seq.empty = function () {
            return Seq.unfold(function () {
                return void 0;
            });
        };
        Seq.enumerateWhile = function (cond, xs) {
            return Seq.concat(Seq.unfold(function () {
                return cond() ? [xs, true] : null;
            }));
        };
        Seq.enumerateThenFinally = function (xs, finalFn) {
            return Seq.delay(function () {
                var iter;
                try {
                    iter = xs[Symbol.iterator]();
                } finally {
                    finalFn();
                }
                return Seq.unfold(function (iter) {
                    try {
                        var cur = iter.next();
                        return !cur.done ? [cur.value, iter] : null;
                    } finally {
                        finalFn();
                    }
                    return void 0;
                }, iter);
            });
        };
        Seq.enumerateUsing = function (disp, work) {
            var isDisposed = false;
            var disposeOnce = function () {
                if (!isDisposed) {
                    isDisposed = true;
                    disp.Dispose();
                }
            };
            try {
                return Seq.enumerateThenFinally(work(disp), disposeOnce);
            } finally {
                disposeOnce();
            }
            return void 0;
        };
        Seq.exactlyOne = function (xs) {
            var iter = xs[Symbol.iterator]();
            var fst = iter.next();
            if (fst.done) throw "Seq was empty";
            var snd = iter.next();
            if (!snd.done) throw "Seq had multiple items";
            return fst.value;
        };
        Seq.except = function (itemsToExclude, source) {
            var exclusionItems = Array.from(itemsToExclude);
            var testIsNotInExclusionItems = function (element) {
                return !exclusionItems.some(function (excludedItem) {
                    return Util.equals(excludedItem, element);
                });
            };
            return Seq.filter(testIsNotInExclusionItems, source);
        };
        Seq.exists = function (f, xs) {
            function aux(iter) {
                var cur = iter.next();
                return !cur.done && (f(cur.value) || aux(iter));
            }
            return aux(xs[Symbol.iterator]());
        };
        Seq.exists2 = function (f, xs, ys) {
            function aux(iter1, iter2) {
                var cur1 = iter1.next(),
                    cur2 = iter2.next();
                return !cur1.done && !cur2.done && (f(cur1.value, cur2.value) || aux(iter1, iter2));
            }
            return aux(xs[Symbol.iterator](), ys[Symbol.iterator]());
        };
        Seq.filter = function (f, xs) {
            function trySkipToNext(iter) {
                var cur = iter.next();
                while (!cur.done) {
                    if (f(cur.value)) {
                        return [cur.value, iter];
                    }
                    cur = iter.next();
                }
                return void 0;
            }
            return Seq.delay(function () {
                return Seq.unfold(trySkipToNext, xs[Symbol.iterator]());
            });
        };
        Seq.where = function (f, xs) {
            return Seq.filter(f, xs);
        };
        Seq.fold = function (f, acc, xs) {
            if (Array.isArray(xs) || ArrayBuffer.isView(xs)) {
                return xs.reduce(f, acc);
            } else {
                var cur = void 0;
                for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
                    cur = iter.next();
                    if (cur.done) break;
                    acc = f(acc, cur.value, i);
                }
                return acc;
            }
        };
        Seq.foldBack = function (f, xs, acc) {
            var arr = Array.isArray(xs) || ArrayBuffer.isView(xs) ? xs : Array.from(xs);
            for (var i = arr.length - 1; i >= 0; i--) {
                acc = f(arr[i], acc, i);
            }
            return acc;
        };
        Seq.fold2 = function (f, acc, xs, ys) {
            var iter1 = xs[Symbol.iterator](),
                iter2 = ys[Symbol.iterator]();
            var cur1, cur2;
            for (var i = 0;; i++) {
                cur1 = iter1.next();
                cur2 = iter2.next();
                if (cur1.done || cur2.done) {
                    break;
                }
                acc = f(acc, cur1.value, cur2.value, i);
            }
            return acc;
        };
        Seq.foldBack2 = function (f, xs, ys, acc) {
            var ar1 = Array.isArray(xs) || ArrayBuffer.isView(xs) ? xs : Array.from(xs);
            var ar2 = Array.isArray(ys) || ArrayBuffer.isView(ys) ? ys : Array.from(ys);
            for (var i = ar1.length - 1; i >= 0; i--) {
                acc = f(ar1[i], ar2[i], acc, i);
            }
            return acc;
        };
        Seq.forAll = function (f, xs) {
            return Seq.fold(function (acc, x) {
                return acc && f(x);
            }, true, xs);
        };
        Seq.forAll2 = function (f, xs, ys) {
            return Seq.fold2(function (acc, x, y) {
                return acc && f(x, y);
            }, true, xs, ys);
        };
        // TODO: Should return a Iterable<Tuple<K, Iterable<T>>> instead of a Map<K, Iterable<T>>
        // Seq.groupBy : ('T -> 'Key) -> seq<'T> -> seq<'Key * seq<'T>>
        Seq.groupBy = function (f, xs) {
            var keys = [];
            var map = Seq.fold(function (acc, x) {
                var k = f(x),
                    vs = FMap.tryFind(k, acc);
                if (vs == null) {
                    keys.push(k);
                    return FMap.add(k, [x], acc);
                } else {
                    vs.push(x);
                    return acc;
                }
            }, FMap.create(), xs);
            return keys.map(function (k) {
                return [k, map.get(k)];
            });
        };
        Seq.tryHead = function (xs) {
            var iter = xs[Symbol.iterator]();
            var cur = iter.next();
            return cur.done ? null : cur.value;
        };
        Seq.head = function (xs) {
            return Seq.__failIfNone(Seq.tryHead(xs));
        };
        Seq.initialize = function (n, f) {
            return Seq.delay(function () {
                return Seq.unfold(function (i) {
                    return i < n ? [f(i), i + 1] : null;
                }, 0);
            });
        };
        Seq.initializeInfinite = function (f) {
            return Seq.delay(function () {
                return Seq.unfold(function (i) {
                    return [f(i), i + 1];
                }, 0);
            });
        };
        Seq.tryItem = function (i, xs) {
            if (i < 0) return null;
            if (Array.isArray(xs) || ArrayBuffer.isView(xs)) return i < xs.length ? xs[i] : null;
            for (var j = 0, iter = xs[Symbol.iterator]();; j++) {
                var cur = iter.next();
                if (cur.done) return null;
                if (j === i) return cur.value;
            }
        };
        Seq.item = function (i, xs) {
            return Seq.__failIfNone(Seq.tryItem(i, xs));
        };
        Seq.iterate = function (f, xs) {
            Seq.fold(function (_, x) {
                return f(x);
            }, null, xs);
        };
        Seq.iterate2 = function (f, xs, ys) {
            Seq.fold2(function (_, x, y) {
                return f(x, y);
            }, null, xs, ys);
        };
        Seq.iterateIndexed = function (f, xs) {
            Seq.fold(function (_, x, i) {
                return f(i, x);
            }, null, xs);
        };
        Seq.iterateIndexed2 = function (f, xs, ys) {
            Seq.fold2(function (_, x, y, i) {
                return f(i, x, y);
            }, null, xs, ys);
        };
        Seq.isEmpty = function (xs) {
            var i = xs[Symbol.iterator]();
            return i.next().done;
        };
        Seq.tryLast = function (xs) {
            try {
                return Seq.reduce(function (_, x) {
                    return x;
                }, xs);
            } catch (err) {
                return null;
            }
        };
        Seq.last = function (xs) {
            return Seq.__failIfNone(Seq.tryLast(xs));
        };
        // A static 'length' method causes problems in JavaScript -- https://github.com/Microsoft/TypeScript/issues/442
        Seq.count = function (xs) {
            return Array.isArray(xs) || ArrayBuffer.isView(xs) ? xs.length : Seq.fold(function (acc, x) {
                return acc + 1;
            }, 0, xs);
        };
        Seq.map = function (f, xs) {
            return Seq.delay(function () {
                return Seq.unfold(function (iter) {
                    var cur = iter.next();
                    return !cur.done ? [f(cur.value), iter] : null;
                }, xs[Symbol.iterator]());
            });
        };
        Seq.mapIndexed = function (f, xs) {
            return Seq.delay(function () {
                var i = 0;
                return Seq.unfold(function (iter) {
                    var cur = iter.next();
                    return !cur.done ? [f(i++, cur.value), iter] : null;
                }, xs[Symbol.iterator]());
            });
        };
        Seq.map2 = function (f, xs, ys) {
            return Seq.delay(function () {
                var iter1 = xs[Symbol.iterator]();
                var iter2 = ys[Symbol.iterator]();
                return Seq.unfold(function () {
                    var cur1 = iter1.next(),
                        cur2 = iter2.next();
                    return !cur1.done && !cur2.done ? [f(cur1.value, cur2.value), null] : null;
                });
            });
        };
        Seq.mapIndexed2 = function (f, xs, ys) {
            return Seq.delay(function () {
                var i = 0;
                var iter1 = xs[Symbol.iterator]();
                var iter2 = ys[Symbol.iterator]();
                return Seq.unfold(function () {
                    var cur1 = iter1.next(),
                        cur2 = iter2.next();
                    return !cur1.done && !cur2.done ? [f(i++, cur1.value, cur2.value), null] : null;
                });
            });
        };
        Seq.map3 = function (f, xs, ys, zs) {
            return Seq.delay(function () {
                var iter1 = xs[Symbol.iterator]();
                var iter2 = ys[Symbol.iterator]();
                var iter3 = zs[Symbol.iterator]();
                return Seq.unfold(function () {
                    var cur1 = iter1.next(),
                        cur2 = iter2.next(),
                        cur3 = iter3.next();
                    return !cur1.done && !cur2.done && !cur3.done ? [f(cur1.value, cur2.value, cur3.value), null] : null;
                });
            });
        };
        Seq.mapFold = function (f, acc, xs) {
            var result = [];
            var r;
            var cur;
            for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
                cur = iter.next();
                if (cur.done) break;
                _a = f(acc, cur.value), r = _a[0], acc = _a[1];
                result.push(r);
            }
            return Tuple(result, acc);
            var _a;
        };
        Seq.mapFoldBack = function (f, xs, acc) {
            var arr = Array.isArray(xs) || ArrayBuffer.isView(xs) ? xs : Array.from(xs);
            var result = [];
            var r;
            for (var i = arr.length - 1; i >= 0; i--) {
                _a = f(arr[i], acc), r = _a[0], acc = _a[1];
                result.push(r);
            }
            return Tuple(result, acc);
            var _a;
        };
        Seq.max = function (xs) {
            return Seq.reduce(function (acc, x) {
                return Util.compare(acc, x) === 1 ? acc : x;
            }, xs);
        };
        Seq.maxBy = function (f, xs) {
            return Seq.reduce(function (acc, x) {
                return Util.compare(f(acc), f(x)) === 1 ? acc : x;
            }, xs);
        };
        Seq.min = function (xs) {
            return Seq.reduce(function (acc, x) {
                return Util.compare(acc, x) === -1 ? acc : x;
            }, xs);
        };
        Seq.minBy = function (f, xs) {
            return Seq.reduce(function (acc, x) {
                return Util.compare(f(acc), f(x)) === -1 ? acc : x;
            }, xs);
        };
        Seq.pairwise = function (xs) {
            return Seq.skip(2, Seq.scan(function (last, next) {
                return Tuple(last[1], next);
            }, Tuple(0, 0), xs));
        };
        Seq.permute = function (f, xs) {
            return Seq.ofArray(FArray.permute(f, Array.from(xs)));
        };
        Seq.rangeStep = function (first, step, last) {
            if (step === 0) throw "Step cannot be 0";
            return Seq.delay(function () {
                return Seq.unfold(function (x) {
                    return step > 0 && x <= last || step < 0 && x >= last ? [x, x + step] : null;
                }, first);
            });
        };
        Seq.rangeChar = function (first, last) {
            return Seq.delay(function () {
                return Seq.unfold(function (x) {
                    return x <= last ? [x, String.fromCharCode(x.charCodeAt(0) + 1)] : null;
                }, first);
            });
        };
        Seq.range = function (first, last) {
            return Seq.rangeStep(first, 1, last);
        };
        Seq.readOnly = function (xs) {
            return Seq.map(function (x) {
                return x;
            }, xs);
        };
        Seq.reduce = function (f, xs) {
            if (Array.isArray(xs) || ArrayBuffer.isView(xs)) return xs.reduce(f);
            var iter = xs[Symbol.iterator]();
            var cur = iter.next();
            if (cur.done) throw "Seq was empty";
            var acc = cur.value;
            for (;;) {
                cur = iter.next();
                if (cur.done) break;
                acc = f(acc, cur.value);
            }
            return acc;
        };
        Seq.reduceBack = function (f, xs) {
            var ar = Array.isArray(xs) || ArrayBuffer.isView(xs) ? xs : Array.from(xs);
            if (ar.length === 0) throw "Seq was empty";
            var acc = ar[ar.length - 1];
            for (var i = ar.length - 2; i >= 0; i--) acc = f(ar[i], acc, i);
            return acc;
        };
        Seq.replicate = function (n, x) {
            return Seq.initialize(n, function () {
                return x;
            });
        };
        Seq.reverse = function (xs) {
            var ar = Array.isArray(xs) || ArrayBuffer.isView(xs) ? xs.slice(0) : Array.from(xs);
            return Seq.ofArray(ar.reverse());
        };
        Seq.scan = function (f, seed, xs) {
            return Seq.delay(function () {
                var iter = xs[Symbol.iterator]();
                return Seq.unfold(function (acc) {
                    if (acc == null) return [seed, seed];
                    var cur = iter.next();
                    if (!cur.done) {
                        acc = f(acc, cur.value);
                        return [acc, acc];
                    }
                    return void 0;
                }, null);
            });
        };
        Seq.scanBack = function (f, xs, seed) {
            return Seq.reverse(Seq.scan(function (acc, x) {
                return f(x, acc);
            }, seed, Seq.reverse(xs)));
        };
        Seq.singleton = function (x) {
            return Seq.unfold(function (x) {
                return x != null ? [x, null] : null;
            }, x);
        };
        Seq.skip = function (n, xs) {
            return _a = {}, _a[Symbol.iterator] = function () {
                var iter = xs[Symbol.iterator]();
                for (var i = 1; i <= n; i++) if (iter.next().done) throw "Seq has not enough elements";
                return iter;
            }, _a;
            var _a;
        };
        Seq.skipWhile = function (f, xs) {
            return Seq.delay(function () {
                var hasPassed = false;
                return Seq.filter(function (x) {
                    return hasPassed || (hasPassed = !f(x));
                }, xs);
            });
        };
        Seq.sortWith = function (f, xs) {
            var ys = Array.from(xs);
            return Seq.ofArray(ys.sort(f));
        };
        Seq.sum = function (xs) {
            return Seq.fold(function (acc, x) {
                return acc + x;
            }, 0, xs);
        };
        Seq.sumBy = function (f, xs) {
            return Seq.fold(function (acc, x) {
                return acc + f(x);
            }, 0, xs);
        };
        Seq.tail = function (xs) {
            var iter = xs[Symbol.iterator]();
            var cur = iter.next();
            if (cur.done) throw "Seq was empty";
            return _a = {}, _a[Symbol.iterator] = function () {
                return iter;
            }, _a;
            var _a;
        };
        Seq.take = function (n, xs, truncate) {
            if (truncate === void 0) {
                truncate = false;
            }
            return Seq.delay(function () {
                var iter = xs[Symbol.iterator]();
                return Seq.unfold(function (i) {
                    if (i < n) {
                        var cur = iter.next();
                        if (!cur.done) return [cur.value, i + 1];
                        if (!truncate) throw "Seq has not enough elements";
                    }
                    return void 0;
                }, 0);
            });
        };
        Seq.truncate = function (n, xs) {
            return Seq.take(n, xs, true);
        };
        Seq.takeWhile = function (f, xs) {
            return Seq.delay(function () {
                var iter = xs[Symbol.iterator]();
                return Seq.unfold(function (i) {
                    var cur = iter.next();
                    if (!cur.done && f(cur.value)) return [cur.value, null];
                    return void 0;
                }, 0);
            });
        };
        Seq.tryFind = function (f, xs, defaultValue) {
            for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
                var cur = iter.next();
                if (cur.done) return defaultValue === void 0 ? null : defaultValue;
                if (f(cur.value, i)) return cur.value;
            }
        };
        Seq.find = function (f, xs) {
            return Seq.__failIfNone(Seq.tryFind(f, xs));
        };
        Seq.tryFindBack = function (f, xs, defaultValue) {
            var match = null;
            for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
                var cur = iter.next();
                if (cur.done) return match === null ? defaultValue === void 0 ? null : defaultValue : match;
                if (f(cur.value, i)) match = cur.value;
            }
        };
        Seq.findBack = function (f, xs) {
            return Seq.__failIfNone(Seq.tryFindBack(f, xs));
        };
        Seq.tryFindIndex = function (f, xs) {
            for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
                var cur = iter.next();
                if (cur.done) return null;
                if (f(cur.value, i)) return i;
            }
        };
        Seq.findIndex = function (f, xs) {
            return Seq.__failIfNone(Seq.tryFindIndex(f, xs));
        };
        Seq.tryFindIndexBack = function (f, xs) {
            var match = -1;
            for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
                var cur = iter.next();
                if (cur.done) return match === -1 ? null : match;
                if (f(cur.value, i)) match = i;
            }
        };
        Seq.findIndexBack = function (f, xs) {
            return Seq.__failIfNone(Seq.tryFindIndexBack(f, xs));
        };
        Seq.tryPick = function (f, xs) {
            for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
                var cur = iter.next();
                if (cur.done) break;
                var y = f(cur.value, i);
                if (y != null) return y;
            }
            return void 0;
        };
        Seq.pick = function (f, xs) {
            return Seq.__failIfNone(Seq.tryPick(f, xs));
        };
        Seq.unfold = function (f, acc) {
            return _a = {}, _a[Symbol.iterator] = function () {
                return {
                    next: function () {
                        var res = f(acc);
                        if (res != null) {
                            acc = res[1];
                            return { done: false, value: res[0] };
                        }
                        return { done: true };
                    }
                };
            }, _a;
            var _a;
        };
        Seq.zip = function (xs, ys) {
            return Seq.map2(function (x, y) {
                return [x, y];
            }, xs, ys);
        };
        Seq.zip3 = function (xs, ys, zs) {
            return Seq.map3(function (x, y, z) {
                return [x, y, z];
            }, xs, ys, zs);
        };
        return Seq;
    }();
    exports.Seq = Seq;
    var SetTree = function () {
        function SetTree(caseName, fields) {
            this.Case = caseName;
            this.Fields = fields;
        }
        SetTree.countAux = function (s, acc) {
            return s.Case === "SetOne" ? acc + 1 : s.Case === "SetEmpty" ? acc : SetTree.countAux(s.Fields[1], SetTree.countAux(s.Fields[2], acc + 1));
        };
        SetTree.count = function (s) {
            return SetTree.countAux(s, 0);
        };
        SetTree.SetOne = function (n) {
            return new SetTree("SetOne", [n]);
        };
        SetTree.SetNode = function (x, l, r, h) {
            return new SetTree("SetNode", [x, l, r, h]);
        };
        SetTree.height = function (t) {
            return t.Case === "SetOne" ? 1 : t.Case === "SetNode" ? t.Fields[3] : 0;
        };
        SetTree.mk = function (l, k, r) {
            var matchValue = [l, r];
            var $target1 = function () {
                var hl = SetTree.height(l);
                var hr = SetTree.height(r);
                var m = hl < hr ? hr : hl;
                return SetTree.SetNode(k, l, r, m + 1);
            };
            if (matchValue[0].Case === "SetEmpty") {
                if (matchValue[1].Case === "SetEmpty") {
                    return SetTree.SetOne(k);
                } else {
                    return $target1();
                }
            } else {
                return $target1();
            }
        };
        SetTree.rebalance = function (t1, k, t2) {
            var t1h = SetTree.height(t1);
            var t2h = SetTree.height(t2);
            if (t2h > t1h + SetTree.tolerance) {
                if (t2.Case === "SetNode") {
                    if (SetTree.height(t2.Fields[1]) > t1h + 1) {
                        if (t2.Fields[1].Case === "SetNode") {
                            return SetTree.mk(SetTree.mk(t1, k, t2.Fields[1].Fields[1]), t2.Fields[1].Fields[0], SetTree.mk(t2.Fields[1].Fields[2], t2.Fields[0], t2.Fields[2]));
                        } else {
                            throw "rebalance";
                        }
                    } else {
                        return SetTree.mk(SetTree.mk(t1, k, t2.Fields[1]), t2.Fields[0], t2.Fields[2]);
                    }
                } else {
                    throw "rebalance";
                }
            } else {
                if (t1h > t2h + SetTree.tolerance) {
                    if (t1.Case === "SetNode") {
                        if (SetTree.height(t1.Fields[2]) > t2h + 1) {
                            if (t1.Fields[2].Case === "SetNode") {
                                return SetTree.mk(SetTree.mk(t1.Fields[1], t1.Fields[0], t1.Fields[2].Fields[1]), t1.Fields[2].Fields[0], SetTree.mk(t1.Fields[2].Fields[2], k, t2));
                            } else {
                                throw "rebalance";
                            }
                        } else {
                            return SetTree.mk(t1.Fields[1], t1.Fields[0], SetTree.mk(t1.Fields[2], k, t2));
                        }
                    } else {
                        throw "rebalance";
                    }
                } else {
                    return SetTree.mk(t1, k, t2);
                }
            }
        };
        SetTree.add = function (comparer, k, t) {
            return t.Case === "SetOne" ? function () {
                var c = comparer.Compare(k, t.Fields[0]);
                if (c < 0) {
                    return SetTree.SetNode(k, new SetTree("SetEmpty", []), t, 2);
                } else {
                    if (c === 0) {
                        return t;
                    } else {
                        return SetTree.SetNode(k, t, new SetTree("SetEmpty", []), 2);
                    }
                }
            }() : t.Case === "SetEmpty" ? SetTree.SetOne(k) : function () {
                var c = comparer.Compare(k, t.Fields[0]);
                if (c < 0) {
                    return SetTree.rebalance(SetTree.add(comparer, k, t.Fields[1]), t.Fields[0], t.Fields[2]);
                } else {
                    if (c === 0) {
                        return t;
                    } else {
                        return SetTree.rebalance(t.Fields[1], t.Fields[0], SetTree.add(comparer, k, t.Fields[2]));
                    }
                }
            }();
        };
        SetTree.balance = function (comparer, t1, k, t2) {
            var matchValue = [t1, t2];
            var $target1 = function (t1_1) {
                return SetTree.add(comparer, k, t1_1);
            };
            var $target2 = function (k1, t2_1) {
                return SetTree.add(comparer, k, SetTree.add(comparer, k1, t2_1));
            };
            if (matchValue[0].Case === "SetOne") {
                if (matchValue[1].Case === "SetEmpty") {
                    return $target1(matchValue[0]);
                } else {
                    if (matchValue[1].Case === "SetOne") {
                        return $target2(matchValue[0].Fields[0], matchValue[1]);
                    } else {
                        return $target2(matchValue[0].Fields[0], matchValue[1]);
                    }
                }
            } else {
                if (matchValue[0].Case === "SetNode") {
                    if (matchValue[1].Case === "SetOne") {
                        var k2 = matchValue[1].Fields[0];
                        var t1_1 = matchValue[0];
                        return SetTree.add(comparer, k, SetTree.add(comparer, k2, t1_1));
                    } else {
                        if (matchValue[1].Case === "SetNode") {
                            var h1 = matchValue[0].Fields[3];
                            var h2 = matchValue[1].Fields[3];
                            var k1 = matchValue[0].Fields[0];
                            var k2 = matchValue[1].Fields[0];
                            var t11 = matchValue[0].Fields[1];
                            var t12 = matchValue[0].Fields[2];
                            var t21 = matchValue[1].Fields[1];
                            var t22 = matchValue[1].Fields[2];
                            if (h1 + SetTree.tolerance < h2) {
                                return SetTree.rebalance(SetTree.balance(comparer, t1, k, t21), k2, t22);
                            } else {
                                if (h2 + SetTree.tolerance < h1) {
                                    return SetTree.rebalance(t11, k1, SetTree.balance(comparer, t12, k, t2));
                                } else {
                                    return SetTree.mk(t1, k, t2);
                                }
                            }
                        } else {
                            return $target1(matchValue[0]);
                        }
                    }
                } else {
                    var t2_1 = matchValue[1];
                    return SetTree.add(comparer, k, t2_1);
                }
            }
        };
        SetTree.split = function (comparer, pivot, t) {
            return t.Case === "SetOne" ? function () {
                var c = comparer.Compare(t.Fields[0], pivot);
                if (c < 0) {
                    return [t, false, new SetTree("SetEmpty", [])];
                } else {
                    if (c === 0) {
                        return [new SetTree("SetEmpty", []), true, new SetTree("SetEmpty", [])];
                    } else {
                        return [new SetTree("SetEmpty", []), false, t];
                    }
                }
            }() : t.Case === "SetEmpty" ? [new SetTree("SetEmpty", []), false, new SetTree("SetEmpty", [])] : function () {
                var c = comparer.Compare(pivot, t.Fields[0]);
                if (c < 0) {
                    var patternInput = SetTree.split(comparer, pivot, t.Fields[1]);
                    var t11Lo = patternInput[0];
                    var t11Hi = patternInput[2];
                    var havePivot = patternInput[1];
                    return [t11Lo, havePivot, SetTree.balance(comparer, t11Hi, t.Fields[0], t.Fields[2])];
                } else {
                    if (c === 0) {
                        return [t.Fields[1], true, t.Fields[2]];
                    } else {
                        var patternInput = SetTree.split(comparer, pivot, t.Fields[2]);
                        var t12Lo = patternInput[0];
                        var t12Hi = patternInput[2];
                        var havePivot = patternInput[1];
                        return [SetTree.balance(comparer, t.Fields[1], t.Fields[0], t12Lo), havePivot, t12Hi];
                    }
                }
            }();
        };
        SetTree.spliceOutSuccessor = function (t) {
            return t.Case === "SetOne" ? [t.Fields[0], new SetTree("SetEmpty", [])] : t.Case === "SetNode" ? t.Fields[1].Case === "SetEmpty" ? [t.Fields[0], t.Fields[2]] : function () {
                var patternInput = SetTree.spliceOutSuccessor(t.Fields[1]);
                var l_ = patternInput[1];
                var k3 = patternInput[0];
                return [k3, SetTree.mk(l_, t.Fields[0], t.Fields[2])];
            }() : function () {
                throw "internal error: Map.spliceOutSuccessor";
            }();
        };
        SetTree.remove = function (comparer, k, t) {
            return t.Case === "SetOne" ? function () {
                var c = comparer.Compare(k, t.Fields[0]);
                if (c === 0) {
                    return new SetTree("SetEmpty", []);
                } else {
                    return t;
                }
            }() : t.Case === "SetNode" ? function () {
                var c = comparer.Compare(k, t.Fields[0]);
                if (c < 0) {
                    return SetTree.rebalance(SetTree.remove(comparer, k, t.Fields[1]), t.Fields[0], t.Fields[2]);
                } else {
                    if (c === 0) {
                        var matchValue = [t.Fields[1], t.Fields[2]];
                        if (matchValue[0].Case === "SetEmpty") {
                            return t.Fields[2];
                        } else {
                            if (matchValue[1].Case === "SetEmpty") {
                                return t.Fields[1];
                            } else {
                                var patternInput = SetTree.spliceOutSuccessor(t.Fields[2]);
                                var sk = patternInput[0];
                                var r_ = patternInput[1];
                                return SetTree.mk(t.Fields[1], sk, r_);
                            }
                        }
                    } else {
                        return SetTree.rebalance(t.Fields[1], t.Fields[0], SetTree.remove(comparer, k, t.Fields[2]));
                    }
                }
            }() : t;
        };
        SetTree.mem = function (comparer, k, t) {
            return t.Case === "SetOne" ? comparer.Compare(k, t.Fields[0]) === 0 : t.Case === "SetEmpty" ? false : function () {
                var c = comparer.Compare(k, t.Fields[0]);
                if (c < 0) {
                    return SetTree.mem(comparer, k, t.Fields[1]);
                } else {
                    if (c === 0) {
                        return true;
                    } else {
                        return SetTree.mem(comparer, k, t.Fields[2]);
                    }
                }
            }();
        };
        SetTree.iter = function (f, t) {
            if (t.Case === "SetOne") {
                f(t.Fields[0]);
            } else {
                if (t.Case === "SetEmpty") {} else {
                    SetTree.iter(f, t.Fields[1]);
                    f(t.Fields[0]);
                    SetTree.iter(f, t.Fields[2]);
                }
            }
        };
        SetTree.foldBack = function (f, m, x) {
            return m.Case === "SetOne" ? f(m.Fields[0], x) : m.Case === "SetEmpty" ? x : SetTree.foldBack(f, m.Fields[1], f(m.Fields[0], SetTree.foldBack(f, m.Fields[2], x)));
        };
        SetTree.fold = function (f, x, m) {
            return m.Case === "SetOne" ? f(x, m.Fields[0]) : m.Case === "SetEmpty" ? x : function () {
                var x_1 = SetTree.fold(f, x, m.Fields[1]);
                var x_2 = f(x_1, m.Fields[0]);
                return SetTree.fold(f, x_2, m.Fields[2]);
            }();
        };
        SetTree.forall = function (f, m) {
            return m.Case === "SetOne" ? f(m.Fields[0]) : m.Case === "SetEmpty" ? true : (f(m.Fields[0]) ? SetTree.forall(f, m.Fields[1]) : false) ? SetTree.forall(f, m.Fields[2]) : false;
        };
        SetTree.exists = function (f, m) {
            return m.Case === "SetOne" ? f(m.Fields[0]) : m.Case === "SetEmpty" ? false : (f(m.Fields[0]) ? true : SetTree.exists(f, m.Fields[1])) ? true : SetTree.exists(f, m.Fields[2]);
        };
        SetTree.isEmpty = function (m) {
            return m.Case === "SetEmpty" ? true : false;
        };
        SetTree.subset = function (comparer, a, b) {
            return SetTree.forall(function (x) {
                return SetTree.mem(comparer, x, b);
            }, a);
        };
        SetTree.psubset = function (comparer, a, b) {
            return SetTree.forall(function (x) {
                return SetTree.mem(comparer, x, b);
            }, a) ? SetTree.exists(function (x) {
                return !SetTree.mem(comparer, x, a);
            }, b) : false;
        };
        SetTree.filterAux = function (comparer, f, s, acc) {
            return s.Case === "SetOne" ? f(s.Fields[0]) ? SetTree.add(comparer, s.Fields[0], acc) : acc : s.Case === "SetEmpty" ? acc : function () {
                var acc_1 = f(s.Fields[0]) ? SetTree.add(comparer, s.Fields[0], acc) : acc;
                return SetTree.filterAux(comparer, f, s.Fields[1], SetTree.filterAux(comparer, f, s.Fields[2], acc_1));
            }();
        };
        SetTree.filter = function (comparer, f, s) {
            return SetTree.filterAux(comparer, f, s, new SetTree("SetEmpty", []));
        };
        SetTree.diffAux = function (comparer, m, acc) {
            return m.Case === "SetOne" ? SetTree.remove(comparer, m.Fields[0], acc) : m.Case === "SetEmpty" ? acc : SetTree.diffAux(comparer, m.Fields[1], SetTree.diffAux(comparer, m.Fields[2], SetTree.remove(comparer, m.Fields[0], acc)));
        };
        SetTree.diff = function (comparer, a, b) {
            return SetTree.diffAux(comparer, b, a);
        };
        SetTree.union = function (comparer, t1, t2) {
            var matchValue = [t1, t2];
            var $target2 = function (t) {
                return t;
            };
            var $target3 = function (k1, t2_1) {
                return SetTree.add(comparer, k1, t2_1);
            };
            if (matchValue[0].Case === "SetEmpty") {
                var t = matchValue[1];
                return t;
            } else {
                if (matchValue[0].Case === "SetOne") {
                    if (matchValue[1].Case === "SetEmpty") {
                        return $target2(matchValue[0]);
                    } else {
                        if (matchValue[1].Case === "SetOne") {
                            return $target3(matchValue[0].Fields[0], matchValue[1]);
                        } else {
                            return $target3(matchValue[0].Fields[0], matchValue[1]);
                        }
                    }
                } else {
                    if (matchValue[1].Case === "SetEmpty") {
                        return $target2(matchValue[0]);
                    } else {
                        if (matchValue[1].Case === "SetOne") {
                            var k2 = matchValue[1].Fields[0];
                            var t1_1 = matchValue[0];
                            return SetTree.add(comparer, k2, t1_1);
                        } else {
                            var h1 = matchValue[0].Fields[3];
                            var h2 = matchValue[1].Fields[3];
                            var k1 = matchValue[0].Fields[0];
                            var k2 = matchValue[1].Fields[0];
                            var t11 = matchValue[0].Fields[1];
                            var t12 = matchValue[0].Fields[2];
                            var t21 = matchValue[1].Fields[1];
                            var t22 = matchValue[1].Fields[2];
                            if (h1 > h2) {
                                var patternInput = SetTree.split(comparer, k1, t2);
                                var lo = patternInput[0];
                                var hi = patternInput[2];
                                return SetTree.balance(comparer, SetTree.union(comparer, t11, lo), k1, SetTree.union(comparer, t12, hi));
                            } else {
                                var patternInput = SetTree.split(comparer, k2, t1);
                                var lo = patternInput[0];
                                var hi = patternInput[2];
                                return SetTree.balance(comparer, SetTree.union(comparer, t21, lo), k2, SetTree.union(comparer, t22, hi));
                            }
                        }
                    }
                }
            }
        };
        SetTree.intersectionAux = function (comparer, b, m, acc) {
            return m.Case === "SetOne" ? SetTree.mem(comparer, m.Fields[0], b) ? SetTree.add(comparer, m.Fields[0], acc) : acc : m.Case === "SetEmpty" ? acc : function () {
                var acc_1 = SetTree.intersectionAux(comparer, b, m.Fields[2], acc);
                var acc_2 = SetTree.mem(comparer, m.Fields[0], b) ? SetTree.add(comparer, m.Fields[0], acc_1) : acc_1;
                return SetTree.intersectionAux(comparer, b, m.Fields[1], acc_2);
            }();
        };
        SetTree.intersection = function (comparer, a, b) {
            return SetTree.intersectionAux(comparer, b, a, new SetTree("SetEmpty", []));
        };
        SetTree.partition1 = function (comparer, f, k, acc1, acc2) {
            return f(k) ? [SetTree.add(comparer, k, acc1), acc2] : [acc1, SetTree.add(comparer, k, acc2)];
        };
        SetTree.partitionAux = function (comparer, f, s, acc_0, acc_1) {
            var acc = [acc_0, acc_1];
            if (s.Case === "SetOne") {
                var acc1 = acc[0];
                var acc2 = acc[1];
                return SetTree.partition1(comparer, f, s.Fields[0], acc1, acc2);
            } else {
                if (s.Case === "SetEmpty") {
                    return acc;
                } else {
                    var acc_2 = function () {
                        var arg30_ = acc[0];
                        var arg31_ = acc[1];
                        return SetTree.partitionAux(comparer, f, s.Fields[2], arg30_, arg31_);
                    }();
                    var acc_3 = function () {
                        var acc1 = acc_2[0];
                        var acc2 = acc_2[1];
                        return SetTree.partition1(comparer, f, s.Fields[0], acc1, acc2);
                    }();
                    var arg30_ = acc_3[0];
                    var arg31_ = acc_3[1];
                    return SetTree.partitionAux(comparer, f, s.Fields[1], arg30_, arg31_);
                }
            }
        };
        SetTree.partition = function (comparer, f, s) {
            var seed = [new SetTree("SetEmpty", []), new SetTree("SetEmpty", [])];
            var arg30_ = seed[0];
            var arg31_ = seed[1];
            return SetTree.partitionAux(comparer, f, s, arg30_, arg31_);
        };
        // static $MatchSetNode$MatchSetEmpty$(s: SetTree) {
        //   return s.Case === "SetOne" ? new Choice("Choice1Of2", [[s.Fields[0], new SetTree("SetEmpty", []), new SetTree("SetEmpty", [])]]) : s.Case === "SetEmpty" ? new Choice("Choice2Of2", [null]) : new Choice("Choice1Of2", [[s.Fields[0], s.Fields[1], s.Fields[2]]]);
        // }
        SetTree.minimumElementAux = function (s, n) {
            return s.Case === "SetOne" ? s.Fields[0] : s.Case === "SetEmpty" ? n : SetTree.minimumElementAux(s.Fields[1], s.Fields[0]);
        };
        SetTree.minimumElementOpt = function (s) {
            return s.Case === "SetOne" ? s.Fields[0] : s.Case === "SetEmpty" ? null : SetTree.minimumElementAux(s.Fields[1], s.Fields[0]);
        };
        SetTree.maximumElementAux = function (s, n) {
            return s.Case === "SetOne" ? s.Fields[0] : s.Case === "SetEmpty" ? n : SetTree.maximumElementAux(s.Fields[2], s.Fields[0]);
        };
        SetTree.maximumElementOpt = function (s) {
            return s.Case === "SetOne" ? s.Fields[0] : s.Case === "SetEmpty" ? null : SetTree.maximumElementAux(s.Fields[2], s.Fields[0]);
        };
        SetTree.minimumElement = function (s) {
            var matchValue = SetTree.minimumElementOpt(s);
            if (matchValue == null) {
                throw "Set contains no elements";
            } else {
                return matchValue;
            }
        };
        SetTree.maximumElement = function (s) {
            var matchValue = SetTree.maximumElementOpt(s);
            if (matchValue == null) {
                throw "Set contains no elements";
            } else {
                return matchValue;
            }
        };
        SetTree.collapseLHS = function (stack) {
            return stack.tail != null ? stack.head.Case === "SetOne" ? stack : stack.head.Case === "SetNode" ? SetTree.collapseLHS(List.ofArray([stack.head.Fields[1], SetTree.SetOne(stack.head.Fields[0]), stack.head.Fields[2]], stack.tail)) : SetTree.collapseLHS(stack.tail) : new List();
        };
        SetTree.mkIterator = function (s) {
            return { stack: SetTree.collapseLHS(new List(s, new List())), started: false };
        };
        ;
        // static notStarted() {
        //   throw "Enumeration not started";
        // };
        // var alreadyFinished = $exports.alreadyFinished = function () {
        //   throw "Enumeration already started";
        // };
        SetTree.moveNext = function (i) {
            function current(i) {
                if (i.stack.tail == null) {
                    return null;
                } else if (i.stack.head.Case === "SetOne") {
                    return i.stack.head.Fields[0];
                }
                throw "Please report error: Set iterator, unexpected stack for current";
            }
            if (i.started) {
                if (i.stack.tail == null) {
                    return { done: true };
                } else {
                    if (i.stack.head.Case === "SetOne") {
                        i.stack = SetTree.collapseLHS(i.stack.tail);
                        return {
                            done: i.stack.tail == null,
                            value: current(i)
                        };
                    } else {
                        throw "Please report error: Set iterator, unexpected stack for moveNext";
                    }
                }
            } else {
                i.started = true;
                return {
                    done: i.stack.tail == null,
                    value: current(i)
                };
            }
            ;
        };
        SetTree.compareStacks = function (comparer, l1, l2) {
            var $target8 = function (n1k, t1) {
                return SetTree.compareStacks(comparer, List.ofArray([new SetTree("SetEmpty", []), SetTree.SetOne(n1k)], t1), l2);
            };
            var $target9 = function (n1k, n1l, n1r, t1) {
                return SetTree.compareStacks(comparer, List.ofArray([n1l, SetTree.SetNode(n1k, new SetTree("SetEmpty", []), n1r, 0)], t1), l2);
            };
            var $target11 = function (n2k, n2l, n2r, t2) {
                return SetTree.compareStacks(comparer, l1, List.ofArray([n2l, SetTree.SetNode(n2k, new SetTree("SetEmpty", []), n2r, 0)], t2));
            };
            if (l1.tail != null) {
                if (l2.tail != null) {
                    if (l2.head.Case === "SetOne") {
                        if (l1.head.Case === "SetOne") {
                            var n1k = l1.head.Fields[0],
                                n2k = l2.head.Fields[0],
                                t1 = l1.tail,
                                t2 = l2.tail,
                                c = comparer.Compare(n1k, n2k);
                            if (c !== 0) {
                                return c;
                            } else {
                                return SetTree.compareStacks(comparer, t1, t2);
                            }
                        } else {
                            if (l1.head.Case === "SetNode") {
                                if (l1.head.Fields[1].Case === "SetEmpty") {
                                    var emp = l1.head.Fields[1],
                                        n1k = l1.head.Fields[0],
                                        n1r = l1.head.Fields[2],
                                        n2k = l2.head.Fields[0],
                                        t1 = l1.tail,
                                        t2 = l2.tail,
                                        c = comparer.Compare(n1k, n2k);
                                    if (c !== 0) {
                                        return c;
                                    } else {
                                        return SetTree.compareStacks(comparer, List.ofArray([n1r], t1), List.ofArray([emp], t2));
                                    }
                                } else {
                                    return $target9(l1.head.Fields[0], l1.head.Fields[1], l1.head.Fields[2], l1.tail);
                                }
                            } else {
                                var n2k = l2.head.Fields[0],
                                    t2 = l2.tail;
                                return SetTree.compareStacks(comparer, l1, List.ofArray([new SetTree("SetEmpty", []), SetTree.SetOne(n2k)], t2));
                            }
                        }
                    } else {
                        if (l2.head.Case === "SetNode") {
                            if (l2.head.Fields[1].Case === "SetEmpty") {
                                if (l1.head.Case === "SetOne") {
                                    var n1k = l1.head.Fields[0],
                                        n2k = l2.head.Fields[0],
                                        n2r = l2.head.Fields[2],
                                        t1 = l1.tail,
                                        t2 = l2.tail,
                                        c = comparer.Compare(n1k, n2k);
                                    if (c !== 0) {
                                        return c;
                                    } else {
                                        return SetTree.compareStacks(comparer, List.ofArray([new SetTree("SetEmpty", [])], t1), List.ofArray([n2r], t2));
                                    }
                                } else {
                                    if (l1.head.Case === "SetNode") {
                                        if (l1.head.Fields[1].Case === "SetEmpty") {
                                            var n1k = l1.head.Fields[0],
                                                n1r = l1.head.Fields[2],
                                                n2k = l2.head.Fields[0],
                                                n2r = l2.head.Fields[2],
                                                t1 = l1.tail,
                                                t2 = l2.tail,
                                                c = comparer.Compare(n1k, n2k);
                                            if (c !== 0) {
                                                return c;
                                            } else {
                                                return SetTree.compareStacks(comparer, List.ofArray([n1r], t1), List.ofArray([n2r], t2));
                                            }
                                        } else {
                                            return $target9(l1.head.Fields[0], l1.head.Fields[1], l1.head.Fields[2], l1.tail);
                                        }
                                    } else {
                                        return $target11(l2.head.Fields[0], l2.head.Fields[1], l2.head.Fields[2], l2.tail);
                                    }
                                }
                            } else {
                                if (l1.head.Case === "SetOne") {
                                    return $target8(l1.head.Fields[0], l1.tail);
                                } else {
                                    if (l1.head.Case === "SetNode") {
                                        return $target9(l1.head.Fields[0], l1.head.Fields[1], l1.head.Fields[2], l1.tail);
                                    } else {
                                        return $target11(l2.head.Fields[0], l2.head.Fields[1], l2.head.Fields[2], l2.tail);
                                    }
                                }
                            }
                        } else {
                            if (l1.head.Case === "SetOne") {
                                return $target8(l1.head.Fields[0], l1.tail);
                            } else {
                                if (l1.head.Case === "SetNode") {
                                    return $target9(l1.head.Fields[0], l1.head.Fields[1], l1.head.Fields[2], l1.tail);
                                } else {
                                    return SetTree.compareStacks(comparer, l1.tail, l2.tail);
                                }
                            }
                        }
                    }
                } else {
                    return 1;
                }
            } else {
                if (l2.tail != null) {
                    return -1;
                } else {
                    return 0;
                }
            }
        };
        SetTree.compare = function (comparer, s1, s2) {
            if (s1.Case === "SetEmpty") {
                if (s2.Case === "SetEmpty") {
                    return 0;
                } else {
                    return -1;
                }
            } else {
                if (s2.Case === "SetEmpty") {
                    return 1;
                } else {
                    return SetTree.compareStacks(comparer, List.ofArray([s1]), List.ofArray([s2]));
                }
            }
        };
        SetTree.mkFromEnumerator = function (comparer, acc, e) {
            var cur = e.next();
            while (!cur.done) {
                acc = SetTree.add(comparer, cur.value, acc);
                cur = e.next();
            }
            return acc;
        };
        SetTree.ofSeq = function (comparer, c) {
            var ie = c[Symbol.iterator]();
            return SetTree.mkFromEnumerator(comparer, new SetTree("SetEmpty", []), ie);
        };
        return SetTree;
    }();
    SetTree.tolerance = 2;
    var FSet = function () {
        /** Do not call, use Set.create instead. */
        function FSet() {}
        FSet.from = function (comparer, tree) {
            var s = new FSet();
            s.tree = tree;
            s.comparer = comparer || new GenericComparer();
            return s;
        };
        FSet.create = function (ie, comparer) {
            comparer = comparer || new GenericComparer();
            return FSet.from(comparer, ie ? SetTree.ofSeq(comparer, ie) : new SetTree("SetEmpty", []));
        };
        FSet.prototype.ToString = function () {
            return "set [" + Array.from(this).map(Util.toString).join("; ") + "]";
        };
        FSet.prototype.Equals = function (s2) {
            return this.CompareTo(s2) === 0;
        };
        FSet.prototype.CompareTo = function (s2) {
            return SetTree.compare(this.comparer, this.tree, s2.tree);
        };
        FSet.prototype[Symbol.iterator] = function () {
            var i = SetTree.mkIterator(this.tree);
            return {
                next: function () {
                    return SetTree.moveNext(i);
                }
            };
        };
        FSet.prototype.values = function () {
            return this[Symbol.iterator]();
        };
        FSet.prototype.has = function (v) {
            return SetTree.mem(this.comparer, v, this.tree);
        };
        /** Not supported */
        FSet.prototype.add = function (v) {
            throw "not supported";
        };
        /** Not supported */
        FSet.prototype.GAS_delete = function (v) {
            throw "not supported";
        };
        /** Not supported */
        FSet.prototype.clear = function () {
            throw "not supported";
        };
        Object.defineProperty(FSet.prototype, "size", {
            get: function () {
                return SetTree.count(this.tree);
            },
            enumerable: true,
            configurable: true
        });
        FSet.isEmpty = function (s) {
            return SetTree.isEmpty(s.tree);
        };
        FSet.add = function (item, s) {
            return FSet.from(s.comparer, SetTree.add(s.comparer, item, s.tree));
        };
        FSet.addInPlace = function (item, s) {
            return s.has(item) ? false : (s.add(item), true);
        };
        FSet.remove = function (item, s) {
            return FSet.from(s.comparer, SetTree.remove(s.comparer, item, s.tree));
        };
        FSet.union = function (set1, set2) {
            return set2.tree.Case === "SetEmpty" ? set1 : set1.tree.Case === "SetEmpty" ? set2 : FSet.from(set1.comparer, SetTree.union(set1.comparer, set1.tree, set2.tree));
        };
        FSet.unionInPlace = function (set1, set2) {
            for (var _i = 0, set2_1 = set2; _i < set2_1.length; _i++) {
                var x = set2_1[_i];
                set1.add(x);
            }
        };
        FSet.unionMany = function (sets) {
            // Pass args as FSet.union(s, acc) instead of FSet.union(acc, s)
            // to discard the comparer of the first empty set 
            return Seq.fold(function (acc, s) {
                return FSet.union(s, acc);
            }, FSet.create(), sets);
        };
        FSet.difference = function (set1, set2) {
            return set1.tree.Case === "SetEmpty" ? set1 : set2.tree.Case === "SetEmpty" ? set1 : FSet.from(set1.comparer, SetTree.diff(set1.comparer, set1.tree, set2.tree));
        };
        FSet.differenceInPlace = function (set1, set2) {
            for (var _i = 0, set2_2 = set2; _i < set2_2.length; _i++) {
                var x = set2_2[_i];
                set1.GAS_delete(x);
            }
        };
        FSet.intersect = function (set1, set2) {
            return set2.tree.Case === "SetEmpty" ? set2 : set1.tree.Case === "SetEmpty" ? set1 : FSet.from(set1.comparer, SetTree.intersection(set1.comparer, set1.tree, set2.tree));
        };
        FSet.intersectInPlace = function (set1, set2) {
            var set2_ = set2 instanceof Set ? set2 : new Set(set2);
            for (var _i = 0, set1_1 = set1; _i < set1_1.length; _i++) {
                var x = set1_1[_i];
                if (!set2_.has(x)) {
                    set1.GAS_delete(x);
                }
            }
        };
        FSet.intersectMany = function (sets) {
            return Seq.reduce(function (s1, s2) {
                return FSet.intersect(s1, s2);
            }, sets);
        };
        FSet.isProperSubsetOf = function (set1, set2) {
            if (set1 instanceof FSet && set2 instanceof FSet) {
                return SetTree.psubset(set1.comparer, set1.tree, set2.tree);
            } else {
                set2 = set2 instanceof Set ? set2 : new Set(set2);
                return Seq.forAll(function (x) {
                    return set2.has(x);
                }, set1) && Seq.exists(function (x) {
                    return !set1.has(x);
                }, set2);
            }
        };
        FSet.isSubsetOf = function (set1, set2) {
            if (set1 instanceof FSet && set2 instanceof FSet) {
                return SetTree.subset(set1.comparer, set1.tree, set2.tree);
            } else {
                set2 = set2 instanceof Set ? set2 : new Set(set2);
                return Seq.forAll(function (x) {
                    return set2.has(x);
                }, set1);
            }
        };
        FSet.isProperSupersetOf = function (set1, set2) {
            if (set1 instanceof FSet && set2 instanceof FSet) {
                return SetTree.psubset(set1.comparer, set2.tree, set1.tree);
            } else {
                return FSet.isProperSubset(set2 instanceof Set ? set2 : new Set(set2), set1);
            }
        };
        FSet.isSupersetOf = function (set1, set2) {
            if (set1 instanceof FSet && set2 instanceof FSet) {
                return SetTree.subset(set1.comparer, set2.tree, set1.tree);
            } else {
                return FSet.isSubset(set2 instanceof Set ? set2 : new Set(set2), set1);
            }
        };
        FSet.copyTo = function (xs, arr, arrayIndex, count) {
            if (!Array.isArray(arr) && !ArrayBuffer.isView(arr)) throw "Array is invalid";
            count = count || arr.length;
            var i = arrayIndex || 0;
            var iter = xs[Symbol.iterator]();
            while (count--) {
                var el = iter.next();
                if (el.done) break;
                arr[i++] = el.value;
            }
        };
        FSet.partition = function (f, s) {
            if (s.tree.Case === "SetEmpty") {
                return [s, s];
            } else {
                var tuple = SetTree.partition(s.comparer, f, s.tree);
                return [FSet.from(s.comparer, tuple[0]), FSet.from(s.comparer, tuple[1])];
            }
        };
        FSet.filter = function (f, s) {
            if (s.tree.Case === "SetEmpty") {
                return s;
            } else {
                return FSet.from(s.comparer, SetTree.filter(s.comparer, f, s.tree));
            }
        };
        FSet.map = function (f, s) {
            var comparer = new GenericComparer();
            return FSet.from(comparer, SetTree.fold(function (acc, k) {
                return SetTree.add(comparer, f(k), acc);
            }, new SetTree("SetEmpty", []), s.tree));
        };
        FSet.exists = function (f, s) {
            return SetTree.exists(f, s.tree);
        };
        FSet.forAll = function (f, s) {
            return SetTree.forall(f, s.tree);
        };
        FSet.fold = function (f, seed, s) {
            return SetTree.fold(f, seed, s.tree);
        };
        FSet.foldBack = function (f, s, seed) {
            return SetTree.foldBack(f, s.tree, seed);
        };
        FSet.iterate = function (f, s) {
            SetTree.iter(f, s.tree);
        };
        FSet.minimumElement = function (s) {
            return SetTree.minimumElement(s.tree);
        };
        FSet.maximumElement = function (s) {
            return SetTree.maximumElement(s.tree);
        };
        return FSet;
    }();
    FSet.op_Addition = FSet.union;
    FSet.op_Subtraction = FSet.difference;
    FSet.isProperSubset = FSet.isProperSubsetOf;
    FSet.isSubset = FSet.isSubsetOf;
    FSet.isProperSuperset = FSet.isProperSupersetOf;
    FSet.isSuperset = FSet.isSupersetOf;
    FSet.minElement = FSet.minimumElement;
    FSet.maxElement = FSet.maximumElement;
    exports.Set = FSet;
    Util.setInterfaces(FSet.prototype, ["System.IEquatable", "System.IComparable"], "Microsoft.FSharp.Collections.FSharpSet");
    var MapTree = function () {
        function MapTree(caseName, fields) {
            this.Case = caseName;
            this.Fields = fields;
        }
        MapTree.sizeAux = function (acc, m) {
            return m.Case === "MapOne" ? acc + 1 : m.Case === "MapNode" ? MapTree.sizeAux(MapTree.sizeAux(acc + 1, m.Fields[2]), m.Fields[3]) : acc;
        };
        MapTree.size = function (x) {
            return MapTree.sizeAux(0, x);
        };
        MapTree.empty = function () {
            return new MapTree("MapEmpty", []);
        };
        MapTree.height = function (_arg1) {
            return _arg1.Case === "MapOne" ? 1 : _arg1.Case === "MapNode" ? _arg1.Fields[4] : 0;
        };
        MapTree.isEmpty = function (m) {
            return m.Case === "MapEmpty" ? true : false;
        };
        MapTree.mk = function (l, k, v, r) {
            var matchValue = [l, r];
            var $target1 = function () {
                var hl = MapTree.height(l);
                var hr = MapTree.height(r);
                var m = hl < hr ? hr : hl;
                return new MapTree("MapNode", [k, v, l, r, m + 1]);
            };
            if (matchValue[0].Case === "MapEmpty") {
                if (matchValue[1].Case === "MapEmpty") {
                    return new MapTree("MapOne", [k, v]);
                } else {
                    return $target1();
                }
            } else {
                return $target1();
            }
        };
        ;
        MapTree.rebalance = function (t1, k, v, t2) {
            var t1h = MapTree.height(t1);
            var t2h = MapTree.height(t2);
            if (t2h > t1h + 2) {
                if (t2.Case === "MapNode") {
                    if (MapTree.height(t2.Fields[2]) > t1h + 1) {
                        if (t2.Fields[2].Case === "MapNode") {
                            return MapTree.mk(MapTree.mk(t1, k, v, t2.Fields[2].Fields[2]), t2.Fields[2].Fields[0], t2.Fields[2].Fields[1], MapTree.mk(t2.Fields[2].Fields[3], t2.Fields[0], t2.Fields[1], t2.Fields[3]));
                        } else {
                            throw "rebalance";
                        }
                    } else {
                        return MapTree.mk(MapTree.mk(t1, k, v, t2.Fields[2]), t2.Fields[0], t2.Fields[1], t2.Fields[3]);
                    }
                } else {
                    throw "rebalance";
                }
            } else {
                if (t1h > t2h + 2) {
                    if (t1.Case === "MapNode") {
                        if (MapTree.height(t1.Fields[3]) > t2h + 1) {
                            if (t1.Fields[3].Case === "MapNode") {
                                return MapTree.mk(MapTree.mk(t1.Fields[2], t1.Fields[0], t1.Fields[1], t1.Fields[3].Fields[2]), t1.Fields[3].Fields[0], t1.Fields[3].Fields[1], MapTree.mk(t1.Fields[3].Fields[3], k, v, t2));
                            } else {
                                throw "rebalance";
                            }
                        } else {
                            return MapTree.mk(t1.Fields[2], t1.Fields[0], t1.Fields[1], MapTree.mk(t1.Fields[3], k, v, t2));
                        }
                    } else {
                        throw "rebalance";
                    }
                } else {
                    return MapTree.mk(t1, k, v, t2);
                }
            }
        };
        MapTree.add = function (comparer, k, v, m) {
            if (m.Case === "MapOne") {
                var c = comparer.Compare(k, m.Fields[0]);
                if (c < 0) {
                    return new MapTree("MapNode", [k, v, new MapTree("MapEmpty", []), m, 2]);
                } else if (c === 0) {
                    return new MapTree("MapOne", [k, v]);
                }
                return new MapTree("MapNode", [k, v, m, new MapTree("MapEmpty", []), 2]);
            } else if (m.Case === "MapNode") {
                var c = comparer.Compare(k, m.Fields[0]);
                if (c < 0) {
                    return MapTree.rebalance(MapTree.add(comparer, k, v, m.Fields[2]), m.Fields[0], m.Fields[1], m.Fields[3]);
                } else if (c === 0) {
                    return new MapTree("MapNode", [k, v, m.Fields[2], m.Fields[3], m.Fields[4]]);
                }
                return MapTree.rebalance(m.Fields[2], m.Fields[0], m.Fields[1], MapTree.add(comparer, k, v, m.Fields[3]));
            }
            return new MapTree("MapOne", [k, v]);
        };
        MapTree.find = function (comparer, k, m) {
            var res = MapTree.tryFind(comparer, k, m);
            if (res != null) return res;
            throw "key not found";
        };
        MapTree.tryFind = function (comparer, k, m) {
            if (m.Case === "MapOne") {
                var c = comparer.Compare(k, m.Fields[0]);
                return c === 0 ? m.Fields[1] : null;
            } else if (m.Case === "MapNode") {
                var c = comparer.Compare(k, m.Fields[0]);
                if (c < 0) {
                    return MapTree.tryFind(comparer, k, m.Fields[2]);
                } else {
                    if (c === 0) {
                        return m.Fields[1];
                    } else {
                        return MapTree.tryFind(comparer, k, m.Fields[3]);
                    }
                }
            }
            return null;
        };
        MapTree.partition1 = function (comparer, f, k, v, acc1, acc2) {
            return f(k, v) ? [MapTree.add(comparer, k, v, acc1), acc2] : [acc1, MapTree.add(comparer, k, v, acc2)];
        };
        MapTree.partitionAux = function (comparer, f, s, acc_0, acc_1) {
            var acc = [acc_0, acc_1];
            if (s.Case === "MapOne") {
                return MapTree.partition1(comparer, f, s.Fields[0], s.Fields[1], acc[0], acc[1]);
            } else if (s.Case === "MapNode") {
                var acc_2 = MapTree.partitionAux(comparer, f, s.Fields[3], acc[0], acc[1]);
                var acc_3 = MapTree.partition1(comparer, f, s.Fields[0], s.Fields[1], acc_2[0], acc_2[1]);
                return MapTree.partitionAux(comparer, f, s.Fields[2], acc_3[0], acc_3[1]);
            }
            return acc;
        };
        MapTree.partition = function (comparer, f, s) {
            return MapTree.partitionAux(comparer, f, s, MapTree.empty(), MapTree.empty());
        };
        MapTree.filter1 = function (comparer, f, k, v, acc) {
            return f(k, v) ? MapTree.add(comparer, k, v, acc) : acc;
        };
        MapTree.filterAux = function (comparer, f, s, acc) {
            return s.Case === "MapOne" ? MapTree.filter1(comparer, f, s.Fields[0], s.Fields[1], acc) : s.Case === "MapNode" ? function () {
                var acc_1 = MapTree.filterAux(comparer, f, s.Fields[2], acc);
                var acc_2 = MapTree.filter1(comparer, f, s.Fields[0], s.Fields[1], acc_1);
                return MapTree.filterAux(comparer, f, s.Fields[3], acc_2);
            }() : acc;
        };
        MapTree.filter = function (comparer, f, s) {
            return MapTree.filterAux(comparer, f, s, MapTree.empty());
        };
        MapTree.spliceOutSuccessor = function (m) {
            if (m.Case === "MapOne") {
                return [m.Fields[0], m.Fields[1], new MapTree("MapEmpty", [])];
            } else if (m.Case === "MapNode") {
                if (m.Fields[2].Case === "MapEmpty") {
                    return [m.Fields[0], m.Fields[1], m.Fields[3]];
                } else {
                    var kvl = MapTree.spliceOutSuccessor(m.Fields[2]);
                    return [kvl[0], kvl[1], MapTree.mk(kvl[2], m.Fields[0], m.Fields[1], m.Fields[3])];
                }
            }
            throw "internal error: Map.spliceOutSuccessor";
        };
        MapTree.remove = function (comparer, k, m) {
            if (m.Case === "MapOne") {
                var c = comparer.Compare(k, m.Fields[0]);
                if (c === 0) {
                    return new MapTree("MapEmpty", []);
                } else {
                    return m;
                }
            } else if (m.Case === "MapNode") {
                var c = comparer.Compare(k, m.Fields[0]);
                if (c < 0) {
                    return MapTree.rebalance(MapTree.remove(comparer, k, m.Fields[2]), m.Fields[0], m.Fields[1], m.Fields[3]);
                } else {
                    if (c === 0) {
                        var matchValue = [m.Fields[2], m.Fields[3]];
                        if (matchValue[0].Case === "MapEmpty") {
                            return m.Fields[3];
                        } else {
                            if (matchValue[1].Case === "MapEmpty") {
                                return m.Fields[2];
                            } else {
                                var patternInput = MapTree.spliceOutSuccessor(m.Fields[3]);
                                var sv = patternInput[1];
                                var sk = patternInput[0];
                                var r_ = patternInput[2];
                                return MapTree.mk(m.Fields[2], sk, sv, r_);
                            }
                        }
                    } else {
                        return MapTree.rebalance(m.Fields[2], m.Fields[0], m.Fields[1], MapTree.remove(comparer, k, m.Fields[3]));
                    }
                }
            } else {
                return MapTree.empty();
            }
        };
        MapTree.mem = function (comparer, k, m) {
            return m.Case === "MapOne" ? comparer.Compare(k, m.Fields[0]) === 0 : m.Case === "MapNode" ? function () {
                var c = comparer.Compare(k, m.Fields[0]);
                if (c < 0) {
                    return MapTree.mem(comparer, k, m.Fields[2]);
                } else {
                    if (c === 0) {
                        return true;
                    } else {
                        return MapTree.mem(comparer, k, m.Fields[3]);
                    }
                }
            }() : false;
        };
        MapTree.iter = function (f, m) {
            if (m.Case === "MapOne") {
                f(m.Fields[0], m.Fields[1]);
            } else if (m.Case === "MapNode") {
                MapTree.iter(f, m.Fields[2]);
                f(m.Fields[0], m.Fields[1]);
                MapTree.iter(f, m.Fields[3]);
            }
        };
        MapTree.tryPick = function (f, m) {
            return m.Case === "MapOne" ? f(m.Fields[0], m.Fields[1]) : m.Case === "MapNode" ? function () {
                var matchValue = MapTree.tryPick(f, m.Fields[2]);
                if (matchValue == null) {
                    var matchValue_1 = f(m.Fields[0], m.Fields[1]);
                    if (matchValue_1 == null) {
                        return MapTree.tryPick(f, m.Fields[3]);
                    } else {
                        var res = matchValue_1;
                        return res;
                    }
                } else {
                    var res = matchValue;
                    return res;
                }
            }() : null;
        };
        MapTree.exists = function (f, m) {
            return m.Case === "MapOne" ? f(m.Fields[0], m.Fields[1]) : m.Case === "MapNode" ? (MapTree.exists(f, m.Fields[2]) ? true : f(m.Fields[0], m.Fields[1])) ? true : MapTree.exists(f, m.Fields[3]) : false;
        };
        MapTree.forall = function (f, m) {
            return m.Case === "MapOne" ? f(m.Fields[0], m.Fields[1]) : m.Case === "MapNode" ? (MapTree.forall(f, m.Fields[2]) ? f(m.Fields[0], m.Fields[1]) : false) ? MapTree.forall(f, m.Fields[3]) : false : true;
        };
        // static map(f: (v:any) => any, m: MapTree): MapTree {
        //   return m.Case === "MapOne" ? new MapTree("MapOne", [m.Fields[0], f(m.Fields[1])]) : m.Case === "MapNode" ? (() => {
        //     var l2 = MapTree.map(f, m.Fields[2]);
        //     var v2 = f(m.Fields[1]);
        //     var r2 = MapTree.map(f, m.Fields[3]);
        //     return new MapTree("MapNode", [m.Fields[0], v2, l2, r2, m.Fields[4]]);
        //   })() : MapTree.empty();
        // }
        MapTree.mapi = function (f, m) {
            return m.Case === "MapOne" ? new MapTree("MapOne", [m.Fields[0], f(m.Fields[0], m.Fields[1])]) : m.Case === "MapNode" ? function () {
                var l2 = MapTree.mapi(f, m.Fields[2]);
                var v2 = f(m.Fields[0], m.Fields[1]);
                var r2 = MapTree.mapi(f, m.Fields[3]);
                return new MapTree("MapNode", [m.Fields[0], v2, l2, r2, m.Fields[4]]);
            }() : MapTree.empty();
        };
        MapTree.foldBack = function (f, m, x) {
            return m.Case === "MapOne" ? f(m.Fields[0], m.Fields[1], x) : m.Case === "MapNode" ? function () {
                var x_1 = MapTree.foldBack(f, m.Fields[3], x);
                var x_2 = f(m.Fields[0], m.Fields[1], x_1);
                return MapTree.foldBack(f, m.Fields[2], x_2);
            }() : x;
        };
        MapTree.fold = function (f, x, m) {
            return m.Case === "MapOne" ? f(x, m.Fields[0], m.Fields[1]) : m.Case === "MapNode" ? function () {
                var x_1 = MapTree.fold(f, x, m.Fields[2]);
                var x_2 = f(x_1, m.Fields[0], m.Fields[1]);
                return MapTree.fold(f, x_2, m.Fields[3]);
            }() : x;
        };
        // static foldFromTo(comparer: IComparer<any>, lo: any, hi: any, f: (k:any, v:any, acc: any) => any, m: MapTree, x: any): any {
        //   if (m.Case === "MapOne") {
        //     var cLoKey = comparer.Compare(lo, m.Fields[0]);
        //     var cKeyHi = comparer.Compare(m.Fields[0], hi);
        //     var x_1 = (cLoKey <= 0 ? cKeyHi <= 0 : false) ? f(m.Fields[0], m.Fields[1], x) : x;
        //     return x_1;
        //   }
        //   else if (m.Case === "MapNode") {
        //     var cLoKey = comparer.Compare(lo, m.Fields[0]);
        //     var cKeyHi = comparer.Compare(m.Fields[0], hi);
        //     var x_1 = cLoKey < 0 ? MapTree.foldFromTo(comparer, lo, hi, f, m.Fields[2], x) : x;
        //     var x_2 = (cLoKey <= 0 ? cKeyHi <= 0 : false) ? f(m.Fields[0], m.Fields[1], x_1) : x_1;
        //     var x_3 = cKeyHi < 0 ? MapTree.foldFromTo(comparer, lo, hi, f, m.Fields[3], x_2) : x_2;
        //     return x_3;
        //   }
        //   return x;
        // }
        // static foldSection(comparer: IComparer<any>, lo: any, hi: any, f: (k:any, v:any, acc: any) => any, m: MapTree, x: any) {
        //   return comparer.Compare(lo, hi) === 1 ? x : MapTree.foldFromTo(comparer, lo, hi, f, m, x);
        // }
        // static loop(m: MapTree, acc: any): List<[any,any]> {
        //   return m.Case === "MapOne"
        //     ? new List([m.Fields[0], m.Fields[1]], acc)
        //     : m.Case === "MapNode"
        //       ? MapTree.loop(m.Fields[2], new List([m.Fields[0], m.Fields[1]], MapTree.loop(m.Fields[3], acc)))
        //       : acc;
        // }
        // static toList(m: MapTree) {
        //   return MapTree.loop(m, new List());
        // }
        // static toArray(m: MapTree) {
        //   return Array.from(MapTree.toList(m));
        // }
        // static ofList(comparer: IComparer<any>, l: List<[any,any]>) {
        //   return Seq.fold((acc: MapTree, tupledArg: [any, any]) => {
        //     return MapTree.add(comparer, tupledArg[0], tupledArg[1], acc);
        //   }, MapTree.empty(), l);
        // }
        MapTree.mkFromEnumerator = function (comparer, acc, e) {
            var cur = e.next();
            while (!cur.done) {
                acc = MapTree.add(comparer, cur.value[0], cur.value[1], acc);
                cur = e.next();
            }
            return acc;
        };
        // static ofArray(comparer: IComparer<any>, arr: ArrayLike<[any,any]>) {
        //   var res = MapTree.empty();
        //   for (var i = 0; i <= arr.length - 1; i++) {
        //     res = MapTree.add(comparer, arr[i][0], arr[i][1], res);
        //   }
        //   return res;
        // }
        MapTree.ofSeq = function (comparer, c) {
            var ie = c[Symbol.iterator]();
            return MapTree.mkFromEnumerator(comparer, MapTree.empty(), ie);
        };
        // static copyToArray(s: MapTree, arr: ArrayLike<any>, i: number) {
        //   MapTree.iter((x, y) => { arr[i++] = [x, y]; }, s);
        // }
        MapTree.collapseLHS = function (stack) {
            if (stack.tail != null) {
                if (stack.head.Case === "MapOne") {
                    return stack;
                } else if (stack.head.Case === "MapNode") {
                    return MapTree.collapseLHS(List.ofArray([stack.head.Fields[2], new MapTree("MapOne", [stack.head.Fields[0], stack.head.Fields[1]]), stack.head.Fields[3]], stack.tail));
                } else {
                    return MapTree.collapseLHS(stack.tail);
                }
            } else {
                return new List();
            }
        };
        MapTree.mkIterator = function (s) {
            return { stack: MapTree.collapseLHS(new List(s, new List())), started: false };
        };
        MapTree.moveNext = function (i) {
            function current(i) {
                if (i.stack.tail == null) {
                    return null;
                } else if (i.stack.head.Case === "MapOne") {
                    return [i.stack.head.Fields[0], i.stack.head.Fields[1]];
                }
                throw "Please report error: Map iterator, unexpected stack for current";
            }
            if (i.started) {
                if (i.stack.tail == null) {
                    return { done: true };
                } else {
                    if (i.stack.head.Case === "MapOne") {
                        i.stack = MapTree.collapseLHS(i.stack.tail);
                        return {
                            done: i.stack.tail == null,
                            value: current(i)
                        };
                    } else {
                        throw "Please report error: Map iterator, unexpected stack for moveNext";
                    }
                }
            } else {
                i.started = true;
                return {
                    done: i.stack.tail == null,
                    value: current(i)
                };
            }
            ;
        };
        return MapTree;
    }();
    var FMap = function () {
        /** Do not call, use Map.create instead. */
        function FMap() {}
        FMap.from = function (comparer, tree) {
            var map = new FMap();
            map.tree = tree;
            map.comparer = comparer || new GenericComparer();
            return map;
        };
        FMap.create = function (ie, comparer) {
            comparer = comparer || new GenericComparer();
            return FMap.from(comparer, ie ? MapTree.ofSeq(comparer, ie) : MapTree.empty());
        };
        FMap.prototype.ToString = function () {
            return "map [" + Array.from(this).map(Util.toString).join("; ") + "]";
        };
        FMap.prototype.Equals = function (m2) {
            return this.CompareTo(m2) === 0;
        };
        FMap.prototype.CompareTo = function (m2) {
            var _this = this;
            return Seq.compareWith(function (kvp1, kvp2) {
                var c = _this.comparer.Compare(kvp1[0], kvp2[0]);
                return c !== 0 ? c : Util.compare(kvp1[1], kvp2[1]);
            }, this, m2);
        };
        FMap.prototype[Symbol.iterator] = function () {
            var i = MapTree.mkIterator(this.tree);
            return {
                next: function () {
                    return MapTree.moveNext(i);
                }
            };
        };
        FMap.prototype.entries = function () {
            return this[Symbol.iterator]();
        };
        FMap.prototype.keys = function () {
            return Seq.map(function (kv) {
                return kv[0];
            }, this);
        };
        FMap.prototype.values = function () {
            return Seq.map(function (kv) {
                return kv[1];
            }, this);
        };
        FMap.prototype.get = function (k) {
            return MapTree.find(this.comparer, k, this.tree);
        };
        FMap.prototype.has = function (k) {
            return MapTree.mem(this.comparer, k, this.tree);
        };
        /** Not supported */
        FMap.prototype.set = function (k, v) {
            throw "not supported";
        };
        /** Not supported */
        FMap.prototype.GAS_delete = function (k) {
            throw "not supported";
        };
        /** Not supported */
        FMap.prototype.clear = function () {
            throw "not supported";
        };
        Object.defineProperty(FMap.prototype, "size", {
            get: function () {
                return MapTree.size(this.tree);
            },
            enumerable: true,
            configurable: true
        });
        FMap.add = function (k, v, map) {
            return FMap.from(map.comparer, MapTree.add(map.comparer, k, v, map.tree));
        };
        FMap.remove = function (item, map) {
            return FMap.from(map.comparer, MapTree.remove(map.comparer, item, map.tree));
        };
        FMap.containsValue = function (v, map) {
            return Seq.fold(function (acc, k) {
                return acc || Util.equals(map.get(k), v);
            }, false, map.keys());
        };
        FMap.exists = function (f, map) {
            return MapTree.exists(f, map.tree);
        };
        FMap.find = function (k, map) {
            return MapTree.find(map.comparer, k, map.tree);
        };
        FMap.tryFind = function (k, map) {
            return MapTree.tryFind(map.comparer, k, map.tree);
        };
        FMap.filter = function (f, map) {
            return FMap.from(map.comparer, MapTree.filter(map.comparer, f, map.tree));
        };
        FMap.fold = function (f, seed, map) {
            return MapTree.fold(f, seed, map.tree);
        };
        FMap.foldBack = function (f, map, seed) {
            return MapTree.foldBack(f, map.tree, seed);
        };
        FMap.forAll = function (f, map) {
            return MapTree.forall(f, map.tree);
        };
        FMap.isEmpty = function (map) {
            return MapTree.isEmpty(map.tree);
        };
        FMap.iterate = function (f, map) {
            MapTree.iter(f, map.tree);
        };
        FMap.map = function (f, map) {
            return FMap.from(map.comparer, MapTree.mapi(f, map.tree));
        };
        FMap.partition = function (f, map) {
            var rs = MapTree.partition(map.comparer, f, map.tree);
            return [FMap.from(map.comparer, rs[0]), FMap.from(map.comparer, rs[1])];
        };
        FMap.findKey = function (f, map) {
            return Seq.pick(function (kv) {
                return f(kv[0], kv[1]) ? kv[0] : null;
            }, map);
        };
        FMap.tryFindKey = function (f, map) {
            return Seq.tryPick(function (kv) {
                return f(kv[0], kv[1]) ? kv[0] : null;
            }, map);
        };
        FMap.pick = function (f, map) {
            var res = FMap.tryPick(f, map);
            if (res != null) return res;
            throw "key not found";
        };
        FMap.tryPick = function (f, map) {
            return MapTree.tryPick(f, map.tree);
        };
        return FMap;
    }();
    exports.Map = FMap;
    Util.setInterfaces(FMap.prototype, ["System.IEquatable", "System.IComparable"], "Microsoft.FSharp.Collections.FSharpMap");
    exports.Nothing = void 0;
    var maxTrampolineCallCount = 2000;
    var Trampoline = function () {
        function Trampoline() {
            this.callCount = 0;
        }
        Trampoline.prototype.incrementAndCheck = function () {
            return this.callCount++ > maxTrampolineCallCount;
        };
        Trampoline.prototype.hijack = function (f) {
            this.callCount = 0;
            setTimeout(f, 0);
        };
        return Trampoline;
    }();
    exports.Trampoline = Trampoline;
    var AsyncImpl = {
        protectedCont: function (f) {
            return function (ctx) {
                if (ctx.cancelToken.isCancelled) ctx.onCancel("cancelled");else if (ctx.trampoline.incrementAndCheck()) ctx.trampoline.hijack(function () {
                    try {
                        f(ctx);
                    } catch (err) {
                        ctx.onError(err);
                    }
                });else try {
                    f(ctx);
                } catch (err) {
                    ctx.onError(err);
                }
            };
        },
        bind: function (computation, binder) {
            return AsyncImpl.protectedCont(function (ctx) {
                computation({
                    onSuccess: function (x) {
                        return binder(x)(ctx);
                    },
                    onError: ctx.onError,
                    onCancel: ctx.onCancel,
                    cancelToken: ctx.cancelToken,
                    trampoline: ctx.trampoline
                });
            });
        },
        GAS_return: function (value) {
            return AsyncImpl.protectedCont(function (ctx) {
                return ctx.onSuccess(value);
            });
        }
    };
    var AsyncBuilder = function () {
        function AsyncBuilder() {}
        AsyncBuilder.prototype.Bind = function (computation, binder) {
            return AsyncImpl.bind(computation, binder);
        };
        AsyncBuilder.prototype.Combine = function (computation1, computation2) {
            return this.Bind(computation1, function () {
                return computation2;
            });
        };
        AsyncBuilder.prototype.Delay = function (generator) {
            return AsyncImpl.protectedCont(function (ctx) {
                return generator()(ctx);
            });
        };
        AsyncBuilder.prototype.For = function (sequence, body) {
            var iter = sequence[Symbol.iterator]();
            var cur = iter.next();
            return this.While(function () {
                return !cur.done;
            }, this.Delay(function () {
                var res = body(cur.value);
                cur = iter.next();
                return res;
            }));
        };
        AsyncBuilder.prototype.Return = function (value) {
            return AsyncImpl.GAS_return(value);
        };
        AsyncBuilder.prototype.ReturnFrom = function (computation) {
            return computation;
        };
        AsyncBuilder.prototype.TryFinally = function (computation, compensation) {
            return AsyncImpl.protectedCont(function (ctx) {
                computation({
                    onSuccess: function (x) {
                        compensation();
                        ctx.onSuccess(x);
                    },
                    onError: function (x) {
                        compensation();
                        ctx.onError(x);
                    },
                    onCancel: function (x) {
                        compensation();
                        ctx.onCancel(x);
                    },
                    cancelToken: ctx.cancelToken,
                    trampoline: ctx.trampoline
                });
            });
        };
        AsyncBuilder.prototype.TryWith = function (computation, catchHandler) {
            return AsyncImpl.protectedCont(function (ctx) {
                computation({
                    onSuccess: ctx.onSuccess,
                    onCancel: ctx.onCancel,
                    cancelToken: ctx.cancelToken,
                    trampoline: ctx.trampoline,
                    onError: function (ex) {
                        try {
                            catchHandler(ex)(ctx);
                        } catch (ex2) {
                            ctx.onError(ex2);
                        }
                    }
                });
            });
        };
        AsyncBuilder.prototype.Using = function (resource, binder) {
            return this.TryFinally(binder(resource), function () {
                return resource.Dispose();
            });
        };
        AsyncBuilder.prototype.While = function (guard, computation) {
            var _this = this;
            if (guard()) return this.Bind(computation, function () {
                return _this.While(guard, computation);
            });else return this.Return(exports.Nothing);
        };
        AsyncBuilder.prototype.Zero = function () {
            return AsyncImpl.protectedCont(function (ctx) {
                return ctx.onSuccess(exports.Nothing);
            });
        };
        return AsyncBuilder;
    }();
    AsyncBuilder.singleton = new AsyncBuilder();
    exports.AsyncBuilder = AsyncBuilder;
    var Async = function () {
        function Async() {}
        Async.awaitPromise = function (p) {
            return Async.fromContinuations(function (conts) {
                return p.then(conts[0]).GAS_catch(function (err) {
                    return (err == "cancelled" ? conts[2] : conts[1])(err);
                });
            });
        };
        Object.defineProperty(Async, "cancellationToken", {
            get: function () {
                return AsyncImpl.protectedCont(function (ctx) {
                    return ctx.onSuccess(ctx.cancelToken);
                });
            },
            enumerable: true,
            configurable: true
        });
        Async.GAS_catch = function (work) {
            return AsyncImpl.protectedCont(function (ctx) {
                work({
                    onSuccess: function (x) {
                        return ctx.onSuccess(Choice.Choice1Of2(x));
                    },
                    onError: function (ex) {
                        return ctx.onSuccess(Choice.Choice2Of2(ex));
                    },
                    onCancel: ctx.onCancel,
                    cancelToken: ctx.cancelToken,
                    trampoline: ctx.trampoline
                });
            });
        };
        Async.fromContinuations = function (f) {
            return AsyncImpl.protectedCont(function (ctx) {
                return f([ctx.onSuccess, ctx.onError, ctx.onCancel]);
            });
        };
        Async.ignore = function (computation) {
            return AsyncImpl.bind(computation, function (x) {
                return AsyncImpl.GAS_return(exports.Nothing);
            });
        };
        Async.parallel = function (computations) {
            return Async.awaitPromise(Promise.all(Seq.map(function (w) {
                return Async.startAsPromise(w);
            }, computations)));
        };
        Async.sleep = function (millisecondsDueTime) {
            return AsyncImpl.protectedCont(function (ctx) {
                setTimeout(function () {
                    return ctx.cancelToken.isCancelled ? ctx.onCancel("cancelled") : ctx.onSuccess(exports.Nothing);
                }, millisecondsDueTime);
            });
        };
        Async.start = function (computation, cancellationToken) {
            return Async.startWithContinuations(computation, cancellationToken);
        };
        Async.emptyContinuation = function (x) {
            // NOP
        };
        Async.startWithContinuations = function (computation, continuation, exceptionContinuation, cancellationContinuation, cancelToken) {
            if (typeof continuation !== "function") {
                cancelToken = continuation;
                continuation = null;
            }
            var trampoline = new Trampoline();
            computation({
                onSuccess: continuation ? continuation : Async.emptyContinuation,
                onError: exceptionContinuation ? exceptionContinuation : Async.emptyContinuation,
                onCancel: cancellationContinuation ? cancellationContinuation : Async.emptyContinuation,
                cancelToken: cancelToken ? cancelToken : Async.defaultCancellationToken,
                trampoline: trampoline
            });
        };
        Async.startAsPromise = function (computation, cancellationToken) {
            return new Promise(function (resolve, reject) {
                return Async.startWithContinuations(computation, resolve, reject, reject, cancellationToken ? cancellationToken : Async.defaultCancellationToken);
            });
        };
        return Async;
    }();
    Async.defaultCancellationToken = {
        isCancelled: false
    };
    Async.startImmediate = Async.start;
    exports.Async = Async;
    var QueueCell = function () {
        function QueueCell(message) {
            this.value = message;
        }
        return QueueCell;
    }();
    var MailboxQueue = function () {
        function MailboxQueue() {}
        MailboxQueue.prototype.add = function (message) {
            var itCell = new QueueCell(message);
            if (this.firstAndLast) {
                this.firstAndLast[1].next = itCell;
                this.firstAndLast = [this.firstAndLast[0], itCell];
            } else this.firstAndLast = [itCell, itCell];
        };
        MailboxQueue.prototype.tryGet = function () {
            if (this.firstAndLast) {
                var value = this.firstAndLast[0].value;
                if (this.firstAndLast[0].next) this.firstAndLast = [this.firstAndLast[0].next, this.firstAndLast[1]];else delete this.firstAndLast;
                return value;
            }
            return void 0;
        };
        return MailboxQueue;
    }();
    var MailboxProcessor = function () {
        function MailboxProcessor(body, cancellationToken) {
            this.body = body;
            this.cancellationToken = cancellationToken || Async.defaultCancellationToken;
            this.messages = new MailboxQueue();
        }
        MailboxProcessor.start = function (body, cancellationToken) {
            var mbox = new MailboxProcessor(body, cancellationToken);
            mbox.start();
            return mbox;
        };
        MailboxProcessor.prototype.__processEvents = function () {
            if (this.continuation) {
                var value = this.messages.tryGet();
                if (value) {
                    var cont = this.continuation;
                    delete this.continuation;
                    cont(value);
                }
            }
        };
        MailboxProcessor.prototype.start = function () {
            Async.startImmediate(this.body(this), this.cancellationToken);
        };
        MailboxProcessor.prototype.receive = function () {
            var _this = this;
            return Async.fromContinuations(function (conts) {
                if (_this.continuation) throw "Receive can only be called once!";
                _this.continuation = conts[0];
                _this.__processEvents();
            });
        };
        MailboxProcessor.prototype.post = function (message) {
            this.messages.add(message);
            this.__processEvents();
        };
        MailboxProcessor.prototype.postAndAsyncReply = function (buildMessage) {
            var result;
            var continuation;
            function checkCompletion() {
                if (result && continuation) continuation(result);
            }
            var reply = {
                reply: function (res) {
                    result = res;
                    checkCompletion();
                }
            };
            this.messages.add(buildMessage(reply));
            this.__processEvents();
            return Async.fromContinuations(function (conts) {
                continuation = conts[0];
                checkCompletion();
            });
        };
        return MailboxProcessor;
    }();
    exports.MailboxProcessor = MailboxProcessor;
    var Observer = function () {
        function Observer(onNext, onError, onCompleted) {
            this.OnNext = onNext;
            this.OnError = onError || function (e) {};
            this.OnCompleted = onCompleted || function () {};
        }
        return Observer;
    }();
    Util.setInterfaces(Observer.prototype, ["System.IObserver"]);
    var Observable = function () {
        function Observable(subscribe) {
            this.Subscribe = subscribe;
        }
        return Observable;
    }();
    Util.setInterfaces(Observable.prototype, ["System.IObservable"]);
    var FObservable = function () {
        function FObservable() {}
        FObservable.__protect = function (f, succeed, fail) {
            try {
                return succeed(f());
            } catch (e) {
                fail(e);
            }
        };
        FObservable.add = function (callback, source) {
            source.Subscribe(new Observer(callback));
        };
        FObservable.choose = function (chooser, source) {
            return new Observable(function (observer) {
                return source.Subscribe(new Observer(function (t) {
                    return FObservable.__protect(function () {
                        return chooser(t);
                    }, function (u) {
                        if (u != null) observer.OnNext(u);
                    }, observer.OnError);
                }, observer.OnError, observer.OnCompleted));
            });
        };
        FObservable.filter = function (predicate, source) {
            return FObservable.choose(function (x) {
                return predicate(x) ? x : null;
            }, source);
        };
        FObservable.map = function (mapping, source) {
            return new Observable(function (observer) {
                return source.Subscribe(new Observer(function (t) {
                    FObservable.__protect(function () {
                        return mapping(t);
                    }, observer.OnNext, observer.OnError);
                }, observer.OnError, observer.OnCompleted));
            });
        };
        FObservable.merge = function (source1, source2) {
            return new Observable(function (observer) {
                var stopped = false,
                    completed1 = false,
                    completed2 = false;
                var h1 = source1.Subscribe(new Observer(function (v) {
                    if (!stopped) observer.OnNext(v);
                }, function (e) {
                    if (!stopped) {
                        stopped = true;
                        observer.OnError(e);
                    }
                }, function () {
                    if (!stopped) {
                        completed1 = true;
                        if (completed2) {
                            stopped = true;
                            observer.OnCompleted();
                        }
                    }
                }));
                var h2 = source2.Subscribe(new Observer(function (v) {
                    if (!stopped) {
                        observer.OnNext(v);
                    }
                }, function (e) {
                    if (!stopped) {
                        stopped = true;
                        observer.OnError(e);
                    }
                }, function () {
                    if (!stopped) {
                        completed2 = true;
                        if (completed1) {
                            stopped = true;
                            observer.OnCompleted();
                        }
                    }
                }));
                return Util.createDisposable(function () {
                    h1.Dispose();
                    h2.Dispose();
                });
            });
        };
        FObservable.pairwise = function (source) {
            return new Observable(function (observer) {
                var last = null;
                return source.Subscribe(new Observer(function (next) {
                    if (last != null) observer.OnNext([last, next]);
                    last = next;
                }, observer.OnError, observer.OnCompleted));
            });
        };
        FObservable.partition = function (predicate, source) {
            return Tuple(FObservable.filter(predicate, source), FObservable.filter(function (x) {
                return !predicate(x);
            }, source));
        };
        FObservable.scan = function (collector, state, source) {
            return new Observable(function (observer) {
                return source.Subscribe(new Observer(function (t) {
                    FObservable.__protect(function () {
                        return collector(state, t);
                    }, function (u) {
                        state = u;observer.OnNext(u);
                    }, observer.OnError);
                }, observer.OnError, observer.OnCompleted));
            });
        };
        FObservable.split = function (splitter, source) {
            return Tuple(FObservable.choose(function (v) {
                return splitter(v).valueIfChoice1;
            }, source), FObservable.choose(function (v) {
                return splitter(v).valueIfChoice2;
            }, source));
        };
        FObservable.subscribe = function (callback, source) {
            return source.Subscribe(new Observer(callback));
        };
        return FObservable;
    }();
    exports.Observable = FObservable;
    var Event = function () {
        function Event(_subscriber, delegates) {
            this._subscriber = _subscriber;
            this.delegates = delegates || new Array();
        }
        Event.prototype.Add = function (f) {
            this._addHandler(f);
        };
        Object.defineProperty(Event.prototype, "Publish", {
            // IEvent<T> methods
            get: function () {
                return this;
            },
            enumerable: true,
            configurable: true
        });
        Event.prototype.Trigger = function (value) {
            Seq.iterate(function (f) {
                return f(value);
            }, this.delegates);
        };
        // IDelegateEvent<T> methods
        Event.prototype._addHandler = function (f) {
            this.delegates.push(f);
        };
        Event.prototype._removeHandler = function (f) {
            var index = this.delegates.findIndex(function (el) {
                return "" + el == "" + f;
            }); // Special dedication to Chet Husk.
            if (index > -1) this.delegates.splice(index, 1);
        };
        Event.prototype.AddHandler = function (handler) {
            this._addHandler(function (x) {
                return handler(undefined, x);
            });
        };
        Event.prototype.RemoveHandler = function (handler) {
            this._removeHandler(function (x) {
                return handler(undefined, x);
            });
        };
        // IObservable<T> methods
        Event.prototype._subscribeFromObserver = function (observer) {
            var _this = this;
            if (this._subscriber) return this._subscriber(observer);
            var callback = observer.OnNext;
            this._addHandler(callback);
            return Util.createDisposable(function () {
                return _this._removeHandler(callback);
            });
        };
        Event.prototype._subscribeFromCallback = function (callback) {
            var _this = this;
            this._addHandler(callback);
            return Util.createDisposable(function () {
                return _this._removeHandler(callback);
            });
        };
        Event.prototype.Subscribe = function (arg) {
            return typeof arg == "function" ? this._subscribeFromCallback(arg) : this._subscribeFromObserver(arg);
        };
        Event.add = function (callback, sourceEvent) {
            sourceEvent.Subscribe(new Observer(callback));
        };
        Event.choose = function (chooser, sourceEvent) {
            var source = sourceEvent;
            return new Event(function (observer) {
                return source.Subscribe(new Observer(function (t) {
                    return FObservable.__protect(function () {
                        return chooser(t);
                    }, function (u) {
                        if (u != null) observer.OnNext(u);
                    }, observer.OnError);
                }, observer.OnError, observer.OnCompleted));
            }, source.delegates);
        };
        Event.filter = function (predicate, sourceEvent) {
            return Event.choose(function (x) {
                return predicate(x) ? x : null;
            }, sourceEvent);
        };
        Event.map = function (mapping, sourceEvent) {
            var source = sourceEvent;
            return new Event(function (observer) {
                return source.Subscribe(new Observer(function (t) {
                    return FObservable.__protect(function () {
                        return mapping(t);
                    }, observer.OnNext, observer.OnError);
                }, observer.OnError, observer.OnCompleted));
            }, source.delegates);
        };
        Event.merge = function (event1, event2) {
            var source1 = event1;
            var source2 = event2;
            return new Event(function (observer) {
                var stopped = false,
                    completed1 = false,
                    completed2 = false;
                var h1 = source1.Subscribe(new Observer(function (v) {
                    if (!stopped) observer.OnNext(v);
                }, function (e) {
                    if (!stopped) {
                        stopped = true;
                        observer.OnError(e);
                    }
                }, function () {
                    if (!stopped) {
                        completed1 = true;
                        if (completed2) {
                            stopped = true;
                            observer.OnCompleted();
                        }
                    }
                }));
                var h2 = source2.Subscribe(new Observer(function (v) {
                    if (!stopped) observer.OnNext(v);
                }, function (e) {
                    if (!stopped) {
                        stopped = true;
                        observer.OnError(e);
                    }
                }, function () {
                    if (!stopped) {
                        completed2 = true;
                        if (completed1) {
                            stopped = true;
                            observer.OnCompleted();
                        }
                    }
                }));
                return Util.createDisposable(function () {
                    h1.Dispose();
                    h2.Dispose();
                });
            }, source1.delegates.concat(source2.delegates));
        };
        Event.pairwise = function (sourceEvent) {
            var source = sourceEvent;
            return new Event(function (observer) {
                var last = null;
                return source.Subscribe(new Observer(function (next) {
                    if (last != null) observer.OnNext([last, next]);
                    last = next;
                }, observer.OnError, observer.OnCompleted));
            }, source.delegates);
        };
        Event.partition = function (predicate, sourceEvent) {
            return Tuple(Event.filter(predicate, sourceEvent), Event.filter(function (x) {
                return !predicate(x);
            }, sourceEvent));
        };
        Event.scan = function (collector, state, sourceEvent) {
            var source = sourceEvent;
            return new Event(function (observer) {
                return source.Subscribe(new Observer(function (t) {
                    FObservable.__protect(function () {
                        return collector(state, t);
                    }, function (u) {
                        state = u;observer.OnNext(u);
                    }, observer.OnError);
                }, observer.OnError, observer.OnCompleted));
            }, source.delegates);
        };
        Event.split = function (splitter, sourceEvent) {
            return Tuple(Event.choose(function (v) {
                return splitter(v).valueIfChoice1;
            }, sourceEvent), Event.choose(function (v) {
                return splitter(v).valueIfChoice2;
            }, sourceEvent));
        };
        return Event;
    }();
    exports.Event = Event;
    var Lazy = function () {
        function Lazy(factory) {
            this.factory = factory;
            this.isValueCreated = false;
        }
        Lazy.createFromValue = function (v) {
            return new Lazy(function () {
                return v;
            });
        };
        Object.defineProperty(Lazy.prototype, "value", {
            get: function () {
                if (!this.isValueCreated) {
                    this.createdValue = this.factory();
                    this.isValueCreated = true;
                }
                return this.createdValue;
            },
            enumerable: true,
            configurable: true
        });
        return Lazy;
    }();
    exports.Lazy = Lazy;
});
