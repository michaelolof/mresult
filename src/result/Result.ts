import { IResult, OkArgument, IMatcherOption, ErrArgument } from "./IResult";
import { Unknown, isUnknown, isKnown } from "../Unknown";

type ResultType = "err" | "value";


export class Result<Value, Err> implements IResult<Value, Err> {
  
  private readonly _isError :boolean = false;
  private readonly _isSuccess :boolean = false;
  private err : Err | Unknown = new Unknown();
  private value : Value | Unknown = new Unknown();
  private type :ResultType = "err";

  private constructor(val :Value | Err, type: ResultType) {
    
    this.type = type

    switch(this.type ) {
      case "err":
        this.err = val as Err;
        this._isError = true;
        break;
      case "value":
        this.value = val as Value;
        this._isSuccess = true;
        break;
    }

  }


  static Err<TValue, Err>(err :Err) : Result<TValue, Err> {
    return new Result<TValue, Err>(err, "err")
  }

  static Ok<TValue, Err>(value: TValue) : Result<TValue, Err> {
    return new Result<TValue, Err>(value, "value");
  }

  static Is(val :any): val is Result<any, any> {
    return val instanceof Result;
  }

  static IsNot<T>(val :T | Result<any, any>): val is T {
    return !this.Is( val );
  } 

  isError(): this is Err {
    return this._isError;
  }

  isSuccess(): this is Value {
    return this._isSuccess;
  }
  
  handle<TResult>(handler :((value :Value | Unknown, err :Err | Unknown ) => TResult)) :TResult {
    const unKnownValue = this.value === undefined ? new Unknown() : this.value;
    const unKnownErr = this.err || new Unknown();
    return handler( unKnownValue, unKnownErr );
  }

  
  match<TValue, TErr>({ onErr, onOk }: IMatcherOption<Value, Err, TValue, TErr, Result<TValue, Err>>): Result<TValue, TErr> {

    if( onErr === null ) throw new Error("Invalid err argument passed. err cannot be null.");

    if( onOk === null ) throw new Error("Invalid ok argument passed. ok cannot be null.");

    if( this.isFuncError(onErr) ) return Result.Err<TValue, TErr>( onErr( this.err as Err ));

    else if( this.isError() ) return Result.Err<TValue, TErr>( onErr );

    else if( this.isFuncSuccess( onOk ) ) return this.flattenOk( onOk );

    else if( this.isSuccess() ) return Result.Ok( onOk );

    else throw new Error("Invalid arguments passed. Unable to propagate result.");

  }
  
  onOk<TValue>(ok: OkArgument<Value, Err, TValue, Result<TValue, Err>>): Result<TValue, Err> {

    if( ok === null ) throw new Error("Invalid ok argument passed. ok cannot be null.");
    
    if( this.isError() ) return Result.Err(this.err as Err);
    
    else if( this.isFuncSuccess(ok) ) return this.flattenOk( ok );
    
    else if( this.isSuccess() ) return Result.Ok( ok );
    
    else throw new Error("Invalid arguments passed. Unable to propagate result.");
    
  }

  onErr<TErr>(err :ErrArgument<Value, Err, TErr, Result<Value, TErr>>) :Result<Value, TErr> {
    
    if( err === null ) throw new Error("Invalid err argument passed. err cannot be null");

    if( this.isSuccess() ) return Result.Ok(this.value as Value);

    else if( this.isFuncError( err ) ) return this.flattenErr( err );

    else if( this.isError() ) return Result.Err( err );
    
    else throw new Error("Invalid arguments passed. Unable to propagate result.");

  }
   
  getErrOrDefault(defaultErr :Err) :Err {
    if( isUnknown( this.err ) ) return defaultErr;
    else return this.err;
  }

  getValueOrDefault(defaultValue :Value) :Value {
    if( isUnknown( this.value ) ) return defaultValue;
    else return this.value;
  }

  merge() :Value | Err {
    if( isKnown( this.value ) ) return this.value;
    else if( isKnown( this.err ) ) return this.err;
    else throw new RangeError("Unexpected entry. Niether value nor err is known");
  }

  private isFuncError<TErr>(err :Object): err is ((value :Err) => Err) | ((value :Err) => TErr) {
    return this._isError && typeof err === "function"; 
  }

  private isFuncSuccess<TResult>(val :Object): val is ((value :Value) => TResult) {
    return this._isSuccess && typeof val === "function";
  }

  private flattenOk<TValue, TErr>( ok :((value: Value) => Result<TValue, Err>) | ((value: Value) => TValue)): Result<TValue, TErr> {
    
    const flattenResult = ok( this.value as Value );
      
    if( flattenResult instanceof Result ) {
      if( flattenResult.isError() && isKnown(flattenResult.err) ) return Result.Err( flattenResult.err as unknown as TErr );
      return Result.Ok( flattenResult.value as TValue );
    }

    return Result.Ok( flattenResult );

  }

  private flattenErr<TErr>( err :((err: Err) => Result<Value, TErr>) | ((err: Err) => TErr)) :Result<Value, TErr> {
    
    const flattenedErr = err( this.err as Err );

    if( flattenedErr instanceof Result ) {
      if( flattenedErr.isSuccess() ) return Result.Ok( flattenedErr.value as Value );
      else return Result.Err( flattenedErr.err as TErr );
    }

    return Result.Err( flattenedErr );
  }

}
