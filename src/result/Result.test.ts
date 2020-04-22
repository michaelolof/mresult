import { Result } from "./Result";
import { isKnown, isUnknown } from "../Unknown";


describe("(Static Instantiation) via 'Ok' and 'Err' Methods", () => {

  it("should create 'Ok' Result Successfully", () => {
  
    const value = "I have a content";
    const content = Result.Ok( value );
    
    expect( content ).toBeInstanceOf( Result );
    
  });

  it("should create 'Err' Result Successfully", () => {
  
    const value = "Something went wrong";
    const content = Result.Err( value );
    
    expect( content ).toBeInstanceOf( Result );
    
  });

})

describe("(Method: isSuccess())", () => {
  
  it("should return a true status for an 'Ok' Result", () => {
  
    const value = "I have a content";
    const content = Result.Ok( value );
  
    expect( content.isSuccess() ).toBe( true );
  
  })

  it("should return a false status for an 'Err' Result", () => {

    const value = "Something went wrong";
    const content = Result.Err( value );

    expect( content.isSuccess() ).toBe( false );

  })

})

describe("(Method: isError()", () => {

  it("should return a false status for 'Ok' Result", () => {
  
    const value = "I have content";
    const content = Result.Ok( value );
  
    expect( content.isError() ).toBe( false );
    expect( content.isError() ).not.toBe( true );
  
  })

  it("should return a true status for 'Err' Result", () => {

    const value = "I have content";
    const content = Result.Err( "Something Went Wrong" );
  
    expect( content.isError() ).toBe( true );
    expect( content.isError() ).not.toBe( false );

  })

})

describe("(Method: getValueOrDefault())", () => {

  it("should return the actual value for an 'Ok' Result", () => {

    const value = "I have something to give";
    const content = Result.Ok( value );
    const _default = "A default";

    const defaultValue = content.getValueOrDefault( _default );

    expect( defaultValue ).toBe( value );
    expect( defaultValue ).not.toBe( _default );

  });


  it("should return the default value for an 'Err' Result", () => {

    const value = "Something went wrong";
    const content = Result.Err( value );
    const _default = "A default";

    const defaultValue = content.getValueOrDefault( _default );

    expect( defaultValue ).toBe( _default );
    expect( defaultValue ).not.toBe( value );

  })
  
})

describe("(Method: getErrOrDefault())", () => {

  it("should return the actual err for an 'Err' Result", () => {

    const value = { name: "Error", message: "Something Went Wrong", stack: "Some Stack" };
    const content = Result.Err( value );
    const _default = { name: "Default Err", message: "Okies something went wrong", stack: "Some stack" };

    const defaultErr = content.getErrOrDefault( _default );

    expect( defaultErr ).toMatchObject( value );

  })

  it("should return the default err for an 'Ok' Result", () => {

    const okValue = "All is well";
    const _default = { name: "Default Error", message: "A default error message", stack: undefined };
    const content = Result.Ok( okValue );

    const defaultErr = content.getErrOrDefault( _default );

    expect( defaultErr ).toMatchObject( _default );

  })

})

describe("(Method: handle(...)", () => {

  
  it("should handle safely for an 'Ok' result", () => {
    
    const readFromRemoteDB = () => Result.Ok({ type: "remote", content: "This is the content from the remote db" });
    const readFromLocalDB = () => ({ type: "local", content:"This is the content from local db" });
    
    const parsedContent = readFromRemoteDB().handle((value, err) => {

      const content = isUnknown( value ) ? readFromLocalDB() : value;

      content.content = content.content + "Additional string";
    
      return content;
    
    });

    expect( parsedContent ).toHaveProperty( "type" );
    expect( parsedContent ).toHaveProperty( "content" );
    expect( parsedContent.content ).toContain("Additional string");
    expect( parsedContent.type ).toBe( "remote" );

  })

  it("should handle safely for an 'Err' result", () => {

    const readFromRemoteDB = () => Result.Err<string, {name :string, message :string}>({ name: "Read Error", message: "Data does not exist" });
    const readFromLocalDB = () => "This is the content from local db";

    const parsedContent = readFromRemoteDB().handle(( value, err ) => {
    
      const content = isUnknown( value ) ? readFromLocalDB() : value;

      return content + "Additional string";
        
    })

    expect( typeof parsedContent === "string" ).toBe( true );
    expect( parsedContent ).toContain("Additional string");

  })


})

