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
const _1 = require(".");
const basic_lib_1 = require("./basic_lib");
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        let ctx = new _1.GraphRuntime();
        let node1 = _1.addNewNode(ctx, basic_lib_1.NumberNode(2));
        let node2 = _1.addNewNode(ctx, basic_lib_1.NumberNode(4));
        let nodemmul = _1.addNewNode(ctx, basic_lib_1.CalcNumNode("**"));
        let show = _1.addNewNode(ctx, basic_lib_1.LogNode());
        let output = _1.addNewNode(ctx, _1.OutPutNode());
        node1.linkTo(node1.out.Value, nodemmul, nodemmul.in.A);
        node2.linkTo(node2.out.Value, nodemmul, nodemmul.in.B);
        nodemmul.linkTo(nodemmul.out.Output, show, show.in.Input);
        nodemmul.linkTo(nodemmul.out.Output, output, output.in.Input);
        ctx.run();
        let getoutput = yield output.Get;
        console.log(`beautiful ${getoutput}`);
    });
}
test();
function CustomNode(name) {
    return new _1.NodeRuntime((self) => __awaiter(this, void 0, void 0, function* () {
        // begin your code
        let data1 = yield self.getFromPort("input_data_1");
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            let data2 = yield self.getFromPortOptional("input_data_2");
            /**do some calculation */
            let result = data1.toString() + (data2 || 0).toString();
            self.sendToPort("my_output_port", result);
        }), 1000);
        // end your code
    }));
}
//# sourceMappingURL=example.js.map