import { Result } from "./Result";
import { IResult } from "./IResult";


function main() :Result<number, Error> {

  const content = parseUrl("www.name.com");
  if( content.isError() ) return Result.Err( content.getError()! );

  const dbId = storeContentToDB( content.getValue()! );
  if( dbId.isError() ) return Result.Err( dbId.getError()! );

  const fetched = fetchFromLocalStorage( dbId.getValue()! );
  if( fetched.isError() ) return Result.Err( fetched.getError()! );

  const joinedData = joinDataToString( fetched.getValue()! );

  return Result.Ok( joinedData );

}


function Main() :Result<number, Error> {

  return parseUrl("www.name.com")
    .propagate( storeContentToDB )
    .propagate( fetchFromLocalStorage )
    .propagate( joinDataToString );

}

class CustomError {
  
  message :string;
  stack :string | undefined;
  name :string;
  
  constructor(err :Error) {
    this.message = err.message;
    this.stack = err.stack;
    this.name = err.name;
  }
}


function Main2() :Result<number, Error> {
  
  const content = parseUrl("www.name.com") as IResult<string, Error>

  const matched = content.match({
    ifErr: err => new CustomError( err ),
    ifOk: storeContentToDB,
  })

  const bubbled = content.propagate( val => val.split(" ") );
  
  const handled = content.handle( value => {
    if( value === undefined ) return "N/A";
    else return value;
  });

  const handles = content.handle( v => v );

  const defaults = content.getValueOrDefault("2000");


}

function parseUrl( url: string ) {
  return Result.Ok<string, Error>("I have parsed url successfully at " + url );
}

function storeContentToDB( content :string ) :IResult<number, Error> {
  return Result.Ok<number, Error>( 1 );
}

function fetchFromLocalStorage( id :number ) {
  return Result.Ok<string[], Error>(["one", "two", "three", "four"])
}

function joinDataToString(data :string[]) {
  return data.length;
}

/**
 * Takes a url of a csv file in a remote location
 * and tries to parse its content.
 * @throws Error
 */
function parseCSV(url :string) :string {
  throw new Error("Not Implemented Here");
}

var content = parseCSV("http://ngov.merdder.com/media/text.csv");