describe("(Method: onOk(...))", () => {

  const _TokenTypeHolder = { url: "__", tokens: ["_", "1", ","] };
 
  it("should bubble up first failed attempt irrespective of successive calls", () => {
    // Simulate a failed attempt to read from DB
    const readTokensFromDB = (url :string) => Result.Err<typeof _TokenTypeHolder, Error>( new ReferenceError("Tokens not found in database"));
    // Invoke a normal action on the result from DB.
    const normalizeTokens = (tokens :string[]) => tokens.join(",");

    const tokens = readTokensFromDB("xxxx")
      .onOk(({ tokens }) => normalizeTokens( tokens ) );

    const tokensErr = tokens.getErrOrDefault( new Error("default Error"));

    expect( tokens ).toBeInstanceOf( Result );
    expect( tokens.isError() ).toBe( true );
    expect( tokensErr.name ).toBe("ReferenceError");
    expect( tokensErr ).toBeInstanceOf( ReferenceError );

  });

  it("should bubble up the final result when there are no failed attempts", () => {

    const fetchTokensFromURL = (url :string) => Result.Ok<typeof _TokenTypeHolder, Error>({url: "xxxx", tokens: ["one", "two", "three" ] });
    const storeTokensToDB = (tokens :typeof _TokenTypeHolder) => Result.Ok<number, Error>( 12 );
    const readTokensFromDB = (id :number) => Result.Ok<typeof _TokenTypeHolder, Error>({ url: "shasha", tokens: ["bass", "man"] });
    const normalizeTokens = (tokens :string[]) => tokens.join(",");

    const tokens = fetchTokensFromURL("a.com")
      .onOk( storeTokensToDB )
      .onOk( readTokensFromDB )
      .onOk(({ tokens }) => normalizeTokens(tokens) );

    expect( tokens ).toBeInstanceOf( Result );
    expect( tokens.isSuccess() ).toBe( true );
    expect( tokens.isError() ).toBe( false );

    const tokensValue = tokens.getValueOrDefault("Default value");
    expect( tokensValue ).not.toBe( "Default value" );
  })

})

describe("(Method: onErr(...))", () => {

  it("should bubble up success attempts irrespective of successive calls", () => {

    const uncertainReadFromDB = () => Result.Err<number, Error>( new Error("Not found in DB") );
    const uncertainReadFromAPI = () => Result.Err<number, Error>( new Error("Not Found in API") );
    const certainReadFromCache = () => Result.Ok<number, Error>( 20 );

    const value =   uncertainReadFromDB()
      .onErr(() =>  uncertainReadFromAPI())
      .onErr(() =>  certainReadFromCache());

    expect( value ).toBeInstanceOf( Result );
    expect( value ).toBe
    expect( value.merge() ).toBe( 20 );

  });

})

describe("(Method: match(...))", () => {

  it("should match status correctly and handle failure points", () => {

    const readTokensFromDB = (id :number) => Result.Err<string[], Error>( new Error("Tokens not found") );
    const logToConsole = (val :any) => undefined;
    const fetchTokensFromCache = (id :number) => (["one", "two", "three", "four"]);
    const parseTokens = (tokens :string[]) => tokens.join(", "); 
    
    const tokenId = 21;

    const tokensResult = readTokensFromDB( tokenId ).match({
      onOk: parseTokens,
      onErr: err => {
        // do something with the err object 
        logToConsole( err.message );
        // Perform a safe operation. You can also return an error here 
        // Or a custom error if you wish.
        const tokens = fetchTokensFromCache( tokenId );
        return parseTokens( tokens );
      },
    })
    
    const tokens = tokensResult.merge();

    expect( tokens ).toBe("one, two, three, four");
    
  })

  it("should match status correctly and handle failure points", () => {

    // Define Operations
    const readTokensFromLocalDB = (id :number) => Result.Err<string[], Error>( new Error("Tokens not found in DB") );
    const logToConsole = (val :any) => undefined;
    const fetchTokensFromAPI = (id :number) => Result.Ok<string[], Error>(["one", "two", "three", "four"]);
    const fetchTokensFromCache = (id :number) => Result.Err<string[], Error>( new Error("Tokens not found in cache"));
    const parseTokens = (tokens :string[]) => tokens.join(", "); 
    
    const tokenId = 21;

    const tokens = readTokensFromLocalDB( tokenId ).match({
      onOk: parseTokens,
      onErr: err => {
        logToConsole( err );
        return fetchTokensFromAPI( tokenId ).match({
          onOk: parseTokens,
          onErr: () => fetchTokensFromCache( tokenId ).match({
            onOk: parseTokens,
            onErr: new Error(),
          })
          .merge()
        })
        .merge()
      }
    })
    .merge()

    expect( typeof tokens === "string" ).toBe( true );

  })

})

describe("(Method: merge()", () => {

  it("should return Value if known", () => {

    const fetch = (id :number) :Result<string[], Error> => {
      if( id > 0 ) return Result.Ok(["one", "two", "three"]);
      else return Result.Err( new Error("Failed to retrieve value") );
    }

    const merged = fetch( 10 ).merge() as any;

    expect( typeof merged === "object" ).toBe( true );
    expect( merged ).not.toBeInstanceOf( Error );
    expect( merged[ 0 ] ).toBe( "one" );
    expect( merged[ 1 ] ).toBe( "two" );
    expect( merged[ 2 ] ).toBe( "three" );


  })

  it("should return err if value is unknown", () => {

    const fetch = (id :number) :Result<string[], Error> => {
      if( id > 0 ) return Result.Ok(["one", "two", "three"]);
      else return Result.Err( new Error("Failed to retrieve value") );
    }

    const merged = fetch( -10 ).merge() as any;
    
    expect( merged ).toBeInstanceOf( Error );

  })


})

