export interface IRedisClient {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, options?: { EX?: number; NX?: true; PX?: number }): Promise<string | null>;
    del(key: string, ...keys: string[]): Promise<number>;
    scanIterator(options?: { MATCH?: string; COUNT?: number }): AsyncIterable<string>;
    eval(script: string, options: { keys: string[]; arguments: string[] }): Promise<unknown>;
    quit(): Promise<string>;
}
