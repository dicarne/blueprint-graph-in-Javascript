import { GraphRuntime, addNewNode, NodeRuntime } from ".";
import {
  NumberNode,
  CalcNumNode,
  OutputNode,
  ForLoopNode,
  TestForBody,
} from "./basic_lib";

function test() {
  let ctx = new GraphRuntime();

  let node1 = addNewNode(ctx, NumberNode(2));
  let node2 = addNewNode(ctx, NumberNode(4));
  let nodemmul = addNewNode(ctx, CalcNumNode("**"));
  let show = addNewNode(ctx, OutputNode());

  node1.linkTo(node1.out.Value, nodemmul, nodemmul.in.A);
  node2.linkTo(node2.out.Value, nodemmul, nodemmul.in.B);
  nodemmul.linkTo(nodemmul.out.Output, show, show.in.Input);

  let fornode = addNewNode(ctx, ForLoopNode(10));
  let testnode = addNewNode(ctx, TestForBody());
  fornode.linkTo(fornode.out.index, testnode, "exec_signal");

  ctx.run();
}

test();

function CustomNode(name?: string) {
  return new NodeRuntime(async (self) => {
    // begin your code
    let data1 = await self.getFromPort("input_data_1");
    setTimeout(async () => {
      let data2 = await self.getFromPortOptional("input_data_2");
      /**do some calculation */
      let result = data1.toString() + (data2 || 0).toString();
      self.sendToPort("my_output_port", result);
    }, 1000);

    // end your code
  });
}
