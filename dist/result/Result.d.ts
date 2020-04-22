import { IResult, OkArgument, IMatcherOption, ErrArgument } from "./IResult";
import { Unknown } from "../Unknown";
export declare class Result<Value, Err> implements IResult<Value, Err> {
    private readonly _isError;
    private readonly _isSuccess;
    private err;
    private value;
    private type;
    private constructor();
    static Err<TValue, Err>(err: Err): Result<TValue, Err>;
    static Ok<TValue, Err>(value: TValue): Result<TValue, Err>;
    static Is(val: any): val is Result<any, any>;
    static IsNot<T>(val: T | Result<any, any>): val is T;
    isError(): this is Err;
    isSuccess(): this is Value;
    handle<TResult>(handler: ((value: Value | Unknown, err: Err | Unknown) => TResult)): TResult;
    match<TValue, TErr>({ onErr, onOk }: IMatcherOption<Value, Err, TValue, TErr, Result<TValue, Err>>): Result<TValue, TErr>;
    onOk<TValue>(ok: OkArgument<Value, Err, TValue, Result<TValue, Err>>): Result<TValue, Err>;
    onErr<TErr>(err: ErrArgument<Value, Err, TErr, Result<Value, TErr>>): Result<Value, TErr>;
    getErrOrDefault(defaultErr: Err): Err;
    getValueOrDefault(defaultValue: Value): Value;
    merge(): Value | Err;
    private isFuncError;
    private isFuncSuccess;
    private flattenOk;
    private flattenErr;
}
