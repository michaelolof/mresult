export class Unknown {

  _____xunknown_name____ = "unknown";

  static IsUnknown(val :any) :val is Unknown {
    return val instanceof Unknown;
  }

  static IsKnown<T>( val :T | Unknown ) :val is T {
    return Unknown.IsUnknown( val ) === false;
  }

}

export const isUnknown = (val :any) :val is Unknown => Unknown.IsUnknown(val);
export const isKnown = <T>(val :T|Unknown) :val is T => Unknown.IsKnown(val);
