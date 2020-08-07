"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestForBody = exports.ForLoopNode = exports.LogNode = exports.CalcNumNode = exports.NumberNode = void 0;
const _1 = require(".");
class NumberNode_ extends _1.NodeRuntime {
    constructor() {
        super(...arguments);
        this.out = {
            Value: "value",
        };
    }
}
function NumberNode(value, name) {
    let nt = new NumberNode_((self) => __awaiter(this, void 0, void 0, function* () {
        self.sendToPort("value", value);
    }), name);
    return nt;
}
exports.NumberNode = NumberNode;
class CalcNumNode_ extends _1.NodeRuntime {
    constructor() {
        super(...arguments);
        this.in = { A: "A", B: "B" };
        this.out = { Output: "value" };
    }
}
function CalcNumNode(calcType, name) {
    let rt = new CalcNumNode_((self) => __awaiter(this, void 0, void 0, function* () {
        let from1 = (yield self.getFromPortOptional(self.in.A)) || 0;
        let from2 = (yield self.getFromPortOptional(self.in.B)) || 0;
        switch (calcType) {
            case "+":
                self.sendToPort(self.out.Output, Number(from1) + Number(from2));
                break;
            case "-":
                self.sendToPort(self.out.Output, Number(from1) - Number(from2));
                break;
            case "*":
                self.sendToPort(self.out.Output, Number(from1) * Number(from2));
                break;
            case "/":
                self.sendToPort(self.out.Output, Number(from1) / Number(from2));
                break;
            case "**":
                self.sendToPort(self.out.Output, Math.pow(Number(from1), Number(from2)));
                break;
            default:
                throw "unknown operator: [node]";
        }
    }), name);
    return rt;
}
exports.CalcNumNode = CalcNumNode;
class LogNode_ extends _1.NodeRuntime {
    constructor() {
        super(...arguments);
        this.in = { Input: "input" };
    }
}
const _LogNode_in = { Input: "input" };
function LogNode(name) {
    let nt = new LogNode_((self) => __awaiter(this, void 0, void 0, function* () {
        let data = yield self.getFromPort("input");
        console.log(data);
    }), name);
    return nt;
}
exports.LogNode = LogNode;
class ForLoopNode_ extends _1.NodeRuntime {
    constructor() {
        super(...arguments);
        this.out = {
            index: "index",
        };
    }
}
/**
 * It works like: `let i = from; i < to; i++`
 * if to is undefined, it works like: `let i = 0; i < from; i++`
 * @param from like: `let i = from`
 * @param to like: `i < to`
 */
function ForLoopNode(from, to) {
    let too = 0;
    if (to === undefined) {
        too = from;
        from = 0;
    }
    else {
        too = to;
    }
    let nt = new ForLoopNode_((self) => __awaiter(this, void 0, void 0, function* () {
        for (let index = from; index < too; index++) {
            self.sendToPort(self.out.index, index);
            yield self.waitPortUsed(self.out.index);
        }
    }));
    return nt;
}
exports.ForLoopNode = ForLoopNode;
function TestForBody() {
    return new _1.NodeRuntime((self) => __awaiter(this, void 0, void 0, function* () {
        let index = yield self.getFromPort("exec_signal");
        setTimeout(() => {
            console.log("hello" + index.toString());
        }, 1000);
    }));
}
exports.TestForBody = TestForBody;
//# sourceMappingURL=basic_lib.js.map