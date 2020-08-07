import { GraphRuntime, addNewNode, NodeRuntime, OutPutNode } from ".";
import {
  NumberNode,
  CalcNumNode,
  LogNode,
} from "./basic_lib";

async function test() {
  let ctx = new GraphRuntime();

  let node1 = addNewNode(ctx, NumberNode(2));
  let node2 = addNewNode(ctx, NumberNode(4));
  let nodemmul = addNewNode(ctx, CalcNumNode("**"));
  let show = addNewNode(ctx, LogNode());

  let output = addNewNode(ctx, OutPutNode<number>())

  node1.linkTo(node1.out.Value, nodemmul, nodemmul.in.A);
  node2.linkTo(node2.out.Value, nodemmul, nodemmul.in.B);
  nodemmul.linkTo(nodemmul.out.Output, show, show.in.Input);
  nodemmul.linkTo(nodemmul.out.Output, output, output.in.Input)

  ctx.run();

  let getoutput = await output.Get;
  console.log(`beautiful ${getoutput}`)
}

test();

function CustomNode(name?: string) {
  return new NodeRuntime(async (self) => {
    // begin your code
    let data1 = await self.getFromPort<any>("input_data_1");
    setTimeout(async () => {
      let data2 = await self.getFromPortOptional("input_data_2");
      /**do some calculation */
      let result = data1.toString() + (data2 || 0).toString();
      self.sendToPort("my_output_port", result);
    }, 1000);

    // end your code
  });
}

