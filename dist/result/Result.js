"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Unknown_1 = require("../Unknown");
class Result {
    constructor(val, type) {
        this._isError = false;
        this._isSuccess = false;
        this.err = new Unknown_1.Unknown();
        this.value = new Unknown_1.Unknown();
        this.type = "err";
        this.type = type;
        switch (this.type) {
            case "err":
                this.err = val;
                this._isError = true;
                break;
            case "value":
                this.value = val;
                this._isSuccess = true;
                break;
        }
    }
    static Err(err) {
        return new Result(err, "err");
    }
    static Ok(value) {
        return new Result(value, "value");
    }
    static Is(val) {
        return val instanceof Result;
    }
    static IsNot(val) {
        return !this.Is(val);
    }
    isError() {
        return this._isError;
    }
    isSuccess() {
        return this._isSuccess;
    }
    handle(handler) {
        const unKnownValue = this.value === undefined ? new Unknown_1.Unknown() : this.value;
        const unKnownErr = this.err || new Unknown_1.Unknown();
        return handler(unKnownValue, unKnownErr);
    }
    match({ onErr, onOk }) {
        if (onErr === null)
            throw new Error("Invalid err argument passed. err cannot be null.");
        if (onOk === null)
            throw new Error("Invalid ok argument passed. ok cannot be null.");
        if (this.isFuncError(onErr))
            return Result.Err(onErr(this.err));
        else if (this.isError())
            return Result.Err(onErr);
        else if (this.isFuncSuccess(onOk))
            return this.flattenOk(onOk);
        else if (this.isSuccess())
            return Result.Ok(onOk);
        else
            throw new Error("Invalid arguments passed. Unable to propagate result.");
    }
    onOk(ok) {
        if (ok === null)
            throw new Error("Invalid ok argument passed. ok cannot be null.");
        if (this.isError())
            return Result.Err(this.err);
        else if (this.isFuncSuccess(ok))
            return this.flattenOk(ok);
        else if (this.isSuccess())
            return Result.Ok(ok);
        else
            throw new Error("Invalid arguments passed. Unable to propagate result.");
    }
    onErr(err) {
        if (err === null)
            throw new Error("Invalid err argument passed. err cannot be null");
        if (this.isSuccess())
            return Result.Ok(this.value);
        else if (this.isFuncError(err))
            return this.flattenErr(err);
        else if (this.isError())
            return Result.Err(err);
        else
            throw new Error("Invalid arguments passed. Unable to propagate result.");
    }
    getErrOrDefault(defaultErr) {
        if (Unknown_1.isUnknown(this.err))
            return defaultErr;
        else
            return this.err;
    }
    getValueOrDefault(defaultValue) {
        if (Unknown_1.isUnknown(this.value))
            return defaultValue;
        else
            return this.value;
    }
    merge() {
        if (Unknown_1.isKnown(this.value))
            return this.value;
        else if (Unknown_1.isKnown(this.err))
            return this.err;
        else
            throw new RangeError("Unexpected entry. Niether value nor err is known");
    }
    isFuncError(err) {
        return this._isError && typeof err === "function";
    }
    isFuncSuccess(val) {
        return this._isSuccess && typeof val === "function";
    }
    flattenOk(ok) {
        const flattenResult = ok(this.value);
        if (flattenResult instanceof Result) {
            if (flattenResult.isError() && Unknown_1.isKnown(flattenResult.err))
                return Result.Err(flattenResult.err);
            return Result.Ok(flattenResult.value);
        }
        return Result.Ok(flattenResult);
    }
    flattenErr(err) {
        const flattenedErr = err(this.err);
        if (flattenedErr instanceof Result) {
            if (flattenedErr.isSuccess())
                return Result.Ok(flattenedErr.value);
            else
                return Result.Err(flattenedErr.err);
        }
        return Result.Err(flattenedErr);
    }
}
exports.Result = Result;
