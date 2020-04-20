

export interface IResult<Value, Err> {

  isError() :this is Err,
  isSuccess() :this is Value,

  handle<TResult>(handler :(value :Value | undefined) => TResult ): TResult;

  match<TValue, TErr, TResult extends IResult<TValue, TErr>>({ ifErr, ifOk } :IMatcherOption<Value, Err, TValue, TErr, TResult> ) :TResult

  propagate<TResult>( ok: OkArgument<Value, Err, TResult, IResult<TResult, Err>> ): IResult<TResult, Err>

  getValueOrDefault(defaultValue :Value) :Value;
  
  getError(): Err | undefined;

}

export interface IMatcherOption<Value, Err, TValue, TErr, TR extends IResult<TValue, TErr>> {
  ifOk: TR | ((value :Value) => TValue) | TValue;
  ifErr: ((err :Err) => TErr) | TErr
}

export type OkArgument<TValue, Err, TResult, Result extends IResult<TResult, Err>> = ((value :TValue) => Result) | ((value :TValue) => TResult) | TResult

Promise.resolve(10).then