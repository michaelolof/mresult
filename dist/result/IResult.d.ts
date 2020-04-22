import { Unknown } from "../Unknown";
export interface IResult<Value, Err> {
    isError(): this is Err;
    isSuccess(): this is Value;
    getValueOrDefault(defaultValue: Value): Value;
    getErrOrDefault(defaultErr: Err): Err;
    merge(): Value | Err;
    handle<TResult>(handler: (value: Value | Unknown, err: Err | Unknown) => TResult): TResult;
    onOk<TResult>(ok: OkArgument<Value, Err, TResult, IResult<TResult, Err>>): IResult<TResult, Err>;
    onErr<TErr>(err: ErrArgument<Value, Err, TErr, IResult<Value, TErr>>): IResult<Value, TErr>;
    match<TValue, TErr>({ onErr: ifErr, onOk }: IMatcherOption<Value, Err, TValue, TErr, IResult<TValue, Err>>): IResult<TValue, TErr>;
}
export interface IMatcherOption<Value, Err, TValue, TErr, TR extends IResult<TValue, Err>> {
    onOk: ((value: Value) => TR) | ((value: Value) => TValue) | TValue;
    onErr: ((err: Err) => TErr) | TErr;
}
export declare type OkArgument<TValue, Err, TResult, Result extends IResult<TResult, Err>> = ((value: TValue) => Result) | ((value: TValue) => TResult) | TResult;
export declare type ErrArgument<Value, Err, TErr, TR extends IResult<Value, TErr>> = ((err: Err) => TR) | ((err: Err) => TErr) | TErr;
