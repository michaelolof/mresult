import { IResult, OkArgument, IMatcherOption } from "./IResult";


type ResultType = "err" | "value";

export class Result<Value, Err> implements IResult<Value, Err> {
  
  private readonly _isError :boolean = false;
  private readonly _isSuccess :boolean = false;
  private err : Err | undefined = undefined;
  private value : Value | undefined;
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

  public static Err<TValue, Err>(err :Err) : Result<TValue, Err> {
    return new Result<TValue, Err>(err, "err")
  }

  public static Ok<TValue, Err>(value: TValue) : Result<TValue, Err> {
    return new Result<TValue, Err>(value, "value");
  }

  isError(): this is Err {
    return this._isError;
  }

  private isFuncError<TErr>(err :Object): err is ((value :Err) => Err) | ((value :Err) => TErr) {
    return this._isError && typeof err === "function"; 
  }

  private isFuncSuccess<TResult>(val :Object): val is ((value :Value) => TResult) {
    return this._isSuccess && typeof val === "function";
  }

  isSuccess(): this is Value {
    return this._isSuccess;
  }
  
  handle<TResult>( handler :((value: Value | undefined) => TResult)) :TResult {
    return handler( this.value );
  }

  
  
  match<TValue, TErr, TResult extends IResult<TValue, TErr>>({ ifErr, ifOk }: IMatcherOption<Value, Err, TValue, TErr, TResult>): TResult {

    if( ifErr === null ) throw new Error("Invalid err argument passed. err cannot be null.");

    if( ifOk === null ) throw new Error("Invalid ok argument passed. ok cannot be null.");

    if( this.isFuncError(ifErr) ) {
      ifErr
      const err = this.err as Err;
      const dd = ifErr( err );
      return Result.Err<TValue, TErr>( dd );
    }

    else if( this.isError() ) return Result.Err<TValue, TErr>( ifErr );

    else if( this.isFuncSuccess( ifOk ) ) return this.flattenOk( ifOk );

    else if( this.isSuccess() ) return Result.Ok( ifOk );

    else throw new Error("Invalid arguments passed. Unable to propagate result.");

  }
  
  propagate<TResult>(ok: OkArgument<Value, Err, TResult, Result<TResult, Err>>): Result<TResult, Err> {

    if( ok === null ) throw new Error("Invalid ok argument passed. ok cannot be null.");
    
    if( this.isError() ) return Result.Err(this.err as Err);
    
    else if( this.isFuncSuccess(ok) ) return this.flattenOk( ok );
    
    else if( this.isSuccess() ) return Result.Ok( ok );
    
    else throw new Error("Invalid arguments passed. Unable to propagate result.");
    
  }
  
  getValue(): Value | undefined {
    return this.value;
  }
  
  getError() {
    return this.err;
  }

  getValueOrDefault(defaultValue :Value) :Value {
    if( this.value === undefined ) return defaultValue;
    else return this.value;
  }

  private flattenOk<TResult, Err>( ok :((value: Value) => Result<TResult, Err>) | ((value: Value) => TResult)): Result<TResult, Err> {
    
    const flattenResult = ok( this.value as Value );
      
    if( flattenResult instanceof Result ) {
      if( flattenResult.isError() ) return Result.Err( flattenResult.getError()! as Err );
      return Result.Ok( flattenResult.value! as TResult );
    }

    return Result.Ok( flattenResult );

  }

}

function isSuccessHandlerFunc<TValue, TResult>(obj :Object | undefined ): obj is ((value: TValue | undefined) => TResult) {
  if( !obj ) return false;
  else return typeof obj === "function";
}

function returnParam<T,U>( param :U ) :T {

}