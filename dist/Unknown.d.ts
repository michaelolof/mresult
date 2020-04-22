export declare class Unknown {
    _____xunknown_name____: string;
    static IsUnknown(val: any): val is Unknown;
    static IsKnown<T>(val: T | Unknown): val is T;
}
export declare const isUnknown: (val: any) => val is Unknown;
export declare const isKnown: <T>(val: Unknown | T) => val is T;
