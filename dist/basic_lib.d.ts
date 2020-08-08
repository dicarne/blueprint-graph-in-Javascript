import { NodeRuntime } from ".";
declare class NumberNode_ extends NodeRuntime<NumberNode_> {
    out: {
        Value: string;
    };
}
export declare function NumberNode(value: number, name?: string): NumberNode_;
declare class CalcNumNode_ extends NodeRuntime<CalcNumNode_> {
    in: {
        A: string;
        B: string;
    };
    out: {
        Output: string;
    };
}
export declare function CalcNumNode(calcType: "+" | "-" | "*" | "/" | "**", name?: string): CalcNumNode_;
declare class LogNode_ extends NodeRuntime<LogNode_> {
    in: {
        Input: string;
    };
}
export declare function LogNode(name?: string): LogNode_;
declare class ForLoopNode_ extends NodeRuntime<ForLoopNode_> {
    out: {
        index: string;
    };
}
/**
 * It works like: `let i = from; i < to; i++`
 * if to is undefined, it works like: `let i = 0; i < from; i++`
 * @param from like: `let i = from`
 * @param to like: `i < to`
 */
export declare function ForLoopNode(from: number, to?: number): ForLoopNode_;
export declare function TestForBody(): NodeRuntime<NodeRuntime<unknown>>;
export {};
