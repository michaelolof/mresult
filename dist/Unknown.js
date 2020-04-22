"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Unknown {
    constructor() {
        this._____xunknown_name____ = "unknown";
    }
    static IsUnknown(val) {
        return val instanceof Unknown;
    }
    static IsKnown(val) {
        return Unknown.IsUnknown(val) === false;
    }
}
exports.Unknown = Unknown;
exports.isUnknown = (val) => Unknown.IsUnknown(val);
exports.isKnown = (val) => Unknown.IsKnown(val);
